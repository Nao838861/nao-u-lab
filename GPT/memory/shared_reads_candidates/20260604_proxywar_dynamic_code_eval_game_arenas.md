---
title: "ProxyWar: Dynamic Assessment of LLM Code Generation in Game Arenas"
url: https://arxiv.org/abs/2602.04296
collected_at: 2026-06-04T12:44:52.9748217+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, harness, llm-evaluation, automated-testing, game-ai]
evaluated_at: 2026-06-04T12:50:19.9966919+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1780545456.757149"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780545456757149"
  char_count: 4036
  posted_at: 2026-06-04T12:57:40.7607030+09:00
status: posted
candidate_status: posted
last_reviewed_at: 2026-06-04T12:57:40.7607030+09:00
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780545456757149"
next_action: none
stale_after: "2026-07-04"
supersedes: []
gate_reason: |-
  LLM code generation benchmark の静的点数と、game arena 内の動的性能がずれるという問題設定が明確。
  multi-agent tournament / automated test / repair loop / operational characteristics の中核が抽出でき、Nao_u_BOT の headless 検証設計へ直接接続できる。
suggested_post_outline:
  overview_angle: "生成コードをゲーム環境に埋め込み、勝敗・頑健性・repair まで見る動的評価として整理する"
  analysis_axis: "静的 benchmark との差分、arena 設計、tournament と repair loop、評価で露出する operational discrepancy"
  application_target: "自作ゲームの headless 評価で pass/fail だけでなく、勝率・有効行動・robustness・repair 成功を同じ harness に載せる"
  pros_cons: "実挙動に近い評価を得られる一方、arena 設計の偏りと評価コストが増える"
  verdict_pre: "採用"
---

## raw_excerpt
arXiv:2602.04296。ICSE 2026 論文。LLM の code generation 評価が、静的 benchmark や単純な metric だけでは実運用の振る舞いを見落とす、という問題設定から始まる。ProxyWar は、LLM が生成した agent/program を複数の競争的 game environment に埋め込み、機能正しさだけでなく、動的環境での operational characteristics を測る枠組みとして提案されている。

抽象の重要部は、generated program を game arena に入れて、自動テスト、反復的 code repair、multi-agent tournament を組み合わせる点。これにより、通常 benchmark の点数と、実際の dynamic setting での性能のずれを見つける。著者らは、state-of-the-art coder と複数ゲームに適用した結果、benchmark score と実戦性能の間に無視しにくい discrepancy が出る、と説明している。

Nao_u_BOT 文脈での素材としては、ゲームを「遊ぶ対象」ではなく「生成コードの振る舞いを露出させる arena」として使う発想が重要。headless 検証で勝敗・効率・robustness・repair loop を同じ枠に置けるかを見るための候補。

## why_relevant_to_games
自作ゲームの headless 評価を、単なる pass/fail ではなく「生成された戦略やコードが arena 内でどう振る舞うか」の競争評価へ広げる素材になる。
