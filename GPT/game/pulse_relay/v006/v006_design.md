# Pulse Relay v006 設計書

## 対象指示原文

> log_cdx、直接指示をしたが、次以降のサイクルは直接指示でやった、 今後の自律サイクルで、pulse_relay の改善を進めて。まずv005で、pulseの良さを最大限に引き出す形でpulse自信の仕様や、それに対する敵のリアクションを変えて、ヘッドレスで測定して良くなるアイデアを煮詰めてみて。このとき、やるべきことは細かいUIの改善や微小なパラメータの調整などではなく、pulse的な仕様をシューティングゲームに足すとしたらどんな形が一番良いのか？を大胆に考えて色々試してみて。ある程度固まったら、v006、v007と別の発想で大きくゲーム性が変わるようなものも含めて、いろんなアイデアを共作してその中からいいものを拾い出せるような工夫をしてみて。1サイクルで設計書を書いて設計を満たすまで続ける、というそれぞれのバージョンの最初にやったような、長時間サイクルで慣性系までもっていってヘッドレス評価を何ループも回して完成させて。 の指示に従って。

## 実装前判断

v005 は `Resonance Field / Enemy Resonance / Chain Relay` が成立し、route は clear、noPulse/camper/lane-holder/blind-sweeper は clear しない状態になった。次の版で同じ延長を少し強くしても、指示の「別の発想で大きくゲーム性が変わる」には届かない。

v006 では Pulse をクールダウン制の反射ボタンから、危険に近づいて溜める stock/charge 経済へ切り替える。狙いは「近づく、溜める、最大 Pulse を吐く」という慣性を作ること。v005 の良さである敵リアクションと Chain Relay は残すが、発動条件を変えて、最大 Pulse だけが共鳴場を大きく残すようにした。

## 設計サイクル 1: v005 の読み直し

良いところ/悪いところ 30件:
1. Pulse が防御ではなく敵処理へ接続している。
2. 共鳴場に後入りした弾が変換される。
3. 敵が共鳴して燃料弾を返す。
4. Chain Relay で横の敵へ届く。
5. route は clear できる。
6. noPulse は clear しない。
7. camper は clear しない。
8. lane-holder は clear しない。
9. blind-sweeper は clear しない。
10. pulseWhiffs が 0 で、空振り問題は減った。
11. fieldConversions が出ている。
12. resonantEnemies が出ている。
13. chainHits が出ている。
14. ボス山場にも Pulse が関与している。
15. offscreenShots がない。
16. lingeringEnemies がない。
17. 不自然な敵ジャンプがない。
18. ただし「溜める」判断はまだない。
19. 押せるなら押す、になりやすい。
20. 危険へ近づく理由が薄い。
21. Pulse の強さがプレイヤーの事前行動で変わらない。
22. 最大の山場がシステム上明示されない。
23. 中量と最大の意思決定差がない。
24. route bot が「いつ吐くか」を学ぶ余地が小さい。
25. survival policy でも Pulse 成果を得やすい。
26. 敵弾密度の意味が「変換材料」に寄りすぎる。
27. 近接回避が得点や能力へ直結しない。
28. UI 説明を増やさずに状態を伝える必要がある。
29. 最大 Pulse の快感を検証指標に分けて出す必要がある。
30. v006 は数値調整ではなく発動経済を変えるべき。

改善案 30件:
1. 近接回避で charge を得る。
2. 被弾しない距離帯ほど charge を大きくする。
3. charge 低では小 Pulse。
4. charge 中では従来に近い Pulse。
5. charge 高では最大 Pulse。
6. 最大 Pulse だけ共鳴場を大きくする。
7. 最大 Pulse だけ Relay ダメージを上げる。
8. 最大 Pulse だけ盾剥がしを強くする。
9. 最大 Pulse だけ敵共鳴時間を伸ばす。
10. 低 Pulse は防御寄りで Chain を弱くする。
11. 中 Pulse は通常 Relay。
12. route policy は最大まで溜める。
13. pulseHeavy policy は低 Pulse 連打を検査する。
14. noPulse は charge が溜まっても使わない検査にする。
15. camper は下端で charge を得にくくする。
16. CHARGE HUD を既存 HUD に最小追加する。
17. pulseCd 表示ではなく charge bar を出す。
18. 近接回避で chargeFlash を短く出す。
19. nearMissCharge を metric にする。
20. spentCharge を metric にする。
21. low/mid/max Pulse count を metric にする。
22. verify は最大 Pulse の mechanic check を持つ。
23. timeline は route の maxPulseCount を hard gate にする。
24. enemy audit は charge 経済も見る。
25. boss-rush は最大 Pulse 以外も許容して比較する。
26. 最大 Pulse が強すぎてボス瞬殺しないよう phase lock は維持する。
27. 既存 wave は維持し、操作経済だけを変える。
28. v007 候補は別発想として残す。
29. 文書は v006 として独立させる。
30. staging に v005 成立と v006 差分を併記する。

筋の良い案: `Charge -> Max Pulse -> Resonance Field`。近接回避で溜めるため、敵弾が単なる危険ではなく資源になる。懸念は最大まで待つと退屈になること、また最大 Pulse が強すぎてボスを短縮しすぎること。

## 設計サイクル 2: headless 方針

良いところ/悪いところ 30件:
1. clearRate だけでは charge 経済を測れない。
2. noPulse failure は必要だが十分ではない。
3. maxPulseCount がないと v006 の主題が消える。
4. spentCharge がないと発動量が見えない。
5. nearMissCharge がないと危険へ近づいた証拠がない。
6. lowPulseCount は低連打 dominant の検査になる。
7. midPulseCount は中途半端な連打の検査になる。
8. maxPulseCount は山場の検査になる。
9. route が maxPulse だけを使うと主題が見える。
10. pulseHeavy が低連打を代表する。
11. survival は下端寄りの低リスク検査になる。
12. camper は Pulse を使わない下端検査になる。
13. lane-holder は中央固定検査になる。
14. blind-sweeper は雑な横往復検査になる。
15. boss-rush はボス短縮検査になる。
16. routeCoverage は維持する。
17. pressurePct は維持する。
18. deadlinePressurePct は維持する。
19. bossPressurePct は維持する。
20. offscreenShots は維持する。
21. lingeringEnemies は維持する。
22. maxEnemyStep は維持する。
23. pulseWhiffs は維持する。
24. fieldConversions は最大 Pulse の結果として維持する。
25. resonantEnemies は敵リアクションの証拠として維持する。
26. chainHits は処理力の証拠として維持する。
27. relayKills は強すぎ/弱すぎの補助に使う。
28. score は bad policy 比較に使う。
29. damageTaken は route の安定性に使う。
30. sampleTimeline は人間確認用の補助に留める。

改善案 30件:
1. `pulseReady(game, minCharge)` を追加する。
2. route/marksman は HIGH まで待つ。
3. aggressive も HIGH まで待つ。
4. survival は LOW でも使う。
5. pulseHeavy は LOW で連打する。
6. boss-rush は MID 以上にする。
7. timeline aggregate に charge metrics を追加する。
8. hard gate に nearMissCharge を入れる。
9. hard gate に spentCharge を入れる。
10. hard gate に maxPulseCount を入れる。
11. v005 の文言を v006 へ置き換える。
12. verify の mechanicCheck は player charge を 100 にする。
13. mechanicCheck は maxPulseCount を見る。
14. enemy_behavior_audit も maxPulseCount を見る。
15. low Pulse 連打が clear しても score 比較で見る。
16. camper が charge を溜めても使わないことを見る。
17. noPulse が bossReach しても clear しないことを見る。
18. lane-holder が bossReach しても clear しないことを見る。
19. blind-sweeper の clear failure を見る。
20. route meanBossSeconds が短すぎないことを見る。
21. boss-rush の bossSeconds も見る。
22. max Pulse が 1 回だけでなく複数回出ることを見る。
23. pulseWhiffs は 1 以下にする。
24. fieldConversions は 16 以上にする。
25. resonantEnemies は 24 以上にする。
26. chainHits は 8 以上にする。
27. route pressure は 0.25 以上を維持する。
28. boss pressure は 0.45 以上を維持する。
29. bad policy clearRate は route より低くする。
30. headless 結果を README に数字で残す。

筋の良い案: route と pulseHeavy を分け、最大 Pulse 方針と低連打方針を同じ版で比較する。懸念は headless policy が人工的になることだが、v006 の問いは「溜めて吐く価値が出るか」なので、policy を分けること自体が検証になる。

## 設計サイクル 3: 実装判断

良いところ/悪いところ 30件:
1. 既存 v005 の wave は十分に検査済み。
2. wave を同時に変えると charge 経済の効果が読みにくい。
3. 敵リアクションは v005 の強みなので残す。
4. Chain Relay も残す。
5. cooldown は完全撤廃せず短い recovery として残す。
6. charge は初期 32 にして序盤無力化を避ける。
7. LOW は 26 にする。
8. MID は 56 にする。
9. HIGH は 88 にする。
10. max charge は 100 にする。
11. 近接 radius は 112 にする。
12. danger radius は 64 にする。
13. danger 内は獲得量を大きくする。
14. field は LOW では出さない。
15. MID field は小さく短い。
16. MAX field は大きく長い。
17. MAX は Relay damage を少し上げる。
18. MAX は resonance duration を伸ばす。
19. MAX は shield 剥がしを強くする。
20. 低 Pulse でも緊急防御にはなる。
21. max Pulse は敵リアクションを強くする。
22. HUD は CHARGE 数値と bar だけにする。
23. 常時説明文は増やさない。
24. title/retry は既存 Space 導線を維持する。
25. module export は v006 にする。
26. root 名も `PulseRelayV006` にする。
27. README は v006 として書き換える。
28. design_log は旧 v001 コピーを残さず v006 に置き換える。
29. pending directive は handled にする。
30. staging に path / verification / commit を残す。

改善案 30件:
1. `updatePulseCharge()` を追加する。
2. bullet distance で charge を加算する。
3. closing speed を少し加味する。
4. actual gain を metric に積む。
5. pulse 発動時に tier を決める。
6. radius を tier で変える。
7. cost を tier で変える。
8. fieldScale を tier で変える。
9. pulseCd を tier で変える。
10. spentCharge を metric に積む。
11. low/mid/max count を metric に積む。
12. maxPulse relay damage を増やす。
13. activateResonance に tier を渡す。
14. field conversion でも field.tier を渡す。
15. snapshot に charge metrics を出す。
16. drawPlayer の ring を charge 連動にする。
17. drawHud の bar を charge 連動にする。
18. verify の mechanicCheck を最大 Pulse にする。
19. timeline の route を HIGH 方針にする。
20. enemy audit に charge gate を入れる。
21. README に検証数字を載せる。
22. v006_design に意図を残す。
23. design_log に結果と残課題を残す。
24. old v005_design は削除する。
25. v005 の良い部分は README で継承として説明する。
26. v006 の悪い policy 結果も書く。
27. `autonomous_cycle_plan.md` に v006 結果を追記する。
28. slack_directives を handled にする。
29. cycle staging に追記する。
30. git commit/push する。

採用案: 既存ステージを維持し、Pulse の経済だけを `charge -> max Pulse` へ変える。複数問題を同時に解ける理由は、危険の意味、発動タイミング、敵リアクション、headless 評価軸を同じ `charge` に束ねられるため。新しい懸念は、最大 Pulse を待つ route が人間には保守的に見える可能性で、次版では v007 の「敵行動書き換え」と比較する。

## 検証結果

`node verify.js`: pass。

- route 3 run すべて clear。
- `nearMissCharge: 676.55`
- `spentCharge: 704`
- `maxPulseCount: 8`
- `converted: 141`
- `fieldConversions: 48`
- `resonantEnemies: 77`
- `chainHits: 26`
- `pulseWhiffs: 0`

`node timeline_eval.js`: pass。

- route clearRate: 1
- route meanNearMissCharge: 676.55
- route meanSpentCharge: 704
- route meanMaxPulseCount: 8
- noPulse clearRate: 0
- camper clearRate: 0
- lane-holder clearRate: 0
- blind-sweeper clearRate: 0

`node enemy_behavior_audit.js`: pass。

- `offscreenShots: 0`
- `lingeringEnemies: 0`
- `maxEnemyStep: 12.52`
- `relayKills: 47`
- `pulseWhiffs: 0`

## 残課題

v006 は「溜めて最大 Pulse を吐く」慣性は作れたが、route は最大 Pulse だけを使うため、低/MID Pulse の人間的な使い分けはまだ弱い。v007 では計画書どおり、Pulse を敵行動モードを書き換えるコマンドにして、敵弾が少ない秒でも Pulse 対象選択が意味を持つかを試す。
