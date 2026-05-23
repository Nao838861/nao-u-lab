# graze_log v05.2_cdx_v64 design_log

## 対象 directive と原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。Nao_u の継続指示は「`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける」こと。

直近の追加方針は、2026-05-22 の直接指示「別の指示があるまでは、ゲーム制作そのものよりも、AIがゲームを作る際のヘッドレスのあり方がどうあるべきかの検討と実地検証を重ねる形で進めて。ヘッドレス測定に必要であればゲームを改変しても良いが、主眼は自動実行で何をどう振るのが良さそうかの検証の方。」を維持する。

## 実装前判断

v63 は `probeFrame` の座標 snapshot と Chrome screenshot 生成確認まで進めた。残っている弱点は、スクリーンショットが存在しても、実際に CHASE 文字が想定 box 内に描かれているかを検証していない点である。

今回は gameplay を変えない。`probeBare=1` を追加して Chrome screenshot を canvas だけに固定し、PNG を直接読んで CHASE popup box 内の色ピクセルと背景輝度差を検査する。これは「楽しい」の判定ではなく、目視評価へ渡す前の deterministic evidence である。

採用した過去知見:

- `memory/game_headless_action_eval_playbook_20260523.md`: 主観評価を平均スコアへ圧縮せず、観測可能な bad/good policy と時系列 evidence に分ける。
- `memory/game_memory_task_lens_index.md` の `Playable / Headless 評価`: headless は補助証拠であり、人間評価の代替にしない。
- v63 devlog: CHASE popup の距離条件は pass したが、画像内に描かれた文字そのものは未検証だった。

## 設計サイクル 1

現状の良いところ/悪いところ 30件:
1. v63 の route は clear する。2. aggressive も clear する。3. marksman も clear する。4. camper は clear しない。5. camper は CHASE bonus を得ない。6. CHASE popup 距離は bounded。7. boss cue overlap は 0。8. threat overlap は低い。9. screenshot 生成は pass。10. ただし画像内容は未検査。11. bytes check は弱い。12. 座標 snapshot はある。13. canvas offset が通常 UI でずれる。14. `file://` screenshot は再現可能。15. Browser Use の Node REPL は使えない。16. Chrome headless は使える。17. PNG は Node 標準 zlib で読める。18. Pillow 依存は避けたい。19. popup は alpha 付きで薄い。20. 閾値は実測が必要。21. CHASE 色は緑系。22. 背景は暗い。23. box 内 pixel scan なら証拠が残る。24. gameplay を変えると比較が壊れる。25. bare canvas mode は gameplay 外の probe。26. 通常 UI の目視対象は残す。27. focused check は維持する。28. policy matrix は維持する。29. README に probe URL を残す。30. directive と staging に結果を残す。

改善案 30件:
1. v64 を作る。2. v63 をコピーする。3. `GAME_VERSION` を更新する。4. title を更新する。5. source path を更新する。6. `ROUTE_SOURCE_NOTES` に v63 と v64 を両方残す。7. `probeBare=1` を追加する。8. bare 時は h1/p/seedinfo を隠す。9. bare 時は canvas margin を 0 にする。10. bare 時は shadow を消す。11. `visualContract` を snapshot に入れる。12. canvas サイズを contract に入れる。13. expected CHASE RGB を入れる。14. background RGB を入れる。15. visual probe check を書き直す。16. Chrome screenshot を 420x620 で撮る。17. PNG signature を検査する。18. IHDR/IDAT を読む。19. zlib inflate する。20. PNG filter を展開する。21. box 内 pixel を scan する。22. 緑系 pixel 数を見る。23. 暗背景 pixel 数を見る。24. 輝度差を見る。25. 4 frame を検査する。26. bytes 閾値は bare canvas 向けに調整する。27. focused check に v64 source note を加える。28. policy matrix は path 更新だけにする。29. devlog を更新する。30. README を更新する。

筋の良い案:
ゲーム本体を変更せず、probe surface だけを「座標」から「画像内 pixel」へ広げる。これで v63 までの policy split を保ちつつ、headless が見ている画面証拠の質を上げられる。

懸念:
pixel probe は文字の存在を示すだけで、プレイヤーが報酬として読むかは判断できない。alpha 付き文字なので閾値を強くしすぎると false negative になる。

## 設計サイクル 2

現状の良いところ/悪いところ 30件:
1. `probeBare` は目視用 UI を消せる。2. canvas 座標と screenshot 座標が一致する。3. 通常 URL は残る。4. test は外部依存なし。5. Node 標準だけで PNG を読める。6. PNG filter 実装はやや複雑。7. Chrome screenshot の bytes は bare で小さくなる。8. 従来 25KB 閾値は使えない。9. 420x620 寸法検査は強い。10. pixel 色検査は bytes より強い。11. popup の life が alpha に影響する。12. early frame は薄めに見える。13. box 推定がずれると false negative になる。14. box は v63 で算出済み。15. baseline 背景が暗い。16. 弾や敵が box に入ると色検査が紛れる。17. popup 位置は side rail で安全。18. green hue 条件は CHASE に合う。19. cyan 弾との混同があり得る。20. box 内限定なら混同は少ない。21. `CHASE xN` の文字幅も対応必要。22. 今回の first 4 は `CHASE`。23. 次は `CHASE xN` も見る価値がある。24. policy matrix の JSON 出力は大きい。25. それでも regression には有効。26. visual probe は結果が短い。27. `.tmp` は commit しない。28. screenshot artifact は残せる。29. Browser Use で見る時の URL が明確になる。30. この版は headless 方法論の差分として妥当。

改善案 30件:
1. `screenshotsPresent` を寸法 + bytes で見る。2. bytes は 10000 以上に下げる。3. `pixelProbePass` を別 assert にする。4. `chasePixels` を出す。5. `bgPixels` を出す。6. `meanChaseLuma` を出す。7. `meanBgLuma` を出す。8. `lumaGap` を出す。9. 色条件は green dominance にする。10. alpha 付きなので `g>=70` から始める。11. `g-r>=25` を使う。12. `g-b>=0` を使う。13. chase pixel は 24 以上にする。14. background pixel は 20 以上にする。15. luma gap は 40 以上にする。16. 実測後に結果を design log に残す。17. false positive を避けるため box 外は見ない。18. `probeSnapshot` は VM で取る。19. Chrome URL は同じ frame を使う。20. frame は ledger の chasePopup event から取る。21. 固定 frame の手入力をやめる。22. 4 件だけ見る。23. focused check の snapshot は通常 UI のままにする。24. visual check だけ bare にする。25. `visualContract.bareCanvas` を true assert にする。26. 通常 snapshot では false を assert する。27. README に bare URL を書く。28. devlog に pixel 結果を書く。29. directive の last_result を更新する。30. staging に verification を書く。

筋の良い案:
route ledger から実際に発生した CHASE popup frame を選び、同じ frame を VM snapshot と Chrome screenshot の両方で検証する。手入力 frame より、今後 popup 発生時刻が変わっても壊れにくい。

懸念:
「最初の 4 件」は early に偏る。今回は v64 の目的が pixel probe の確立なので許容し、次に必要なら `CHASE xN` や boss 近辺を sampling に足す。

## 設計サイクル 3

現状の良いところ/悪いところ 30件:
1. 実装範囲が小さい。2. gameplay 変更なし。3. route result が比較可能。4. camper failure が維持される見込み。5. Chrome 依存は既存 v63 と同じ。6. PNG parser は保守負荷がある。7. ただし外部依存なし。8. 文字描画は anti-alias される。9. 閾値は視認性の最低限にするべき。10. 輝度差は人間可読性と完全一致しない。11. それでも bytes より意味がある。12. `visualContract` は後で検査追加しやすい。13. `probeBare` は通常プレイに影響しない。14. CSS の body class は簡単。15. snapshot で bare 状態を確認できる。16. focused check は通常 snapshot を守る。17. visual check は bare snapshot を守る。18. README は短くできる。19. design_log は判断根拠を残せる。20. devlog は実装結果を残せる。21. directive は継続焦点を更新できる。22. staging はサイクル証拠になる。23. commit は今回ファイルだけを stage する必要がある。24. 既存自動サイクル差分は混ぜない。25. `.tmp` screenshot は stage しない。26. memory raw append は policy check が発生させるが既存差分に混ざりやすい。27. 自分の成果物として必要なら staging だけで十分。28. visual check の stdout は evidence になる。29. Browser Use skill は読んだが Node REPL tool は公開されていない。30. fallback として Chrome headless を使う理由は明確。

改善案 30件:
1. 実装後に focused check を走らせる。2. policy matrix を走らせる。3. visual pixel probe を走らせる。4. failed threshold は実測で調整する。5. threshold 調整理由を書く。6. docs を v64 専用に差し替える。7. v63 の文を残さない。8. `last_result` を更新する。9. `last_handled_at` を更新する。10. staging に path を書く。11. staging に command を書く。12. staging に result を書く。13. staging に next を書く。14. git status を見る。15. 自分のファイルだけ stage する。16. `.tmp` は stage しない。17. 既存 log/memory 差分は stage しない。18. commit message を明確にする。19. push する。20. push 後 status を見る。21. visual check の PNG parser を小さく保つ。22. `readPng` は RGB/RGBA だけ対応と明記する。23. unsupported format は fail にする。24. screenshot dimension を固定する。25. Chrome path fallback を維持する。26. route frames は ledger 由来にする。27. `pixelProbePass` を最終 gate にする。28. next は通常 UI で人間目視にする。29. 完成判断は Nao_u に残す。30. 次サイクルでは headless method の別軸へ進む。

筋の良い案:
v64 は「画像 evidence の最低保証」に限定し、面白さや報酬感の主張をしない。次に人間目視で使える URL と機械検査結果をセットで残す。

懸念:
pixel probe が通っても popup が小さい、薄い、注意が向かないという問題は残る。これは次回の実機/Browser 目視で判断する。

## 採用案

`v05_1_cdx_v64` として、v63 の game rules を維持したまま `probeBare=1` と pixel-level visual check を追加する。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v64_check.js
node tools\headless_graze_log_cdx_v05_2_v64_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v64_visual_probe_check.js
```

合格条件:

- route は clear し、route coverage 1 を維持する。
- route/aggressive/marksman は CHASE bonus を得る。
- camper は CHASE bonus を得ず、clear しない。
- visual probe は 4 screenshot を 420x620 で生成する。
- 各 CHASE popup box が green pixel 数、背景 pixel 数、輝度差条件を満たす。

## 結果

2026-05-23 に検証を実行し、3 本とも pass。

- focused check: route bot clear、`chaseBonus 19157`、`chasePopupCount 28`、`chasePopupMeanSpawnPlayerDist 148.3`、`chasePopupMeanActivePlayerDist 157`、`chasePopupTooFarPct 0`、`chasePopupVisualProbe true`。
- policy matrix: route/aggressive/marksman は clear し CHASE bonus を得る。camper は clear 0 / CHASE bonus 0 を維持。
- visual probe: Chrome screenshot 4 枚、各 420x620。各 box で `chasePixels 27`、`lumaGap 86.1-86.8`、`pixelProbePass true`。

残課題:
Browser Use skill は読んだが、このセッションでは Node REPL `js` tool が公開されていなかったため、in-app browser 操作は実行していない。次は通常 UI 付きの `probeFrame=838&probeDraw=1` を目視し、CHASE popup が報酬として読めるか、邪魔にならないかを人間評価へ渡す。
