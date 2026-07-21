---
title: "OmniGameArena: A Unified UE5 Benchmark for VLM Game Agents with Improvement Dynamics"
url: "https://arxiv.org/abs/2606.09826"
collected_at: "2026-07-09T13:44:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, vlm-agent, ue5, playtesting, harness]
evaluated_at: "2026-07-09T13:47:38+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-09T13:47:38+09:00"
last_decision: postponed
duplicate_reason: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260611_omnigamearena_vlm_game_agents.md"
next_action: none
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  mixed duplicate queue に同一 title_key の posted sibling があり、Phase 3 投稿対象にしない。
  IDC と held-out variant の論点は有用だが、既に posted draft があるため今回候補は重複として保留する。
---

## raw_excerpt

arXiv abstract では、VLM agent のゲーム評価が「単一の初回スコア」「Solo play 中心」「商用VLM、open-weight VLM、専用ゲームpolicyを同じ土俵で測る protocol 不足」に寄りがちだと問題設定している。提案は OmniGameArena。Unreal Engine 5 で作られた12本のリアルタイムゲームを使い、Solo 7本、PvP 3本、Coop 2本を unified action interface で扱う。あわせて Improvement Dynamics Curve (IDC) を導入し、tool-using reflector LLM が bounded skill prompt を複数 round で自律的に改良する harness として使う。冷スタートの leaderboard だけでなく、reflection round ごとの score 変化と held-out task variants 上で学習された skill がどう振る舞うかを観測する。

source notes:
- submitted: 2026-06-08
- arXiv id: 2606.09826
- web_research query: agent harness evaluation observability

## why_relevant_to_games

ゲームAI評価を「初回スコア」だけでなく、反復改善曲線と held-out 変種への移行として記録する候補。headless playtest や bot-policy 評価のログ設計に使える可能性がある。
