"""M-37b.md に紛れ込んだ非M-37b 内容を切り出して個別ファイル化。

L-01〜L-05 / S-01〜S-06 / D-01〜D-03 / X-01〜X-06 を memory/lessons/<ID>.md に分割。
appendix セクション (外部語彙対応 / 次回ゲーム制作チェックリスト / Mir×Log cross_review 4ゲート契約 / 関連ファイル / 一番忘れるな) は memory/lessons/_appendix.md にまとめる。
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "memory" / "lessons" / "M-37b.md"
OUT_DIR = ROOT / "memory" / "lessons"

text = SRC.read_text(encoding="utf-8")
lines = text.split("\n")

# code fence 内追跡
in_fence = []
fence = False
for ln in lines:
    if ln.strip().startswith("```"):
        fence = not fence
    in_fence.append(fence)

# まず M-37b 本体の終端を探す（line 95 = "## Log固有の失敗傾向" の直前）
# `^## ` で M-37b 以外の最初の H2 を探す（ただし M-37b 本体内の `## 人間プレイ前 結果予測` は除外）
m37b_end = None
for i, ln in enumerate(lines):
    if i < 30 or in_fence[i]:
        continue
    if ln.startswith("## Log固有の失敗傾向"):
        m37b_end = i
        break

assert m37b_end is not None, "M-37b end boundary not found"
print(f"M-37b body ends at line {m37b_end} (next H2: {lines[m37b_end][:50]})")

# M-37b 本体だけを書き戻す
m37b_body = "\n".join(lines[:m37b_end]).rstrip() + "\n"
SRC.write_text(m37b_body, encoding="utf-8")
print(f"Truncated M-37b.md to {len(m37b_body.splitlines())} lines")

# 残りを処理
rest = lines[m37b_end:]

# ID 付き heading (### L-XX / S-XX / D-XX / X-XX) を抽出
id_re = re.compile(r"^### ([LSDX]-\d+): (.+)$")
# H2 ブロック分け
section_starts = [(i, lines[m37b_end + i]) for i, ln in enumerate(rest) if ln.startswith("## ")]
print(f"\nFound {len(section_starts)} H2 sections after M-37b body")
for off, ln in section_starts[:8]:
    print(f"  +{off}: {ln[:60]}")

# 各 ID 付き heading を切り出し
id_heads = []
for i, ln in enumerate(rest):
    if in_fence[m37b_end + i]:
        continue
    m = id_re.match(ln)
    if m:
        id_heads.append((i, m.group(1), m.group(2)))

print(f"\nFound {len(id_heads)} ID-prefixed headings (L/S/D/X)")

# 各 ID heading を「次の同レベル以上の heading or H2 まで」で切り出す
# 単純化: 次の `### ` (ID) または `## ` まで
for idx, (off, lid, title) in enumerate(id_heads):
    start = off
    # 次の ### または ## まで
    end = len(rest)
    for j in range(off + 1, len(rest)):
        if in_fence[m37b_end + j]:
            continue
        if rest[j].startswith("## ") or rest[j].startswith("### "):
            end = j
            break
    body_lines = rest[start:end]
    # 末尾の空行と --- を除去
    while body_lines and body_lines[-1].strip() in ("", "---"):
        body_lines.pop()
    body = "\n".join(body_lines).rstrip() + "\n"

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

print(f"\nWrote {len(id_heads)} ID-prefixed lesson files")

# appendix にまとめる H2 sections（ID なし）
# ## 外部語彙対応 / ## 次回ゲーム制作チェックリスト / ## Mir×Log cross_review 合意 / ## Mir textadv v04 → Log 伝播 / ## 関連ファイル / ## 一番忘れるな
# ただし「Mir×Log cross_review 合意」内の X-01〜X-03、「Mir textadv → Log 伝播」内の X-04〜X-06 は ID heading として既に分離済。
# その親 H2 セクションには「次作4ゲート契約」が残るので appendix に含める

appendix_chunks = []
for off_i, (off, ln) in enumerate(section_starts):
    end = section_starts[off_i + 1][0] if off_i + 1 < len(section_starts) else len(rest)
    block = rest[off:end]
    appendix_chunks.append("\n".join(block).rstrip())

appendix_text = (
    "---\n"
    "name: lessons_appendix\n"
    'description: "M-XX/L-XX/S-XX/D-XX/X-XX 個別ファイルに収まらない横断的な節 (外部語彙対応・チェックリスト・cross_review 4ゲート契約・関連ファイル)"\n'
    "type: project\n"
    "---\n\n"
    "# Lessons Appendix\n\n"
    "本ファイルは ID 付き個別 lesson (`memory/lessons/<ID>.md`) ではカバーできない、横断的なリファレンス節を集約する。\n"
    "ID heading (L/S/D/X) は別ファイルに分離済。本ファイルには **チェックリスト・契約・関連ファイル等の運用節** だけが残る。\n\n"
    "---\n\n"
    + "\n\n---\n\n".join(appendix_chunks)
    + "\n"
)

# 注意: appendix にはすでに分離済の ID heading の重複が含まれる可能性があるが、
# それぞれの section の H2 親見出し下にある「ID heading＋本文」も含まれている。
# これは重複だが、各 H2 セクションを「文脈つきリファレンス」として読むときに有用。
# ただしファイルサイズが膨らむので、ID heading のブロックを取り除く処理を追加する。

def remove_id_blocks(text):
    """### L/S/D/X-XX: で始まるブロックを除去（次の ### または ## まで）。"""
    out_lines = []
    in_id_block = False
    for ln in text.split("\n"):
        if id_re.match(ln):
            in_id_block = True
            continue
        if in_id_block and (ln.startswith("## ") or ln.startswith("### ") or ln.startswith("---")):
            in_id_block = False
        if not in_id_block:
            out_lines.append(ln)
    return "\n".join(out_lines)

cleaned_chunks = [remove_id_blocks(c) for c in appendix_chunks]
# 連続空行を圧縮
cleaned_chunks = [re.sub(r"\n{3,}", "\n\n", c).strip() for c in cleaned_chunks]

appendix_text = (
    "---\n"
    "name: lessons_appendix\n"
    'description: "M-XX/L-XX/S-XX/D-XX/X-XX 個別ファイルに収まらない横断的な節 (外部語彙対応・チェックリスト・cross_review 4ゲート契約・関連ファイル)"\n'
    "type: project\n"
    "---\n\n"
    "# Lessons Appendix\n\n"
    "本ファイルは ID 付き個別 lesson (`memory/lessons/<ID>.md`) ではカバーできない、横断的なリファレンス節を集約する。\n"
    "ID heading (L/S/D/X) は別ファイルに分離済、本ファイルには H2 セクションの **ID なしの運用節** だけが残る。\n\n"
    "---\n\n"
    + "\n\n---\n\n".join(c for c in cleaned_chunks if c.strip())
    + "\n"
)

(OUT_DIR / "_appendix.md").write_text(appendix_text, encoding="utf-8")
print(f"\nWrote _appendix.md ({len(appendix_text.splitlines())} lines)")
