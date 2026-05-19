# graze_log v05.2_cdx_v06 - design_log

## 対象 directive

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

> boss の削り感、BOMB を使いたくなる局面、初見クリア可能性を調整する。

Slack pending の新規 game directive は今回なし。local continuous directive を対象にした。

## 実装前判断

v05 は「boss 中に BOMB を使えば clear できる」ことを固定した。ただし boss spawn 時に gauge を満タンにしていたため、BOMB stock が stage 内の行動から生まれていない。これは検証用の補助としてはよいが、完成へ寄せるには、プレイヤーが見た行動と報酬の関係を読める必要がある。

今回は boss HP、BOMB damage、cooldown、boss phase は大きく触らない。直前の boss warning wave を倒すと BOMB gauge が大きく増え、boss に入る時点で「稼いだから BOMB がある」と読める playable diff にする。使う過去知見は、`gravity_courier_v001_success_case` の「見えるルールから入力結果を予測できる」方針と、v05 の headless boss BOMB clear 検証である。

## 設計サイクル 1: stock 直付けの違和感

良いところ/悪いところ 30 件:
1. v05 は boss BOMB clear が再現できる。
2. v05 は boss HP が短く、初見 clear へ近い。
3. BOMB は弾消しと boss damage の両方を持つ。
4. BOMB は 5-way 付与に戻っていない。
5. BOMB cooldown は連打を止めている。
6. BOMB 後 Lv3 は撃ち込み継続を残す。
7. boss phase popup は局面を読ませる。
8. ただし boss spawn 時の gauge 満タンは見えない補正に近い。
9. プレイヤーは「なぜ今 BOMB があるのか」を行動から読めない。
10. stock 直付けはテストには便利だが、ゲーム内報酬として弱い。
11. 道中で稼ぐ意味が薄く見える。
12. warning wave は boss 前の行動報酬に向いている。
13. warning wave は画面上で倒せる対象として見える。
14. warning wave に報酬を持たせると原因と結果が近い。
15. 報酬を大きくしすぎると露骨な補助になる。
16. 報酬が小さすぎると headless clear が崩れる。
17. boss HP を再調整すると問題が広がる。
18. BOMB damage を上げると即死寄りになる。
19. warning wave のみ変更なら差分が局所的になる。
20. `BOMB +N` popup は報酬を読ませやすい。
21. popup が多すぎると視覚ノイズになる。
22. eight scouts は既存の boss warning として自然に残せる。
23. scout の耐久 1 は初見でも倒せる。
24. 自動ショットなので狙いを合わせるだけで報酬が出る。
25. boss 直前に横移動を要求しすぎると事故る。
26. BOMB stock が earned なら boss 開始表示も自然になる。
27. 稼げなかった時の表示も必要。
28. `BUILD BOMB` は不足時の状態を伝えられる。
29. 完成版では報酬量を下げる余地がある。
30. 今回は playable clear 維持を優先する。

改善案 30 件:
1. `spawnBoss()` の gauge 満タン付与を削除する。
2. boss warning wave を専用関数にする。
3. warning scout に追加 gauge 報酬を持たせる。
4. 追加報酬を `BOSS_WARNING_REWARD_GAUGE` として定数化する。
5. kill 時に `BOMB +N` popup を出す。
6. boss 開始時に BOMB ready なら `BOMB STOCK EARNED` と出す。
7. boss 開始時に不足なら `BUILD BOMB` と出す。
8. title 説明を warning scout 報酬へ変更する。
9. boss HP は v05 の 44 を維持する。
10. BOMB damage は v05 の 12 を維持する。
11. cooldown は 720f を維持する。
12. brake は 120f を維持する。
13. BOMB 後 Lv3 維持を維持する。
14. final phase popup は維持する。
15. headless は source 上の直付け削除を検査する。
16. headless は boss start の `bombReady` を検査する。
17. headless は warning reward が通常 scout 報酬より大きいことを見る。
18. self-play は warning wave 中だけ撃破を優先する。
19. self-play は boss clear と BOMB 使用を引き続き見る。
20. BOMB 即死ではない範囲検査を維持する。
21. finite script の midboss 到達検査を維持する。
22. finite script の boss 到達検査を維持する。
23. boss kill clear 検査を維持する。
24. Active DEF 検査を維持する。
25. 5-way 非付与検査を維持する。
26. README を v06 用に更新する。
27. devlog に戻し手順を残す。
28. continuous directive の last_result を更新する。
29. staging に path と検証値を残す。
30. 未関係 memory 差分は commit に混ぜない。

筋の良い案:

boss warning wave に大きめの gauge 報酬を持たせ、boss spawn の直付けを削る。解決できる問題は、BOMB stock の由来が見えないこと、道中報酬が boss 判断に接続していないこと、v05 の補助輪感。新しい懸念は `BOMB +22` が露骨で、報酬設計としてはまだ荒いこと。

## 設計サイクル 2: warning wave の報酬量

良いところ/悪いところ 30 件:
1. 8 体の scout は視認しやすい。
2. scout は耐久 1 で倒しやすい。
3. 自機ショットは常時発射なので報酬条件が複雑でない。
4. 横位置を合わせる行動は自然。
5. 報酬が出ると boss 前の緊張が上がる。
6. 連続 popup は獲得感を出せる。
7. `BOMB +22` は強い報酬として伝わる。
8. 8 体全撃破なら 176 gauge になり、BOMB に届きやすい。
9. 道中の kill/graze と合わせると満タンになる。
10. 報酬が大きいので数体逃しても成立する。
11. 数体逃しても成立するのは初見に優しい。
12. 大きすぎる報酬は攻略を浅くする。
13. warning wave を倒せない人には boss が難しくなる。
14. BOMB を持てない boss も fallback 表示はある。
15. boss HP 44 は BOMB ありの clear に合っている。
16. BOMB なしでも撃ち込みで削れる余地は少しある。
17. BOMB を持てないと final phase が厳しい。
18. それにより warning wave の意味が出る。
19. 報酬が boss 直前なので記憶負荷が小さい。
20. midboss 報酬に寄せるより因果が近い。
21. 道中全体の economy 調整より差分が小さい。
22. 今回は playable diff として検証しやすい。
23. 将来は midboss 報酬と分散できる。
24. 将来は `+22` を下げて graze 供給を増やせる。
25. warning scout の並びは既存 v05 の見た目と近い。
26. 報酬付き敵の表示はまだ専用色がない。
27. popup だけだと報酬敵だと事前に分からない。
28. title 説明で補うが、画面中の予告も欲しい。
29. 今回は `BOSS WARNING - CHARGE BOMB` で予告する。
30. 説明過多にはまだ至っていない。

改善案 30 件:
1. `BOSS_WARNING_REWARD_GAUGE=22` で始める。
2. eight scout の報酬合計を 176 にする。
3. 既存 kill reward 2 も加算する。
4. 道中 graze と合わせて G_MAX へ届くようにする。
5. warning 開始 popup を追加する。
6. kill popup は短寿命にする。
7. boss popup は earned/build の状態表示にする。
8. warning scout の挙動は v05 の fan と同じにする。
9. warning scout の耐久は 1 のままにする。
10. warning scout の弾は撃たせない。
11. boss phase は触らない。
12. BOMB damage は触らない。
13. boss HP は触らない。
14. self-play では warning 中だけ撃破を優先する。
15. self-play の道中回避は v05 に近く保つ。
16. 道中 target AI を強くしすぎない。
17. headless は boss start gauge を出力する。
18. headless は warningRewardGauge を出力する。
19. headless は simpleBot の killCount を出力する。
20. headless は simpleBot の bombCount を出力する。
21. headless は simpleBot の activeDefCount を出力する。
22. headless は final phase 到達を維持する。
23. headless は BOMB boss 使用を維持する。
24. warning reward 由来の BOMB ready を合格条件にする。
25. source regex で直付け削除を守る。
26. 検証値を devlog に残す。
27. README に実行方法を残す。
28. staging に検証値を残す。
29. 次回課題に報酬量の露骨さを残す。
30. active directive は継続のままにする。

筋の良い案:

報酬量は保守的に小さくするより、まず headless と初見 clear を崩さない `+22` に置く。解決できる問題は stock 直付けと clear 不能への逆戻り。懸念は報酬量が強すぎることだが、次回の調整対象として分離できる。

## 設計サイクル 3: 検証方法

良いところ/悪いところ 30 件:
1. 直付け削除は source regex で検出できる。
2. warning reward の定数は API に expose できる。
3. boss start の gauge と bombReady は headless で見られる。
4. self-play clear は有限進行の最低保証になる。
5. self-play は人間の体感を代替しない。
6. warning 中だけ撃破優先にすると目的が明確になる。
7. 道中全体の bot を強くしすぎると検証が歪む。
8. v05 の回避寄り bot を維持する方が比較しやすい。
9. warning wave だけの target 変更は今回の仕様に対応している。
10. boss BOMB 使用回数は検査できる。
11. BOMB が final 専用でなくても boss 使用なら意味はある。
12. final phase 到達は引き続き見る。
13. bossStats の lowestHpRate は削りの補助指標になる。
14. score は補助指標になる。
15. killCount は warning 撃破の補助指標になる。
16. activeDefCount は防御操作の生存指標になる。
17. BOMB cooldown 検査は悪用防止になる。
18. BOMB brake 検査は体験核を守る。
19. 5-way 非付与検査は過去退行を防ぐ。
20. BOMB auto recharge なし検査は連打防止になる。
21. finite midboss/boss 到達は stage script を守る。
22. boss kill clear は clear 条件を守る。
23. warning reward が通常報酬より大きい検査は仕様を守る。
24. warning reward が大きすぎる検査は今回は入れない。
25. 人間の読みやすさは手動確認が残る。
26. screenshot 検証は今回は行わない。
27. browser manual は次回候補にする。
28. v06 は v05 からの局所差分として戻しやすい。
29. commit は v06 関連だけに絞る。
30. push できない場合は hash と理由を報告する。

改善案 30 件:
1. `tools/headless_graze_log_cdx_v05_2_v06_check.js` を作る。
2. HTML path を v06 に向ける。
3. `BOSS_WARNING_REWARD_GAUGE` を constants に追加する。
4. `afterBossStart.gauge` を出力する。
5. `afterBossStart.bombReady` を出力する。
6. `afterBossStart.warningRewardGauge` を出力する。
7. `bossBombStockIsEarnedByWarningWave` を追加する。
8. source regex で `spawnBoss()` の `state.gauge=G_MAX` を検出しないことを見る。
9. warningRewardGauge が 2 より大きいことを見る。
10. bossStart で bombReady が true であることを見る。
11. simpleBot の warning 中だけ target を合わせる。
12. simpleBot の道中回避は v05 に近くする。
13. simpleBot clear を必須にする。
14. simpleBot bombCount >= 1 を必須にする。
15. bossStats.enteredFinal を必須にする。
16. bossStats.bombedBoss を必須にする。
17. BOMB damage 範囲検査を維持する。
18. DEF threshold 検査を維持する。
19. cooldown 検査を維持する。
20. brake 検査を維持する。
21. no 5-way 検査を維持する。
22. finiteScriptReachesMidboss を維持する。
23. finiteScriptReachesBoss を維持する。
24. stageUsesMultipleEnemyRoles を維持する。
25. bossKillClearsStage を維持する。
26. JSON report を stdout に出す。
27. fail は process exit 1 にする。
28. pass 結果を devlog に貼る。
29. staging に command と result を残す。
30. continuous directive に last_result を残す。

筋の良い案:

検証は「起動する」ではなく、warning wave reward から BOMB stock を獲得し、boss 中に BOMB を使って clear することを合格条件にする。解決できる問題は v05 の直付け補助への回帰。懸念は self-play が warning wave の撃破を明示的に優先する点だが、今回の仕様焦点そのものなので許容する。

## 採用案

- v05 を `v05_1_cdx_v06/` にコピーして差分を作る。
- boss warning wave を専用関数にし、scout 撃破時に `BOSS_WARNING_REWARD_GAUGE=22` を追加する。
- boss spawn 時の gauge 満タン付与を削除する。
- boss 開始時は `BOMB STOCK EARNED` / `BUILD BOMB` の状態表示にする。
- headless check は v06 に向け、warning reward 由来の BOMB stock と boss BOMB clear を検証する。

## 懸念

`BOMB +22` は初見 clear を支えるには有効だが、完成版の economy としては露骨かもしれない。次回は midboss 報酬、warning scout の数、graze 供給を合わせて、同じ clear 可能性をより自然な報酬分布で作れるかを見る。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v06_check.js
```

期待:

- `spawnBoss()` は gauge を直接満タンにしない。
- boss warning wave の撃破報酬で boss 開始時に BOMB ready になる。
- self-play は boss 中に BOMB を 1 回使い、clear する。
- BOMB は 5-way を付与しない。
- BOMB cooldown / brake は維持される。
