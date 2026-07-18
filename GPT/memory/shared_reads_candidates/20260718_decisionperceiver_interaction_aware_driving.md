---
title: "Learning High-Level Decision Making with an Interaction-Aware Attention-Based Network in Autonomous Driving"
url: "https://arxiv.org/abs/2607.09725"
collected_at: "2026-07-18T22:49:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [multi-agent, npc-ai, attention, simulation, decision-making]
---

## raw_excerpt

arXiv 要旨メモ。自動運転の lane change と speed control では、交通量に応じて入力 agent 数が変わり、intersection のような交渉場面では車同士の interaction を明示的に扱う必要がある。shared encoder 系の DeepSet は可変長入力を扱える一方、traffic interaction の modeling が弱い。通常の attention は interaction を捉えるが、agent 数に対して memory / computation が二次的に増え、表現粒度も制御しにくい。提案する DecisionPerceiver は Perceiver IO に着想を得て、dynamic agent feature を固定長 latent space へ投影し、latent query 数によって feature granularity を調整する。さらに interaction awareness の利得を活かすため action set を細かく離散化する。interaction の必要度が異なる3 driving scenario、複数 navigation objective、車両数を増やした条件で performance、generalization、scalability を評価する。

## why_relevant_to_games

群衆・交通・編隊 NPC のように登場数が変わる multi-agent simulation で、全組合せ attention の負荷を抑えながら相互作用を意思決定へ入れる設計候補になる。
