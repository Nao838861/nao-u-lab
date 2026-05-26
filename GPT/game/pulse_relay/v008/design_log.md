# Pulse Relay v008 設計ログ

## 対象指示

`memory/slack_directives.jsonl` の `log-cdx-1779803838-9a7a0375f3` を対象にした。原文:

> log_cdx、最近やっていたヘッドレスプレイの研究で得られた知見を詳しくslackに書いて。graze_log_cdxの制作はもう止めていい。pulse_replayの改善ができないか考えてみて。v07は分かりにくいのでv05あたりからやり直してv08を作って、そこから引き続き、ゲームを遊ぶ感覚が変わるレベルの改善を色々試してみて、筋の良いものを見つけてみて。評価にはヘッドレスの知見を活かして。

## 実装前判断

既存の `v008` は v007 の「敵を書き換えて味方化し、自機との tether で敵弾を変換する」発想だった。しかし今回の原文は「v07 は分かりにくいので v05 あたりからやり直す」なので、v007 系の敵支配を続けず、`v005` の `Resonance Field / Chain Relay` へ戻した。

採用した新仕様は `Relay Lane`。Pulse を押すと、円形 Pulse と短時間の Resonance Field に加えて、自機の x 座標へ縦の黄色い変換レーンが残る。プレイヤーは Pulse 後に自機の横位置を選び、敵弾の列へレーンを通す。敵を味方化する複雑さは捨て、遊ぶ感覚を「弾を円で消す」から「自機位置で変換ラインを置く」へ変える。

使った過去知見:

- `memory/game_design_rules.md`: 見えるルールから入力結果を予測できること。説明で支えないこと。
- `memory/game_memory_task_lens_index.md`: route / camper / lane-holder / blind-sweeper / noPulse を分けて、悪い方針を平均点へ混ぜないこと。
- `memory/game_special_system_hud_affordance_lesson_20260525.md`: 特殊システムは常時説明文ではなく対象物側・画面内記号で教えること。
- `memory/game_supervised_delta_autonomous_creation_lesson_20260525.md`: 「分かりにくい」を UI 要約で処理せず、Codex が外した設計判断として原文から戻すこと。
- `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`: headless は楽しさを直接判定せず、coverage / pressure / movement / policy split / bad-policy failure を比較証拠にすること。

## 設計サイクル

### Cycle 1

良いところ/悪いところ30件: 1. v005 は Pulse 成功が攻撃へつながる。2. Field が画面に残る。3. Chain Relay が敵処理になる。4. noPulse が弱い。5. camper が弱い。6. 敵 wave が手作り。7. ボスまで finite stage がある。8. HUD が軽い。9. Space が開始/特殊/リトライを兼ねる。10. 指標が揃っている。11. ただし円 Pulse は「近くの弾を消す」に戻りやすい。12. Pulse 後の自機位置の意味が薄い。13. Field は円なので移動計画にしにくい。14. v007 は敵書き換えが複雑。15. tether は線の意味が伝わる前に情報量が増える。16. 味方化敵の理解が必要。17. 弾量が増えると黄色が過多になる。18. 「どの敵を選ぶか」と「どこを動くか」が同時に重い。19. v05 由来の良さを捨てすぎる。20. v08 既存案は今回指示と逆向き。21. lane-holder 対策は維持したい。22. blind-sweeper は雑な移動検査に使える。23. route は authored block を通るべき。24. score だけを見ない。25. boss-rush は参考にする。26. Pulse whiff は避ける。27. 画面外射撃は禁止。28. 敵の不自然な重なりは禁止。29. 過剰説明は禁止。30. プレイヤーの横移動が変わる案が必要。

改善案30件: 1. Pulse 後に縦レーンを残す。2. レーンを敵弾へ通す。3. レーン幅を狭くする。4. レーンを黄色く描く。5. Field は残す。6. Chain Relay は残す。7. 敵支配は外す。8. tether は外す。9. `laneConversions` を測る。10. `laneActiveTime` を測る。11. route はレーンを活かす。12. camper はレーンを作れない。13. lane-holder は低出力にする。14. blind-sweeper は fail を要求する。15. noPulse は fail を要求する。16. pulseHeavy は参考扱い。17. boss-rush は参考扱い。18. README を v005 起点へ書き直す。19. design_log に今回原文を残す。20. headless wrapper を維持する。21. timeline に lane 指標を足す。22. enemy audit に lane 指標を足す。23. verify に lane 下限を足す。24. 既存 v007 系説明を消す。25. HUD に長文を足さない。26. レーン描画は敵より前に出す。27. 変換粒子を別色にする。28. route clear を維持する。29. offscreenShots 0 を維持する。30. overlap 0 を維持する。

筋の良い案: `Relay Lane`。解決できる問題は、v007 の分かりにくさを避けつつ、Pulse 後の自機位置に意味を持たせること。懸念は、レーンが強すぎると survival / pulseHeavy のような雑な方針も clear すること。

### Cycle 2

良いところ/悪いところ30件: 1. 縦レーンは画面上で読める。2. 自機 x と効果が一致する。3. Field と意味が重なりすぎない。4. v005 の敵リアクションを壊さない。5. 実装範囲が小さい。6. headless 指標化しやすい。7. lane conversion が主役指標になる。8. 敵支配より入力結果が単純。9. route の左右切り替えと相性が良い。10. ボス戦でも燃料を拾える。11. ただし縦一列だけだと強すぎる可能性。12. 幅が広いと自動変換になる。13. Field と lane の二重変換で火力が上がる。14. survival が clear する可能性。15. pulseHeavy が強くなる可能性。16. lane-holder が少し使える可能性。17. レーンが長すぎると画面がうるさい。18. レーンが短すぎると読めない。19. route policy が v005 のままだと lane を狙い切らない。20. 目視確認はまだない。21. 音はない。22. モバイル確認はない。23. score が上がりやすい。24. fieldConversions が下がりすぎると v005 の良さを失う。25. chainHits が下がると派生攻撃が弱い。26. pulseWhiffs が増えると特殊入力が腐る。27. boss 早解きが強すぎると山が薄い。28. noPulse との差は必要。29. camper との差は必要。30. blind-sweeper との差は必要。

改善案30件: 1. レーン幅は 24px half にする。2. レーン時間は 1.18 秒にする。3. Field は 0.72 秒のままにする。4. レーンは画面上部から下部まで描く。5. 下端直近は対象外にする。6. レーン変換は `originKind: lane` にする。7. 変換弾は通常 relay と同じ誘導にする。8. resonance は弾の source 敵へ返す。9. `laneConversions` を snapshot に入れる。10. `laneActiveTime` を snapshot に入れる。11. timeline aggregate に平均を出す。12. hard 条件は route laneConversions 25 以上。13. laneActiveTime 6 秒以上。14. verify は run ごとに 18 以上。15. audit は 25 以上。16. README は評価値を更新。17. timeline result は生成物なので commit しない。18. root headless wrapper は維持。19. `PulseRelayV008` へ global 名を直す。20. index/style は v005 ベースで軽く保つ。21. draw は field の次に lane。22. particle は `laneConvert` を黄色にする。23. bad policy clear は hard に維持。24. survival clear は懸念として記録。25. pulseHeavy clear は懸念として記録。26. boss-rush clear は参考として記録。27. Slack には headless 知見も書く。28. graze_log_cdx は停止 directive にする。29. slack_directive は handled にする。30. staging に commit と検証を残す。

筋の良い案: レーンを「防御壁」ではなく「次の攻撃の導火線」にする。解決できる問題は、押した瞬間だけでなく Pulse 後の 1 秒に移動判断が生まれること。懸念は、移動せずとも敵弾が通ってしまう場面があること。

### Cycle 3

良いところ/悪いところ30件: 1. v005 へ戻った判断が原文と合う。2. v007 の複雑な敵支配を捨てた。3. レーンは黄色い縦帯として見える。4. route は clear。5. camper は fail。6. lane-holder は fail。7. blind-sweeper は fail。8. noPulse は fail。9. route laneConversions は 69。10. laneActiveTime は 17.67。11. fieldConversions は 54。12. resonantEnemies は 172。13. chainHits は 40。14. pulseWhiffs は 0。15. offscreenShots は 0。16. lingeringEnemies は 0。17. maxEnemyStep は 12.52。18. pairOverlaps は 0。19. damage は 0。20. score 差が見える。21. ただし survival は clear。22. pulseHeavy は clear。23. boss-rush は clear。24. aggressive は clear。25. レーン火力は強い。26. route と marksman が同じ結果。27. 人間目視は未確認。28. 音がない。29. レーン幅は仮。30. 次は route と雑な高頻度 Pulse の質差を詰める。

採用案: `Relay Lane` を v008 として固定する。v008 の目的は完成ではなく、「v005 へ戻しつつ、遊ぶ感覚が変わる改善を playable 化し、headless で bad-policy 分離を確認する」こと。

## 実装内容

- `v008` を `v005` ベースへ戻した。
- Pulse 時に `relayLanes` を生成するようにした。
- 敵弾が Relay Lane を横切ると relay 弾へ変換されるようにした。
- `laneConversions` / `laneActiveTime` を metrics / snapshot / timeline aggregate / verify / audit に追加した。
- Relay Lane と lane 変換粒子を描画した。
- 既存 v008 の v007/tether 説明を README と design_log から外した。
- `tools/headless_pulse_relay_v008_check.js` は維持し、v008 内の検証をまとめて実行する。

## 検証

- `node verify.js`: pass
- `node timeline_eval.js`: pass
- `node enemy_behavior_audit.js`: pass
- `node wave_grammar_check.js`: pass
- `node enemy_overlap_check.js`: pass
- `node tools/headless_pulse_relay_v008_check.js`: pass

主要結果:

- route clearRate: 1
- route meanConverted: 173
- route meanFieldConversions: 54
- route meanLaneConversions: 69
- route meanLaneActiveTime: 17.67
- route meanResonantEnemies: 172
- route meanChainHits: 40
- route meanDamage: 0
- camper / lane-holder / blind-sweeper / noPulse clearRate: 0
- offscreenShots: 0
- lingeringEnemies: 0
- maxEnemyStep: 12.52
- pairOverlaps: 0

## 懸念

`survival`, `pulseHeavy`, `boss-rush` は clear する。これは今回 hard fail にしていないが、次に「良い route と雑な Pulse 多用の質差」を見る必要がある。v008 では v007 の分かりにくさから戻し、Pulse 後の位置取りが生まれる playable diff を作ることを優先した。
