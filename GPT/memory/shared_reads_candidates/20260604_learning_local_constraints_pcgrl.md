---
title: "Learning Local Constraints for Reinforcement-Learned Content Generators"
url: "https://arxiv.org/abs/2605.13570"
collected_at: "2026-06-04T08:29:43+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [pcg, pcgrl, wave-function-collapse, level-design, constraints]
evaluated_at: "2026-06-04T08:35:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780530264.803229"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780530264803229"
  char_count: 4500
  posted_at: "2026-06-04T08:44:59+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-04T08:44:59+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780530264803229"
next_action: none
stale_after: "2026-07-04"
supersedes: []
gate_reason: "WFC の local constraint と PCGRL の global reward を組み合わせる問題設定が明確で、action space 制約、input 数・rare pattern・starting state などの分析要素もある。level / wave 生成で見た目の局所整合性と攻略可能性を分離して扱う具体的な適用先がある。"
suggested_post_outline:
  overview_angle: "局所的にそれらしいが全体が壊れる生成と、攻略は通るが見た目が荒い生成を分けるための hybrid PCG として書く。"
  analysis_axis: "WFC 由来の local constraints、PCGRL の action space 制限、global reward、入力例の多様性、rare pattern 除外、hyperparameter sensitivity。"
  application_target: "足場・敵・報酬配置の局所パターン制約と、headless route / playability 指標を併用する生成サイクル。"
  pros_cons: "利点は visual satisfaction と playability の両立を設計語彙にできること。懸念は tuning 依存、学習素材の偏り、短期 prototype への導入コスト。"
  verdict_pre: "部分採用。学習器をすぐ組むより、local constraint と global evaluator を別ログで評価する設計指針として採用候補にする。"
---

## raw_excerpt
arXiv:2605.13570。2026-05-13 submitted。問題設定は、WFC のように既存 content から local constraints を学ぶ generator は見た目の局所整合性を出しやすい一方、playability など global properties を保証しづらいこと。逆に reinforcement-learning trained generator は reward に global properties を入れられるが、生成物が視覚的に不満足になり得る。

論文はこの二者を組み合わせ、WFC で学んだ constraints によって PCGRL generator の action space を制約する。目的は、global properties を満たしながら local constraints にも従う generator を作ること。分析では input の数と種類、starting state の random collapse、rare patterns の除外などを変え、hybrid method の挙動を比較する。著者らは hyperparameter tuning には敏感だが、良い設定では Lode Runner のような puzzle-platform game levels について、visual satisfaction と playability と desired global properties を両立できると述べている。

## why_relevant_to_games
敵配置や足場配置で「局所的にはそれらしいが全体の攻略が壊れる」問題と、「攻略は通るが見た目や手触りが雑」問題を分けて扱う候補。Nao_u_BOT の wave / level 生成で、local pattern と headless route 指標を併用する発想につながる。
