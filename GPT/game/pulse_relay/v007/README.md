# Pulse Relay v007

Pulse を敵弾処理ではなく、敵行動を書き換えるコマンドとして試した版。

最初のv007は、説明上は「敵を書き換える」と言えるものの、体感では v006 との差が弱かった。今回の修正では、v007の差分を人間が見て分かるように、書き換えられた敵そのものの振る舞いと見た目を大きく変えた。

- Pulse によって書き換えられた敵は黄色く表示される。
- 書き換え中の非ボス敵は通常の赤い敵弾発射を止める。
- 書き換え中の敵は黄色い味方弾を撃つ。
- 味方弾は敵を狙い、敵を倒せる。
- 書き換え時間を伸ばし、見て分かる時間を確保した。

v007 の狙いは「Pulse で敵を一時的に味方砲台へ変える」ことです。v005 の残留フィールド型、v006 の画面反転ショックウェーブ型と混同しない。

## 遊び方

`index.html` をブラウザで開く。方向キーまたは WASD で移動、Space で Pulse。敵弾の近くを通ると charge が増え、Pulse で敵弾変換と敵書き換えが発生する。書き換えられた敵は黄色くなり、赤い通常弾を止め、かわりに黄色い味方弾を撃つ。

## v007 の仮説

Pulse を「近い弾を変換するボタン」だけにすると、v006 では MAX Pulse 待ちが強くなった。v007 では画面内の敵に Pulse を当てる意味を作り、feeder / armored / escort / boss の次行動を変える。

修正後のv007では、次行動の変更だけでなく、敵の所属が一時的に反転したように見えることを重視する。Pulse を押した結果として「敵が黄色くなった」「赤弾を撃たなくなった」「黄色い味方弾で別の敵を倒した」が画面上で読める必要がある。

## 検証

実行場所: `game/pulse_relay/v007/`

```powershell
node verify.js
node timeline_eval.js
node enemy_behavior_audit.js
node wave_grammar_check.js
node enemy_overlap_check.js
```

結果は全て pass。

`node verify.js`:

- route 3 run すべて clear
- `converted: 120`
- `pulses: 13`
- `fieldConversions: 26`
- `resonantEnemies: 72`
- `chainHits: 27`
- `rewrittenEnemies: 23`
- `rewriteFuelShots: 114`
- `rewriteKills: 29`
- `rewriteBossPatternCount: 2`
- `alliedShots: 46`
- `alliedHits: 46`
- `alliedKills: 25`
- `pulseWhiffs: 0`

`node timeline_eval.js`:

- route clearRate: 1
- route meanRewrittenEnemies: 23
- route meanRewriteFuelShots: 114
- route meanRewriteKills: 29
- route meanRewriteBossPatternCount: 2
- route meanAlliedShots: 46
- route meanAlliedHits: 46
- route meanAlliedKills: 25
- noPulse / camper / lane-holder / blind-sweeper clearRate: 0

`node enemy_behavior_audit.js`:

- `offscreenShots: 0`
- `lingeringEnemies: 0`
- `maxEnemyStep: 12.52`
- `relayKills: 52`
- `pulseWhiffs: 0`

## 残課題

route は clear するが被弾が残る。次版でv007型を伸ばすなら、味方化した敵の射撃先、黄色弾の密度、boss-rush時の書き換え価値をさらに調整する。

## v005 / v006 / v007 の体感差

- v005: Pulse 後に短時間だけ場が残り、敵弾を拾い続ける。体感は「設置した残留フィールドで受ける」。
- v006: charge を溜めて MAX Pulse を撃つと、画面中の弾と敵へショックウェーブが走り、敵から敵へ枝分かれする。体感は「溜め技で画面全体を反転させる」。
- v007: Pulse を当てた敵が黄色い書き換え状態になり、通常の赤弾を止めて味方弾を撃つ。体感は「敵を一時的に味方砲台へ変える」。
