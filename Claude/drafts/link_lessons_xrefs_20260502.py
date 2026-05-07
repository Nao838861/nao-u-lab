"""memory/lessons/*.md 本文内の M-XX/L-XX/S-XX/D-XX/X-XX 言及を
`[M-22](M-22.md)` 形式の相対リンクに変換するワンショットスクリプト。

ルール:
- frontmatter (先頭 --- ... ---) 内は変換しない
- code fence (``` ... ```) 内は変換しない
- 既にリンク化済み (前が `[` または直後が `]` の文字) は変換しない
- ### heading 行（自IDのセクション見出し）は変換しない
- 自分自身のID（ファイル名と一致するID）は変換しない
- 各ファイル内、同一IDの**最初の出現のみ**リンク化（ノイズ抑制）
- リンク先ファイルが存在しない ID（M-99 等）はスキップ
- M-37 と M-37b を区別する（正規表現で末尾アルファベット1文字を許容）
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LESS = ROOT / "memory" / "lessons"

# 対象IDパターン: M-37 / M-37b / L-01 / S-01 / D-01 / X-01
ID_PAT = re.compile(r"(?<![A-Za-z0-9])([MLSDX]-\d+[a-z]?)(?![A-Za-z0-9])")

existing_ids = {p.stem for p in LESS.glob("*.md") if not p.stem.startswith("_")}
print(f"Found {len(existing_ids)} existing lesson IDs")

def is_already_linked(line: str, start: int, end: int) -> bool:
    """マッチ位置が既に [...](...) リンク内かどうか判定。
    - 直前が `[` → リンクテキスト [M-22] 内
    - 直前が `](` → リンクURL ](M-22.md) 内
    """
    if start >= 1 and line[start - 1] == "[":
        return True
    if start >= 2 and line[start - 2:start] == "](":
        return True
    return False


def process_file(path: Path) -> tuple[int, list[str]]:
    self_id = path.stem
    text = path.read_text(encoding="utf-8")
    lines = text.split("\n")

    # frontmatter 範囲検出
    fm_end = 0
    if lines and lines[0].strip() == "---":
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                fm_end = i + 1
                break

    in_fence = False
    linked_ids: set[str] = set()
    changes: list[str] = []
    out_lines: list[str] = []

    for idx, line in enumerate(lines):
        # frontmatter
        if idx < fm_end:
            out_lines.append(line)
            continue
        # code fence toggle
        stripped = line.lstrip()
        if stripped.startswith("```"):
            in_fence = not in_fence
            out_lines.append(line)
            continue
        if in_fence:
            out_lines.append(line)
            continue
        # heading 行は自IDのセクション見出し（### M-22: ...）等なのでスキップ
        if line.lstrip().startswith("#"):
            out_lines.append(line)
            continue

        # マッチを順に処理。最初の未リンク化 ID のみ置換、それ以降はそのまま
        new_parts: list[str] = []
        cursor = 0
        replaced_in_line = False
        for m in ID_PAT.finditer(line):
            mid = m.group(1)
            if mid == self_id:
                continue
            if mid not in existing_ids:
                continue
            if mid in linked_ids:
                continue
            if is_already_linked(line, m.start(), m.end()):
                continue
            # 置換実行
            new_parts.append(line[cursor:m.start()])
            new_parts.append(f"[{mid}]({mid}.md)")
            cursor = m.end()
            linked_ids.add(mid)
            replaced_in_line = True
            changes.append(f"  L{idx+1}: {mid}")
        if replaced_in_line:
            new_parts.append(line[cursor:])
            out_lines.append("".join(new_parts))
        else:
            out_lines.append(line)

    new_text = "\n".join(out_lines)
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
    return len(changes), changes


def main():
    targets = sorted(LESS.glob("*.md"))
    total = 0
    per_file: list[tuple[str, int]] = []
    for p in targets:
        n, _ = process_file(p)
        if n:
            per_file.append((p.name, n))
            total += n
    print(f"\nTotal links inserted: {total}")
    print(f"Files modified: {len(per_file)}")
    for name, n in per_file:
        print(f"  {name}: {n}")


if __name__ == "__main__":
    main()
