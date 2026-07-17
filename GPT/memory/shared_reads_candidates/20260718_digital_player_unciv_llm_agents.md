---
title: "Digital Player: Evaluating Large Language Models based Human-like Agent in Games"
url: "https://arxiv.org/abs/2502.20807"
collected_at: "2026-07-18T02:44:49+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, player-modeling, strategy-game, llm-agent, evaluation]
evaluated_at: "2026-07-18T02:47:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-18T02:47:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-18T02:47:00+09:00"
next_action: revise_or_research
stale_after: "2026-08-17"
supersedes: []
gate_reason: >-
  Unciv 上で長期計画・数値推論・外交を同時評価する問題設定はゲーム制作へ具体的に適用できる。
  しかし候補本文は abstract 相当で、実験条件・比較対象・評価指標・定量結果がなく、CoopEval 水準の概要を根拠付きで構成できない。
---

## raw_excerpt

論文は、LLM ベースの agent を「digital player」として調べる application-level testbed を、オープンソースの Civilization 系 strategy game `Unciv` 上に構築する。ゲームには広い意思決定空間があり、外交交渉や欺瞞を含む言語的 interaction も存在するため、agent には数値推論、長期計画、社会的 interaction、協力、交渉が同時に要求される。著者らはこの環境を、agent の gameplay data を継続的に集めて研究へ戻す data flywheel の基盤として位置づける。公開実装は CivAgent。abstract は課題を “numerical reasoning and long-term planning” と記述し、単なる勝率だけでなく human-like responses を生成する能力も digital player の課題として挙げている。

出典メモ: arXiv:2502.20807、2025-02-28 投稿。著者は Jiawei Wang, Kai Wang, Shaojie Lin, Runze Wu, Bihan Xu, Lingeng Jiang, Shiwei Zhao, Renyu Zhu, Haoyu Liu, Zhipeng Hu, Zhong Fan, Le Li, Tangjie Lyu, Changjie Fan。公開リポジトリは abstract 記載の `https://github.com/fuxiAIlab/CivAgent`。

## why_relevant_to_games

戦略ゲームの playtest agent を、勝敗だけでなく長期計画・外交・交渉・人間らしい応答まで含む複数軸で観察する際の事例になる。Nao_u_BOT の bot-policy matrix や headless 評価を、言語 interaction を含むゲームへ拡張する場面に接続できる。
