# graze_log v05.2_cdx_v65 design_log

## 対象 directive と原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。Nao_u の継続指示は「`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける」こと。

直近の追加方針は、2026-05-22 の直接指示「別の指示があるまでは、ゲーム制作そのものよりも、AIがゲームを作る際のヘッドレスのあり方がどうあるべきかの検討と実地検証を重ねる形で進めて。ヘッドレス測定に必要であればゲームを改変しても良いが、主眼は自動実行で何をどう振るのが良さそうかの検証の方。」を維持する。

## 実装前判断

v64 は `probeBare=1` により、canvas 単体 screenshot の CHASE popup pixel を検査できた。残っている弱点は、次に人間目視へ渡す通常 UI 付き `probeFrame` URL について、viewport 内で canvas がどこに配置され、popup が実際の review screenshot 上でも読めるかを検査していない点である。

今回は gameplay を変えない。`probeReview=1` を追加し、通常 UI を残した 420x720 screenshot を headless Chrome で撮り、canvas top と CHASE popup の viewport 座標を検査する。これは「報酬として気持ちよい」の判定ではなく、人間評価へ渡す画面 surface の最低保証である。

採用した過去知見:

- `memory/game_headless_action_eval_playbook_20260523.md`: 主観評価を平均スコアへ圧縮せず、観測可能な policy と evidence に分ける。
- `memory/game_memory_task_lens_index.md` の `Playable / Headless 評価`: headless は補助証拠であり、人間評価の代替にしない。
- v64 devlog: pixel probe は「文字が画像内にある」最低保証で、報酬感の判断ではない。

## 設計サイクル

現状の良いところ/悪いところ:

1. v64 の route は clear する。2. policy matrix は good policy と camper を分ける。3. bare canvas pixel probe は通る。4. ただし通常 UI 付き screenshot は未検査。5. seedinfo が長いと canvas が押し下げられる可能性がある。6. header を消すと人間目視 URL と違う。7. 通常 UI を残しつつ review 用幅だけ固定するのがよい。8. canvas top を screenshot から検出できれば DOM 評価に依存しない。9. viewport box に変換して pixel scan すれば、実際に見える場所で検査できる。10. gameplay 変更は比較を壊す。

改善案:

1. v65 を作る。2. `probeReview=1` を追加する。3. review mode は header と説明文を残す。4. seedinfo を nowrap / ellipsis にして wrap 由来のずれを抑える。5. `visualContract.reviewUi` を追加する。6. bare pixel probe は維持する。7. 通常 UI screenshot は 420x720 にする。8. screenshot 内から canvas 背景色 row を検出する。9. canvas y が 36-90 に収まることを見る。10. CHASE popup box を viewport 座標へ変換して pixel scan する。11. focused check と policy matrix は v65 path で維持する。12. README に review URL を残す。13. directive と staging に結果を残す。

採用案:

`v05_1_cdx_v65` として、v64 の game rules を維持したまま `probeReview=1` と normal-UI review surface check を追加する。

懸念:

headless Chrome の screenshot surface は実機や in-app browser の完全な代替ではない。今回の検査は、目視前に「URL を開いた時に canvas と CHASE popup が viewport 内に存在する」ことを保証するだけで、邪魔さや報酬感は次の人間評価に残す。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v65_check.js
node tools\headless_graze_log_cdx_v05_2_v65_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v65_visual_probe_check.js
```

合格条件:

- route は clear し、route coverage 1 を維持する。
- route/aggressive/marksman は CHASE bonus を得る。
- camper は CHASE bonus を得ず、clear しない。
- bare canvas visual probe は 4 screenshot を 420x620 で生成し、CHASE popup pixel 条件を満たす。
- normal UI review probe は 2 screenshot を 420x720 で生成し、canvas top と viewport 上の CHASE popup pixel 条件を満たす。

## 結果

2026-05-24 に検証を実行し、3 本とも pass。

- focused check: route bot clear、`chaseBonus 19157`、`chasePopupCount 28`、`chasePopupMeanSpawnPlayerDist 148.3`、`chasePopupMeanActivePlayerDist 157`、`chasePopupTooFarPct 0`、`chasePopupVisualProbe true`。
- policy matrix: route/aggressive/marksman は clear し CHASE bonus を得る。camper は clear 0 / CHASE bonus 0。
- visual probe: bare canvas screenshot 4 枚、各 420x620。各 CHASE popup box で `chasePixels 27`、`lumaGap 86.1-86.8`、`pixelProbePass true`。
- normal UI review probe: screenshot 2 枚、各 420x720。`canvasRect.y 56`、各 viewport CHASE popup box で `chasePixels 14`、`lumaGap 88.5`、`reviewSurfacePresent true`。

残課題:
Browser Use skill は読んだが、このセッションでは Node REPL `js` tool が公開されていなかったため、in-app browser 操作は実行していない。次は通常 UI 付きの `probeFrame=838&probeDraw=1&probeReview=1` を目視し、CHASE popup が報酬として読めるか、邪魔にならないかを人間評価へ渡す。
