---
title: "'Millimeters matter:' Making the Steam Controller 'just work' on day one"
url: "https://www.gamedeveloper.com/pc/-millimeters-matter-inside-the-steam-controller-s-flawless-physical-design"
collected_at: "2026-08-14T09:46:28+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, controls, onboarding, playtesting, accessibility, hardware]
---

## raw_excerpt

Game Developer が Valve の Lawrence Yang と Jeremy Slocum に取材し、新しい Steam Controller を箱からゲーム開始までほぼ迷わず使える状態へ近づけた設計過程を扱う。初代 Steam Controller は mouse / keyboard 向けゲームを携帯操作へ移す新規性があった一方、通常の gamepad 前提タイトルでは扱いにくく、慣れていない利用者には学習曲線が高かった。新型では、人々が既に身につけた controller の操作慣習を基準に置き、開封、Steam Puck の接続、自動認識と firmware 更新という短い “time to game” を設計した。Puck は pairing、充電、PC 周辺の無線干渉という複数の摩擦を一つの接続経路で減らす。

物理形状では Steam Deck を基礎に、rear button を自然に中指・薬指が届く grip 曲面へ移し、D-pad はそれを常用する 2D action / fighting game の利用者を含む recruiting profile で検証した。外見上はほぼ同じ 3D print prototype でも数 mm の差を利用者が即座に区別し、好みが分かれたため、開発側は “millimeters matter” として手の大きさや能力差をまたぐ配置を探った。software 側では custom configuration を強みにしつつ、設定を触らない人にも既定 gamepad として成立させる。また controller と mouse / keyboard を同時利用する “mixed input” で、ゲーム側が入力方式を排他的に想定すると表示や操作が崩れる点も開発者向けの検査項目として挙げている。

## why_relevant_to_games

操作系の新規性を足す時、初回起動までの摩擦、既存の身体的慣習、対象プレイヤー別の微差テスト、混在入力時の UI / input state を同じ onboarding・playtest 課題として収集できる。
