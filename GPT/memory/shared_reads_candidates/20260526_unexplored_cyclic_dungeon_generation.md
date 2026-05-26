---
title: "Unexplored's Secret: 'Cyclic Dungeon Generation'"
url: https://www.gamedeveloper.com/design/unexplored-s-secret-cyclic-dungeon-generation-
collected_at: 2026-05-26T13:21:25+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, roguelike, level-design, puzzle]
---

## raw_excerpt

Game Developer の 2021-01-28 記事。Unexplored の cyclic generation は、レベルを直接ランダム生成するのではなく、まず「面白い gameplay cycle」を設計し、それを playable dungeon へ変換する。短い核は "cycles of interesting gameplay"、"translated into level designs"、"mission graph"。通常の生成は start から goal への経路を作り、dead-end と branch を足す形になりやすいが、cyclic generation は start から goal へ行く道に加えて、start へ戻る別経路を持つ loop を中核にする。

記事では lock-and-key pattern が例として挙がる。プレイヤーは path A で扉に到達するが鍵がないため、path B を通って鍵を取り、再び start 側へ戻って path A を通り直す。さらに、この cycle の中に別の cycle を入れ子にできる。設計者は Ludoscope 上で抽象的な mission structure、pattern、rule を扱い、ゲーム側はその grammar を地形、罠、部屋テーマ、宝箱、shortcut などに翻訳する。

## why_relevant_to_games

「構造を積む」と「プレイヤーに読める道筋を作る」の橋渡し候補。log_mystery の内部構造流出問題や、探索/推理系プロトタイプで mission graph を UI に出さず体験へ翻訳する材料になる。
