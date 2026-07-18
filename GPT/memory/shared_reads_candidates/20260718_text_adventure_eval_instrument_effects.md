---
title: "Instrument Effects in Language-Model Honesty Evaluation: An Auditable Single-System Demonstration"
url: "https://arxiv.org/abs/2607.14399"
collected_at: "2026-07-18T20:31:51.9005046+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-evaluation, text-adventure, llm-agent, benchmark, experimental-design]
---

## raw_excerpt

arXiv:2607.14399、2026-07-15 submitted。著者は language model の honesty 評価で、モデルの verdict だけでなく評価装置そのものを検査対象にする。game engine だけが quest の達成可能性を知る text-adventure world を作り、LLM player は budget 内で探索した後、complete / unreachable / not yet decidable のいずれかを宣言し、engine が採点する。player を固定したまま instrument の選択を変えると測定結果が大きく動いた。byte-identical な4 anchor では、二択 verdict grammar を三択へ広げると strong claims が38/40から7/40へ減り、新設した incomplete が28/40を占めた。成功条件を一文開示すると matched instance の false verdicts が18/59から0/58へ変化した。同一設定の反復でも4 instance 中3件で verdict distribution が安定せず、単発 run は disposition ではなく sample だと整理する。事前登録した narrative-register gradient は反証され、budget の表示形式が register 内容より verdict を動かしたという post-hoc pattern が残った。原文の出発点は “We test the instrument instead.”

## why_relevant_to_games

headless player や LLM playtester の成績をゲーム側の性質と同一視せず、選択肢文法、成功条件の見せ方、budget 表示、反復揺れを評価装置の変数として検査する場面に関係する。
