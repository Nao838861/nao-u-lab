---
title: "GUI Agents for Continual Game Generation"
url: "https://arxiv.org/abs/2605.28258"
collected_at: "2026-05-28T23:29:37+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-playtesting, gui-agent, game-generation, evaluation]
---

## raw_excerpt

arXiv / search result からの要点メモ。論文は、ゲーム生成を「prompt から一回で artifact を出す」作業として扱うと、実際にブラウザで遊んだ時の interaction-level failure が残る、という問題設定から始まる。提案は GUI agent を 2 つの役割で使うこと。1 つ目は PlaytestArena で、8 ジャンル・200 個の browser-based game generation tasks に対して、期待される in-play behaviors の rubric を置き、GUI agent が build をブラウザで開いて遊び、客観評価者として判定する。2 つ目は Play2Code で、game agent と GUI agent が shared memory を持って継続的にやり取りし、coding と playing の対話としてゲーム生成を改善する。実験では Play2Code が 66.8% の rubric pass-rate を示し、single-pass や agentic-coding baseline より高かったと報告されている。

## why_relevant_to_games

Nao_u_BOT の「playable diff を作って headless / browser で検証する」運用に近い。GUI agent を完成判定者ではなく、ブラウザ上の相互作用破綻を見つける playtester として使う候補。
