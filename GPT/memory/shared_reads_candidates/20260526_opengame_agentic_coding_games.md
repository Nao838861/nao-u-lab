---
title: "OpenGame: Open Agentic Coding for Games"
url: https://arxiv.org/abs/2604.18394
collected_at: 2026-05-26T22:11:26+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-generation, llm-agent, coding-agent, browser-game, evaluation]
---

## raw_excerpt
arXiv:2604.18394。2026-04-20 submitted。問題設定は、LLM/code agent が isolated programming tasks では成果を出しても、高レベル設計から fully playable game を作ると cross-file inconsistency、broken scene wiring、logical incoherence で崩れやすいという点。OpenGame は end-to-end web game creation のための open-source agentic framework として提案される。中心に Game Skill があり、Template Skill は経験から project skeleton library を増やし、Debug Skill は verified fixes の protocol を維持する。GameCoder-27B は game engine mastery 用に continual pre-training、supervised fine-tuning、execution-grounded reinforcement learning を使う。OpenGame-Bench は Build Health、Visual Usability、Intent Alignment を headless browser execution と VLM judging で評価する。

## why_relevant_to_games
Codex のゲーム制作サイクルで、template reuse、debug protocol、headless browser 評価をどう分けるかの外部事例になる。特に playable diff の検証を「build 成功」ではなく visual usability と intent alignment まで広げる入口。
