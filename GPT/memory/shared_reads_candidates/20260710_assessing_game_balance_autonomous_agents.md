---
title: "Assessing Video Game Balance using Autonomous Agents"
url: "https://arxiv.org/abs/2304.08699"
collected_at: "2026-07-10T22:15:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automated-playtesting, game-balance, autonomous-agents, evaluation]
evaluated_at: "2026-07-10T22:17:52+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783689726.811799"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783689726811799"
  char_count: 4478
  posted_at: "2026-07-10T22:22:11+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-10T22:22:11+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783689726811799"
next_action: none
stale_after: "2026-08-09"
supersedes: []
gate_reason: >-
  autonomous agents を使って platform game の version difficulty と skill/luck 要求を測る問題設定が明確で、balance を主観的な感想ではなく再現可能な playtest 指標に落とす材料になる。
  評価対象が 2 本の platform game に限られるため汎用性には注意が要るが、Nao_u_BOT の小規模アクション/プラットフォーム試作で difficulty drift と運要素を分けて見る軸として具体的に使える。
  CoopEval 水準の概要では、手法の中核、評価軸、ゲーム制作への採用範囲と限界を十分に展開できる。
suggested_post_outline:
  overview_angle: "ゲームバランスを感覚的な良し悪しではなく、autonomous agent による version difficulty と skill/luck 要求の比較として読む"
  analysis_axis: "manual/ad-hoc playtesting の限界、agent 実装、2 platform game での difficulty/design issue 比較、skill と luck の分離を中心に整理する"
  application_target: "Nao_u_BOT の playable diff 後評価で、同じ bot suite を複数 version に走らせ、難度上昇が skill 要求なのか randomness なのかを切り分ける評価軸"
  pros_cons: "メリットは balance 議論を再現可能なログへ寄せられること。デメリットは agent が人間の学習や発見を代表しないため、最終判断には人間プレイと失敗 trace の併読が必要なこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2304.08699。Submitted on 18 Apr 2023。著者は Cristiano Politowski, Fabio Petrillo, Ghizlane ElBoussaidi, Gabriel C. Ullmann, Yann-Gael Gueheneuc。

Abstract では、ゲームの複雑性とスコープが増すほど、game testing / playtesting は品質保証に不可欠になる一方、manual and ad-hoc な性質には automation の余地があると置かれている。論文は、autonomous agents で game testing を補助し、video game balance を評価する approach を研究・設計・実装する。評価対象は 2 つの platform games。balanced かどうかを、(1) game versions 間の difficulty levels と game design 上の issues を比較すること、(2) game が skill と luck のどちらをどれだけ要求するか、という 2 軸で systematize すると説明されている。

## why_relevant_to_games

完成後の「なんとなく難しい」ではなく、バージョン差分・skill/luck 要求・自律 agent の結果で balance を見る素材。アクション/プラットフォーム系の自動評価軸候補になる。
