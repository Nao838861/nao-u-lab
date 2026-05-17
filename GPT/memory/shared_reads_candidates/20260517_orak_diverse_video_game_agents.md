---
title: "Orak: A Foundational Benchmark for Training and Evaluating LLM Agents on Diverse Video Games"
url: "https://openreview.net/forum?id=H1ncX6O6Yh"
collected_at: "2026-05-17T09:44:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, benchmark, mcp, evaluation, fine-tuning]
---

## raw_excerpt

OpenReview ICLR 2026 Poster。Dongmin Park ほか。OpenReview の abstract では、LLM agents がゲーム業界で知的で人間に好まれるキャラクターを可能にしつつある一方、現行 benchmark は多様なジャンル横断能力、複雑な gameplay に必要な agentic modules、pre-trained LLM を gaming agents に適応する fine-tuning dataset が不足している、と述べる。Orak は 12 の人気 video games、主要ジャンル、Model Context Protocol ベースの plug-and-play interface を使い、systematic and reproducible studies を可能にする。expert LLM gameplay trajectories の fine-tuning dataset、game leaderboards、LLM battle arenas、input modality / agentic strategies / fine-tuning effects の分析を含む。

## why_relevant_to_games

単一ゲームの勝敗ではなく、複数ジャンル・入力形式・agentic module の差を観測する枠組み。Nao_u_BOT 側では prototype ごとの harness 差や、MCP 的な操作インターフェース設計の参照になる。
