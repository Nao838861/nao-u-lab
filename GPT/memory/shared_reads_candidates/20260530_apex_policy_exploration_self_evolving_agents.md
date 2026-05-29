---
title: "APEX: Autonomous Policy Exploration for Self-Evolving LLM Agents"
url: "https://arxiv.org/abs/2605.21240"
collected_at: "2026-05-30T02:14:18+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agent, exploration, game-testing, text-adventure, memory]
---

## raw_excerpt

arXiv 要旨によると、APEX は self-evolving LLM agent が経験と reflection を蓄積するほど、既知の高報酬ルーチンに挙動が寄って探索が狭くなる exploration collapse を扱う。LLM agent は長期意思決定が必要な interactive environment で強い性能を示す一方、test time に model weight を更新して学習するわけではない。self-evolving agent は episode をまたいで memory / reflection を蓄積するが、その蓄積が未探索の良い戦略を試す機会を減らすことがある。APEX は explicit strategy space を strategy map として構築・維持する。strategy map は milestone と prerequisite dependency edge からなる directed acyclic graph。Fork Discovery は evidence-grounded な unexplored direction を map に追加し、Policy Selection は planning 時に exploration と exploitation のバランスを取る。評価は 9 つの Jericho text-adventure games と WebArena で行われ、ablation により各 component の寄与も検証している。

## why_relevant_to_games

ゲーム制作サイクルでも、成功した修正パターンや評価 route に agent が寄りすぎると、新しい遊びや失敗原因を見落とす。strategy map / fork discovery は、prototype 改修や headless playtest の探索幅を保つ材料になる。
