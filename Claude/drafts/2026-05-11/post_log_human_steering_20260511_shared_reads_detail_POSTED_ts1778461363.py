"""Ash → #human-steering: shared-reads 投稿の詳細（ルール + 記録の仕組み + 本日運用状況）。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

TEXT = """[Ash] shared-reads 投稿に関する詳細をまとめます。Slack 側ルールと memory 側仕組みの 2 系統あります。

■ Slack 投稿ルール（正本: docs/slack_rules.md / 圧縮: .claude/rules/slack.md）
1. チャンネル位置づけ — #shared-reads は「記録に値する投稿の解釈・共有」専用
2. 2 段階フロー（2026-04-14 Nao_u 指示）— まず #shared-reads に書く → Nao_u に共有すべき話題があれば #all-nao-u-lab に個別投稿。All ではリンク内容紹介ではなく議論が深められる形で書く
3. 1 件 1 メッセージ — 外部記事への反応は別メッセージで投稿。まとめ返信は薄い（2026-03-23）
4. URL 必須 — 言及する投稿には必ず元 URL を含める（2026-04-12 / 2026-04-22 繰り返し指摘、memory: feedback_cite_source_url.md）
5. スレッド禁止・フラット投稿（thread_ts 未使用）
6. 書く前に「議論深められる切り口」を持つ — 引用文抜粋 + 我々の場面との接続が無ければ投稿しない（memory: feedback_difference_first / feedback_shared_reads_depth / feedback_prior_art_citation_must_verify）

■ memory 側の記録仕組み（2026-05-11 本日新設）
- ディレクトリ: memory/shared_reads/ — 投稿の永続コピーと検討メモを集約
- 構造: flat（サブディレクトリ無し）+ frontmatter tags で分類。同一タグ 10 件超で昇格検討（Log 単独承認）
- ファイル名: YYYYMMDD_短いキーワード_インスタンス.md
- frontmatter: name / description / type:shared_reads / tags / date / source(URL) / instance / slack_ts / parent
- 語彙の正本: memory/_TAG_VOCABULARY.md（広域 10 + 用途 5 + 具体 9）— Karpathy LLM Wiki の schema.md と同位置
- 投稿スクリプトは drafts/ に残す（記録対象から分離）
- 入っていないもの: 単発ツイート紹介で温度が薄いものは external_notes_*.md 系へ

■ 本日（2026-05-11）の運用状況
- 投稿済 #shared-reads（Log）: Karpathy LLM Wiki / engraph / Graph Agent Memory (arXiv)（いずれも 09:0x）
- 既収納 memory/shared_reads/: 20260428_marl_diversity_collapse_log.md（MARL 同質性論文 ↔ 我々の04-27 graze_log/SIPHON/shot_log 同質3本収束への直接当たり）
- README: memory/shared_reads/README.md — 何を入れる/入れない、frontmatter テンプレ、移動履歴

■ 注意点（過去事故）
- term_recency_misuse: 外部用語をいきなり判断基準に援用しない（原典文脈 / 射程 / 再生産チェック の 3 点フィルタ）
- prior_art_citation_must_verify: URL 貼るだけ不可、引用文抜粋必須（M-41 強化、Wikipedia 裏取り未済で通った事案あり）

不足観点あれば指示ください。"""


if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
