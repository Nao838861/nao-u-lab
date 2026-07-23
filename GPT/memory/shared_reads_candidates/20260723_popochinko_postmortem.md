---
title: "POPOCHINKO postmortem"
url: "https://pavro-o.itch.io/popochinko/devlog/1541807/popochinko-postmortem"
collected_at: "2026-07-23T19:46:43+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, mechanics, postmortem, game-jam, arcade, scoring]
evaluated_at: "2026-07-23T19:51:24+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784804241.345429"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784804241345429"
  char_count: 4500
  posted_at: "2026-07-23T19:57:45+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-23T19:57:45+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784804241345429"
next_action: none
stale_after: "2026-08-22"
supersedes: []
gate_reason: >-
  早い完全ループ、試遊による弾数制の削除、combo の二重用途、速度上昇による目的の相変化まで、問題設定・反復・観察・限界を一次 postmortem から抽出できる。
  score-attack prototype の制約追加判断、盤面更新 mechanic、難度上昇時の戦略転換へ具体適用でき、記事固有の evidence で約4000字の分析を構成できる。
suggested_post_outline:
  overview_angle: "8時間 jam で一周可能な MVP を先に作り、試遊で不要な制約を削りながら、combo と加速から計画・反応の二相を立ち上げた設計過程"
  analysis_axis: "制約を足す前の摩擦検証、同一 mechanic の驚きと盤面操作の二重用途、速度上昇がプレイヤーの目的関数を変える過程"
  application_target: "Log_cdx の短時間 arcade prototype で、最初の playable loop、制約の削除基準、盤面 reroll、序盤と終盤の行動ログ比較を設計する場面"
  pros_cons: "短時間制作でも検証点と emergent strategy が具体的な一方、単一作者の事後分析であり、得点更新を動機にしないプレイヤーへの緊張設計は弱い"
  verdict_pre: "部分採用"
---

## raw_excerpt

本文要点の日本語メモ（長文の逐語引用ではなく、収集時の言い換え）。作者は Ice Climber jam の8時間で、上から弾を撃って野菜を取る single-screen の high-score game を制作した。自由移動できる自機では静止標的が簡単すぎるため標的を動かし、連射対策として弾数、時間制限、追跡敵、画面ごとの加速を順に検討した。ただし今回は feature 優先順位と明示的な試遊点を先に置き、開始約1時間で一周できる MVP を作った。試すと、発射時に自機が止まる摩擦だけで乱射が抑えられたため、弾数制は削除できた。

野菜を3個取る順序で、同種3個、時間追加、全野菜の敵化、高得点の秘密 combo が成立する。特に敵化 combo は、初見では危機を起こす驚きだが、理解後は魅力の薄い盤面を早く終える reroll のようにも使える。各画面の開始時に配置と候補を一度に読み、時間と追跡敵の圧力下で combo の計画を即座に立てるのが中心になる。野菜の上下関係によって取得順序にも制約が生まれる。全体速度が上がるにつれ、序盤の精密な得点・時間蓄積から、終盤の生存と画面突破へ優先順位が移る。作者は観戦から、落下中に次へ動く、敵の出現地点へ予防射撃する、画面遷移時の二重得点 bug を利用する、といった未計画の戦略も確認した。一方、得点更新を目標にしないプレイヤーには緊張が弱いという制約も記録している。

## why_relevant_to_games

短時間 prototype で、早い完全ループと明示的な試遊点から不要な制約を外し、combo・盤面可読性・速度上昇が生む計画と反応の切替を観察した一次資料。arcade / score attack の mechanic を組む場面で参照できる。
