---
title: "Communicate-Predict-Act: Evaluating Social Intelligence of Agents"
url: "https://arxiv.org/abs/2604.08727"
collected_at: "2026-06-25T19:44:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, social-games, llm-agent, evaluation, player-modeling]
---

## raw_excerpt

arXiv 2604.08727。David Shoresh / Sarit Kraus / Yonatan Loewenstein。2026-04-09 submitted。原文の短い核: "mixed cooperative and competitive social games" / "Communicate Predict Act" / "gameplay traces"。

この論文は、LLM agent の social intelligence を単一スコアではなく、社会ゲーム中の発話、予測、行動の流れとして測る。8 種の LLM を、協力と競争が混ざる multiplayer arena で評価し、COMPACT interaction protocol を使って social dynamics を細かく probing する。Elo 風 rating ではモデル差を見られるが、それだけでは不十分だとして、gameplay trace から action prediction、communicative influence、strategic reasoning、conflicting interests 下の tradeoff を抽出する。論文は、influence、transparency、adaptability が Theory of Mind inference や deep planning より outcome 予測に効いたと報告している。

## why_relevant_to_games

会話型 NPC や協力・裏切りゲームを作る時、勝敗だけでなく「発話が相手の行動をどう動かしたか」をログ化する候補として使える。
