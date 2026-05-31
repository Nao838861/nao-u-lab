---
title: "Towards Automated Crowdsourced Testing via Personified-LLM"
url: "https://arxiv.org/abs/2603.24160"
collected_at: "2026-05-27T14:59:35+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, automated-testing, personas, llm-agents, gui-testing, evaluation]
evaluated_at: "2026-05-27T15:05:10+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-27T15:05:10+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-27T15:05:10+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: revise_or_research
gate_reason: >-
  testing mindset / exploration strategy / interaction habit で persona を切り、GUI 探索の多様性と bug 発見数で評価する骨格は明確で、ゲーム UI・tutorial・設定画面の自動探索に転用できる。
  ただし対象は一般 GUI testing であり、今回同時に収集された game playtesting 直結候補と比べるとゲーム制作への適用説明が一段迂回する。Phase 3 投稿候補としては、ゲーム固有候補の後に再比較するのが妥当。

---

## raw_excerpt

著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。arXiv:2603.24160、2026-03-25 submitted。GUI testing では crowdsourced testing が人間の多様な行動・端末・利用状況を拾える一方、自動テストは再現性と効率が高いが行動が狭くなりやすい。論文は PersonaTester を提案し、LLM-based agent に representative personas を注入して、人間らしい探索の多様性を controllable / repeatable に再現する。

persona は testing mindset、exploration strategy、interaction habit の 3 軸で定義される。実験では real crowdworker の行動パターンを再現し、同一 persona 内では一貫し、異なる persona 間では行動が分かれる、と報告されている。abstract によると behavioral diversity は baseline に対して 117.86% から 126.23% 改善し、persona-guided agents は 100 件超の crash と 11 件の functional bug を引き起こした。短い原文フレーズ: "testing mindset, exploration strategy, and interaction habit".

## why_relevant_to_games

ゲームの headless bot / visual smoke を「最短クリア bot」だけでなく、慎重派・乱暴派・入力連打派・寄り道派などの persona policy に分ける発想へ使える。
