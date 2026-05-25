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

## v006 実装結果

`game/pulse_relay/v006/` で実装した。v005 の敵リアクションと Chain Relay は維持し、Pulse を `CHARGE` 経済へ切り替えた。敵弾の近くを通ると charge が増え、LOW / MID / MAX Pulse の3段階で発動する。route は MAX Pulse を待つ policy として評価し、pulseHeavy は低 charge 連打の比較対象にした。

ただし最初のv006は、ユーザー確認で「6は体感が何も変わらない」と判断された。これは、charge 経済という内部構造の違いだけでは人間のプレイ体感として十分に違わなかったため。修正後のv006では、MAX Pulse を画面全体へ届くショックウェーブとして作り直した。

修正後のv006の体感差:

- MAX Pulse は自機周辺だけではなく、画面内の敵弾をまとめて Relay 化する。
- MAX Pulse は画面内の敵にも直接ショックウェーブを当てる。
- ショックウェーブを受けた敵は `max-shockwave` resonance になり、近くの敵へ枝分かれ Relay を発生させる。
- 「溜めて吐くと画面全体が一気に反転する」ことをv006の核にした。
- 画面外や横入場中の敵から弾が出る問題を再発させないため、敵の発射条件に「本体が画面内に見えていること」を入れた。

検証結果:

- `node verify.js`: pass
- `node timeline_eval.js`: pass
- `node enemy_behavior_audit.js`: pass
- route clearRate: 1
- route meanNearMissCharge: 500.31
- route meanSpentCharge: 528
- route meanConverted: 363
- route meanMaxPulseCount: 6
- route meanMaxShockwaveConversions: 363
- route meanMaxShockwaveHits: 44
- route meanChainHits: 43
- route meanRelayKills: 44
- noPulse / camper / lane-holder / blind-sweeper clearRate: 0

残課題: MAX Pulse がかなり強くなったため、v006型を伸ばすなら「溜めるリスク」「吐くタイミング」「MAX以外の用途」をもう一段整理する余地がある。ただし、v005との差は明確にすること。v006を「少し長い残留フィールド版」に戻してはいけない。

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

## v007 実装結果

`game/pulse_relay/v007/` で実装した。v006 の charge 経済と Relay / Chain Relay は残し、Pulse を画面内の射線コマンドとして扱い、敵種ごとに次行動を書き換える版にした。

ただし最初のv007は、ユーザー確認で「7は説明されても違いが判らなかった」と判断された。これは、敵の内部状態や次弾パターンだけを書き換えても、プレイヤーが画面上で「敵が変わった」と読めなかったため。修正後のv007では、書き換えられた敵そのものを一時的に味方砲台へ変える方向に寄せた。

実装内容:

- feeder は中央へ燃料弾を供給する。
- armored / anchor は盾を失い、燃料バーストを出す。
- escort は path を瞬間変更せず、押し出し燃料弾だけを出す。
- boss は fuel lane pattern を出す。
- `rewrittenEnemies`, `rewriteFuelShots`, `rewriteKills`, `rewriteBossPatternCount` を headless 指標へ追加した。
- 書き換えられた敵は黄色く表示される。
- 書き換え中の非ボス敵は通常の赤い敵弾発射を止める。
- 書き換え中の敵は黄色い味方弾を撃つ。
- 味方弾は敵を狙い、敵を倒せる。
- `alliedShots`, `alliedHits`, `alliedKills` を headless 指標へ追加した。

検証結果:

- `node verify.js`: pass
- `node timeline_eval.js`: pass
- `node enemy_behavior_audit.js`: pass
- `node wave_grammar_check.js`: pass
- `node enemy_overlap_check.js`: pass
- route clearRate: 1
- route meanRewrittenEnemies: 23
- route meanRewriteFuelShots: 114
- route meanRewriteKills: 29
- route meanRewriteBossPatternCount: 2
- route meanAlliedShots: 46
- route meanAlliedHits: 46
- route meanAlliedKills: 25
- noPulse / camper / lane-holder / blind-sweeper clearRate: 0
- offscreenShots: 0
- pairOverlaps: 0

残課題: route は clear するが被弾が残る。v007型を伸ばすなら、味方化した敵の射撃先、黄色弾の密度、boss-rush時の書き換え価値をさらに調整する。

## v005 / v006 / v007 を混同しないための比較

今回のユーザー指摘から、内部仕様だけが違っても、人間がプレイして違いを感じられなければ別バージョンとして弱いことが分かった。今後の自律サイクルでは、各版の違いを「体感で言える一文」に落とせるかを確認する。

- v005: Pulse 後に短時間だけ場が残り、敵弾を拾い続ける。体感は「設置した残留フィールドで受ける」。
- v006: charge を溜めて MAX Pulse を撃つと、画面中の弾と敵へショックウェーブが走り、敵から敵へ枝分かれする。体感は「溜め技で画面全体を反転させる」。
- v007: Pulse を当てた敵が黄色い書き換え状態になり、通常の赤弾を止めて味方弾を撃つ。体感は「敵を一時的に味方砲台へ変える」。

同じ失敗を繰り返さないための判断基準:

- 「内部の数値や状態は変わっている」だけでは不十分。
- 「説明されれば違う」だけでは不十分。
- プレイヤーが見て、押して、1回のプレイ中に違いを感じられる必要がある。
- 新バージョンの仮説は、画面上の記号、敵の振る舞い、弾の軌跡、倒れ方、リスクと報酬の構造まで変える。
- ヘッドレス評価では、新しい仮説専用の指標を追加する。v007なら `alliedShots`, `alliedHits`, `alliedKills` のように、体感差に直結する指標を測る。

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
