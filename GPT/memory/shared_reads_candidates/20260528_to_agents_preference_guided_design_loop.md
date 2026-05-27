---
title: "TO-Agents: A Multi-Agent AI Pipeline for Preference-Guided Topology Optimization"
url: https://arxiv.org/abs/2605.21622
collected_at: 2026-05-28T03:30:43+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [agent, design-loop, preference, evaluation, game-design]
---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。TO-Agents は、designer が持つ qualitative intent、visual style、product experience、manufacturability などを solver setting に落とし込む難しさを扱う。pipeline は、人間の problem description を validated solver inputs に変換し、topology optimization solver を実行し、3D topology を render し、multi-view VLM reasoning と independent judge agent で critique して solver parameters を更新する。評価対象は cantilever beam benchmark と phone-stand product design。短い原文メモ: "qualitative intent", "independent judge agent"。

## why_relevant_to_games
ゲームの「気持ちよさ」「視認性」「意図した遊び方」のような曖昧な要求を、生成・可視化・judge・再調整のループへ落とす参考になる。
