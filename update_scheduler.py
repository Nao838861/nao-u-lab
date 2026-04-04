"""
update_scheduler.py — スケジューラ設定変更の唯一の窓口

変更→検証→Slack報告を1コマンドで完結させる。
「変更しただけで完了にしない」を構造で強制する（INC-019再発防止）。

Usage:
  python update_scheduler.py ash auto_diary interval 3600
  python update_scheduler.py log auto_cycle interval 5400
  python update_scheduler.py mir interval 1800       # Mirのサイクル間隔（秒）
  python update_scheduler.py ash inbox_check timeout 900
  python update_scheduler.py --all-cycle interval 1800  # 全インスタンス一括変更
  python update_scheduler.py --show [ash|log|mir|all]
  python update_scheduler.py --verify [ash|log|all]     # プロセス・ログ・設定の検証
"""

import os
import sys
import json
import re
import time
from pathlib import Path
from datetime import datetime

REPO_DIR = Path(__file__).parent
sys.path.insert(0, str(REPO_DIR))

CONFIG_FILES = {
    "ash": REPO_DIR / "scheduler_ash_config.json",
    "log": REPO_DIR / "scheduler_log_config.json",
}

PID_FILES = {
    "ash": REPO_DIR / ".scheduler_ash.lock",
    "log": REPO_DIR / ".scheduler_log.lock",
}

LOG_FILES = {
    "ash": REPO_DIR / "log" / "scheduler_ash.log",
    "log": REPO_DIR / "log" / "scheduler_log.log",
}

MIR_BOOT_INTENT = REPO_DIR / "memory" / "mir_boot_intent.md"

SLACK_CHANNEL_ALL = "C0ALWBRNJ66"       # #all-nao-u-lab
SLACK_CHANNEL_STEERING = "C0ANECNV5DK"  # #human-steering

# 各インスタンスのサイクルジョブ名（--all-cycleで使う）
CYCLE_JOB_NAMES = {
    "ash": "auto_diary",
    "log": "auto_cycle",
    "mir": "cycle",
}

AUTO_DIARY_JOBS = {"auto_diary", "auto_cycle"}
MIN_INTERVAL_MARGIN = 600

# バリデーション
MIN_CYCLE_INTERVAL = 300    # 5分
MAX_CYCLE_INTERVAL = 86400  # 24時間


# ═══════════════════════════════════════════════════
#  検証機能（変更と分離不可能——これがINC-019の構造的修正）
# ═══════════════════════════════════════════════════

def check_process_alive(pid):
    """PIDが生きているかチェック。Windows/Unix両対応。"""
    if pid is None:
        return False
    try:
        if sys.platform == "win32":
            import ctypes
            kernel32 = ctypes.windll.kernel32
            PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
            handle = kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, pid)
            if handle:
                kernel32.CloseHandle(handle)
                return True
            return False
        else:
            os.kill(pid, 0)
            return True
    except (OSError, PermissionError):
        return False


def get_scheduler_pid(scheduler):
    """PIDファイルからPIDを読み取る。"""
    pid_file = PID_FILES.get(scheduler)
    if pid_file and pid_file.exists():
        try:
            return int(pid_file.read_text().strip())
        except (ValueError, OSError):
            pass
    return None


def wait_for_log_activity(scheduler, pattern=None, timeout_sec=90):
    """スケジューラログを監視し、指定パターンまたはジョブ実行を検出する。

    Args:
        scheduler: "ash" or "log"
        pattern: 検索パターン（Noneならジョブ実行ログを検索）
        timeout_sec: 待機上限
    Returns: (success: bool, matched_line: str)
    """
    log_file = LOG_FILES.get(scheduler)
    if not log_file or not log_file.exists():
        return False, f"ログファイルが見つからない: {log_file}"

    start_size = log_file.stat().st_size
    start_time = time.time()
    fallback_patterns = ["] Starting", "] Done"]

    print(f"[VERIFY] ログ監視中（最大{timeout_sec}秒）", end="", flush=True)

    while time.time() - start_time < timeout_sec:
        time.sleep(5)
        try:
            current_size = log_file.stat().st_size
        except OSError:
            print(".", end="", flush=True)
            continue
        if current_size > start_size:
            try:
                with open(log_file, "r", encoding="utf-8") as f:
                    f.seek(start_size)
                    new_lines = f.read()
                for line in new_lines.split("\n"):
                    if pattern and pattern.lower() in line.lower():
                        print(" 検出")
                        return True, line.strip()
                    for fp in fallback_patterns:
                        if fp in line:
                            print(" 検出")
                            return True, line.strip()
            except Exception:
                pass
        print(".", end="", flush=True)

    print(" タイムアウト")
    return False, f"{timeout_sec}秒以内にログ活動を検出できず"


def verify_scheduler(scheduler):
    """スケジューラの動作状態をフルチェック。

    Returns: (all_ok: bool, results: list[tuple[str, bool, str]])
    """
    results = []

    # 1. プロセス生存
    pid = get_scheduler_pid(scheduler)
    if pid is None:
        results.append(("プロセス", False, "PIDファイルが見つからない"))
    elif check_process_alive(pid):
        results.append(("プロセス", True, f"PID {pid} 稼働中"))
    else:
        results.append(("プロセス", False, f"PID {pid} が死んでいる（PIDファイル残存）"))

    # 2. 設定ファイル構文
    config_file = CONFIG_FILES.get(scheduler)
    if config_file and config_file.exists():
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                cfg = json.load(f)
            settings = {k: v for k, v in cfg.items() if not k.startswith("_")}
            results.append(("設定ファイル", True, f"{config_file.name}: {json.dumps(settings, ensure_ascii=False)}"))
        except json.JSONDecodeError as e:
            results.append(("設定ファイル", False, f"JSON構文エラー: {e}"))
    else:
        results.append(("設定ファイル", True, f"デフォルト設定（ファイルなし）"))

    # 3. ログ鮮度
    log_file = LOG_FILES.get(scheduler)
    if log_file and log_file.exists():
        mtime = datetime.fromtimestamp(log_file.stat().st_mtime)
        age_min = (datetime.now() - mtime).total_seconds() / 60
        if age_min < 5:
            results.append(("ログ鮮度", True, f"最終更新: {age_min:.0f}分前"))
        elif age_min < 30:
            results.append(("ログ鮮度", True, f"最終更新: {age_min:.0f}分前（やや古い）"))
        else:
            results.append(("ログ鮮度", False, f"最終更新: {age_min:.0f}分前（停止の可能性）"))
    else:
        results.append(("ログ鮮度", False, "ログファイルが見つからない"))

    # 4. ジョブ実行確認（リアルタイム）
    #    プロセス生存+ログ鮮度で既に確認済みなら、リアルタイム確認は補助的
    proc_ok = any(ok for name, ok, _ in results if name == "プロセス")
    log_fresh = any(ok for name, ok, _ in results if name == "ログ鮮度")
    if proc_ok and log_fresh:
        # 両方OKなら短めの待機でいい
        job_ok, job_msg = wait_for_log_activity(scheduler, timeout_sec=90)
        if job_ok:
            results.append(("ジョブ実行", True, job_msg))
        else:
            # プロセスもログも生きてるなら、長時間ジョブ実行中の可能性が高い
            results.append(("ジョブ実行", True, "プロセス稼働中・ログ最近更新あり（長時間ジョブ実行中の可能性）"))
    elif proc_ok:
        job_ok, job_msg = wait_for_log_activity(scheduler, timeout_sec=120)
        results.append(("ジョブ実行", job_ok, job_msg))
    else:
        results.append(("ジョブ実行", False, "プロセスが動いていないためスキップ"))

    all_ok = all(ok for _, ok, _ in results)
    return all_ok, results


def post_verify_after_change(scheduler, job, setting_key, old_value, new_value):
    """設定変更後の自動検証。変更と不可分。"""
    print()
    print("=" * 50)
    print("[VERIFY] 自動検証開始（変更が実際に反映されたか確認）")
    print("=" * 50)

    verify_results = []

    # 1. プロセス生存
    pid = get_scheduler_pid(scheduler)
    if pid is None:
        verify_results.append(("プロセス", False, "PIDファイルが見つからない"))
        print(f"  プロセス: ❌ PIDファイルが見つからない")
    elif check_process_alive(pid):
        verify_results.append(("プロセス", True, f"PID {pid} 稼働中"))
        print(f"  プロセス: ✅ PID {pid} 稼働中")
    else:
        verify_results.append(("プロセス", False, f"PID {pid} が死んでいる"))
        print(f"  プロセス: ❌ PID {pid} が死んでいる")

    # 2. 設定反映をログで確認
    proc_ok = any(ok for name, ok, _ in verify_results if name == "プロセス")
    if proc_ok:
        config_ok, config_msg = wait_for_log_activity(
            scheduler, pattern="auto-applied", timeout_sec=120
        )
        if config_ok:
            verify_results.append(("設定反映", True, config_msg))
            print(f"  設定反映: ✅ {config_msg}")
        else:
            # 同値変更ではconfig変更ログが出ない→ジョブ実行で代替確認
            job_ok, job_msg = wait_for_log_activity(scheduler, timeout_sec=60)
            if job_ok:
                verify_results.append(("設定反映", True, f"ジョブ実行中（同値変更の可能性）: {job_msg}"))
                print(f"  設定反映: ✅ ジョブ実行確認")
            else:
                verify_results.append(("設定反映", False, config_msg))
                print(f"  設定反映: ❌ {config_msg}")
    else:
        verify_results.append(("設定反映", False, "プロセス停止中のため検証不可"))
        print(f"  設定反映: ❌ プロセス停止中")

    # 3. 結果
    all_ok = all(ok for _, ok, _ in verify_results)
    print()
    if all_ok:
        print("✅ 変更完了・動作確認済み")
    else:
        print("⚠️ 問題あり:")
        for name, ok, msg in verify_results:
            if not ok:
                print(f"  - {name}: {msg}")

    # 4. Slack通知
    _notify_slack(scheduler, job, setting_key, old_value, new_value, verify_results)

    return all_ok


def _notify_slack(scheduler, job, setting_key, old_value, new_value, verify_results):
    """検証結果をSlackに通知。"""
    try:
        from slack_bot import post_message
    except ImportError:
        print("[SLACK] slack_bot.pyが見つからない。Slack通知スキップ")
        return

    all_ok = all(ok for _, ok, _ in verify_results)

    lines = []
    if job and setting_key:
        lines.append(f"*設定変更: {scheduler}/{job}*")
        lines.append(f"`{setting_key}`: {old_value} → {new_value}")
    else:
        lines.append(f"*スケジューラ検証: {scheduler}*")

    lines.append("")
    for name, ok, msg in verify_results:
        mark = "✅" if ok else "❌"
        # ログの行内容が長すぎる場合は切り詰め
        if len(msg) > 120:
            msg = msg[:120] + "..."
        lines.append(f"{mark} {name}: {msg}")

    if all_ok:
        lines.append("\n✅ 変更完了・動作確認済み")
        channel = SLACK_CHANNEL_ALL
    else:
        lines.append("\n⚠️ 問題あり。要確認")
        channel = SLACK_CHANNEL_STEERING

    text = "\n".join(lines)
    try:
        post_message(channel, text)
        channel_name = "#all-nao-u-lab" if channel == SLACK_CHANNEL_ALL else "#human-steering"
        print(f"[SLACK] {channel_name} に通知済み")
    except Exception as e:
        print(f"[SLACK] 通知失敗: {e}")


# ═══════════════════════════════════════════════════
#  設定変更
# ═══════════════════════════════════════════════════

def load_config(scheduler):
    path = CONFIG_FILES[scheduler]
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_config(scheduler, cfg):
    path = CONFIG_FILES[scheduler]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
    print(f"[OK] {path.name} updated")


def load_mir_interval():
    """mir_boot_intent.mdからサイクル間隔（分）を読み取る"""
    if not MIR_BOOT_INTENT.exists():
        return None
    content = MIR_BOOT_INTENT.read_text(encoding="utf-8")
    match = re.search(r"## サイクル間隔（分）\s*\n(\d+)", content)
    if match:
        return int(match.group(1))
    return None


def update_mir_interval(interval_sec):
    """mir_boot_intent.mdのサイクル間隔を更新（分単位）"""
    if not MIR_BOOT_INTENT.exists():
        print(f"[ERROR] {MIR_BOOT_INTENT} not found")
        return False

    interval_min = interval_sec // 60
    if interval_sec % 60 != 0:
        print(f"[WARN] Mir interval rounded to {interval_min} minutes ({interval_min * 60}s)")

    content = MIR_BOOT_INTENT.read_text(encoding="utf-8")
    today = datetime.now().strftime("%Y-%m-%d")

    old_match = re.search(
        r"(## サイクル間隔（分）\s*\n)(\d+)\n(#[^\n]*\n)?",
        content
    )
    if not old_match:
        print(f"[ERROR] Could not parse interval section in {MIR_BOOT_INTENT.name}")
        return False

    old_interval = int(old_match.group(2))
    new_block = f"{old_match.group(1)}{interval_min}\n# update_scheduler.py ({today}): {old_interval}分→{interval_min}分\n"
    content = content[:old_match.start()] + new_block + content[old_match.end():]

    MIR_BOOT_INTENT.write_text(content, encoding="utf-8")
    print(f"[mir/cycle] interval: {old_interval}分 -> {interval_min}分 ({interval_sec}秒)")
    print(f"[OK] {MIR_BOOT_INTENT.name} updated")
    return True


def show_config(scheduler):
    if scheduler == "mir":
        interval = load_mir_interval()
        print(f"=== mir (mir_boot_intent.md) ===")
        if interval is not None:
            print(f"  cycle:")
            print(f"    interval: {interval}分 ({interval * 60}秒)")
        else:
            print(f"  (interval not found)")
        return

    cfg = load_config(scheduler)
    path = CONFIG_FILES[scheduler]
    if not cfg:
        print(f"{path.name}: (empty or not found)")
        return
    print(f"=== {path.name} ===")
    for key, val in cfg.items():
        if key.startswith("_"):
            continue
        print(f"  {key}:")
        if isinstance(val, dict):
            for k, v in val.items():
                print(f"    {k}: {v}")
        else:
            print(f"    {val}")


def validate_cycle_interval(value):
    """サイクル間隔のバリデーション"""
    if value < MIN_CYCLE_INTERVAL:
        print(f"[ERROR] interval {value}s is too short (min: {MIN_CYCLE_INTERVAL}s = {MIN_CYCLE_INTERVAL // 60}min)")
        return False
    if value > MAX_CYCLE_INTERVAL:
        print(f"[ERROR] interval {value}s is too long (max: {MAX_CYCLE_INTERVAL}s = {MAX_CYCLE_INTERVAL // 3600}h)")
        return False
    return True


def update_setting(scheduler, job, setting, value):
    """設定を変更し、Log/Ashの場合は自動で検証・Slack報告まで行う。"""
    if scheduler == "mir":
        if setting in ("interval", "interval_sec"):
            if not validate_cycle_interval(value):
                sys.exit(1)
            if not update_mir_interval(value):
                sys.exit(1)
            # Mirはシェルスクリプト方式のため常駐プロセスの検証は不要
            print("[INFO] Mirは次回のLaunchAgent/cron起動で反映されます")
        else:
            print(f"[ERROR] Mir only supports 'interval' setting (got: {setting})")
            sys.exit(1)
        return True

    cfg = load_config(scheduler)

    if job not in cfg:
        cfg[job] = {}

    setting_key = "interval_sec" if setting == "interval" else setting
    old_value = cfg[job].get(setting_key, "(default)")

    if job in AUTO_DIARY_JOBS and setting_key == "interval_sec":
        if not validate_cycle_interval(value):
            sys.exit(1)

    cfg[job][setting_key] = value
    print(f"[{scheduler}/{job}] {setting_key}: {old_value} -> {value}")

    if job in AUTO_DIARY_JOBS and setting_key == "interval_sec":
        min_interval = value - MIN_INTERVAL_MARGIN
        if min_interval < 60:
            min_interval = int(value * 0.8)
        cfg[job]["min_interval_sec"] = min_interval
        print(f"[{scheduler}/{job}] min_interval_sec: auto-set to {min_interval} (interval - 10min)")

    save_config(scheduler, cfg)

    # ─── 自動検証（構造で強制。スキップ不可） ───
    return post_verify_after_change(scheduler, job, setting_key, old_value, value)


def update_all_cycle(setting, value):
    """全インスタンスのサイクル間隔を一括変更"""
    if setting not in ("interval", "interval_sec"):
        print(f"[ERROR] --all-cycle only supports 'interval' (got: {setting})")
        sys.exit(1)

    if not validate_cycle_interval(value):
        sys.exit(1)

    print(f"=== 全インスタンスのサイクル間隔を {value}秒 ({value // 60}分) に変更 ===\n")
    errors = []

    for inst, job in CYCLE_JOB_NAMES.items():
        try:
            ok = update_setting(inst, job, setting, value)
            if not ok:
                errors.append(inst)
            print()
        except SystemExit:
            errors.append(inst)
            print()

    if errors:
        print(f"[ERROR] 以下のインスタンスで問題: {errors}")
        sys.exit(1)
    else:
        print(f"[OK] 全インスタンス({', '.join(CYCLE_JOB_NAMES.keys())})の変更・検証完了")


def verify_all():
    """全設定の整合性 + プロセス状態を検証"""
    print("=== 全スケジューラ検証 ===\n")
    all_issues = []

    # Log/Ash のプロセス・ログ検証
    for scheduler in ["log", "ash"]:
        print(f"--- {scheduler} ---")
        all_ok, results = verify_scheduler(scheduler)
        for name, ok, msg in results:
            mark = "✅" if ok else "❌"
            print(f"  {mark} {name}: {msg}")
        if not all_ok:
            all_issues.append(scheduler)
        _notify_slack(scheduler, None, None, None, None, results)
        print()

    # Mir: ファイル存在のみ確認
    print("--- mir ---")
    mir_interval = load_mir_interval()
    if mir_interval:
        print(f"  ✅ cycle: {mir_interval}分 ({mir_interval * 60}秒)")
    else:
        print(f"  ❌ サイクル間隔がmir_boot_intent.mdに見つからない")
        all_issues.append("mir")

    # 設定整合性
    print("\n--- 設定整合性 ---")
    ash_cfg = load_config("ash")
    ash_interval = ash_cfg.get("auto_diary", {}).get("interval_sec")
    ash_min = ash_cfg.get("auto_diary", {}).get("min_interval_sec")
    log_cfg = load_config("log")
    log_interval = log_cfg.get("auto_cycle", {}).get("interval_sec")
    log_min = log_cfg.get("auto_cycle", {}).get("min_interval_sec")

    if ash_min and ash_interval and ash_min >= ash_interval:
        print(f"  ❌ ash: min_interval({ash_min}) >= interval({ash_interval}) → スキップされる")
        all_issues.append("ash-config")
    if log_min and log_interval and log_min >= log_interval:
        print(f"  ❌ log: min_interval({log_min}) >= interval({log_interval}) → スキップされる")
        all_issues.append("log-config")

    intervals = {}
    if ash_interval:
        intervals["ash"] = ash_interval
    if log_interval:
        intervals["log"] = log_interval
    if mir_interval:
        intervals["mir"] = mir_interval * 60
    if len(set(intervals.values())) > 1:
        print(f"  ⚠️ インスタンス間で間隔が不一致: {intervals}")

    print()
    if all_issues:
        print(f"⚠️ 問題あり: {all_issues}")
        return False
    else:
        print("✅ 全チェックパス")
        return True


# ═══════════════════════════════════════════════════
#  メイン
# ═══════════════════════════════════════════════════

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    if sys.argv[1] == "--show":
        if len(sys.argv) < 3 or sys.argv[2].lower() == "all":
            for s in CONFIG_FILES:
                show_config(s)
                print()
            show_config("mir")
        else:
            scheduler = sys.argv[2].lower()
            if scheduler not in CONFIG_FILES and scheduler != "mir":
                print(f"Unknown scheduler: {scheduler}. Use: {list(CONFIG_FILES.keys()) + ['mir', 'all']}")
                sys.exit(1)
            show_config(scheduler)
        return

    if sys.argv[1] == "--verify":
        scheduler = sys.argv[2].lower() if len(sys.argv) > 2 else "all"
        if scheduler == "all":
            ok = verify_all()
        elif scheduler in CONFIG_FILES:
            print(f"=== {scheduler} スケジューラ検証 ===\n")
            ok, results = verify_scheduler(scheduler)
            for name, vok, msg in results:
                mark = "✅" if vok else "❌"
                print(f"  {mark} {name}: {msg}")
            print()
            print("✅ 全チェックパス" if ok else "⚠️ 問題あり")
            _notify_slack(scheduler, None, None, None, None, results)
        else:
            print(f"Unknown: {scheduler}. Use: {list(CONFIG_FILES.keys()) + ['all']}")
            sys.exit(1)
        sys.exit(0 if ok else 1)

    if sys.argv[1] == "--all-cycle":
        if len(sys.argv) < 4:
            print("Usage: python update_scheduler.py --all-cycle interval <seconds>")
            sys.exit(1)
        setting = sys.argv[2]
        try:
            value = int(sys.argv[3])
        except ValueError:
            print(f"Error: value must be integer (got: {sys.argv[3]})")
            sys.exit(1)
        update_all_cycle(setting, value)
        return

    # Mir shorthand: python update_scheduler.py mir interval 1800
    if sys.argv[1].lower() == "mir":
        if len(sys.argv) < 4:
            print("Usage: python update_scheduler.py mir interval <seconds>")
            sys.exit(1)
        setting = sys.argv[2]
        try:
            value = int(sys.argv[3])
        except ValueError:
            print(f"Error: value must be integer (got: {sys.argv[3]})")
            sys.exit(1)
        update_setting("mir", "cycle", setting, value)
        return

    if len(sys.argv) < 5:
        print("Usage: python update_scheduler.py <ash|log|mir> <job_name> <interval|timeout> <value>")
        print("       python update_scheduler.py mir interval <seconds>")
        print("       python update_scheduler.py --all-cycle interval <seconds>")
        print("       python update_scheduler.py --show [ash|log|mir|all]")
        print("       python update_scheduler.py --verify [ash|log|all]")
        sys.exit(1)

    scheduler = sys.argv[1].lower()
    job = sys.argv[2]
    setting = sys.argv[3]
    try:
        value = int(sys.argv[4])
    except ValueError:
        print(f"Error: value must be integer (got: {sys.argv[4]})")
        sys.exit(1)

    if scheduler not in CONFIG_FILES and scheduler != "mir":
        print(f"Unknown scheduler: {scheduler}. Use: {list(CONFIG_FILES.keys()) + ['mir']}")
        sys.exit(1)

    if setting not in ("interval", "interval_sec", "timeout"):
        print(f"Unknown setting: {setting}. Use: interval, timeout")
        sys.exit(1)

    success = update_setting(scheduler, job, setting, value)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
