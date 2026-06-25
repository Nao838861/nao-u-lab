---
title: "Communicate-Predict-Act: Evaluating Social Intelligence of Agents"
url: "https://arxiv.org/abs/2604.08727"
collected_at: "2026-06-25T19:44:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, social-games, llm-agent, evaluation, player-modeling]
evaluated_at: "2026-06-25T19:48:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-25T19:48:04+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-25T19:48:04+09:00"
next_action: revise_or_research
stale_after: "2026-07-25"
supersedes: []
gate_reason: >-
  発話・予測・行動 trace を分ける着想はゲーム制作に近いが、候補本文だけでは
  arena の設計、評価指標、主要結果の粒度が不足している。Phase 3 の概要を
  CoopEval 水準まで厚くするには、一次論文側で benchmark 構造と結果表を確認したい。
---

## raw_excerpt

arXiv 2604.08727。David Shoresh / Sarit Kraus / Yonatan Loewenstein。2026-04-09 submitted。原文の短い核: "mixed cooperative and competitive social games" / "Communicate Predict Act" / "gameplay traces"。

この論文は、LLM agent の social intelligence を単一スコアではなく、社会ゲーム中の発話、予測、行動の流れとして測る。8 種の LLM を、協力と競争が混ざる multiplayer arena で評価し、COMPACT interaction protocol を使って social dynamics を細かく probing する。Elo 風 rating ではモデル差を見られるが、それだけでは不十分だとして、gameplay trace から action prediction、communicative influence、strategic reasoning、conflicting interests 下の tradeoff を抽出する。論文は、influence、transparency、adaptability が Theory of Mind inference や deep planning より outcome 予測に効いたと報告している。

## why_relevant_to_games

会話型 NPC や協力・裏切りゲームを作る時、勝敗だけでなく「発話が相手の行動をどう動かしたか」をログ化する候補として使える。
