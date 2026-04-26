"""
check_inbox.py — 受信箱に内容があればclaude CLIを起動する

タスクスケジューラから1-2分間隔で実行。
Claude APIを消費しない（変化時のみ起動）。

再発防止策（2026-03-26実装）:
- Claudeのstdoutからエラーを分類（rate limit / auth / transient）
- 致命的エラー時はinboxを復元しつつクールダウンファイルで再試行を抑制
- 一時的エラーはinboxを復元するが連続エラー回数を記録しバックオフ
- クールダウン中はClaude起動をスキップ（inbox内容は保持）

使い方:
  python check_inbox.py              # デフォルト: inbox_win.md をチェック
  python check_inbox.py --box mac    # inbox_mac.md をチェック
  python check_inbox.py --box win2   # inbox_win2.md をチェック
"""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

from claude_runner import build_claude_cmd

# Windows: 全子プロセスのウィンドウを非表示にする
# CREATE_NO_WINDOW + STARTUPINFO/SW_HIDE 併用
# (2026-04-26: Nao_u再指摘「数分に一度一瞬ウインドウが出てフォーカスが持っていかれる」対策)
# CREATE_NO_WINDOWだけではcmd経由のbat(claude.cmd)/git.exe等のconsole subsystem
# 内部子プロセスのウィンドウを抑制できない
if sys.platform == "win32":
    _SILENT_STARTUPINFO = subprocess.STARTUPINFO()
    _SILENT_STARTUPINFO.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    _SILENT_STARTUPINFO.wShowWindow = subprocess.SW_HIDE

    _orig_run = subprocess.run
    def _silent_run(*a, **kw):
        kw["creationflags"] = kw.get("creationflags", 0) | subprocess.CREATE_NO_WINDOW
        kw.setdefault("startupinfo", _SILENT_STARTUPINFO)
        return _orig_run(*a, **kw)
    subprocess.run = _silent_run
    _orig_popen = subprocess.Popen
    def _silent_popen(*a, **kw):
        kw["creationflags"] = kw.get("creationflags", 0) | subprocess.CREATE_NO_WINDOW
        kw.setdefault("startupinfo", _SILENT_STARTUPINFO)
        return _orig_popen(*a, **kw)
    subprocess.Popen = _silent_popen

REPO_DIR = Path(__file__).parent
LOG_FILE = REPO_DIR / "log" / "inbox_check.log"
ERROR_STATE_FILE = REPO_DIR / ".inbox_check_error_state.json"

INBOX_FILES = {
    "win": REPO_DIR / "memory" / "inbox_win.md",
    "mac": REPO_DIR / "memory" / "inbox_mac.md",
    "win2": REPO_DIR / "memory" / "inbox_win2.md",
}

# Header lines that don't count as content
HEADER_LINE_COUNT = 5

# エラー分類パターン
FATAL_PATTERNS = [
    "You've hit your limit",
    "You're out of extra usage",
    "Failed to authenticate",
    "authentication_error",
    "invalid_api_key",
]
# クールダウン時間（秒）: 致命的エラー → 30分、一時的エラー連続 → 指数バックオフ
FATAL_COOLDOWN_SEC = 30 * 60
MAX_TRANSIENT_ERRORS = 5  # これを超えたら30分クールダウン


def log(message):
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{ts}] {message}\n")


def load_error_state():
    """エラー状態を読み込む"""
    if ERROR_STATE_FILE.exists():
        try:
            return json.loads(ERROR_STATE_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def save_error_state(state):
    """エラー状態を保存"""
    ERROR_STATE_FILE.write_text(json.dumps(state, ensure_ascii=False), encoding="utf-8")


def clear_error_state(box_name):
    """成功時にエラー状態をクリア"""
    state = load_error_state()
    if box_name in state:
        del state[box_name]
        save_error_state(state)


def is_in_cooldown(box_name):
    """クールダウン中か判定。クールダウン中ならTrue + 残り時間を返す"""
    state = load_error_state()
    if box_name not in state:
        return False, 0
    entry = state[box_name]
    cooldown_until = entry.get("cooldown_until", 0)
    now = datetime.now().timestamp()
    if now < cooldown_until:
        remaining = int(cooldown_until - now)
        return True, remaining
    return False, 0


def set_cooldown(box_name, seconds, reason):
    """クールダウンを設定"""
    state = load_error_state()
    now = datetime.now().timestamp()
    state[box_name] = {
        "cooldown_until": now + seconds,
        "reason": reason,
        "set_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "consecutive_errors": state.get(box_name, {}).get("consecutive_errors", 0),
    }
    save_error_state(state)


def increment_error_count(box_name):
    """一時的エラーのカウントをインクリメント。閾値超えたらクールダウン設定"""
    state = load_error_state()
    entry = state.get(box_name, {})
    count = entry.get("consecutive_errors", 0) + 1
    state[box_name] = {
        **entry,
        "consecutive_errors": count,
    }
    save_error_state(state)

    if count >= MAX_TRANSIENT_ERRORS:
        # 指数バックオフ: 5回→30分, 10回→60分, ...
        cooldown = min(FATAL_COOLDOWN_SEC * (count // MAX_TRANSIENT_ERRORS), 2 * 3600)
        set_cooldown(box_name, cooldown, f"transient_error_x{count}")
        log(f"[COOLDOWN] {box_name}: {count}回連続エラー → {cooldown // 60}分クールダウン")
    return count


def classify_claude_output(stdout, stderr):
    """Claudeの出力からエラーを分類。
    Returns: ("success", None) | ("fatal", reason) | ("empty", None)
    """
    output = (stdout or "") + (stderr or "")
    if not output.strip():
        return "empty", None

    for pattern in FATAL_PATTERNS:
        if pattern in output:
            return "fatal", pattern

    return "success", None


def has_content(inbox_path):
    """ヘッダー以外に内容があるか（HTMLコメントと空行は無視）"""
    if not inbox_path.exists():
        return False
    with open(inbox_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    # Strip empty lines and HTML comments (processed items) after header
    content_lines = [
        l for l in lines[HEADER_LINE_COUNT:]
        if l.strip() and not l.strip().startswith("<!--")
    ]
    return len(content_lines) > 0


def git_pull():
    """最新を取得"""
    try:
        subprocess.run(
            ["git", "pull", "origin", "master"],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=str(REPO_DIR),
        )
    except Exception:
        pass


def snapshot_inbox(inbox_path):
    """inbox内容を退避して空にする。二重起動防止。"""
    header_lines = []
    content_lines = []
    with open(inbox_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    header_lines = lines[:HEADER_LINE_COUNT]
    content_lines = lines[HEADER_LINE_COUNT:]

    # inboxをヘッダーのみに戻す（次のチェックで空と判定される）
    with open(inbox_path, "w", encoding="utf-8") as f:
        f.writelines(header_lines)

    return "".join(content_lines).strip()


def restore_inbox(inbox_path, content):
    """inboxに内容を復元する"""
    with open(inbox_path, "a", encoding="utf-8") as f:
        f.write("\n" + content + "\n")


def wake_claude(box_name, inbox_path):
    """Claudeを起動して受信箱を処理させる。起動前にinboxを空にして二重処理を防ぐ。

    エラー分類と対応:
    - 成功: エラーカウンタをリセット
    - 致命的エラー（rate limit/auth）: inbox復元 + クールダウン設定（リトライ抑制）
    - 一時的エラー（NoneType等）: inbox復元 + エラーカウンタ増加 → 閾値超えでクールダウン
    - タイムアウト: inbox復元（schedulerのタイムアウト追跡に任せる）

    大量コンテンツ対策（2026-04-27 Log修正）:
    - 内容が LARGE_PROMPT_THRESHOLD を超えたら一時ファイルに書き出し、prompt には file pointer のみ embed
    - Windows CreateProcess の lpCommandLine 上限 (~32KB) で WinError 206 を起こさないようにする
    """
    # inbox内容を退避してから空にする
    content = snapshot_inbox(inbox_path)
    if not content:
        log(f"Inbox {box_name} was empty after snapshot (race condition?)")
        return

    # Windows コマンドライン上限 32767 chars。system_identity.md path + prompt template + 余白で 20KB を閾値に
    LARGE_PROMPT_THRESHOLD = 20000
    pending_file = REPO_DIR / "memory" / f"_inbox_pending_{box_name}.md"
    content_bytes = len(content.encode("utf-8"))

    if content_bytes > LARGE_PROMPT_THRESHOLD:
        pending_file.write_text(content, encoding="utf-8")
        log(f"[LARGE_INBOX] {box_name}: content {content_bytes} bytes > {LARGE_PROMPT_THRESHOLD}, written to {pending_file.name}")
        prompt = (
            f"【Slackレスポンスモード】速さと判断を重視。1回の起動で対処を完結させよ。\n"
            f"受信箱({box_name})に大量のメッセージが溜まっており prompt embed では送れないため、\n"
            f"一時ファイルに書き出した: `memory/_inbox_pending_{box_name}.md` ({content_bytes} bytes)\n\n"
            f"このファイルを読んで処理し、処理が完了したら一時ファイルを削除してください。\n\n"
            f"■ このモードのルール:\n"
            f"- メッセージを読み、判断し、対処し、返信する。それだけに集中\n"
            f"- 情報収集フェーズや日記は不要。定期サイクル(auto_diary.py)がやる\n"
            f"- 必要ならファイル更新・git pushまで完結させる\n"
            f"- 対処不要と判断したら、その旨だけ残して終了してよい\n"
        )
    else:
        # 旧 pending file が残っていれば掃除（前回 large 経路で失敗した残骸）
        if pending_file.exists():
            try:
                pending_file.unlink()
            except OSError:
                pass
        prompt = (
            f"【Slackレスポンスモード】速さと判断を重視。1回の起動で対処を完結させよ。\n"
            f"受信箱({box_name})にメッセージがあります:\n\n"
            f"---\n{content}\n---\n\n"
            f"■ このモードのルール:\n"
            f"- メッセージを読み、判断し、対処し、返信する。それだけに集中\n"
            f"- 情報収集フェーズや日記は不要。定期サイクル(auto_diary.py)がやる\n"
            f"- 必要ならファイル更新・git pushまで完結させる\n"
            f"- 対処不要と判断したら、その旨だけ残して終了してよい\n"
        )
    try:
        env = {**os.environ, "PYTHONUTF8": "1", "PYTHONIOENCODING": "utf-8"}
        result = subprocess.run(
            build_claude_cmd(prompt),
            capture_output=True,
            text=True,
            timeout=300,  # Slackレスポンスモード: 速さ重視（定期サイクルは別途auto_diary.pyが担当）
            cwd=str(REPO_DIR),
            encoding="utf-8",
            errors="replace",
            env=env,
        )
        # Claudeの出力からエラーを分類
        error_type, reason = classify_claude_output(result.stdout, result.stderr)

        if error_type == "fatal":
            # 致命的エラー: inbox復元 + クールダウン
            log(f"[FATAL] Claude returned fatal error for {box_name}: {reason} — restoring inbox, cooldown {FATAL_COOLDOWN_SEC // 60}min")
            restore_inbox(inbox_path, content)
            set_cooldown(box_name, FATAL_COOLDOWN_SEC, reason)
            return

        # 成功（emptyも成功扱い — Claude側が処理完了した可能性）
        log(f"Claude woken for {box_name}: {(result.stdout or '')[:100]}")
        clear_error_state(box_name)

    except subprocess.TimeoutExpired:
        # タイムアウト時はinboxに内容を戻す（次回リトライ可能にする）
        log(f"Claude wake timed out for {box_name} — restoring inbox")
        restore_inbox(inbox_path, content)
        increment_error_count(box_name)
    except Exception as e:
        # 一時的エラー: inbox復元 + エラーカウンタ増加
        count = increment_error_count(box_name)
        log(f"Error waking Claude for {box_name}: {e} — restoring inbox (consecutive errors: {count})")
        restore_inbox(inbox_path, content)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--box", default="win", choices=["win", "mac", "win2"]
    )
    args = parser.parse_args()

    inbox_path = INBOX_FILES[args.box]

    # First pull to get latest
    git_pull()

    if has_content(inbox_path):
        # クールダウン中か確認
        in_cooldown, remaining = is_in_cooldown(args.box)
        if in_cooldown:
            log(f"[COOLDOWN] {args.box} is in cooldown ({remaining // 60}m{remaining % 60}s remaining) — skipping Claude wake")
            print(f"Inbox {args.box} has content but in cooldown ({remaining}s remaining)")
            return

        log(f"Inbox {args.box} has content — waking Claude")
        print(f"Inbox {args.box} has content")
        wake_claude(args.box, inbox_path)
    else:
        # Silent — no log to avoid log bloat
        print(f"Inbox {args.box} empty")


if __name__ == "__main__":
    main()
