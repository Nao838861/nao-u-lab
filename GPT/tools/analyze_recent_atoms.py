#!/usr/bin/env python3
"""
Generate a detailed analysis of recent Codex memory atoms and optionally post it.
"""
from __future__ import annotations

import argparse
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any

from atoms_fileformat import load_atoms_with_view
from slack_client import post_message


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
ATOMS_PATH = MEMORY_DIR / "atoms.jsonl"
ATOMS_DIR = MEMORY_DIR / "atoms"


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def load_atoms() -> list[dict[str, Any]]:
    return load_atoms_with_view(ATOMS_PATH, ATOMS_DIR, view="canonical")


def recent_atoms(limit: int) -> list[dict[str, Any]]:
    return sorted(load_atoms(), key=lambda a: str(a.get("datetime", "")), reverse=True)[:limit]


def short(text: str, limit: int) -> str:
    text = " ".join(str(text).split())
    return text[:limit]


def detect_cross_cutting(atoms: list[dict[str, Any]]) -> list[str]:
    tags = Counter(tag for atom in atoms for tag in atom.get("tags", []))
    points: list[str] = []
    if tags.get("harness", 0) >= 2:
        points.append("観測装置/ハーネスが共通軸。判断の品質を『気合い』ではなく、外側の計測・校正・ログで支える方向に寄っている。")
    if tags.get("game-design", 0) >= 2:
        points.append("ゲーム設計の話に見えるが、実際は評価軸の固定、厚み層、プレイヤープロファイルといった制作判断の土台が主題になっている。")
    if tags.get("memory", 0) >= 2:
        points.append("記憶 atom としては、単発知識よりも『次に設計へ戻すための発動条件』が重要。recent 3件はすべて次の自己判定・記憶設計に接続できる。")
    if tags.get("operation", 0) or tags.get("agent", 0):
        points.append("運用・agent 軸では、装置をどこに置くか、何を不可視化してしまうかが焦点。便利な自動化ほど観測可能性を別途設計する必要がある。")
    return points


def build_message(limit: int) -> str:
    atoms = recent_atoms(limit)
    if not atoms:
        return "[Codex] recent atoms analysis: atoms not found."

    tag_counts = Counter(tag for atom in atoms for tag in atom.get("tags", []))
    lines = [
        "[Codex] recent atoms detailed analysis",
        f"- time: {datetime.now().isoformat(timespec='seconds')}",
        f"- scope: latest {len(atoms)} atoms from GPT memory canonical view",
        f"- dominant tags: {', '.join(f'{tag}={count}' for tag, count in tag_counts.most_common(8))}",
        "",
        "## Atom-by-atom",
    ]

    for i, atom in enumerate(atoms, 1):
        tags = ", ".join(atom.get("tags", [])[:8])
        kinds = "/".join(atom.get("kind", []))
        links = atom.get("links", [])
        lines += [
            f"{i}. `{atom.get('id')}` {atom.get('title')}",
            f"   - kind/tags: {kinds}; {tags}",
            f"   - what it preserves: {short(atom.get('excerpt', ''), 260)}",
            f"   - why it matters: {short(atom.get('trigger', ''), 220)}",
        ]
        if links:
            lines.append(f"   - anchors: {', '.join(links[:3])}")

    lines += ["", "## Cross-cutting read"]
    for point in detect_cross_cutting(atoms):
        lines.append(f"- {point}")

    lines += [
        "",
        "## Operational implication",
        "- recent atoms を単に一覧表示するだけだと弱い。6h cycle では、タグ分布と cross-cutting read を出し、次に `memory_recall.py` で引くべき焦点語を残す形がよい。",
        "- 今回の焦点語候補: `プレイヤープロファイル 評価軸`, `倒立本能メカニクス 厚み層`, `ハーネス パス仮想化 観測可能性`。",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Analyze recent memory atoms.")
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
