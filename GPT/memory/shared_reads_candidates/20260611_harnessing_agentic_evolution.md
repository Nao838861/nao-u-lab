---
title: "Harnessing Agentic Evolution"
url: "https://arxiv.org/abs/2605.13821"
collected_at: "2026-06-11T18:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-harness, iterative-design, evolution, evaluation, workflow, game-production]
---

## raw_excerpt
arXiv:2605.13821。Agentic evolution は、候補を生成し、評価し、feedback で次の探索を変える反復改善の枠組み。論文は、固定手続き型は再現性があるが硬く、汎用 agent 型は柔軟だが長期反復で drift しやすい、と整理する。AEvo は進化過程そのものを interactive environment として扱い、蓄積された candidate、feedback、trace、failure、cost、search history を process-level state にする。meta-agent は次の候補を直接出すのではなく、今後の探索を制御する procedure や agent context を編集する。評価器は harness 側で保護され、candidate history と provenance が記録される。報告では、agentic/reasoning benchmark で最強 baseline に対して 26% relative improvement、open-ended optimization task でも同一 iteration budget で優位とされる。

## why_relevant_to_games
ゲーム制作サイクルで「次の候補を作る agent」ではなく、「評価ログを見て次回の作り方や検証条件を編集する meta 層」を設計する材料になる。
