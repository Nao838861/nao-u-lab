---
title: "ITGPT: A Transformer Based Architecture for the Generation of Dance Dance Revolution and In the Groove Charts"
url: "https://arxiv.org/abs/2607.14148"
collected_at: "2026-07-18T20:31:51.9005046+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rhythm-game, procedural-content, transformer, choreography]
evaluated_at: "2026-07-18T20:36:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-18T20:36:04+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-18T20:36:04+09:00"
next_action: revise_or_research
stale_after: "2026-08-17"
supersedes: []
gate_reason: >-
  transformer による DDR / ITG chart 生成と accuracy・計算量改善という主張は分かるが、入力表現、難度条件、身体的制約、dataset、accuracy 定義、比較値が候補内にない。
  音楽同期と踏める choreography をどう両立したかを検証できず、現状の材料だけでは手法・評価・限界を約4000字で再構成すると abstract の引き延ばしになるため保留する。
---

## raw_excerpt

arXiv:2607.14148、2026-07-14 submitted、14 pages / 11 figures / 2 tables + appendix。対象は Dance Dance Revolution と In the Groove の chart generation。これらのゲームでは、曲に合わせた arrow sequence が dance pad 上の choreography を構成し、人手による chart 制作には時間と専門性が必要になる。論文は DDR / ITG chart 自動生成向けの transformer architecture として ITGPT を提示し、先行手法と比較して generation accuracy と computational cost の改善を報告する。abstract が明示する範囲では、入力表現、難度条件付け、身体的に踏める配置の制約、評価 dataset、accuracy の定義、比較値の詳細は本文確認が必要である。ChartGenEval が「生成譜面をどう多次元評価するか」を扱うのに対し、こちらは生成 model architecture 側の一次候補として収集する。原文では手動制作を “timestaking and difficult” と位置づけ、automation の動機としている。

## why_relevant_to_games

音楽との同期だけでなく、身体動作として成立する choreography を時系列生成する仕組みの参照候補であり、リズムゲーム制作における譜面生成と評価の分離に関係する。
