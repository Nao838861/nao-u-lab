---
title: "Using Theory of Mind to Arbitrate between Social and Non-social Learning"
url: "https://arxiv.org/abs/2607.28601"
collected_at: "2026-08-01T01:45:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, player-modeling, social-learning, theory-of-mind, exploration]
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
  他者観察の情報価値と自己探索コストを比較する問題設定、Rational Mentalizing model、game task という中核はゲーム設計へ具体的に接続できる。
  ただし候補メモは abstract 相当で、task 条件、参加者、比較モデル、定量結果がなく、CoopEval 水準の約4000字概要で評価の中身を根拠付きで説明できないため postpone とする。
---

## raw_excerpt

短い原文引用: “How do people balance social and non-social learning?”

arXiv 抄録の収集メモ。社会学習は、他者の行動から世界について学べる一方、観察には時間や認知資源のコストがあり、人は常に他者を観察するわけではなく、直接探索を選ぶこともある。著者らは、この切替を説明する Rational Mentalizing model を提案する。モデルは、観察対象となる別 agent の目標と、その agent が今後とる行動の情報量を推論し、社会学習から得られる効用を見積もる。その値を、自分で環境を探索する非社会的学習の効用と比較する。評価には、player が「他 agent を観察する」か「自分で環境を探索する」かを選ぶ新しい game task を使い、どちらを選ぶかという人間の trade-off を定量的に捉えられるかを調べる。抄録では、Rational Mentalizing model が人間の選択傾向を quantitatively capture し、選択的な社会学習が Theory of Mind と utility maximization の組合せによって導かれる可能性を示したとしている。論文は 35 pages で supplementary information を含み、2026-07-30 に arXiv へ提出された。

## why_relevant_to_games

NPC の行動をヒントとして見せる場面や、他 player の ghost・replay を観察するか自力探索するかを選ばせる設計で、観察コストと情報価値を分けて考える材料になる。
