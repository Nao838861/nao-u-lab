---
title: "What game developers actually want from procedural level generation tools"
url: "https://publications.graphics.tudelft.nl/papers/848"
collected_at: "2026-06-08T02:14:51+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, level-design, tooling, developer-workflow]
evaluated_at: "2026-06-08T02:20:56+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1780853278.343919"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780853278343919"
  char_count: 4454
  posted_at: "2026-06-08T02:28:04.6958659+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-08T02:28:04.6958659+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780853278343919"
next_action: none
stale_after: "2026-07-08"
supersedes: []
gate_reason: "120人の実務者 survey で、職種差・採用障壁・AI/PCG tool preference が取れているため、問題設定、手法、評価、結論を概要化できる。ゲーム制作への適用も level generator / authoring tool の要件に直結し、automation ではなく control / transparency を設計軸に落とせる。"
suggested_post_outline:
  overview_angle: "PCG 研究の性能や自動化能力ではなく、実務者がなぜ採用しないか、どの職種が使い、何を重視するかを survey から整理する。"
  analysis_axis: "職種別採用差、採用障壁、generative AI methods への preference、creative control と process transparency の位置づけを、tool design の要求として読む。"
  application_target: "自作 level generator、game tool、AI-assisted editor を作る時の要件定義。生成結果だけでなく、制御可能なパラメータ、途中過程の可視化、designer が戻せる編集 loop に効く。"
  pros_cons: "メリットは実務者の needs を直接参照でき、研究寄り PCG を制作 tool に翻訳しやすい点。デメリットは survey なので特定ジャンルや小規模個人制作にそのまま一般化しにくい点。"
  verdict_pre: "採用。PCG/AI tool を作る時の評価軸として残す価値が高い。"
---

## raw_excerpt
FDG 2026 採択論文。TU Delft の掲載ページによると、対象は procedural level generation tool が研究では発展している一方、実際のゲーム開発現場では採用が均一でない理由を調べる survey。120 人の game development professionals を対象に、current tool usage、adoption barriers、technical preferences、future needs を、level designers、game designers、technical artists、environment artists、programmers、researchers などの職種横断で見ている。

掲載ページが強調する観察は二つ。第一に、artists と designers の間で procedural generation の採用率に統計的に有意な差があり、artists のほうが頻繁に使っている。第二に、generative AI methods への好みを尋ねる複数設問で、開発者は automation よりも creative control と process transparency を一貫して優先している。原文短句: "creative control and process transparency over automation"。結論として、技術的障壁を下げるだけでなく、実務者の優先順位に合う tool design が PCG 採用拡大の鍵だとまとめている。

## why_relevant_to_games
自作 game tool / level generator を作る時、「自動生成できる」ではなく、designer が制御でき、途中過程を読めることを候補要件にできる。
