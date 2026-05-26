# Pulse Relay v008

v008 は、v007 の敵支配/tether から離れ、v005 の Resonance Field / Chain Relay を土台に戻した再出発版です。

## 中心仕様

- Space で Pulse を発動する。
- Pulse は近くの敵弾を Relay 弾へ変換する。
- Pulse 後、短時間の Resonance Field が残る。
- Pulse 後、自機の x 座標に縦の `Relay Lane` が残る。
- 敵弾が Relay Lane を横切ると Relay 弾へ変換される。
- プレイヤーは「いつ押すか」だけでなく「Pulse 後にどの列へ自機を置くか」を考える。

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
node ..\..\..\tools\headless_pulse_relay_v008_check.js
```

## 2026-05-27 検証結果

- `node verify.js`: pass
- `node timeline_eval.js`: pass
- `node enemy_behavior_audit.js`: pass
- `node wave_grammar_check.js`: pass
- `node enemy_overlap_check.js`: pass
- `node tools/headless_pulse_relay_v008_check.js`: pass

主要値:

- route clearRate: 1
- route meanConverted: 173
- route meanFieldConversions: 54
- route meanLaneConversions: 69
- route meanLaneActiveTime: 17.67
- route meanResonantEnemies: 172
- route meanChainHits: 40
- camper / lane-holder / blind-sweeper / noPulse clearRate: 0
- offscreenShots: 0
- pairOverlaps: 0

## 残課題

`survival`, `pulseHeavy`, `boss-rush` は clear する。v008 では v05 起点へ戻して遊ぶ感覚を変える playable diff を優先した。次は良い route と雑な Pulse 多用の質差をさらに分ける。
