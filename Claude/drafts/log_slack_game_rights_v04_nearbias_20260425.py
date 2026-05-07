#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")
assert CHANNEL and "nao-u" not in CHANNEL.lower(), "safety: refuse to post to #nao-u"

text = """\
[Log C121] game/avoid_log/v04 — 「近くで連打してるだけ」問題への第2の圧力軸

■ Nao_u 08:13 指摘 (#game-rights) への対応
> Log AIの近くで連打してるだけで楽しくない問題が解決してない。

v03 の dirBias は「左右連続移動」への圧力で、近接静止＋SPACE連打には効かない（dirBias が 0 近辺に留まる）ことを自覚。v04 で **直交軸の圧力**を追加。

■ v03 → v04 変更点（最小1点、対称軸追加）
- **nearBias**: プレイヤーが AI 半径160px以内に居ると蓄積、離れると減衰（半減期~23F）、上限30
- spawn interval計算: `dir_factor*0.45 + near_factor*0.45` を加算、上限0.7。片軸だけでも最大45%短縮、両軸MAXで最大70%短縮（下限7F）
- HUD 右上に `dir` / `near` の2本圧力ゲージを可視化（気づきを先に作る）
- `index.html` 4箇所 + `headless.py` 反映 + `near_bias_avg` メトリクス追加
- v03 全ロジック温存（巻き戻し容易性、feedback_solution_space_rollback）

**圧力設計 vs 禁止追加**（ABA 2026-03-11）:
- 不採用案A: 「近接滞在Nフレーム超で死亡」= 禁止追加
- 不採用案B: 「SPACE連打に cooldown スケール」= 禁止追加
- 採用案C: 「近接に居続けると敵スポーン密度が上がる」= 圧力設計（自然に切り返したくなる）

■ ヘッドレス検証 (seed=100, 5 runs)

| policy | v03 生存s | v04 生存s | Δ | v04 near_bias |
|---|---|---|---|---|
| concept | 37.60 | 34.28 | -9% | 29.32 |
| slacker | 4.81 | 4.32 | **-10%** | 27.18 |
| dodger | 7.20 | 7.30 | +1% | 9.02 |
| remote | 8.83 | 7.30 | **-17%** | 9.02 |
| **camper** | **4.62** | **4.07** | **-12%** | **27.04** |
| oscillator | 11.04 | 11.55 | +5% | 2.55 |

読み取り:
- camper（AI張り付き）/slacker（動かない）で near_bias=27台 → 圧力発動 → -10〜-12% 短命化 ✅
- dodger/remote（離れてる）は near_bias=9.02 で非発動。こちらには v03 dirBias 圧力が引き続き効いている
- concept 34.28s/score 1244 で **concept vs camper 比率 = v03 8.1倍 → v04 8.4倍** と相対的優位は維持
- oscillator（通い）は near_bias 2.55 と低い=通い行動は蓄積しない。**次の単調最適解候補**として要観察

■ 残課題（手動プレイで確認必要）
- headless の camper/slacker は「動かない」だけ。Nao_u が体感した「近くでうろつきながら SPACE 連打」プロファイルは別。**手動プレイで near ゲージが切り返し動機として機能するか**確認は C122 優先
- concept も -9% 削れた副作用。正攻法の上限が下がって辛くなりすぎ懸念
- 減衰率 0.97（半減期 ~23F）のチューニング余地

■ ABA 原則への照合
- 「このゲームの重心は何か」= 磁石AIと鉄片を介した近接/離脱の揺らぎ
- v04 は「近接しすぎ」にも「遠すぎ」にも圧力がかかる2軸構造で、**重心（揺らぎ）を常時引き戻す圧力場**を作った
- 「望ましい遊び方が自然に出る圧力」の2軸目実装

— Log (2026-04-25 08:25 #game-rights)"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
