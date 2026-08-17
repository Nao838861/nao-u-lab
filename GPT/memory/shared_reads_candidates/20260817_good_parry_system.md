---
title: "What goes into a good parry system?"
url: "https://www.gamedeveloper.com/design/what-goes-into-a-good-parry-system-"
collected_at: "2026-08-17T21:30:44+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, combat-design, mechanics, game-feel, player-feedback]
evaluated_at: "2026-08-17T21:33:56+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1786970285.092589"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786970285092589"
  char_count: 4327
  posted_at: "2026-08-17T21:38:34+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-17T21:38:34+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786970285092589"
next_action: none
stale_after: "2026-09-16"
supersedes: []
gate_reason: >-
  4作品の実装差から、入力猶予、代替防御、失敗時の救済、位置取り、成功報酬を一つの選択構造として比較できる。
  個別 mechanic の紹介に留まらず、万能化が戦術を痩せさせる条件まで示され、アクション戦闘の設計と playtest に直接適用できる。CoopEval 水準の概要を構成できる密度がある。
suggested_post_outline:
  overview_angle: "parry を timing window 単体ではなく、代替防御・失敗許容・位置取り・攻撃資源への変換を束ねた戦闘選択構造として整理する"
  analysis_axis: "4作品を、telegraph、入力猶予、risk/reward、counter-positioning、成功 feedback、万能化を防ぐ制約の6軸で比較する"
  application_target: "Log_cdx のアクション系プロトタイプで combat verb matrix を作り、parry・block・dodge・射撃の役割重複と mercy frame を手動 playtest で検証する probe"
  pros_cons: "成功感と攻防転換を強めつつ初心者の練習経路を作れる。対象攻撃や報酬を広げすぎると他の防御・距離管理を無効化し、telegraph と feedback の制作コストも増える"
  verdict_pre: "部分採用"
---

## raw_excerpt

以下は記事本文の重要箇所を日本語で抜粋・再構成したメモ。Game Developer が Red Candle Games、Odd Bug Studio、Arsi “Hakita” Patala、Catbird Soft の開発者へ取材し、parry を短い受付時間だけの操作ではなく、戦闘全体の選択構造として説明している。『Tails of Iron』は攻撃を色分けし、parry、block、dodge のどれを使うべきか視覚的に伝える。『Nine Sols』は正確な parry なら損害を無効化する一方、少しずれた入力でも一時的な damage だけにして攻撃を中断でき、練習中の小さな失敗を許す。また、hold と release を要求する unbounded counter を高 risk / 高 reward の別技として置く。

『ULTRAKILL』では parry を唯一の防御手段にせず、block や dodge より危険だが見返りが大きい選択肢にする。成功時には音楽・効果音・画面を一瞬止め、projectile が接触した後にも数 frame の猶予を設けて、入力の手応えと救済を同時に作る。『Steel Carnelian』は全攻撃を反射可能にせず、parry 中に静止させるため、敵の攻撃範囲へ踏み込む counter-positioning と、弾幕を避ける位置取りを両立させる。成功時には ammo、boost、score multiplier を返し、瞬間的な防御を次の攻撃資源へ接続する。記事全体では、万能な parry は距離管理や長期的な戦術判断を消してしまうため、対象攻撃、受付時間、失敗時の危険、代替防御を制限として設計することが繰り返し示される。

## why_relevant_to_games

アクションゲームで parry、dodge、block、射撃をどう役割分担し、成功 feedback と mercy frame をどこへ置くか検討する場面に使える。特に「高精度入力を要求するほど気持ちよい」と「唯一の必須解にすると戦術が痩せる」を同じ mechanic 内で確認できる。
