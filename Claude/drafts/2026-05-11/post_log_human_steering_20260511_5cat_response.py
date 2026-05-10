#!/usr/bin/env python3
"""Log → #human-steering: 「5カテゴリ」の正体・体制Log単独化・タグ上限の3点回答。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """\
[Log → Nao_u 5/11 06:25] shared_reads整理 — 「5カテゴリ」の正体 / 体制 / タグ数 3点回答

▼「上記5カテゴリ」= 言葉のズレを認める
- 5/11 05:38 提案本文には4つしか書いていなかった: external_observation / external_ai_gamedev / sns_reaction / community_post **等**
- 質問テンプレに「5カテゴリで網羅できるか」と数を断言しつつ、本文は「等」で曖昧化。5番目が自分の中で決まらないまま数を出した。指摘で気付けた
- 実態（archive除く shared_reads_* は ~80件）を見直すと、粗く (a)外部AI記事/論文紹介 (b)ゲーム開発の観察 (c)個人ツイート反応 (d)コミュニティ応答 (e)雑観察・メタ論 と5系に近いが、AI記事×ゲーム開発の交差など境界例が大量

▼カテゴリ固定を捨てる → flat + tag に変える（Nao_u「増減や状況に合わせた整理」を反映）
- 固定カテゴリ移動は (1) 新規ジャンル流入のたびに再編成 (2) 境界例の判断ブレ (3) 「その他」肥大化、の3問題が必発
- 修正案: `memory/shared_reads/` 直下にflat集約。frontmatter `tags:` で分類。サブディレクトリは「同タグが10件超で安定したら昇格」のルール。**最初から構造を作らず、出現頻度に応じて構造化**
- これなら状況変化に追随、再編成コストが小さい、Obsidian Graphもタグ経由で連想が効く

▼「Logが一人でやった方が良い」← 同意
- 全員方式の致命的問題: 同じファイルがMirでは sns_reaction、Ashでは external_observation に分類される、判断ブレが必ず出る。frontmatterは単一オーナーで一貫させるべき
- 修正体制: 集約・整理・タグ付与・移動は **Log単独**。Mir/Ash は新規 shared_reads を書く時にLog定義のtag語彙に従うだけ
- 着手順: (a) `memory/shared_reads/` 新設 (b) Log が散在ファイルを毎サイクル10〜20件ペースで移動 (c) 新規分は書いた本人が memory/shared_reads/ 直下に直接置く（カテゴリ判断はLogが後追いで)

▼タグ多すぎは困る — 3つの理由
- (1) Obsidian Graph がノイズで埋まり、連想可能性が**逆に下がる**（密グラフは情報量ゼロに近い）
- (2) シノニム乱立で grep より弱い検索になる（「動機消失」「やる気喪失」「気持ち離れ」を別タグにしてしまう）
- (3) タグは概念の語彙。語彙が広がりすぎると意思疎通の精度が落ちる（人間の語彙感覚と同じ）
- 対策: `memory/_TAG_VOCABULARY.md` に語彙固定 / ファイル当たり3個まで / 新規タグ追加はLog単独承認 / 初期は10〜15語彙から始めて月1で見直し

▼修正版・着手順（本サイクル内）
- (a) projects/memory_tree_consolidation.md に本判断（Log単独 + flat + tag上限3）を反映
- (b) memory/_TAG_VOCABULARY.md v0（10〜15語彙）を Log が作成
- (c) memory/shared_reads/ 新設 + 散在ファイル10件移動で動作確認
- (d) orphan_check.py は予定通り Log 試作（こちらは全インスタンス共通で末尾実行）

— Log (Win)
"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
