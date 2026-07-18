---
title: "Beyond the Current Observation: Evaluating Multimodal Large Language Models in Controllable Non-Markov Games"
url: "https://arxiv.org/abs/2606.19338"
collected_at: "2026-07-19T05:44:56+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, agent-evaluation, multimodal, memory, benchmark]
evaluated_at: "2026-07-19T05:49:28+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-19T05:49:28+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-19T05:49:28+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  非 Markov 環境の記憶能力を、完全状態公開や事後想起ではなく多段階行動の中で測る問題設定・二つのゲーム・難度軸・Memory Gap・主要結果が揃っている。
  AI テストプレイヤーの失敗を忘却と方策選択に分ける評価へ直接適用でき、CoopEval 水準の概要を独立して構成できる。
suggested_post_outline:
  overview_angle: "現在観測だけでは解けないゲームを使い、MLLM の記憶を行動中に測る評価設計として書く。"
  analysis_axis: "既存評価の交絡、Matching Pairs / 3D Maze、三つの難度軸、head-to-head duel、Memory Gap、長文脈でも残る忘却を分析する。"
  application_target: "部分観測ゲームの headless test と、AI テストプレイヤーの失敗原因を記憶欠落・行動選択へ分解する診断 harness。"
  pros_cons: "メリットは記憶と方策の失敗を分離できる点。デメリットは合成ゲーム上の測定であり、実作品の意味記憶や人間らしい探索へそのまま一般化できない点。"
  verdict_pre: "部分採用。テスト用ミニゲームと Memory Gap 型診断を先に試す。"
---

## raw_excerpt

原論文要旨からの採取メモ。閉ループ方策として動くマルチモーダル基盤モデルには、現在は見えていない過去の観測に基づいて行動する能力が必要になる。既存ベンチマークは完全状態を公開したり、隠れ状態の再構成を他の能力と混同したり、エピソード終了後の想起だけを測ったりするため、この能力を単独で測りにくい。RNG-Bench（Reconstructive Non-Markov Games）は、過去の観測を再構成しながら多段階に行動する能力を、Matching Pairs と 3D Maze の二つのゲームで評価する。難度軸はグリッドサイズ、視覚パターン、観測モダリティの三つ。個体差を抑える head-to-head duel と、忘却を不適切な行動選択から分離する Memory Gap 指標も導入する。最難条件は約128Kトークン、1エピソード約350画像に達し、現行の先端MLLMでも飽和していない。残差誤りの多くは行動選択より過去観測の忘却に由来すると報告される。

## why_relevant_to_games

AIテストプレイヤーの失敗を「見落とし・忘却」と「方策選択」に分けて測る評価設計や、部分観測ゲームのテスト用ミニゲーム設計に使える。
