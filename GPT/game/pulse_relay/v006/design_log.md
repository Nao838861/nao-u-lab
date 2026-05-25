# Pulse Relay v006 設計ログ

## 対象指示

`memory/slack_directives.jsonl` の `log-cdx-1779668181-d295d8ddd5` を対象にした。原文は `v006_design.md` に全文保持した。

## 判断

v005 は Pulse を共鳴場と敵リアクションへ変える案として成立済みだったため、このサイクルでは v006 として別発想を実装した。採用した仮説は「Pulse をクールダウンで押す技ではなく、危険へ近づいて charge を溜め、最大 Pulse で共鳴場を吐く経済にする」こと。

過去知見として、`game_design_rules.md` の「説明で支えず、見えているルールから入力結果を予測できること」、および `game_memory_task_lens_index.md` の headless / bad-policy 分離を使った。v005 の enemy reaction / chain relay は維持し、発動経済だけを大きく変えた。

## 実装内容

- `pulseCharge` を追加し、敵弾の近くを通ると charge が増えるようにした。
- Pulse を LOW / MID / MAX の3段階に分けた。
- LOW は小さな緊急変換、MID は短い共鳴場、MAX は大きく長い共鳴場にした。
- MAX Pulse は Relay damage、敵 resonance、盾剥がしが強くなる。
- HUD は常時説明を増やさず、`CHARGE` と charge bar だけを追加した。
- headless policy を分け、route は MAX Pulse を待ち、pulseHeavy は低 charge 連打を代表するようにした。

## 検証

- `node verify.js`: pass
- `node timeline_eval.js`: pass
- `node enemy_behavior_audit.js`: pass

主要結果:

- route clearRate: 1
- route meanNearMissCharge: 676.55
- route meanSpentCharge: 704
- route meanMaxPulseCount: 8
- route meanConverted: 141
- route meanFieldConversions: 48
- route meanResonantEnemies: 77
- route meanChainHits: 26
- route meanPulseWhiffs: 0
- noPulse / camper / lane-holder / blind-sweeper clearRate: 0
- offscreenShots: 0
- lingeringEnemies: 0

## 懸念

MAX Pulse を待つ route が強く、低/MID Pulse の人間的な使い分けはまだ主役になっていない。v006 の成果は「危険を資源化する経済が headless 上で成立した」ことであり、v007 では `Pulse Command / Enemy Rewrite` 案で、敵弾が少ない秒でも Pulse 対象選択に意味が出るかを比較する。
