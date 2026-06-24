---
title: "GUI Agents for Continual Game Generation"
url: "https://arxiv.org/html/2605.28258v1"
collected_at: "2026-06-14T19:59:28.8718985+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, llm-agents, browser-games, evaluation]
evaluated_at: "2026-06-14T20:18:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-14T20:21:00+09:00"
last_decision: postponed_duplicate
evidence: "duplicate shared-reads post: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779995803583479"
next_action: none
duplicate_note: "Phase 3 duplicate check found an existing #shared-reads post for arXiv 2605.28258, so no duplicate message was sent."
stale_after: "2026-07-14"
supersedes: []
gate_reason: "PlaytestArena と Play2Code の二段構成により、問題設定、GUI agent による実プレイ評価、rubric/trace に基づく改善 loop、66.8% pass-rate という評価軸まで抽出できる。人間 playtester の代替ではなく、観測可能な refinement signal として置く結論も明確で、ブラウザゲーム試作の検証 harness に直結する。"
suggested_post_outline:
  overview_angle: "ゲーム生成をコード生成問題ではなく、画面を見て操作するプレイヤー評価 loop として扱う研究として書く。"
  analysis_axis: "rubric 設計、GUI agent の action/observation/diagnosis trace、single-pass や agentic coding baseline との差、限界としての人間評価との差分。"
  application_target: "Nao_u_BOT のブラウザ/小規模 prototype に対する自動プレイ検証、改善ログ、headless では拾えない視覚・操作面の欠陥検出。"
  pros_cons: "メリットは検証ログが残り改善指示へ接続しやすい点。デメリットは人間の面白さ・退屈・駆け引き評価の完全代替にはならない点。"
  verdict_pre: "部分採用。自動 playtester として採用し、人間評価の前段フィルタに置く。"
---

## raw_excerpt
論文は、ゲーム生成の評価と改善には「プレイヤー」が必要だとして、GUI agent を二つの役割で使う。第一に PlaytestArena という評価環境で、200 件のブラウザゲーム生成タスクを八つのジャンルに分け、各タスクに「プレイ中に観測できる期待行動」の rubric を付ける。GUI agent は生成された HTML/CSS/JS のゲームをブラウザで開き、画面を観察し、入力し、軌跡に基づいて rubric を満たすかを見る。第二に Play2Code では、ゲームを作る agent とプレイする GUI agent が、共有 memory を持つ継続ループで、生成、プレイ、診断、修正を回す。

実験では、frontier model でも playable game の直接生成は難しい一方、Play2Code は rubric pass-rate 66.8% を示し、single-pass や agentic-coding baseline より高い。論文は、GUI playtester の feedback が人間の報告より traceable で、各 action、observation、diagnosis がログに残る点を強調する。一方で、人間の playtester が持つ難しさ、退屈、驚き、美的判断は置き換えられないとも述べ、GUI agent は完全な人間代替ではなく、ゲーム生成を改善するための観測可能な refinement signal として扱われる。

## why_relevant_to_games
ブラウザゲーム prototype を作った後に「コードを読む評価」ではなく、画面を見てプレイする agent で機能、操作、進行、feedback を検証する設計素材になる。
