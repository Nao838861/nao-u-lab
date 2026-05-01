"""Log → #game-rights: brick_log v08 候補 B (隊列横スライド) 選定報告 + Nao_u 確認質問"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights channel"

text = """[Log] brick_log v08 候補 B (隊列横スライド) 選定 — Nao_u 18:08「v6 反省で掘った先行事例」直接適用

C154 で v04 brainstorm の B/C/E (隊列横スライド / 降下圧 / パワーエサ式反転) を M-41 型前例再調査で点検し、**v08 = B 単独** を選定。

## v6 反省先行事例の使い方 (Nao_u 18:08「先行事例掘った結果はどうした」直接回答)

v06 反省で集めた Game Developer "Breaking Down Breakout" / Arkanoid Doh It Again 1997 / Space Invaders 1978 / Holedown 2018 / Krakout / パックマン パワーエサ等を **「凍結根拠」ではなく「v4 と違う分岐の素材」として再利用**。v06 の失敗= 凍結判定だけで枝の素材として読まなかった。

## B / C / E 比較

| 項目 | B 隊列横スライド | C 降下圧 | E パワーエサ反転 |
|---|---|---|---|
| 型前例 (M-41) 直接性 | ◎ Doh It Again 1997 ブロック崩し内直接 | ◎ Space Invaders 1978 + Holedown 2018 | △ パックマン同型のみ、ブロック崩し内ゼロ |
| 6 軸反転度 | 3/6 完全 + 1/6 部分 | 2/6 完全 + 1/6 部分 | 2/6 完全 (2軸概念外) |
| M-37 通過 | 5/5 全可 | 6/6 可 (#1 能動報酬化前提) | 3 件不明 |
| MPS | 4 | **6** | 2 |
| B1 死ななくなった解決 | × | **◎** | △ |
| 「素っ頓狂で型のない」(20:51) | × Doh It Again 直接 | × Space Invaders 直接 | △ ブロック崩し内ゼロ |

## B 選定根拠 (C を上回る決定的理由)

1. **M-41 純度最高**: ブロック崩しジャンル内 Arkanoid Doh It Again (Taito 1997, 28年前) という直接型前例を持つ唯一の選択肢。同型 Space Invaders (1978, 47年前)。「素直に過去の要素を型として組み合わせる」(20:51) を最高純度で実行
2. **M-37 5/5 全可**: C は #1 (no_passive_punishment 境界) が能動報酬化前提で「△→可」。**B のみ全件即可**
3. **段階順序**: B 単独 → v09 = B+C → v10 で E。C 単独で行くと B1 解決のため M-22 違反リスクを抱える形。B が動的標的化を担保した上に C 「降下リセット」を能動報酬として被せる方が安全

## ↓ Nao_u 確認質問

**Q: B は MPS 4 で B1「死ななくなった」を直接解決しません。それでも「鉱脈に最も近そう」基準で OK ですか？**

代替: C を v08 で先出しすれば B1 を直接解決するが、no_passive_punishment 境界 (#1) を実装で確かめないと M-22 違反リスクが残る。**B 単独で v08 を作って B1 が解決しないまま v09 に進む順序が、Nao_u の鉱脈基準で許容されるか確認したい**。

「B でいい」「C を先」「別解」のいずれか。確認後 v08 README 着手。

## v08 仕様骨子 (Nao_u 同意後確定)

- 横スライド速度: 0.5 px/frame (= 30 px/sec) 初期値、ガイド追従可能範囲で詰める
- 行ごと方向: 全行同方向 OR 行ごと反転 (Doh It Again は行ごと反転)
- ガイド: v04 と同じくフレームごとブロック現位置反映
- M-39 結果予測 / Q-H-8b 機構毀損審問は predicted_play.md で確定

ブレスト全文: game/brick_log/v08/brainstorm.md
"""

post_message(channel_id, text)
print("Posted to #game-rights")
