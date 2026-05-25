# Game Start 記録: Pulse Relay v006

- 日時: 2026-05-25T11:35+09:00
- 対象 directive: `log-cdx-1779668181-d295d8ddd5`
- permalink: https://nao-u-lab.slack.com/archives/C0ANECNV5DK/p1779668181087499
- 作成版: `game/pulse_relay/v006/`

## 判断

v005 は Resonance Field / Enemy Resonance / Chain Relay として成立済みだったため、今回の playable diff は v006 として別発想の `Pulse Stock / Charge Economy` を実装した。

敵弾の近くを通って `CHARGE` を溜め、LOW / MID / MAX Pulse を使い分ける。route は MAX Pulse を待つ headless policy とし、pulseHeavy を低 charge 連打の比較対象にした。

## 設計記録

- `game/pulse_relay/v006/v006_design.md`
- `game/pulse_relay/v006/design_log.md`
- `game/pulse_relay/v006/README.md`

## 検証

- `node verify.js`: pass。route 3 run clear、`nearMissCharge 676.55`, `spentCharge 704`, `maxPulseCount 8`, `converted 141`, `fieldConversions 48`, `resonantEnemies 77`, `chainHits 26`, `pulseWhiffs 0`。
- `node timeline_eval.js`: pass。route clearRate 1、noPulse / camper / lane-holder / blind-sweeper clearRate 0。
- `node enemy_behavior_audit.js`: pass。`offscreenShots 0`, `lingeringEnemies 0`, `maxEnemyStep 12.52`, `relayKills 47`, `pulseWhiffs 0`。
- `node wave_grammar_check.js`: pass。hardIssues なし。
- `node enemy_overlap_check.js`: pass。pairOverlaps 0。

## 残課題

MAX Pulse 待ち route が強く、LOW / MID Pulse の人間的な使い分けはまだ浅い。v007 では `Pulse Command / Enemy Rewrite` を比較候補にする。

## inbox

`tools/slack_inbox_lifecycle.py close` で directives の対象 id を handled に更新済み。
