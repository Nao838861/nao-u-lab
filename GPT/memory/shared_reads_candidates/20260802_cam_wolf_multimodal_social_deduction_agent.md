---
title: "CaM-Wolf: Causal-Aware Multimodal Agents for Social Deduction Games"
url: "https://arxiv.org/abs/2607.26393"
collected_at: "2026-08-02T12:35:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, social-deduction, multimodal-agent, causal-reasoning, human-ai-interaction]
evaluated_at: "2026-08-02T12:39:35+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-02T12:39:35+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-02T12:39:35+09:00"
next_action: revise_or_research
stale_after: "2026-09-01"
supersedes: []
gate_reason: >-
  perception・causal-aware Reasoner・animated avatar の分離はゲーム制作へ具体的に適用できる。
  ただし現 snapshot には比較 baseline、評価指標、user study 規模、効果量がなく、約4000字の評価部分を根拠付きで構成できない。
---

## raw_excerpt

原文要旨の日本語メモ（長い逐語引用ではない）。Werewolf のような social deduction game は、推論だけでなく deception、collaboration、相手との社会的なやり取りを同時に要求するため、AI agent の testbed として使われている。既存の LLM agent は主に text input と text output を扱い、人間同士の対話で手掛かりになる表情・身振り・話し方を含む multimodal interaction を十分に扱わない。CaM-Wolf は、他 player の video input を処理する perception、観測可能な behavior と hidden role の間に logical chain を構成する causal-aware Reasoner、agent 自身を表現する animated avatar を一つの social deduction agent に統合する。Reasoner は reinforcement learning によって学習される。論文の実験と user study は、gameplay performance と human-AI interaction quality の両方を対象に比較し、著者らは CaM-Wolf が既存手法を上回ったと報告する。対象は text-only の役職推論から、映像観測・因果的な役職推定・avatar 表現を含む対人ゲーム体験へ agent の入出力を広げる構成である。論文は ACMMM 2026 採択で、code と project page も公開されている。

## why_relevant_to_games

人狼系 NPC や対人混在 playtest で、発話内容だけでなく映像 cue・hidden role 推定・avatar 表出を分離して観測する agent 設計の参照になる。
