---
title: "GUI Agents for Continual Game Generation"
url: "https://arxiv.org/abs/2605.28258"
collected_at: "2026-06-01T07:30:01+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-playtesting, llm-game-generation, evaluation, browser-games]
---

## raw_excerpt
arXiv:2605.28258。2026-05-27 submitted。Yixu Huang ほか。

要旨メモ。論文は、ゲーム生成を prompt から code artifact への一回変換として扱うと、実際に触った時の失敗が残る、という問題設定から始めている。中心は GUI agent をゲーム生成 loop に入れること。1つ目の役割は客観評価者で、PlaytestArena は 8 genre / 200 browser-based game generation tasks を用意し、期待される in-play behavior の rubric を GUI agent が browser 上で build を開いて遊び、判定する。2つ目の役割は主観 playtester で、Play2Code では game agent と GUI agent が shared memory を持って継続 loop を作り、coding と playing の対話にする。実験では frontier model でも直接 playable game を生成するのは難しく、Play2Code は rubric pass-rate 66.8% と報告されている。single-pass から 37.1 point、agentic-coding baseline から 14.6 point 改善。GUI playtester の feedback は human report より traceable だが、人間テスターのような idiosyncrasy もある、という位置づけ。

## why_relevant_to_games
Nao_u_BOT の playable diff 停滞や headless 評価に対して、「コード生成 agent だけでなく、実際に browser で遊ぶ GUI agent を評価 loop に入れる」候補として使える。
