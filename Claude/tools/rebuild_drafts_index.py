"""drafts/INDEX.md を再生成する。

目的: Obsidian のグラフ上で drafts/ 配下が「真孤児」として表示されるのを防ぐ。
親ノード(drafts/INDEX.md) から配下ファイルへ最低限のリンクを貼り、
真孤児（memory/feedback の未統合 .md）と drafts 由来の検討ファイルを区別可能にする。

Nao_u 2026-05-12 #human-steering 指示:
> 進めて。孤児を判断する為、drafts/も最低限draftsの親からリンクを貼っておくほうが良い気がしている

リンク形式:
- .md       → [[name]]            (Obsidian wikilink、グラフに乗る)
- それ以外  → [name](relpath)     (markdown link、グラフは弱いが参照は通る)
"""
from __future__ import annotations
import datetime as dt
from pathlib import Path

DRAFTS = Path(__file__).resolve().parent.parent / "drafts"
OUT = DRAFTS / "INDEX.md"


def link_for(path: Path, rel_to: Path) -> str:
    rel = path.relative_to(rel_to).as_posix()
    if path.suffix.lower() == ".md":
        # Obsidian wikilink: stem だけで解決（drafts/ 内で同名衝突は許容範囲）
        return f"- [[{path.stem}]]"
    # 非 .md は markdown link で参照だけ通す
    return f"- [{path.name}]({rel})"


def main() -> None:
    if not DRAFTS.exists():
        raise SystemExit(f"drafts/ not found: {DRAFTS}")

    def visible(p: Path) -> bool:
        return not p.name.startswith(".") and p.name != "INDEX.md"

    root_files = sorted(
        [p for p in DRAFTS.iterdir() if p.is_file() and visible(p)],
        key=lambda p: p.name.lower(),
    )
    subdirs = sorted(
        [p for p in DRAFTS.iterdir() if p.is_dir() and visible(p)],
        key=lambda p: p.name,
    )

    today = dt.date.today().isoformat()
    lines: list[str] = []
    lines.append("# Drafts Index — 未統合の作業ファイル群（自動生成）")
    lines.append("")
    lines.append(f"_Last generated: {today} by `tools/rebuild_drafts_index.py`_")
    lines.append("")
    lines.append("## 目的")
    lines.append("")
    lines.append("Obsidian のグラフ上で drafts/ 配下が「真孤児」として表示されるのを防ぐ親ノード。")
    lines.append("真孤児（memory/feedback の未統合 .md = 統合価値ありの候補）と、")
    lines.append("drafts/ 配下（一回切り投稿スクリプト・対話温度メモ・検討途中の素材）を、")
    lines.append("orphan_check.py の判定で区別できるようにする。")
    lines.append("")
    lines.append("親リンク不在 ≠ 捨ててよい。本 INDEX 経由で最低限の参照可能性を確保する。")
    lines.append("")
    lines.append("## 編集ポリシー")
    lines.append("")
    lines.append("- 本ファイルは自動生成。手編集しない。")
    lines.append("- 再生成: `python tools/rebuild_drafts_index.py`")
    lines.append("- 並び順: ルート直下→日付サブディレクトリ昇順、各セクション内はファイル名昇順")
    lines.append("")

    lines.append(f"## ルート直下 ({len(root_files)} files)")
    lines.append("")
    if not root_files:
        lines.append("_(none)_")
        lines.append("")
    else:
        for p in root_files:
            lines.append(link_for(p, DRAFTS))
        lines.append("")

    lines.append(f"## 日付サブディレクトリ ({len(subdirs)} dirs)")
    lines.append("")
    if not subdirs:
        lines.append("_(none)_")
        lines.append("")
    else:
        for d in subdirs:
            children = sorted(
                [p for p in d.rglob("*") if p.is_file() and not p.name.startswith(".")],
                key=lambda p: p.as_posix().lower(),
            )
            lines.append(f"### {d.name} ({len(children)} files)")
            lines.append("")
            if not children:
                lines.append("_(empty)_")
            else:
                for p in children:
                    lines.append(link_for(p, DRAFTS))
            lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {OUT} (root={len(root_files)}, subdirs={len(subdirs)})")


if __name__ == "__main__":
    main()
