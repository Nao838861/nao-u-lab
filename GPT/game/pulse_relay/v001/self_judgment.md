# Pulse Relay v001 自己評価

## 判定

v001 として完成扱い。`shot_log` 相当の長期作り込みにはまだ届かないが、今回の要求である「敵配置をゼロから作り直す」「チェックリストを原意ごと保持する」「一秒ごとの時系列評価で展開を見る」「雑な勝ち方を bot policy として潰す」は実行した。

## 最終検証

`node wave_grammar_check.js`

- hard issue なし。
- 9 blocks: `opening_curve_train`, `mirror_answer`, `center_lane_bait`, `side_feeder_cover`, `armored_gate`, `relief_harvest`, `midboss_setup`, `boss_approach_final_braid`, `boss_relay_exam`
- event count: 75

`node verify.js`

- mechanic: `converted 5`, `conversionHits 3`
- route 3 run: すべて `state clear`
- 代表値: `time 63.22`, `score 16100`, `lives 3`, `converted 27`, `conversionHits 19`, `damageTaken 1`

`node timeline_eval.js`

- route: `clearRate 1`, `bossReachRate 1`, `meanRouteCoverage 1`, `meanBottomCampPct 0`, `meanTime 63.22`, `meanScore 16100`, `meanConverted 27`, `meanRelayHits 19`, `meanDamage 1`
- marksman: `clearRate 1`, `bossReachRate 1`, `meanScore 15550`
- camper: `clearRate 0`, `bossReachRate 0`, `meanScore 1688`
- lane-holder: `clearRate 0`, `bossReachRate 0`, `meanRouteCoverage 0.44`
- blind-sweeper: `clearRate 0`, `bossReachRate 0`, `meanRouteCoverage 0.78`
- noPulse: `clearRate 0`, `bossReachRate 1`, `meanScore 3570`, `meanConverted 0`
- pulseHeavy: `clearRate 1`, `meanScore 12640`, `meanRelayHits 12`

## 時系列から見た展開

序盤は左からの curve train と右からの mirror answer で横移動を作る。10 秒台の center lane bait で最初の硬い target を見せ、17 秒台の side feeder cover で横から来る敵と中央目標を同時に処理させる。

25-34 秒の armored gate は、通常ショットの射線が途切れる秒が残る。これは完全な理想ではないが、route はこの区間で `converted` と `relayHits` を伸ばしており、Pulse Relay が敵処理へ接続している。射線警告を消すために route を硬い敵へ寄せすぎると noPulse が強くなることを確認したので、v001 では Pulse を使う山として残した。

41-55 秒は midboss setup から boss approach へつなぐ区間。初回検証では route がここで落ちたため、終盤 armored の shield / fireCd、boss 出現時刻、boss HP / fireRate を調整した。最終的に route は 5 seed で boss に到達し、boss 戦中も relay hit が発生する。

## 良い点

- 敵 wave は 9 block 構成になり、単発の敵数変更ではなく、前 wave が作った位置を次 wave が利用する形になった。
- 下端待ち camper は clearRate 0 まで落ち、下端撃破の score penalty と追加弾圧により雑な勝ち方が成立しない。
- noPulse は boss には到達するが clearRate 0 で、Pulse Relay が攻略と score の両方に関係している。
- `wave_grammar_check.js` と `timeline_eval.js` が、次回も同じ粒度で再利用できる検査になった。

## v002 に残す弱点

- route の `shootable_gap` と `bullets_without_targets` はまだ多い。Pulse 山場として許容したが、次回は「撃てないが避けるだけ」の時間を、もっと短い relay fuel の連鎖に置き換える。
- aggressive も clear するため、前に出る遊び方のリスクと報酬はまだ弱い。前に出ると危ないが高得点、雑に前へ出ると落ちる、という差を作る余地がある。
- ブラウザ目視プレイは未実施。headless では通ったが、人間が Space を押したくなる感触は追加確認が必要。

## blocker

v001 blocker は 0。上記の弱点は v002 の改善項目として残す。
