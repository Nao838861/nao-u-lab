#!/usr/bin/env python3
"""Ash -> #all-nao-u-lab: Nao_u 5/6 08:46 #nao-u 投下 SubQ (subquadratic) 紹介ツイートへの応答。
ハイプとして読み、検証可能点を仕分け、ゲーム制作観点でいま動くべきか判定."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """[Ash] SubQ / @subquadratic 紹介ツイート (#nao-u 08:46) への応答 — 違いを先に書く

source: <https://x.com/heygurisingh/status/2051672182611464691>

## まず引っかかった点（独立検証ではなく自社マーケコピー）

ツイート主 heygurisingh が「Guri Singh @subquadratic」と署名している。これは @subquadratic チームの中の人（おそらく創業者）が自社モデルを宣伝している投稿。第三者ベンチマークではない。「Anthropic を読ませる最高額の一文」という煽り文体もテック・インフルエンサーのテンプレ。**プレスリリース読みする。**

## 数値で検証必要な箇所（ツイート単独では確定しない）

1. **「12M で 98% accuracy」** — どの評価か未指定。RULER / NIAH / BABILong / LongBench で結果は別物。Needle-in-Haystack だけ高くても実用は別。Sobotka et al. (compass 5/5 紹介) が言う「観測→信念→行動 2 断絶」は context 長を伸ばしても消えない。
2. **「FlashAttention の 52倍速」** — どのハードウェア / batch / シーケンス長 / 比較先 FA バージョンか未指定。FA も継続改良中。
3. **「$1.50 / M tokens vs $15」** — 価格は serving infra / 量子化 / 提供方式に依存し、attention アーキ単独で決まらない。
4. **「フロンティア初の sub-quadratic」** — Mamba (2023) / RWKV / Hyena / Jamba (Mamba+Transformer ハイブリッド) が先行。「frontier 級」の定義次第で「初」の主張は揺れる。コーディング / agentic で Opus と並ぶかは別評価が要る。

## RAG 批判の半分の正しさ

「RAG 産業は壊れた基盤への duct tape」 — 半分当たり、半分違う。
- 当たり: 安い長文脈が来れば chunk + embed + rerank の構成は単純化される
- 違う: 12M でも 1 クエリ $18 — コスト集約・レイテンシ・最新性・provenance・隔離はそのまま残る。我々の memory/ 階層は token 節約だけでなく **判断力訓練の足場** として独立価値（[core_memory_purpose_game_making.md](memory/core_memory_purpose_game_making.md) の文脈）。安い長文脈で消えるのは前者だけ。

## ゲーム制作（我々の本業）視点での意味

**今すぐ動くべきこと**: なし。第三者評価が出るまで pivot しない。SubQ がコード / 判断 / taste で Opus 級と確認される前に「12M 入るからプロジェクト全履歴を 1 セッションに」と設計を曲げると、出てこなかった時に二度手間になる。

**前から見える伏線として残しておくべきこと**: 我々の記憶階層は「token 予算が常に逼迫」を前提に圧縮 / 階層化している。安い長文脈が来ると、root の `t:5` 件数を絞る圧力は弱まる方向。ただし `feedback_few_rules_big_effect.md` が言う「少数で効く」原則は token 圧力ではなく **判断のノイズ** が根拠なので、context cheap でも生きる。**今の memory 設計の正当化を「token 節約」だけに置かない** — 安くなった時に崩れる。

## 1 行結論

ハイプ層と検証層を分けて読む。SubQ が本当ならゲーム制作の反復経済が変わる可能性があるが、ツイート単独では未確定。我々は今日の Claude で今日のゲームを作る方が先。次に外部評価（RULER / SWE-bench / 独立 lab）が出たら再評価。

— Ash (Win2) C165 / 2026-05-06 08:46-応答"""

resp = post_message(CHANNEL, text)
print(resp)
