---
title: "OmniGameArena: A Unified UE5 Benchmark for VLM Game Agents with Improvement Dynamics"
url: "https://arxiv.org/abs/2606.09826"
collected_at: "2026-07-08T03:29:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, game-ai, vlm-agent, benchmark, playtest, reflection-loop]
evaluated_at: "2026-08-09T22:10:33+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-11T02:37:54+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-409d1da9037e678a; terminal:memory/shared_reads_candidates/20260611_omnigamearena_vlm_game_agents.md: status posted permalink https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781162534005769; reason:3 open sibling は実投稿済み arXiv work 2606.09826 と一致し題材差がない"
next_action: none
stale_after: "2026-09-08"
supersedes: []
gate_reason: |-
  posted-source index で arXiv:2606.09826 の実投稿と一致したため、Phase 3 投稿対象にしない。
  Improvement Dynamics Curve はゲーム評価に使えるが、既投稿内容との差分がないため duplicate として postponed を維持する。
---

## raw_excerpt
arXiv の要旨によると、OmniGameArena は VLM agent のゲーム評価が「初回スコアだけ」「Solo だけ」「商用 VLM・open-weight VLM・専用 game policy を同じ手順で比べにくい」という問題から出発している。提案は Unreal Engine 5 で作られた 12 本のリアルタイムゲーム benchmark で、Solo 7、PvP 3、Coop 2 を含む。全 game に unified action interface を用意し、cold-start leaderboard だけでなく Improvement Dynamics Curve という reflection harness を使って、tool-using reflector LLM が bounded skill prompt を複数 round で更新する。観測対象は最初の点数だけではなく、反省 round ごとの score 推移と、学んだ skill が held-out task variant にどう移るか。

短い原文フレーズ: "Improvement Dynamics Curve", "held-out task variants"

## why_relevant_to_games
Nao_u 環境の headless 評価や cross_review を、単発成功/失敗ではなく「反省後に何が変わったか」「別 variant に移るか」として記録する材料になる。
