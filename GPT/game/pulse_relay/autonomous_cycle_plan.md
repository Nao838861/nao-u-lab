# Pulse Relay 自律改善サイクル計画

## 目的

今後の自律サイクルでは、Pulse Relay を単に「既存版を少し良くする」方向で扱わない。Pulse 的な仕様をシューティングゲームに足すなら何が一番面白いのかを、バージョンごとに大きく仮説を変えて試す。

各バージョンは次の順で進める。

1. その版の大きな仮説を書く。
2. その仮説を満たす Pulse 仕様、敵リアクション、ステージ上の要求を設計書へ書く。
3. 実装する。
4. `verify.js`, `timeline_eval.js`, `wave_grammar_check.js`, `enemy_overlap_check.js`, `enemy_behavior_audit.js` を回す。
5. 数値だけでなく、どの bot policy が勝ったか、Pulse が主役になっているか、敵リアクションが実際に起きているかを見る。
6. hard issue が残る場合は、設計意図を曲げずに直す。
7. README と評価レポートを日本語で残す。
8. ディレクトリを git に追加してコミットする。

## v005 で試した仮説

Pulse は一瞬の反射ボタンではなく、短時間残る共鳴場を作り、敵がそれに反応して燃料弾を出し、その燃料弾が Relay と Chain Relay へ変わると面白くなる。

この仮説は成立した。`fieldConversions`, `resonantEnemies`, `chainHits` がヘッドレスで十分に出て、`noPulse`, `camper`, `lane-holder`, `blind-sweeper` は clear しない状態になった。

## v006 候補: Pulse Stock / Charge Economy

別発想として、v006 では Pulse をクールダウン制ではなく、危険を引き受けて溜める stock 制にする。

狙い:

- Pulse を「使える時に押す」ではなく、「敵弾に近づいて溜め、どこで吐くか選ぶ」ゲームにする。
- 近い敵弾、射線外の敵、硬い敵、ボス燃料などを、プレイヤーが事前に意識するようにする。
- 溜めた stock 量で Pulse の性質を変える。小 Pulse は防御、最大 Pulse は画面処理。

設計候補:

- 敵弾がプレイヤーの近くを通ると `charge` が増える。
- 被弾せずに近接回避すると増加量が大きい。
- Space で charge を消費して Pulse。
- charge 低: 近い弾だけ反射。
- charge 中: 弾を誘導 Relay 化。
- charge 高: 敵も resonance させ、Chain Relay を許可。
- 最大 charge で使うと、敵弾を消すだけでなく、敵の次弾を燃料弾へ変える。

検査:

- 低 charge 連打が強すぎないこと。
- 最大 charge だけを待つ no-risk 戦法が強すぎないこと。
- charge を溜めるために危険へ近づく意味があること。
- `nearMissCharge`, `spentCharge`, `maxPulseCount`, `lowPulseCount` を測る。

## v007 候補: Pulse Command / Enemy Rewrite

別発想として、v007 では Pulse を敵弾変換ではなく、敵の行動モードを書き換えるコマンドにする。

狙い:

- Pulse を「弾処理」から「敵編隊の意味を変える」操作にする。
- どの敵に Pulse を当てるかで、次の 2 秒の弾幕と移動が変わるようにする。
- プレイヤーが敵種と配置を読んで、Pulse 対象を選ぶゲームにする。

設計候補:

- Pulse 範囲内の敵に `rewritten` 状態を付与する。
- `feeder` は書き換えられると燃料弾を中央へ供給する。
- `armored` は書き換えられると盾を失い、かわりに周囲へ燃料弾を散らす。
- `escort` は書き換えられると横移動を変え、射線外の敵を画面中央へ押し出す。
- `boss` は書き換えられると次の攻撃 pattern が Relay fuel pattern へ変わる。
- 敵弾が少ない状況でも、敵に Pulse を当てる意味を作る。

検査:

- `rewrittenEnemies`, `rewriteFuelShots`, `rewriteKills`, `rewriteBossPatternCount` を測る。
- 敵弾が少ない秒でも Pulse が意味を持つかを見る。
- Pulse を敵へ当てず、弾だけ拾う policy が route より弱いかを見る。

## 自律サイクルで特に守ること

- 小さな UI 改善を「大きなゲーム性の改善」と混同しない。
- Pulse の数値だけを強くして終わらせない。
- 敵リアクションを必ず入れる。
- そのリアクションがヘッドレスの数値に出るようにする。
- clear だけで合格にしない。
- `noPulse`, `camper`, `lane-holder`, `blind-sweeper` のような雑な方針が勝っていないか見る。
- 画面外射撃、敵の長時間残留、不自然なワープ、下部急加速退場を再発させない。
- 日本語文書は UTF-8 として扱い、PowerShell で読む時は `-Encoding UTF8` を使う。
- 新しい版を作ったら、未追跡のまま放置せず git に固定する。

