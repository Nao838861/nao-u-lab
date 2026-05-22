# graze_log v05.2_cdx_v52 design_log

## 対象 directive 原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

現在の焦点:

> 次は v51 を実ブラウザで見て、chevron なしでも横移動 wave の左右圧が読めるか、alpha 0.10 が薄すぎないかを確認する。Browser Use Node REPL が使えない場合は、今回追加した canvas visual check を補助証拠として使い、実目視は未完了と明記する。

## 実装前判断

Browser Use skill は読んだが、このセッションには必須の Node REPL `js` ツールが公開されていない。Chrome headless は使えるが、通常の `requestAnimationFrame` 進行では screenshot が初期フレームに留まった。そのため v52 はゲーム内容を変えず、実ブラウザで exact frame を撮るための `probeFrame` 検証モードを追加する。

使う過去知見:

- `Playable / Headless 評価`: 起動だけでなく、狙った瞬間の可視状態を検証する。
- `Repair / Iterative Improvement`: 面白さを断定せず、次の判断に必要な観測点を足す。
- `Feedback / Rights / Human Judgment`: headless は人間評価の代替ではない。見え方の証拠を人間判断へ渡す。

## 設計サイクル 1

良いところ / 悪いところ 30 件:

1. 良い: v51 は clear / grade S を維持している。
2. 良い: v51 は chevron を削除済み。
3. 良い: guide event に `chevrons:false` が残る。
4. 良い: command visual check は chevron 0 を検証した。
5. 悪い: 実ブラウザの目視は未完了。
6. 悪い: Chrome screenshot は rAF が進まず初期フレームだけになった。
7. 良い: exact frame を同期実行すれば screenshot できる。
8. 悪い: 同期実行 mode は通常プレイと違う入口になる。
9. 良い: query param に閉じれば通常プレイを変えない。
10. 悪い: query param が増えると README が必要。
11. 良い: `window.__probe` で ledger も取れる。
12. 悪い: screenshot の色味評価はまだ主観が必要。
13. 良い: post-midboss frame 3090 は v51 visual check と対応する。
14. 良い: cross-lock frame 3890 も対応する。
15. 悪い: 1 枚だけでは動きの読め方は分からない。
16. 良い: まず静止画で alpha が見えるかは判断できる。
17. 悪い: bot が無敵なので被弾圧は実プレイと違う。
18. 良い: guide 視認性を見るだけなら無敵 bot でよい。
19. 良い: stage / enemy / bullet は v51 のままにできる。
20. 悪い: playable content の新味はない。
21. 良い: focused evaluation として継続 directive に合う。
22. 悪い: 完成判断にはまだ足りない。
23. 良い: Chrome/Edge だけで動く。
24. 悪い: Chrome がない環境では fallback が必要。
25. 良い: `.tmp` 出力なら commit を汚さない。
26. 悪い: `.tmp` の証拠は git に残らない。
27. 良い: design_log に検証結果を残せる。
28. 悪い: Browser Use unavailable の理由を書かないと後で迷う。
29. 良い: v52 は戻しやすい。
30. 良い: 次の alpha 調整判断がしやすくなる。

改善案 30 件:

1. v51 を v52 にコピーする。
2. `GAME_VERSION` を v52 にする。
3. title / h1 を v52 にする。
4. ledger source を v52 にする。
5. source notes に probe mode を足す。
6. `PROBE_FRAME` を query から読む。
7. `PROBE_DRAW` を query から読む。
8. `probeFrame` 指定時に `startGame()` する。
9. bot iframe を長くして screenshot 中の事故を避ける。
10. 指定 frame まで `update()` する。
11. 1 回 `draw()` する。
12. `requestAnimationFrame` loop は回さない。
13. `window.__probe` を残す。
14. active guides を probe に入れる。
15. ledger を probe に入れる。
16. 通常 play path は v51 と同じにする。
17. guide alpha は変えない。
18. guide lineWidth は変えない。
19. chevrons:false は変えない。
20. enemy / bullet / rewards は変えない。
21. v52 normal check を作る。
22. v52 visual command check を作る。
23. Chrome probe check を作る。
24. style compare v012 を作る。
25. latest2 compare を走らせる。
26. README を更新する。
27. devlog を更新する。
28. continuous directive を更新する。
29. staging に記録する。
30. commit / push する。

筋の良い案:

`probeFrame` を追加し、通常ゲーム内容は一切変えない。解決できる問題は、Browser Use が使えない時でも実ブラウザ描画の exact frame 証拠を作れること。新しい懸念は、検証 mode が増えるため通常プレイとの差分を明確に記録する必要があること。

## 設計サイクル 2

良いところ / 悪いところ 30 件:

1. 良い: query param は既存の `botStyle` と相性が良い。
2. 悪い: `probeFrame` が通常 bot と同時指定された時の優先順位が必要。
3. 良い: probe を優先すれば deterministic。
4. 悪い: frame が大きすぎると処理時間が増える。
5. 良い: 今回の 3890 frame は軽い。
6. 悪い: clear 後 frame は mode が止まる。
7. 良い: mode も probe に出せば分かる。
8. 悪い: screenshot pixel 内容の自動評価はしない。
9. 良い: PNG size と存在確認は最低限できる。
10. 悪い: PNG size は画質保証ではない。
11. 良い: `view_image` で人間視認できる。
12. 悪い: final commit には画像を入れない。
13. 良い: `.tmp` に出せば作業証拠として十分。
14. 悪い: `.tmp` は git status に出ない可能性がある。
15. 良い: headless check の JSON に path が出る。
16. 悪い: Browser Use ではないため in-app tab ではない。
17. 良い: skill 不可理由を devlog に残す。
18. 悪い: actual viewport は Chrome headless 固定。
19. 良い: canvas 420x620 が収まる 520x760 を使う。
20. 悪い: ブラウザ UI なしなので実手操作とは違う。
21. 良い: visual guide の薄さを見るには十分。
22. 悪い: 動きの方向性は still だけでは弱い。
23. 良い: 次に 3 frame 連続 screenshot へ拡張できる。
24. 悪い: いきなり動画化は重い。
25. 良い: current wave の guide が active か確認できる。
26. 悪い: v52 で gameplay digest は v51 と同じになりやすい。
27. 良い: 同じであること自体が今回の狙い。
28. 悪い: 変化が評価基盤だけに見える。
29. 良い: 継続 directive は playable diff か focused evaluation でよい。
30. 良い: 次の調整は screenshot を見て決められる。

改善案 30 件:

1. `PROBE_FRAME` を null / integer にする。
2. `Number.isFinite` で不正値を捨てる。
3. frame は `Math.floor` する。
4. `PROBE_DRAW` は `probeDraw=1` の時だけにする。
5. seedinfo に probeFrame を表示する。
6. `probeFrame` 指定時は bot 有無に関係なく start する。
7. `state.player.iframe=999999` を入れる。
8. while loop は `state.mode==='play'` で止める。
9. `draw()` 後は loop しない。
10. `window.__probe` は `probeDraw` の時だけ出す。
11. guides map は最小項目にする。
12. ledger は `exportEvalLedger()` を使う。
13. source notes に v52 を足す。
14. v52 check で source notes を確認する。
15. visual check は v51 と同条件にする。
16. Chrome probe は Chrome/Edge candidate を探す。
17. screenshot は post_mid / cross_lock 2 枚にする。
18. file URL は Windows path を slash へ変換する。
19. space は `%20` にする。
20. URL は spawn args で渡す。
21. PowerShell の `?` 変数展開問題を避ける。
22. bytes threshold は 25KB にする。
23. outDir は `.tmp/graze_log_cdx_v52_probe` にする。
24. README に probe の使い方を書く。
25. devlog に rAF 問題を書く。
26. design_log に Chrome fallback を書く。
27. continuous directive last_result を v52 にする。
28. staging に screenshot path を書く。
29. commit には `.tmp` を入れない。
30. push 後 status を確認する。

筋の良い案:

検証 mode は query param だけで起動し、通常起動では v51 と同じ `loop()` を使う。解決できる問題は、実プレイの挙動を汚さずに screenshot harness を得ること。懸念は、probe mode が今後の gameplay API と混ざらないよう README に明示する必要があること。

## 設計サイクル 3

良いところ / 悪いところ 30 件:

1. 良い: v52 は exact frame screenshot を作れる。
2. 良い: v51 の clear 条件を維持できる。
3. 良い: v51 の guide style を維持できる。
4. 良い: route / aggressive / defensive / panic 比較を維持できる。
5. 良い: source note で目的が追える。
6. 良い: Chrome probe script は依存が少ない。
7. 良い: `.tmp` 出力は安全。
8. 悪い: Chrome がないと失敗する。
9. 悪い: Browser Use の代替であり、完全な in-app browser 確認ではない。
10. 悪い: still 画像では動きの予測しやすさは限定的。
11. 悪い: alpha 判断は主観が残る。
12. 良い: 画像を見た上で次の alpha 変更を決められる。
13. 良い: v52 は gameplay を変えないので regression risk が低い。
14. 悪い: playable 改善ではなく evaluation 改善。
15. 良い: 継続 directive は focused evaluation を許容している。
16. 悪い: Nao_u の完成条件はまだ未達。
17. 良い: next action が alpha / duration / ghost path に絞れる。
18. 良い: probe は将来版でも使える。
19. 悪い: query param が増えすぎると保守負担。
20. 良い: `probeFrame` は汎用なので増やしにくい。
21. 悪い: `probeDraw` の名前は少し内部向け。
22. 良い: internal probe なので許容できる。
23. 良い: check が PNG path と bytes を出す。
24. 悪い: screenshot を自動 pixel 判定しない。
25. 良い: command visual check と組み合わせれば最低保証になる。
26. 良い: style compare latest2 で gameplay 同値を確認できる。
27. 悪い: latest2 に過去 record が溜まる。
28. 良い: version comparison はこの運用の前提。
29. 良い: commit scope は明確。
30. 良い: push まで進められる。

改善案 30 件:

1. 採用案を `probeFrame` に固定する。
2. game content は変えない。
3. v52 check を走らせる。
4. v52 visual command check を走らせる。
5. Chrome probe check を走らせる。
6. generated PNG を `view_image` で確認する。
7. style compare v012 を走らせる。
8. latest2 compare を走らせる。
9. 結果を design_log に追記する。
10. devlog に結果を追記する。
11. continuous directive を更新する。
12. staging に記録する。
13. git status で差分を確認する。
14. 自分のファイルだけ stage する。
15. `.tmp` は stage しない。
16. 既存 dirty memory は混ぜない。
17. commit message は `game:` にする。
18. push する。
19. push 後 status を見る。
20. 次焦点を screenshot 目視結果にする。
21. alpha が薄いなら v53 で 0.12 を試す。
22. alpha が強いなら duration 短縮を試す。
23. still で読めるなら moving check を検討する。
24. Browser Use が戻ったら in-app browser でも見る。
25. panic policy の限界は維持して明記する。
26. route bot は評価補助として扱う。
27. fun 判定はしない。
28. Nao_u 判断を待つ部分を残課題にする。
29. Claude 側は触らない。
30. 作業完了後に push hash を報告する。

筋の良い案:

v52 は「見た目を変える前に、見える証拠を作る」版にする。解決できる問題は、alpha 調整を推測でやらずに実ブラウザ画像へ接続できること。新しい懸念は、今回だけではゲームの面白さ自体は増えないこと。

## 採用案

`v05_1_cdx_v52` として、通常プレイを v51 と同じに保ち、`?probeFrame=N&probeDraw=1` で指定 frame を同期描画する検証 mode を追加する。

## 懸念

- Browser Use in-app browser ではなく Chrome headless による確認である。
- still screenshot では、横移動 wave の動きとしての読みやすさはまだ分からない。
- alpha 0.10 が薄すぎるかどうかは画像確認後に判断する。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v52_check.js
node tools\headless_graze_log_cdx_v05_2_v52_visual_check.js
node tools\headless_graze_log_cdx_v05_2_v52_chrome_probe_check.js
node tools\headless_game_style_compare_v012.js
node tools\compare_graze_log_style_latest2.js
```

## 検証結果

2026-05-22 実行。

- `node tools\headless_graze_log_cdx_v05_2_v52_check.js`: pass。route bot は `mode=clear`、`grade=S`、`routeEvents=29`、`killCount=162`、`maxChain=20`、`bombCount=1`。`crossLockGuide=1`、`postMidCrossGuide=1`、`readabilityGuides=2`、guide event は `alpha=0.10`、`lineWidth=2.2`、`paths=2`、`chevrons=false`。
- `node tools\headless_graze_log_cdx_v05_2_v52_visual_check.js`: pass。frame 3090 / 3890 の canvas command で nonblank draw ops、guide path stroke 2 本、chevron-like stroke 0 本を確認。
- `node tools\headless_graze_log_cdx_v05_2_v52_chrome_probe_check.js`: pass。Chrome で `.tmp/graze_log_cdx_v52_probe/v52_post_mid.png` と `.tmp/graze_log_cdx_v52_probe/v52_cross_lock.png` を生成し、それぞれ 43KB 以上。
- 画像目視: alpha 0.10 の guide はかなり薄いが、post-midboss / cross-lock ともに左右へ交差する path として見える。矢印記号感は戻っていない。
- `node tools\headless_game_style_compare_v012.js`: pass。v52 record を `memory/raw/game_eval/graze_log_style_compare.jsonl` に追記。
- `node tools\compare_graze_log_style_latest2.js`: pass。v51 -> v52 は route / aggressive が clear 維持、defensive / panic が over 維持。routeEvents、kills、hits、bombs、pressure、movementSwitches、guide trace digest は全 policy で同値。

## 残課題

still screenshot では guide の動きとしての読め方は判定できない。次は Browser Use Node REPL が使える場合に in-app browser で実プレイ目視するか、probeFrame を複数連続で撮る小さな moving check を作る。
