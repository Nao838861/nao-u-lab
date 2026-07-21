---
title: "The Ink Splotch Effect: A Case Study on ChatGPT as a Co-Creative Game Designer"
url: "https://arxiv.org/abs/2403.02454"
collected_at: "2026-07-17T13:44:24+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, co-creation, llm, prototyping, user-study]
evaluated_at: "2026-07-17T13:46:42+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-21T11:07:55+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-6d729c1da0befef9; terminal:memory/shared_reads_candidates/20260515_ink_splotch_cocreative_game_designer.md: https://arxiv.org/abs/2403.02454 same work; memory/shared_reads_candidates/20260609_ink_splotch_effect_chatgpt_game_designer.md: https://arxiv.org/abs/2403.02454 same work; memory/shared_reads_candidates/20260709_ink_splotch_llm_cocreative_game_design.md: https://arxiv.org/abs/2403.02454 same work; memory/shared_reads_candidates/20260715_ink_splotch_co_creative_game_design.md: https://arxiv.org/abs/2403.02454 same work; memory/shared_reads_candidates/20260717_ink_splotch_effect_co_creative_game_designer.md: https://arxiv.org/abs/2403.02454 same work and prior Slack provenance; memory/shared_reads_candidates/20260718_ink_splotch_effect_co_creative_game_designer.md: https://arxiv.org/abs/2403.02454 same work; reason:6件は同じ arXiv 2403.02454 を同じ比較設計で要約した重複候補であり 独立資料として残す差分がない。既投稿 provenance も代表候補に記録済みのため全 open sibling を duplicate として閉じる。"
next_action: none
stale_after: "2026-08-16"
supersedes: []
gate_reason: >-
  3ジャンル×3条件の9プロトタイプ、45件のブラインド評価、6評価軸、自由記述を通じて、LLMの発想支援と文脈・game feel・実装面の弱点を具体的に比較できる。
  実験の制約も明示されており、同一ベースから設計案を分岐してプレイ評価する制作サイクルへ直接適用でき、CoopEval水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "LLMを自律デザイナーとして競わせる実験から、発想のミューズとして使う適切な境界を抽出する"
  analysis_axis: "人間とLLMの差を、着想、文脈保持、実装、反復調整、game feel、ブラインド評価の各段階で分解する"
  application_target: "同一の最小プロトタイプから人間設計版とLLM提案版を分岐し、出自を伏せたプレイ評価で採否を決める小規模probe"
  pros_cons: "長所は比較条件と失敗例が具体的なこと。短所はGPT-3.5・Unity・45回答・開発者の暗黙介入に依存し、現行モデルへの性能一般化はできないこと"
  verdict_pre: "部分採用"
postpone_reason: >-
  canonical URL（arXiv:2403.02454）は #shared-reads に 2026-05-11 の初回投稿と 2026-05-12 の単独再投稿がすでに存在する。
  既存投稿は現行品質に達していないが、今回の candidate も短い excerpt に留まり、3500-4500字の新規かつ記事固有の分析として置換投稿する根拠が不足している。
  重複を増やさず、全文に基づく実験条件・数値結果・失敗条件を揃えた materially deeper な改稿ができる場合だけ再審査する。
---

## raw_excerpt

本研究は、LLM をゲーム設計の高水準な共同制作者、あるいは発想を誘発する「ミューズ」として扱えるかを調べる。着想は、芸術家が曖昧なインクの染みからイメージを引き出す練習に由来する。AI 支援が、人間のデザイナーによる創作意図と比べてゲームを改善するのか、妨げるのか、それとも異なる種類の品質をもたらすのかを問いに置く。

検証では LLM を意思決定の前面に置き、その設計能力に負荷をかける。3 ジャンルについて、それぞれ最小構成のベースゲーム、人間のゲームデザイナーが機能と game feel を加えた版、ChatGPT の出力から機能と feel を実装した版を制作する。参加者には由来を伏せて各ゲームの品質と選好を評価してもらい、さらに自由記述フィードバックを集める。論文は、AI チャットボットへ創作意図を伝える開発過程と参加者コメントを併せて検討し、デザイン中心の役割で AI を使う際の利点と弱点を整理する。

原文の中核表現: “high-level creative collaborators and ‘muses’ for game design.”

## why_relevant_to_games

同一のベースゲームから人間設計版と LLM 設計版を分け、ブラインド評価する比較枠組みは、LLM を企画・メカニクス・game feel のどこに置くかを試すプロトタイプ実験に直結する。
