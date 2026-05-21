# graze_log v05.2_cdx_v39 design_log

## 対象 directive

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の active 指示を対象にした。Slack direct pending はなし。

原文:

> v38 の simple bot は clear し、BOMB も使用する。次は人間プレイで、`shield break -> relay -> side route` の順序が「relay を倒すと次の route が開く」と読めるか、またはまだ敵追加に見えるかを確認する。

## 実装前判断

人間プレイ確認は headless では代替しない。ただし v38 の画面因果は「relay を倒すと route が開く」まで進んだ一方、relay 生存中に route 側の未開放状態が見えないため、relay がまだ追加敵に見える余地がある。今回は敵数・火力・BOMB・boss を触らず、relay 生存中だけ左右 route のロック予告を薄く見せ、撃破時にその予告が unlock particle と connector に変わる playable diff にする。

使う過去知見:

- `Feedback / Rights / Human Judgment`: 説明文ではなく、人間が画面上の因果を自然に読めるようにする。
- `Playable / Headless 評価`: preview と unlock が発火したことだけを flag で検査し、面白さ判定と分ける。
- `Balance / Rule Space`: 小さな数値調整ではなく、side route の読ませ方を構造として変える。

## 設計サイクル 1

良いところ / 悪いところ:

1. 良い: v38 は side route の即時出現を止めた。
2. 良い: relay 撃破が route 開放 trigger になった。
3. 良い: bot clear と BOMB 使用は維持されている。
4. 良い: shield cue は v36 以降の資産を使えている。
5. 良い: `relayOpensSideRoute` は検査可能。
6. 悪い: relay 生存中に side route の未開放状態が見えない。
7. 悪い: relay が still 追加敵に見える可能性がある。
8. 悪い: popup だけを増やすと説明に寄る。
9. 悪い: route 開放後だけ見ても、事前の期待が弱い。
10. 悪い: headless は視線誘導を評価しない。
11. 良い: locked preview なら「開く前」を見せられる。
12. 良い: relay と side route の線で因果を作れる。
13. 良い: 錠形マーカーは敵ではないことを示しやすい。
14. 悪い: マーカーが UI 記号に見えすぎる危険がある。
15. 悪い: 線が弾幕の読みを邪魔する可能性がある。
16. 良い: 薄い alpha なら邪魔を抑えられる。
17. 良い: route preview は relay 生存中だけで済む。
18. 悪い: preview が強すぎると次行動を指示しすぎる。
19. 良い: side connector 数は増やさない。
20. 良い: chain window は変えない。
21. 良い: shield armor は変えない。
22. 良い: BOMB final cue は変えない。
23. 悪い: visual-only 変更なので体感差が弱い可能性。
24. 良い: ただし今回の焦点は読解なので visual causal diff が適切。
25. 悪い: v38 の popup と重なると情報過多になる。
26. 良い: popup 文言はそのまま短く保てる。
27. 良い: headless flag は追加しやすい。
28. 良い: rollback は draw と flag を外すだけ。
29. 良い: 小さなパラメータ調整ではない。
30. 良い: 次回の人間評価問いが明確になる。

改善案:

1. relay に `routePreview` を持たせる。
2. relay 出現時に `relayShowsLockedRoutePreview` を立てる。
3. relay から左右へ薄い線を描く。
4. 線の先に小さい錠形マーカーを描く。
5. preview は relay 生存中だけ描く。
6. route 開放時に unlock particle を左右へ流す。
7. route 開放時に `relayPreviewUnlocks` を立てる。
8. `relayOpensSideRoute` は維持する。
9. side connector の trace は維持する。
10. relay HP は維持する。
11. shield HP / armor は維持する。
12. BOMB / Active DEF は維持する。
13. boss final cue は維持する。
14. popup は増やさない。
15. title と source note を v39 にする。
16. auto_verify title を v39 にする。
17. README に v39 差分を書く。
18. devlog に戻し手順を書く。
19. design_log に判断を残す。
20. headless path を v39 にする。
21. report に `relayPreviewUnlocks` を追加する。
22. failure 条件に追加する。
23. continuous directive を更新する。
24. staging に検証結果を残す。
25. v38 は変更しない。
26. unrelated dirty files は stage しない。
27. check を実行する。
28. pass しなければ preview flag / route 開放を直す。
29. commit する。
30. push を試みる。

筋の良い案:

- **Locked route preview**: relay 生存中に左右 route のロック状態を薄く見せ、relay 撃破時にそれが開くようにする。

解決できる問題:

- relay が追加敵に見える問題。
- side route 開放の事前期待が弱い問題。
- headless が preview と unlock の因果を見ていない問題。

新しく生じる懸念:

- 線や錠形マーカーが弾幕視認を邪魔する可能性。
- visual cue だけなので、人間が gate と読むかはまだ実プレイ確認が必要。

## 設計サイクル 2

候補比較:

1. popup を `LOCKED ROUTE` にする: 意味は伝わるが説明文に寄る。
2. relay を大きくする: 視認性は上がるが gate 性は増えない。
3. side connector を半透明敵で先置きする: 敵なのか予告なのか混乱する。
4. relay 撃破で大きな弾消しを出す: 報酬は強いが route 開放の文法が弱い。
5. locked route preview: 開放前と開放後の差を画面上の状態遷移にできる。

30件の評価:

1. 採用案は説明文を増やさない。
2. 採用案は敵数を増やさない。
3. 採用案は route gate 性を直接補強する。
4. 採用案は v38 の構造を壊さない。
5. 採用案は shield 周辺だけに閉じる。
6. 採用案は headless flag 化できる。
7. 採用案は rollback が簡単。
8. 採用案は BOMB を触らない。
9. 採用案は boss を触らない。
10. 採用案は chain window を触らない。
11. 懸念は視認ノイズ。
12. 懸念は記号感。
13. 懸念は marker が回収アイテムに見えること。
14. 懸念は人間視線。
15. 懸念は popup との重なり。
16. popup 案は説明依存。
17. 大型化案は追加敵感を強める可能性。
18. 半透明敵案は当たり判定誤認を生む。
19. 弾消し案は防御報酬へ寄る。
20. preview 案は撃破前から route を期待させる。
21. preview 案は unlock particle と相性がよい。
22. preview 案は DonPachi route chain の先読みと合う。
23. preview 案は `relayPreviewUnlocks` で検査できる。
24. preview 案は v38 の問いに直結する。
25. preview 案は小さな数値調整ではない。
26. preview 案は新しい操作を要求しない。
27. preview 案は既存 bot を壊しにくい。
28. preview 案は次回人間評価の問いが明確。
29. preview 案は clutter 増加を最小にできる。
30. preview 案を採用する。

改善案 30件:

1. relay 描画前に preview を描く。
2. preview alpha を 0.48 にする。
3. preview line width を 1.5 にする。
4. marker は小さい stroke rect にする。
5. marker に arc を足して錠形にする。
6. marker は左右 76px / 下 72px に置く。
7. relay 本体の色は変えない。
8. relay HP は変えない。
9. route 開放 particle は黄色にする。
10. particle は左右へ流す。
11. particle は connector spawn と同じ関数に置く。
12. `routePreview` は relay opt に閉じる。
13. `relayShowsLockedRoutePreview` は break 時に立てる。
14. `relayPreviewUnlocks` は route 開放時に立てる。
15. `shieldRelayOpensRoute` は維持する。
16. `shieldBreakConnector` は維持する。
17. `guaranteedFollowUpResidency` は維持する。
18. README 先頭に v39 を足す。
19. devlog 先頭に v39 を足す。
20. design_log 先頭に v39 を足す。
21. headless v39 を作る。
22. report に preview 条件を足す。
23. failure 条件へ足す。
24. directive last_result を更新する。
25. staging に path と verification を書く。
26. `node tools\headless...v39...` を実行する。
27. pass 後に git status を見る。
28. 自分のファイルだけ stage する。
29. commit する。
30. push する。

## 設計サイクル 3

実装採用:

1. v38 をコピーして v39 を作る。
2. title / h1 / title screen / source note を v39 にする。
3. relay spawn に `routePreview:true` を付ける。
4. relay draw に locked side route preview を追加する。
5. releaseRelayRoute に unlock particle と flag を追加する。
6. headless で preview と unlock を検査する。

30件の最終確認:

1. 操作核は撃って壊すまま。
2. shield を割ると relay が出る。
3. relay 生存中に locked route が見える。
4. relay 撃破で side route が開く。
5. route は左右移動を促す。
6. side connector は増やしていない。
7. popup は増やしていない。
8. BOMB cue は触っていない。
9. boss 構造は触っていない。
10. chain window は触っていない。
11. bot clear を維持する。
12. BOMB 使用を維持する。
13. midboss 到達を維持する。
14. boss part 到達を維持する。
15. DonPachi 単一文法を維持する。
16. armored split を維持する。
17. shield readability を維持する。
18. relay 撃破 flag を維持する。
19. route 開放 flag を維持する。
20. preview unlock flag を追加する。
21. v38 に戻せる。
22. 変更範囲が小さい。
23. 体感差は「開く前が見える」差として明確。
24. パラメータ微調整ではない。
25. 人間評価の問いが明確。
26. headless は構造検証に限定する。
27. 面白さ判定は主張しない。
28. continuous directive に反映する。
29. staging に記録する。
30. commit / push する。

捨てたもの:

- relay の大型化。
- route 説明 popup の追加。
- 半透明の当たり判定なし敵を置く案。
- BOMB / Active DEF 再調整。
- 敵火力やプレイヤー火力の調整。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v39_check.js
```

期待:

- `relayShowsLockedRoutePreview: true`
- `relayPreviewUnlocks: true`
- `relayOpensSideRoute: true`
- `shieldBreakCreatesRelay: true`
- `botClearsWithBomb: true`

## 検証結果

2026-05-21 実行。`relayShowsLockedRoutePreview: true`、`relayPreviewUnlocks: true`、`relayOpensSideRoute: true`、`shieldBreakCreatesRelay: true`、`shieldRelayDestroyed: true`、`shieldRelayOpensRoute: true` を確認。既存条件の `readableShieldAbsorption`、`guaranteedFollowUpResidency`、`antiInstantKillStructure`、`bossFinalCue`、`botClearsWithBomb` もすべて true。bot は `killCount=135`、`maxChain=13`、`bombCount=1`、`grade=S`。

## 残課題

人間プレイで、relay の locked route preview が「この relay を倒すと左右 route が開く」と読めるか、または視認ノイズや追加 UI に見えるかを確認する。

# graze_log v05.2_cdx_v38 design_log

## 対象 directive

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の active 指示を対象にした。Slack direct pending はなし。

原文:

> v37 の simple bot は clear し、BOMB も使用する。次は人間プレイで、shield break relay が「割ると次の対象が生まれる」と読めるか、または敵追加で画面が散らかっただけに見えるかを確認する。

## 実装前判断

人間プレイ確認はこの headless 実行だけでは代替できない。ただし v37 の構造を読むと、shield break と同時に左右 connector と中央 relay が出るため、relay の意味が「次の gate」ではなく「追加された敵」に薄まる危険がある。今回は表示や説明を増やさず、出現順そのものを `shield break -> central relay -> side route` に変え、撃破因果を画面の時間順で読める playable diff にする。

使う過去知見:

- `Feedback / Rights / Human Judgment`: 説明文ではなく、人間が自然に追える操作理由を画面上の因果で作る。
- `Playable / Headless 評価`: relay 撃破後に side route が開くことを flag で検証する。
- `Balance / Rule Space`: 火力低下や敵数の単純追加ではなく、後続が開く順序を変えて単調さを減らす。

## 設計サイクル 1

良いところ / 悪いところ:

1. 良い: v37 は shield break から中央 relay を出す。
2. 良い: relay は heli と形が違う。
3. 良い: bot は relay を撃破できる。
4. 良い: BOMB final cue と clear は維持されている。
5. 良い: shield の ring / bar / crack は残っている。
6. 悪い: break と同時に左右 connector も出る。
7. 悪い: relay が route gate ではなく追加敵に見えやすい。
8. 悪い: popup が増えるほど説明に寄る。
9. 悪い: 敵数追加で散らかった印象が出る可能性がある。
10. 悪い: headless は人間の視線を評価しない。
11. 良い: 出現順なら説明なしで因果を作れる。
12. 良い: relay 撃破を route 開放の trigger にできる。
13. 良い: side connector の価値は残せる。
14. 良い: shield break の達成感も残せる。
15. 悪い: route 開放が遅れすぎると chain が切れる。
16. 悪い: relay が硬すぎると作業になる。
17. 悪い: relay が柔らかすぎると意味が読まれない。
18. 良い: relay HP 7 は v37 で撃破確認済み。
19. 良い: 既存 bot priority を使える。
20. 悪い: `shieldBreakConnector` の意味を更新する必要がある。
21. 良い: flag 名は後方互換として route 開放時に立てられる。
22. 悪い: `guaranteedFollowUpResidency` が break 直後ではなく relay 後を見るようになる。
23. 良い: その方が今回の意図に合う。
24. 悪い: 画面の side route が遅れて出るため空白が出るかもしれない。
25. 良い: relay 自体が空白を埋める。
26. 良い: 変更は shield / relay 周辺に閉じる。
27. 悪い: 人間評価は残課題のまま。
28. 良い: headless で構造発火は検査できる。
29. 良い: v37 へ戻しやすい。
30. 良い: 小さなパラメータ調整ではなく playable diff になる。

改善案:

1. break 時の即時 side connector を外す。
2. break 時は relay だけ出す。
3. relay 撃破時に side connector を出す。
4. route 開放 flag を追加する。
5. `shieldBreakConnector` は route 開放時に立てる。
6. popup は break と route 開放の2段階だけにする。
7. relay HP は v37 のままにする。
8. relay speed は v37 のままにする。
9. shield HP / armor は変えない。
10. BOMB / Active DEF は変えない。
11. boss final cue は変えない。
12. wave timeline は変えない。
13. bot priority は変えない。
14. headless path を v38 にする。
15. `relayOpensSideRoute` を追加する。
16. `shieldBreakCreatesRelay` は残す。
17. `readableShieldAbsorption` は残す。
18. `guaranteedFollowUpResidency` は route 開放後に満たす。
19. README に v38 差分を書く。
20. devlog に戻し手順を書く。
21. design_log に指示原文を残す。
22. continuous directive を更新する。
23. staging に verification を残す。
24. v37 は変更しない。
25. unrelated dirty files は stage しない。
26. auto_verify title を更新する。
27. source note を v38 にする。
28. check を実行する。
29. pass しなければ route 出現か bot target を調整する。
30. 残課題は人間プレイでの可読性判定にする。

筋の良い案:

- **Relay gate sequencing**: shield break を直接 side connector へつなげず、中央 relay を倒した時だけ左右 route を開く。

解決できる問題:

- relay が追加敵に見える問題。
- break と route の因果が同時発生で薄まる問題。
- headless が relay 後の route 開放を見ていない問題。

新しく生じる懸念:

- route 開放が遅れて chain が切れる可能性。
- relay が gate として読めるかは人間プレイ確認が必要。

## 設計サイクル 2

候補比較:

1. relay を大きくする: 視認性は上がるが clutter も増える。
2. relay に長い説明 popup を出す: 意味は伝わるが STG の瞬間判断に重い。
3. relay を無敵 gate にする: 強制感が強い。
4. relay 撃破で弾消し: 防御報酬にはなるが route 文法が弱い。
5. relay 撃破で side route 開放: 撃破行為と次の移動判断がつながる。

30件の評価:

1. 採用案は説明量を増やさない。
2. 採用案は撃破順を変える。
3. 採用案は v37 の relay 資産を使う。
4. 採用案は side connector を捨てない。
5. 採用案は headless 化しやすい。
6. 採用案は bot clear の副作用が少ない。
7. 採用案は shield 表示を増やさない。
8. 採用案は火力を下げない。
9. 採用案は BOMB cue を触らない。
10. 採用案は rollback が簡単。
11. 懸念は chain window。
12. 懸念は relay の硬さ。
13. 懸念は side route の遅れ。
14. 懸念は人間視線。
15. 懸念は popup 2段階の読みやすさ。
16. 大型化案は見た目の修正に寄りすぎる。
17. 説明 popup 案は操作核を補助文で支える。
18. 無敵 gate 案は理不尽に見えやすい。
19. 弾消し案は撃つ理由が防御に寄る。
20. route 開放案は攻撃と移動を同時に作る。
21. route 開放案は DonPachi chain 文法に近い。
22. route 開放案は `relayOpensSideRoute` で検査できる。
23. route 開放案は v37 の `shieldRelayDestroyed` を活かす。
24. route 開放案は敵追加量を増やさない。
25. route 開放案は発生タイミングだけを変える。
26. route 開放案は今回の焦点に直結する。
27. route 開放案は focused playable diff として十分。
28. route 開放案は次回人間評価の問いが明確。
29. route 開放案は「散らかっただけ」を減らす。
30. route 開放案を採用する。

改善案 30件:

1. `releaseRelayRoute` を作る。
2. relay 撃破時に呼ぶ。
3. `shieldRelayOpensRoute` を追加する。
4. `shieldBreakConnector` を route 開放時へ移す。
5. break popup は `BREAK -> RELAY` のままにする。
6. route popup は `RELAY -> SIDE ROUTE` にする。
7. side connector trace 名を `dp_relay_side_route` にする。
8. side connector group を `_relay_route` にする。
9. relay reward は変えない。
10. relay draw は変えない。
11. shield draw は変えない。
12. route event は変えない。
13. BOSS constants は変えない。
14. source note を更新する。
15. title を v38 にする。
16. auto_verify title を v38 にする。
17. headless htmlPath を v38 にする。
18. report に `relayOpensSideRoute` を足す。
19. failure 条件に追加する。
20. README 先頭に v38 を足す。
21. devlog 先頭に v38 を足す。
22. design_log 先頭に v38 を足す。
23. directive last_result を更新する。
24. staging へ追記する。
25. `node tools\headless...v38...` を実行する。
26. pass 後に git status を見る。
27. 自分のファイルだけ stage する。
28. commit する。
29. push する。
30. push 後 status を見る。

## 設計サイクル 3

実装採用:

1. v37 をコピーして v38 を作る。
2. `releaseShieldBreak` では relay だけを出す。
3. `releaseRelayRoute` で左右 connector を出す。
4. `killEnemy` の relay 分岐で route 開放する。
5. headless で `relayOpensSideRoute` を見る。

30件の最終確認:

1. 操作核は撃って壊す。
2. 次操作は中央 relay へ射線を合わせる。
3. relay 後に side route が開く。
4. route は左右移動を促す。
5. shield は撃ち込み対象のまま。
6. side connector は消えていない。
7. 同時発生 clutter は減る。
8. 表示追加は最小。
9. popup は短い。
10. chain window は headless で確認する。
11. bot clear を維持する。
12. BOMB 使用を維持する。
13. midboss 到達を維持する。
14. boss part 到達を維持する。
15. DonPachi 単一文法を維持する。
16. armored split を維持する。
17. shield readability を維持する。
18. relay 撃破 flag を維持する。
19. route 開放 flag を追加する。
20. v37 に戻せる。
21. 変更範囲が小さい。
22. 体感差は発生順の差として明確。
23. パラメータ微調整ではない。
24. 人間評価の問いが明確。
25. headless は構造検証に限定する。
26. 面白さ判定は主張しない。
27. Nao_u 原文は保持した。
28. continuous directive に反映する。
29. staging に記録する。
30. commit / push する。

捨てたもの:

- relay の大型化。
- shield 表示追加。
- BOMB / Active DEF 再調整。
- 敵火力やプレイヤー火力の調整。
- HUD 説明文の追加。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v38_check.js
```

期待:

- `shieldBreakCreatesRelay: true`
- `relayOpensSideRoute: true`
- `shieldRelayDestroyed: true`
- `shieldRelayOpensRoute: true`
- `botClearsWithBomb: true`

## 検証結果

2026-05-21 実行。`relayOpensSideRoute: true`、`shieldBreakCreatesRelay: true`、`shieldRelayDestroyed: true`、`shieldRelayOpensRoute: true` を確認。既存条件の `readableShieldAbsorption`、`guaranteedFollowUpResidency`、`antiInstantKillStructure`、`bossFinalCue`、`botClearsWithBomb` もすべて true。bot は `killCount=135`、`maxChain=13`、`bombCount=1`、`grade=S`。

## 残課題

人間プレイで、relay が「route を開く gate」として読めるか、またはまだ敵追加に見えるかを確認する。

# graze_log v05.2_cdx_v37 design_log

## 対象 directive

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の active 指示を対象にした。Slack direct pending はなし。

原文:

> v36 の simple bot は clear し、BOMB も使用する。次は人間プレイで、shield ring / bar / crack / break popup が「撃ち込んで割る対象」として読めるか、表示過多や単なる説明に見えないかを確認する。

## 実装前判断

人間プレイはこの headless 環境だけでは判定できない。そのため今回は focused evaluation だけで終わらせず、v36 の懸念「cue は読めても撃つ必然が弱い」を playable diff にする。表示を足すと単なる UI 説明が増えるので、shield break から中央 relay target を発生させ、撃ち込みが次の撃破対象と chain 継続へ接続される構造にする。

使う過去知見:

- `Feedback / Rights / Human Judgment`: 見た目の説明だけでなく、人間が納得する操作理由を作る。
- `Playable / Headless 評価`: relay が発火し、撃破され、clear へ影響しないことを flag で検証する。
- `Balance / Rule Space`: 火力低下ではなく敵側の後続構造で単調さを減らす。

## 設計サイクル 1

良いところ / 悪いところ:

1. 良い: v36 は shield hit の進捗が見える。
2. 良い: crack と break cue は割れる予告になる。
3. 良い: bot clear と BOMB final cue は維持されている。
4. 悪い: 人間が「読める」かは headless では判定できない。
5. 悪い: cue をさらに足すと説明過多になる。
6. 悪い: `BREAK -> SIDE CHAIN` は読む対象で、撃つ対象ではない。
7. 良い: shield break は既に gameplay event として存在する。
8. 良い: break 後の connector は次行動の種になる。
9. 悪い: 左右 connector だけだと中央を撃っていたプレイヤーに次目標が弱い。
10. 良い: 中央へ戻る relay なら、撃ち込み結果が次の撃破対象になる。

改善案:

1. shield break 後に中央 relay target を出す。
2. relay は硬すぎない HP 7 にする。
3. relay は small heli と違う菱形にする。
4. bot priority は shield の次に置く。
5. `shieldBreakRelay` と `shieldRelayDestroyed` を flag 化する。
6. headless に `shieldBreakCreatesRelay` を追加する。
7. 左右 connector は残す。
8. shield HP / armor は変えない。
9. BOMB / Active DEF は変えない。
10. wave timeline は変えない。

筋の良い案:

- **Shield break relay**: shield を割った瞬間に、その地点から中央へ戻る撃破対象を出し、break を視覚 cue ではなく次の chain node にする。

## 設計サイクル 2

候補比較:

1. shield の bar を大きくする: 読みやすくなるが UI 追加で、撃つ理由は増えない。
2. popup 文言を日本語にする: 説明は増えるが、STG の瞬間判断には重い。
3. shield break 後に敵弾を消す: 防御報酬にはなるが、撃破 route にはつながらない。
4. shield break 後に左右 connector だけ増やす: v36 と体感差が小さい。
5. shield break relay: 次の撃破対象が生まれ、chain / 位置取り / reward が同時に動く。

採用:

- relay enemy を追加し、break から中央へ流す。
- headless は relay spawn だけでなく撃破まで見る。

捨てる:

- shield 表示の追加。
- shield をさらに硬くする調整。
- HUD 説明文。
- boss / BOMB の再調整。

## 設計サイクル 3

実装手順:

1. v36 をコピーして v37 を作る。
2. title / h1 / title screen / source note を v37 にする。
3. `relay` enemy type を追加する。
4. `releaseShieldBreak` で `shieldBreakRelay` を立てる。
5. 同関数で `dp_shield_break_relay` trace を spawn する。
6. bot priority に `relay` を追加する。
7. `killEnemy` で `shieldRelayDestroyed` を立てる。
8. relay draw を追加する。
9. headless v37 check を作る。
10. README / devlog / design_log / directive / staging を更新する。

懸念:

- relay が増えて敵数が過剰になる可能性。
- relay が中央へ戻るため、左右 connector の意味が薄れる可能性。
- headless bot が relay を倒しても、人間が気持ちよく読むかはまだ別問題。

採用理由:

表示過多のリスクを避けつつ、shield を撃つ理由を画面上の次目標として作れるため。v36 で作った可読 cue を土台に、v37 では playable structure に進める。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v37_check.js
```

期待:

- `readableShieldAbsorption: true`
- `shieldBreakCreatesRelay: true`
- `shieldBreakRelay: true`
- `shieldRelayDestroyed: true`
- `botClearsWithBomb: true`

## 検証結果

2026-05-21 実行。`shieldBreakCreatesRelay: true`、`shieldBreakRelay: true`、`shieldRelayDestroyed: true` を確認。既存条件の `readableShieldAbsorption`、`guaranteedFollowUpResidency`、`antiInstantKillStructure`、`bossFinalCue`、`botClearsWithBomb` もすべて true。bot は `killCount=134`、`maxChain=13`、`bombCount=1`、`grade=S`。

## 残課題

人間プレイで、shield break relay が「割ると次の対象が生まれる」と読めるか、または敵追加で画面が散らかっただけに見えるかを確認する。

# graze_log v05.2_cdx_v36 design_log

## 対象 directive

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の active 指示を対象にした。Slack direct pending はなし。

原文:

> v35 の simple bot は clear し、BOMB も使用する。次は人間プレイで、shield absorption が「撃ち込んで割る対象」として読めるか、「弾が効かないだけ」に見えるかを確認する。

## 実装前判断

v35 の shield は headless 上では `shieldAbsorbedHits` と `shieldBreakConnector` が立つが、人間には「弾が効かない青い敵」に見える危険が残った。今回は敵配置や火力を変えず、shield に残り装甲、被弾反応、割れる予告、break から side chain への接続を追加する。これは `Feedback / Rights / Human Judgment` の「人間が納得できる見た目」、`Playable / Headless 評価` の「見える cue を flag で検査」、`Balance / Rule Space` の「火力を下げず敵側の rule space を調整」を使う判断。

## 設計サイクル 1

良いところ / 悪いところ:

1. 良い: v35 は DonPachi 単一文法を維持している。
2. 良い: armored split は瞬殺後の後続を保証している。
3. 良い: shield absorption は撃ち込み対象を作っている。
4. 良い: break connector は次の左右移動へつながる。
5. 良い: bot clear と BOMB cue は維持されている。
6. 悪い: shield の残り装甲が見えない。
7. 悪い: hit が効いているか分かりにくい。
8. 悪い: break 直前の予告がない。
9. 悪い: break 後 connector がただ湧いたように見える。
10. 悪い: shieldT が内部タイマーに見えやすい。
11. 悪い: 「効かないから無視」が自然行動になり得る。
12. 悪い: hard target と shield の見た目差が弱い。
13. 悪い: HUD だけで説明すると画面中央のプレイと離れる。
14. 悪い: popup を出しすぎると弾幕が読みにくい。
15. 悪い: 装甲を数字だけで出すと STG の瞬間判断に合わない。
16. 良い: v36 は enemy draw の局所変更で済む。
17. 良い: stage route は変えず評価軸を切り分けられる。
18. 良い: ring 表示なら位置と意味が一致する。
19. 良い: crack 表示なら割れる直前が読める。
20. 良い: break popup は一度だけなら過剰ではない。
21. 悪い: 白 flash が敵弾や player bullet と混ざる可能性。
22. 悪い: bar が小さすぎると見えない。
23. 悪い: bar が大きすぎると敵の形を隠す。
24. 悪い: shield を硬く見せすぎるとテンポが落ちる印象になる。
25. 良い: headless flag で readable cue 発火は確認できる。
26. 悪い: headless は実際の視認性までは保証しない。
27. 良い: v35 から戻しやすい。
28. 良い: README で v36 の狙いを明確化できる。
29. 悪い: 単なる演出追加に見えるリスクがある。
30. 良い: しかし今回は「撃つ理由を読ませる」根源仕様の補強である。

改善案:

1. shield に armor ring を出す。
2. shield に小さな armor bar を出す。
3. hit 時に ring を白く太くする。
4. 残り 2 で crack cross を出す。
5. break 時に `BREAK -> SIDE CHAIN` を出す。
6. break 時に青い破片を出す。
7. connector を break popup と同時に出す。
8. `shieldArmorMeter` flag を追加する。
9. `shieldCrackWarning` flag を追加する。
10. `shieldBreakCue` flag を追加する。
11. headless に `readableShieldAbsorption` を追加する。
12. shield HP は変えない。
13. shieldArmor も変えない。
14. wave timing は変えない。
15. bot priority は変えない。
16. boss cue は変えない。
17. BOMB damage は変えない。
18. Active DEF は変えない。
19. HUD に説明文を足さない。
20. title だけ v36 にする。
21. source note を v36 の狙いへ更新する。
22. README に実行方法と差分を書く。
23. devlog に戻し手順を書く。
24. continuous directive の last_result を更新する。
25. staging に verification を残す。
26. v35 は変更しない。
27. unrelated dirty files は stage しない。
28. 検証は v36 check のみ実行する。
29. pass しなければ flag 条件か描画を修正する。
30. 人間評価は残課題として残す。

筋の良い案:

- **Shield armor as local progress**: shield 本体の周囲に ring / bar / crack / break を重ね、プレイヤーが撃っている対象のすぐ近くで「効いている」「もうすぐ割れる」「割れたら左右へ行く」を読む。

解決できる問題:

- 弾が効かないだけに見える問題。
- break connector の因果が読めない問題。
- headless が見た目の cue 発火を検査していない問題。

新しく生じる懸念:

- 表示が増えて弾避けを邪魔する可能性。
- cue は出ても、人間が瞬間的に読めるかは別問題。

## 設計サイクル 2

良いところ / 悪いところ:

1. 良い: ring は敵中心に近く視線移動が少ない。
2. 良い: bar は残量を具体的に示せる。
3. 良い: crack は「次で割れる」を予告できる。
4. 良い: popup は break の意味を一度だけ示せる。
5. 良い: particle は break の達成感を出せる。
6. 悪い: ring と bar の二重表示は冗長かもしれない。
7. 悪い: crack cross は被弾判定と誤読される可能性。
8. 悪い: popup 英語は瞬間的に読まれない可能性。
9. 悪い: side chain の意味が未プレイでは分からない可能性。
10. 悪い: shield が 3 体いるため表示が重なる可能性。
11. 良い: 3 体は横に離れており重なりは小さい。
12. 良い: bar は 30px なら画面を圧迫しない。
13. 良い: crack は残り 2 以下だけなので常時出ない。
14. 良い: hit flash は短く feedback だけになる。
15. 良い: break popup は 44 frame で消える。
16. 悪い: headless flag は bullet hit が十分入る前提。
17. 良い: v35 で shieldAbsorbedHits は確認済み。
18. 悪い: bot が shield をすぐ BOMB で飛ばすと flag が立たない。
19. 良い: BOMB は boss final まで温存する。
20. 良い: shield stage は boss 前なので通常弾で処理される。
21. 悪い: fireBomb が全敵 99 damage なので shield を飛ばすケースはあり得る。
22. 良い: bot 条件は boss final まで撃たない。
23. 悪い: gauge full でも boss 前 BOMB は手動なら可能。
24. 良い: 手動 BOMB で飛ばすのはプレイヤー選択として許容。
25. 悪い: cue が明るすぎると視線を奪う。
26. 良い: ring は白、bar は小さいため控えめにできる。
27. 悪い: 青い shield と青い破片が同化する可能性。
28. 良い: popup と connector で補える。
29. 悪い: v36 は面白さ改善ではなく可読性改善に見える。
30. 良い: 可読性は「撃つ理由」の根源仕様なので採用価値がある。

改善案:

1. ring は残量 arc にする。
2. full circle ではなく残量が減るようにする。
3. bar は ring の補助にする。
4. hit flash は 8 frame にする。
5. crack は X 型にする。
6. crack 色は黄色にする。
7. break particle は青系にする。
8. break popup は緑にする。
9. `shieldArmorMax` を enemy に持たせる。
10. `shieldHitFlash` を enemy に持たせる。
11. updateEnemy で flash を減らす。
12. bullet hit で `shieldArmorMeter` を mark する。
13. armor <=2 で `shieldCrackWarning` を mark する。
14. releaseShieldBreak で `shieldBreakCue` を mark する。
15. releaseShieldBreak に popup と particle を入れる。
16. killEnemy の shield release でも cue を出す。
17. 二重 cue は `e.shieldBreak` で防ぐ。
18. check は既存条件を残す。
19. check は readable flag を追加する。
20. source note を v36 に変える。
21. auto_verify title を v36 に変える。
22. README 冒頭に v36 を足す。
23. devlog 冒頭に v36 を足す。
24. design_log 冒頭に 3 サイクルを足す。
25. directive を v36 結果へ更新する。
26. staging を Game Start セクションへ追記する。
27. commit message は `codex: improve graze shield readability`。
28. push 後 status を確認する。
29. 失敗時は hash を報告する。
30. v36 以外の dirty files は無視する。

筋の良い案:

- **Local progress + one-time transition cue**: 常時説明ではなく、進捗はローカル表示、意味の転換だけ popup にする。

解決できる問題:

- 表示過多を避けながら撃ち込みの進捗を読ませる。
- break から side connector への因果だけを短く伝える。

新しく生じる懸念:

- popup が英語のため、実プレイで読まれない可能性。
- crack 表示が敵弾回避と競合する可能性。

## 設計サイクル 3

良いところ / 悪いところ:

1. 良い: 変更範囲が shield に閉じる。
2. 良い: 既存 wave 文法を壊さない。
3. 良い: 火力を下げない。
4. 良い: BOMB final cue を壊さない。
5. 良い: headless 条件を追加できる。
6. 良い: v35 との差分が説明しやすい。
7. 悪い: 面白さそのものはまだ人間評価待ち。
8. 悪い: visual cue は headless だけでは不十分。
9. 悪い: shield が硬すぎる印象は残るかもしれない。
10. 悪い: connector の出現方向が予告されない。
11. 良い: popup の SIDE CHAIN が方向を示す。
12. 良い: 左右 connector は実際に左右へ動く。
13. 悪い: プレイヤーが中央固定なら connector を拾わない可能性。
14. 良い: route intent は左右移動を要求している。
15. 悪い: shield 3 体を全て割る前に stage が進む可能性。
16. 良い: headless は少なくとも cue 発火を確認する。
17. 悪い: 手動プレイで BOMB すると shield 評価が飛ぶ。
18. 良い: BOMB を温存した時の読ませ方が主評価。
19. 悪い: `BREAK -> SIDE CHAIN` は説明的かもしれない。
20. 良い: 一度だけなら学習 cue として許容。
21. 悪い: 色数が増える。
22. 良い: 既存の青/黄/緑系に収まる。
23. 悪い: ring arc の残量が小さい画面で見づらいかもしれない。
24. 良い: bar が補助する。
25. 悪い: shield が装甲対象として強調され、他敵より目立ちすぎる。
26. 良い: shield wall は今回の焦点なので許容。
27. 良い: 戻しは drawEnemy と shield hit 分岐を戻すだけ。
28. 良い: v36 check は clear regression も見る。
29. 良い: staging に残せる。
30. 良い: 次回は人間プレイで shield cue の評価へ進める。

改善案:

1. v35 をコピーして v36 を作る。
2. title / h1 / title screen を v36 にする。
3. source note を v36 にする。
4. `shieldArmorMax` を追加する。
5. `shieldHitFlash` を追加する。
6. hit 時に flash を入れる。
7. hit 時に `shieldArmorMeter` を mark する。
8. armor <=2 で `shieldCrackWarning` を mark する。
9. release で `shieldBreakCue` を mark する。
10. release で popup を出す。
11. release で青 particle を出す。
12. drawEnemy で ring arc を描く。
13. drawEnemy で bar を描く。
14. drawEnemy で crack を描く。
15. headless を v36 path にする。
16. `readableShieldAbsorption` を report に足す。
17. README を更新する。
18. devlog を更新する。
19. design_log を更新する。
20. directive を更新する。
21. staging を更新する。
22. check を実行する。
23. 必要なら flag や threshold を調整する。
24. status を確認する。
25. v36 files だけ stage する。
26. commit する。
27. push する。
28. push 後 status を見る。
29. 残課題を報告する。
30. 次回焦点は人間プレイでの cue 判定。

採用:

- shield の local progress 表示、hit flash、crack warning、break cue を実装する。
- `readableShieldAbsorption` を headless に追加する。

捨てる:

- shield HP / armor 数値の変更。
- wave timeline の変更。
- BOMB / Active DEF の再調整。
- HUD 説明文の追加。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v36_check.js
```

## 検証結果

2026-05-21 実行。`readableShieldAbsorption: true`、`shieldArmorMeter: true`、`shieldCrackWarning: true`、`shieldBreakCue: true` を確認。既存条件の `usesSingleSource`、`reachesMidboss`、`reachesBossParts`、`midLateDensity`、`antiInstantKillStructure`、`guaranteedFollowUpResidency`、`bossFinalCue`、`botClearsWithBomb` もすべて true。bot は `killCount=131`、`maxChain=13`、`bombCount=1`、`grade=S`。

## 残課題

人間プレイで、shield ring / bar / crack / break popup が「撃ち込めば割れる対象」として読めるかを確認する。読めなければ、shield の見た目ではなく、wave 側で shield を撃つ必然を作る方向へ戻る。

# graze_log v05.2_cdx_v35 design_log

## 対象 directive

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の active 指示を対象にした。Slack direct pending はなし。

直近版 v34 は、プレイヤー火力を下げずに armored carrier と shield wall を追加し、瞬殺後にも次判断を残す方向へ進めていた。ただし実装を読むと、armored carrier は `lt>120` まで生き残った時だけ split heli を出すため、高火力で先に破壊されると後続が消える。shield wall も `shieldT` が見た目だけで、実際には通常ヒットで HP が削れるため、撃ち続ける対象としての滞在時間を作っていなかった。

## 実装前判断

今回の playable diff は、敵数の追加やプレイヤー火力低下ではなく、v34 の構造を「瞬殺されても次が残る」方向へ修正する。これは `Feedback / Rights / Human Judgment` の「細かい UI ではなく本質的なゲーム改善」、`Balance / Rule Space` の「火力を下げず敵側の rule space で調整」、`Playable / Headless 評価` の「発火した構造を flag で検証する」を使う判断。

## 設計サイクル

良いところ / 悪いところ:

1. v34 は DonPachi 単一文法へ寄せている。
2. midboss / boss / bunker の entry duration 問題は解消済み。
3. armored / shield という後続構造の方向はよい。
4. ただし armored が即死すると split しない。
5. shield が見た目だけで滞在時間を作らない。
6. 火力を下げると shot_log 由来の撃破感を壊す。
7. 敵をただ硬くすると作業感が出る。
8. 撃破や shield break が次の connector を出せば、撃つ行為が移動判断へつながる。
9. headless は clear だけでなく、後続保証の flag を見る必要がある。

改善案:

1. armored を撃破時にも split させる。
2. split 済みなら二重 release しない。
3. shield は shieldT 中に hit を吸収する。
4. shieldArmor が尽きたら左右 connector を出す。
5. shield が撃破された場合も connector を保証する。
6. v34 の route timeline は変えない。
7. boss final cue と BOMB clear は維持する。
8. headless に `guaranteedFollowUpResidency` を追加する。

採用:

- `releaseArmoredSplit(e)` を追加し、時間経過と撃破時の両方から呼ぶ。
- `releaseShieldBreak(e)` を追加し、shield absorption の終了時と撃破時に呼ぶ。
- bullet collision で shieldT 中の `shieldArmor` を削り、HP damage は通さない。
- `armoredBurstRelease` / `shieldAbsorbedHits` / `shieldBreakConnector` を stage flag にする。

懸念:

- shield の吸収が見た目だけではなくなったため、硬さが過剰に感じる可能性がある。
- bot clear は通ったが、人間プレイでは shield break 後の connector が気持ちよいか確認が必要。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v35_check.js
```

## 検証結果

2026-05-21 実行。`guaranteedFollowUpResidency: true`、`armoredBurstRelease: true`、`shieldAbsorbedHits: true`、`shieldBreakConnector: true`、`botClearsWithBomb: true` を確認。bot は `killCount=131`、`maxChain=13`、`bombCount=1`、`grade=S`。

## 残課題

人間プレイで、shield の吸収が「撃ち込んで割る対象」として読めるか、「弾が効かないだけ」に見えるかを確認する。後者なら shield break の視覚演出か HP 表示を追加する。

# graze_log v05.2_cdx_v29 design_log

## 対象 directive

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の active 指示を対象にした。Slack direct pending はなかった。

> v25 の simple bot は clear するが BOMB を必須使用しない。次は「人間が自然に撃ちたくなる final cue」として BOMB の役割を再評価する。

直近の `v28` は 1942 trace study として headless が通っていたが、bot は BOMB なしで A clear していた。つまり、BOMB の final cue を評価する土台としては不足していた。

## 実装前判断

今回は敵編隊をさらに変えない。v28 の 1942 trace labels / source notes / coordinate scale は維持し、boss 終盤だけを playable diff にする。敵配置を同時に変えると、BOMB cue の評価と wave 文法の評価が混ざるため。

使う過去知見:

- `Playable / Headless 評価`: 起動だけでなく、final cue が発火し、bot が BOMB を使って clear するかを検証する。
- `Balance / Rule Space`: BOMB を常時強化ではなく、stage 最後の明確な役割として置く。
- `Feedback / Rights / Human Judgment`: headless は面白さ判定ではなく、cue と BOMB 使用が検証可能になったかだけを見る。

## 設計サイクル 1

良いところ / 悪いところ:

1. v28 は 1942 参照が具体的。
2. red five / red ten / side curl / bonus plane がある。
3. boss まで到達する。
4. clear できる。
5. stage flags が検証可能。
6. しかし BOMB なしでも clear できる。
7. BOMB cue が発火しているか分からない。
8. boss final が通常ショットの延長に見える。
9. BOMB を使わない A clear と使う S clear の差が体験前に読めない。
10. gauge を貯める理由が boss final と結びついていない。
11. cooldown だけでは「今撃つ理由」にならない。
12. scoring boost は cue として読みにくい。
13. 弾速半減は final ではなく防御補助に見える。
14. boss HP が多いだけだと作業になる。
15. boss が無敵になるだけだと理不尽に見える。
16. 画面中央の cue が必要。
17. cue と入力可能状態がずれると混乱する。
18. gauge 不足で cue だけ出ると罰に見える。
19. BOMB が clear に直結すると役割は明確。
20. ただし鍵穴化のリスクがある。
21. lock まで通常ショットで進めると、通常プレイの流れは残る。
22. lock は boss 終盤だけに限定できる。
23. lock 発生時に gauge を満タン化すれば「撃てる cue」になる。
24. `bossFinalCue` flag を検証できる。
25. bot が BOMB 使用 clear すれば検査できる。
26. 敵配置へ手を入れないので diff が読みやすい。
27. v28 へ戻す手順も短い。
28. BOMB damage は boss final だけで意味を持てばよい。
29. Active DEF を触らないため副作用が少ない。
30. 人間評価では強制感を確認する必要がある。

改善案:

1. boss 終盤で CORE LOCK を表示する。
2. boss 終盤で gauge を満タン化する。
3. BOMB damage を boss final で clear に足る値へ上げる。
4. BOMB なしでは通常ショットが lock HP 以下を削れないようにする。
5. lock 中だけ画面中央に `PRESS SPACE/B` を出す。
6. bot は `bossFinalCue` を見て BOMB を撃つ。
7. headless は cue flag と BOMB clear を検査する。
8. BOMB cooldown はそのままにする。
9. Active DEF は触らない。
10. wave timing は触らない。
11. boss HP 全体は触らない。
12. clear grade は BOMB 使用で S を継続する。
13. cue popup を短くする。
14. lock HP を低めにして通常ショット区間を残す。
15. cue 発生前に BOMB を撃ててもよいが、bot は final まで温存する。
16. `CORE CHARGED` と `CORE LOCK` が混ざりすぎないよう中央文言を明確化する。
17. README に「検証用 diff」と明記する。
18. devlog に強制感リスクを書く。
19. check は `?bot=1` を明示する。
20. final cue を stageFlags に残す。
21. v29 は BOMB cue 以外の評価を主張しない。
22. boss visual は最小変更に留める。
23. lock を見えない補正にしない。
24. gauge refill は lock イベントの一部として扱う。
25. BOMB key は SPACE/B 両方を表示する。
26. clear probe は手動 BOMB の機能を維持する。
27. Active DEF probe は regress していないか残す。
28. v28 の 1942 trace checks は維持する。
29. staging に BOMB 使用数を残す。
30. continuous directive の last_result を更新する。

筋の良い案:

- **CORE LOCK + guaranteed BOMB**: boss 終盤で削りが止まり、cue と gauge refill を同時に出す。

解決できる問題:

- BOMB なし clear では final cue を評価できない問題。
- BOMB を撃つべき瞬間が曖昧な問題。
- headless が BOMB 役割を検査していない問題。

新しく生じる懸念:

- 「BOMB を撃て」という鍵穴に見える可能性。
- gauge refill が都合のよい補正に見える可能性。
- boss 終盤で通常ショットが効かないことに違和感が出る可能性。

## 設計サイクル 2

候補比較:

1. cooldown 強化: 連打は防ぐが、final cue にはならない。
2. BOMB 後弾速半減: 防御補助にはなるが、boss final で撃つ理由が薄い。
3. score boost: 体感 cue として弱い。
4. boss 大弾幕化: BOMB を撃ちたくなるが、避けられないだけに見える危険がある。
5. CORE LOCK: 強制感はあるが、BOMB の役割は最も明確。

複数問題を同時に解ける案:

- CORE LOCK は cue / BOMB 使用 / headless 検証を同時に解く。
- 敵配置や道中資源設計を触らないため、v28 trace study の評価を壊しにくい。

懸念:

- 面白さではなく手続きとして BOMB を押させているだけになる可能性がある。これは次回の人間プレイ確認事項に回す。

## 設計サイクル 3

採用:

1. `BOSS_FINAL_LOCK_HP = 17`
2. lock 発生時に `bossFinalCue` flag を立てる。
3. lock 発生時に gauge を `G_MAX` にする。
4. lock 中は boss への通常ショット damage を止める。
5. BOMB boss damage を 22 にして、lock 後の BOMB で clear できるようにする。
6. headless は `botClearsWithBomb` を必須にする。

捨てる:

1. 道中 wave の追加変更。
2. Active DEF の再調整。
3. BOMB cooldown の再調整。
4. score multiplier や弾速半減の追加。
5. boss 弾幕密度で BOMB を強制する案。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v29_check.js
```

期待:

- 1942 trace の既存検査がすべて通る。
- `bossFinalCue` が true になる。
- bot が BOMB を 1 回使用する。
- bot が `S` clear する。

## 検証結果

2026-05-21 実行。`bossFinalCue: true`、`bombCount: 1`、`grade: "S"`、`botClearsWithBomb: true` を確認。

## 残課題

人間プレイで、CORE LOCK が「ここで BOMB を撃つ climax」と読めるか、「指定された入力を押すだけ」と見えるかを確認する。後者なら、lock ではなく boss の危険行動や演出で BOMB を自然化する必要がある。

# graze_log v05.2_cdx_v34 design_log

## v34 追加判断

v33 は中盤以降の画面内密度を戻したが、プレイヤー火力が高いため、出た敵が即座に消えて単調になる問題が残った。
この問題をプレイヤー火力低下で解くと、shot_log 由来の撃破感を壊す。
そのため、敵側に follow-up 構造を追加する。

採用:

- armored carrier: 画面内で一定時間後に左右へ heli を放出する。撃破が速くても、放出済みの対象が次の判断になる。
- shield wall: 中盤以降に3 lane の硬い対象を置く。中央を削るか左右を拾うか、撃破順を作る。
- headless: `antiInstantKillStructure` で armored / shield の存在と撃破を確認する。

検証結果:

- `antiInstantKillStructure: true`
- `midLateDensity: true`
- `botClearsWithBomb: true`
- bot は `killCount=116`, `maxChain=14`, `bombCount=1`, `grade=S`

---

# graze_log v05.2_cdx_v33 design_log

## v33 追加判断

v32 は前半の chain route は改善したが、中盤以降で画面内に撃てる敵がほとんどいない時間が長かった。
原因は、敵数不足だけではなく、stop 型 trace に `duration:9999` を使ったことで midboss / boss / bunker が画面内へ到達しなかったこと。

そのため、単に敵数を増やすのではなく、DonPachi 風の route 文法を保ったまま、次を追加した。

- midboss 前: left/right feeder
- post-midboss: center tank pair
- final bunker 後: side connector
- boss 前: braid heli

また、midboss / boss / bunker は短い entry duration で画面内へ入り、そこで留まるよう修正した。

## 追加検証結果

`node tools\headless_graze_log_cdx_v05_2_v33_check.js` は pass。
bot は `killCount=113`, `maxChain=14`, `bombCount=1`, `grade=S`。

画面内で撃てる敵を 180 frame ごとに測ると、midboss approach / feeder / escort / post-midboss / final bunker / boss approach が出るようになった。
一方で bot の火力が高く、瞬間的に `shootable=0` になるサンプルは残る。
次回は、人間プレイの体感に近い slower-kill bot か、敵ごとの最低滞在時間を評価に追加する。

---

# graze_log v05.2_cdx_v32 design_log

## 対象フィードバック

v09 は既存ゲームの参照を再現できていない低質な劣化コピーであり、複数タイトルを寄せ集めても散漫さが増すだけ。
v30 も単に出現テンポが変わっただけで、敵の出現パターンや移動アルゴリズムの悪さは残っている。
shot_log はベストではないにせよ最低限の水準に達していたため、その方向の「気持ちよい敵配置」を、より精度を上げて作る必要がある。

## 実装前判断

複数タイトル混合をやめる。
v32 は DonPachi Stage 1 に寄せる。

参照元の完全コピーではなく、公開資料で確認できる stage 文法を graze_log のルールへ移す。
具体的には、30f chain window、硬い敵を chain 早期に入れる構造、bunker release、high turret midboss、boss 部位構造を採用する。

## 採用

1. 30f chain window を `CHAIN_WINDOW=30` として実装。
2. 小型 heli connector を短い列として置く。
3. tank / bunker / crane / stock carrier を硬い chain 起点にする。
4. bunker は時間経過で smallTank を放出する。
5. midboss は aimed + spread の短い危険ピークにする。
6. boss は core + back/side parts にする。
7. back part は wide 7-way、side part は fast stream。
8. parts 破壊後に core を開き、BOMB cue を出す。

## 捨てたもの

- v09 の Ikaruga / Gradius / Touhou / DonPachi 混合。
- v30 の `spawnFuelColumns` 型の直線 fuel 追加。
- 「敵数が増えればよい」という評価。

## 検証

`node tools\headless_graze_log_cdx_v05_2_v32_check.js` pass。

bot は `killCount=67`, `maxChain=16`, `bombCount=1`, `grade=S`。
`usesSingleSource`, `chainWindowModeled`, `reachesMidboss`, `reachesBossParts`, `usesHardTargetRelease`, `bossPartStructure`, `botClearsWithBomb` がすべて true。
