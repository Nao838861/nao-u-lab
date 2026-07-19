---
title: "Reinforcement Learning in Super Mario Bros: Curriculum, Pedagogy, and Optimal Level Design in World 1-1"
url: "https://arxiv.org/abs/2606.29511"
collected_at: "2026-07-19T17:01:45+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, level-design, tutorial, reinforcement-learning, curriculum]
---

## raw_excerpt

arXiv の要旨では、Super Mario Bros. の World 1-1 が、説明文ではなくステージ構成そのもので基礎メカニクスを教えるという通説を、reinforcement learning で測定できるか検討する。著者らは World 1-1 を完全離散環境として再実装し、同じ level の複雑さを段階的に変えた三条件で Q-Learning、SARSA、Monte Carlo、DQN を比較する。要旨では Monte Carlo が 94.9% ± 1.5% の win rate を示し、DQN の 76.4% ± 3.4% を上回ったと報告される。説明として、Monte Carlo は最短経路だけを取るのではなく、勝利経路上の中間報酬を最大化する学習を行ったとされる。続く curriculum experiment では、World 1-1 を構成する六つの canonical segment の順序を十二条件で入れ替える。原典順は convergence が最も速く、learning efficiency が最も高く、catastrophic failure がゼロだった唯一の条件であり、無作為な並べ替えには三基準を同時に満たすものがなかったと要旨は述べる。

## why_relevant_to_games

チュートリアルを説明文の有無ではなく、区間順序が学習速度・失敗率・到達率へ与える影響として検証する例になる。敵編隊や足場配置の順番を入れ替える headless probe の着想に接続できる。
