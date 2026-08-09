---
title: "Orak: A Foundational Benchmark for Training and Evaluating LLM Agents on Diverse Video Games"
url: "https://openreview.net/forum?id=H1ncX6O6Yh"
collected_at: "2026-05-17T09:44:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, benchmark, mcp, evaluation, fine-tuning]
evaluated_at: "2026-08-10T00:40:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-08-10T00:40:07+09:00"
last_decision: postpone
duplicate_reason: duplicate_title_requires_provenance_review
evidence: "gate_decision:postpone; evaluated_at:2026-08-10T00:40:07+09:00; preflight:open_duplicate_title_match"
stale_after: "2026-09-09"
supersedes: []
next_action: revise_or_research
gate_reason: >-
  OpenReview と既投稿 arXiv は title・手法記述が一致するが、fresh preflight は URL / work identity
  の同一性を確定できず review となった。title 一致だけでは閉じず、provenance 対応を確認するまで投稿を保留する。

---

## raw_excerpt

OpenReview ICLR 2026 Poster。Dongmin Park ほか。OpenReview の abstract では、LLM agents がゲーム業界で知的で人間に好まれるキャラクターを可能にしつつある一方、現行 benchmark は多様なジャンル横断能力、複雑な gameplay に必要な agentic modules、pre-trained LLM を gaming agents に適応する fine-tuning dataset が不足している、と述べる。Orak は 12 の人気 video games、主要ジャンル、Model Context Protocol ベースの plug-and-play interface を使い、systematic and reproducible studies を可能にする。expert LLM gameplay trajectories の fine-tuning dataset、game leaderboards、LLM battle arenas、input modality / agentic strategies / fine-tuning effects の分析を含む。

## why_relevant_to_games

単一ゲームの勝敗ではなく、複数ジャンル・入力形式・agentic module の差を観測する枠組み。Nao_u_BOT 側では prototype ごとの harness 差や、MCP 的な操作インターフェース設計の参照になる。
