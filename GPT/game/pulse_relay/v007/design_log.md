# Pulse Relay v007 設計ログ

## 対象指示

`memory/slack_directives.jsonl` の `log-cdx-1779668181-d295d8ddd5` を継続対象にした。原文は v006 で全文保持済みで、要点は「Pulse Relay を自律サイクルで v006 / v007 と別発想で大きく変え、headless で測りながら良いものを探す」こと。

## 実装前判断

v006 は「危険へ近づいて charge を溜め、MAX Pulse を吐く」版として成立した。ただし、MAX を待つ route が強く、Pulse の判断が「弾が近い時に押す」へ寄っていた。v007 では仮説を変え、Pulse を敵弾処理ではなく「敵行動を書き換えるコマンド」にした。

使った過去知見:

- `game_design_rules.md`: 説明で支えず、見えている対象と入力結果を対応させる。
- `game_memory_task_lens_index.md`: route / bad-policy / boss-rush など複数 policy で比較する。
- `game/pulse_relay/autonomous_cycle_plan.md`: v007 候補として Pulse Command / Enemy Rewrite を採用する。

## 設計サイクル

### Cycle 1

良いところ/悪いところ30件: v006 は charge が数値として見える、近接回避に意味がある、bad policy が落ちる、route が clear する、field conversion が多い、chain relay が出る、boss に届く、HUD が増えすぎない、敵リアクションがある、headless 指標がある。一方で MAX 待ちが強い、LOW/MID の使い分けが浅い、敵を選ぶ感覚が薄い、敵弾が少ない秒に Pulse 意味が薄い、Pulse 対象が弾だけに見える、boss 書き換えがない、feeder/armored/escort の差が弱い、route policy に最適化しやすい、field が強すぎる、pulseHeavy との差が曖昧、敵側の状態記号が少ない、射線判断が薄い、ボタンの意味が単調、プレイヤーが「どの敵に当てたか」を学びにくい、次弾の変化が読みにくい、緊張が弾量に偏る、書き換え後の報酬がない、boss phase に固有反応がない、空白秒の目的が弱い、視覚記号が足りない。

改善案30件: 敵に rewritten 状態を付ける、feeder は中央燃料を出す、armored は盾を失って燃料を散らす、escort は押し出し燃料を出す、boss は fuel lane に変わる、rewrite 指標を追加する、route は敵対象でも Pulse する、noPulse は維持、camper は Pulse しない、lane-holder は boss へ届きにくくする、blind-sweeper は clear させない、Pulse 範囲を自機円だけでなく縦射線にする、書き換え対象を黄色十字で示す、画面外敵は書き換え弾を撃たせない、敵の path は書き換えで急に変えない、field conversion は残す、charge 経済は残す、boss rewrite count を測る、rewrite fuel shots を測る、rewrite kills を測る、offscreenShots を監査する、maxEnemyStep を監査する、wave grammar を維持する、overlap を維持する、README に比較を書く、v006 との差分を計画へ追記する、pulse whiff を低く保つ、route clear を維持する、bad policy failure を維持する、残課題を明記する。

筋の良い案: Pulse を「弾に当てる円」から「画面内の射線コマンド」へ拡張する。解決できる問題は、敵弾が少ない秒でも Pulse に意味が出ること、敵種を読む理由が出ること、boss phase に固有反応を作れること。懸念は、射線範囲が広すぎると自動変換になること。

### Cycle 2

良いところ/悪いところ30件: 射線コマンドは分かりやすい、敵が記号になる、feeder/armored/escort 差が出る、boss 書き換えが可能、headless に指標を足せる、既存 wave を壊さない、v006 との差が大きい、route が学習対象になる、Pulse が主役になる、UI 説明を増やさずに済む。一方で、敵の移動 path を変えると瞬間移動する、画面外 side enemy が弾を撃つ危険がある、rewrite fuel が多すぎると弾量が膨らむ、boss-rush が死にやすい、route damage が増える、pulseHeavy も書き換えを拾う、blind-sweeper も一部報酬を拾う、score 比較が難しくなる、弾処理版との比較が混ざる、MAX の意味が薄れる、視覚効果が弱い、敵の状態時間が長すぎる可能性、field と rewrite の二重強化、fuel shot が画面を埋める、route が被弾する、boss phase が荒れる、下部 camp 対策は別軸、操作が忙しい、説明なしで伝わるか未確認、人間確認がまだない。

改善案30件: rewritten は時間制にする、rewriteCd を持たせる、offscreen firing を禁止する、escort は path を変えず弾だけ変える、boss rewrite は route で測る、boss-rush は参考 policy に下げる、mid pulse count を v007 主指標にする、max pulse 必須を外さないが主ではない、route clear を必須にする、bad policy clear 失敗を必須にする、rewriteFuelShots 下限を置く、rewriteKills 下限を置く、rewriteBossPatternCount 下限を置く、fieldConversions も維持する、resonantEnemies も維持する、chainHits も維持する、enemy_behavior_audit を v007 指標へ更新する、timeline aggregate に rewrite 系を追加、mechanic check で armored 書き換えを見る、視覚十字を追加、HUD は増やさない、README に policy 結果を書く、autonomous plan に v007 結果を追記、staging に path と検証を書く、directives は handled 済みなので再更新しない、commit で固定する、次回は視覚確認を行う、弾量過多を残課題にする、route damage を残課題にする、boss-rush failure を残課題にする。

筋の良い案: 「敵 path は変えず、敵の次弾と盾だけを書き換える」。解決できる問題は、画面外射撃と瞬間移動を避けながら、敵種別の意味を出せること。懸念は、移動そのものを書き換える面白さは薄くなること。

### Cycle 3

良いところ/悪いところ30件: 実装範囲が v007 の仮説に集中する、v006 の charge 経済を再利用できる、敵リアクションが数値に出る、route/bad-policy 分離を保てる、既存 HTML で遊べる、検証が明確、boss まで届く、wave grammar 維持、overlap 維持、画面外射撃を潰せる。一方で、route が4被弾する、fuel shots が多い、boss-rush は over する、sample timeline が長く読みにくい、rewrite の視覚記号がまだ控えめ、敵種の説明は画面内にない、人間が意図を読むか未確認、Pulse 範囲が縦射線として暗黙、LOW Pulse の意味は薄い、score が高くなりすぎる可能性、rewrite が chain relay と重なりすぎる、boss HP lock 依存は残る、弾量制御が荒い、survival も clear する、pulseHeavy も clear する、bad policy の定義再確認が必要、視認性チェックが未実施、モバイル未確認、音がない、次回比較軸が必要。

改善案30件: route damage を2以下へ下げる、rewrite fuel cap を設ける、boss-rush 専用 policy を修正する、視覚記号を強める、rewrite 対象候補を薄く表示する、LOW を小さな shield break にする、MID を主コマンドに維持する、MAX を boss rewrite に特化する、fuel shot lifetime を調整する、boss final の弾密度を減らす、route policy の避け方を改善する、人間確認用 screenshot を追加する、timeline 出力を保存型にする、README に比較表を足す、v008 候補を「Pulse Target Selection」にする、field conversion を少し弱める、rewriteFuelShots の上限監査を追加、damage 下限ではなく上限監査を追加、bad policy の clearRate を再確認、survival clear の意味を記録、pulseHeavy clear の意味を記録、boss-rush failure を hard issue に戻すか検討、UI の常時説明は増やさない、開始/リトライは現状維持、offscreenShots 0 を維持、maxEnemyStep 16 未満を維持、overlap 0 を維持、staging に残課題を書く、commit 前に status を確認、push 後 clean 確認。

採用案: Cycle 2 の「敵 path は変えず、敵の次弾と盾だけを書き換える」を採用した。v007 は敵行動コマンドの成立確認を目的にし、弾量と被弾の細部調整は次版へ残す。

## 実装内容

- `rewritten` 状態、`rewriteCd`、rewrite 系 metrics を追加した。
- Pulse が画面内の射線コマンドとして feeder / armored / anchor / escort / boss を書き換えるようにした。
- feeder は中央燃料弾、armored/anchor は盾剥がしと燃料バースト、escort は押し出し燃料、boss は fuel lane を出す。
- 書き換え済みの敵を黄色十字で表示する。
- route / marksman / aggressive / boss-rush policy が敵対象でも Pulse するようにした。
- `verify.js`, `timeline_eval.js`, `enemy_behavior_audit.js` に rewrite 指標を追加した。

## 検証

- `node verify.js`: pass
- `node timeline_eval.js`: pass
- `node enemy_behavior_audit.js`: pass
- `node wave_grammar_check.js`: pass
- `node enemy_overlap_check.js`: pass

主要結果:

- route clearRate: 1
- route meanRewrittenEnemies: 24
- route meanRewriteFuelShots: 175
- route meanRewriteKills: 19
- route meanRewriteBossPatternCount: 6
- noPulse / camper / lane-holder / blind-sweeper clearRate: 0
- offscreenShots: 0
- lingeringEnemies: 0
- maxEnemyStep: 12.75
- pairOverlaps: 0

## 懸念

route は clear するが平均 damage が 4 で、弾量はかなり強い。v007 の目的は「敵を書き換える Pulse が headless 上で主役になるか」の確認なので成立扱いにするが、次回は人間確認向けに弾量、視覚記号、boss-rush policy を整理する。
