#!/usr/bin/env python3
"""
build_atom_edges.py — atom 本体非破壊で edges.jsonl 派生生成 (kaizen #135 段階1)

Semantic vs Ontology 議論 (C243 Phase 2) で出した「書き込み時に分けない、
読み出し時に分ける」原則の最初の実装ピース。atom frontmatter を rewrite せず、
派生ファイル edges.jsonl を生成する。

edge 種別:
  - strong (frontmatter 由来):
      superseded_by → forward (此 atom が canonical 化済、辿るべき先)
      supersedes    → reverse (此 atom が canonical、過去版が指す元)
      derived_from  → 派生元 (任意)
      related       → 関連 (任意)
      canonical_id  → group の代表 (重複群識別)
  - semantic (frontmatter `tags:` 共有由来, kaizen #135 段階3 T1):
      tag_share → 同一 tag を共有する atom 間 (双方向)
  - weak (本文 [[wikilink]] 由来):
      wikilink_body → atom_id らしき形 (id-style) ならその id を target、
                      ファイル名らしければ basename を target

使い方:
  python tools/build_atom_edges.py --root <atoms_dir> --dry-run
  python tools/build_atom_edges.py --root <atoms_dir> --output edges.jsonl
"""
from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path

FRONT_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
ID_LIKE_RE = re.compile(r"^[a-z]{2}-\d+-[0-9a-f]+$")
LIST_KEYS = {"supersedes", "derived_from", "related"}
SCALAR_KEYS = {"superseded_by", "canonical_id", "group_id"}


def parse_frontmatter(text: str) -> tuple[dict, str]:
    m = FRONT_RE.match(text)
    if not m:
        return {}, text
    fm_raw, body = m.group(1), text[m.end():]
    fm: dict = {}
    current_key = None
    for line in fm_raw.splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        if line.startswith(" ") and current_key in LIST_KEYS:
            v = line.strip().lstrip("-").strip().strip('"').strip("'")
            if v:
                fm.setdefault(current_key, []).append(v)
            continue
        if ":" not in line:
            continue
        key, _, val = line.partition(":")
        key = key.strip()
        val = val.strip()
        current_key = key
        if val.startswith("[") and val.endswith("]"):
            items = [x.strip().strip('"').strip("'") for x in val[1:-1].split(",") if x.strip()]
            fm[key] = items
        elif val:
            fm[key] = val.strip('"').strip("'")
        else:
            fm[key] = []
    return fm, body


def emit(edges: list, src: str, tgt: str, etype: str, strength: str) -> None:
    edges.append({"src": src, "tgt": tgt, "type": etype, "strength": strength})


def extract_edges(path: Path, edges: list, tag_index: dict) -> None:
    text = path.read_text(encoding="utf-8", errors="replace")
    fm, body = parse_frontmatter(text)
    src = fm.get("id") or path.stem
    for key in SCALAR_KEYS:
        v = fm.get(key)
        if isinstance(v, str) and v and v != src:
            emit(edges, src, v, key, "strong")
    for key in LIST_KEYS:
        for v in fm.get(key, []) or []:
            if v and v != src:
                emit(edges, src, v, key, "strong")
    tags = fm.get("tags") or []
    if isinstance(tags, list):
        for tag in tags:
            if tag:
                tag_index.setdefault(tag, []).append(src)
    for m in WIKILINK_RE.finditer(body):
        raw = m.group(1).split("|")[0].strip()
        tgt = raw.removesuffix(".md")
        if tgt and tgt != src:
            etype = "wikilink_strong" if ID_LIKE_RE.match(tgt) else "wikilink_weak"
            emit(edges, src, tgt, etype, "weak")


def emit_tag_share(edges: list, tag_index: dict, max_cluster: int) -> int:
    """tag_index から同タグ共有 atom 間に tag_share edge を双方向で派生。

    max_cluster 超のタグはノイズ抑制のため skip (汎用 tag による edge 爆発防止)。
    実装は双方向 emit (= recall_atom.py 側で双方向走査済なので src→tgt 一方向のみ emit)。
    重複防止のため (src, tgt) 順序 sort で唯一性確保。
    """
    emitted = 0
    skipped_tags: list[tuple[str, int]] = []
    for tag, atoms in tag_index.items():
        if len(atoms) > max_cluster:
            skipped_tags.append((tag, len(atoms)))
            continue
        uniq = sorted(set(atoms))
        for i, a in enumerate(uniq):
            for b in uniq[i + 1:]:
                emit(edges, a, b, "tag_share", "semantic")
                emitted += 1
    if skipped_tags:
        sys.stderr.write(
            f"[build_atom_edges tag_share] skipped {len(skipped_tags)} tags "
            f"with cluster > {max_cluster} (top: "
            f"{sorted(skipped_tags, key=lambda x: -x[1])[:5]})\n"
        )
    return emitted


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", required=True)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--output", default=None,
                    help="output path (default: <root>/../edges.jsonl — matches recall_atom.py)")
    ap.add_argument("--recursive", action="store_true",
                    help="recurse into subdirs (e.g. <root>/2026-03/*.md). default: top-level only")
    ap.add_argument("--max-tag-cluster", type=int, default=50,
                    help="skip tag_share for tags shared by > N atoms (noise suppression)")
    args = ap.parse_args()
    root = Path(args.root)
    output_path = Path(args.output) if args.output else root.parent / "edges.jsonl"
    glob_pattern = "**/*.md" if args.recursive else "*.md"
    files = sorted(root.glob(glob_pattern))
    edges: list = []
    tag_index: dict = {}
    for p in files:
        extract_edges(p, edges, tag_index)
    tag_share_count = emit_tag_share(edges, tag_index, args.max_tag_cluster)
    by_type: dict = {}
    for e in edges:
        by_type[e["type"]] = by_type.get(e["type"], 0) + 1
    wls = by_type.get("wikilink_strong", 0)
    wlw = by_type.get("wikilink_weak", 0)
    sup = by_type.get("superseded_by", 0) + by_type.get("supersedes", 0)
    sys.stderr.write(
        f"[build_atom_edges {'dry-run' if args.dry_run else 'write'}] "
        f"root={args.root} atoms={len(files)} wikilink_strong={wls} "
        f"wikilink_weak={wlw} supersedes_chain={sup} "
        f"tag_share={tag_share_count} total_edges={len(edges)}\n"
    )
    density_limit = len(files) * 5
    if len(edges) > density_limit:
        sys.stderr.write(
            f"[build_atom_edges WARN] edge density {len(edges)}>{density_limit} "
            f"(atoms*5 上限超過、誤抽出 or 想定外集中の疑い)\n"
        )
    if args.dry_run:
        for e in edges[:5]:
            print(json.dumps(e, ensure_ascii=False))
        return 0
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        "\n".join(json.dumps(e, ensure_ascii=False) for e in edges) + "\n",
        encoding="utf-8",
    )
    sys.stderr.write(f"[build_atom_edges] wrote {len(edges)} edges → {output_path}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
