# graze_log v05.2_cdx_v63 design_log

## 対象 directive と原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。Nao_u の継続指示は「`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける」こと。

直近の追加方針は、2026-05-22 の直接指示「別の指示があるまでは、ゲーム制作そのものよりも、AIがゲームを作る際のヘッドレスのあり方がどうあるべきかの検討と実地検証を重ねる形で進めて。ヘッドレス測定に必要であればゲームを改変しても良いが、主眼は自動実行で何をどう振るのが良さそうかの検証の方。」を維持する。

## 実装前判断

v62 は CHASE popup の距離、近すぎ/遠すぎ、遮蔽率を headless telemetry で pass させた。ただし directive の次焦点は Browser Use または実機で、プレイヤー近傍 rail の CHASE 表示が「報酬として読めるか」「邪魔にならないか」を見ることだった。

このセッションでは Browser Use skill は読んだが、必要な Node REPL `js` 実行ツールが公開されていなかった。そのため今回は、ゲーム性を変えずに `probeFrame` の実ブラウザ目視確認を強める。`window.__probe` に CHASE popup の画面座標、推定テキスト box、HUD 近接、プレイヤー距離を出し、focused check では実際の CHASE popup 発生 frame を再生して snapshot が読める位置にあることを検証する。さらに Chrome/Edge headless の screenshot probe も残す。

採用した過去知見:

- `memory/game_headless_action_eval_playbook_20260523.md`: 主観的な不満を bot policy と時系列指標へ翻訳する。ただし「楽しい」の代替にはしない。
- `memory/game_memory_task_lens_index.md` の `Playable / Headless 評価` と `Repair / Iterative Improvement`: score 平均ではなく、route/aggressive/marksman/camper の分離と bad-policy failure を維持する。
- v62 devlog: 距離指標は pass したが、人間の報酬感は別軸として残す。

## 設計サイクル 1

現状の良いところ/悪いところ 30件:
1. v62 の route/aggressive/marksman は clear する。2. camper は clear しない。3. CHASE bonus は good policy に出る。4. camper は CHASE bonus を得ない。5. popup 距離は bounded。6. too-far は 0。7. too-near も 0。8. boss cue overlap は 0。9. threat overlap は低い。10. ただし人間が読むかは未確認。11. Browser Use が使えれば最短だった。12. 今回は Node REPL がない。13. Chrome screenshot は代替になる。14. screenshot だけでは構造値が残りにくい。15. `window.__probe` に座標を残すと後で検証しやすい。16. gameplay を変えると v62 比較が崩れる。17. CHASE 表示の色は既に見える。18. テキスト box が canvas 内にあるか見る必要がある。19. HUD と近すぎないか見る必要がある。20. プレイヤーと近すぎないか見る必要がある。21. 遠すぎないかは既存指標で見る。22. 発生 frame を固定する必要がある。23. 1 frame だけでは偶然が残る。24. 4 frame 程度の probe が妥当。25. screenshots は `.tmp` に置けば commit しない。26. focused check に snapshot assertion を入れる。27. policy matrix は維持する。28. README に実行方法を残す。29. directive に今回結果を残す。30. staging に Browser Use 制約も残す。

改善案 30件:
1. v63 を作る。2. `GAME_VERSION` を更新。3. title を更新。4. `ROUTE_SOURCE_NOTES` に v63 を追加。5. `exportEvalLedger().source` を更新。6. `makeProbeSnapshot()` を追加。7. CHASE popup active count を出す。8. popup 座標を出す。9. text を出す。10. side を出す。11. life を出す。12. player distance を出す。13. 推定 text box を出す。14. canvas 内判定を出す。15. HUD 近接判定を出す。16. player 近接判定を出す。17. far 判定を出す。18. readable frame boolean を出す。19. focused check に `makeProbeSnapshot` を露出する。20. 実発生した `chasePopup` event の frame を抽出する。21. 各 frame を再生する。22. snapshot を検証する。23. Chrome visual probe script を追加する。24. screenshot bytes を検証する。25. policy matrix は v63 へ向ける。26. README を更新する。27. devlog を更新する。28. directive を更新する。29. staging を更新する。30. commit/push する。

複数問題を一気に解決できる案:
ゲーム本体の CHASE 報酬設計は変えず、`probeFrame` を「スクリーンショット用」から「座標付き目視検証用」へ広げる。これで v62 の policy split を壊さず、Browser/実機で見るべき対象を固定できる。

採用案:
`v05_1_cdx_v63` として、ゲーム挙動は v62 と同一にし、probe 出力と検証だけを増やす。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v63_check.js
node tools\headless_graze_log_cdx_v05_2_v63_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v63_visual_probe_check.js
```

合格条件:

- route は clear し、route coverage 1 を維持する。
- route/aggressive/marksman は CHASE bonus を得る。
- camper は CHASE bonus を得ず、clear しない。
- CHASE popup の距離/遮蔽/密度条件は v62 と同じく pass する。
- `makeProbeSnapshot()` が CHASE popup active frame を返し、canvas 内、HUD 非近接、player 非近接、遠すぎなしを満たす。
- Chrome/Edge headless screenshot が 4 frame 分生成される。

## 結果

2026-05-23 に検証を実行し、3 本とも pass。

- focused check: route bot clear、`chaseBonus 19157`、`chasePopupCount 28`、`chasePopupMeanSpawnPlayerDist 148.3`、`chasePopupMeanActivePlayerDist 157`、`chasePopupTooFarPct 0`、`chasePopupVisualProbe true`。
- policy matrix: route/aggressive/marksman は clear し CHASE bonus を得る。camper は clear 0 / CHASE bonus 0 を維持。
- visual probe: Chrome headless で `frame 751 / 906 / 1676 / 2296` の 4 screenshot を `.tmp/graze_log_cdx_v63_chase_probe/` に生成し、全ファイルが 25KB 超で存在確認 pass。

残課題:
Browser Use の Node REPL がこのセッションでは使えなかったため、今回は Chrome headless screenshot と `window.__probe` 座標 snapshot で代替した。次に in-app browser が使える時は、`probeFrame=906&probeDraw=1` などを実際に表示して、CHASE popup が報酬として視線に入るかを人間目視で確認する。
