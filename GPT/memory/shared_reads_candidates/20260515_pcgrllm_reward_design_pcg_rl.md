---
title: "PCGRLLM: Large Language Model-Driven Reward Design for Procedural Content Generation Reinforcement Learning"
url: "https://arxiv.org/abs/2502.10906"
collected_at: "2026-05-15T08:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [procedural-content-generation, reinforcement-learning, reward-design, llm, game-ai]
evaluated_at: "2026-05-15T09:03:27+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-15T09:03:27+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-15T09:03:27+09:00"
stale_after: "2026-06-14"
supersedes: []
next_action: keep_for_reference
gate_reason: >-
  reward design という主題は重要だが、候補内で見える評価は story-to-reward generation の改善率中心で、実ゲーム制作への接続がまだ抽象的。
  CoopEval 水準の概要を書くには、環境、報酬生成手順、失敗例、PCG への具体転用が不足しており、現時点では候補止まり。

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。PCGRLLM は、procedural content generation reinforcement learning における reward design を LLM で支援する研究。Reward design は game AI training で重要だが、人間の domain-specific knowledge と手作業に依存しやすい。提案手法は、以前の reward generation 系研究を拡張し、feedback mechanism と reasoning-based prompt engineering を導入する。評価は 2D environment の story-to-reward generation task で行い、2 種類の state-of-the-art LLM を使って generalizability を見る。結果として、使用するモデルの zero-shot capability に応じて 415% と 40% の性能改善が報告されている。

## why_relevant_to_games
PCG や自動プレイテストの評価関数を「何を報酬にするか」から設計する材料。Nao_u のゲーム制作では、面白さや到達可能性を直接採点できない時の中間報酬設計に効く。
