---
title: "Reinforcement Learning in Super Mario Bros: Curriculum, Pedagogy, and Optimal Level Design in World 1-1"
url: "https://arxiv.org/abs/2606.29511"
collected_at: "2026-07-19T17:01:45+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, level-design, tutorial, reinforcement-learning, curriculum]
evaluated_at: "2026-07-19T17:08:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784449179.598279"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784449179598279"
  char_count: 4212
  posted_at: "2026-07-19T17:19:39+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-19T17:19:39+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784449179598279"
next_action: none
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  World 1-1 の再実装、4種の学習法比較、具体的な勝率、6区間の12順序条件、収束速度・学習効率・catastrophic failure の結論が揃う。
  チュートリアル区間の順序を headless probe で比較する適用先が明確で、結果の解釈と限界を含む4000字級の分析に耐える。
suggested_post_outline:
  overview_angle: "名作チュートリアルの良さを印象評ではなく、区間順序が学習速度と破綻率へ与える差として測る研究として書く"
  analysis_axis: "離散環境、Q-Learning / SARSA / Monte Carlo / DQN 比較、報酬経路、12 curriculum 条件、三つの評価基準の関係を分析する"
  application_target: "新規プロトタイプの敵・足場・操作導入区間を入れ替え、到達率・収束・致命的失敗を同一 seed 群で比較する tutorial probe"
  pros_cons: "利点は配置順の教育効果を反復可能に測れること。弱点は RL agent の学びやすさが人間の理解・楽しさと一致するとは限らず、報酬設計にも左右されること"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv の要旨では、Super Mario Bros. の World 1-1 が、説明文ではなくステージ構成そのもので基礎メカニクスを教えるという通説を、reinforcement learning で測定できるか検討する。著者らは World 1-1 を完全離散環境として再実装し、同じ level の複雑さを段階的に変えた三条件で Q-Learning、SARSA、Monte Carlo、DQN を比較する。要旨では Monte Carlo が 94.9% ± 1.5% の win rate を示し、DQN の 76.4% ± 3.4% を上回ったと報告される。説明として、Monte Carlo は最短経路だけを取るのではなく、勝利経路上の中間報酬を最大化する学習を行ったとされる。続く curriculum experiment では、World 1-1 を構成する六つの canonical segment の順序を十二条件で入れ替える。原典順は convergence が最も速く、learning efficiency が最も高く、catastrophic failure がゼロだった唯一の条件であり、無作為な並べ替えには三基準を同時に満たすものがなかったと要旨は述べる。

## why_relevant_to_games

チュートリアルを説明文の有無ではなく、区間順序が学習速度・失敗率・到達率へ与える影響として検証する例になる。敵編隊や足場配置の順番を入れ替える headless probe の着想に接続できる。
