#!/usr/bin/env python3
"""Copy reference raw logs into GPT memory/raw.

Claude-side files may be used as sources, but GPT memory must be self-contained
after this sync.
"""
from __future__ import annotations

import argparse
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
RAW_DIR = MEMORY_DIR / "raw"
CLAUDE_ROOT = Path(os.environ.get("NAOU_CLAUDE_ROOT", r"D:\AI\Nao_u_BOT\Claude"))


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


DEFAULT_SOURCES = {
    CLAUDE_ROOT / "log" / "slack_archive" / "shared-reads.jsonl": RAW_DIR / "slack_archive" / "shared-reads.jsonl",
}


def sync_file(src: Path, dst: Path) -> bool:
    if not src.exists():
        print(f"missing source: {src}")
        return False
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists() and dst.read_bytes() == src.read_bytes():
        return False
    shutil.copy2(src, dst)
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync reference raw logs into GPT memory/raw.")
    parser.add_argument("--shared-reads-only", action="store_true", default=True)
    args = parser.parse_args()

    changed = 0
    for src, dst in DEFAULT_SOURCES.items():
        if sync_file(src, dst):
            changed += 1
            print(f"synced: {src} -> {dst}")

    stamp = RAW_DIR / "sync_state.txt"
    stamp.parent.mkdir(parents=True, exist_ok=True)
    stamp.write_text(
        f"last_sync={datetime.now().isoformat(timespec='seconds')}\n"
        f"source_root={CLAUDE_ROOT}\n"
        f"changed={changed}\n",
        encoding="utf-8",
    )
    print(f"changed files: {changed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
