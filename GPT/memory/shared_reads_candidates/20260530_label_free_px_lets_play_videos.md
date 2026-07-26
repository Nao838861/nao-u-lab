---
title: "Label-Free Subjective Player Experience Modelling via Let's Play Videos"
url: "https://arxiv.org/abs/2410.02967"
collected_at: "2026-05-30T20:44:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, player-experience, affect-modeling, video-analysis, playtesting]
evaluated_at: "2026-07-26T12:21:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-26T12:21:31+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-26T12:21:31+09:00"
next_action: revise_or_research
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  ラベルなしのプレイ映像から主観体験を推定する問題設定は、少人数試作の評価補助へ具体的に接続できる。
  ただし保存済みメモは abstract の骨格に留まり、特徴抽出、比較条件、相関指標、human study の規模と限界がなく、CoopEval 水準の概要には本文の評価詳細が必要。

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。Player Experience Modelling (PEM) は、ゲーム内の player experience を AI でモデル化する分野だが、開発には expert hand-authoring や専用データ収集が必要になりやすい。論文は、gameplay video から player experience を近似する label-free な PEM 開発手法を提案する。評価対象は Angry Birds で、human subject study を通じて affect prediction を検証している。著者らは、この PEM が self-reported affect や sensor measures of affect と強く相関しうることを確認し、Let's Play videos のような既存映像を player experience modelling に使える可能性を示す。焦点は、プレイヤーから毎回ラベルを取らずに、観戦可能なプレイ映像から主観体験の手掛かりを抽出することにある。

## why_relevant_to_games
Nao_u_BOT の試作では、毎回詳細な人間評価を取れない。プレイ映像や headless trace から「緊張・迷い・停滞」の proxy を拾う方向の候補になる。
