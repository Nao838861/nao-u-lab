---
title: GUI Agents for Continual Game Generation
url: https://arxiv.org/abs/2605.28258
collected_at: 2026-06-06T20:14:37+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, playtesting, gui-agent, game-generation, evaluation]
evaluated_at: 2026-06-06T20:17:29+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-06-06T20:19:56+09:00
last_decision: postponed
evidence: "duplicate_existing_shared_reads_post:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779995803583479"
next_action: none
stale_after: "2026-07-06"
supersedes: []
postpone_reason: "Phase 3 review found an existing #shared-reads post for the same URL/content; avoid duplicate posting."
gate_reason: |-
  browser game generationを「出力物が実際に遊べるか」まで落とし込む問題設定が明確。
  PlaytestArenaとPlay2Codeの二段構えで、GUI agent evaluatorと継続改善loopをゲーム制作サイクルに直結させやすい。
  66.8% rubric pass-rateなど評価の芯もあり、CoopEval水準の概要に展開できる。
suggested_post_outline:
  overview_angle: "一発生成ではなく、GUI agentをプレイヤー兼評価器として継続生成ループに入れる設計として書く"
  analysis_axis: "PlaytestArenaのrubric評価と、coding agent / playing GUI agentのshared memory loopを分けて分析する"
  application_target: "Nao_u_BOTのplayable diff検証、headless確認後の実機GUI体験判定、rubric化された自動プレイテスト"
  pros_cons: "利点はtraceableな操作ログと反復改善。弱点は人間プレイヤーの主観差やrubric外の面白さを拾いにくい点"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv:2605.28258。2026-05-27 submitted。ゲーム生成を prompt から artifact への一回変換として扱うと、interaction-level failure が見落とされる、という問題設定。論文は GUI agent を 2 役で使う: 1 つは PlaytestArena で、200 件の browser-based game generation task を 8 genre に分け、expected in-play behaviors の rubric に対して GUI agent が build を browser で開いてプレイし判定する evaluator。もう 1 つは Play2Code で、coding 側 game agent と playing 側 GUI agent が shared memory を持ち、継続 loop で生成物を改善する。

短い原文断片: "requires a player" / "dialogue between coding and playing" / "66.8% rubric pass-rate"。

実験結果メモ: frontier model でも playable game の直接生成は苦戦し、Play2Code は single-pass baseline と agentic-coding baseline を上回る。GUI playtester feedback は human report より traceable だが、人間 tester らしい idiosyncrasy もある、と位置づけている。

## why_relevant_to_games
Nao_u_BOT の headless 検証と実機 GUI 体感判定の橋渡し候補。playable diff を作るだけでなく、GUI agent が実際に触って rubric を返す cycle 設計の材料になる。
