#!/usr/bin/env python3
"""
external_notes_log.md の統合マーカー監査。

Phase 1 で "未統合 44件" と誤認した原因: 親ヘッダ(## 日付バッチ) に
集約マーカーがない section を、サブ項目単位でも未統合として重複計上。

本スクリプトは次を分離してカウントする:
  - parent sections: 親ヘッダ(## ...) 単位。サブ項目が全て統合済なら GREEN
  - subsections:     サブ項目(### ...) 単位。これが一次真実

使い方:
  python tools/external_notes_integration_audit.py [path]
    path 省略時は memory/external_notes_log.md。

出力 (非ゼロ exit = 未統合サブ項目あり):
  - GREEN/AMBER 合計
  - 未統合サブ項目一覧（行番号付き）
  - 親ヘッダにマーカーなし・全サブ統合済のセクション一覧（低優先タスク）
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

MARKER = re.compile(r"\[(?:統合済|済\s)")
H2 = re.compile(r"^## (?!.*#).+")
H3 = re.compile(r"^### .+")


def audit(path: Path) -> int:
    lines = path.read_text(encoding="utf-8").splitlines()

    sections: list[dict] = []
    current_parent: dict | None = None
    current_sub: dict | None = None

    def close_sub():
        nonlocal current_sub
        if current_sub is not None and current_parent is not None:
            current_parent["subs"].append(current_sub)
            current_sub = None

    def close_parent():
        nonlocal current_parent
        close_sub()
        if current_parent is not None:
            sections.append(current_parent)
            current_parent = None

    for i, line in enumerate(lines, 1):
        if line.startswith("## ") and not line.startswith("### "):
            close_parent()
            current_parent = {
                "line": i,
                "title": line[3:].strip(),
                "header_has_marker": bool(MARKER.search(line)),
                "body_has_marker": False,
                "subs": [],
            }
        elif line.startswith("### "):
            close_sub()
            if current_parent is None:
                continue
            current_sub = {
                "line": i,
                "title": line[4:].strip(),
                "header_has_marker": bool(MARKER.search(line)),
                "body_has_marker": False,
            }
        else:
            if current_sub is not None:
                if MARKER.search(line):
                    current_sub["body_has_marker"] = True
            elif current_parent is not None:
                if MARKER.search(line):
                    current_parent["body_has_marker"] = True

    close_parent()

    unresolved_subs: list[tuple[int, str, str]] = []
    parent_only_missing: list[tuple[int, str]] = []
    total_subs = 0
    resolved_subs = 0

    for sec in sections:
        # 親ヘッダ(## 日付バッチ)にマーカーがある = そのバッチ全体を一括統合した宣言。
        # この場合、個別サブ項目のマーカー有無は関係なくバッチ統合でカバー済みと扱う。
        parent_marked = sec["header_has_marker"] or sec["body_has_marker"]
        sub_individual_marks = []
        for sub in sec["subs"]:
            total_subs += 1
            sub_marked = sub["header_has_marker"] or sub["body_has_marker"]
            sub_individual_marks.append(sub_marked)
            if sub_marked or parent_marked:
                resolved_subs += 1
            else:
                unresolved_subs.append((sub["line"], sec["title"], sub["title"]))
        # 「親のみマーク欠」= 全サブが個別マーカーで解決済・親ヘッダに集約マーカーが欠落
        # → サマリ追記すれば Phase 1 走査の false positive を抑えられる低優先タスク
        if sec["subs"] and all(sub_individual_marks) and not parent_marked:
            parent_only_missing.append((sec["line"], sec["title"]))

    print(f"=== external_notes_log.md 統合マーカー監査 ({path}) ===")
    print(f"親セクション数: {len(sections)}")
    print(f"サブ項目総数:   {total_subs}")
    print(f"サブ統合済:     {resolved_subs} ({resolved_subs * 100 // max(total_subs, 1)}%)")
    print(f"サブ未統合:     {len(unresolved_subs)}")
    print(f"親のみ未マーク: {len(parent_only_missing)} (全サブ統合済・親集約マーカー欠)")
    print()
    if unresolved_subs:
        print("--- 未統合サブ項目（一次真実・要対応） ---")
        for line, parent, title in unresolved_subs:
            print(f"  L{line:<5}  [{parent[:30]}] {title}")
        print()
    if parent_only_missing:
        print("--- 親のみマーク欠（低優先: サマリ追記で false positive を防ぐ） ---")
        for line, title in parent_only_missing:
            print(f"  L{line:<5}  {title}")
    return 0 if not unresolved_subs else 1


def main() -> int:
    default = Path(__file__).resolve().parents[1] / "memory" / "external_notes_log.md"
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else default
    if not target.exists():
        print(f"file not found: {target}", file=sys.stderr)
        return 2
    return audit(target)


if __name__ == "__main__":
    sys.exit(main())
