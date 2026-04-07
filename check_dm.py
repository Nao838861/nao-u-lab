"""
check_dm.py — DMを確認して新しいメッセージがあれば読み取る

通知チェック(check_notifications.py)と一緒にCronから呼ぶ。
パスコード自動入力対応。
"""

import time
import json
from pathlib import Path
from datetime import datetime

from playwright.sync_api import sync_playwright
import browser_lock
from claude_runner import build_claude_cmd

BOT_PROFILE = Path(__file__).parent / ".bot_profile"

def _detect_error_channel():
    """エラーアラート先を各インスタンスのチャンネルに振り分け（Nao_u指示 2026-04-07）"""
    import sys as _sys
    if _sys.platform == "darwin":
        return "mir-log"
    repo = Path(__file__).parent
    if (repo / ".scheduler_ash.pid").exists():
        return "ash"
    return "log"
DM_STATE_FILE = Path(__file__).parent / "dm_state.json"
DM_LOG = Path(__file__).parent / "log" / "dm.log"
PASSCODE = "8361"


def check_dm(reply_text=None, target_user="Nao_u"):
    """DMを確認し、新しいメッセージがあれば返す。reply_textがあれば返信も送る。
    target_user: 会話を開く相手の表示名（部分一致）。デフォルトはNao_u。
    """
    messages = []

    # バックオフ中ならスキップ（ログ膨張防止）
    if is_in_cooldown() and not reply_text:
        return messages

    if not browser_lock.acquire():
        log("Skipped: browser locked by another process")
        return messages

    try:
        return _check_dm_inner(reply_text, target_user)
    finally:
        browser_lock.release()


def _check_dm_inner(reply_text=None, target_user="Nao_u"):
    messages = []

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(BOT_PROFILE),
            channel="msedge",
            headless=False,
            viewport={"width": 1280, "height": 900},
            locale="ja-JP",
            args=["--disable-blink-features=AutomationControlled", "--start-minimized"],
        )
        page = context.new_page()

        try:
            page.goto("https://x.com/messages", timeout=30000)
            page.wait_for_load_state("domcontentloaded", timeout=15000)
            time.sleep(5)

            # Auto passcode
            if page.locator("text=パスコードを入力").count() > 0:
                for d in PASSCODE:
                    page.keyboard.press(d)
                    time.sleep(0.3)
                time.sleep(3)

            # Wait for conversation list
            for _ in range(15):
                if page.locator("text=Nao_u").count() > 0:
                    break
                if page.locator(f"text={target_user}").count() > 0:
                    break
                time.sleep(1)

            # Always open conversation to check for new messages
            user_link = page.locator(f"text={target_user}")
            if user_link.count() == 0:
                log(f"No {target_user} conversation found")
                track_consecutive_failures(True, target_user)
                return messages

            user_link.first.click()
            time.sleep(4)
            track_consecutive_failures(False, target_user)

            # Extract last few message texts from LI elements for stable fingerprinting
            # Uses multiple messages to avoid flip-flop when DOM order varies between loads
            last_msg_text = page.evaluate("""() => {
                const main = document.querySelector('main');
                if (!main) return '';
                const lis = main.querySelectorAll('li');
                if (lis.length === 0) return '';
                // Collect text from last 3 LIs, sort for order-independence
                const texts = [];
                const start = Math.max(0, lis.length - 3);
                for (let i = start; i < lis.length; i++) {
                    const spans = lis[i].querySelectorAll('span[dir=""]');
                    let t = '';
                    if (spans.length > 0) t = spans[spans.length - 1].textContent || '';
                    else t = lis[i].textContent || '';
                    if (t.trim()) texts.push(t.trim().substring(0, 80));
                }
                texts.sort();
                return texts.join('||');
            }""")

            # Also get full conversation for context when new message detected
            main_text = page.locator("main").first.text_content()

            # Fingerprint: use last message text only (stable, no timestamps/UI)
            import re
            # Strip digits, colons, dots, and other UI chrome for stable fingerprinting
            fingerprint = re.sub(r'[\d:：.·•\s]+$', '', last_msg_text).strip() if last_msg_text else ""
            fingerprint = re.sub(r'\d+', '', fingerprint).strip() if fingerprint else ""
            prev_state = load_state()
            fp_key = f"fingerprint_{target_user}"

            if fingerprint and fingerprint != prev_state.get(fp_key, ""):
                # New messages detected
                messages = [main_text]
                log(f"New DM detected (last message changed): {last_msg_text[:80]}")

            # Send reply if provided (independent of fingerprint change)
            if reply_text:
                textbox = page.locator('[data-testid="dm-composer-textarea"]')
                if textbox.count() == 0:
                    textbox = page.locator('[placeholder="メッセージ"]')
                if textbox.count() == 0:
                    textbox = page.locator(
                        'div[role="textbox"][contenteditable="true"]'
                    )
                if textbox.count() > 0:
                    textbox.first.click()
                    time.sleep(1)
                    # Use browser's navigator.clipboard API (avoids Windows clipboard lock)
                    import json
                    escaped = json.dumps(reply_text)
                    page.evaluate(f'async () => {{ await navigator.clipboard.writeText({escaped}); }}')
                    time.sleep(1)
                    page.keyboard.press("Control+v")
                    time.sleep(2)
                    page.keyboard.press("Enter")
                    time.sleep(4)
                    log(f"Reply sent to {target_user}")

            # 既存のstateにマージ（consecutive_fails等を保持するため）
            existing = load_state()
            existing[fp_key] = fingerprint
            existing["last_check"] = str(datetime.now())
            save_state(existing)

        except Exception as e:
            log(f"Error: {e}")
        finally:
            context.close()

    return messages


CONSECUTIVE_FAIL_THRESHOLD = 12  # 12回連続失敗（≒1時間）でSlackアラート
# バックオフ: アラート後はチェック間隔を段階的に広げる（分単位）
BACKOFF_STAGES = [30, 60, 120]  # 30分→60分→2時間で頭打ち


def load_state():
    if DM_STATE_FILE.exists():
        try:
            with open(DM_STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_state(state):
    with open(DM_STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False)


def is_in_cooldown():
    """バックオフ中ならTrueを返す。スケジューラから呼ばれても即スキップできる。"""
    state = load_state()
    cooldown_until = state.get("cooldown_until")
    if cooldown_until and datetime.now().timestamp() < cooldown_until:
        return True
    return False


def track_consecutive_failures(user_not_found: bool, target_user: str):
    """連続失敗を追跡し、閾値超過でSlackにアラート+バックオフを設定する。
    サイレント失敗の早期検出用。2026-03-24の天谷DM遅延事故を受けて追加。
    2026-03-27改善: アラート後も同じログを出し続ける問題を修正。
    指数バックオフで無駄なチェックとログ膨張を抑制する。
    """
    state = load_state()
    fail_count = state.get("consecutive_fails", 0)
    alerted = state.get("fail_alerted", False)

    if user_not_found:
        fail_count += 1
        state["consecutive_fails"] = fail_count
        if fail_count >= CONSECUTIVE_FAIL_THRESHOLD and not alerted:
            _send_failure_alert(fail_count, target_user)
            state["fail_alerted"] = True
        # バックオフ設定: アラート済みならチェック間隔を広げる
        if alerted or fail_count >= CONSECUTIVE_FAIL_THRESHOLD:
            # 段階計算: アラート後の追加失敗回数でバックオフレベルを決める
            extra_fails = fail_count - CONSECUTIVE_FAIL_THRESHOLD
            stage_idx = min(extra_fails // 3, len(BACKOFF_STAGES) - 1)
            backoff_min = BACKOFF_STAGES[max(0, stage_idx)]
            cooldown_until = datetime.now().timestamp() + backoff_min * 60
            state["cooldown_until"] = cooldown_until
            # バックオフ中は毎回ログを出さない（最初の1回だけ記録）
            if extra_fails == 0 or extra_fails % 10 == 0:
                log(f"Backoff active: next check in {backoff_min}min (consecutive_fails={fail_count})")
    else:
        # 成功したらカウンタ・バックオフ全リセット
        state["consecutive_fails"] = 0
        state["fail_alerted"] = False
        state.pop("cooldown_until", None)

    save_state(state)


def _send_failure_alert(fail_count, target_user):
    """DMブラウザ障害を各インスタンスのチャンネルに通知する"""
    try:
        from slack_bot import post_message, _resolve_channel
        channel_id = _resolve_channel(_detect_error_channel())
        if channel_id:
            post_message(
                channel_id,
                f"⚠️ [自動アラート] check_dm.pyが{fail_count}回連続で{target_user}の会話を発見できていません。"
                f"DMブラウザセッション（.bot_profile）が切れている可能性があります。"
                f"Nao_uの手動確認が必要です。"
            )
            log(f"Slack alert sent: {fail_count} consecutive failures for {target_user}")
    except Exception as e:
        log(f"Failed to send Slack alert: {e}")


def log(message):
    DM_LOG.parent.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(DM_LOG, "a", encoding="utf-8") as f:
        f.write(f"[{ts}] {message}\n")


def wake_claude(dm_text):
    """新しいDMがあった時だけClaude CLIを起動する"""
    import subprocess

    prompt = f"新しいDMが来ています。内容を確認して返信してください。\n概要: {dm_text[:200]}"
    try:
        result = subprocess.run(
            build_claude_cmd(prompt),
            capture_output=True,
            text=True,
            timeout=300,
            cwd=str(Path(__file__).parent),
        )
        log(f"Claude woken: {result.stdout[:100]}")
    except subprocess.TimeoutExpired:
        log("Claude wake timed out")
    except Exception as e:
        log(f"Error waking Claude: {e}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--wake", action="store_true", help="Wake Claude only if new DM found"
    )
    parser.add_argument(
        "--user", default="Nao_u", help="Target user display name to check DMs for"
    )
    args = parser.parse_args()

    msgs = check_dm(target_user=args.user)
    if msgs:
        print("New DM detected")
        log(f"New DM detected from {args.user}: {msgs[0][:100]}")
        if args.wake:
            wake_claude(msgs[0][:200])
    else:
        print("No new DMs")
        log(f"No new DMs from {args.user}")
