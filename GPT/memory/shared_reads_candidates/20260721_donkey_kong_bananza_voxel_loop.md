---
title: "How voxels enabled a juicy gameplay loop in Donkey Kong Bananza"
url: "https://www.gamedeveloper.com/design/how-voxels-enabled-a-juicy-gameplay-loop-in-donkey-kong-bananza"
collected_at: "2026-07-21T04:32:43.2861660+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, action, level-design, game-feel, voxel]
---

## raw_excerpt

Game Developer が Nintendo の Kenta Motokura と Tatsuya Kurihara による GDC 2026 解説をまとめた事例。『Donkey Kong Bananza』では、最大347,070,464 voxel の破壊可能地形を見せ物で終わらせず、戦闘と探索の境界をつなぐ。player は地形から岩を掴むことで一時的な powered-up state に入り、それを敵へ投げる。攻撃と吹き飛ばしで壁や床が削れ、撃破された敵が壁を破ると、その先の宝・敵・隠し空間が露出する。発見した場所から次の岩を取り、再び戦闘へ戻る循環を team は "chain of destruction" と呼ぶ。collision は voxel 同士の厳密判定ではなく、moving object に primitive shape を持たせるため、物体が壁へ食い込む場合がある。team は、その不自然さが player の行動機会や楽しさを増やす側なら許容し、損失や選択肢の減少を生む側なら修正する基準を置いた。

## why_relevant_to_games

新技術を描画品質ではなく、戦闘→地形変化→発見→次の戦闘という playable loop に変換する設計資料になる。物理的な厳密さと操作機会が衝突した時の判定軸も、action prototype の game-feel 調整に使える。
