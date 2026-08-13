---
title: "LatticeMind: A Conflict-Aware Memory Primitive for Multi-Agent Systems"
url: "https://arxiv.org/abs/2608.08236"
collected_at: "2026-08-13T18:31:58+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [multi-agent, memory, conflict-resolution, npc-systems, evaluation]
---

## raw_excerpt

arXiv:2608.08236（2026-08-08投稿）。Heng Zhou、Lian Zhang、Yutao Fan ほか。要旨では、複数の LLM agent が候補回答を作れても、互いに矛盾する主張のうち現時点で何を信頼すべきかを持続的に記録する仕組みがないため失敗すると問題設定している。多数決、debate、judge-based selection は一つの出力を選べるが、どの claim が採用され、どれが contested のままか、後の更新がなぜ旧 claim を supersede したかを記録しない。提案する LatticeMind は contradiction を write 時に扱う structured memory で、各 item の status を明示し、安価な symbolic conflict check を先に実行し、意味的に未解決な場合だけ LLM reconciliation を呼ぶ。

source 名の手掛かりを除いた label-blind ConflictBank では accuracy 0.97、最強の aggregation baseline は 0.61。checker または reconciler を外す ablation では 12〜14 points 低下した。別の四つの planning benchmark では naive merge に三つで勝った一方、反復的探索が報酬になる task では deliberation method の代替にはならない、と要旨は報告している。一次資料: https://arxiv.org/abs/2608.08236

## why_relevant_to_games

複数 NPC、playtest agent、設計 critic が同じ世界状態やルールについて矛盾した記録を残す場面で、勝った主張・保留中の主張・更新理由を状態として持たせる設計資料になる。
