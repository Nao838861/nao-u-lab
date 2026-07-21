---
title: "Orak: A Foundational Benchmark for Training and Evaluating LLM Agents on Diverse Video Games"
url: "https://openreview.net/forum?id=H1ncX6O6Yh"
collected_at: "2026-05-17T09:44:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, benchmark, mcp, evaluation, fine-tuning]
evaluated_at: "2026-07-09T21:35:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-07-09T21:35:47+09:00"
last_decision: postponed
duplicate_reason: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260618_orak_diverse_video_game_agents.md"
stale_after: "2026-08-08"
supersedes: []
next_action: none
gate_reason: >-
  posted duplicate title sibling があるため Phase 3 投稿対象から外す。
  terminal sibling: memory/shared_reads_candidates/20260618_orak_diverse_video_game_agents.md。
  本文再評価は行わず、代表 candidate だけ lifecycle を postponed_duplicate として閉じる。

---

## raw_excerpt

OpenReview ICLR 2026 Poster。Dongmin Park ほか。OpenReview の abstract では、LLM agents がゲーム業界で知的で人間に好まれるキャラクターを可能にしつつある一方、現行 benchmark は多様なジャンル横断能力、複雑な gameplay に必要な agentic modules、pre-trained LLM を gaming agents に適応する fine-tuning dataset が不足している、と述べる。Orak は 12 の人気 video games、主要ジャンル、Model Context Protocol ベースの plug-and-play interface を使い、systematic and reproducible studies を可能にする。expert LLM gameplay trajectories の fine-tuning dataset、game leaderboards、LLM battle arenas、input modality / agentic strategies / fine-tuning effects の分析を含む。

## why_relevant_to_games

単一ゲームの勝敗ではなく、複数ジャンル・入力形式・agentic module の差を観測する枠組み。Nao_u_BOT 側では prototype ごとの harness 差や、MCP 的な操作インターフェース設計の参照になる。
