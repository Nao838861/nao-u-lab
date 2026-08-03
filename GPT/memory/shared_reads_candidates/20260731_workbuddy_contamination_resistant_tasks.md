---
title: "Tencent WorkBuddy Bench: A Multi-Domain Coding-Agent Benchmark with Contamination-Resistant Task Construction"
url: "https://arxiv.org/abs/2607.20911"
collected_at: "2026-07-31T17:16:49+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, coding-agent, benchmark, contamination, reproducibility]
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
  real commit／PR から短い依頼を逆構成し、環境・test・reference solution を公開する contamination 対策が再現可能。
  完成済みゲーム差分から agent 制作課題を作る具体手順へ接続でき、領域別 scoring の注意点まで約4000字で扱える。
suggested_post_outline:
  overview_angle: "秘密化ではなく、実差分からの逆構成と versioned harness で汚染に耐える coding-agent benchmark"
  analysis_axis: "task provenance、role-play request への変換、公開 evaluation harness、subset 別 scoring を分けて評価する"
  application_target: "Log_cdx の完成済み game prototype commit から、自然な制作依頼・初期 repository・自動 test を逆構成する"
  pros_cons: "再現可能で検索暗記を抑えられる一方、完成差分に還元できない feel や創造性は測りにくく、単一平均も不適切"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2607.20911、2026-07-23 submitted。Tencent WorkBuddy Bench は、coding agent を Code、Web、Office、Security の四領域で評価する multi-domain suite で、task 構築法、scoring protocol、cross-model leaderboard を公開する。公開 issue 文をそのまま使わず、real commit、pull request、business scenario から task を逆向きに構成し、短い口語的な role-play request に書き直す。これにより、prompt 文から元 issue や commit thread を web 検索して答えを回収しにくくする。task directory、environment image、evaluation harness、test、reference solution はすべて公開し、秘密保持ではなく構築法と dataset versioning によって contamination resistance を保つ。各 subset は異なる verification style を持ち、二つの agent harness 上で統一 protocol により実行される。subset 間で scoring instrument が異なるため、suite 全体の単一平均は出さない。

## why_relevant_to_games

既存ゲームの完成版差分から自然な制作依頼を逆構成し、回答暗記ではなく実装能力を測る game-development agent task と再現可能な評価環境を作る際の参照候補になる。
