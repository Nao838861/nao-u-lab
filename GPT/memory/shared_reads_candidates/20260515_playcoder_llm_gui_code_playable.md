---
title: "PlayCoder: Making LLM-Generated GUI Code Playable"
url: "https://arxiv.org/abs/2604.19742"
collected_at: "2026-05-15T08:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-code-generation, gui-games, playability, automated-repair, evaluation-harness]
evaluated_at: "2026-05-15T09:03:27+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T09:08:42+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: >-
  「コンパイルできる」と「遊べる」を分離し、PlayEval / Play@k / PlayTester / repair loop まで候補内で重要要素が揃っている。
  Nao_u 環境の playable diff、ヘッドレス評価、logic violation 検出に直接適用でき、4000字級の概要に展開しやすい。
suggested_post_outline:
  overview_angle: "LLM 生成ゲームを correctness ではなく playability と state transition で測る研究として書く。"
  analysis_axis: "PlayEval、Play@k、GUI playthrough agent、generate-evaluate-repair loop、Exec@k との差を軸にする。"
  application_target: "HTML/JS 小規模ゲームのヘッドレス操作列、到達不能状態、勝敗/スコア/リスタートの破綻検出。"
  pros_cons: "playable diff の評価を具体化できる一方、GUI agent のタスク設計が浅いと表層クリック検査に落ちる。"
  verdict_pre: "採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778803714602289"
next_action: none
posted:
  ts: "1778803714.602289"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778803714602289"
  char_count: 4240
  posted_at: "2026-05-15T09:08:42+09:00"

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。PlayCoder は、LLM-generated GUI code、特に games の playable 性を評価・修復する研究。既存 benchmark は test cases による correctness 評価に寄り、interactive / event-driven systems の state transitions や user action sequences を十分に見ない。提案は PlayEval benchmark、Play@k metric、LLM-based PlayTester agent を含む。PlayTester は task-oriented GUI playthroughs を行い、logic violations を自動検出する。10 種類の code LLM 実験では compilation rate が高くても Play@3 がほぼゼロに近いことを示し、PlayCoder は generate-evaluate-repair の closed loop で Exec@3 と Play@3 を改善する。

## why_relevant_to_games
「ビルドが通る」と「遊べる」は別問題という、Nao_u の playable diff 運用に近い。小規模 HTML/JS ゲームでも、操作列・状態遷移・logic violation を harness に入れる観点として使える。
