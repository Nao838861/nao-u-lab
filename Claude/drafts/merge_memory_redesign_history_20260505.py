"""memory_redesign.md A案軽微整理 (改訂版):
L1087以降の H2 7節を H3 降格 + 履歴セクション (L515-) 内に時系列統合。

元ファイルの H2 配置 (L515 履歴ヘッダー以降):
- L515: ## 履歴（新しいものが上） ← 残す
- L1011: ## 忘却の多層構造仮説 ← H2 inside history. 今回は move せず、H2 のまま残す（保守的）
- L1087: ## 2026-04-21 C94 追記
- L1116: ## 2026-04-21 C96 追記
- L1150: ## 幾何空間の選択は設計判断
- L1220: ## 2026-04-21 C102 Phase 2 追記
- L1287: ## 2026-04-22 C108 Phase 3 追記
- L1314: ## 2026-04-26 C124→C128 持越し
- L1370: ## AYi 4欠陥（2026-04-27 Mir C134 Phase 2分析）

履歴は新しいものが上。挿入順:
- C134-AYi (04-27) → L515 履歴ヘッダー直後
- C124 (04-26) → 既存 04-26 (L517/L557) の後 (= L575 の前)
- C108 (04-22) → L575 (04-15) の前
- C102/幾何空間/C96/C94 (04-21) → C108 の後、L575 の前
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "projects" / "memory_redesign.md"

text = TARGET.read_text(encoding="utf-8")
lines = text.split("\n")
print(f"Original line count: {len(lines)}")

# 訂正済み境界 (1-indexed start, 1-indexed end exclusive)
# L1087-end までの 7節
sections = [
    (1087, 1116, "C94"),
    (1116, 1150, "C96"),
    (1150, 1220, "Geom"),  # 幾何空間の選択は設計判断
    (1220, 1287, "C102"),
    (1287, 1314, "C108"),
    (1314, 1370, "C124"),
    (1370, len(lines) + 1, "C134-AYi"),
]

def extract_demote(start, end):
    body = lines[start - 1:end - 1]
    if body and body[0].startswith("## "):
        body[0] = "##" + body[0][1:]  # H2 -> H3
    # 末尾の空行を削除 (各節の間の区切りは挿入時に再付与)
    while body and body[-1].strip() == "":
        body.pop()
    return body

extracted = {}
for s, e, label in sections:
    body = extract_demote(s, e)
    extracted[label] = body
    print(f"  {label}: lines {s}-{e-1} ({len(body)} lines), header: {body[0][:70] if body else '(empty)'}")

# 履歴境界確認
assert lines[514] == "## 履歴（新しいものが上）", f"L515 mismatch: {lines[514]!r}"

# part1: L1-L516 (履歴ヘッダーまで)
# part2: L517-L574 (既存 04-26 entries 2件)
# part3: L575-L1086 (履歴の 04-15 以降の続き)
part1 = lines[0:516]   # L1..L516 (header + 履歴 H2 + 空行)
part2 = lines[516:574]  # L517..L574
part3 = lines[574:1086]  # L575..L1086

# 各節を区切り空行付きで連結する helper
def join_sections(*labels, leading_blank=True, trailing_blank=True):
    out = []
    for label in labels:
        if leading_blank:
            out.append("")
        out.extend(extracted[label])
    if trailing_blank:
        out.append("")
    return out

# C134 を履歴ヘッダー直後 (part1 末尾) に
c134_block = [""] + extracted["C134-AYi"] + [""]

# C124 / C108 / C102 / Geom / C96 / C94 を part2 と part3 の間に挿入
mid_block = []
for label in ["C124", "C108", "C102", "Geom", "C96", "C94"]:
    mid_block.extend(extracted[label])
    mid_block.append("")  # 区切り空行
# 余分な末尾空行を1個に整理
while mid_block and mid_block[-1] == "":
    mid_block.pop()
mid_block.append("")

new_lines = part1 + c134_block + part2 + mid_block + part3

new_text = "\n".join(new_lines)
TARGET.write_text(new_text, encoding="utf-8")
print(f"\nNew line count: {len(new_lines)} (delta: {len(new_lines) - len(lines):+d})")
print(f"Written: {TARGET}")
