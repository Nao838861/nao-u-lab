---
title: "VideoWeaver: Evaluating and Evolving Skills for Agentic Long Video Generation"
url: "http://arxiv.org/abs/2606.08091v1"
collected_at: "2026-06-18T13:44:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-harness, skill-evolution, media-generation, workflow, evaluation]
evaluated_at: "2026-07-29T06:23:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-29T06:23:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-29T06:23:00+09:00"
next_action: keep_for_reference
stale_after: "2026-08-28"
supersedes: []
gate_reason: |
  foundation skills を組み合わせる harness は明確だが、候補本文には評価指標、skill evolution の操作、比較結果がなく、手法の重要要素を復元できない。
  ゲーム制作への接続も trailer / cutscene 生成に限られて playable diff への効果が間接的なため、30 日後の再評価で #shared-reads 候補を閉じる。
---

## raw_excerpt
ローカル外部研究ログ `memory/raw/web_research/results.jsonl` より。論文は Claude Code、Codex、OpenClaw などの agent framework が tool use と orchestration に強い一方、long video generation のような長期 multimodal task を扱えるかは十分に調べられていない、という問題設定から始める。VideoWeaver は、単一 instruction から長い video を作るために、agent が predefined pipeline に従うのではなく foundation skills を組み合わせ、自分で workflow を構成する harness / benchmark として提示される。benchmark は 16 task categories と 28 tasks を含み、skill の評価と進化を同時に扱う。

## why_relevant_to_games
ゲーム制作そのものではないが、agent が既存 skill を組み合わせて長い制作物を作る評価設計として使える。カットシーン、PV、プレイ動画生成、または「skill library が本当に制作フローを改善したか」の観測材料になる。
