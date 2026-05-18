# graze_log v05.2_cdx_v02 — devlog

## 0. 起点

`v05_1_cdx_v01/` は Nao_u 指示「BOMB の使い道が薄い」「BOMB 連続不可の仕組みが必要」に対して、BOMB を LV3 維持 + overdrive + cooldown へ変えた版。v01 の自己判定では ship 候補としつつ、次の検証穴として「overdrive 5-way が強すぎて、BOMB を温存したくなるか、溜まり次第撃つだけになるか」を残した。

v02 はこの穴だけを狙う小刻み調整。v01 は保持し、`v05_1_cdx_v02/` に比較可能な別案として置く。

## 1. 実装前判断

v01 の構造反転、つまり「BOMB は撃つと弱くなる支払いではなく、危険局面を攻勢に変える入力である」は維持する。一方、6秒 5-way と 8秒 cooldown では、強化時間が cooldown の大半を占める。プレイヤーの判断が「MAX になったら撃つ」に寄りすぎる危険がある。

したがって v02 では、BOMB の報酬を消すのではなく、報酬時間と待機時間を分ける。短い burst で押し返し、残り cooldown は通常 LV3 でしのぐ。これなら「今撃つか、次の密度まで待つか」が残る。

Active DEF についても、v01 の 9連は BOMB の重みを作るには効くが、初回体験を遅らせすぎる可能性がある。v05.1 の 5連へ戻すと問題が再発するため、8連・半径62・42Fの中間値にする。

## 2. 採用案

### BOMB burst

- BOMB 発火条件は gauge MAX + cooldown なし。
- 発火後、敵弾を全消去し、敵 HP を 2 減らす。
- gauge は `G_LV3` に戻し、LV3 火力を失わせない。
- 4秒間 `overdriveT` を付与し、5-way 連射 + shot cooldown 4F にする。
- 10秒間 `bombCooldownT` を付与し、MAX でも連発できない。
- cooldown 後半 6秒は通常 LV3 で戦う時間として残す。

### Active DEF midpoint

- graze 5連から 8連へ。
- 半径 80 から 62 へ。
- 無敵 60F から 42F へ。

## 3. 改変箇所

- `index.html` title と説明コメントを `v05.2_cdx_v02` に更新。
- `GRAZE_STREAK_TH / ACTIVE_DEF_FRAMES / ACTIVE_DEF_RADIUS` を `8 / 42 / 62` に変更。
- `BOMB_COOLDOWN_FRAMES / BOMB_OVERDRIVE_FRAMES` を `600 / 240` に変更。
- HUD/title の表示名を `BOMB burst / DEF midpoint` に変更。
- `tools/headless_graze_log_cdx_v05_2_v02_check.js` を追加し、v02 の契約を検証する。

## 4. 戻し手順

`v05_1_cdx_v02` を破棄すれば `v05_1_cdx_v01` と `v05_1_base` は無改変で残る。ファイル内で戻す場合は以下。

1. `GRAZE_STREAK_TH / ACTIVE_DEF_FRAMES / ACTIVE_DEF_RADIUS` を v01 相当の `9 / 36 / 58`、または v05.1 base 相当の `5 / 60 / 80` に戻す。
2. `BOMB_COOLDOWN_FRAMES / BOMB_OVERDRIVE_FRAMES` を v01 相当の `480 / 360` に戻す。v05.1 base へ戻す場合は BOMB_* 定数と state timer を削除する。
3. v05.1 base へ戻す場合は `bombReady()` と `spaceContext()` の cooldown 分岐、`shotCount()` / `shotCooldownF()` / `spawnPlayerBullets()` の overdrive 分岐、`fireBomb()` の LV3 維持と timer 付与を削除する。
4. HUD / title の `v05.2_cdx_v02`, cooldown, overdrive 表示を戻す。

## 5. Mental Sim

MAX 到達直後に BOMB を撃つと、画面を空けて敵 HP を削り、4秒だけ 5-way で押し返せる。ここまでは明確に得。だが cooldown は 10秒残るため、強化終了後の 6秒は通常 LV3 に戻る。この区間で次の弾密度をしのぐ必要があり、BOMB を「今すぐ撃つ」だけでなく「次の medium 発射密度まで待つ」選択が成立しやすい。

Active DEF は 8連なら、v01 の 9連より初回到達が少し早い。半径62/42Fなので v05.1 の広い自動救済ではなく、近距離で失敗をほどく小技に留まる。BOMB cooldown 中の補助として使えるが、それだけで全画面をリセットできない。

## 6. 自己判定

v02 は v01 より ship 候補に近い。v01 は BOMB の価値を作る点では強いが、overdrive が cooldown の大半を覆うため「撃ち得」に寄りやすい。v02 は BOMB の価値を LV3 維持 + 全消去 + HP削り + 4秒 burst に残し、6秒の通常 LV3 cooldown 区間で判断の余白を戻した。懸念は、cooldown 10秒が長く、MAX 後に撃てない表示がストレスになる可能性。この点は実プレイで、BOMB CD 表示が納得できる待ち時間かを見る。

## 7. 検証

`tools/headless_graze_log_cdx_v05_2_v02_check.js` で以下を確認した。

- BOMB 後に gauge が LV3 に残る。
- burst 中は 5-way / cooldown 4F になる。
- BOMB cooldown 中は二発目が出ない。
- BOMB burst 4秒、cooldown 10秒、通常 LV3 cooldown 区間 6秒の契約になっている。
- Active DEF は 7 streak では出ず、8 streak で出る。
- 30秒相当の update が例外なく進む。
