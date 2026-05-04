"""CLAUDE.md (および追加対象) の `path/to/file.md` 形式 backtick パスを
Obsidian Graph view が認識する Markdown link 形式 `[path](path)` に変換する。

ルール:
- 対象は backtick で囲まれた、末尾が .md のパスのみ
- frontmatter / code fence (```...```) 内はスキップ
- 既にリンク化済 ([X](Y)) はスキップ
- wildcard (`*` 含む) はスキップ
- リポジトリ root から見て実在しないファイルはスキップ
- 自己参照 (CLAUDE.md→CLAUDE.md) は許容 (Obsidian はノード自身も扱う)

ChatGPT 起点 (2026-05-05): 「backtickで囲まれた .md パスのうち、実在ファイルを標準Markdownリンクに置換する」
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "CLAUDE.md",
    ROOT / "memory" / "MEMORY.md",
    ROOT / "memory" / "operational_index.md",
    ROOT / "memory" / "game_dev_index.md",
    ROOT / "memory" / "references_external_index.md",
    ROOT / "memory" / "tweets_index.md",
    ROOT / "memory" / "feedback_index.md",
    ROOT / "memory" / "reflections_index.md",
]

# `path/to/foo.md` 形式 backtick パターン (wildcard 含むものは除外する側で判定)
BACKTICK_MD_PAT = re.compile(r"`([^`\n]+\.md)`")


def file_exists(rel_path: str, base_dir: Path) -> bool:
    """base_dir 起点 → ダメなら ROOT 起点で実在判定。

    CLAUDE.md は ROOT 直下なので両者一致。memory/MEMORY.md のように
    サブディレクトリ内のファイルから同ディレクトリのファイルを backtick
    参照している場合、base_dir 起点で当てる必要がある。
    """
    if (base_dir / rel_path).is_file():
        return True
    if (ROOT / rel_path).is_file():
        return True
    return False


def has_wildcard(s: str) -> bool:
    return "*" in s or "?" in s


def process_file(path: Path) -> tuple[int, list[str], list[str]]:
    text = path.read_text(encoding="utf-8")
    lines = text.split("\n")
    base_dir = path.parent

    # frontmatter 範囲
    fm_end = 0
    if lines and lines[0].strip() == "---":
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                fm_end = i + 1
                break

    in_fence = False
    out_lines: list[str] = []
    changes: list[str] = []
    skipped: list[str] = []

    for idx, line in enumerate(lines):
        if idx < fm_end:
            out_lines.append(line)
            continue
        stripped = line.lstrip()
        if stripped.startswith("```"):
            in_fence = not in_fence
            out_lines.append(line)
            continue
        if in_fence:
            out_lines.append(line)
            continue

        # backtick md パスを順に処理。1行に複数あってもOK
        new_parts: list[str] = []
        cursor = 0
        for m in BACKTICK_MD_PAT.finditer(line):
            rel = m.group(1).strip()
            if has_wildcard(rel):
                skipped.append(f"L{idx+1} wildcard: {rel}")
                continue
            if not file_exists(rel, base_dir):
                skipped.append(f"L{idx+1} missing: {rel}")
                continue
            # 既にリンク化されているか? (まれだが) ](`X`) のような形は通常ありえないので素直に置換
            new_parts.append(line[cursor:m.start()])
            # 表示名はファイル名のみ (Mir 採用スタイル, 2026-05-05 commit 98ea3d75cc9)。
            # `[stem.md](dir/stem.md)` 形式は読みやすく Obsidian Graph view にも認識される。
            display = Path(rel).name
            new_parts.append(f"[{display}]({rel})")
            cursor = m.end()
            changes.append(f"L{idx+1}: {rel}")
        new_parts.append(line[cursor:])
        out_lines.append("".join(new_parts))

    new_text = "\n".join(out_lines)
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
    return len(changes), changes, skipped


def main():
    total = 0
    for p in TARGETS:
        if not p.is_file():
            print(f"[skip] {p} not found")
            continue
        n, changes, skipped = process_file(p)
        rel = p.relative_to(ROOT)
        print(f"\n=== {rel}: {n} replacements ===")
        for c in changes:
            print(f"  ✓ {c}")
        if skipped:
            print(f"  --- skipped ({len(skipped)}) ---")
            for s in skipped:
                print(f"    × {s}")
        total += n
    print(f"\nTotal: {total} replacements")


if __name__ == "__main__":
    main()
