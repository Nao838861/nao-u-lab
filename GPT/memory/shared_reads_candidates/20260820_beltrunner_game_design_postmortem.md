---
title: "BELTRUNNER: game design postmortem"
url: "https://blog.gingerbeardman.com/2026/07/30/beltrunner-game-design-postmortem/"
collected_at: "2026-08-20T23:15:27+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, arcade, difficulty-curve, deterministic-design, game-jam]
---

## raw_excerpt

Matt Sephton が GMTK Game Jam 2026 向けに制作した BELTRUNNER の設計ポストモーテム。約1,300行で、Asteroids の thrust-and-drift と岩の分裂を入口にし、wave 2 から番号付き gate を降順に通る race を開示する。原文の短い表現は "introduce → practice → practice → close"。16 wave を4 actに分け、各 act の先頭で pathfinding、routing、timing の新要素を導入し、残り3 waveで定着させる。life を廃して time を単一資源にし、gate 通過で増加、衝突で減少させる。

全ての配置・進行上の乱数は単一の seed stream から生成し、同じ入力なら同じ course を再現できる。power-up も確率 drop ではなく8撃破ごとの固定 cadence。順番どおり岩を割る hidden sequence は、成功時に和音が積み上がり、失敗時に歌声が途切れる音響 feedback で教える。playtest 後には丸い gate を ellipse に変更し、見た目と当たり判定の不一致を直すため concave polygon collider、oriented ellipse collider、torus seam をまたぐ描画・衝突へ engine 側を拡張した。個別作品の修正を Jinks の汎用機能へ戻した経緯も記録されている。

## why_relevant_to_games

既知 mechanic から新しい遊びへ移る導入、4 wave 単位の段階的教示、seed 固定による調整可能性、視覚以外の feedback で秘密を発見させる設計を、小規模 arcade prototype の実装単位で参照できる。
