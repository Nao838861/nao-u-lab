#!/usr/bin/env python3
"""
probe_atom_quality.py — atom 品質の機械的score 算出 (PCGRLLM Q3 結論実装)

3指標を atom ファイル群に対し算出し、閾値違反を WARN として stderr に出力する。
LLM呼出層は枠だけ用意 (現サイクルは機械score算出+WARN出力までを実装)。

指標:
  format_missing_score (0/1): frontmatter or "## Use when" or "## Excerpt" 欠落判定
  atom_reference_count (int): 当該 atom id が他 atom 本文から参照されている数
  next_action_proposed (0/1): 次サイクルの具体的アクション言及あり/なし
    (atom種別: gr-/sr- は外部フィードバック原文のため対象外、それ以外を判定対象)

出自: 2026-05-17 C198 #all-nao-u-lab ts=1778969177 (Log → Log_cdx Q3 結論)
"""
import argparse, re, sys, os
from pathlib import Path

NEXT_ACTION_PATTERNS = [
    r"次サイクル", r"次回", r"次にやる", r"次の?手",
    r"TODO[: ：]", r"FIXME[: ：]", r"^\s*-?\s*\[ \]",
    r"着手", r"実装する", r"これから", r"今後",
]
NEXT_ACTION_RE = re.compile("|".join(NEXT_ACTION_PATTERNS), re.MULTILINE)
ID_RE = re.compile(r"^id:\s*(\S+)", re.MULTILINE)
EXTERNAL_RAW_PREFIXES = ("gr-", "sr-", "an-")  # game-rights/shared-reads/all-nao-u-lab 原文


def score_atom(path: Path, all_text: str | None = None) -> dict:
    text = path.read_text(encoding="utf-8", errors="replace")
    fm_ok = text.startswith("---\n") and "\n---\n" in text  # supersedes-list 長大atom対応
    use_when_ok = "## Use when" in text
    excerpt_ok = "## Excerpt" in text
    format_missing = 0 if (fm_ok and use_when_ok and excerpt_ok) else 1

    m = ID_RE.search(text)
    atom_id = m.group(1) if m else path.stem
    ref_count = (all_text.count(atom_id) - 1) if all_text else 0  # 自己参照1件を差し引く

    is_external_raw = any(path.name.startswith(p) for p in EXTERNAL_RAW_PREFIXES)
    next_action = 0 if is_external_raw else (1 if NEXT_ACTION_RE.search(text) else 0)

    return {"id": atom_id, "path": str(path), "format_missing": format_missing,
            "ref_count": ref_count, "next_action": next_action,
            "is_external_raw": is_external_raw}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default="../GPT/memory/atoms/2026-05",
                    help="atom directory (default: ../GPT/memory/atoms/2026-05)")
    ap.add_argument("--ref-min", type=int, default=1,
                    help="atom_reference_count 下限 (default: 1, 内部 atom のみ判定)")
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()

    root = Path(args.root)
    if not root.is_dir():
        print(f"[probe_atom_quality] root not found: {root}", file=sys.stderr)
        return 2

    paths = sorted(root.glob("*.md"))
    all_text = "\n".join(p.read_text(encoding="utf-8", errors="replace") for p in paths)

    warn_format, warn_ref, warn_action = [], [], []
    for p in paths:
        r = score_atom(p, all_text)
        if r["format_missing"]:
            warn_format.append(r)
        if not r["is_external_raw"] and r["ref_count"] < args.ref_min:
            warn_ref.append(r)
        if not r["is_external_raw"] and r["next_action"] == 0:
            warn_action.append(r)

    total = len(paths)
    print(f"[probe_atom_quality] root={root} total={total} "
          f"format_warn={len(warn_format)} ref_warn={len(warn_ref)} "
          f"action_warn={len(warn_action)}", file=sys.stderr)

    if args.verbose:
        for r in warn_format[:5]:
            print(f"[FORMAT WARN] {r['path']}", file=sys.stderr)
        for r in warn_ref[:5]:
            print(f"[REF WARN] {r['path']} (refs={r['ref_count']})", file=sys.stderr)
        for r in warn_action[:5]:
            print(f"[ACTION WARN] {r['path']}", file=sys.stderr)

    return 1 if (warn_format or warn_ref or warn_action) else 0


if __name__ == "__main__":
    sys.exit(main())
