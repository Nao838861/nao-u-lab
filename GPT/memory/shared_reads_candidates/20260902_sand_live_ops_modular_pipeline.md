---
title: "How Hologryph built SAND: Raiders of Sophie for a sustainable live ops cadence"
url: "https://unity.com/blog/hologryph-sand-raiders-of-sophie"
collected_at: "2026-09-02T09:03:42+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, live-ops, architecture, procedural-generation, performance, multiplayer]
---

## raw_excerpt

Unity Blog に掲載された Hologryph CTO／game director への取材を基にした日本語採取メモ（逐語引用ではない）。『SAND: Raiders of Sophie』は、巨大歩行機械 Trampler を base・vault・weapon として組み立て、procedural open world を移動する extraction game である。長期運用の基礎として、authoritative server と client を厳密に分離し、双方で同一の world generation を実行し、1台あたり数百 entity の Trampler を同期する。Trampler は deck、cabin、equipment room などの compartment を組み合わせる構造で、新部品は model と設定だけで building system へ接続でき、新 mechanic の時だけ programmer が局所実装する。

simulation は改変版 Entitas ECS を使い、terrain generation、Trampler movement、custom occlusion culling を C# Job System と Burst の job chain に置いて main thread から外す。client と server は別 Unity project だが、asset を同一 pipeline で転送して data の不一致を構造的に防ぐ。Addressables で移動中の load／unload を管理し、長距離移動でも memory を平坦に保つ。性能は client／server の固定 scenario を自動測定して日次 trend を追う。VFX は weapon ごとに graph を作らず、size、color、timing、debris、smoke を露出した configurable system とし、artist の設定作業で variation を増やす。crew radio と spatial proximity voice は二系統に分け、後者は交渉、共闘、裏切りを生む gameplay feature として扱う。

## why_relevant_to_games

新コンテンツ追加のたびに code・network・VFX・memory を個別改修せず、modular data、共通 pipeline、固定性能試験へ寄せる設計事例として、継続更新型ゲームや大規模 prototype の制作基盤を考える材料になる。
