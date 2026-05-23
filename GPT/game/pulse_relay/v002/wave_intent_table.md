# wave intent table

この表は、実装済み配置へ後から説明を貼るためではなく、実装前の仕様として使う。各 wave は player action、成功感、失敗圧、退場理由、悪い方針への警戒、telemetry を持つ。

| wave | time | enemies | player_intent | success_feel | failure_pressure | exit_reason | bad_policy_check | telemetry |
|---|---:|---|---|---|---|---|---|---|
| wake scouts | 0.7-6.8s | cyan scout, compressed rails | 中央射線に入り、短い scout 小隊を撃ち切って基本 rhythm を掴む | 早い入場から連続撃破できる | 撃ち漏らしの aimed 弾が次の横圧に残る | 下へ抜ける。撃ち漏らしの結果が見える | 開幕を安全な紹介だけにしない。0-3 秒に複数 target を置く | visibleTargets, shootableTargets, kills/sec |
| orange lances | 7.2-13.0s | left lance squad, right answer squad | 左から押されて横移動し、右からの返しで中央を取り返す | 横編隊を撃ち切り、左右の rhythm 差が出る | 横へ逃げた位置に返しの小隊が来る | 進行方向へ抜け、横圧の方向が見える | 同一小隊内で左右を雑に交互にしない。左右は時間で分ける | side min distance, shootable windows, bullet lane count |
| magenta cuts | 14.1-20.0s | diver + support scouts | 横圧で動いた先を diver が刺すため、撃つ対象を選ぶ | 鋭い入場を読んで短い show 中に倒す | diver を放置すると位置を崩される | 斜め外へ突き抜ける。攻撃後に漂わない | diver を大量に並べず、刺すタイミングを明確にする | nearBullets, route overlap, forced movement |
| carrier setup cross | 22.3-25.8s | right/left setup lances | carrier 前に横へ動かされ、次の carrier/arc の優先順位を準備する | carrier 前の空白がなく、位置取りがつながる | 動かされたまま carrier wave に入る | 右小隊、左小隊を時間で分けて掃ける | 左右切替を早くしすぎると中央で重なる | boring runs, minPairDistance |
| green relay carriers | 26.0-37.0s | green carrier + left/right arc + cuts | carrier の radial を pulse で消しつつ、sideArc と diver の優先順位を選ぶ | pulse 反撃を carrier に返し、横小隊も撃ち切る | pulse 不使用だと弾と横圧が残る | carrier は上へ離脱、arc は進行方向へ掃け、diver は突き抜ける | carrier を単独の弾撒きにしない。周辺小隊が優先順位を歪める | pulseCharge, pulseUses, enemyBullets, clear time |
| boss warning | 39.0-48.0s | pre-boss cuts + cross + scouts | 前半の横圧、diver、scout を短く復習し、boss 前の charge と位置を整える | 短い総合問題を抜けて boss に入る | 処理が遅れると boss 開始時に弾と位置が悪い | 各小隊は役割方向へ掃け、boss は 48 秒に入場 | boss 前を単なる準備時間にしない | visibleTargets, bullets at boss start |
| boss: vector core | 48.0-72.0s | boss 3 phase | 通常 shot を当て続け、危険な radial/aimed mix を pulse で切り返す | 12-18 秒程度の山場、phase 変化、撃破演出 | pulse を浪費すると避けが必要、火力不足なら長引く | boss は撃破で stage clear。時間切れでは逃走しない | 理論 TTK 3 秒以内を防ぐ。HP だけで作業化しない | bossHp/sec, idealTTK, pulseTTK, damage taken |

## 指標の目的

- `visibleTargets`: 退屈な秒を探す。0 が長いなら wave 間が空きすぎ。
- `shootableTargets`: 見えるが撃てないだけの秒を探す。長いなら route が悪い。
- `minPairDistance`: 不自然な重なりを探す。0 にすることが目的ではなく、編隊密度との両立を見る。
- `enemyBullets` と `nearBullets`: pulse が必要な圧になっているかを見る。多すぎる時は視認性を壊す。
- `pulseCharge` と `pulseUses`: pulse が空気でも万能でもないかを見る。
- `bossHp/sec`: boss が山場として残っているかを見る。bot の生存時間だけでは足りない。

## 未達なら何が起きるか

- `player_intent` が弱い wave は、敵を倒す理由が薄く、ただ出てくるだけになる。
- `exit_reason` が弱い route は、敵が突然意志を失ったように見える。
- `bad_policy_check` を見ないと、overlap 対策で隊列感を殺す、または pulse を強くしすぎる。
- telemetry がない wave は、自分の「良くなった気がする」を検証できない。
