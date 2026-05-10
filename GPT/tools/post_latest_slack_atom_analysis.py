#!/usr/bin/env python3
"""Post a Japanese analysis of the latest Slack-ingested memory atoms."""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

from slack_client import post_message


ROOT = Path(__file__).resolve().parents[1]
ATOMS_PATH = ROOT / "memory" / "atoms.jsonl"


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def load_atoms() -> list[dict[str, Any]]:
    atoms: list[dict[str, Any]] = []
    with ATOMS_PATH.open("r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                atoms.append(json.loads(line))
    return atoms


def latest_slack_atoms(limit: int) -> list[dict[str, Any]]:
    atoms = [a for a in load_atoms() if str(a.get("source", "")).startswith("slack_api/")]
    return sorted(atoms, key=lambda a: (-int(a.get("score", 0)), str(a.get("datetime", ""))))[:limit]


def build_message(limit: int) -> str:
    atoms = latest_slack_atoms(limit)
    lines = [
        "[Codex] Slack新規投稿チェックからの記憶化レポート",
        f"- 時刻: {datetime.now().isoformat(timespec='seconds')}",
        f"- 対象: GPT側 `slack_memory_ingest.py` で記憶化した直近高スコアatom {len(atoms)}件",
        "",
        "## 見えている収束",
        "- 新規投稿群は、単なる外部記事紹介よりも『surface と substrate の乖離』『記憶戦略の固定化』『運用レイアウトの観測可能性』に寄っている。",
        "- 今のGPT記憶システムにとって重要なのは、情報を増やすことではなく、後で行動前に引ける発動条件へ変換すること。",
        "- 特に `substate vs surface` と `Modular Memory` は、この記憶システム自身の設計批判として読むべき。",
        "",
        "## 注目atom",
    ]
    for atom in atoms:
        tags = ", ".join(atom.get("tags", [])[:8])
        lines += [
            f"- `{atom.get('id')}` {atom.get('title')}",
            f"  - tags: {tags}",
            f"  - 何が重要か: {atom.get('trigger')}",
        ]
        title = atom.get("title", "")
        if "substrate" in title or "surface" in title:
            lines.append("  - 分析: 生成物や投稿量という surface が増えても、判断力や設計眼という substrate は自動では育たない。6時間サイクルも投稿数ではなく、次回の行動を変えた atom 数で見るべき。")
        elif "Modular Memory" in title:
            lines.append("  - 分析: 我々は記憶戦略を外部設計で持っているが、体験から記憶戦略自体を更新する閉路がまだ弱い。今後は atom の利用実績を状態として残す必要がある。")
        elif "フォルダ階層" in title:
            lines.append("  - 分析: レイアウト統一は記憶検索の前提条件。パスの安定は想起の安定であり、source_ts とファイルパスを混ぜない設計にも効く。")
        else:
            lines.append("  - 分析: 今は詳細化より、次にどの作業で引くべきかを明示して atom の発火条件を太くする段階。")

    lines += [
        "",
        "## 今後の運用方針",
        "- 6時間サイクルは実行前に Slack API で `shared-reads` と `all-nao-u-lab` の新規投稿を確認する。",
        "- 有用投稿は GPT 側 `memory/atoms.jsonl` に保存し、raw はSlack側に置いたまま `source_ts` で戻れるようにする。",
        "- #log 投稿は日本語で、単なる一覧ではなく『どの判断に効くか』まで書く。",
        "- 次の改善は、atom が実際に `memory_recall.py` で使われた回数を記録すること。記憶の価値を保存数ではなく使用実績で見る。",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Post latest Slack-ingested atom analysis.")
    parser.add_argument("--limit", type=int, default=3)
    parser.add_argument("--channel", default="log")
    parser.add_argument("--post", action="store_true")
    args = parser.parse_args()

    message = build_message(args.limit)
    if args.post:
        result = post_message(args.channel, message)
        if not result.get("ok"):
            print(f"FAILED: {result}", file=sys.stderr)
            return 1
    print(message)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
