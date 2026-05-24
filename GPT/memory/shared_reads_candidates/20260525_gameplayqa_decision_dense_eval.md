---
title: GameplayQA: A Benchmarking Framework for Decision-Dense POV-Synced Multi-Video Understanding of 3D Virtual Agents
url: https://arxiv.org/abs/2603.24329
collected_at: 2026-05-25T07:06:02+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, evaluation, headless, gameplay-understanding, benchmark]
---

## raw_excerpt

ACL 2026 accepted paper。3D virtual agents の first-person gameplay video を対象に、rapid state changes、entity attribution、concurrent multi-agent behavior を理解できるかを評価する benchmark。multiplayer 3D gameplay videos に対して 1.22 labels/second の密な annotation を行い、Self / Other Agents / World の triadic system で states, actions, events を time-synced caption として構造化している。そこから 2.4K diagnostic QA pairs を作り、cognitive complexity 3 levels と distractor taxonomy で model failure を分析する。

短い原文引用: "decision density of the game."

評価では frontier MLLMs が human performance に届かず、temporal grounding、cross-video grounding、agent-role attribution で失敗する、とされる。gameplay を「画面から何が起きたか」だけでなく、「誰が、いつ、何に対して、どの world state の中で行動したか」に分解している点が特徴。

## why_relevant_to_games

headless gameplay log を後から評価する時、Self / Other / World の三分割、time-synced event density、distractor taxonomy を参照できる。AI がゲームを遊べたかではなく、何を見落として評価を誤ったかの記録形式候補。
