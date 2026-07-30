---
title: "Learning Controllable and Diverse Player Behaviors in Multi-Agent Environments"
url: "https://arxiv.org/abs/2512.10835"
collected_at: "2026-07-31T06:32:01.8053562+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, automated-playtesting, player-modeling, reinforcement-learning, multi-agent]
---

## raw_excerpt

論文は、人間のプレイ軌跡を大量に集めたり、プレイヤー類型ごとに別 policy を学習したりせず、単一の強化学習 policy から連続的に異なるプレイ傾向を出す Uniform Behavior Conditioned Learning（UBCL）を提案する。各 agent は、現在の game state に加えて、0〜1 の範囲で表した目標 behavior vector と、プレイ中に計算される現在の behavior vector を観測する。報酬は、現在値から目標値までの正規化 Euclidean distance が一手でどれだけ縮んだかを基にする。episode ごとに目標 vector を一様分布から取り直すことで、policy に行動と統計指標の関係を学ばせ、学習後は vector を変えるだけで別の行動傾向を指定する。

実験環境は Unity ML-Agents で作った 2 対 2 の grid arena で、agent は資源を集め、相手と戦い、得点を競う。behavior vector は、得点源別の比率、dominance、teammate distance、mobility からなる6次元で、cooperativeness、competitiveness、aggressiveness、risk-taking などに対応づける。PPO policy は約2億 time step、実時間換算約5,500時間、16並列環境で学習された。代表的な目標ごとに50 session、分布比較では1,000 game、次元別 error では1,250 episode・5,000 vector を使う。win-only policy は一つの優勢な collector 型へ集まり、UBCL はより広い behavior space を覆ったと報告される。一方、teammate distance は相手の目標と衝突しやすく、mobility には実現不能な低目標が混じるため誤差が大きかった。著者らは、行動表現が人手で設計した6指標に依存し、詳細な人間行動には多数の次元が必要になり得る点も記している。

## why_relevant_to_games

headless playtest の bot を固定 archetype に分けるだけでなく、aggressiveness・mobility・cooperation などの連続目標で行動を振り、同じ build がどの行動領域で破綻するかを探索する設計例として参照できる。
