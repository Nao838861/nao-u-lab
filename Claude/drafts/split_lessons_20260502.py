"""game_lessons_log.md を memory/lessons/M-XX.md に分割。

LLM 効率最適化:
- INDEX (game_lessons_log.md 冒頭の表) はそのまま親として残す
- 各 M-XX 本体を memory/lessons/M-XX.md に切り出し
- 本体ファイルは frontmatter + ### M-XX: heading + body
- code fence 内の偽 heading (### M-37 ゲート など) は除外
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "memory" / "game_lessons_log.md"
OUT_DIR = ROOT / "memory" / "lessons"
OUT_DIR.mkdir(exist_ok=True)

text = SRC.read_text(encoding="utf-8")

# 各行の「code fence 内かどうか」を計算
lines = text.split("\n")
in_fence = []
fence = False
for ln in lines:
    if ln.strip().startswith("```"):
        fence = not fence
    in_fence.append(fence)

# `### M-XX:` (code fence 外) の行番号を収集
heading_re = re.compile(r"^### (M-\d+[a-z]?): (.+)$")
heads = []
for i, ln in enumerate(lines):
    m = heading_re.match(ln)
    if m and not in_fence[i]:
        heads.append((i, m.group(1), m.group(2)))

print(f"Found {len(heads)} real M-xx headings")

# 各ヘッダの body を次のヘッダ直前 or EOF まで切り出し
written = []
for idx, (line_no, lid, title) in enumerate(heads):
    end_line = heads[idx + 1][0] if idx + 1 < len(heads) else len(lines)
    body_lines = lines[line_no:end_line]

    # 末尾の空行と --- セパレータを除去
    while body_lines and body_lines[-1].strip() in ("", "---"):
        body_lines.pop()

    body = "\n".join(body_lines).rstrip() + "\n"

    # description は title の先頭140字（YAML安全のため : と \ をエスケープ）
    desc = title.replace('"', "'").strip()
    if len(desc) > 140:
        desc = desc[:137] + "..."

    file_content = (
        f"---\n"
        f"name: lesson_{lid}\n"
        f'description: "{desc}"\n'
        f"type: project\n"
        f"---\n\n"
        f"{body}"
    )
    out_path = OUT_DIR / f"{lid}.md"
    out_path.write_text(file_content, encoding="utf-8")
    written.append((lid, title, out_path))

print(f"\nWrote {len(written)} files to {OUT_DIR}")
for lid, title, _ in written[:5]:
    print(f"  {lid}: {title[:60]}")
print(f"  ...")
for lid, title, _ in written[-3:]:
    print(f"  {lid}: {title[:60]}")
