# Pulse Relay v006

v006 は、v005 の `Resonance Field / Enemy Resonance / Chain Relay` を土台にしつつ、Pulse の発動経済を大きく変えた版です。Pulse は単なるクールダウン技ではなく、敵弾の近くを通って `CHARGE` を溜め、最大 Pulse で大きな共鳴場を吐く仕組みにしました。

## 中心仕様

- 敵弾の近くを通ると `CHARGE` が増える。
- Space で現在 charge に応じた Pulse を発動する。
- LOW Pulse は小さな緊急変換。
- MID Pulse は短い共鳴場を残す。
- MAX Pulse は大きく長い共鳴場を残し、Relay damage / 敵 resonance / 盾剥がしが強くなる。
- v005 の敵リアクションと Chain Relay は維持する。

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
- `nearMissCharge: 676.55`
- `spentCharge: 704`
- `maxPulseCount: 8`
- `converted: 141`
- `fieldConversions: 48`
- `resonantEnemies: 77`
- `chainHits: 26`
- `pulseWhiffs: 0`

`node timeline_eval.js`: pass。

- route clearRate: 1
- route meanMaxPulseCount: 8
- noPulse clearRate: 0
- camper clearRate: 0
- lane-holder clearRate: 0
- blind-sweeper clearRate: 0

`node enemy_behavior_audit.js`: pass。

- `offscreenShots: 0`
- `lingeringEnemies: 0`
- `maxEnemyStep: 12.52`
- `relayKills: 47`
- `pulseWhiffs: 0`

## 次の比較候補

v007 では `Pulse Command / Enemy Rewrite` を試す。敵弾を変換するだけでなく、Pulse を当てた敵の行動モードそのものを書き換え、敵弾が少ない秒でも Pulse 対象選択が意味を持つかを見る。
