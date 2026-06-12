---
title: "CG-WFC: A Hybrid Cyclic-Graph & WFC Method for Designer-Guided and Replayable Procedural Content Generation"
url: "https://conf.researchr.org/details/icse-2026/gas-2026-papers/7/CG-WFC-A-Hybrid-Cyclic-Graph-WFC-Method-for-Designer-Guided-and-Replayable-Procedu"
collected_at: "2026-06-08T12:29:52+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, level-design, wave-function-collapse, roguelike]
evaluated_at: "2026-06-08T12:35:53+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780890109.179779"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780890109179779"
  char_count: 4395
  posted_at: "2026-06-08T12:42:03+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-08T12:42:03+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780890109179779"
next_action: none
stale_after: "2026-07-08"
supersedes: []
gate_reason: |-
  designer control と emergent replayability の緊張関係を、mission graph と WFC の二層分離で扱う中核が明確。
  問題設定・着想・手法・適用場面を candidate 本文と公開 abstract から抽出でき、ローグライク/探索型プロトタイプへの接続も具体的。
  評価の詳細は限定的だが、GAS 2026 発表ページの短報候補として 4000 字概要を書く軸は十分にある。
suggested_post_outline:
  overview_angle: "設計者が固定したい進行構造と、生成で揺らしたい部屋・配置を二層に分ける PCG 設計として紹介する。"
  analysis_axis: "global mission flow と local content assembly の分離、graph grammar による高水準構造、WFC による局所整合性の役割分担を中心に読む。"
  application_target: "Nao_u_BOT の小規模ローグライク/探索プロトタイプで、鍵・分岐・目標順序は mission graph、部屋形状や隣接配置は WFC 風制約に任せる設計 probe に効く。"
  pros_cons: "メリットは設計意図を残したままリプレイ性を出せる点。デメリットは graph grammar と tile constraint の二重メンテナンス、評価指標が薄い場合に生成品質を見誤る点。"
  verdict_pre: "部分採用。Phase 3 では実装候補として、まず mission graph 固定 + local layout 揺らしの小 probe に落とす。"
---

## raw_excerpt

ICSE 2026 / GAS 2026 の発表ページ。著者は Laurent Voisard、Cristiano Politowski、Fabio Petrillo、Yann-Gael Gueheneuc。題名は CG-WFC: A Hybrid Cyclic-Graph & WFC Method for Designer-Guided and Replayable Procedural Content Generation。一次ページの abstract では、procedural generation は多様な game environments を作る強力な方法だが、designer control と emergent replayability の両立が難しい、という問題設定を置く。提案手法は Wave Function Collapse の pattern-based constraints と cyclic graph generation の structural expressiveness を組み合わせる hybrid generation method。designers は graph grammar によって high-level narrative / spatial structures を定義し、WFC は local coherence と aesthetic consistency を担う。global mission flow と local content assembly を分離することで、fine-grained authoring と playthrough 間の variability を同時に狙う。関連ブログでは、mission graph 層で lock-and-key、branching path、task 追加などの高水準構造を作り、WFC 層で tile-based room layout を具体化する二層構造として説明されている。短い原文片: "designer control with emergent replayability" / "decoupling global mission flow from local content assembly"。

## why_relevant_to_games

ローグライクや探索型ステージで、手作りの進行リズムと生成の変化を分けて設計する材料。Nao_u_BOT の小規模プロトタイプでも、先に mission graph を固定し、見た目や部屋配置だけを WFC 的に揺らす実験に使える。
