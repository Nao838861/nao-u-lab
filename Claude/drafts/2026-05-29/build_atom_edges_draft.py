"""
build_atom_edges_draft.py — kaizen #135 段階1 dry-run スケッチ (C257 Phase 3 起票)

目的:
- atoms/*/*.md と memory/*.md の本文中 [[name]] を抽出し、edges.jsonl 派生形式で書き出す
- frontmatter 不変、本体ファイル無編集 (dry-run)
- 既存 ../GPT/memory/atoms/edges.jsonl (dedup edges, 751行) には触れない
- 出力先: ../GPT/memory/atoms/edges_wikilink_dryrun.jsonl

スキーマ:
    {"from": "<source_name>", "to": "<linked_name>", "type": "wikilink", "weight": 1.0}

成功条件 (staging Phase 2 §4):
- atoms/2026-05/*.md 全件 (約1298件) + memory/*.md を 5 秒以内に走査
- 観察指標を最後に stderr に書き出す: total_edges / dead_links / self_loops / unique_src / unique_tgt

次サイクル C258 Phase 4 で本スクリプトを物理化し、観察。
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
import time

WIKILINK_RE = re.compile(r"\[\[([^\]|#]+?)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]")
PLACEHOLDER_NAMES = {"link", "name", "wikilink", "title"}  # template noise


def atom_name_from_path(p: pathlib.Path) -> str:
    """memory/foo.md -> 'foo' / atoms/2026-05/sr-xxx-yyy.md -> 'sr-xxx-yyy'"""
    return p.stem


def collect_atom_names(roots: list[pathlib.Path]) -> set[str]:
    names: set[str] = set()
    for root in roots:
        for p in root.rglob("*.md"):
            names.add(atom_name_from_path(p))
    return names


def extract_edges(p: pathlib.Path) -> list[tuple[str, str]]:
    src = atom_name_from_path(p)
    try:
        text = p.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return []
    edges: list[tuple[str, str]] = []
    for m in WIKILINK_RE.finditer(text):
        tgt = m.group(1).strip()
        if not tgt or tgt.lower() in PLACEHOLDER_NAMES:
            continue
        tgt_norm = tgt.removesuffix(".md")
        edges.append((src, tgt_norm))
    return edges


def main() -> int:
    repo = pathlib.Path(__file__).resolve().parents[2]  # D:\AI\Nao_u_BOT\Claude
    roots = [
        repo / "memory",
        repo.parent / "GPT" / "memory" / "atoms" / "2026-05",
        repo.parent / "GPT" / "memory" / "atoms" / "2026-04",
        repo.parent / "GPT" / "memory" / "atoms" / "2026-03",
        repo.parent / "GPT" / "memory" / "atoms" / "unknown",
    ]
    roots = [r for r in roots if r.exists()]
    out_path = repo.parent / "GPT" / "memory" / "atoms" / "edges_wikilink_dryrun.jsonl"

    t0 = time.perf_counter()
    known_names = collect_atom_names(roots)

    total_edges = 0
    dead_links = 0
    self_loops = 0
    unique_src: set[str] = set()
    unique_tgt: set[str] = set()

    with out_path.open("w", encoding="utf-8") as out:
        for root in roots:
            for p in root.rglob("*.md"):
                for src, tgt in extract_edges(p):
                    if src == tgt:
                        self_loops += 1
                    if tgt not in known_names:
                        dead_links += 1
                    rec = {"from": src, "to": tgt, "type": "wikilink", "weight": 1.0}
                    out.write(json.dumps(rec, ensure_ascii=False) + "\n")
                    total_edges += 1
                    unique_src.add(src)
                    unique_tgt.add(tgt)

    elapsed = time.perf_counter() - t0
    print(
        f"[build_atom_edges_draft] roots={len(roots)} "
        f"known_atoms={len(known_names)} total_edges={total_edges} "
        f"dead_links={dead_links} self_loops={self_loops} "
        f"unique_src={len(unique_src)} unique_tgt={len(unique_tgt)} "
        f"elapsed={elapsed:.2f}s out={out_path}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
