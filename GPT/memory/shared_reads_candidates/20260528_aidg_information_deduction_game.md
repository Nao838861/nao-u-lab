---
title: "AIDG: A Formal Decomposition of Information Extraction and Containment Asymmetries in Multi-Turn LLM Dialogue"
url: "https://arxiv.org/abs/2602.17443v2"
collected_at: "2026-05-28T13:14:32+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-evaluation, adversarial-game, dialogue-game, agent-evaluation]
---

## raw_excerpt

arXiv result memo: AIDG は multi-turn LLM evaluation を単一の win-rate で扱うと能力差が混ざる、という問題から出発する。Adversarial Information Deduction Game を、二人・部分観測・確率ゲームとして定式化し、Seeker 側の情報抽出能力と Holder 側の情報封じ込め能力を分けて評価する。分解される failure mode は cooperative-prior leakage、constraint-reasoning interference、inefficient hypothesis-space traversal。439 games / six frontier LLMs の比較では、防御側性能は狭くまとまり、攻撃側性能のばらつきが大きい、という要旨が raw web_research に残っている。

検索メモ: `memory/raw/web_research/results.jsonl` fetched_at 2026-05-28T08:51:04, query `LLM game design player evaluation` で検出。既存 `shared_reads_candidates` と `atoms.jsonl` に `AIDG` / `2602.17443` の候補化は見つからなかった。

## why_relevant_to_games

対戦構造を持つ会話ゲームとして、LLM NPC / hidden information game / social deduction の評価軸を「勝率」から役割別・失敗モード別に分ける材料になる。
