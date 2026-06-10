---
title: "Mage: Multi-Axis Evaluation of LLM-Generated Executable Game Scenes Beyond Compile-Pass Rate"
url: "https://arxiv.org/abs/2605.07342"
collected_at: "2026-06-08T22:58:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, evaluation, llm-codegen, unity, executable-games, headless]
evaluated_at: "2026-06-08T22:47:08+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-08T22:47:08+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-08T22:47:08+09:00; duplicate_of:memory/shared_reads_candidates/20260517_mage_multi_axis_game_scene_eval.md"
next_action: keep_for_reference
stale_after: "2026-07-08"
supersedes: []
gate_reason: |-
  compile/runtime/structural fidelity/mechanism adherence の評価軸が明確で、headless prototype 判定への適用性も高い。
  ただし同一URLの先行 candidate が 2026-05-17 に #shared-reads 投稿済みで、再投稿に足る新規観点がないため fail。
---

## raw_excerpt

arXiv 2605.07342。2026-05-08 submitted。Hugh Xuechen Liu, Kivanc Tatar。

原文の短い抜粋: "compile rate is anti-correlated with functional correctness"

論文概要メモ: Mage は LLM が生成した executable game scene を、compile success だけでなく runtime success、structural fidelity、mechanism adherence の 4 軸で評価する提案。858 generation attempts、4 つの open-weight LLM、26 hand-crafted Unity goal pattern playable concepts、2 種類の IR granularity を対象にしている。直接 NL-to-C# は runtime-pass rate が高い一方で構造が空疎になり、mechanism F1 が低い。IR conditioning は runtime rate を下げるが domain-faithful structure を回復するという結果が示されている。

## why_relevant_to_games

自作ゲームの headless 評価で「起動した」「死ななかった」だけを合格にしないための評価軸候補になる。仕様通りの機構が発火したか、構造がゲームとして意味を持つかを見る入口。
