---
title: "TriEx: A Game-based Tri-View Framework for Explaining Internal Reasoning in Multi-Agent LLMs"
url: "https://arxiv.org/abs/2604.20043"
collected_at: "2026-06-25T19:44:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-agent, hidden-information, explainability, evaluation]
evaluated_at: "2026-06-25T19:48:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-25T19:48:04+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-25T19:48:04+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-25"
supersedes: []
gate_reason: >-
  問題設定、tri-view の中核、imperfect-information game での評価対象、
  ゲーム制作への接続が候補本文から抽出できる。LLM NPC の「理由」「信念」
  「行動」を分離して検証する実務的な評価軸として投稿水準に届く。
suggested_post_outline:
  overview_angle: "隠し情報ゲームを使い、LLM agent の説明を self-reasoning / belief state / oracle audit の 3 視点に分解する評価枠として紹介する。"
  analysis_axis: "発話された理由、内部信念、実際の行動、外部 oracle の参照信号をどう分け、説明の整合性と時間変化を検査するか。"
  application_target: "LLM NPC、推理ゲーム、交渉ゲーム、裏切り要素のある prototype のプレイテストログ設計。"
  pros_cons: "メリットはデバッグ可能性と評価単位の明確さ。デメリットは oracle 設計とログ収集の重さ、隠し情報ゲーム以外への一般化コスト。"
  verdict_pre: "部分採用。次のゲーム制作では NPC の説明ログを理由・信念・行動に分ける小さな probe として使う。"
---

## raw_excerpt

arXiv 2604.20043。Ziyi Wang / Chen Zhang / Wenjun Peng / Qi Wu / Xinyu Wang。2026-04-21 submitted、ACL2026 Main。原文の短い核: "tri-view explainability framework" / "imperfect-information strategic games" / "what agents say, what they believe, and what they do"。

TriEx は、部分観測・逐次意思決定のゲームで LLM agent の説明を検査する枠組み。自由作文の理由説明ではなく、action に紐づく first-person self-reasoning、時間更新される second-person belief state、環境由来の reference signal に grounded された third-person oracle audit を揃える。これにより、説明を evidence-anchored object として比較し、時間経過と視点の差をまたいで check できる。論文は imperfect-information strategic games を testbed にし、agent が言ったこと、信じていること、実際にしたことのずれを分析できると述べる。

## why_relevant_to_games

隠し情報ゲームや LLM NPC のプレイテストで、NPC の「理由」と「相手モデル」と「実行行動」を分けて記録する設計メモになる。
