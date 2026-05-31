---
title: "Game Knowledge Management System: Schema-Governed LLM Pipeline for Executable Narrative Generation in RPGs"
url: "https://www.mdpi.com/2079-8954/14/2/175"
collected_at: "2026-05-30T04:29:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rpg, llm, narrative-generation, engine-validation]
evaluated_at: "2026-05-30T04:32:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-30T04:39:17+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780083447346219"
posted:
  ts: "1780083447.346219"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780083447346219"
  char_count: 4035
  posted_at: "2026-05-30T04:39:17+09:00"
stale_after: "2026-06-29"
supersedes: []
next_action: none
gate_reason: |-
  LLM 生成を自由文ではなく schema-governed knowledge artifact として扱い、repair、engine admission、Unity runtime probe まで接続する中核が明確。
  自動構造評価、engine-level playability、人間評価を合わせており、Nao_u 側の prototype validation / design_log / headless 検証に直接移せる。
suggested_post_outline:
  overview_angle: "LLM narrative generation を「文章生成」ではなく、エンジンで実行可能な知識成果物の生成・修復・受理プロセスとして読む。"
  analysis_axis: "schema 制約、normalization repair、engine-aligned admission、Unity probe、人間評価の接続が、生成品質と実行可能性をどう分けて測っているか。"
  application_target: "ゲームプロトタイプのクエスト、NPC、対話条件、interaction rules を design_log と headless probe に落とし込む際の検証ライフサイクル。"
  pros_cons: "メリットは LLM 出力を実装可能性で縛れる点。デメリットは schema 設計と admission rule が重く、小規模作品では初期コストが高い点。"
  verdict_pre: "部分採用。完成形の大規模 KMS ではなく、schema + repair + engine probe の最小セットを制作サイクルへ輸入する。"

---

## raw_excerpt

原文の要点メモ。G-KMS は、LLM に自由形式の narrative text を出させるのではなく、characters / quests / dialogue logic / interaction rules を engine-executable な knowledge artifacts として扱う。pipeline は knowledge grounding、schema-governed generation、normalization-based repair、engine-aligned admission、Unity runtime application を統合する。評価は compact 2D Unity-based RPG benchmark 上で、automated structural and semantic analyses、engine-level playability probes、controlled human player study を組み合わせる。著者らは、system-level metrics と player-perceived narrative quality の alignment も報告している。

## why_relevant_to_games

LLM 生成をゲームに入れる時に、schema、修復、engine-level probe、人間評価を同じ lifecycle に置く候補。local game prototype の design_log と headless 検証のつなぎ方に近い。
