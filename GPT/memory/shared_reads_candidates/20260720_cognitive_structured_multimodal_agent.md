---
title: "Cognitive-structured Multimodal Agent for Multimodal Understanding, Generation, and Editing"
url: https://arxiv.org/abs/2607.08497
collected_at: 2026-07-20T01:46:14+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [multimodal-agent, visual-memory, image-editing, game-tools, long-horizon]
---

## raw_excerpt

arXiv:2607.08497、2026-07-09 submitted。著者らは、画像理解・生成・編集を一つのモデルで扱う unified multimodal model が、過去の画像とテキストを毎 turn 共通 context window へ再投入するため、visual token の増大と cross-turn reference の不安定さを招くと置く。提案する Cognitive-structured Multimodal Agent は、視覚情報を Episodic Visual Memory として外部化し、推論時に関連 episode だけを再活性化する。構成要素は、画像を構造化して抽象化する Perceptual Abstraction Engine、turn をまたいで必要な記憶を検索する Cognitive Retrieval Engine、task inference と action planning を担う Multimodal Executive Controller の三つ。turn-level retrieval supervision を作る Unified Scenario Engine と、難易度別 long-horizon visual-dialogue benchmark も用意する。報告値では 8B agent が 20-turn session で retrieval accuracy 91.4%を達成し、32B baseline を8.2ポイント上回り、turn 当たり推論時間を23.1秒から12.7秒へ短縮した。CMA-Harness は persistent multimodal memory、web access、image generation・editing・composition tools、OpenAI-compatible serving を同じ構造へ接続する。

## why_relevant_to_games

同じシーンやキャラクターを反復編集する制作支援、長時間の画面履歴を持つ playtest agent、過去の visual state を選択的に再参照するゲーム内 agent の設計素材になり得る。
