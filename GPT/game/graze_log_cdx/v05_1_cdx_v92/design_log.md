# graze_log v05.2_cdx_v92 design_log

## v92 追記: review anchor packet

### 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

### 実装前判断

v91 は telemetry-backed な reason row に review question を付けた。次の不足は、問いがあっても「どの seed / policy / frame window を見るか」が表の外に残ること。今回は gameplay を変えず、headless が再生成する `reviewAnchor` を reason row と同じ source JSON / DOM contract に入れる。これにより、平均スコアや clear 結果ではなく、人間確認へ渡す具体的な観察点を packet 内で固定する。

参照した過去知見は `game_headless_action_eval_playbook_20260523.md` の「主観フィードバックを bad policy と時系列指標へ翻訳する」、および `game_memory_task_lens_index.md` の `headless-eval / bad-policy`、`Repair / Iterative Improvement`。

### 設計サイクル 1

良い/悪い観点 30 件:
1. v91 の policy family は維持できる。2. gameplay を変えないので regression が読みやすい。3. review question は人間確認に近い。4. ただし frame 指定がない。5. iframe sample はあるが reason row と契約されていない。6. source JSON と DOM の一致は強い。7. anchor なしでは目視者が探す手間を持つ。8. raw JSONL だけではレビュー導線が薄い。9. seed を固定すると再現性がある。10. seed 固定だけでは一般性は増えない。11. policy 固定は比較に向く。12. policy が多すぎると表が読みにくい。13. frame window は映像確認に向く。14. 1 frame 指定だけでは偶然になりうる。15. window は少し幅を持たせられる。16. 文字列 anchor は実装が軽い。17. 構造化 anchor の方が将来生成しやすい。18. v92 では小差分が望ましい。19. gameplay 変更なしなら headless 主眼に沿う。20. anchor は面白さを判定しない。21. anchor は確認対象を選ぶ。22. 自動選択の根拠が弱いと儀式化する。23. bomb/action/death frame は根拠が強い。24. aggressive の見どころは clear 直前だけでは弱い。25. camper/survival/novice は death frame が自然。26. route は BOMB frame が自然。27. marksman 比較は score として残せる。28. defensive 比較は death frame として残せる。29. packet screenshot contract は継続できる。30. source と computed の一致で手書きずれを検出できる。

改善案 30 件:
1. `reviewAnchor` 列を追加する。2. route は BOMB frame を anchor にする。3. route は直近 Active DEF frame も併記する。4. aggressive は終盤 window を anchor にする。5. marksman score を比較値にする。6. camper は death frame を anchor にする。7. camper は route same-wave 比較を示す。8. survival は death frame を anchor にする。9. panic nearBullets を比較値にする。10. novice は death frame を anchor にする。11. defensive death frame を比較値にする。12. methodVersion を v009 に上げる。13. DOM cell を `review-question` と `review-anchor` に分ける。14. generated rows の一致 assert に anchor を入れる。15. screenshot path を v92 anchor に変える。16. README に実行方法を更新する。17. devlog に実測 anchor を残す。18. raw evidence JSONL に generatedReasonRows を残す。19. gameplayVersionMarked を v92 文言に更新する。20. packet note を anchor 付きに直す。21. 既存 iframe sample は維持する。22. static policy table は維持する。23. causal slice assert は維持する。24. bad policy failure は維持する。25. source telemetry match は維持する。26. anchor は headless 再生成値だけを信じる。27. 手書き placeholder は検証で落とす。28. design_log に意図を残す。29. 継続 directive に last_result を戻す。30. staging に検証結果を書く。

筋の良い案: reason family / generated evidence / review question / review anchor を 1 行にまとめる。解決できる問題は、問いが抽象化して人間が再生箇所を探す負荷が残ること。新しく生じる懸念は、anchor が固定 seed 12345 中心になり、一般性の証拠ではなく確認入口に留まること。

### 設計サイクル 2

良い/悪い観点 30 件:
1. frame anchor はレビュー開始点として実用的。2. frame anchor は最終判定ではない。3. window 表記は単発 frame より良い。4. window 幅の妥当性はまだ経験則。5. BOMB frame は意味が明確。6. Active DEF frame は多く発生する。7. last Active DEF は BOMB 直前確認に向く。8. aggressive の frame は選択が難しい。9. duration-500 は機械的で恣意が少ない。10. CHASE 発生 frame を取れるなら将来良い。11. camper death は主観 bad policy と対応する。12. survival death は回避だけ失敗の確認に向く。13. novice death は初心者導線の確認に向く。14. defensive 比較は別 policy の death frame だけでも役立つ。15. route same-wave は同一場面の比較に向く。16. same-wave の厳密 iframe はまだない。17. packet の表が横長になる。18. ただし data cell は検証しやすい。19. HTML 自動生成へ進む前に schema を固められる。20. schema 固定が早すぎるリスクもある。21. v92 では JSON row の形だけ固定する。22. headless が「どちらが良いか」は言わない。23. 人間が見に行く場所を示すだけに留める。24. raw JSONL の後続利用がしやすい。25. screenshot size check はレンダリング欠落検出に効く。26. screenshot の視認品質は別問題。27. DOM dump は source JSON と script の接続を見る。28. VM telemetry は gameplay contract を見る。29. 両方を合わせるのがこの版の価値。30. v92 でゲーム自体をいじらない判断は妥当。

改善案 30 件:
1. `frameWindow()` helper を追加する。2. `lastActionFrame()` helper を追加する。3. `deathFrame()` helper を追加する。4. route anchor は `lastActionFrame(route,"bomb")` にする。5. activeDef 比較は `lastActionFrame(route,"activeDef")` にする。6. aggressive anchor は `durationFrames - 500` にする。7. camper anchor は `deathContext.frame` にする。8. survival anchor は `deathContext.frame` にする。9. novice anchor は `deathContext.frame` にする。10. defensive 比較は `deathFrame(defensive)` にする。11. `generatedCellFromRenderedPacket()` を汎用化する。12. question と anchor を別 assert にする。13. placeholder 0 値は残さない。14. v92 check の初回 fail を使って実測 anchor を確定する。15. source JSON を実測値へ更新する。16. check を再実行する。17. raw JSONL には pass/fail 両方が入りうることを理解する。18. 最終 pass 後の記録を採用する。19. README には anchor の目的を書く。20. devlog には gameplay 不変を明記する。21. design_log には「一般性ではなく入口」と書く。22. CONTINUOUS_DIRECTIVE を last_result 更新する。23. staging に paths と verification を残す。24. git stage は今回ファイルだけ。25. `.tmp` は commit しない。26. raw evidence は今回の headless 実行成果として stage する。27. 既存 unrelated memory 差分は混ぜない。28. commit message は game prefix にする。29. push 後 status を確認する。30. push 失敗なら hash を報告する。

筋の良い案: anchor は「レビュー開始点」であり、「評価の答え」ではないと明示する。解決できる問題は、headless が面白さを判定したように見える危険。懸念は、anchor の自動選択ロジックがまだ簡易で、将来 CHASE 発生や threat spike から選ぶ必要があること。

### 設計サイクル 3

良い/悪い観点 30 件:
1. v92 は headless のあり方検証に合う。2. ゲーム改変なしで評価器を進める。3. policy matrix を壊さない。4. seed 2 点検証を維持する。5. j4/j6 causal split を維持する。6. camper failure を維持する。7. novice late failure を維持する。8. anchor は source JSON と DOM をまたぐ。9. 実測と static source のずれが落ちる。10. 人間レビューの再現性が上がる。11. 問いと anchor が分離される。12. 読みと anchor が同じ行にある。13. HTML がやや重くなる。14. 横幅は増える。15. screenshot bytes は検証できる。16. 視覚重なりはブラウザ目視がまだ必要。17. raw evidence の蓄積が増える。18. 既存 JSONL が大きくなる。19. それでも検証成果として価値がある。20. v92 は自動 HTML 生成の前段。21. 次は JSONL から packet 生成へ行ける。22. まだ anchor の選択品質は人間判断が必要。23. policy ごとの「なぜそこを見るか」は question と対応する。24. death frame anchor は失敗の読みやすさが高い。25. BOMB frame anchor は成功理由を見やすい。26. aggressive frame は改善余地が大きい。27. CHASE event frame が取れれば次版候補。28. 今回の diff は小さく検証しやすい。29. 既存 v91 を保持できる。30. v92 を次 cycle の比較基準にできる。

改善案 30 件:
1. v92 を v91 派生にする。2. index のバージョン表記を更新する。3. review packet の method を v009 にする。4. generated rows に anchor を追加する。5. render script に anchor cell を追加する。6. check script に anchor 再生成を追加する。7. generatedReasonTableContract を anchor 込みにする。8. packetDomContract を v009 にする。9. screenshot output path を anchor 名にする。10. README を更新する。11. devlog を更新する。12. design_log を日本語化する。13. directive の last_handled を更新する。14. staging Game Start を追記する。15. headless を実行する。16. pass しなければ source JSON を直す。17. pass 後に git diff を確認する。18. raw evidence の追記量を把握する。19. `.tmp` を stage しない。20. unrelated dirty を無視する。21. commit 対象を明示 stage する。22. commit する。23. push する。24. post-push status を見る。25. 完了報告は path と検証を短く出す。26. 失敗時は hash と理由を出す。27. 次候補は CHASE event anchor とする。28. gameplay tuning へ戻らない。29. headless の比較証拠整備を主眼にする。30. Nao_u の停止/完成判断までは directive active を維持する。

筋の良い案: v92 は「reason row から目視開始 anchor までを一つの packet schema にする」。解決できる問題は、headless evidence が人間レビューの具体操作へ接続されないこと。懸念は、schema がまだ手動 source JSON であり、実行後の自動 packet 生成には未到達なこと。

### 採用案

`v05_1_cdx_v92` は v91 から派生し、gameplay、敵配置、bot policy、jitter/lag 条件は変更しない。`review_packet.html` の `data-review-packet` を `review-anchor-packet-v009` に更新し、`generated-reason-rows-source` の各行に `reviewAnchor` を追加する。ブラウザ script は `review-question` cell と `review-anchor` cell を別々に描画する。`tools/headless_graze_log_cdx_v05_2_v92_review_anchor_packet_check.js` は、VM 実行 telemetry から `generatedReasonRows` を再生成し、source JSON / 描画後 DOM row / review question / review anchor の一致を assert する。

### 懸念

anchor は一般性の証拠ではなく、人間が確認を始める場所である。特に aggressive の anchor は CHASE event から直接選んでおらず、終盤 window の便宜的選択なので、次の改善候補として残す。

### 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v92_review_anchor_packet_check.js
```

期待結果: route / aggressive / marksman clear、bad policy failure、camper dominance block、forward reward split、j4/j6 causal split、policy reason table DOM、source telemetry match、rendered reason row + review question + review anchor contract、packet screenshot contract が pass する。
