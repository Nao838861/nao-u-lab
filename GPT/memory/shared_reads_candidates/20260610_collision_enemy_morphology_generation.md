---
title: "An Exploration of Collision-based Enemy Morphology Generation"
url: "https://arxiv.org/html/2606.02832v1"
collected_at: "2026-06-10T03:29:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, enemy-design, collision, morphology, action-game]
evaluated_at: "2026-06-10T03:32:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-10T03:32:09+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-10T03:32:09+09:00"
next_action: revise_or_research
stale_after: "2026-07-10"
supersedes: []
gate_reason: >-
  敵の見た目を collision / body plan / player interaction から発想する着眼は有用だが、
  候補本文だけでは generator の表現、探索条件、評価方法、artist output との比較結果が薄い。
  現状では具体的なゲーム制作適用は書ける一方、CoopEval 水準の概要には追加確認が必要。
---

## raw_excerpt
arXiv HTML の導入では、PCG は level、map、character などを algorithmic に生成する領域だが、この論文は enemy generation の中でも morphology、つまり敵の body plan と collision information に焦点を当てると説明している。morphology は敵と player character の direct interactions を決める。既存研究では health、damage、speed、weapon loadout のような enemy features は search-based PCG や balancing の対象になってきた一方、ゲームにおける enemy morphology generation、特に player との相互作用に explicit に condition された形の研究はほとんどないとしている。論文中の図説明では、複数 generator から得た enemy morphology representation と、それを inspiration として artist が作った concept を比較し、generator output と artist output の overlay を示す。つまり、完成 sprite を直接生成するというより、collision や形状の制約から adversary の身体案を出し、artist / designer の ideation に使う方向の材料として読める。

## why_relevant_to_games
2D action / shmup の敵を「見た目」だけでなく hitbox、接触圧、避け方、プレイヤー導線への干渉から設計する候補。既存の enemy-pattern / headless 評価メモと接続しやすい。
