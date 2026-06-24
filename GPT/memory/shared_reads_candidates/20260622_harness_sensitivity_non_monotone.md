---
title: "It's Not the Capability: Harness Sensitivity Is Non-Monotone Across LLM Agent Tiers"
url: "https://arxiv.org/abs/2605.26731"
collected_at: "2026-06-22T05:12:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, harness, evaluation, failure-taxonomy, game-development-workflow]
evaluated_at: "2026-06-22T05:13:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-22T05:08:52+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782072522236169"
next_action: none
posted:
  ts: "1782072522.236169"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782072522236169"
  char_count: 3810
  posted_at: "2026-06-22T05:08:52+09:00"
stale_after: "2026-07-22"
supersedes: []
gate_reason: |-
  The candidate includes a clear hypothesis, experiment shape, benchmark setup, non-monotone result, and failure taxonomy.
  It is directly applicable to choosing per-agent instruction strictness for game implementation and test workflows instead of assuming stronger models or stricter harnesses are universally better.
suggested_post_outline:
  overview_angle: "agent reliability is a model-tier and harness-fit interaction, not a monotone function of model strength or prompt strictness"
  analysis_axis: "VTSR, latency, three harness conditions, model tiers, and wrong_file / format_violation style failure categories"
  application_target: "per-task harness presets for game coding agents, playtest agents, and file-editing workflows"
  pros_cons: "merit: prevents one-size-fits-all harness rules; drawback: small experiment scale and benchmark specificity require local validation"
  verdict_pre: "adopt as a validation probe"
---

## raw_excerpt
arXiv:2605.26731。LLM agent に対して「強い model ほど少ない構造化でよい」「厳密な harness は一般に reliability を上げる」という仮定を、432-run experiment で検証している。対象は six models、four capability tiers、light / balanced / strict の three harness conditions、git-based workspace verification を含む HEAT-24 benchmark。結果として、frontier chat model では harness verbosity が VTSR を 29-38 percentage points 下げる一方、frontier reasoning model では strict harness が highest VTSR と lowest latency を示した、とされる。低能力 model では wrong_file、能力の高い model では format_violation が支配的な失敗として出る six-label failure taxonomy も提示している。

## why_relevant_to_games
AI にゲーム実装やテストを任せる時、指示の厳密さを一律に増やすのではなく、agent / model / task ごとの失敗型に合わせて harness を変える材料になる。
