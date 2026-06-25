---
title: "TriEx: A Game-based Tri-View Framework for Explaining Internal Reasoning in Multi-Agent LLMs"
url: "https://arxiv.org/abs/2604.20043"
collected_at: "2026-06-25T19:44:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-agent, hidden-information, explainability, evaluation]
---

## raw_excerpt

arXiv 2604.20043。Ziyi Wang / Chen Zhang / Wenjun Peng / Qi Wu / Xinyu Wang。2026-04-21 submitted、ACL2026 Main。原文の短い核: "tri-view explainability framework" / "imperfect-information strategic games" / "what agents say, what they believe, and what they do"。

TriEx は、部分観測・逐次意思決定のゲームで LLM agent の説明を検査する枠組み。自由作文の理由説明ではなく、action に紐づく first-person self-reasoning、時間更新される second-person belief state、環境由来の reference signal に grounded された third-person oracle audit を揃える。これにより、説明を evidence-anchored object として比較し、時間経過と視点の差をまたいで check できる。論文は imperfect-information strategic games を testbed にし、agent が言ったこと、信じていること、実際にしたことのずれを分析できると述べる。

## why_relevant_to_games

隠し情報ゲームや LLM NPC のプレイテストで、NPC の「理由」と「相手モデル」と「実行行動」を分けて記録する設計メモになる。
