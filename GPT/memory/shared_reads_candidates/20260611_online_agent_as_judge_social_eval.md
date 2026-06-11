---
title: "Online Agent-as-a-Judge: Situation-Generating Evaluation for Interactive Agents"
url: "https://arxiv.org/abs/2606.08200"
collected_at: "2026-06-11T16:14:28.9042554+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc, social-simulation, agent-evaluation, playtest, llm-as-judge]
---

## raw_excerpt

短い原文断片: "situation-generating evaluation framework"

arXiv 2606.08200。Online Agent-as-a-Judge は、interactive social agents を受動的なログ採点だけで評価すると、衝突対応や感情的サポートのような criterion-relevant situation がそもそも発生せず、能力が見えないという問題から出発する。提案手法では judge agent を target agent と同じ環境内に置き、native dialogue / action protocol を通じて相互作用させ、評価基準に必要な状況を能動的に引き出す。

実験は life-simulation environment の five-character family scenario で、role consistency、memory continuity、coordination、emotional support、conflict handling など designer-authored criteria を使う。Online judge は offline LLM-as-a-Judge や offline Agent-as-a-Judge と比べて、criterion coverage と human-label agreement を上げたと報告されている。特に自然発生しにくい conflict handling と emotional/social support で改善が大きい。

## why_relevant_to_games

NPC 会話、社会シム、チュートリアル内対話の評価で、ログを眺めるだけでは出ない失敗を judge NPC が誘発する設計に使える。プレイテスト script を「状況生成 agent」として組む発想の候補。
