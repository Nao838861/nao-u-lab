---
title: "PlayCoder: Making LLM-Generated GUI Code Playable"
url: "https://arxiv.org/abs/2604.19742"
collected_at: "2026-05-15T08:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-code-generation, gui-games, playability, automated-repair, evaluation-harness]
---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。PlayCoder は、LLM-generated GUI code、特に games の playable 性を評価・修復する研究。既存 benchmark は test cases による correctness 評価に寄り、interactive / event-driven systems の state transitions や user action sequences を十分に見ない。提案は PlayEval benchmark、Play@k metric、LLM-based PlayTester agent を含む。PlayTester は task-oriented GUI playthroughs を行い、logic violations を自動検出する。10 種類の code LLM 実験では compilation rate が高くても Play@3 がほぼゼロに近いことを示し、PlayCoder は generate-evaluate-repair の closed loop で Exec@3 と Play@3 を改善する。

## why_relevant_to_games
「ビルドが通る」と「遊べる」は別問題という、Nao_u の playable diff 運用に近い。小規模 HTML/JS ゲームでも、操作列・状態遷移・logic violation を harness に入れる観点として使える。
