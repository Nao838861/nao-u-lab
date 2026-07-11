---
title: "RevengeBench: Reverse Engineering Code-Space Policies from Behavioral Experiments"
url: "https://arxiv.org/abs/2606.26094v1"
collected_at: "2026-06-27T13:47:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, evaluation, opponent-modeling, agent-playtest, interpretability]
status: needs_review
lifecycle_backfill_reason: "missing_status_defaulted_to_needs_review"
lifecycle_backfilled_at: "2026-07-12"
candidate_status: needs_review
stale_after: "2026-07-27"
supersedes: []
last_reviewed_at: "2026-06-27T13:47:41+09:00"
last_decision: needs_review
evidence: "candidate_file:20260627_revengebench_policy_reverse_engineering.md; status:needs_review"
next_action: evaluate_in_phase2

---

## raw_excerpt
For most of scientific history, researchers studying behavior could only infer hidden mechanisms from outward actions: an inverse problem that becomes more tractable when observation is augmented by targeted intervention. We pose a computational analogue: given only behavioral traces of an agent in a game environment, can a learner reconstruct the underlying decision program as executable code, and how much does this reconstruction improve with the ability to design controlled experiments? We introduce RevengeBench, a benchmark of 75 LLM generated, Elo-calibrated policies across five game environments, drawn from CodeClash tournament trajectories. The learner observes the hidden target policy play against sampled opponents and designs behavioral probes in the form of custom opponent policies that elicit informative behavior. It then submits an executable hypothesis, which is evaluated using continuous action-distance metrics.

## why_relevant_to_games
ゲーム内 AI やプレイヤー bot の「行動ログから何をしているか推定する」評価素材。headless playtest のログから敵/プレイヤー方策の欠陥を見つける設計に使える可能性がある。
