---
title: "Agentic World Modeling: Foundations, Capabilities, Laws, and Beyond"
url: "https://arxiv.org/abs/2604.22748"
collected_at: "2026-06-26T13:44:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [world-model, agent-evaluation, taxonomy, simulation, memory]
---

## raw_excerpt

arXiv:2604.22748 v3。Agentic World Modeling は、AI systems が text generation から sustained interaction を通じた goal accomplishment へ移る時、environment dynamics をモデル化する能力が bottleneck になる、という survey / taxonomy。要旨では "levels x laws" taxonomy を提案する。levels は L1 Predictor、L2 Simulator、L3 Evolver。L1 は one-step local transition operators、L2 は multi-step action-conditioned rollouts、L3 は予測が新しい証拠で外れた時に自分の model を更新する段階。laws は physical、digital、social、scientific の 4 regime。400 以上の研究と 100 以上の代表 system を、model-based RL、video generation、web / GUI agents、multi-agent social simulation、AI-driven scientific discovery まで横断して整理し、failure modes と evaluation practices を比較する。

## why_relevant_to_games

ゲーム制作では、敵 AI、GUI playtester、世界生成、社会シミュレーションを同じ「world model」と呼びがちなので、予測器・シミュレータ・自己更新モデルを分ける整理に使える。
