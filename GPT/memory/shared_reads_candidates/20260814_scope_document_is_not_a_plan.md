---
title: "'A scope document is not your plan:' Laying the groundwork for indie success"
url: "https://www.gamedeveloper.com/production/-a-scope-document-is-not-your-plan-laying-the-groundwork-for-indie-success"
collected_at: "2026-08-14T12:16:42+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-production, indie-development, scope, milestones, playtesting, iteration]
evaluated_at: "2026-08-14T12:20:43+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-14T12:20:43+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-14T12:20:43+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-13"
supersedes: []
gate_reason: >-
  feature 一覧と実行計画の差を、milestone、短期 sprint、統合 build、team playtest、再見積りの閉ループとして具体化できる。
  Waterfall で依存物が止まり断片だけが増える失敗像、budget・early access への接続もあり、ゲーム制作への適用と約4000字の独立分析に十分な材料がある。
suggested_post_outline:
  overview_angle: scope document を「何を作るか」の境界、plan を「いつ統合 build で遊び、何を再判断するか」の検証系として分けて説明する
  analysis_axis: task 消化率ではなく playable milestone と team playtest が進捗・見積り・依存関係を同時に検査する点を、Waterfall の production hell と対比する
  application_target: Log_cdx の小規模ゲーム制作 cycle で、各反復の done condition を機能実装から統合 build の試遊証拠へ接続し、次 sprint と予算見積りを更新する箇所
  pros_cons: 統合不能と後半の楽しさ判定遅延を減らせる一方、短い sprint の運用コスト、未知タスクの見積り誤差、専門職依存そのものは消えない
  verdict_pre: 部分採用
---

## raw_excerpt

Game Developer が、Blossom Arcade の Sophie Smart による London Games Festival の Self-Publishing Toolkit 講演を採録した記事。小規模チームが feature 一覧を作り、完了項目へチェックを付けているだけでは、それは scope document であって実行可能な plan ではない、と区別する。計画には feature を task と見積りへ分解することに加え、一定間隔でゲームの一部分を完成させる milestone と goal が必要で、それによって開発月数、必要な team 稼働期間、budget を見積もれるようになる。

実行方法の例として Scrum を挙げ、1〜4週間程度の sprint で一つの主要な project element を選び、task 化、daily communication、期間末の team playtest までを一単位にする。完成判定は task の消化ではなく、実際にその feature を使って遊び、満足できるか、追加作業が必要かを確認することになる。この反復は communication と iteration を保ち、early access を検討する場合にも playable product を継続して持つ助けになる。一方、discipline ごとに工程を直列化する Waterfall は、病欠などで依存物が止まると各担当が別部分へ散り、異なる完成度の断片だけが増えて統合された build を遊べなくなる危険がある。記事はこの状態を、楽しさを検証できない production hell として説明している。

## why_relevant_to_games

小規模ゲーム制作で、機能一覧の消化と playable milestone を分け、各反復を「統合 build を実際に遊べる」状態へ接続する production 設計を検討する際の外部事例になる。
