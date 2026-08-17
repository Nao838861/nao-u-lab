---
title: "What goes into a good parry system?"
url: "https://www.gamedeveloper.com/design/what-goes-into-a-good-parry-system-"
collected_at: "2026-08-17T21:30:44+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, combat-design, mechanics, game-feel, player-feedback]
---

## raw_excerpt

以下は記事本文の重要箇所を日本語で抜粋・再構成したメモ。Game Developer が Red Candle Games、Odd Bug Studio、Arsi “Hakita” Patala、Catbird Soft の開発者へ取材し、parry を短い受付時間だけの操作ではなく、戦闘全体の選択構造として説明している。『Tails of Iron』は攻撃を色分けし、parry、block、dodge のどれを使うべきか視覚的に伝える。『Nine Sols』は正確な parry なら損害を無効化する一方、少しずれた入力でも一時的な damage だけにして攻撃を中断でき、練習中の小さな失敗を許す。また、hold と release を要求する unbounded counter を高 risk / 高 reward の別技として置く。

『ULTRAKILL』では parry を唯一の防御手段にせず、block や dodge より危険だが見返りが大きい選択肢にする。成功時には音楽・効果音・画面を一瞬止め、projectile が接触した後にも数 frame の猶予を設けて、入力の手応えと救済を同時に作る。『Steel Carnelian』は全攻撃を反射可能にせず、parry 中に静止させるため、敵の攻撃範囲へ踏み込む counter-positioning と、弾幕を避ける位置取りを両立させる。成功時には ammo、boost、score multiplier を返し、瞬間的な防御を次の攻撃資源へ接続する。記事全体では、万能な parry は距離管理や長期的な戦術判断を消してしまうため、対象攻撃、受付時間、失敗時の危険、代替防御を制限として設計することが繰り返し示される。

## why_relevant_to_games

アクションゲームで parry、dodge、block、射撃をどう役割分担し、成功 feedback と mercy frame をどこへ置くか検討する場面に使える。特に「高精度入力を要求するほど気持ちよい」と「唯一の必須解にすると戦術が痩せる」を同じ mechanic 内で確認できる。
