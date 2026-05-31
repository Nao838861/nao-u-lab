---
title: "GameDevBench: Evaluating Agentic Capabilities Through Game Development"
url: "https://arxiv.org/abs/2602.11103"
collected_at: "2026-05-29T10:13:42+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, game-development, agent-evaluation, multimodal-feedback, headless]
evaluated_at: "2026-05-29T10:17:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: ready_to_post
status: ready_to_post
last_reviewed_at: "2026-05-29T10:17:06+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-05-29T10:17:06+09:00"
stale_after: "2026-06-28"
supersedes: []
gate_reason: "ゲーム開発エージェント評価という問題設定、132 task benchmark、multimodal feedback、54.5% ceiling という評価結果が候補メモだけでも抽出できる。Nao_u_BOT 側の headless/screenshot/video feedback 評価設計に直接転用でき、Phase 3 で CoopEval 水準の概要に展開できる。"
next_action: post_to_shared_reads
suggested_post_outline:
  overview_angle: "コード生成ベンチでは落ちる、ゲーム制作固有の視覚・動画・アセット理解まで測る agentic benchmark として読む。"
  analysis_axis: "タスク設計、multimodal feedback の有無、既存 software benchmark との差分、成功率が落ちる要因を分けて分析する。"
  application_target: "自分達のゲーム制作サイクルの headless harness / screenshot regression / 動画確認 / エージェントへの観測入力設計。"
  pros_cons: "メリットは評価の焦点がゲーム固有で実装検証に近いこと。デメリットは benchmark 解法がそのまま制作品質評価になるわけではなく、視覚フィードバック設計が重くなること。"
  verdict_pre: "部分採用。benchmark そのものではなく、ゲーム制作 agent 評価の観測入力と失敗分類を採用する。"

---

## raw_excerpt

Copyright-safe excerpt notes from the abstract/search record:

- Short quoted phrase: "GameDevBench consists of 132 tasks"
- Short quoted phrase: "the best agent solving only 54.5% of tasks"
- Short quoted phrase: "image and video-based feedback mechanisms"

GameDevBench は、ゲーム開発を agent 評価ベンチとして扱う研究。対象タスクは web/video tutorial 由来で、コードだけでなく shader、sprite、animation、visual scene の理解が必要になる。既存の software development benchmark よりも平均的な解決に必要な code lines / file changes が多く、multimodal complexity が上がると成功率が落ちるという形で、ゲーム制作特有の難しさを測っている。さらに、画像・動画ベースの feedback を agent に戻す簡単な仕組みで性能が改善する、という観察がある。

## why_relevant_to_games

AI がゲームを作る時の headless / screenshot / video feedback を、単なる動作確認ではなく「multimodal game development の評価入力」として設計する候補。
