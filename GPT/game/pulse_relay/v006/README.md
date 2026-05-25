# Pulse Relay v006

v006 は「MAX Pulse を押した瞬間に全部が終わる版」ではなく、「弾を抱え込んでから遅れて大きく放つストーム版」として作り直した。

ユーザー指摘の文脈では、v005/v006/v007 がどれも「適当に弾を撃ち返して遊ぶだけ」に見え、体感上の違いが弱かった。v006 は特に「MAX Pulse が強い」だけでは v005 の延長に見えるため、押した瞬間の即時処理ではなく、発動後しばらく画面上に残るストーム、ストーム内での敵弾捕獲、終了時の遅延サルボを中心にした。

## 体感として残すべき違い

- Pulse を溜めて MAX Pulse を撃つと、自機の周囲に大きな青いストーム領域が発生する。
- MAX Pulse の価値は、押した瞬間に敵を消すことではなく、一定時間ストームが敵弾を吸い込み続けることにある。
- ストームは自機について動く。プレイヤーは「ストームを敵弾にかぶせる」遊びになる。
- ストーム終了時に、捕獲した弾がまとめて誘導サルボとして敵へ飛ぶ。
- したがって v006 の正しい遊びは「危険な弾幕の中に踏み込んで MAX Pulse を置き、溜めた弾を後から返す」こと。
- v005 のような短時間残留フィールド、v007 のような敵味方化とは混同しない。

## 今回の修正で明確にしたこと

- MAX Pulse は画面内の敵弾をまとめて Relay 化する。
- MAX Pulse は敵に直接大ダメージを与える即死ショックウェーブではない。敵への直接ヒットは補助で、主役はストーム捕獲と遅延サルボ。
- `pulseStorm` を追加し、発動後約 2.65 秒間、ストームが自機に追従する。
- ストーム中に範囲へ入った敵弾は捕獲され、`stormCaptures` に記録される。
- ストーム終了時に `releasePulseStorm` が発火し、捕獲量に応じた誘導弾を放つ。
- `stormSalvos` を追加し、遅延サルボが実際に発生しているか検証する。
- 視覚表現として、青いストームリング、捕獲数表示、捕獲パーティクル、放出パーティクルを追加した。

## 2026-05-26 の認知導線修正

ユーザーから「6も7も、ゲージが溜まったら何かが変わるのに気づかず、初プレイは何も変わってないのでは？って思ってしまった」と指摘された。これはヘッドレス指標では検出できないが、独自システムのあるゲームでは必須の初見導線だった。

v006 では方向性自体は悪くないため、仕様は変えずに「MAX Pulse が使える状態」を画面上で分かるようにした。

- 自機の周囲に charge 量を示す円形ゲージを追加した。
- MAX Pulse が撃てる状態では、自機周辺に大きな青いストーム予告リングが出る。
- MAX Pulse が撃てる状態では、ストーム予告の上に短く `SPACE` を出す。
- この `SPACE` は常時説明文ではなく、発動可能状態だけに出る短い入力キューとして扱う。
- これにより、初回プレイでも「ゲージが溜まると自機周囲の状態が変わる」「Space を押すと何か大きいものが出る」と気づきやすくした。

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
- `converted: 370`
- `pulses: 6`
- `maxPulseCount: 6`
- `maxShockwaveConversions: 328`
- `maxShockwaveHits: 36`
- `stormCaptures: 369`
- `stormSalvos: 6`
- `conversionHits: 226`
- `relayKills: 106`
- `chainHits: 102`
- `damageTaken: 0`
- `pulseWhiffs: 0`

`node timeline_eval.js`: pass

- route clearRate: 1
- route meanConverted: 370
- route meanMaxPulseCount: 6
- route meanStormCaptures: 369
- route meanStormSalvos: 6
- route meanMaxShockwaveConversions: 328
- route meanMaxShockwaveHits: 36
- route meanChainHits: 102
- route meanRelayKills: 106
- noPulse clearRate: 0
- camper clearRate: 0
- lane-holder clearRate: 0
- blind-sweeper clearRate: 0

`node enemy_behavior_audit.js`: pass

- `offscreenShots: 0`
- `lingeringEnemies: 0`
- `maxEnemyStep: 12.52`
- `relayKills: 106`
- `pulseWhiffs: 0`
- `nearMissCharge: 511.33`
- `spentCharge: 528`
- `maxPulseCount: 6`

`node wave_grammar_check.js`: pass

- wave event count: 221
- hard issues: 0

`node enemy_overlap_check.js`: pass

- checked enemies: 220
- pair overlaps: 0

## 2026-05-26 の追加検証結果

`node verify.js`: pass

- route 3 run すべて clear
- `stormCaptures: 369`
- `stormSalvos: 6`
- `maxPulseCount: 6`

`node timeline_eval.js`: pass

- route clearRate: 1
- route meanStormCaptures: 369
- route meanStormSalvos: 6
- lane-holder clearRate: 0
- blind-sweeper clearRate: 0

`node enemy_behavior_audit.js`: pass

- `offscreenShots: 0`
- `lingeringEnemies: 0`
- `pulseWhiffs: 0`

`node wave_grammar_check.js`: pass

`node enemy_overlap_check.js`: pass

## 自己評価

v006 は「MAX Pulse を撃つと画面全体が強くなる」だけでは不十分だった。ユーザーが問題にした「6も7も適当に弾を撃ち返して遊ぶだけ」という状態を避けるには、プレイヤーの行動が変わる必要がある。

今回の v006 は、押した瞬間に気持ちよく返すだけでなく、ストームを敵弾に重ねる時間差の遊びに寄せた。ヘッドレス上でも `stormCaptures` と `stormSalvos` が主指標として出ており、単なる通常 Relay の増量ではなく、v006 固有の挙動が中心になっている。
