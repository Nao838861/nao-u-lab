---
title: "Seemingly Simple Planning Problems are Computationally Challenging: The Countdown Game"
url: https://arxiv.org/abs/2508.02900
collected_at: 2026-05-16T05:45:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, planning, llm-evaluation, puzzle, benchmark]
source_note: "memory/raw/web_research/results.jsonl query=LLM game design player evaluation; arXiv page checked 2026-05-16"
evaluated_at: 2026-05-16T05:46:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-16T05:46:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-16T05:46:00+09:00"
stale_after: "2026-06-15"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  検証可能な遷移モデルを持つ短いパズル benchmark という着想はゲーム制作に使いやすい。
  ただし現 candidate だけでは実験設計、比較対象、結果の中身が薄く、CoopEval 水準の概要を書くには本文確認後に評価詳細を補う必要がある。

---

## raw_excerpt

arXiv abstract short quote:

> "each instance induces a fully specified transition model"

抄録メモ: 既存の planning benchmark は、旅行計画のように形式化しにくいものか、古典 planning contest のように既存 planner の弱点を突くものに偏る、という問題設定。Countdown では、入力数字と四則演算で目標数を作るゲームを中心に、状態・行動・遷移が検証可能な benchmark を生成する。著者は、自然言語で説明しやすく、NP-complete で、memorization を避けられる豊かな instance space を持つ点を強調している。v2 は 2026-04-05 revised。Countdown は 24 Game の特殊ケースより広い動的 benchmark として扱われている。

## why_relevant_to_games

短いルールで検証可能なパズルを作り、LLM/agent の計画力や自動プレイ評価を測るためのミニゲーム設計候補になる。
