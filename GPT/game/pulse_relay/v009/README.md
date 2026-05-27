# Pulse Relay v009

v009 は、v008 の縦レーンが初見で読めなかった失敗を受けて作った別アプローチです。v005 の Resonance Field / Chain Relay は残し、Pulse 後の効果を「自機前方へ横長の Relay Gate を置く」形に変えました。

## 中心仕様

- Space で Pulse を発動する。
- Pulse は近くの敵弾を Relay 弾へ変換する。
- Pulse 後、短時間の Resonance Field が残る。
- Pulse 後、自機の少し前に横長の `Relay Gate` が残る。
- 下りてくる敵弾が Relay Gate を通過すると Relay 弾へ変換される。
- 中盤以降に crossfire wave を増やし、敵弾が Gate を通る状況をステージ側で作る。

## 操作

- 移動: 矢印キー / WASD
- Pulse / 開始 / リトライ: Space
- ショット: 自動

## 起動

`index.html` をブラウザで開く。

## 検証コマンド

```powershell
node verify.js
node timeline_eval.js
node enemy_behavior_audit.js
node wave_grammar_check.js
node enemy_overlap_check.js
node ..\..\..\tools\headless_pulse_relay_v009_check.js
```

## 残課題

## 2026-05-27 検証結果

- `node verify.js`: pass
- `node timeline_eval.js`: pass
- `node enemy_behavior_audit.js`: pass
- `node wave_grammar_check.js`: pass
- `node enemy_overlap_check.js`: pass
- `node tools/headless_pulse_relay_v009_check.js`: pass

主要値:

- route clearRate: 1
- route meanConverted: 239
- route meanGateConversions: 194
- route meanGateActiveTime: 14.98
- route meanPressurePct: 0.53
- route meanPulseOpportunityPct: 0.58
- route meanRelayKills: 82
- camper / lane-holder / blind-sweeper / noPulse clearRate: 0
- offscreenShots: 0
- pairOverlaps: 0

## 残課題

Relay Gate は縦レーンより自然に敵弾を通せるが、まだ人間の目視確認は未実施。`survival` と `pulseHeavy` は clear するため、次回は雑な高頻度 Pulse と良い route の質差をさらに分ける。
