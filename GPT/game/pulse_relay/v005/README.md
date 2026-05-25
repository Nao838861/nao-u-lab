# Pulse Relay v005

v005 は、v004 の「敵弾を誘導 Relay に変換する」方向をさらに進め、Pulse をこのゲームの中心メカニクスとして作り直した版です。細かい UI 改善や微小なパラメータ調整ではなく、「Pulse 的な仕様を縦シューティングに足すなら何が一番面白いか」を試すため、Pulse 自体と敵のリアクションを大きく変えています。

## v005 の中心仕様

- Space で Pulse を発動する。
- Pulse は発動位置に短時間残る `Resonance Field` を作る。
- 発動時に範囲内の敵弾を Relay に変換する。
- 発動後も、共鳴場に入った敵弾は自動で Relay に変換される。
- Pulse に巻き込まれた敵、または自分の弾を変換された敵は `resonance` 状態になる。
- resonance 状態の敵は燃料弾を吐きやすくなり、Relay の優先ターゲットにもなる。
- Relay は命中時、近くの別敵へ枝分かれする `Chain Relay` を発生させる。

v004 では「敵弾が少ない」「発動した弾が狙った敵に当たらない」「今倒れてほしい敵に届かない」問題が残りやすかった。v005 では、Pulse 成功後に敵が燃料を返し、その燃料がさらに Relay へ変わるため、Pulse が防御ボタンではなく、画面処理を始める攻撃スイッチになる。

## 起動

`index.html` をブラウザで開きます。

## 操作

- 移動: 矢印キー / WASD
- Pulse / 開始 / リトライ: Space
- ショット: 自動

## 評価コマンド

```powershell
node verify.js
node timeline_eval.js
node wave_grammar_check.js
node enemy_overlap_check.js
node enemy_behavior_audit.js
```

## v005 固有の合格条件

- `fieldConversions` が十分に出ること。
- `resonantEnemies` が十分に出ること。
- `chainHits` が十分に出ること。
- `pulseWhiffs` がほぼ出ないこと。
- `noPulse`, `camper`, `lane-holder`, `blind-sweeper` が route より明確に弱いこと。
- 画面外射撃がないこと。
- 非ボス敵が長時間残留しないこと。
- 敵同士の不自然な重なりがないこと。

## 現在の評価結果

`node verify.js`:

- route 3 run すべて clear。
- `converted: 168`
- `fieldConversions: 91`
- `resonantEnemies: 118`
- `chainHits: 33`
- `relayKills: 62`
- `pulseWhiffs: 0`

`node timeline_eval.js`:

- route clearRate: 1
- route meanConverted: 168
- route meanRelayHits: 161
- route meanFieldConversions: 91
- route meanResonantEnemies: 118
- route meanChainHits: 33
- route meanPulseWhiffs: 0
- noPulse clearRate: 0
- camper clearRate: 0
- lane-holder clearRate: 0
- blind-sweeper clearRate: 0

`node enemy_behavior_audit.js`:

- `offscreenShots: 0`
- `lingeringEnemies: 0`
- `pulseWhiffs: 0`

`node enemy_overlap_check.js`:

- `pairOverlaps: 0`

