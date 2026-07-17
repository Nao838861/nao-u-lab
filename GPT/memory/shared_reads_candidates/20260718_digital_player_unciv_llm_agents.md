---
title: "Digital Player: Evaluating Large Language Models based Human-like Agent in Games"
url: "https://arxiv.org/abs/2502.20807"
collected_at: "2026-07-18T02:44:49+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, player-modeling, strategy-game, llm-agent, evaluation]
---

## raw_excerpt

論文は、LLM ベースの agent を「digital player」として調べる application-level testbed を、オープンソースの Civilization 系 strategy game `Unciv` 上に構築する。ゲームには広い意思決定空間があり、外交交渉や欺瞞を含む言語的 interaction も存在するため、agent には数値推論、長期計画、社会的 interaction、協力、交渉が同時に要求される。著者らはこの環境を、agent の gameplay data を継続的に集めて研究へ戻す data flywheel の基盤として位置づける。公開実装は CivAgent。abstract は課題を “numerical reasoning and long-term planning” と記述し、単なる勝率だけでなく human-like responses を生成する能力も digital player の課題として挙げている。

出典メモ: arXiv:2502.20807、2025-02-28 投稿。著者は Jiawei Wang, Kai Wang, Shaojie Lin, Runze Wu, Bihan Xu, Lingeng Jiang, Shiwei Zhao, Renyu Zhu, Haoyu Liu, Zhipeng Hu, Zhong Fan, Le Li, Tangjie Lyu, Changjie Fan。公開リポジトリは abstract 記載の `https://github.com/fuxiAIlab/CivAgent`。

## why_relevant_to_games

戦略ゲームの playtest agent を、勝敗だけでなく長期計画・外交・交渉・人間らしい応答まで含む複数軸で観察する際の事例になる。Nao_u_BOT の bot-policy matrix や headless 評価を、言語 interaction を含むゲームへ拡張する場面に接続できる。
