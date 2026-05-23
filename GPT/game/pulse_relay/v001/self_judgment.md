# Pulse Relay v001 自己評価

## 判定

v001 として完成扱い。`shot_log` ほどの作り込みにはまだ届かないが、過去の反省である「敵が薄い」「ボスが孤立する」「ヘッドレスで見ずに完成扱いする」は避けられた。

## 評価結果

`verify.js` は通過。route 方針は 3 run すべてクリアし、代表値は `time 64.08 / score 12800 / lives 2 / converted 18 / conversionHits 5 / damageTaken 2`。

`timeline_eval.js` は通過。route は 5 seed で `clearRate 1`、`bossReachRate 1`。noPulse も `clearRate 1` なので、パルスは必須解ではない。ただし route は noPulse より score が高く、変換と反撃命中が発生している。

`wave_grammar_check.js` は severe warning なし。ボス中の燃料は残っており、単発 wave だけの構成ではない。

## 良い点

- 画面上のルールが少なく、通常ショットだけでも縦 STG として成立する。
- パルス成功時に弾消しと反撃が同時に起き、`relayHits` で攻撃接続も確認できた。
- ボス前後に燃料を置いたので、ボス孤立の停止感は初期案より減った。
- `timeline_eval.js` と `wave_grammar_check.js` により、次回も同じ粒度で評価できる。

## 弱い点

- noPulse でもクリアできる。v001 では初心者向けの余白として許容したが、固有メカの存在感はまだ強くない。
- route の `shootable_gap` は残っている。弾を避ける時間が長い場面で、撃つ気持ちよさが途切れる可能性がある。
- aggressive / pulseHeavy が早死にするため、前に出る遊び方はまだ受け止められていない。
- ヘッドレスは人間の面白さを保証しない。実プレイで「Space を押したくなるか」を見る必要がある。

## 完成と判断した理由

短編プロトタイプとして、開始、通常 wave、中盤の硬い敵、ボス、クリア、リスタート、ヘッドレス評価、時系列メトリクス、wave 文法検査、自己評価まで揃った。指標は合格のためにハックせず、各指標が示すプレイ体験上の疑いを見て、過密 wave、反撃命中、ボス長さを修正した。
