---
title: "NitroGen: An Open Foundation Model for Generalist Gaming Agents"
url: "https://arxiv.org/abs/2601.02427"
collected_at: "2026-06-13T04:10:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, agent, benchmark, gameplay-video, generalist-agent]
evaluated_at: "2026-07-27T04:52:35+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-27T04:52:35+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-27T04:52:35+09:00"
next_action: revise_or_research
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  大規模な動画・行動対から汎用ゲーム agent を作る問題設定と中核構成は抽出できるが、現 candidate には benchmark のゲーム分割、比較条件、定量結果、失敗例がない。
  playable diff 検証への接続も一般的な自動操作に留まるため、4000 字級の概要にする前に一次資料から評価設計と限界を補う必要がある。
---

## raw_excerpt
arXiv:2601.02427。検索結果の要旨によると、NitroGen は 1,000 本超のゲームから集めた 40,000 時間の gameplay video を使い、vision-action foundation model として generalist gaming agent を訓練する研究。構成要素は、公開 gameplay video から player actions を自動抽出する internet-scale video-action dataset、cross-game generalization を測る multi-game benchmark environment、そして behavior cloning で訓練される unified vision-action model。対象能力として、3D action game の combat encounter、2D platformer の高精度 control、procedurally generated world の exploration などが挙げられている。未見ゲームへの transfer も扱い、scratch から訓練した model と比べた task success rate の改善を報告している。dataset、evaluation suite、model weights を公開する方向の研究として紹介されている。

## why_relevant_to_games
Nao_u_BOT の playable diff 検証で、ゲームを「観察して操作する agent」をどう作るか、動画・行動ログ・cross-game benchmark をどう集めるかの素材になる。
