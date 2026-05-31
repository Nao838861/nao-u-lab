---
title: Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics
url: https://arxiv.org/abs/1802.06881
collected_at: 2026-05-27T08:44:32+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automated-playtesting, procedural-personas, mcts, player-modeling, pcg]
evaluated_at: 2026-05-27T08:48:27+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-27T08:48:27+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-27T08:48:27+09:00"
postponed:
  at: "2026-05-27T08:50:58+09:00"
  by: log_cdx (Phase 3)
  reason: "Phase 3 確認で同一論文の #shared-reads 投稿済みを検出したため。既投稿: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789339493129"
stale_after: "2026-06-26"
supersedes: []
next_action: revise_or_research
gate_reason: >
  問題設定、procedural persona の着想、MCTS の selection criteria を進化計算で差し替える中核、synthetic playtester としての評価用途まで抽出できる。
  Nao_u_BOT の headless 評価を平均スコアではなくプレイスタイル別の露出・破綻検出へ拡張する適用先が具体的で、CoopEval 水準の概要を書ける。
suggested_post_outline:
  overview_angle: procedural persona を「人間代替」ではなく、開発中レベルで相互作用を早期可視化する合成プレイヤーとして説明する。
  analysis_axis: archetypal player model、進化した MCTS selection criteria、レベル群に対する play style enactment、PCG/自動プレイテストで何を測れるか。
  application_target: Nao_u_BOT の headless policy matrix に camper/route/bad-policy などの persona 軸を足し、平均性能ではなくスタイル別の詰まり方を検出する。
  pros_cons: 自動評価の観測幅が増える一方、persona 設計が粗いと作り手の仮説を再生産し、実プレイヤーの感性評価とは別物になる。
  verdict_pre: 部分採用。まず既存 headless bot の報酬関数差し替えで小さく試す。

---

## raw_excerpt
arXiv:1802.06881。Christoffer Holmgard / Michael Cerny Green / Antonios Liapis / Julian Togelius による 2018 年の自動プレイテスト論文。対象は、人間の feedback がすぐ取れない場面、または開発中に大量のレベルやパラメータを短時間で評価したい場面。中核は、archetypal player model を procedural persona として作り、標準の UCB1 MCTS ではなく、進化計算で得た selection criteria を持つ MCTS によって異なるプレイスタイルを enact させること。

短い原文メモ: "synthetic playtesters" / "quick visualization of potential interactions" / "procedural content generation systems"。論文ページの abstract では、procedural personas は psychological decision theory に基づくとされ、さまざまな game levels に対して異なる play style を実行できると説明されている。人間の感想を置き換えるというより、特定の style がレベル内でどのような interaction を起こすかを早く可視化する道具として位置づけられている。

## why_relevant_to_games
Nao_u_BOT の headless 評価で、平均 score ではなく camper / route / bad-policy のような「プレイスタイル別の露出」を見る方針に直接つながる。次の Phase 2 では、既存の headless policy matrix と procedural persona の対応関係だけ確認すればよい。
