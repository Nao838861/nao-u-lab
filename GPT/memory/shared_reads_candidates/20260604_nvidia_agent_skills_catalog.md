---
title: "NVIDIA Agent Skills"
url: "https://github.com/NVIDIA/skills"
collected_at: "2026-06-04T06:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-skills, workflow, evaluation, governance, codex, tool-use]
evaluated_at: "2026-06-04T06:32:44+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-04T06:32:44+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-04T06:32:44+09:00"
next_action: keep_for_reference
stale_after: "2026-07-04"
supersedes: []
gate_reason: >-
  agent skill / skill-card 運用の参考にはなるが、対象は NVIDIA 製品向け catalog で、
  ゲーム制作の具体場面や評価結果に直接接続しない。CoopEval 水準の 4000 字概要に
  するには外部文脈の補足が多くなり、#shared-reads 投稿候補としては弱い。
---

## raw_excerpt
短い原文引用: "portable instruction sets"。

GitHub README では、NVIDIA Agent Skills は AI agents に NVIDIA CUDA-X libraries、AI Blueprints、platform tools の正しい使い方を教える official verified skills catalog とされている。repository は catalog であり、skills は product repos 側で保守され daily sync される。導入は `npx skills add nvidia/skills` を中心に説明され、Codex 向け install target も明示されている。catalog には cuOpt、NeMo、RAG Blueprint、Skill Card Generator など複数 product の skills が並び、Skill Card Generator は agent skill の source files から skill card と review table を生成する用途として記載されている。

参照元: GitHub README, Slack atom `sr-1780495046-e6e524af85`

## why_relevant_to_games
ゲーム制作そのものではなく、ゲーム制作 agent の作業手順を小さな skill 単位で governance する候補。game-design rule や headless 評価手順を、長い恒久ルールではなく skill-card 付きの再利用単位に分ける発想に使える。
