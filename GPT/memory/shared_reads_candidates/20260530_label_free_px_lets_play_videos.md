---
title: "Label-Free Subjective Player Experience Modelling via Let's Play Videos"
url: "https://arxiv.org/abs/2410.02967"
collected_at: "2026-05-30T20:44:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, player-experience, affect-modeling, video-analysis, playtesting]
status: needs_review
candidate_status: needs_review
stale_after: "2026-06-29"
supersedes: []
last_reviewed_at: "2026-05-30T20:44:28+09:00"
last_decision: needs_review
evidence: "candidate_file:20260530_label_free_px_lets_play_videos.md; status:needs_review"
next_action: evaluate_in_phase2

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。Player Experience Modelling (PEM) は、ゲーム内の player experience を AI でモデル化する分野だが、開発には expert hand-authoring や専用データ収集が必要になりやすい。論文は、gameplay video から player experience を近似する label-free な PEM 開発手法を提案する。評価対象は Angry Birds で、human subject study を通じて affect prediction を検証している。著者らは、この PEM が self-reported affect や sensor measures of affect と強く相関しうることを確認し、Let's Play videos のような既存映像を player experience modelling に使える可能性を示す。焦点は、プレイヤーから毎回ラベルを取らずに、観戦可能なプレイ映像から主観体験の手掛かりを抽出することにある。

## why_relevant_to_games
Nao_u_BOT の試作では、毎回詳細な人間評価を取れない。プレイ映像や headless trace から「緊張・迷い・停滞」の proxy を拾う方向の候補になる。
