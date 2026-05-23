---
id: game_enemy_route_intent_lesson_20260523
type: lesson
status: active
created: 2026-05-23
tags:
  - game-design
  - shmup
  - enemy-formation
  - evaluation
source_task: pulse_relay_v001_enemy_motion_overlap_fix
---

# 敵ルートは「動きの形」ではなく「役割、速度、退場理由」まで持つ

2D シューティングの敵を直すとき、重なりを見つけてからランダムなオフセットを足してはいけない。shot_log がやっていた対処は、同じ軌道に雑なズレを入れることではなく、隊列ごとに「同じ rail を保つ」「spawn delay と終点の段差で重なりを避ける」「その敵が役割を終えた理由に沿って画面外へ掃ける」を同時に満たすことだった。

次回以降の敵ルート設計では、各 routine に少なくとも以下を明示する。

- 何のためにその軌跡を通るのか。例: 縦列は収穫列、横掃けは横移動を要求する横断圧、V 字は形を読ませる cue、dive は短いアクセント、大型は処理期限。
- どこで撃たせたいのか。targetY / targetX は「見た目の位置」ではなく、プレイヤーの射線と次 wave への移動を決める値として置く。
- どれくらいの速度で入るのか。entry は敵の役割によって smooth / linear / outCubic を分け、全敵が同じ拍で動かないようにする。
- なぜ画面外に掃けるのか。収穫列は撃ち逃した報酬として下へ流れる。横掃けは横断圧を作ったまま進行方向へ抜ける。dive は攻撃後に上へ逃げる。大型は処理期限後に撤退する。
- 掃ける速度は何を表すのか。突如「意志を失う」ような一律 snapOut ではなく、横掃けは等速で抜ける、dive は速く離脱する、大型は重く加速して撤退する、というように意味を分ける。
- 隊列の隣接間隔は敵半径から逆算する。同じ x / y に近い隊列は、半径合計より狭い終点差だけで「重なっていない」と判断しない。delay による path progress 差も見る。

Pulse Relay v001 での具体的な失敗:

- 縦列 targetY の差が小さく、敵半径に対して重なりやすかった。
- 横掃けで、左から来た敵が右に抜ける前に一度左へ戻るような区間があり、掃ける理由が破綻していた。
- 全ルートに似た outCubic / snapOut を掛けた結果、メリハリはあっても全敵が同じ拍で動くように見えた。
- 検証で route が落ちたとき、単に速度を詰めると shootable gap が増えてさらに崩れた。速度調整は「何を見せる時間か」を壊していないか、1 秒ごとの telemetry で確認する必要がある。

次回の再発防止:

- 実装前の wave table に `path keyframes / interpolation / speed / dwell / exit reason / player_intent / bad_policy_check / telemetry` を省略せず書く。
- shot_log など teacher 実装を見るときは、座標や duration だけでなく「なぜその敵はそこで退場するのか」を抽出する。
- 重なり修正はランダム offset ではなく、同じ rail のまま `target spacing`、`spawn delay`、`path progress`、`enemy radius` を合わせて直す。
- 検証は平均スコアだけで終えず、route / boss-rush / camper / lane-holder など複数 policy の差分と、1 秒ごとの visibleTargets / shootableTargets / enemyBullets / damage / bossHp を見て、修正が意図通りの緊張を作ったか確認する。
