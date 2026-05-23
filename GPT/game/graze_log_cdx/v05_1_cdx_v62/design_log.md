# graze_log v05.2_cdx_v62 design_log

## 対象 directive と原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。Nao_u の継続指示は「`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける」こと。

直近の追加方針は、2026-05-22 の直接指示「別の指示があるまでは、ゲーム制作そのものよりも、AIがゲームを作る際のヘッドレスのあり方がどうあるべきかの検討と実地検証を重ねる形で進めて。ヘッドレス測定に必要であればゲームを改変しても良いが、主眼は自動実行で何をどう振るのが良さそうかの検証の方。」を維持する。

## 実装前判断

v61 は `CHASE` popup が敵弾や boss cue を遮らないことを headless で測れるようにした。ただし v61 の devlog に残した通り、左右上部 rail は「邪魔ではない」が、報酬表示として視線誘導が弱すぎる可能性が残った。

今回はゲーム本体の難度や敵配置を触らず、headless がその弱さを検出できるかを試す。具体的には、popup とプレイヤーの距離、近すぎ/遠すぎ frame、左右の発生偏りを測る。最初に v61 相当の位置で失敗させ、その後に表示位置だけを修正して pass させる。

採用した過去知見:

- `memory/game_headless_action_eval_playbook_20260523.md`: 主観的な不満を bot policy と時系列指標へ翻訳する。
- `memory/game_memory_task_lens_index.md` の `Playable / Headless 評価` と `Repair / Iterative Improvement`: 平均 score ではなく、route/aggressive/marksman/camper の分離を維持する。
- v61 devlog: headless 遮蔽率は bounded でも、人間視点の報酬感は別問題として残す。

## 設計サイクル 1

現状の良いところ/悪いところ 30件:
1. route/aggressive/marksman が clear する。2. camper は clear しない。3. CHASE bonus は good policy にだけ出る。4. popup density は bounded。5. boss cue overlap は 0。6. threat overlap もほぼ 0。7. v61 は表示が邪魔になりにくい。8. ただし上部 rail は遠い。9. 遠さは人間視点の報酬感を弱めうる。10. score だけでは検出できない。11. clear だけでも検出できない。12. popup count だけでも検出できない。13. player からの距離を測る必要がある。14. kill 位置からの距離も意味がある。15. 左右 rail の偏りも意味がある。16. 近すぎる表示は弾避けを邪魔する。17. 遠すぎる表示は見逃す。18. enemy を動かすと比較が崩れる。19. BOMB を変える必要はない。20. Active DEF を変える必要はない。21. guide を変える必要はない。22. bot policy を変える必要はない。23. matrix は重いが有効。24. focused check も必要。25. 初回失敗を残す価値がある。26. pass だけでは学びが薄い。27. 失敗条件を明示する必要がある。28. 人間評価の代替ではない。29. 次は Browser Use 目視が必要。30. 今回は headless 実地検証として十分。

改善案 30件:
1. v62 を作る。2. version title を更新。3. `ROUTE_SOURCE_NOTES` に v62 を追加。4. state に popup 距離集計を追加。5. spawn 時 player distance を記録。6. spawn 時 kill distance を記録。7. side count を記録。8. side switch を記録。9. active frame の player distance を記録。10. too-near frame を記録。11. too-far frame を記録。12. left/right active frame を記録。13. summary に出す。14. traceDigest に代表値を出す。15. event に distance を出す。16. focused check に assertion を追加。17. matrix に aggregation を追加。18. v61 rail のまま一度失敗させる。19. route 平均 420px 程度なら遠すぎと判定。20. rail をプレイヤー近傍 y へ寄せる。21. x は左右端寄りを維持。22. boss cue overlap は維持。23. threat overlap は維持。24. near threshold は厳しすぎない。25. far threshold は 330px。26. side balance は core policy で見る。27. camper は popup 0 でよい。28. README 更新。29. devlog 更新。30. directive/staging 更新。

複数問題を一気に解決できる案:
表示そのものの修正と、修正の有効性を測る telemetry を同時に追加する。ただし敵配置や得点設計を変えないため、既存の policy 分離を壊しにくい。

採用案:
`v05_1_cdx_v62` として、左右 rail を維持しつつ `anchorY=player.y-96` 近辺へ CHASE popup を出す。headless では core policy の平均 spawn/active 距離が 90-310px、too-far が 0、side balance が 0.15 以上、遮蔽率が既存閾値内であることを見る。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v62_check.js
node tools\headless_graze_log_cdx_v05_2_v62_policy_matrix_check.js
```

合格条件:

- route は clear し、route coverage 1 を維持する。
- route/aggressive/marksman は CHASE bonus を得る。
- camper は CHASE bonus を得ず、clear しない。
- CHASE popup density / active cap / overlap 条件を維持する。
- `chasePopupReadabilityMeasured` が true になる。

## 結果

初回は v61 の上部 rail 相当のまま telemetry を追加し、focused check で `chasePopupMeanSpawnPlayerDist 419.7`、`chasePopupTooFarPct 0.137` となって失敗した。これは「遮蔽しないが遠すぎる」状態を headless が検出できたことを示す。

最終実装では CHASE popup をプレイヤー近傍の左右 rail に移し、focused check で `chasePopupMeanSpawnPlayerDist 148.3`、`chasePopupMeanActivePlayerDist 157`、`chasePopupTooFarPct 0`、`chasePopupThreatOverlapPct 0.001`、`chasePopupBossCueOverlapPct 0`、`chasePopupReadabilityMeasured true` になった。policy matrix でも route/aggressive/marksman の `chasePopupReadabilityMeasured` が true。

残課題:
headless は「遠すぎる/近すぎる/遮る」を検出できるが、人間が実際に報酬感を読むかはまだ別問題。次は Browser Use または実機で、プレイヤー近傍 rail が邪魔にならず報酬として読めるかを目視確認する。
