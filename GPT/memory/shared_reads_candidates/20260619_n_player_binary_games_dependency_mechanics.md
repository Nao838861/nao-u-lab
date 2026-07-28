---
title: "N-Player Binary Games with Unidirectional Dependencies: Cycle Robustness and Induced Indifference"
url: "https://arxiv.org/abs/2606.06625"
collected_at: "2026-06-19T18:29:35+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-theory, mechanics, dependency-graph, multiplayer-systems, balancing]
evaluated_at: "2026-07-29T08:37:17+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-29T08:37:17+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-29T08:37:17+09:00"
next_action: revise_or_research
stale_after: "2026-08-28"
supersedes: []
gate_reason: >-
  directed cycle graphical game の均衡解析は、循環依存する陣営・資源・スイッチの逆設計に使える可能性がある。
  ただし候補は数学的性質の要約に留まり、具体ルールへの写像・面白さの評価軸・設計例がないため、ゲーム制作への適用がまだ抽象的である。
---

## raw_excerpt
arXiv:2606.06625。2026-06-04 submitted。Jose Maria Sanchez-Saez / Nana Odishelidze / Francisco Criado-Aldeanueva による、unidirectional dependency を持つ N-player binary game の Nash equilibrium を閉形式で特徴づける研究。一般の network game は PPAD-complete だが、論文は directed cycle graphical game という部分クラスを扱い、non-zero boundary incentives が topology を feed-forward propagation のように線形化することを示す。robust regime では O(N) で解け、strict dominance が unique equilibrium を保証し、そうでない場合は Parity Condition が pure strategy equilibria の有無を支配する。non-robust regime には branching rules を与え、transition-matrix formulation で探索木サイズを事前評価できるとしている。

## why_relevant_to_games
循環依存を持つ陣営・資源・スイッチ・領地効果などを、数値 solver の黒箱ではなく、狙った均衡から逆設計するメカニクス候補として読める。
