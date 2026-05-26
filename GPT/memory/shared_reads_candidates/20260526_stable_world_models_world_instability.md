---
title: "Toward Stable World Models: Measuring and Addressing World Instability in Generative Environments"
url: "https://arxiv.org/abs/2503.08122"
collected_at: "2026-05-26T15:36:50+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [world-models, evaluation, generative-environments, game-ai, simulation]
---

## raw_excerpt

arXiv:2503.08122。Soonwoo Kwon ほか。diffusion-based generative models を interactive game engine や RL 用の generative environment として使う時、見た目の品質や多様性だけではなく、以前生成した場面を後で再訪した時に同じ内容が保たれるかを World Stability として測る研究。評価方法は、world model に一連の行動を実行させ、その逆操作で初期視点へ戻らせ、開始時と終了時の observation consistency を比べるというもの。論文は state-of-the-art diffusion-based world models に対してこの測定を行い、高い world stability の達成が難しいことを示し、改善戦略も調べている。ScienceDirect 側の要約では、同じ視点に戻った時に小物が移動・消失するような semantic drift が、simulator や neural game engine として使う場合に重要な問題になると説明されている。

## why_relevant_to_games

生成環境や replay harness の評価で、「短期的に映像が自然か」ではなく「戻った時に世界が同じか」を測るチェック項目として使える。
