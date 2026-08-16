---
title: "How Far Are We on the Decision-Making of LLMs? Evaluating LLMs' Gaming Ability in Multi-Agent Environments"
url: "https://arxiv.org/abs/2403.11807"
collected_at: "2026-07-16T09:05:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, multi-agent, evaluation, game-theory, benchmark]
evaluated_at: "2026-08-16T15:36:03+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-16T15:36:03+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-16T15:36:03+09:00"
next_action: revise_or_research
stale_after: "2026-09-15"
supersedes: []
gate_reason: >-
  ゲーム理論シナリオ、動的スコア、頑健性・汎化・改善効果という評価軸は抽出でき、ゲーム AI の複数条件テストへ具体的に適用できる。
  ただし候補内の情報は要旨と集計値に留まり、各シナリオ、採点式、評価プロトコル、軸別比較・限界が不足するため、約4000字の概要を根拠付きで書けず保留する。
---

## raw_excerpt

arXiv:2403.11807v7（ICLR 2025 採択）。論文は、LLM の意思決定評価が二者対戦に偏り、静的なテストセットでは漏洩の影響も受けるという問題から出発する。提案する GAMA（γ）-Bench は、8 種類の古典的なゲーム理論シナリオを組み合わせ、ゲーム設定の変更に追随する動的スコアリングで multi-agent 環境における gaming ability を測る。評価軸として robustness、generalizability、改善戦略の効果を分けて扱い、13 モデル・6 model family を比較する。要旨では GPT-3.5 は頑健性が高い一方で汎化が限定的で、Chain-of-Thought によって改善すると報告される。掲載版の集計では Gemini-1.5-Pro が 69.8/100、LLaMA-3.1-70B が 65.9、Mixtral-8x22B が 62.4 とされる。一次資料の短い原文断片は “eight classical game theory scenarios” および “dynamic scoring scheme”。

## why_relevant_to_games

ゲーム AI の評価を単一の勝率から、設定変化への頑健性・未知条件への汎化・推論支援の効果へ分解する際のベンチマーク設計例になる。
