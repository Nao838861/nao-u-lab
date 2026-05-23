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

# 敵ルートは「動きの形」ではなく「役割・速度・退場理由」まで持つ

2D シューティングの敵配置を直す時、重なりを見つけてからランダムなオフセットや個体ごとのテンポ差を足してはいけない。shot_log がやっていた対処は、同じ隊列に雑なズレを入れることではなく、隊列ごとに「同じ rail を保つ」「spawn delay と path progress の差で重なりを避ける」「その敵が役割を終えた理由に沿って画面外へ掃ける」を同時に満たすことだった。

次回以降の敵ルート設計では、各 routine に少なくとも以下を明示する。

- 何のためにその軌跡を通るのか。例: 縦列は収穫列、横掃けは横移動を要求する横断圧、V 字は形を読ませる cue、dive は短いアクセント、大型は処理期限。
- どこで撃たせたいのか。targetY / targetX は見た目の位置ではなく、プレイヤーの射線と次 wave への移動を決める値として置く。
- どの速度で入るのか。entry は敵の役割によって smooth / linear / outCubic を分け、全敵が同じ拍で動かないようにする。ただし、同一隊列の中で意味なくテンポをバラして形を壊さない。
- なぜ画面外に掃けるのか。縦列は撃ち逃した報酬として下へ流れる。横掃けは横断圧を作ったまま進行方向へ抜ける。dive は攻撃後に上へ逃げる。大型は処理期限後に撤退する。
- 掃ける速度は何を表すのか。突然「意志を失った」ような一律退場にしない。横掃けは等速で抜ける、dive は速く離脱する、大型は重く加速して撤退する、など意味を分ける。
- 隊列の隣接間隔は敵半径から逆算する。同じ x / y に近い隊列は、見た目だけの座標差ではなく spawn delay による path progress 差も含めて「重なっていない」と判断する。

Pulse Relay v001 での具体的な失敗:

- 重なり回避のために routeBeat と targetY / dy の大きな個体差を入れ、隊列が不格好に崩れた。
- 横掃けで、左から来た敵が右に抜ける前に不自然な中間点へ戻るような区間を作り、掃ける理由が破綻した。
- 全ルートに似たような outCubic / snapOut を足し、メリハリは出ても全敵が同じリズムに見えた。
- 検証で route が落ちた時、速度や軌跡を雑に詰めると shootable gap や見た目の崩れが増えた。調整は「何を見せる時間か」を壊していないか、秒ごとの telemetry で確認する必要がある。

次回の再発防止:

- 実装前の wave table に `path keyframes / interpolation / speed / dwell / exit reason / player_intent / bad_policy_check / telemetry` を省略せず書く。
- shot_log など teacher 実装を見る時は、座標や duration だけでなく「なぜその敵はそこで退場するのか」を抽出する。
- 重なり修正はランダム offset や隊列内 phase 差ではなく、同じ rail のまま `target spacing`、`spawn delay`、`path progress`、`enemy radius` を合わせて直す。
- 評価は平均スコアだけで終えない。route / boss-rush / camper / lane-holder など複数 policy の差分と、秒ごとの visibleTargets / shootableTargets / enemyBullets / damage / bossHp を見て、修正が意図通りの緊張を作ったか確認する。
