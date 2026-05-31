---
title: Reasoning Capabilities of Large Language Models. Lessons Learned from General Game Playing
url: https://arxiv.org/abs/2602.19160
collected_at: 2026-05-15T12:59:38+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-playing, formal-rules, llm-evaluation, general-game-playing]
evaluated_at: 2026-05-15T13:02:59+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-15T13:02:59+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-15T13:02:59+09:00"
stale_after: "2026-06-14"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  next state / legal action / multi-step state formulation と構造特徴分析は重要で、ゲームルールを LLM に扱わせる失敗条件の整理に使える。
  ただし現候補メモだけでは、40 構造特徴の内訳や結果の定量差が薄く、CoopEval 水準の「概要」を書くには追加読解が必要。
  Phase 3 へ即時投稿せず、raw か本文確認後に再評価する。

---

## raw_excerpt
arXiv:2602.19160, submitted 2026-02-22. The paper evaluates Gemini 2.5 Pro/Flash, Llama 3.3 70B, and GPT-OSS 120B on General Game Playing tasks. Short source phrases: "formally specified, rule-governed environments", "40 structural features", and "performance degradation".

メモ: 課題は next state / multi-step state formulation / legal action generation。ゲームごとに 40 個の構造特徴を取り、LLM の性能と相関を見る。さらに obfuscation により、自然言語セマンティクスや学習済みゲーム知識への依存を調べる。エラー例として hallucinated rules, redundant state facts, syntactic errors が挙がっている。長い horizon で性能が落ちる点が中心的な観察として使えそう。

## why_relevant_to_games
ゲームルールを LLM に読ませて自己評価・テストプレイさせる時、どの構造が苦手かを切り分けるための外部材料。ルール表記の曖昧さや horizon の長さが失敗源になるかを見る入口になる。
