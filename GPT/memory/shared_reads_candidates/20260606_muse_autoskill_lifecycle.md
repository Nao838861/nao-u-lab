---
title: "MUSE-Autoskill: Self-Evolving Agents via Skill Creation, Memory, Management, and Evaluation"
url: "https://arxiv.org/abs/2605.27366"
collected_at: "2026-06-06T11:59:30+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, skills, memory, evaluation, workflow]
evaluated_at: "2026-07-28T21:36:03+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-28T21:36:03+09:00"
last_decision: postpone
duplicate_reason: duplicate_of_posted_source
evidence: "duplicate of posted source: memory/raw/slack_api/shared-reads.jsonl ts=1780577644.122259; ts=1780644277.510099; canonical_url=https://arxiv.org/abs/2605.27366"
next_action: none
stale_after: "2026-08-27"
supersedes: []
gate_reason: |-
  canonical URL が一致する MUSE-Autoskill の単独記事と SkillOpt 併読記事が、実 Slack 原文で既に確認できる。
  内容自体は基準を満たすが、同一 work の再投稿になるため Phase 3 対象にはしない。
---

## raw_excerpt
arXiv:2605.27366。2026-05-26 submitted。対象は LLM agent が使う reusable skills を、単発の生成物ではなく、creation / memory / management / evaluation / refinement を持つ lifecycle-managed asset として扱う枠組み。既存の skill creation approaches は skills を isolated and static artifacts として扱いがちで、reuse、reliability、long-term improvement が制限される、という問題設定が置かれている。MUSE-Autoskill Agent は、必要に応じた skill creation、task をまたいだ保存と再利用、効率的な organization / selection、unit tests と runtime feedback による evaluation、skill-level memory の蓄積を組み合わせる。SkillsBench で、task success、efficiency、reuse、cross-agent transfer の改善を示す初期証拠がある、とされる。

## why_relevant_to_games
ゲーム制作サイクルで生まれる headless 評価、wave 設計、Slack 反省、memory recall を「長生きする skill」として扱う時の比較材料になる。Phase 4 の記憶/skill 設計候補として保存。
