---
title: "TempGlitch: Evaluating Vision-Language Models for Temporal Glitch Detection in Gameplay Videos"
url: "https://arxiv.org/abs/2605.21443"
collected_at: "2026-06-12T11:29:45+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-qa, temporal-reasoning, vlm, gameplay-video]
evaluated_at: "2026-06-12T11:33:36+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781232087.837679"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781232087837679"
  char_count: 4007
  posted_at: "2026-06-12T11:42:41+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-12T11:42:41+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781232087837679"
next_action: none
stale_after: "2026-07-12"
supersedes: []
gate_reason: |-
  spatial glitch と temporal glitch を分け、時間順序でしか見えない破綻を評価する問題設定がゲーム動画 QA に強く接続する。
  paired glitch-free videos と複数 frame-sampling settings による VLM 評価があり、現状モデルの限界も結論として扱える。
  4000字概要では「VLM に任せれば検出できる」という期待を検証し、録画 QA の設計上の注意に落とせる。
suggested_post_outline:
  overview_angle: "ゲーム動画の不具合検出で、静止画ではなく時間変化を見る必要がある理由と、現行 VLM の限界を中心に書く。"
  analysis_axis: "temporal glitch type、paired clean/glitch videos、frame sampling、proprietary/open-weight VLM の near-chance 結果を軸に分析する。"
  application_target: "アニメーション、物理挙動、入力応答、状態遷移の破綻を recorded playtest から検出する評価設計。"
  pros_cons: "メリットは temporal QA の評価軸を明示できる点。デメリットは検出手法そのものより benchmark 色が強く、即時自動化には追加設計が必要な点。"
  verdict_pre: "部分採用。QA 自動化前の評価セット作りと、VLM 判定を過信しない基準として使う。"
---

## raw_excerpt

著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。

arXiv:2605.21443。Yakun Yu ほか。2026-05-20 submitted。対象は gameplay video における temporal glitch detection。既存の glitch detection は static visual anomaly として扱うことが多いが、論文は spatial glitch と temporal glitch を分ける必要を置く。temporal glitch は順序づいた frames の変化を見ないと分からない。TempGlitch は 5 種類の temporal glitch type と paired glitch-free videos を持つ controlled gameplay video benchmark。12 種類の proprietary / open-weight VLM を複数の frame-sampling settings で評価し、現状の VLM は chance 近辺に留まり、保守的に見逃すか過敏に clean video を glitch と扱うかへ崩れやすいと報告されている。短い原文メモ: "temporal glitches", "paired glitch-free videos", "near chance"。

## why_relevant_to_games

操作感や敵挙動の破綻は静止画より時間差分に出るため、録画ログを使った自動検査で「時間的にしか見えない失敗」を拾う観点として使える。
