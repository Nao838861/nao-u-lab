# wave intent table

この表は、実装済み配置へ後から説明を貼るためではなく、実装前の仕様として使う。各 wave は player action、成功感、失敗圧、退場理由、悪い方針への警戒、telemetry を持つ。

| wave | time | enemies | player_intent | success_feel | failure_pressure | exit_reason | bad_policy_check | telemetry |
|---|---:|---|---|---|---|---|---|---|
| wake scouts | 0.8-8.8s | cyan scout, two vertical rails | 入場位置を読んで縦 rail に通常ショットを置き、短い show 時間で撃ち切る | 連続撃破、charge 少量獲得、下へ抜ける前に処理できる | 撃ち漏らすと下へ抜けて aimed 弾が残る | 撃ち切れなかった scout はそのまま下へ抜け、失敗が見える | overlap 0 だけで間隔を広げすぎない。13-16F の gap を見る | visibleTargets, shootableTargets, minPairDistance, kills/sec |
| orange lances | 8.2-18.5s | orange side lance | 横から来る敵を中央射線に乗った瞬間に撃ち、遅い aimed 弾を横移動で避ける | 横編隊をテンポよく倒し、画面中央を取り返す | 横圧で位置を動かされ、scout 残弾と混ざる | 進行方向へ抜ける。横圧を作った敵が横へ帰る | 直角 offset でずらさない。同一 rail の spawn delay と entry speed で被りを処理 | side min distance, shootable windows, bullet lane count |
| magenta cuts | 18.5-30.0s | magenta diver + small scout | 斜め入場を見て、短い照準時間の前後に撃つ対象を選ぶ | 速い敵を読み切り、通常 wave の rhythm が切り替わる | 放置すると aimed 弾と移動圧で中央から追い出される | 攻撃後に斜め外へ離脱する。突入した敵が突き抜ける | 全員同じ easing にしない。diver は entry が鋭く、show は短い | nearBullets, player forced movement, route overlap |
| green relay carriers | 30.0-44.8s | green carrier + orange arc lance | carrier の slow radial を pulse で消し、反撃 shard を carrier に返す | 危険を攻撃へ変える、pulse が機能する | pulse 不使用だと弾が残り続け、side arc と混ざって圧になる | carrier は弾を撒いた後に上へ離脱、arc lance は進行方向へ掃ける | carrier を硬すぎて作業にしない。pulse なしでも詰ませない | pulseCharge, pulseUses, enemyBullets, clear time |
| boss warning | 45.0-48.0s | small scouts, warning banner | boss 前に画面を整え、charge を少し回収する | 山場前の短い準備 | scout を残すと boss 開始時に邪魔になる | scout は下へ抜ける | warning が長すぎてテンポを落とさない | visibleTargets, bullets at boss start |
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
