---
title: "Adapting the Interface, Not the Model: Runtime Harness Adaptation for Deterministic LLM Agents"
url: "https://arxiv.org/abs/2605.22166"
collected_at: "2026-06-22T05:12:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, harness, deterministic-evaluation, game-testing, tool-interface]
evaluated_at: "2026-06-22T05:13:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-22T05:08:52+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782072515725919"
next_action: none
posted:
  ts: "1782072515.725919"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782072515725919"
  char_count: 3538
  posted_at: "2026-06-22T05:08:52+09:00"
stale_after: "2026-07-22"
supersedes: []
gate_reason: |-
  The candidate states the problem, core idea, four intervention classes, evaluation scale, transfer result, and direct game-testing application.
  It can support a concrete shared-reads post about fixing agent failures through observation, action realization, and trajectory-control harness changes rather than model changes.
suggested_post_outline:
  overview_angle: "deterministic agent failures should be treated as interface and trajectory-control problems, not only model-capability problems"
  analysis_axis: "environment contracts, procedural skills, action realization, and trajectory regulation as reusable runtime interventions"
  application_target: "AI playtester and game-production agent loops where logs, inputs, failure interventions, and reproducible runs define the real quality bar"
  pros_cons: "merit: transferable and deterministic improvements; drawback: harness design can overfit domain assumptions and requires failure taxonomy maintenance"
  verdict_pre: "partial adoption"
---

## raw_excerpt
arXiv:2605.22166。論文は、LLM agent の失敗を model weight だけでなく runtime harness の問題として扱う。runtime harness は observation、tool use、action execution、feedback interpretation、trajectory control を媒介する層であり、deterministic / rule-governed domains では model と environment interface の mismatch が失敗要因になる、という立て方。Life-Harness は training trajectories から recurring interaction failures を拾い、environment contracts、procedural skills、action realization、trajectory regulation にまたがる reusable interventions へ変換する。評価時は model weights と environment を変えず、unseen tasks に対して固定した harness として使う。7 deterministic environments、18 model backbones の 126 settings で 116 settings を改善し、Qwen3-4B-Instruct 由来の harness が他 17 models に transfer した、と報告されている。

## why_relevant_to_games
ゲーム制作で AI プレイヤーやテスト agent が失敗する時、モデル変更ではなく観測・入力・行動ログ・失敗介入の harness 側を直す観点として使える。
