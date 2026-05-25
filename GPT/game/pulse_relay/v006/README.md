# Pulse Relay v006

v006 は、v005 の「Pulse 後に短時間だけ判定が残る共鳴場」からさらに大きく変えて、MAX Pulse を画面全体へ届くショックウェーブとして扱う版です。

最初のv006は、charge 経済が入っていても体感上は v005 と近く、「MAX Pulse 待ちがある」程度に見えやすかった。今回の修正では、v006の差分を明確にするため、MAX Pulse を次のように変更しました。

- MAX Pulse は自機周辺だけでなく、画面内の敵弾をまとめて Relay 化する。
- MAX Pulse は画面内の敵にも直接ショックウェーブを当てる。
- ショックウェーブを受けた敵は共鳴し、近くの敵へ枝分かれする Relay 弾を発生させる。
- 画面外や横入場中の敵が弾を撃つ問題を再発させないため、敵の発射条件に「本体が画面内に見えていること」を入れた。

v006 の狙いは「Pulse を溜めて吐くと、画面全体が一気に反転する」ことです。v005 の残留フィールド型、v007 の敵ハック型と混同しない。

## 中心仕様

- 敵弾の近くを通ると `CHARGE` が増える。
- Space で現在 charge に応じた Pulse を発動する。
- LOW Pulse は小さな緊急変換。
- MID Pulse は短い共鳴場を残す。
- MAX Pulse は大きく長い共鳴場を残すだけでなく、画面内の敵弾をまとめて Relay 化し、敵にもショックウェーブを当てる。
- MAX Pulse を受けた敵は `max-shockwave` resonance になり、近距離の別敵へ枝分かれ Relay を出す。
- v005 の敵リアクションと Chain Relay は維持するが、v006の主役は「貯めたMAX Pulseで画面全体を反転させる」こと。

## 操作

- 移動: 矢印キー / WASD
- Pulse / 開始 / リトライ: Space
- ショット: 自動

## 起動

`index.html` をブラウザで開きます。

## 評価コマンド

```powershell
node verify.js
node timeline_eval.js
node enemy_behavior_audit.js
node wave_grammar_check.js
node enemy_overlap_check.js
```

## 現在の評価結果

`node verify.js`: pass。

- route 3 run すべて clear
- `nearMissCharge: 500.31`
- `spentCharge: 528`
- `maxPulseCount: 6`
- `converted: 363`
- `maxShockwaveConversions: 363`
- `maxShockwaveHits: 44`
- `resonantEnemies: 193`
- `chainHits: 43`
- `relayKills: 44`
- `pulseWhiffs: 0`

`node timeline_eval.js`: pass。

- route clearRate: 1
- route meanConverted: 363
- route meanMaxPulseCount: 6
- route meanMaxShockwaveConversions: 363
- route meanMaxShockwaveHits: 44
- route meanChainHits: 43
- noPulse clearRate: 0
- camper clearRate: 0
- lane-holder clearRate: 0
- blind-sweeper clearRate: 0

`node enemy_behavior_audit.js`: pass。

- `offscreenShots: 0`
- `lingeringEnemies: 0`
- `maxEnemyStep: 12.75`
- `relayKills: 44`
- `pulseWhiffs: 0`

## v005 / v006 / v007 の体感差

- v005: Pulse 後に短時間だけ場が残り、敵弾を拾い続ける。体感は「設置した残留フィールドで受ける」。
- v006: charge を溜めて MAX Pulse を撃つと、画面中の弾と敵へショックウェーブが走り、敵から敵へ枝分かれする。体感は「溜め技で画面全体を反転させる」。
- v007: Pulse を当てた敵が黄色い書き換え状態になり、通常の赤弾を止めて味方弾を撃つ。体感は「敵を一時的に味方砲台へ変える」。

## 次の比較候補

v007 では `Pulse Command / Enemy Rewrite` を試す。敵弾を変換するだけでなく、Pulse を当てた敵の行動モードそのものを書き換え、敵弾が少ない秒でも Pulse 対象選択が意味を持つかを見る。
