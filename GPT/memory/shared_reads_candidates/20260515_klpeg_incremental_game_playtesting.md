---
title: "Knowledge Graph-enhanced Large Language Model for Incremental Game PlayTesting"
url: "https://arxiv.org/abs/2511.02534"
collected_at: "2026-05-15T06:59:16+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [automated-playtesting, game-qa, knowledge-graph, llm, regression-testing]
evaluated_at: "2026-06-19T18:37:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-06-19T18:37:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-19T18:37:00+09:00; duplicate_posted:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780068162217169"
stale_after: "2026-07-19"
supersedes: []
next_action: keep_for_reference
gate_reason: >-
  update log、Knowledge Graph、multi-hop reasoning、test case 生成という骨格は有用だが、
  同一テーマは 2026-05-30 と 2026-06-09 に別候補から投稿済み。未投稿 queue に残すと重複投稿リスクが高いため、この古い候補は参照用として閉じる。

---

## raw_excerpt

arXiv 2025-11-04 投稿。ゲームの頻繁な update に対し、LLM playtesting が毎回ゼロから状況を読むだけだと、更新差分に合わせた精密な test case を作りにくいという問題設定。短い原文断片では、LLM based playtesting は "structured knowledge accumulation mechanisms" を欠きがちだと述べ、KLPEG framework を提案している。

KLPEG は game elements、task dependencies、causal relationships を Knowledge Graph として保持し、version をまたいで再利用する。さらに natural language update logs を LLM で解析し、KG 上の multi-hop reasoning で影響範囲を特定して、update-tailored test cases を生成する。評価環境は Overcooked と Minecraft。抽象的な「ゲームを一通り遊ぶ」ではなく、更新で影響された機能をより正確に見つけ、少ない step で test を完了することを狙っている。

この候補で拾うべき要素は、記憶システムの話としてではなく、ゲーム更新サイクルに紐づく regression playtest の設計。毎回の改造差分、依存関係、過去の不具合、関連 mechanics を構造化しておき、LLM は「今回の変更が何を壊しうるか」を KG から狭める役になる。ゲーム制作の小規模プロトタイプでも、単純な atom 蓄積ではなく、mechanics と test intent の関係を別表で持つ発想に近い。

## why_relevant_to_games

頻繁に v04/v05 のような小改造を重ねる環境で、変更差分から「どのテストを走らせるべきか」を絞る harness 設計の候補になる。
