#!/usr/bin/env python3
"""Ash → #game-rights: Nao_u 20:31「ボール接近応答の引用元」直答 — M-41違反疑い告白 + v07候補A保留"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights"

text = """\
*Ash → Nao_u 20:31「ボール接近応答の引用元」直答*

結論先出し: *正確な型の引用元は無い。M-41「先行事例ゼロは不採用」抵触。v07候補A 着手保留します*。

## 20:31問いに正面から答える
v07 brainstorm.md で候補A「ボール接近応答」の先行事例として書いた4件を再精査:
- *Krakout (1987)*: ブロックが弾を撃ち返す = *能動応答*（撃つ）であって*受動状態遷移*ではない
- *Arkanoid 鋼鉄ブロック*: 単に硬度高い、ボール接近で状態変化しない
- *Wizorb (2011)*: 敵モンスター撃破型、ブロック自体の応答ではない
- *Ricochet 磁石*: ボールを引き寄せる*常時作用*、接近応答ではない

→ *「ブロックがボール接近距離で警戒状態に遷移し、その状態で当てると倍率↑/硬度+1」型の正確な引用元はゼロ*。私が並べた4件は「関連事例」であって「型の類例」ではなかった。Nao_u 指摘で観測。

## M-41違反として処理
M-41「先行事例ゼロ件は不採用」適用 → *v07 候補A 不採用に倒す*。v07 brainstorm.md 7節「最良確信宣言」も撤回。

## 18:08「逃げるのが早すぎ」と20:31「型の類例ない」の重なり
v06凍結→v07候補Aへ移った時、私は「v4と違う分岐の最有力」として候補Aを書いたが、それ自体が*型不在の枝への逃避*だった。Nao_u が 18:08「v4の事例と他ゲームの先行事例を参考に」と言った直後、私は v04 brainstorm の MPS 6 候補を再生しただけで、20:31 の問いを*自分で*問えなかった = M-41 自走失敗。

## M-41拡張「先行事例不在の理由検証」即適用
Logの提案（17:5x inbox）を v07 brainstorm に即組み込み、候補Aに対して30年動かなかった理由を検証:
- (a) 技術的に重い? → 現代ハードでは違う、却下
- (b) 試したが面白くならなかった? → *v05 ガイド嘘問題と同型再発リスク*。警戒中ブロック後退でガイドラインが嘘になる、A は v05 失敗の構造的兄弟
- (c) 既存型と機能的等価? → 静的ボーナスブロック（破壊で倍率増）と*プレイヤー体験的にほぼ等価*。動く意義がない
→ *(b)(c) で不採用に倒す*

## v04 brainstorm まで戻る — *型の引用元が確実にある*分岐
v04 で MPS=2-5 の枝のうち、型の引用元が*仕様レベルで*存在するもの:
- *候補B 隊列横スライド/回転* → *Arkanoid Doh It Again* 直接（隊列が画面内でスライド・回転、Taito 1997）
- *候補C 降下圧* → *Space Invaders* (1978) + *Holedown* (Vector Park 2018) 同型（行単位で降下、攻撃でリセット）
- *候補X7 ボス層* → *Arkanoid DOH* 直接（ステージ最終のボスブロック、Taito 1986）

候補B/C/X7 は型レベルで実機が動いて受け入れられた歴史を持つ。M-41 通過確実。

## 次サイクル予定
1. v07 brainstorm.md に *M-41拡張「先行事例不在の理由検証」セクション追記* + *候補A 不採用マーキング*
2. v07 brainstorm.md に B/C/X7 を再 MPS 採点 → M-37 着手前批判レビュー → 「最良」確信宣言の*やり直し*
3. v04 → v06 で凍結した「全揺れ同位相」と、v07 で凍結する「ボール接近応答」の*両方の不採用理由*を v07 brainstorm 末尾に「掘った跡地」として残す（鉱脈再探索の地図）
4. *v07 着手は brainstorm.md 全節やり直し後*。逃げを禁ずる

## 反省と memory
- *型の類例存在を確認せずに「先行事例」リストを並べた*: Nao_u が 20:31 で問わなければ、私は候補A で実装に進んでいた。これは*M-41 を「事例を書く」儀式に矮小化していた*ことの証拠。先行事例の記述に「*仕様レベルで型が一致*」のチェックボックスが必要
- *「v4と違う構造軸」だけで候補を選ぶと型不在に走る*: 構造的反転は必要条件だが十分条件ではない、型の存在も必須

memory 追記: `feedback_similar_games_first.md` に*「型レベル一致」チェックボックス強制*ルール追加します。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print(f"Posted: ts={result.get('ts')}")
elif result.get("skipped"):
    print(f"Skipped (dedup): {result.get('reason')}")
else:
    print(f"Error: {result}")
