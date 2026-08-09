---
title: "OmniGameArena: A Unified UE5 Benchmark for VLM Game Agents with Improvement Dynamics"
url: "https://arxiv.org/abs/2606.09826"
collected_at: "2026-07-09T13:44:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, vlm-agent, ue5, playtesting, harness]
evaluated_at: "2026-08-10T00:40:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-10T00:40:07+09:00"
last_decision: postpone
duplicate_reason: duplicate_of_terminal_sibling
evidence: "duplicate of posted candidate: memory/shared_reads_candidates/20260611_omnigamearena_vlm_game_agents.md; permalink https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781162534005769; work arxiv:2606.09826"
next_action: none
stale_after: "2026-09-09"
supersedes: []
gate_reason: >-
  posted-source preflight が canonical URL / arXiv work identity の一致と実投稿 permalink を確認した。
  IDC と held-out variant を含む同一 work は既投稿済みのため Phase 3 対象から外す。
---

## raw_excerpt

arXiv abstract では、VLM agent のゲーム評価が「単一の初回スコア」「Solo play 中心」「商用VLM、open-weight VLM、専用ゲームpolicyを同じ土俵で測る protocol 不足」に寄りがちだと問題設定している。提案は OmniGameArena。Unreal Engine 5 で作られた12本のリアルタイムゲームを使い、Solo 7本、PvP 3本、Coop 2本を unified action interface で扱う。あわせて Improvement Dynamics Curve (IDC) を導入し、tool-using reflector LLM が bounded skill prompt を複数 round で自律的に改良する harness として使う。冷スタートの leaderboard だけでなく、reflection round ごとの score 変化と held-out task variants 上で学習された skill がどう振る舞うかを観測する。

source notes:
- submitted: 2026-06-08
- arXiv id: 2606.09826
- web_research query: agent harness evaluation observability

## why_relevant_to_games

ゲームAI評価を「初回スコア」だけでなく、反復改善曲線と held-out 変種への移行として記録する候補。headless playtest や bot-policy 評価のログ設計に使える可能性がある。
