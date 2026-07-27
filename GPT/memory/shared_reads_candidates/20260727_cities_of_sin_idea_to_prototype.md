---
title: "Cities of Sin 1st Devlog - From Idea to Prototype"
url: "https://itch.io/devlog/1603115/cities-of-sin-1st-devlog-from-idea-to-prototype"
collected_at: "2026-07-27T14:16:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, prototyping, city-builder, scope, indie-development, godot]
---

## raw_excerpt

本文要点の日本語メモ（原文の長文引用ではなく、収集時の言い換え）。GospHell Studios は、dark fantasy city builder『Cities of Sin: Goetic Vangelis』の最初の公開 prototype を、約1か月の個人制作として記録する。4X や RTS では敵国 AI、軍隊、pathfinding まで必要になるため、1か月で動く prototype を出す制約から city builder を選択。Python 経験と2D制作の意図から Godot を選び、絵は freehand より構造的に組み立てやすい pixel art とした。core mechanics を「建てる」と定義すると、building HUD、資源支払い、occupied tile 判定が連鎖して必要になった。isometric road は Godot の TileMapLayer の自動配置を code から期待通りに動かせず、接続方向ごとの sprite 選択を自作し、建物上への drag-build を防ぐため occupied tile を配列に記録した。population の map 表示や道路を使う service delivery は後回しにし、resource production、morale、storage、event choice を先に置いた。campaign は同じ map を育て、三回の選択で六つの Sin から組み合わせを作る構想。full game ではなく、core mechanics、placeholder art、GUI feel、general systems で意図が伝わる prototype を短期 scope としている。

## why_relevant_to_games

個人制作で genre、engine、art style、実装対象を「期限内に prototype を公開できるか」から逆算し、後回しにする system を明示した scope 設計例として参照できる。
