# Pulse Relay v007

Pulse を敵弾処理ではなく、敵行動を書き換えるコマンドとして試した版。

## 遊び方

`index.html` をブラウザで開く。方向キーまたは WASD で移動、Space で Pulse。敵弾の近くを通ると charge が増え、Pulse で敵弾変換と敵書き換えが発生する。

## v007 の仮説

Pulse を「近い弾を変換するボタン」だけにすると、v006 では MAX Pulse 待ちが強くなった。v007 では画面内の敵に Pulse を当てる意味を作り、feeder / armored / escort / boss の次行動を変える。

## 検証

実行場所: `game/pulse_relay/v007/`

```powershell
node verify.js
node timeline_eval.js
node enemy_behavior_audit.js
node wave_grammar_check.js
node enemy_overlap_check.js
```

結果は全て pass。route は 5/5 clear、`rewrittenEnemies` / `rewriteFuelShots` / `rewriteKills` / `rewriteBossPatternCount` が出て、noPulse / camper / lane-holder / blind-sweeper は clear しない。

## 残課題

route は clear するが被弾が多く、rewrite fuel による弾量は強い。次版では人間確認向けに視覚記号と boss-rush policy を調整する。
