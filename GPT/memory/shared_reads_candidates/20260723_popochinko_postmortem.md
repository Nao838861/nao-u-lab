---
title: "POPOCHINKO postmortem"
url: "https://pavro-o.itch.io/popochinko/devlog/1541807/popochinko-postmortem"
collected_at: "2026-07-23T19:46:43+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, mechanics, postmortem, game-jam, arcade, scoring]
---

## raw_excerpt

本文要点の日本語メモ（長文の逐語引用ではなく、収集時の言い換え）。作者は Ice Climber jam の8時間で、上から弾を撃って野菜を取る single-screen の high-score game を制作した。自由移動できる自機では静止標的が簡単すぎるため標的を動かし、連射対策として弾数、時間制限、追跡敵、画面ごとの加速を順に検討した。ただし今回は feature 優先順位と明示的な試遊点を先に置き、開始約1時間で一周できる MVP を作った。試すと、発射時に自機が止まる摩擦だけで乱射が抑えられたため、弾数制は削除できた。

野菜を3個取る順序で、同種3個、時間追加、全野菜の敵化、高得点の秘密 combo が成立する。特に敵化 combo は、初見では危機を起こす驚きだが、理解後は魅力の薄い盤面を早く終える reroll のようにも使える。各画面の開始時に配置と候補を一度に読み、時間と追跡敵の圧力下で combo の計画を即座に立てるのが中心になる。野菜の上下関係によって取得順序にも制約が生まれる。全体速度が上がるにつれ、序盤の精密な得点・時間蓄積から、終盤の生存と画面突破へ優先順位が移る。作者は観戦から、落下中に次へ動く、敵の出現地点へ予防射撃する、画面遷移時の二重得点 bug を利用する、といった未計画の戦略も確認した。一方、得点更新を目標にしないプレイヤーには緊張が弱いという制約も記録している。

## why_relevant_to_games

短時間 prototype で、早い完全ループと明示的な試遊点から不要な制約を外し、combo・盤面可読性・速度上昇が生む計画と反応の切替を観察した一次資料。arcade / score attack の mechanic を組む場面で参照できる。
