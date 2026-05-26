---
title: "Project Postmortem - Bullet Hell Zero"
url: "https://itch.io/devlog/1516415/project-postmortem.amp"
collected_at: "2026-05-27T02:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [postmortem, bullet-hell, tooling, pattern-editor, prototype-scope]
---

## raw_excerpt
itch.io の Bullet Hell Zero ポストモーテム。HTML5 の小規模 bullet hell で、波状に出る敵と弾幕を避け、automatic fire / semi-automatic fire / scattershot / bomb などを持つ構成。うまくいった点として、 projectile type を prefab と設定変更で増やせる modularity、stage data 側では text で bullet pattern を足せる編集性、bulletSpawner のような script を player/boss 間で再利用できる柔軟性、性能を意識した初期設計が挙げられている。text pattern の階層は、角度を指定して弾を spawn する最小単位から、circle / arc などの simple pattern、bullet count / delay / angle を持つ pulse/step、複数 step を束ねる attack/fire pattern へ積む形。

失敗側は、将来の柔軟性を狙って「完璧な」設計を長く考えすぎたこと、既存コードを頻繁に rework して現在使える時間を削ったこと、同時進行の別プロジェクトもあり schedule が崩れたこと。小さな弾幕ゲームで、将来拡張のための抽象化と、今 playable にするための実装時間が衝突した記録として使える。

## why_relevant_to_games
Pulse Relay / graze_log 系の弾幕生成を「パターン編集データ」と「playable scope」に分ける時の材料。敵弾不足・中盤以降の密度不足を直す時、弾数を直接増やす前に pattern authoring の単位を作る発想につながる。
