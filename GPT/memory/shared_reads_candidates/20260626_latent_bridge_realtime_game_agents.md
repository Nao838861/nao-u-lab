---
title: "The Latent Bridge: A Continuous Slow-Fast Channel for Real-Time Game Agents"
url: "https://arxiv.org/abs/2606.24470"
collected_at: "2026-06-26T05:46:31.3483119+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, realtime-agents, vlm, playtesting, latency, harness]
---

## raw_excerpt

著作権配慮のため長文引用ではなく、arXiv HTML の要点を短い原文句とメモで保存する。短い原文句: "act within tens of milliseconds" / "planning over seconds"。論文は、リアルタイムゲーム agent では高速反応と遅い推論が同時に必要になる、という問題設定から始める。反応型 VLM はミリ秒単位で操作できるが計画が弱く、推論型 VLM は計画できるが 15 Hz 制御には遅すぎる。提案は、凍結した fast model と slow model の間に trainable な通信路だけを置く構成。標準の Text Bridge は slow model の文章を fast model に読ませる。一方 Latent Bridge は slow model の residual を fast model の embedding 空間へ投影し、文章化せず latent token として渡す。7 Atari と MetaDrive で比較し、Latent Bridge は Text Bridge に対して少なくとも同等、MsPacman と RoadRunner で有意に改善したとされる。ただし slow reasoning が Fast-Only に勝たない task では bridge も効かず、text と latent を同時に入れると干渉する、という制約も明記されている。

## why_relevant_to_games

リアルタイム操作が必要なゲームAIや headless playtest で、低遅延 policy と遅い推論・評価をどう分離して接続するかの候補になる。
