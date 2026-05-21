# graze_log v05.2_cdx_v40 design_log

## 対象 directive

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の active 指示を対象にした。Slack direct pending はなし。

原文:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

直近焦点:

> v39 の simple bot は clear し、BOMB も使用する。次は人間プレイで、relay 生存中の locked route preview が「この relay を倒すと左右 route が開く」と読めるか、または視認ノイズや追加 UI に見えるかを確認する。

## 実装前判断

人間プレイ評価は未実施なので、v39 の読みやすさを「読めた」とは扱わない。ただし次の playable diff として、route preview が読めた後に何をさせるかを一段進める価値がある。v39 では relay 撃破で左右 route が両方開くため、開放後の行動がまだ「出た敵を全部撃つ」に戻りやすい。v40 は、最初に撃破した side connector を route 選択として確定し、その側だけに follow-up を出す。これにより、relay は「倒す gate」、side connector は「どちらへ寄るかの選択」になる。

使う過去知見:

- `Feedback / Rights / Human Judgment`: 追加説明ではなく、画面上の結果で操作理由を作る。
- `Playable / Headless 評価`: route 選択と follow-up 発火だけを deterministic に検査し、面白さ判定とは分ける。
- `Balance / Rule Space`: 敵 HP や火力の微調整ではなく、プレイヤーの位置取り選択をルールとして増やす。

## 設計サイクル 1

良いところ / 悪いところ 30件:

1. 良い: v39 は relay 生存中に locked route preview を見せる。
2. 良い: relay 撃破で side route が開く。
3. 良い: bot clear と BOMB 使用は維持されている。
4. 良い: shield break から relay への順序がある。
5. 良い: 既存の DonPachi 単一文法を壊していない。
6. 悪い: 開放後は左右両方に connector が出るだけ。
7. 悪い: プレイヤーの横移動判断がまだ弱い。
8. 悪い: relay preview が読めても次の選択が薄い。
9. 悪い: 「全部撃つ」へ戻ると route 感が弱い。
10. 悪い: 追加 UI で説明すると v39 の課題を増やす。
11. 良い: side connector の最初の撃破を選択として使える。
12. 良い: 入力追加なしで route 選択を作れる。
13. 良い: 左右どちらを選んだか flag 化できる。
14. 良い: follow-up を選んだ側だけに出せる。
15. 良い: chain 継続と位置取りがつながる。
16. 悪い: bot が片側に寄りすぎる可能性。
17. 悪い: 人間には選択が偶然に見える可能性。
18. 悪い: follow-up が多すぎると単なる敵追加になる。
19. 良い: 5機程度なら小さな route になる。
20. 良い: BOMB / boss は触らずに済む。
21. 良い: shield / relay 周辺だけに変更を閉じられる。
22. 悪い: route commit 表示が説明的になりすぎる危険。
23. 良い: popup は一度だけ短くできる。
24. 良い: 戻し手順が明確。
25. 良い: v39 の検証条件を維持できる。
26. 良い: `relayRouteChoiceCommitted` を追加できる。
27. 良い: `relayRouteCommittedFollowup` を追加できる。
28. 悪い: 面白さは headless では判断できない。
29. 良い: 次回の人間評価問いが「選んだ感」に絞れる。
30. 良い: 小パラメータ調整ではない playable diff になる。

改善案 30件:

1. v39 をコピーして v40 を作る。
2. title / h1 / title screen を v40 にする。
3. source note を v40 にする。
4. relay route connector に `routeChoice` を付ける。
5. 左 connector に `choiceDir:-1` を付ける。
6. 右 connector に `choiceDir:1` を付ける。
7. `spawnCommittedRoute(dir,x,y)` を追加する。
8. 最初の routeChoice 撃破で commit する。
9. commit 済みなら二度目は無視する。
10. 左選択 flag を立てる。
11. 右選択 flag を立てる。
12. 共通 commit flag を立てる。
13. follow-up flag を立てる。
14. follow-up heli は選んだ側だけへ出す。
15. follow-up は 5 機に抑える。
16. popup は `LEFT/RIGHT ROUTE COMMIT` だけにする。
17. BOMB final cue は触らない。
18. shield armor は触らない。
19. relay HP は触らない。
20. route preview は触らない。
21. headless v40 を作る。
22. v39 検査条件は維持する。
23. `relayRouteChoiceCommitted` を検査する。
24. README を更新する。
25. devlog を更新する。
26. design_log に判断を残す。
27. continuous directive を更新する。
28. staging に path / verification を残す。
29. 関係ない dirty files は stage しない。
30. commit / push する。

筋の良い案:

- **Side route commitment**: relay が開いた左右 connector のうち、最初に撃破した側を選択として確定し、その側だけに follow-up を出す。

解決できる問題:

- side route 開放後の行動が「全部撃つ」へ戻る問題。
- relay preview の次に何を判断するかが薄い問題。
- headless が route 開放後の選択を見ていない問題。

新しく生じる懸念:

- 人間に「自分が選んだ」と読まれるかは未検証。
- follow-up が敵追加に見える可能性がある。

## 設計サイクル 2

候補比較 30件:

1. 左右どちらかをランダムに開く案: 理不尽。
2. プレイヤー位置で自動選択する案: 見えない補正に近い。
3. 最初に撃破した側で選ぶ案: 入力結果が見える。
4. キー入力で選ぶ案: STG 中に新操作を増やす。
5. popup で選択を説明する案: 説明依存。
6. side connector の色だけ変える案: 体感差が弱い。
7. 片側 follow-up 案: route として画面が変わる。
8. 両側 follow-up 案: 選択にならない。
9. follow-up 10機案: clutter が増える。
10. follow-up 5機案: route として読める最小量。
11. HP 調整案: 本質改善ではない。
12. chain window 変更案: 既存検証が混ざる。
13. BOMB 変更案: 今回の焦点から外れる。
14. shield 再調整案: relay 後の問題を解かない。
15. 採用案は v39 の資産を使える。
16. 採用案は side connector の意味を強くする。
17. 採用案は headless flag 化できる。
18. 採用案は rollback が簡単。
19. 採用案は説明文を増やさない。
20. 採用案は敵種を増やさない。
21. 採用案はボス構造を壊さない。
22. 採用案は route log に載せなくても成立する。
23. 懸念は偶然撃破に見えること。
24. 懸念は bot priority が偏ること。
25. 懸念は follow-up 撃破で chain が強すぎること。
26. ただし今回は選択発火の検証が目的。
27. 人間評価は次回へ残す。
28. v40 で実装する価値がある。
29. 小変更だが体験構造は変わる。
30. 採用する。

改善案 30件:

1. `routeChoice` は heli の追加プロパティに留める。
2. `choiceDir` は -1 / 1 だけにする。
3. follow-up spawn は専用関数に隔離する。
4. commit 済み判定は `stageFlags` で行う。
5. left/right flag は検証用に分ける。
6. popup は commit 時のみ。
7. follow-up は画面内から下方向へ流す。
8. x 座標は clamp で画面外を避ける。
9. delay を付けて列にする。
10. 既存 routeChoice 以外の heli は選択に使わない。
11. relay route は v39 のまま左右へ開く。
12. unlock particle は維持する。
13. locked preview は維持する。
14. `relayPreviewUnlocks` は維持する。
15. `relayOpensSideRoute` は維持する。
16. `guaranteedFollowUpResidency` は維持する。
17. `botClearsWithBomb` は維持する。
18. source note に v40 を書く。
19. README に実行方法を書く。
20. devlog に戻し手順を書く。
21. design_log に残課題を書く。
22. headless は `v05_1_cdx_v40` を読む。
23. report に新 flag を出す。
24. failure 条件に新 flag を足す。
25. 検証後に必要なら bot 側を調整する。
26. 既存 dirty files は触らない。
27. staging は Game Start セクションに追記する。
28. continuous directive last_result を更新する。
29. commit は v40 関連ファイルだけ。
30. push 後に ahead/behind を確認する。

## 設計サイクル 3

実装採用 30件:

1. v40 フォルダを追加する。
2. v40 headless check を追加する。
3. `routeChoice` を relay side connector に付ける。
4. `choiceDir` を左右へ付ける。
5. `spawnCommittedRoute` を追加する。
6. `killEnemy` で最初の routeChoice 撃破を拾う。
7. `relayRouteChoiceCommitted` を立てる。
8. `relayRouteChoiceLeft` または `relayRouteChoiceRight` を立てる。
9. `relayRouteCommittedFollowup` を立てる。
10. 選んだ側へ 5 機出す。
11. popup を短く出す。
12. v39 の relay preview は維持する。
13. v39 の route unlock は維持する。
14. BOMB cue は維持する。
15. boss は維持する。
16. shield は維持する。
17. chain window は維持する。
18. bot clear を確認する。
19. route commit flag を確認する。
20. README を v40 にする。
21. devlog を v40 にする。
22. design_log を v40 にする。
23. continuous directive を v40 にする。
24. staging に検証結果を書く。
25. headless pass 後に diff を確認する。
26. 関係ない atom / log は stage しない。
27. commit する。
28. push する。
29. push 不能時は hash を報告する。
30. 残課題を明記する。

捨てたもの:

- route 選択をランダムにする案。
- プレイヤー位置で自動選択する案。
- 新しい選択キーを足す案。
- BOMB / Active DEF / boss の再調整。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v40_check.js
```

期待:

- `relayPreviewUnlocks: true`
- `relayOpensSideRoute: true`
- `relayRouteChoiceCommitted: true`
- `botClearsWithBomb: true`

## 検証結果

2026-05-21 実行。`relayPreviewUnlocks: true`、`relayOpensSideRoute: true`、`relayRouteChoiceCommitted: true`、`relayRouteChoiceLeft: true`、`relayRouteCommittedFollowup: true` を確認。既存条件の `readableShieldAbsorption`、`guaranteedFollowUpResidency`、`bossFinalCue`、`botClearsWithBomb` も true。bot は `mode=clear`、`killCount=140`、`maxChain=18`、`bombCount=1`、`grade=S`。

## 残課題

人間プレイで、最初に撃破した side connector が「自分が選んだ route」として読めるか、または偶然出た追加敵に見えるかを確認する。読めない場合は、follow-up 数ではなく route 選択の視覚的な前後関係を切り直す。
