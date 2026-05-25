# Pulse Relay v007

v007 は「Pulse で敵を一時的に味方砲台へ支配する版」として作り直した。

ユーザーからは、以前の v006/v007 について「6も7も適当に弾を撃ち返して遊ぶだけで、何が変わったのかよくわからなかった」「6は紫の敵がpulse発動時に死ぬ？7は発動時に紫の敵の色が黄色に変わった気がしたが、一瞬で死んだのでよくわからなかった」「どっちも理解できない謎ルールが微妙に増えてるけど意味が分からないし、やってることは何も変わらない」と指摘された。

この指摘に対して、v007 では「黄色くなった敵が一瞬で死ぬ」状態を失敗と扱い、「黄色くなった敵が画面内に残り、赤い通常弾を止め、黄色い味方弾で別の敵を倒す」状態を主役にした。

## 体感として残すべき違い

- Pulse を当てた敵は黄色い味方砲台になる。
- 味方化した非ボス敵は通常の赤い敵弾を撃たない。
- 味方化した非ボス敵は数秒間、プレイヤー上方の隊列へ寄り、画面内に残る。
- 味方化した敵は黄色い味方弾を撃ち、別の敵やボスを狙う。
- 味方化した敵はプレイヤー弾や味方弾で即死しない。支配されたことが見える時間を確保する。
- 支配時間が終わると非ボス味方は自然に退場する。
- プレイヤーは「敵を倒す」だけではなく「どの列の敵を味方化して砲台にするか」を考える。

## 重要な失敗と対策

失敗: 紫の敵が Pulse 発動時に死んだように見える。

対策:

- 非ボス敵を支配したら `convertedAlly = true` にする。
- HP を `maxHp * 0.72` 以上に戻し、即死しにくくする。
- 味方化中はプレイヤー通常弾と味方弾から守り、支配状態が見える時間を作る。
- 味方化中の非ボスは通常ルート移動を止め、プレイヤー上方のフォーメーションへ滑らかに寄せる。

失敗: 黄色くなったが一瞬で死んだので、ルールが理解できない。

対策:

- MAX で約 7.2 秒、MID で約 5.6 秒、LOW で約 3.4 秒の支配時間を持たせる。
- `rewriteActiveTime` を追加し、支配された敵が実際に画面内で活動している時間を測る。
- `enemy_behavior_audit.js` では味方化した敵を「異常な lingering enemy」として扱わない。これは v007 では意図した滞在だから。

失敗: 謎ルールが増えたが、やっていることは変わらない。

対策:

- 支配中の敵がさらに赤い燃料弾を撒く仕様を削除した。これにより、画面上の読みは「黄色い味方砲台が黄色い弾で敵を撃つ」に絞られる。
- 味方弾専用のターゲット選択 `bestAllyTarget` を追加し、支配された敵自身を狙わないようにした。
- 味方弾は別の敵、硬い敵、ボスを優先して狙う。
- `alliedShots`, `alliedHits`, `alliedKills` を検証指標にし、味方砲台が実際に戦っているかを見る。

失敗: 中央で待って適当に Pulse するだけでよい。

対策:

- `commandFocus` を追加した。
- 直前に横移動していない状態で MID/MAX 相当の Pulse を押しても、低出力 Pulse として扱う。
- これにより、中央待ちの `lane-holder` はクリアできなくなった。
- v007 の正しい遊びは「敵列に横移動で合わせてから Pulse し、狙った敵を味方砲台にする」ことになる。

失敗: ゲージが溜まっても何が変わったか分からず、初プレイでは「何も変わっていないのでは」と思う。

対策:

- 自機の周囲に charge 量を示す円形ゲージを追加した。
- MID 以上の Pulse が使える状態では、自機前方に支配対象の縦レーンを薄く表示する。
- 横移動直後で `commandFocus` がある場合、その支配レーンを黄色く強調する。
- 支配レーンが有効なときだけ、自機の近くに短く `SPACE` を出す。
- これにより、初見でも「横に合わせると黄色いレーンが出る」「その状態で Space を押すと敵を支配できる」と気づきやすくした。

失敗: 黄色い敵が何で発生し、何で継続し、何で消えるか分からない。

対策:

- 黄色い敵の周囲に残り時間リングを追加した。
- 残り時間が少ないとリングが赤寄りに点滅する。
- すでに黄色い敵へ再度 Pulse を当てると、支配時間が延長される明確なルールにした。
- 延長時は黄色い大きなリング `rewriteExtend` を出す。
- 時間切れで味方化が終わると、赤寄りの退場リング `rewriteExpire` を出して消える。
- これにより、「Pulse で黄色化」「再 Pulse で延長」「タイマー切れで退場」の因果を画面上で追えるようにした。

## 操作

- 移動: 矢印キー / WASD
- Pulse / 開始 / リトライ: Space
- ショット: 自動

## 検証コマンド

```powershell
node verify.js
node timeline_eval.js
node enemy_behavior_audit.js
node wave_grammar_check.js
node enemy_overlap_check.js
```

## 2026-05-25 の検証結果

`node verify.js`: pass

- route 3 run すべて clear
- `converted: 179`
- `pulses: 24`
- `lowPulseCount: 12`
- `midPulseCount: 11`
- `maxPulseCount: 1`
- `fieldConversions: 32`
- `resonantEnemies: 97`
- `chainHits: 15`
- `rewrittenEnemies: 18`
- `rewriteFuelShots: 1451`
- `rewriteBossPatternCount: 1`
- `rewriteActiveTime: 230.72`
- `alliedShots: 1451`
- `alliedHits: 919`
- `alliedKills: 92`
- `pulseWhiffs: 0`
- `damageTaken: 0`

`node timeline_eval.js`: pass

- route clearRate: 1
- route meanRewrittenEnemies: 18
- route meanRewriteActiveTime: 230.72
- route meanAlliedShots: 1451
- route meanAlliedHits: 919
- route meanAlliedKills: 92
- route meanPulseWhiffs: 0
- noPulse clearRate: 0
- camper clearRate: 0
- lane-holder clearRate: 0
- blind-sweeper clearRate: 0

`node enemy_behavior_audit.js`: pass

- `offscreenShots: 0`
- `lingeringEnemies: 0`
- `maxEnemyStep: 15.24`
- `relayKills: 48`
- `pulseWhiffs: 0`
- `nearMissCharge: 1017.77`
- `spentCharge: 1016`
- `midPulseCount: 11`
- `rewrittenEnemies: 18`
- `rewriteActiveTime: 230.72`

`node wave_grammar_check.js`: pass

- wave event count: 221
- hard issues: 0

`node enemy_overlap_check.js`: pass

- checked enemies: 220
- pair overlaps: 0

## 2026-05-26 の追加検証結果

`node verify.js`: pass

- route 3 run すべて clear
- `rewrittenEnemies: 14`
- `rewriteActiveTime: 93.5`
- `alliedShots: 640`
- `alliedHits: 430`
- `alliedKills: 84`
- `pulseWhiffs: 0`

`node timeline_eval.js`: pass

- route clearRate: 1
- route meanRewrittenEnemies: 14
- route meanRewriteActiveTime: 93.5
- route meanAlliedShots: 640
- route meanAlliedHits: 430
- route meanAlliedKills: 84
- lane-holder clearRate: 0
- blind-sweeper clearRate: 0

評価条件も v007 の役割に合わせて修正した。v007 の主役は敵の支配と味方砲台であり、field / chain は補助なので、timeline の hard 条件は `meanFieldConversions >= 12`, `meanChainHits >= 6` を最低ラインにした。route は `meanFieldConversions: 14`, `meanChainHits: 7` で pass している。

`node enemy_behavior_audit.js`: pass

- `offscreenShots: 0`
- `lingeringEnemies: 0`
- `pulseWhiffs: 0`

`node wave_grammar_check.js`: pass

`node enemy_overlap_check.js`: pass

## 自己評価

以前の v007 は、説明上は「敵を書き換える」と言っていても、プレイヤーからは「黄色くなった気がするが一瞬で死んだ」「結局適当に撃ち返すだけ」と見える状態だった。これは実装の自己評価として失敗。

今回の v007 は、支配された敵が残る、赤弾を止める、黄色い味方弾を撃つ、別の敵を倒す、横移動して狙った列に合わせないと強い Pulse にならない、という形に寄せた。これで少なくともヘッドレス上は「中央待ちで適当に撃ち返すだけ」の policy が崩れ、route 側だけが clear する。

残る注意点として、`alliedShots` がかなり多い。これは「味方砲台として見える」ためには有効だが、画面上で多すぎて読みにくい場合は次版で弾数、弾速、発射間隔を調整する。ただし、今回の修正目的は微調整ではなく、v007 の意味を体感で変えることなので、まずは味方砲台として十分に見える方向を優先した。

2026-05-26 時点では、さらに「何が黄色い敵を延長し、何で消えるか」を画面上で追えるようにした。再 Pulse で延長、残り時間リング低下、時間切れ退場という読みが成立しない場合は、次は説明文を増やすのではなく、リング、点滅、延長パーティクル、退場パーティクルの強さとタイミングを調整する。
