---
title: Leveraging LLM Agents for Automated Video Game Testing
url: https://arxiv.org/abs/2509.22170
collected_at: 2026-07-14T20:59:32+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-testing, llm-agent, mmorpg, qa, long-horizon]
evaluated_at: "2026-08-13T04:20:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-13T04:20:00+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-0a7d41e00b44c495; terminal:memory/shared_reads_candidates/20260602_titan_llm_agents_automated_video_game_testing.md: status=posted; permalink=https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780340975651269; canonical_url=https://arxiv.org/abs/2509.22170; reason:canonical URL / arXiv work identity が既投稿 candidate と一致し、新規分析差分がないため。"
next_action: none
stale_after: "2026-09-12"
supersedes: []
gate_reason: |-
  canonical URL が既投稿 candidate と一致するため、本文評価前の URL-first preflight で重複として閉じる。
  既投稿 permalink と canonical path を確認済みであり、Phase 3 の投稿対象にはしない。
---

## raw_excerpt

MMORPG は状態空間が広く、更新頻度も高いため、従来の自動テストでは状態被覆と効率を両立しにくい。既存の LLM ゲームプレイも、複雑な状態―行動空間の理解や長期タスクの推論が浅いという問題がある。論文が提案する TITAN は、(1) 高次元なゲーム状態の知覚と抽象化、(2) 利用可能な行動の能動的な最適化と優先順位付け、(3) 行動軌跡の記憶と自己反省による長期推論、(4) 機能・ロジック不具合を検出し診断レポートを作る LLM oracle、という4要素で構成される。PC とモバイルの大規模商用 MMORPG 2作品で試作系を評価し、タスク完了率 95% を報告した。各構成要素の寄与を ablation study で調べ、従来手法が見逃した未知の不具合4件を検出したとしている。また、実運用のゲーム QA パイプライン8件へ導入済みと報告している。

## why_relevant_to_games

headless テストを単なる入力 bot ではなく、状態抽象化・行動優先度・trace memory・bug oracle の分業として設計する際の外部事例になる。長期プレイでの被覆と診断可能性を同時に扱う場面に関係する。
