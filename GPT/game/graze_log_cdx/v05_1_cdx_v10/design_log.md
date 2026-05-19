# graze_log v05.2_cdx_v10 - design_log

## 対象 directive

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

今回 Slack pending の新規 game directive はなし。local continuous directive を対象にした。

## 実装前判断

v09 は既存STGの文法を取り入れ、Ikaruga 風の開幕隊列、Gradius 風の hatch / volcano、Touhou 風の S-stream、DonPachi 風の bunker / heavy tank / 部位 boss を短いステージ台本に圧縮した。一方で focused headless の simpleBot は final cue を見て clear していたが、`bombCount=0` のままだった。これは「BOMB を使いたくなる局面」の検証として弱い。

今回は v09 を `v05_1_cdx_v10/` にコピーし、ステージ構成は維持したまま boss warning を明確な break/top-off wave にする。検証も `simpleBotUsesFinalBomb` を追加し、final cue 後に BOMB を実際に使って clear することを必須にする。

使う知見:

- `memory/game_design_rules.md`: 見えているルールから入力結果を予測できること。BOMB stock があるだけでなく、使う理由を画面上で読める必要がある。
- `game_memory_task_lens_index.md` の `Playable / Headless 評価`: 起動確認ではなく playable 条件を見る。
- `Balance / Rule Space`: 報酬分散を壊さず、boss warning の役割を「直前 top-off」として明確化する。

## 設計サイクル 1: v09 の良いところ/悪いところ

良いところ/悪いところ 30 件:

1. v09 は散発 spawn からステージ台本へ移った。
2. 開幕隊列が短い群れとして読める。
3. hatch lane は地形代替として機能する。
4. S-stream は弾の由来が見える。
5. volcano midboss は節目になる。
6. bunker は開閉により撃つタイミングを作る。
7. heavy tank は高HP中ボスとして読める。
8. boss parts は単一 core 直撃だけではない構成にした。
9. v08 の final charge / BOMB NOW は維持されている。
10. headless は stage grammar を見ている。
11. ただし simpleBot は final cue を見ても BOMB を使っていない。
12. `simpleBotClearsAndSeesFinalCue` だけでは BOMB の意味を保証しない。
13. boss warning の報酬は存在するが、simpleBot 経路では stock が安定しない。
14. warning wave 前の残敵が照準を散らす可能性がある。
15. warning scout が横に広すぎると撃破数が安定しない。
16. warning scout が速いと top-off になる前に流れる。
17. boss start で直接 `state.gauge=G_MAX` は避けるべき。
18. midboss reward より warning reward を大きくすると道中報酬の意味が薄れる。
19. 直前 break は既存STGの boss 前休憩として自然。
20. bullet clear はすでに warning で行っている。
21. enemy clear も warning break の一部として妥当。
22. boss parts だけ残す filter は既存 boss spawn と整合する。
23. warning scout を中央寄せにすると simpleBot が撃ちやすい。
24. warning scout を遅くするとプレイヤーにも撃破意図が見える。
25. scout の reward 値は 34 のままでよい。
26. scout 数を 8 から 10 に増やすと失敗余地が減る。
27. BOMB 必須ではなく、BOMB を持っていれば押したくなる形がよい。
28. headless で BOMB 使用を必須にしても、人間体感の代替ではない。
29. ただし今回の focused check としては必要。
30. v09 の大きな構成は壊さず、warning と検証だけ触るのが筋がよい。

改善案 30 件:

1. v09 を v10 にコピーする。
2. title を v10 に更新する。
3. `spawnBossWarning()` で enemy を break として整理する。
4. `state.enemies=state.enemies.filter(e=>e.type==='bossPart')` を warning に入れる。
5. warning scout を 8 から 10 に増やす。
6. warning scout を中央寄せにする。
7. warning scout の `vy` を 1.22 に落とす。
8. warning scout の `y` を少しずつずらす。
9. warning scout の `r` を 10 にする。
10. reward constant は 34 のまま維持する。
11. MIDBOSS reward 36 も維持する。
12. boss spawn の direct gauge 付与は入れない。
13. BOMB damage は維持する。
14. boss HP は維持する。
15. final cue frames は維持する。
16. BOMB cooldown / brake は維持する。
17. `BOSS WARNING - EARN BOMB` と表示する。
18. headless path を v10 にする。
19. simpleBot report に `simpleBotUsesFinalBomb` を追加する。
20. `bombCount >= 1` を必須にする。
21. `bossStats.bombedFinal` を必須にする。
22. `bossStats.bombedBoss` を必須にする。
23. 既存の stage grammar 検査を維持する。
24. 既存の reward distribution 検査を維持する。
25. 既存の BOMB 悪用不可検査を維持する。
26. README に v10 の狙いを書く。
27. devlog に headless 結果を残す。
28. directive の last_result を v10 にする。
29. staging に path / verification / 残課題を書く。
30. v09 は未コミットの既存差分なので、今回 commit には v10 だけを含める。

筋の良い案:

boss warning を「残敵整理 + 中央寄せ slow scout + reward」の break/top-off wave にする。解決できる問題は、BOMB stock が boss final cue と機械的につながっていなかったこと。新しい懸念は warning wave が少し親切すぎることだが、これは初見 clear 可能性を優先する焦点に合う。

## 設計サイクル 2: BOMB handoff の強度

良いところ/悪いところ 30 件:

1. warning で残敵を消すと boss 前の意図が明確になる。
2. 残敵を消しすぎると stage の連続感は弱まる。
3. boss 前 break はSTG文法として自然。
4. scout 10 機は撃破の取りこぼしに強い。
5. 10 機すべて reward ありは top-off として明確。
6. reward 値 34 は midboss 36 より低い。
7. midboss の節目報酬を上書きしない。
8. direct gauge 付与ではない。
9. 撃てば stock が増えるという可視ルールを保てる。
10. 中央寄せは player shot の自然な軸に合う。
11. slow scout は初見でも撃つ余裕がある。
12. scout の弾はないため直前事故を増やさない。
13. boss warning text は短くて読める。
14. `EARN BOMB` は `TOP OFF` より行動が明確。
15. ただし英語 cue が直接的すぎる懸念は残る。
16. final の `BOMB NOW` と文言がつながる。
17. warning で BOMB を作り、final で使う構造になる。
18. BOMB を使わない clear も人間には残る可能性がある。
19. headless は BOMB 使用経路を固定する。
20. BOMB 使用後の gauge が LV3 に戻る検査は維持される。
21. BOMB cooldown 検査も維持される。
22. BOMB brake 検査も維持される。
23. BOMB 5-way 付与禁止も維持される。
24. warning wave の検査は existing regex と afterBossStart で見る。
25. simpleBot は final cue 後にのみ BOMB を優先する。
26. emergency BOMB は boss 前にも残る。
27. 今回の main path は cue 後 BOMB。
28. v10 で clear time は短くなる可能性がある。
29. clear time 一致は見ない。
30. BOMB handoff の有無だけを見る。

改善案 30 件:

1. `simpleBotUsesFinalBomb` を追加する。
2. `simpleBot.bombCount >= 1` を見る。
3. `bossStats.bombedFinal` を見る。
4. `bossStats.bombedBoss` を見る。
5. final cue source 検査は維持する。
6. stage grammar source 検査は維持する。
7. afterBossStart の `bombReady` を維持する。
8. warning reward upper bound 40 を維持する。
9. `MIDBOSS_REWARD_GAUGE > BOSS_WARNING_REWARD_GAUGE` を維持する。
10. boss direct stock regex を維持する。
11. simpleBot target logic は変更しない。
12. ゲーム側の warning wave を変えて検証を通す。
13. bot のご都合変更で通すのを避ける。
14. browser manual の残課題を残す。
15. BOMB なし回避可能性は次回候補に残す。
16. warning wave の演出は過度に増やさない。
17. boss warning の bullet clear は維持する。
18. enemy filter は warning のみ。
19. boss spawn の enemy filter は維持する。
20. title line に v10 を出す。
21. README の focused check command を v10 にする。
22. devlog に pass report の要点を書く。
23. design_log には v09 の問題を具体的に残す。
24. directive active は維持する。
25. last_result だけ更新する。
26. staging は Game Start セクションへ追記する。
27. commit は game prefix にする。
28. push 後 status を確認する。
29. v09 未コミットは今回 stage しない。
30. 次回は手動/ブラウザ体感へ進める。

筋の良い案:

bot を賢くするのではなく、ゲーム側の warning wave を読みやすくする。解決できる問題は、検証のためだけの bot 条件に寄ることを避け、実際のプレイヤーにも boss 前の「BOMB を作る」時間が見えること。懸念は break が露骨になることだが、boss 前 break は既存STG文法として許容できる。

## 設計サイクル 3: 検証

良いところ/悪いところ 30 件:

1. headless は v10 path を読む。
2. 起動だけでなく self-play clear を見る。
3. stage grammar を引き続き見る。
4. boss 到達を見る。
5. boss kill clear を見る。
6. midboss 到達を見る。
7. boss start で BOMB ready を見る。
8. direct gauge 付与がないことを見る。
9. final charge を見る。
10. final cue を見る。
11. final cue 後 BOMB を見る。
12. BOMB が boss に使われたことを見る。
13. BOMB 使用後 clear したことを見る。
14. BOMB damage が instant kill でないことを見る。
15. BOMB cooldown を見る。
16. BOMB brake を見る。
17. BOMB が 5-way を付与しないことを見る。
18. Active DEF threshold を見る。
19. no auto recharge を見る。
20. warning reward constant を見る。
21. simpleBot の clear time は固定条件にしない。
22. score も固定しない。
23. killCount は参考値に留める。
24. random seed は 12345。
25. VM 実行で canvas 依存を stub する。
26. human feel はまだ測れない。
27. ただし v09 より BOMB handoff の検証は強い。
28. 手動体感で warning が露骨すぎるかを見る必要がある。
29. BOMB なし回避可能性は別評価。
30. このサイクルでは playable diff と focused evaluation を達成する。

改善案 30 件:

1. `node tools\headless_graze_log_cdx_v05_2_v10_check.js` を実行する。
2. report に `simpleBotUsesFinalBomb: true` を出す。
3. report に `bombCount: 1` を出す。
4. report に `bossStats.bombedFinal: true` を出す。
5. report に `bossStats.bombedBoss: true` を出す。
6. report に `mode: clear` を出す。
7. `bossBombStockIsEarnedByWarningWave: true` を維持する。
8. `stageScriptUsesResearchedGrammar: true` を維持する。
9. `finalBombCueIsTelegraphed: true` を維持する。
10. `bombDamageIsMeaningfulButNotInstant: true` を維持する。
11. `finiteScriptReachesBoss: true` を維持する。
12. `finiteScriptReachesMidboss: true` を維持する。
13. README にコマンドを残す。
14. devlog に結果を残す。
15. design_log に判断を残す。
16. directive に last_result を残す。
17. staging に verification を残す。
18. git status で対象差分を見る。
19. v10 関連だけ stage する。
20. continuous directive と staging を stage する。
21. v09 未コミットは stage しない。
22. unrelated memory/log 差分は stage しない。
23. commit hash を控える。
24. push する。
25. push 後 clean/ahead behind を見る。
26. push できない場合は hash と原因を報告する。
27. 次回候補は browser/manual。
28. BOMB 文言を弱めるかは次回判定。
29. warning reward の過親切さも次回判定。
30. 完成/停止指示がないので directive active は維持する。

筋の良い案:

検証条件を「見た」から「使った」へ上げる。解決できる問題は、v09 の false positive 的な pass。新しい懸念は headless が BOMB 使用を固定しすぎることだが、これは human feel の検証ではなく BOMB handoff の focused check なので妥当。

## 採用案

- v09 を `v05_1_cdx_v10/` にコピーする。
- boss warning で残敵を整理し、中央寄せの slow scout 10 機を出す。
- warning scout の reward は 34 のまま維持し、boss spawn での direct gauge 付与はしない。
- headless に `simpleBotUsesFinalBomb` を追加し、final cue 後 BOMB clear を必須化する。

## 懸念

warning wave が「親切な補給」に見えすぎる可能性がある。今回は初見 clear 可能性と BOMB handoff の確実性を優先した。次回はブラウザで、boss 前 break が自然な緊張緩和に見えるか、露骨な接待に見えるかを確認する。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v10_check.js
```

期待:

- researched stage grammar が維持される。
- boss warning 由来で BOMB ready になる。
- simpleBot が final cue を見て BOMB を使う。
- BOMB 使用後に clear する。
