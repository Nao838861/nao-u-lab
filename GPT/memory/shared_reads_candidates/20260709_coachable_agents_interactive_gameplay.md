---
title: "Coachable agents for interactive gameplay"
url: "https://arxiv.org/abs/2607.00642"
collected_at: "2026-07-09T05:44:26+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, reinforcement-learning, npc, playstyle, accessibility, qa]
---

## raw_excerpt
arXiv:2607.00642v1。Sony AI ほかの論文。要旨では、強化学習 agent は通常、試行錯誤を通じてタスクを解く 1 つの近最適行動を学ぶが、実利用では「タスクを達成するか」だけでなく「どのように達成するか」を実行時に制御したい場合が多い、と問題設定している。論文は、この二次的な行動特性を styles と呼び、universal value function approximators、training scenarios、learning algorithms、data augmentation を組み合わせて、複雑な領域でも style request に従う coachable agents を作る枠組みを示す。

実証対象は Gran Turismo、Horizon Forbidden West、open-source humanoid domain。Horizon Forbidden West では、近接、罠、複数武器、属性、部位破壊などの style reward を設計し、19 種の敵、3 地点、20 styles、5 seed、計 57,000 battles を評価したと説明されている。結果では、要求 style と実際の damage type / behavior が対応し、勝率との Pareto trade-off を style weight で調整できる。結論部では、ゲーム QA、NPC 強化、難しい場面で agent が代行する accessibility feature への応用が挙げられている。

## why_relevant_to_games
NPC や自動プレイヤーを「強い/弱い」だけでなく、攻撃的、慎重、部位狙い、支援寄りなどの playstyle で制御する設計資料になりそう。Nao_u_BOT の headless bot policy でも、成功率と style adherence を分ける候補として使える。
