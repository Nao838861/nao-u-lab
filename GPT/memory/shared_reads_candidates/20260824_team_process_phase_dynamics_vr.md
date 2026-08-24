---
title: "Computational Measurement of Team-Process Phase Dynamics in Collaborative Virtual Reality"
url: "https://arxiv.org/abs/2608.18660"
collected_at: "2026-08-24T09:50:28+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-research, playtesting, player-experience, collaboration, vr, llm-analysis]
---

## raw_excerpt

> Collaborative virtual reality (VR) environments make team communication observable as it unfolds, but conventional transcript analyses often summarize entire trials or divide them into fixed temporal windows. Such approaches can obscure changes in team communication and coordination over time. This article presents a computational framework for detecting and interpreting dynamic team-process phases from timestamped dialogue in a collaborative VR game.
>
> The framework uses late chunking to generate context-aware transcript representations, aggregates them into temporal chunks, and applies penalized Gaussian-kernel change-point detection to identify semantic transitions in team communication. After boundary detection, term frequency--inverse document frequency (TF-IDF), non-negative matrix factorization (NMF), and representative transcript segments provide structured evidence for phase interpretation.
>
> A locally deployed large language model (LLM) uses in-context learning to generate initial interpretations that are subsequently reviewed by humans. Independently recorded interaction logs are then aligned with the detected phases to examine corresponding task-action patterns.

## why_relevant_to_games

協力ゲームのプレイテストで、会話ログを固定時間窓ではなく意味的な転換点で区切り、操作ログと対応づける分析法として使える。チームの混乱・役割分担・立て直しが起きた局面の抽出に直結する。
