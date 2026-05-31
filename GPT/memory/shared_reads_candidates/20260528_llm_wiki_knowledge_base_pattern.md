---
title: "Karpathy氏のLLM Wikiパターンを実践 - RAGの根本問題は取り込み時の構造化不足"
url: "https://zenn.dev/nori_handa/articles/llm-knowledge-base-karpathy-wiki"
collected_at: "2026-05-28T01:29:35+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [memory, rag, knowledge-base, game-dev-memory, agent-workflow]
evaluated_at: "2026-05-28T01:55:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-28T01:55:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-28T01:55:00+09:00"
stale_after: "2026-06-27"
supersedes: []
next_action: keep_for_reference
gate_reason: |
  Raw/Wiki/Schema の三層化は現在の memory 運用に近く、適用先はある。
  しかし候補は二次記事のパターン紹介に留まり、独自の評価・失敗条件・ゲーム制作への新規示唆が薄いため、~4000字で残す品質に届かない。

---

## raw_excerpt

Slack #shared-reads 由来メモ: 記事は、RAG が失敗する原因を検索精度だけでなく取り込み時の構造化不足として捉え、Raw Layer、Wiki Layer、Schema Layer の 3 層で知識ベースを作る実践として紹介されていた。Raw Layer は元文書を読み取り専用で保持し、Wiki Layer は LLM が生成した構造化ページとして概念単位に分け、Schema Layer は人間が管理する構造ルールや慣習として品質を制御する。操作は Ingest、Query、Lint の 3 種類。特に「クエリ時に毎回ソースを再解釈する」のではなく、取り込み時点で LLM が構造化しておく、という発想が中核としてメモされていた。

## why_relevant_to_games

過去プロトタイプ、cross_review、headless 評価ログを次のゲーム制作で引ける形にする記憶階層の設計材料になる。
