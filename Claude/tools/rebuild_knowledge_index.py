"""knowledge/INDEX.md の「## 統計」「## 記事一覧」を自動再生成する。

knowledge/*.md の frontmatter (`- key: value` 形式) と本文先頭 (`# タイトル`)
から metadata を抽出し、ID/タイトル/著者/日付/タグ/概念ノードの6列テーブルを生成。
「## タグ別索引」「## 接続マップ」は手動温度の節として保持する。

usage:
    python tools/rebuild_knowledge_index.py --dry-run [--dry-run-out PATH]
    python tools/rebuild_knowledge_index.py --write
"""
from __future__ import annotations
import argparse
import datetime as dt
import difflib
import re
from pathlib import Path

KNOWLEDGE_DIR = Path(__file__).resolve().parent.parent / "knowledge"
INDEX_FILE = KNOWLEDGE_DIR / "INDEX.md"


def _parse_list(value: str) -> list[str]:
    value = value.strip()
    if value.startswith("[") and value.endswith("]"):
        value = value[1:-1]
    return [x.strip() for x in value.split(",") if x.strip()]


def _extract_metadata(path: Path) -> dict:
    meta = {"id": path.stem, "title": "", "author": "", "date": "",
            "tags": [], "concept_nodes": []}
    m = re.match(r"^(\d{4})(\d{2})(\d{2})_", path.stem)
    if m:
        meta["date"] = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except Exception:
        return meta
    for i, line in enumerate(lines[:40]):
        if i == 0 and line.startswith("# "):
            meta["title"] = line[2:].strip()
            continue
        fm = re.match(r"^\s*-\s*(\w+):\s*(.*)$", line)
        if not fm:
            continue
        key, value = fm.group(1).lower(), fm.group(2).strip()
        if key == "author":
            meta["author"] = value
        elif key in ("discovered", "date"):
            dm = re.match(r"^(\d{4}-\d{2}-\d{2})", value)
            if dm:
                meta["date"] = dm.group(1)
        elif key == "tags":
            meta["tags"] = _parse_list(value)
        elif key == "concept_nodes":
            meta["concept_nodes"] = _parse_list(value)
    return meta


def _generate_index_section(metas: list[dict], today: str) -> list[str]:
    lines = ["## 統計",
             f"- 総記事数: {len(metas)}",
             f"- 最終更新: {today} (自動生成 by `tools/rebuild_knowledge_index.py`)",
             "- 同期方針: knowledge/*.md 追加・編集後に `python tools/rebuild_knowledge_index.py --write` を実行",
             "",
             "## 記事一覧",
             "",
             "| ID | タイトル | 著者 | 日付 | タグ | 概念ノード |",
             "|---|---|---|---|---|---|"]
    metas_sorted = sorted(metas, key=lambda m: (m["date"], m["id"]), reverse=True)
    for m in metas_sorted:
        title = m["title"].replace("|", "\\|")
        author = m["author"].replace("|", "\\|")
        tags = ", ".join(m["tags"])
        nodes = ", ".join(m["concept_nodes"])
        lines.append(f"| {m['id']} | {title} | {author} | {m['date']} | {tags} | {nodes} |")
    lines.append("")
    return lines


def _replace_sections(content: str, new_lines: list[str]) -> str:
    lines = content.splitlines()
    start = end = None
    for i, line in enumerate(lines):
        s = line.strip()
        if s == "## 統計" and start is None:
            start = i
        elif s == "## タグ別索引" and start is not None:
            end = i
            break
    if start is None or end is None:
        raise SystemExit("既存 INDEX.md に `## 統計` または `## タグ別索引` が見つからない")
    merged = lines[:start] + new_lines + lines[end:]
    tail = "\n" if content.endswith("\n") else ""
    return "\n".join(merged) + tail


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--dry-run-out", default=None)
    args = ap.parse_args()
    if not args.dry_run and not args.write:
        ap.error("--dry-run か --write のいずれかを指定")

    files = sorted([p for p in KNOWLEDGE_DIR.glob("*.md") if p.name != "INDEX.md"],
                   key=lambda p: p.name)
    metas = [_extract_metadata(p) for p in files]
    today = dt.date.today().isoformat()
    new_section = _generate_index_section(metas, today)

    old_content = INDEX_FILE.read_text(encoding="utf-8") if INDEX_FILE.exists() else ""
    new_content = _replace_sections(old_content, new_section)

    if args.write:
        INDEX_FILE.write_text(new_content, encoding="utf-8")
        print(f"wrote {INDEX_FILE} (articles={len(metas)})")
        return

    diff = list(difflib.unified_diff(
        old_content.splitlines(keepends=True),
        new_content.splitlines(keepends=True),
        fromfile="INDEX.md (current)", tofile="INDEX.md (regenerated)", n=2,
    ))
    header = (f"# rebuild_knowledge_index.py dry-run\n"
              f"# generated: {today}\n"
              f"# total articles: {len(metas)}\n"
              f"# diff lines: {len(diff)}\n\n")
    if args.dry_run_out:
        Path(args.dry_run_out).write_text(header + "".join(diff), encoding="utf-8")
        print(f"wrote dry-run to {args.dry_run_out} (diff_lines={len(diff)})")
    else:
        print(header + "".join(diff)[:2000])


if __name__ == "__main__":
    main()
