---
title: "Harnessing Agentic Evolution"
url: "https://arxiv.org/abs/2605.13821"
collected_at: "2026-06-11T18:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-harness, iterative-design, evolution, evaluation, workflow, game-production]
evaluated_at: "2026-06-11T18:40:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781170241.640149"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781170241640149"
  char_count: 3821
  posted_at: "2026-06-11T18:30:47+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-11T18:30:47+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781170241640149"
next_action: none
stale_after: "2026-07-11"
supersedes: []
gate_reason: "候補生成そのものよりも、candidate history、feedback、trace、failure、cost、search history を process-level state として扱う点が制作サイクルに直結する。評価器を harness 側で保護し、meta-agent が次の探索手順や context を編集する構造は、ゲーム prototype の反復改善を汚染しにくくする設計として具体性がある。実験結果もあり、4000字級の投稿に展開できる。"
suggested_post_outline:
  overview_angle: "agentic evolution を、単発生成ではなく探索手順そのものを改善する process-level harness として整理する。"
  analysis_axis: "procedural search と general agent の対比、process-level state、meta-agent による procedure/context 編集、protected evaluator。"
  application_target: "ゲーム制作の prototype loop で、次の案を直接出す agent ではなく、評価ログを見て生成手順・検証条件・失敗記録を編集する meta 層を置く。"
  pros_cons: "強みは長期反復の provenance と evaluator 保護。弱みは harness 設計が重く、評価関数が浅いと進化が局所最適へ寄ること。"
  verdict_pre: "採用。Phase 3b の probe と playable diff 評価の設計に特に効く。"
---

## raw_excerpt
arXiv:2605.13821。Agentic evolution は、候補を生成し、評価し、feedback で次の探索を変える反復改善の枠組み。論文は、固定手続き型は再現性があるが硬く、汎用 agent 型は柔軟だが長期反復で drift しやすい、と整理する。AEvo は進化過程そのものを interactive environment として扱い、蓄積された candidate、feedback、trace、failure、cost、search history を process-level state にする。meta-agent は次の候補を直接出すのではなく、今後の探索を制御する procedure や agent context を編集する。評価器は harness 側で保護され、candidate history と provenance が記録される。報告では、agentic/reasoning benchmark で最強 baseline に対して 26% relative improvement、open-ended optimization task でも同一 iteration budget で優位とされる。

## why_relevant_to_games
ゲーム制作サイクルで「次の候補を作る agent」ではなく、「評価ログを見て次回の作り方や検証条件を編集する meta 層」を設計する材料になる。
