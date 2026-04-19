#!/usr/bin/env python3
"""MEMORY.md のインデックスリンクと実体ファイルの整合性チェック。

MEMORY.md に `[name](path)` 形式で書かれたリンク先が実在するかを確認する。
欠損が見つかれば exit code 1 で終了、存在すれば 0。

出自: 2026-04-19 Log C79 Phase 3。feedback_solution_space_rollback.md がMEMORY.md
に記載されているのに実体が無いことを発見 → 原理5「自分の記憶を自分で守り育てる」
直接適用として、同種の欠損を自動検知する。
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

AUTO_MEMORY = Path(r"C:/Users/owner/.claude/projects/D--AI-Nao-u-BOT/memory")
REPO_MEMORY = Path(r"D:/AI/Nao_u_BOT/memory")
REPO_ROOT = Path(r"D:/AI/Nao_u_BOT")
MEMORY_INDEX = AUTO_MEMORY / "MEMORY.md"

LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def resolve_candidates(link: str) -> list[Path] | None:
    """リンク文字列からファイルパスの候補を返す。解決不能/外部なら None。

    memory/ 配下の相対パスは auto-memory と repo-memory の両方に存在しうる。
    どちらかで見つかれば OK と見なす（両ミラー規約）。
    """
    if link.startswith(("http://", "https://", "mailto:")):
        return None
    link = link.split("#", 1)[0].split("?", 1)[0]
    if not link:
        return None
    if link.startswith("../../"):
        return [(REPO_ROOT / link[len("../../"):]).resolve()]
    if link.startswith("../"):
        return [(AUTO_MEMORY / link).resolve(), (REPO_MEMORY / link).resolve()]
    return [(AUTO_MEMORY / link).resolve(), (REPO_MEMORY / link).resolve()]


def main() -> int:
    if not MEMORY_INDEX.exists():
        print(f"NG: index not found: {MEMORY_INDEX}")
        return 2
    text = MEMORY_INDEX.read_text(encoding="utf-8")
    missing: list[tuple[str, str]] = []
    only_one_side: list[tuple[str, str, str]] = []
    ok_both = 0
    skipped = 0
    for name, link in LINK_RE.findall(text):
        candidates = resolve_candidates(link)
        if candidates is None:
            skipped += 1
            continue
        existing = [p for p in candidates if p.exists()]
        if not existing:
            missing.append((name, link))
        elif len(candidates) == 2 and len(existing) == 1:
            side = "auto" if "projects" in str(existing[0]).replace("\\", "/") else "repo"
            only_one_side.append((name, link, side))
            ok_both += 1
        else:
            ok_both += 1
    total = ok_both + len(missing)
    print(f"MEMORY.md index integrity: {ok_both}/{total} resolved (skipped {skipped} external)")
    if only_one_side:
        print(f"\nONE-SIDE only ({len(only_one_side)} — present in one mirror, absent in the other):")
        for name, link, side in only_one_side:
            print(f"  [{side}] [{name}]({link})")
    if missing:
        print(f"\nMISSING ({len(missing)} — absent in both mirrors):")
        for name, link in missing:
            print(f"  - [{name}]({link})")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
