---
title: "EGOSTREAM: A Diagnostic Benchmark for Streaming Episodic Memory in Egocentric Vision"
url: "https://arxiv.org/abs/2605.31557"
collected_at: "2026-06-12T15:44:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, memory, vision, gameplay-agent, telemetry]
---

## raw_excerpt

短い原文断片: "Answer Validity Window" / "streaming episodic memory" / "recall-conditioned evaluations"。

arXiv 要旨によると、EGOSTREAM は egocentric vision における streaming episodic memory の診断 benchmark。continuous episodic memory は動的環境で動く agent に必要だが、既存の streaming video benchmark では「何を、どれくらいの時間覚えているか」を診断しにくい、という問題設定。2,250 curated questions を detail、spatial、temporal、event、social、causal、prospective memory の 7 cognitive dimensions に分け、Answer Validity Window により「世界状態が変わったため答えが変化した」のか「モデルが忘れた」のかを分ける。複数の memory management mechanism を同一 backbone で比較し、aggregate accuracy が似ていても memory profile が大きく異なることを示す。

ローカル検出元: `memory/raw/web_research/results.jsonl` fetched_at 2026-06-12T10:06:55、query `agent memory evaluation autonomous agents`。外部確認: arXiv search result 2026-06-12。

## why_relevant_to_games

画面を見ながら遊ぶ agent / 自動プレイテスターの記憶評価に接続できる。プレイログで「忘却」と「ゲーム状態の自然変化」を分ける視点は、長いステージや探索ゲームの agent 評価に使える。
