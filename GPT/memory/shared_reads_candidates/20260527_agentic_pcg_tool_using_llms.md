---
title: "Agentic PCG: Procedural Content Generation via Tool-using LLMs"
url: "https://zehua-jiang.github.io/AgenticPCG/"
collected_at: "2026-05-27T21:40:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, llm-agent, level-design, evaluation]
evaluated_at: "2026-05-27T21:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-27T22:19:35+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779885575577609"
posted:
  ts: "1779885575.577609"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779885575577609"
  char_count: 3638
  posted_at: "2026-05-27T22:19:35+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: none
gate_reason: |-
  PCG を一発生成ではなく perceive/reason/plan/edit の編集ループとして扱う問題設定が明確で、古典 PCG ツールと LLM エージェントの分担も抽出できている。
  複数ゲームジャンル、行動ベース評価、明示メトリクスがあり、Nao_u_BOT の headless 評価・生成/検証分離の改善に具体的に接続できる。
suggested_post_outline:
  overview_angle: "LLM をレベル生成器ではなく、既存 PCG ツールを使う編集エージェントとして読む。"
  analysis_axis: "perceive/reason/plan/edit ループ、ツール呼び出し、制約メトリクス、行動ベース評価の噛み合わせ。"
  application_target: "Nao_u_BOT の playable diff 前のレベル候補修正、headless bot policy、失敗理由を残す生成検証ループ。"
  pros_cons: "利点は生成と評価を閉じた反復にできること。弱点は自然言語指示とメトリクス設計に品質が強く依存すること。"
  verdict_pre: "部分採用"

---

## raw_excerpt
短い引用: "Perceive, Reason, Plan, and Edit"

メモ: Zehua Jiang / Sam Earle / Ahmed Khalifa / Julian Togelius による Agentic PCG は、LLM にゲームレベルを一発生成させるのではなく、ゲーム環境をインタラクティブな編集・評価ループとして包む。エージェントは現在のレベル状態を読み、改善点を推論し、編集計画を作り、タイル配置・線描画・パッチ編集・BSP や digger などの古典的 PCG アルゴリズムを道具として呼び出す。対象は Binary Maze / Lode Runner / Zelda / Sokoban / Super Mario Bros などで、静的な接続性・タイル数・可解性だけでなく、A* エージェントのシミュレーションによる行動ベースの評価も扱う。自然言語のテーマ指示と、パス長や制約充足のような明示メトリクスを同じループに入れる点が中核。

## why_relevant_to_games
Nao_u_BOT の headless 評価・bot policy・プレイヤー体験指示を、レベル編集ツールと評価関数のループへ接続する候補。特に「生成」と「検証」を分けず、編集途中の理由・計画・失敗を残す型として使えそう。
