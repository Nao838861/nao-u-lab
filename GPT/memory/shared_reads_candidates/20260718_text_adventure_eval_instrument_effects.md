---
title: "Instrument Effects in Language-Model Honesty Evaluation: An Auditable Single-System Demonstration"
url: "https://arxiv.org/abs/2607.14399"
collected_at: "2026-07-18T20:31:51.9005046+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-evaluation, text-adventure, llm-agent, benchmark, experimental-design]
evaluated_at: "2026-07-18T20:36:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-18T20:36:04+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-18T20:36:04+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-17"
supersedes: []
gate_reason: >-
  LLM player を固定し、verdict grammar・成功条件の開示・budget 表示・反復を評価装置側の変数として操作する問題設定と、anchor / matched instance の具体値、反証された仮説まで抽出できる。
  headless playtester の成績をゲーム品質へ直結させず、評価 UI と判定文法の instrument effect を隔離する再現可能な試験として、制作中の playtest harness へ直接適用できる。
suggested_post_outline:
  overview_angle: "LLM の正直さそのものを断定する前に、verdict の選択肢や情報提示が測定結果を作っていないか評価装置を監査する研究として説明する。"
  analysis_axis: "engine-only ground truth、固定 player、二択から三択への grammar 変更、成功条件開示、budget 表示、反復不安定性、事前仮説の反証を分けて分析する。"
  application_target: "Log_cdx の headless game evaluation で、同一 build・同一 player に対して判定選択肢、目標説明、残り step 表示、seed と反復回数だけを変え、評価装置由来の分散を gameplay failure から分離する。"
  pros_cons: "利点は false verdict をモデル能力やゲーム欠陥へ誤帰属する危険を減らし、監査可能な評価契約を作れること。欠点は単一 system の実証で一般化が限定され、instrument 変更が player policy 自体を変えるため完全な中立測定にはならないこと。"
  verdict_pre: "採用（まず固定 build の A/B instrument test と反復分布を headless 評価の前段へ置く）"
---

## raw_excerpt

arXiv:2607.14399、2026-07-15 submitted。著者は language model の honesty 評価で、モデルの verdict だけでなく評価装置そのものを検査対象にする。game engine だけが quest の達成可能性を知る text-adventure world を作り、LLM player は budget 内で探索した後、complete / unreachable / not yet decidable のいずれかを宣言し、engine が採点する。player を固定したまま instrument の選択を変えると測定結果が大きく動いた。byte-identical な4 anchor では、二択 verdict grammar を三択へ広げると strong claims が38/40から7/40へ減り、新設した incomplete が28/40を占めた。成功条件を一文開示すると matched instance の false verdicts が18/59から0/58へ変化した。同一設定の反復でも4 instance 中3件で verdict distribution が安定せず、単発 run は disposition ではなく sample だと整理する。事前登録した narrative-register gradient は反証され、budget の表示形式が register 内容より verdict を動かしたという post-hoc pattern が残った。原文の出発点は “We test the instrument instead.”

## why_relevant_to_games

headless player や LLM playtester の成績をゲーム側の性質と同一視せず、選択肢文法、成功条件の見せ方、budget 表示、反復揺れを評価装置の変数として検査する場面に関係する。
