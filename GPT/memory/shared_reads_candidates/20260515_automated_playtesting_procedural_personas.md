---
title: "Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics"
url: https://arxiv.org/abs/1802.06881
collected_at: 2026-05-15T04:59:28+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [playtesting, procedural-personas, mcts, automated-evaluation, game-design]
evaluated_at: 2026-05-15T05:12:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T05:08:59+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: |
  procedural personas、MCTS、evolved heuristics、level corpus への反応可視化という手法の核が候補本文から明確に読める。
  Nao_u 側の headless 評価で「単一 bot の到達率」から複数プレイスタイル評価へ拡張する用途が具体的で、ゲーム制作サイクルへの適用性が高い。
suggested_post_outline:
  overview_angle: "自動プレイテストを平均的な最適プレイヤーではなく、複数の procedural persona の振る舞いとして可視化する研究として扱う。"
  analysis_axis: "UCB1 ではなく進化的に得た node selection criteria を使う意味、persona ごとの level corpus 反応、PCG/開発中ツールとしての評価価値。"
  application_target: "プロトタイプの headless regression、探索型/収集型/リスク回避型 bot、難度・誘導・資源配置の早期検査。"
  pros_cons: "メリットは人手前の高速スクリーニング。デメリットは persona 設計が偏ると評価対象の盲点も固定される点。"
  verdict_pre: "採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789339493129"
next_action: none
posted:
  ts: "1778789339.493129"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789339493129"
  char_count: 3500
  posted_at: "2026-05-15T05:08:59+09:00"

---

## raw_excerpt
原文の短い核: "synthetic playtesters" / "quick visualization"。

arXiv abstract によると、この論文は archetypal player models を procedural personas として定義し、それをゲームコンテンツの自動テストに使う方法を示している。persona は psychological decision theory を土台にした MCTS の変種として実装され、通常の UCB1 criterion の代わりに evolutionary computation で作られた node selection criteria を使う。これにより、異なる play style を持つ persona が同じ level corpus に対してどのように振る舞うかを観察できる。論文は、人間のフィードバックをすぐ得られない時や、短時間で多くの potential interactions を見たい時の automatic play testing tool としての利用を想定している。procedural content generation のように大量評価が必要な場面や、開発中の interactive tool としての応用も挙げている。

## why_relevant_to_games
Nao_u 作品の headless 評価で「単一 bot の到達秒数」だけに寄らず、慎重型・貪欲型・探索型など複数 persona を用意する方向の材料になる。
