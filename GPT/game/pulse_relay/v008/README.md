# Pulse Relay v008

v008 は「味方化した敵と自機の間に relay tether を張る版」。

v007 では、Pulse を当てた敵が黄色い味方砲台になった。v008 ではさらに、黄色い敵と自機の間に黄色い線が出る。その線を敵弾が横切ると relay 弾へ変換される。

## 体感として残したい違い

- Pulse を当てた敵は黄色い味方砲台になる。
- 黄色い敵と自機の間に relay tether が張られる。
- 敵弾が tether を横切ると黄色い relay 弾へ変わる。
- プレイヤーは「どの敵を黄色くするか」と「線をどこへ通すか」を考える。
- camper / lane-holder / noPulse は clear できない。

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
node ..\..\..\tools\headless_pulse_relay_v008_check.js
```

## 2026-05-26 検証結果

- `node verify.js`: pass
- `node timeline_eval.js > timeline_eval_result.json`: pass
- `node enemy_behavior_audit.js`: pass
- `node wave_grammar_check.js`: pass
- `node enemy_overlap_check.js`: pass
- `node tools/headless_pulse_relay_v008_check.js`: pass

主要値:

- route clearRate: 1
- route meanTetherConversions: 269
- route meanTetherActiveTime: 40.5
- noPulse / camper / lane-holder clearRate: 0
- offscreenShots: 0
- pairOverlaps: 0

## 残課題

`blind-sweeper` は clear できている。score は route より低いが、次版では tether の判定幅や支配敵数を絞り、雑な左右移動では成立しない形へ寄せる。
