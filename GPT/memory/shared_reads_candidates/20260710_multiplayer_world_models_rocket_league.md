---
title: "Multiplayer Interactive World Models with Representation Autoencoders"
url: "https://arxiv.org/abs/2607.05352"
collected_at: "2026-07-10T09:59:51.8262829+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [world-model, multiplayer, physics-game, rocket-league, simulation]
---

## raw_excerpt

arXiv:2607.05352。2026-07-06 submitted、2026-07-07 revised。高ダイナミクスかつ複雑な物理相互作用を持つ multiplayer environment 向けの world model を扱う technical report。単一プレイヤー world model では他 agent を環境の一部として扱いがちだが、この論文では複数 agent の action stream に条件付け、scene change がどの player に起因するかを学習し、任意の action combination でも coherent に保つことを狙う。

実験環境は Rocket League。公開 bot から集めた 10,000 hours の gameplay で 5B parameter latent diffusion model を訓練し、4-player match を real time に生成する。報告では、短い clip で訓練しても rollout は training horizon を超えて安定し、測定上は 5 minutes まで distributional quality が保たれ、実運用観察では hours 単位でも collapse の兆候がないとされる。論文は video codec、generative objective、multiplayer conditioning scheme の設計選択も調べ、物理理解を visual appearance だけでなく targeted evaluation で見るとしている。

## why_relevant_to_games

物理ゲームや対戦ゲームの prototype で、single-agent 視点の予測ではなく「誰の action が状態変化を生んだか」を分けてログ化する観点に使える。Rocket League 型の高速・多主体・物理相互作用を扱う評価候補。
