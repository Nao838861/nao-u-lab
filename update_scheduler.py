"""
update_scheduler.py — スケジューラ設定変更の唯一の窓口

周期・タイムアウトの変更はこのスクリプト経由で行う。
.pyファイルのJOBS定義を直接編集してはいけない（再起動が必要になる）。
このスクリプトはJSON設定ファイルを更新するだけなので、再起動不要。
次のサイクルで即反映される。

Usage:
  python update_scheduler.py ash auto_diary interval 3600
  python update_scheduler.py log auto_cycle interval 5400
  python update_scheduler.py ash inbox_check timeout 900
  python update_scheduler.py --show ash
  python update_scheduler.py --show log
"""

import sys
import json
from pathlib import Path

REPO_DIR = Path(__file__).parent

CONFIG_FILES = {
    "ash": REPO_DIR / "scheduler_ash_config.json",
    "log": REPO_DIR / "scheduler_log_config.json",
}

# auto_diary/auto_cycle の interval 変更時、min_interval_sec を自動調整する
# (二重ガード問題の防止: schedulerの間隔よりmin_intervalが大きいとスキップされる)
AUTO_DIARY_JOBS = {"auto_diary", "auto_cycle"}
MIN_INTERVAL_MARGIN = 600  # interval_sec - 10分 をmin_interval_secに設定


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


def show_config(scheduler):
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


def update_setting(scheduler, job, setting, value):
    cfg = load_config(scheduler)

    # Remove meta comments for clean structure
    if job not in cfg:
        cfg[job] = {}

    setting_key = "interval_sec" if setting == "interval" else setting
    old_value = cfg[job].get(setting_key, "(default)")
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


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    if sys.argv[1] == "--show":
        if len(sys.argv) < 3:
            for s in CONFIG_FILES:
                show_config(s)
        else:
            scheduler = sys.argv[2].lower()
            if scheduler not in CONFIG_FILES:
                print(f"Unknown scheduler: {scheduler}. Use: {list(CONFIG_FILES.keys())}")
                sys.exit(1)
            show_config(scheduler)
        return

    if len(sys.argv) < 5:
        print("Usage: python update_scheduler.py <ash|log> <job_name> <interval|timeout> <value>")
        print("       python update_scheduler.py --show [ash|log]")
        sys.exit(1)

    scheduler = sys.argv[1].lower()
    job = sys.argv[2]
    setting = sys.argv[3]
    try:
        value = int(sys.argv[4])
    except ValueError:
        print(f"Error: value must be integer (got: {sys.argv[4]})")
        sys.exit(1)

    if scheduler not in CONFIG_FILES:
        print(f"Unknown scheduler: {scheduler}. Use: {list(CONFIG_FILES.keys())}")
        sys.exit(1)

    if setting not in ("interval", "interval_sec", "timeout"):
        print(f"Unknown setting: {setting}. Use: interval, timeout")
        sys.exit(1)

    update_setting(scheduler, job, setting, value)


if __name__ == "__main__":
    main()
