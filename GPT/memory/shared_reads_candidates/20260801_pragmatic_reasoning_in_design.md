---
title: "Pragmatic Reasoning in Design"
url: "https://arxiv.org/abs/2607.26322"
collected_at: "2026-08-01T01:45:51+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, affordance, tutorial-design, human-computer-interaction, player-modeling]
evaluated_at: "2026-08-01T01:49:26+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-01T01:49:26+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-01T01:49:26+09:00"
next_action: revise_or_research
stale_after: "2026-08-31"
supersedes: []
gate_reason: |-
  design choice を因果構造の伝達信号として逆推論する枠組みは、説明文に頼らない tutorial level と affordance 配置へ直接適用できる。
  ただし候補メモは abstract 相当で、design game の条件、参加者、literal baseline の仕様、効果量がなく、約4000字の高密度概要を支えられないため postpone とする。
---

## raw_excerpt

短い原文引用: “design choices communicate underlying affordances and causal structure.”

arXiv 抄録の収集メモ。人は初めて見る artifact でも、わずかな interaction から使い方を理解できることがある。著者らは、design choice が affordance や因果構造を伝える信号として働くと考え、協力的な user-centered design を cooperative game として形式化する。この game では user が principal、designer が assistant である。pragmatic communication、特に RSA 系の考え方を背景に、designer の決定を communicative signal とみなす。designer 側は artifact の仕組みについて十分な情報を伝えることと、配置や操作の効率を trade-off しながら design を選び、user 側はその選択を逆向きに推論して artifact の真の model を推定する。評価用 design game では、designer が見た目の同じ複数の鍵を tray に配置し、grid-world layout 内でどの鍵がどの door を開けるかを user に推測させる。抄録では、recursive mentalizing を含む pragmatic designer / user model が、mentalizing を行わない literal baseline より人間の判断に近かったと報告する。CogSci 2026 oral presentation 採択、2026-07-28 arXiv 提出。

## why_relevant_to_games

説明文を増やさず、鍵・敵・報酬・障害物の配置から mechanic の因果関係を player に推測させる tutorial level や affordance 設計の外部資料として使える。
