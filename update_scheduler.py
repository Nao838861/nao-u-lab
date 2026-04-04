"""
update_scheduler.py — スケジューラ設定変更の唯一の窓口

周期・タイムアウトの変更はこのスクリプト経由で行う。
.pyファイルのJOBS定義を直接編集してはいけない（再起動が必要になる）。
このスクリプトはJSON設定ファイルを更新するだけなので、再起動不要。
次のサイクルで即反映される。

Usage:
  python update_scheduler.py ash auto_diary interval 3600
  python update_scheduler.py log auto_cycle interval 5400
  python update_scheduler.py mir interval 1800       # Mirのサイクル間隔（秒）
  python update_scheduler.py ash inbox_check timeout 900
  python update_scheduler.py --all-cycle interval 1800  # 全インスタンス一括変更
  python update_scheduler.py --show [ash|log|mir|all]
  python update_scheduler.py --verify                   # 全設定の整合性検証
"""

import sys
import json
import re
from pathlib import Path
from datetime import datetime

REPO_DIR = Path(__file__).parent

CONFIG_FILES = {
    "ash": REPO_DIR / "scheduler_ash_config.json",
    "log": REPO_DIR / "scheduler_log_config.json",
}

MIR_BOOT_INTENT = REPO_DIR / "memory" / "mir_boot_intent.md"

# 各インスタンスのサイクルジョブ名（--all-cycleで使う）
CYCLE_JOB_NAMES = {
    "ash": "auto_diary",
    "log": "auto_cycle",
    "mir": "cycle",  # Mirは独自方式
}

# auto_diary/auto_cycle の interval 変更時、min_interval_sec を自動調整する
# (二重ガード問題の防止: schedulerの間隔よりmin_intervalが大きいとスキップされる)
AUTO_DIARY_JOBS = {"auto_diary", "auto_cycle"}
MIN_INTERVAL_MARGIN = 600  # interval_sec - 10分 をmin_interval_secに設定

# バリデーション: サイクル間隔の許容範囲（秒）
MIN_CYCLE_INTERVAL = 300    # 5分
MAX_CYCLE_INTERVAL = 86400  # 24時間


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
    # "## サイクル間隔（分）" 以降の最初の数値行を取得
    match = re.search(r"## サイクル間隔（分）\s*\n(\d+)", content)
    if match:
        return int(match.group(1))
    return None


def update_mir_interval(interval_sec):
    """mir_boot_intent.mdのサイクル間隔を更新する（分単位で書き込み）"""
    if not MIR_BOOT_INTENT.exists():
        print(f"[ERROR] {MIR_BOOT_INTENT} not found")
        return False

    interval_min = interval_sec // 60
    if interval_sec % 60 != 0:
        print(f"[WARN] Mir interval rounded to {interval_min} minutes ({interval_min * 60}s)")

    content = MIR_BOOT_INTENT.read_text(encoding="utf-8")
    today = datetime.now().strftime("%Y-%m-%d")

    # "## サイクル間隔（分）" の次の行（数値行）とそのコメント行を置換
    # パターン: 数値行 + オプションのコメント行
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
    if scheduler == "mir":
        if setting in ("interval", "interval_sec"):
            if not validate_cycle_interval(value):
                sys.exit(1)
            if not update_mir_interval(value):
                sys.exit(1)
        else:
            print(f"[ERROR] Mir only supports 'interval' setting (got: {setting})")
            sys.exit(1)
        return

    cfg = load_config(scheduler)

    if job not in cfg:
        cfg[job] = {}

    setting_key = "interval_sec" if setting == "interval" else setting
    old_value = cfg[job].get(setting_key, "(default)")

    # サイクルジョブの間隔変更時はバリデーション
    if job in AUTO_DIARY_JOBS and setting_key == "interval_sec":
        if not validate_cycle_interval(value):
            sys.exit(1)

    cfg[job][setting_key] = value
    print(f"[{scheduler}/{job}] {setting_key}: {old_value} -> {value}")

    # 二重ガード自動調整: auto_diary/auto_cycle の interval 変更時
    if job in AUTO_DIARY_JOBS and setting_key == "interval_sec":
        min_interval = value - MIN_INTERVAL_MARGIN
        if min_interval < 60:
            min_interval = int(value * 0.8)
        cfg[job]["min_interval_sec"] = min_interval
        print(f"[{scheduler}/{job}] min_interval_sec: auto-set to {min_interval} (interval - 10min)")

    save_config(scheduler, cfg)
    print(f"[INFO] No restart needed. Takes effect at next cycle.")


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
            update_setting(inst, job, setting, value)
            print()
        except SystemExit:
            errors.append(inst)
            print()

    if errors:
        print(f"[ERROR] 以下のインスタンスで失敗: {errors}")
        sys.exit(1)
    else:
        print(f"[OK] 全インスタンス({', '.join(CYCLE_JOB_NAMES.keys())})の変更完了")


def verify_all():
    """全設定の整合性を検証"""
    print("=== 設定整合性チェック ===\n")
    issues = []

    # Ash
    ash_cfg = load_config("ash")
    ash_interval = ash_cfg.get("auto_diary", {}).get("interval_sec")
    ash_min = ash_cfg.get("auto_diary", {}).get("min_interval_sec")
    if ash_interval:
        print(f"[ash] auto_diary: interval={ash_interval}s ({ash_interval // 60}min), min_interval={ash_min}s")
        if ash_min and ash_min >= ash_interval:
            issues.append(f"ash: min_interval_sec({ash_min}) >= interval_sec({ash_interval}) → スキップされる")
    else:
        print(f"[ash] auto_diary: (using defaults)")

    # Log
    log_cfg = load_config("log")
    log_interval = log_cfg.get("auto_cycle", {}).get("interval_sec")
    log_min = log_cfg.get("auto_cycle", {}).get("min_interval_sec")
    if log_interval:
        print(f"[log] auto_cycle: interval={log_interval}s ({log_interval // 60}min), min_interval={log_min}s")
        if log_min and log_min >= log_interval:
            issues.append(f"log: min_interval_sec({log_min}) >= interval_sec({log_interval}) → スキップされる")
    else:
        print(f"[log] auto_cycle: (using defaults)")

    # Mir
    mir_interval = load_mir_interval()
    if mir_interval:
        print(f"[mir] cycle: interval={mir_interval}min ({mir_interval * 60}s)")
    else:
        print(f"[mir] cycle: (not found in mir_boot_intent.md)")
        issues.append("mir: サイクル間隔がmir_boot_intent.mdに見つからない")

    # 一致チェック
    intervals = {}
    if ash_interval:
        intervals["ash"] = ash_interval
    if log_interval:
        intervals["log"] = log_interval
    if mir_interval:
        intervals["mir"] = mir_interval * 60  # 秒に統一

    if len(set(intervals.values())) > 1:
        print(f"\n[WARN] インスタンス間で間隔が不一致:")
        for inst, val in intervals.items():
            print(f"  {inst}: {val}s ({val // 60}min)")

    if issues:
        print(f"\n[ERROR] 問題 {len(issues)}件:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    else:
        print(f"\n[OK] 問題なし")
        return True


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
        ok = verify_all()
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
        print("       python update_scheduler.py --verify")
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

    update_setting(scheduler, job, setting, value)


if __name__ == "__main__":
    main()
