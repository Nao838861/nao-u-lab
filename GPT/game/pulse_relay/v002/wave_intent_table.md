# wave intent table

この表は、実装済み配置へ後から説明を貼るためではなく、実装前の仕様として使う。各 wave は player action、成功感、失敗圧、退場理由、悪い方針への警戒、telemetry を持つ。

| wave | time | enemies | player_intent | success_feel | failure_pressure | exit_reason | bad_policy_check | telemetry |
|---|---:|---|---|---|---|---|---|---|
| wake scouts | 0.7-6.8s | cyan scout, compressed rails | 中央射線に入り、短い scout 小隊を撃ち切って基本 rhythm を掴む | 早い入場から連続撃破できる | 撃ち漏らしの aimed 弾が次の横圧に残る | 下へ抜ける。撃ち漏らしの結果が見える | 開幕を安全な紹介だけにしない。0-3 秒に複数 target を置く | visibleTargets, shootableTargets, kills/sec |
| orange lances | 7.2-13.0s | left lance squad, right answer squad | 左から押されて横移動し、右からの返しで中央を取り返す | 横編隊を撃ち切り、左右の rhythm 差が出る | 横へ逃げた位置に返しの小隊が来る | 進行方向へ抜け、横圧の方向が見える | 同一小隊内で左右を雑に交互にしない。左右は時間で分ける | side min distance, shootable windows, bullet lane count |
| magenta cuts | 15.1-21.0s | diver + support scouts | 横圧で動いた先を diver が刺すため、撃つ対象を選ぶ | 鋭い入場を読んで短い show 中に倒す | diver を放置すると位置を崩される | 斜め外へ突き抜ける。攻撃後に漂わない | diver を大量に並べず、刺すタイミングを明確にする | nearBullets, route overlap, route speed, forced movement |
| carrier setup bridge/cross | 21.1-26.0s | bridge scouts + right/left setup lances | carrier 前に中央照準を維持しつつ横へ動かされ、次の carrier/arc の優先順位を準備する | carrier 前の空白がなく、位置取りがつながる | 動かされたまま carrier wave に入る | scout は下へ、右小隊/左小隊は時間で分けて掃ける | 左右切替を早くしすぎると中央で重なる。bridge が散った lane 列に見えないか見る | boring runs, minPairDistance, route speed |
| green relay carriers | 27.0-39.0s | green carrier + left/right arc + cuts | carrier の radial を pulse で消しつつ、sideArc と diver の優先順位を選ぶ | pulse 反撃を carrier に返し、横小隊も撃ち切る | pulse 不使用だと弾と横圧が残る | carrier は上へ離脱、arc は進行方向へ掃け、diver は突き抜ける | carrier を単独の弾撒きにしない。周辺小隊が優先順位を歪める | pulseCharge, pulseUses, enemyBullets, clear time, route speed |
| boss warning | 40.0-48.0s | pre-boss cuts + cross + scouts | 前半の横圧、diver、scout を短く復習し、boss 前の charge と位置を整える | 短い総合問題を抜けて boss に入る | 処理が遅れると boss 開始時に弾と位置が悪い | 各小隊は役割方向へ掃け、boss は 48 秒に入場 | boss 前を単なる準備時間にしない | visibleTargets, bullets at boss start, route speed |
| boss: vector core | 48.0-72.0s | boss 3 phase | 通常 shot を当て続け、危険な radial/aimed mix を pulse で切り返す | 12-18 秒程度の山場、phase 変化、撃破演出 | pulse を浪費すると避けが必要、火力不足なら長引く | boss は撃破で stage clear。時間切れでは逃走しない | 理論 TTK 3 秒以内を防ぐ。HP だけで作業化しない | bossHp/sec, idealTTK, pulseTTK, damage taken |

## 指標の目的

- `visibleTargets`: 退屈な秒を探す。0 が長いなら wave 間が空きすぎ。
- `shootableTargets`: 見えるが撃てないだけの秒を探す。長いなら route が悪い。
- `minPairDistance`: 不自然な重なりを探す。0 にすることが目的ではなく、編隊密度との両立を見る。
- `route_motion_check`: 出入りの速度帯を探す。平均速度ではなく phase ごとの max speed を見る。
- `enemyBullets` と `nearBullets`: pulse が必要な圧になっているかを見る。多すぎる時は視認性を壊す。
- `pulseCharge` と `pulseUses`: pulse が空気でも万能でもないかを見る。
- `bossHp/sec`: boss が山場として残っているかを見る。bot の生存時間だけでは足りない。

## 未達なら何が起きるか

- `player_intent` が弱い wave は、敵を倒す理由が薄く、ただ出てくるだけになる。
- `exit_reason` が弱い route は、敵が突然意志を失ったように見える。
- `bad_policy_check` を見ないと、overlap 対策で隊列感を殺す、または pulse を強くしすぎる。
- telemetry がない wave は、自分の「良くなった気がする」を検証できない。
## 2026-05-23 更新後の実装上の読み替え

- `wake scouts`: 0.6-6.8 秒。10 体 + 8 体の scout rail。最初に撃破 rhythm と横移動の幅を見せる。
- `orange lances`: 7.1-18.4 秒。左から 7 体、右から 7 体、上側 bait scout を左右で分離。横圧に対して、中央へ戻るか端を維持するかを試す。
- `magenta cuts`: 18.0-28.9 秒。diver は 6 体を交互 side で出し、support scout は端レーンで別軌跡にする。短い show を狙う優先目標練習。
- `carrier setup bridge/cross`: 28.2-37.9 秒。bridge scout で中央照準を戻し、左右 cross lance で carrier 前の横圧を作る。
- `green relay carriers`: 36.0-51.7 秒。carrier 3 体、left arc 8 体、right answer arc 8 体。pulse 判断と横圧の処理を同時に要求する主山場。
- `pre-boss cuts`: 49.0-58.2 秒。carrier 後の残弾から、diver と lance/scout のボス前圧へ移る。
- `boss warning`: 56.2-62.0 秒。ボス入場直前から直後まで overlap せずに残る warning 編隊。ボス開始時点で visibleTargets 11 / shootableTargets 10。
- `boss`: 60.0 秒開始。HP 1950。verify で 18.22-22.67 秒の boss duration に収まる。

この表は、次回調整時に「敵数を減らして楽にする」のではなく、各 wave の意図を保ったまま lane / spawn gap / route phase を調整するための基準にする。
## 2026-05-23 auto-shot / density pass 後の読み替え

- `orange cleanup pickup`: 12.1-15.7 秒。左の orange escort が掃けた後、右の answer が shootable になるまでの空白を埋める。目的は敵数稼ぎではなく、左から右への切り返し前に中央へ戻る撃破対象を置くこと。
- `magenta recovery pickup`: 19.3-23.0 秒。diver の短い show を追った後、中央へ戻って小型を拾う時間を作る。diver と同じ出口を踏まないよう、lane は中央寄りで重なり検査済み。
- `second phrase left/right anchor`: 28.7 秒と 32.2 秒。二回目の縦横反復をそのまま繰り返さず、中型 carrier を撃たせる。周辺の `carrier setup bridge/cross/harvest connector` は、アンカーを撃つか小型を先に処理するかを分岐させる。
- `carrier priority lead-in`: 47.1-51.9 秒。次の diver cut と同じ中央レーンを使わず、左端の前座として置く。前座が切り込み役の着地点を踏まないことを `enemy_overlap_check` で確認する。

この pass の telemetry 合格値:

- `enemy_overlap_check`: pairOverlaps 0 / minGap 0.58。
- `timeline_eval`: meanMidgameShootable 4.71 / boringRuns none / lowShootableRuns none / visible-but-not-shootable runs none。
- 過去作比較: shot_log v01 の midgame shootable 16.31 は高密度基準、graze_log_cdx v57 の meanMidgameShootable 5.27 はゲーム相応基準。Pulse Relay v002 は 4.71 で、完全な shot_log 密度ではないが、以前の 3.60-4.24 から回復した。
