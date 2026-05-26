# graze_log v05.2_cdx_v93 design_log

## v93 追記: event anchor packet

### 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

### 実装前判断

v92 は reason row / review question / review anchor を packet 内で一致検証できるようにした。ただし aggressive の anchor は `durationFrames - 500` で、実際に CHASE 報酬が発生した瞬間ではない。今回は gameplay を変えず、headless の event trace から `bomb`、最初の CHASE 対象 kill、`gameOver` を拾い、review anchor が「どの出来事を見に行くのか」を説明できる形にする。

参照した過去知見は `game_headless_action_eval_playbook_20260523.md` の「主観フィードバックを bad policy と時系列指標へ翻訳する」、`game_memory_task_lens_index.md` の `headless-eval / bad-policy`、および v92 の懸念「anchor は一般性の証拠ではなくレビュー開始点」。

### 設計サイクル 1

良い/悪い観点 30 件: 1. v92 の schema は維持できる。2. gameplay 不変なので差分原因が絞れる。3. event trace は既に存在する。4. CHASE anchor が終盤 window だと根拠が弱い。5. first CHASE kill は報酬理由と直結する。6. BOMB event は route の確認点として明確。7. Active DEF は比較用に残せる。8. bad policy は death frame が自然。9. `gameOver` event と deathContext は対応する。10. frame window は単発 frame より確認しやすい。11. source JSON と DOM の一致検証は継続できる。12. eventTrace を report に出しすぎると出力が重い。13. raw evidence には botTrace を入れない設計を維持する。14. first CHASE は序盤すぎる可能性がある。15. ただし「報酬が出始める瞬間」として意味はある。16. later CHASE spike の選択は次回候補。17. marksman 比較にも firstChase を出せる。18. route と aggressive の anchor 種類が分かれる。19. それぞれの理由 family に合うので問題ない。20. methodVersion を上げるべき。21. packet 名も変えるべき。22. README は「楽しい判定ではない」と明記する。23. design_log は v92 との差分を明確にする。24. check 名は event anchor に変える。25. screenshot path も変える。26. directive last_result 更新が必要。27. staging に検証結果を残す。28. raw evidence は今回の headless 成果として stage 対象。29. 既存の大量 memory 差分は混ぜない。30. 次の課題は CHASE の代表 event 選択品質。

改善案 30 件: 1. `eventTrace` を run result に残す。2. policy summary からは除外する。3. `eventFrame()` helper を追加する。4. `lastEventFrame()` helper を追加する。5. route は最後の `bomb` event を使う。6. route の compare は最後の `activeDef` event にする。7. aggressive は最初の `kill` かつ `chaseBonus: true` を使う。8. marksman も同じ条件で比較 frame を出す。9. camper は `gameOver` 相当の death frame を明示する。10. survival も death frame を明示する。11. novice も death frame を明示する。12. review anchor 文字列に `event=` を含める。13. `methodVersion` を `graze-event-anchor-packet-v010` にする。14. `data-review-packet` を `event-anchor-packet-v010` にする。15. generated rows source を実測値へ更新する。16. 初回 headless fail で実測 CHASE frame を確認する。17. source JSON を修正する。18. 再実行して pass を確認する。19. README を更新する。20. devlog を更新する。21. index のタイトルを event anchor にする。22. gameplay history に v93 の狙いを追記する。23. check の title assert も更新する。24. screenshot contract は維持する。25. policy reason evidence は維持する。26. j4/j6 causal split は維持する。27. seed 12345/77777 は維持する。28. `.tmp` は commit しない。29. commit 後 push する。30. 次候補を design_log に残す。

筋の良い案: review anchor を「実イベントからのレビュー開始点」にする。解決できる問題は、headless が出した問いと実際に見るべき出来事の対応が曖昧なこと。新しい懸念は、first CHASE kill が序盤イベントに偏るため、将来は CHASE burst や threat spike から代表点を選ぶ必要があること。

### 設計サイクル 2

良い/悪い観点 30 件: 1. `event=bomb` は route resource の説明に合う。2. `event=firstChaseKill` は forward reward の説明に合う。3. `event=gameOver` は bad policy の説明に合う。4. CHASE popup そのものではなく kill event なので表示確認とは少し違う。5. ただし報酬原因は kill event。6. popup readability は別 packet 系で既に扱っている。7. source JSON が手書きのままなのはまだ弱い。8. headless が再生成して落とすので手書きずれは検出できる。9. DOM contract は有効。10. Chrome screenshot はレンダリング欠落検出になる。11. 出力 JSON が大きい。12. JSONL 追記は軽い要約にしている。13. eventTrace を raw に入れないのは妥当。14. method version を上げると追跡しやすい。15. gameplayVersionMarked は packet 名変更も見るべき。16. v93 は game feel 改善ではなく評価器改善。17. directive の主眼に合う。18. headless は楽しい判定をしない原則を守る。19. anchor の根拠が説明可能になる。20. ただし anchor 品質はまだ人間評価前。21. bad policy は frame が変わらない。22. route anchor も v92 と同じ frame だが根拠名が明確になる。23. activeDef 比較 frame も event 由来になる。24. marksman firstChase frame が近いと比較しやすい。25. firstChase が画面上で見やすいかは未検証。26. visual probe と接続する余地がある。27. 今回は packet schema の一段進化に留める。28. 既存 v92 は保存される。29. v93 は次 cycle の基準になる。30. 完成判断は Nao_u に委ねる。

改善案 30 件: 1. `reviewAnchor` の文言を `event=` 付きに統一。2. route row を `event=bomb` にする。3. aggressive row を `event=firstChaseKill` にする。4. camper row を `event=gameOver` にする。5. survival row を `event=gameOver` にする。6. novice row を `event=gameOver` にする。7. packet paragraph を event-derived anchor に直す。8. title を event anchor packet に直す。9. README で concrete event を列挙する。10. devlog で anchor 一覧を残す。11. design_log で初回 fail の役割を書く。12. check output の raw append は継続。13. `generatedReasonTableContract` に anchor を含める。14. source telemetry match は既存のまま。15. policy reason table は既存のまま。16. `eventFrame` の fallback を残す。17. fallback は将来 event 欠落時の検出対象にする。18. 今回は fallback 使用を別 assert にしない。19. 次回は fallback 不使用 assert を検討。20. pass 後に directive を更新。21. staging を追記。22. git diff を確認。23. stage は v93 関連だけ。24. raw evidence も stage。25. lock や `.tmp` は除外。26. commit message は `game:` prefix。27. push する。28. post-push status を見る。29. 未 push なら hash を報告。30. final は path と検証を短く報告。

筋の良い案: v93 は「event-derived review anchor schema」の導入に絞る。解決できる問題は、review packet が frame window を出しても、その window が何の出来事なのかを読み手が推測する必要があること。懸念は、event の代表性をまだ評価していないこと。

### 設計サイクル 3

良い/悪い観点 30 件: 1. 差分が小さい。2. 検証が明確。3. v92 の成果を捨てない。4. headless 主眼に合う。5. source/DOM/telemetry の三者一致が残る。6. CHASE の根拠が強くなる。7. BOMB の根拠が強くなる。8. bad policy failure の根拠が強くなる。9. gameplay の面白さは直接改善しない。10. ただし今回の指示では評価器優先。11. visual inspection の開始点として役立つ。12. event label があるとログ検索しやすい。13. screenshot は補助。14. JSONL は後続分析に使える。15. 大量出力は CLI 上では重い。16. raw は軽量化済み。17. check は 11 秒程度で許容。18. Chrome 依存は既存通り。19. seed 固定は再現性に寄与。20. seed 固定は一般性ではない。21. multi-seed policy pass は維持。22. anchor は seed 12345 の代表入口。23. 次は seed 別 anchor 比較もありうる。24. current directive は active 維持。25. completed にはしない。26. Nao_u 停止判断までは継続。27. staging に次課題を書く。28. commit/push まで行う。29. unrelated dirty は混ぜない。30. final で検証コマンドを明記する。

改善案 30 件: 1. v93 folder を作る。2. check を v93 名で作る。3. string version を置換する。4. event helper を追加する。5. review packet method を更新する。6. generated source を更新する。7. index title を更新する。8. README を更新する。9. devlog を更新する。10. design_log を更新する。11. 初回 headless で anchor 実測値を取る。12. aggressive anchor を frame 374 に直す。13. marksman compare を frame 382 に直す。14. 再 headless を通す。15. directive last_result を更新する。16. staging Game Start へ追記する。17. raw evidence の pass 行を残す。18. status を確認する。19. stage 対象を限定する。20. commit する。21. push する。22. post-push status を見る。23. 次課題は CHASE burst / threat spike anchor。24. packet 自動生成は次候補。25. fallback 不使用 assert も次候補。26. visual probe 連携も次候補。27. game tuning へ逸れない。28. 日本語ログを維持する。29. path を明記する。30. evidence を残す。

筋の良い案: v93 は v92 の「レビュー導線」を、実イベント名付きのレビュー導線へ狭く強化する。解決できる問題は、headless evidence が人間確認の操作へ接続されても、なぜその frame なのかが弱いこと。懸念は、event 選択そのものの品質評価は次回に残ること。

### 採用案

`v05_1_cdx_v93` は v92 から派生し、gameplay、敵配置、bot policy、jitter/lag 条件は変更しない。`review_packet.html` の `data-review-packet` を `event-anchor-packet-v010` に更新し、`generated-reason-rows-source` の `reviewAnchor` を `event=` 付きの文字列にする。`tools/headless_graze_log_cdx_v05_2_v93_event_anchor_packet_check.js` は、VM 実行 telemetry の `eventTrace` から generated rows を再生成し、source JSON / 描画後 DOM row / review question / event anchor の一致を assert する。

### 懸念

`firstChaseKill` は報酬発生の最初の瞬間として説明可能だが、プレイヤーが「前へ出る攻め」を読む代表 frame として最良とは限らない。次は CHASE burst、threat spike、popup readability の複合条件から代表 event を選ぶ方向が候補。

### 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v93_event_anchor_packet_check.js
```

期待結果: route / aggressive / marksman clear、bad policy failure、camper dominance block、forward reward split、j4/j6 causal split、policy reason table DOM、source telemetry match、rendered reason row + review question + event anchor contract、packet screenshot contract が pass する。
