"""Log → #all-nao-u-lab: chokudai Orbit Wars URL (5/11 19:48 #nao-u) への反応"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab channel"

text = """[Log] chokudai Orbit Wars (5/11 19:48 #nao-u) — 「どういうコンテストなのか」への構造側からの答え

URL: <https://x.com/chokudai/status/2053721316193357918>
本体: <https://www.kaggle.com/competitions/orbit-wars>

## コンテスト構造（kaggle 概要 + 周辺ブログから抽出）
- 太陽の周りを回る惑星を 2人 or 4人で奪い合う 2D 連続空間 RTS
- 賞金 $50k、開始 4/中、残り約 2ヶ月、初期段階で RL アプローチ議論が活発
- 主催談「action space は HUGE だが prune-able」= 行動空間は巨大だが構造的に圧縮できる、と最初から設計に書いてある

## chokudai が引っかかっている所
- 上位が AtCoder 勢（探索系コンペで強い人達） = 想定内
- **Turing CTO（自動運転 = 連続制御 + 不確実性下の意思決定の専門家）が19位** = ここが「気になる」のサイン
- chokudai 自身の補足「将棋/囲碁AI 経験者が強いのはそりゃそう」

## 構造側からの解釈（「どういうコンテストか」への一次答え）
**「連続2D空間に見えて、勝敗を決める層は離散ツリー探索」のコンテスト。**

- 表層: 惑星位置 / 軌道 / 連続座標 → AD 屋の領域
- 上層: 「いつどの惑星を取りに行くか / 誰の取り合いに割り込むか」= 離散意思決定ツリー → 将棋/囲碁屋の領域
- 主催の "prunable" 宣言は **戦略層が離散構造を持つことを設計時から保証している**、という意味に読める

Turing CTO の19位は、戦術層（軌道計算）の優秀さが戦略層（誰と何を奪うか）の探索量に勝てないという結果で、これは **「連続2Dだから連続制御強者が勝つ」という直感がコンペ設計レベルで裏切られている**証拠。

## 我々の graze_log v04 brainstorm と直結する点
Nao_u 5/11「graze をボーナス層に降ろし、外発緊張でコアを作り直す」指示への Ash α/β/γ 案、Log の cross_review 視点として：

- graze_log v03 のコアは「位置取り（連続戦術層）」**のみ**で、戦略層の離散構造が無かった
- v04 で「外発緊張」を入れる時、緊張の正体は **戦略層の離散選択肢**（どの脅威に何のリソースを当てるか）でないと、また連続戦術層の上塗りになる
- Orbit Wars の prunable な action space は「連続戦術層 ⊂ 離散戦略層」が層分けされている例。v04 α/β/γ のどれが**戦略層の離散構造を持つか**を判定基準にできる

## 余談（「気になる」へのもう一段の答え候補）
このコンペ、prize $50k + 残り2ヶ月で RL がまだ未収束 = **discrete tree search 系（MCTS / α-β 探索 + ハンドメイド評価関数）と RL 系の優劣がリアルタイムで決まる**フェーズ。AtCoder 勢が先行している現状は「離散探索 + ヒューリスティック」が初動有利という観測で、後半 RL がどこまで追い込むかが見もの。

ヘッドレス評価の文脈で言うと、Orbit Wars は **「AI同士の対戦が一次評価軸として最初から成立している arena」**で、我々が shot_log（Nao_u 5/7「ヘッドレス評価対象は唯一これ」）でこれから組もうとしている AI プレイ評価とは設計の出発点が逆方向（我々: 単一プレイヤースコアゲームに AI プレイ評価を後乗せ、Orbit Wars: AI 対戦評価を前提に game design）。"""

post_message(channel_id, text)
print("Posted to #all-nao-u-lab")
