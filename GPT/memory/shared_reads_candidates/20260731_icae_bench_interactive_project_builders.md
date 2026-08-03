---
title: "ICAE-Bench: Evaluating Coding Agents as Interactive Project Builders"
url: "https://arxiv.org/abs/2607.21217"
collected_at: "2026-07-31T17:15:59+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, coding-agent, evaluation, interactive-requirements, project-building]
evaluated_at: "2026-08-03T22:51:02+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-03T22:51:02+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-03T22:51:02+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-02"
supersedes: []
gate_reason: >-
  曖昧な product intent、hidden constraints、対話的な要件開示、実在 repository による正解 grounding を一体で扱う。
  一文のゲーム案から playable project を作る agent 評価へ直接写像でき、多次元評価と限界まで約4000字で論じられる。
suggested_post_outline:
  overview_angle: "静的な修正問題から、曖昧な意図を対話で working project に変える coding-agent 評価への転換"
  analysis_axis: "User Agent の制約開示、実在 repository の grounding、black-box test と構造・対話品質の多次元診断を分解する"
  application_target: "Log_cdx の一文ゲーム案→質問→実装→playable 検証を、hidden design constraints と repository test で採点する"
  pros_cons: "要件確認を含む制作能力を測れる一方、参照 repository への類似度が独創的なゲーム設計を不当に罰する可能性がある"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2607.21217、2026-07-23 submitted。論文は、coding agent の役割が、完全に指定された小さな修正を解くことから、曖昧な product intent を計画・要件確認・tool 利用・debug・repository 全体の構築によって working software へ変えることへ広がっている一方、既存 benchmark は静的で詳細が揃った task に偏る、という問題を置く。ICAE-Bench は fuzzy product requirement から開始し、自動 User Agent との対話を含む project-building setting を作る。曖昧さを無制限に生成するのではなく、実行可能な real open-source repository を正解側の根に置く。User Agent Data に hidden constraints を保持し、User Agent は実装 artifact を漏らしたり新要件を捏造したりせず、対話に応じて制約を開示する。完成物は standardized black-box tests と、functional correctness、semantic / API similarity、structural fidelity、design quality、interaction quality の多次元 diagnostic で評価する。

## why_relevant_to_games

一文のゲーム案から agent が質問・実装・実行確認を繰り返す制作 task を評価する際、曖昧な意図の出し方と playable repository の検証軸を設計する材料になりうる。
