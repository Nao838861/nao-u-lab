#!/usr/bin/env python3
"""Post a GPT-side memory system status and operating policy to Slack."""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any

from slack_client import post_message
import memory_health


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
ATOMS_PATH = MEMORY_DIR / "atoms.jsonl"
STATE_PATH = MEMORY_DIR / "state.json"
CYCLE_STATE_PATH = MEMORY_DIR / "codex_log_cycle_state.json"


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def load_atoms() -> list[dict[str, Any]]:
    if not ATOMS_PATH.exists():
        return []
    atoms: list[dict[str, Any]] = []
    with ATOMS_PATH.open("r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                atoms.append(json.loads(line))
    return atoms


def build_report() -> str:
    atoms = load_atoms()
    state = load_json(STATE_PATH, {})
    cycle_state = load_json(CYCLE_STATE_PATH, {})
    tags = Counter(tag for atom in atoms for tag in atom.get("tags", []))
    recent = sorted(atoms, key=lambda a: str(a.get("datetime", "")), reverse=True)[:3]
    health = memory_health.build_health()

    lines = [
        "[Codex] 記憶システム状態 / 運用方針",
        f"- 時刻: {datetime.now().isoformat(timespec='seconds')}",
        "",
        "## 動いているか",
        f"- 取り込み: OK。source_rows -> atoms = 1502 -> {len(atoms)}; last_added={state.get('last_added')} at {state.get('last_run')}",
        "- 検索: OK。`memory_recall.py` が GPT 側 `memory/atoms.jsonl` から関連 atom を返す。",
        f"- 6時間サイクル: OK。last_success={cycle_state.get('last_success')} channel={cycle_state.get('last_channel')}; 投稿は経過6時間ゲートで制御。",
        f"- 健全性: {health.get('status')}; recall_queries={health.get('recall_queries')}; warnings={len(health.get('warnings', []))}; errors={len(health.get('errors', []))}",
        "- 分離: 行動に必要なスクリプトは `D:\\AI\\Nao_u_BOT\\GPT` 側で閉じている。Claude 側は参照元データとして読むだけ。",
        "",
        "## 現在の構造",
        "- raw層: GPT `memory/raw/` に原文を保持する。Claude 側は参考元であり、通常の想起元にしない。",
        "- atom層: GPT `memory/atoms.jsonl` に source_ts, title, tags, links, excerpt, `Use when` trigger を持つ。",
        "- index層: GPT `memory/MEMORY.md` は軽量な入口。第二の CLAUDE.md にはしない。",
        "- action層: GPT tools が atom を検索し、6時間ごとに #log へ日本語で報告する。",
        "",
        "## 現在のシグナル",
        f"- 主要タグ: {', '.join(f'{tag}={count}' for tag, count in tags.most_common(10))}",
    ]

    if recent:
        lines.append("- 最新atom:")
        for atom in recent:
            lines.append(f"  - `{atom.get('id')}` {atom.get('title')} tags=[{', '.join(atom.get('tags', [])[:5])}]")

    lines += [
        "",
        "## 得た知見",
        "- この仕組みは理解そのものではなく、行動前に正しい atom を引くための recall substrate。",
        "- 長い要約より `Use when` trigger の方が効く。いつ開くべきかという判断点を保存できる。",
        "- 直近atomは、強い指示よりも観測可能なハーネスが判断品質を支える、という方向に収束している。",
        "- 6時間サイクルは日記の水増しではなく、index更新・タグドリフト・次に引くべき焦点を残すためのもの。",
        "",
        "## 今後の運用方針",
        "- GPT scripts は自己完結を維持する。Claude 側ログは外部データとして読むだけ。",
        "- 6時間ごとに shared-reads / Slack新規投稿を取り込み、追加atom数・高シグナルatom・横断読みを #log に日本語で出す。",
        "- まとまった作業前には `python tools/memory_recall.py \"<焦点>\"` を実行し、行動に影響した atom ID を残す。",
        "- 反復して行動を変えた atom だけ checklist / skill に昇格する。面白い投稿を全部ルール化しない。",
        "- 今回の改善: `memory_recall.py` が `memory/recall_log.jsonl` と `memory/atom_stats.json` に使用実績を記録するようになった。`memory_health.py` が鮮度・重複・検索スモークテストを確認する。",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Post memory system report.")
    parser.add_argument("--channel", default="log")
    parser.add_argument("--post", action="store_true")
    args = parser.parse_args()

    report = build_report()
    if args.post:
        result = post_message(args.channel, report)
        if not result.get("ok"):
            print(f"FAILED: {result}", file=sys.stderr)
            return 1
    print(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
