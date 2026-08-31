---
title: "Prime Agent: A Self-Improving RLM Harness"
url: "https://arxiv.org/abs/2608.23552"
collected_at: "2026-08-31T21:08:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, harness, long-horizon, coding-agent, game-playing, evaluation]
---

## raw_excerpt

原文を基にした日本語抜粋メモ（長文の直接引用ではなく要約）。language model は逐次処理器だが、long-horizon agency には model weights と active context の外側にある情報・計算・持続状態が必要になる。Prime Agent は long-horizon evaluation と coding-agent workflow のための open-source harness で、Recursive Language Model の考え方に沿う persistent IPython REPL を使い、長い context を programmatic に処理しながら test-time compute を実行する。Continual Harness は trajectory をまたいで history、memory、skill、prompt、subagent specification を保持する。recursive subagent は agent 間の直接通信で協調し、人間は Agents View から daemon-backed session を観察・管理できる。

harness は execution、recovery、verification、resource accounting を標準化する一方、戦略構築自体は model に残す。著者らは、実行基盤の失敗を model 能力の失敗として数えないための境界としてこの構成を位置づける。ARC-AGI-3 RHAE Best@1 は30%から95.5%へ上がり、long-context coding、GPU kernel generation、emulator construction、autonomous nanoGPT speedrun でも native／popular harness と同等以上と報告する。Factorio 環境では refinement により technology progression が継続し、専任 subagent によって作業を並列化できたとしている。code は GitHub で公開されている。

## why_relevant_to_games

長時間の自動プレイやゲーム制作 agent で、戦略の弱さと session・復旧・検証基盤の失敗を分離し、Factorio のような継続進行を測る harness 設計の収集材料になる。
