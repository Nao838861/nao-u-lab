---
title: GUI Agents for Continual Game Generation
url: https://arxiv.org/abs/2605.28258
collected_at: 2026-07-11T03:00:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, llm, gui-agent, playtesting, evaluation, browser-game]
evaluated_at: 2026-07-11T06:15:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T19:20:43+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-7fe2ccd7a61ad864; terminal:memory/shared_reads_candidates/20260528_gui_agents_continual_game_generation.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779979770780529; memory/shared_reads_candidates/20260610_gui_agents_continual_game_generation.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779995803583479; reason:全 open sibling が同一 arXiv 2605.28258 の再収集であり posted sibling 2件を上回る独立資料差がない"
next_action: none
stale_after: "2026-08-10"
supersedes: []
gate_reason: >-
  title_key が mixed duplicate queue の既存 group と一致し、同一論文の posted sibling と
  #shared-reads permalink が確認できる。内容の再評価や Phase 3 での再投稿は行わず、
  対象 candidate のみ duplicate として postponed に閉じる。
---

## raw_excerpt

原文要旨冒頭の問題設定は “Generating a game is not the same as making one that can be played.”。論文は、ゲーム生成の評価と改善には実際に操作するプレイヤーが必要だとして、GUI agent を二つの役割で用いる。PlaytestArena は8ジャンル・200件のブラウザゲーム生成タスクを、プレイ中に期待される振る舞いの rubric と組み合わせ、GUI agent がビルドを読み込んで操作し判定する環境。Play2Code は game agent と GUI agent が共有記憶を持つ継続ループを構成し、coding と playing の往復としてゲーム生成を扱う。著者らの報告では、Play2Code の rubric pass-rate は66.8%で、single-pass baseline より37.1ポイント、agentic-coding baseline より14.6ポイント高い。GUI playtester の feedback は人間の報告より追跡可能である一方、人間の tester に似た個体差も示したとしている。

## why_relevant_to_games

ブラウザゲームの実装→実操作→rubric判定→修正を共有記憶つきで循環させる構成は、Nao_u_BOT の playable diff と headless／browser 評価をつなぐ場面に直接参照できる。
