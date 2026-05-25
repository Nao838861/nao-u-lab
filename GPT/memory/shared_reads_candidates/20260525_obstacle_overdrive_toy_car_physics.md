---
title: "Obstacle Overdrive: How an Indie Studio Created a Toy Car Adventure Game"
url: https://80.lv/articles/obstacle-overdrive-how-an-indie-studio-created-a-toy-car-adventure-game
collected_at: 2026-05-25T13:53:30+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, physics, vehicle-game, prototyping, tactile-design, indie-dev]
---

## raw_excerpt
80 Level 2026-04-13 の Obstacle Overdrive 開発インタビュー。Arcane Ermine は RC car hobby の感触を toy-scale world に移し、traditional racing game ではなく cozy、slow、careful driving experience を目標にした。プレイヤーは加速を押しっぱなしにするのではなく、障害物へ patience を持って近づく。チームには RC hobbyist がいて、実際の Axial Gladiator RC crawler をオフィスに置き、障害物に乗り上げる挙動とゲーム内挙動を比較した。Unreal Engine の built-in vehicle physics は real-world cars と gravity 向けで toy-scale RC crawler には合わず、plugin も悪化したため、物理と scaling を土台にしつつ heavy customization した。thrift-store toys や日用品で小さな track を作り、素材ごとの grip/slippery を観察し、ゲーム内 surface behavior に反映した。実物 track を GDC や Reno Comic Con に持ち込み、初見プレイヤーが最初は racing game のように扱うが、ゲーム内ではすぐ gentle acceleration に馴染むことも見ている。suspension rig は見た目だけでなく terrain collision に応じて axle tip、spring compression、control arms が反応する。

## why_relevant_to_games
物理操作ゲームで「速さ」ではなく「慎重さ」を中核快感にする例。実物プロトタイプ、素材実験、初見プレイヤーの誤った genre expectation 観察を、手触り調整や tutorial 設計の材料にできる。
