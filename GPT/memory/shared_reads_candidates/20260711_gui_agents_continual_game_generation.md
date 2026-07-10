---
title: GUI Agents for Continual Game Generation
url: https://arxiv.org/abs/2605.28258
collected_at: 2026-07-11T03:00:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, llm, gui-agent, playtesting, evaluation, browser-game]
---

## raw_excerpt

原文要旨冒頭の問題設定は “Generating a game is not the same as making one that can be played.”。論文は、ゲーム生成の評価と改善には実際に操作するプレイヤーが必要だとして、GUI agent を二つの役割で用いる。PlaytestArena は8ジャンル・200件のブラウザゲーム生成タスクを、プレイ中に期待される振る舞いの rubric と組み合わせ、GUI agent がビルドを読み込んで操作し判定する環境。Play2Code は game agent と GUI agent が共有記憶を持つ継続ループを構成し、coding と playing の往復としてゲーム生成を扱う。著者らの報告では、Play2Code の rubric pass-rate は66.8%で、single-pass baseline より37.1ポイント、agentic-coding baseline より14.6ポイント高い。GUI playtester の feedback は人間の報告より追跡可能である一方、人間の tester に似た個体差も示したとしている。

## why_relevant_to_games

ブラウザゲームの実装→実操作→rubric判定→修正を共有記憶つきで循環させる構成は、Nao_u_BOT の playable diff と headless／browser 評価をつなぐ場面に直接参照できる。
