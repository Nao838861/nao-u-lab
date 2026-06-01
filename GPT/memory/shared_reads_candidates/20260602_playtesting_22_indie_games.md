---
title: "What I've learned from playtesting 22+ indie games"
url: "https://www.reddit.com/r/gamedev/comments/1s6x2m7/what_ive_learned_from_playtesting_22_indie_games/"
collected_at: "2026-06-02T07:59:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, onboarding, indie-dev, usability]
evaluated_at: "2026-06-02T08:04:32+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780355394.047129"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780355394047129"
  char_count: 3836
  posted_at: "2026-06-02T08:10:06+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-02T08:10:06+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780355394047129"
next_action: none
stale_after: "2026-07-02"
supersedes: []
gate_reason: |-
  22本以上の外部playtestから、tutorial、demo scope、punishment、menu、bug放置、入力表示といった反復失敗を抽出しており、単発感想ではなく横断パターンとして読める。
  小規模 playable diff の公開前チェック、初見理解、罰則導入、demo範囲決定へ直接接続でき、CoopEval水準の概要で問題設定・中核・適用・判定を組める。
suggested_post_outline:
  overview_angle: "外部playtesterが複数indie demoで見た、初見プレイヤーを壊す失敗パターンの横断整理として書く。"
  analysis_axis: "polished short demo、earned punishment、show don't tell、public demoは広告でありonboardingが必要、という4軸で分析する。"
  application_target: "Nao_u_BOTの小規模playable diff公開前に、tutorial、入力表示、罰則、content scope、known bugを検査するゲートへ落とす。"
  pros_cons: "メリットは具体的チェックリスト化しやすいこと。デメリットはReddit投稿由来で体系的実験ではなく、ジャンル別重み付けは別途必要なこと。"
  verdict_pre: "部分採用。公開前レビューとheadlessでは見えない初見理解チェックに採用する。"
---

## raw_excerpt

Reddit r/gamedev の外部 playtester 投稿。投稿者は複数の indie game をテストして、別ジャンルでも繰り返し出る問題として、静的メニュー、入力方式に合わない tutorial、壊れた demo level、タイトル不明の main menu、既知 major bug の放置、content 量の過不足、earned でない punishment、紙上では面白いが遊ぶと退屈な mechanic、tutorial 不足、長文 tutorial を挙げている。

短い原文抜粋:

> "A shorter polished demo beats a longer broken one every time."

> "Punishing mechanics need to be earned"

> "show don't tell where possible"

コメント欄では、official demo は playtest ではなく広告であり、public demo には onboarding が必要という補足がある。別コメントでは、creative concept と good concept は同じではなく、初見プレイヤーが前進方法を見失う時点で設計上の赤信号だという読みが出ている。

## why_relevant_to_games

Nao_u_BOT の小規模 playable diff で、完成度を「機能がある」ではなく「初見が壊れず触れる」に寄せる観点になる。特に tutorial、入力表示、punishment、demo scope のチェックリストに使える。
