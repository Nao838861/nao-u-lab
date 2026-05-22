# graze_log v05.2_cdx_v60 design_log

## 対象 directive と原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。Nao_u の継続指示は「このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける」。

今回の直接入力は v59 の残課題である。「数値が通った後も、人間プレイで CHASE 表示がうるさくないか、上中段の危険量が納得できるか、報酬が強すぎて突撃一択になっていないかを見る必要がある。」

## 実装前判断

v59 は底待ち対策を「罰」だけでなく、上中段で横切り敵を倒す `CHASE` 報酬へ広げた。次に敵や報酬を増やすと、突撃一択や表示過多を強める可能性がある。v60 ではステージ、敵、スコア倍率を変えず、`CHASE` popup の見え方を抑制し、headless で「報酬は残るが表示は出すぎない」ことを測る。

採用する過去知見:

- `memory/game_headless_action_eval_playbook_20260523.md`: 平均値ではなく、悪い policy と良い policy の差を保ったまま検査する。
- `memory/game_2d_shmup_reproduction_packet_20260523.md`: 敵配置を増やす前に、既存 wave の意図と telemetry を保つ。
- v59 design/dev log: 次焦点は CHASE popup と上中段迎撃がうるさくないか、突撃一択でないかの確認。

## 設計サイクル 1

現状の良いところ/悪いところ 30件: 1. route は clear する。2. aggressive も clear する。3. marksman も clear する。4. camper は失敗する。5. chaseBonus が分離した。6. forwardChaseKills がある。7. v59 の stage は壊れていない。8. 横切り敵に意味が出た。9. CHASE が人間にも見える。10. ただし popup が多い可能性。11. 報酬表示が敵弾を隠す可能性。12. `CHASE` 文字が毎 kill で出る。13. 上中段の危険量はまだ体感未確認。14. 報酬が強く見えすぎる恐れ。15. bot の clear だけでは楽しさ判定にならない。16. guide は既に薄い。17. boss cue は維持されている。18. density は calibrated。19. UI 上部の `CHASE` 累計は有用。20. popup は累計より優先度が低い。21. popup を消しすぎると報酬感が落ちる。22. active cap が必要。23. cooldown が必要。24. telemetry が必要。25. matrix に popup density が必要。26. stage 追加は不要。27. 敵 bullet 追加も不要。28. score multiplier 変更は危険。29. 小さな playable diff で済む。30. 次は実機目視へ渡せる。

改善案 30件: 1. popup cooldown。2. active popup cap。3. life を短くする。4. 上昇速度を落とす。5. 5 回ごとに `CHASE xN`。6. suppressed count。7. popup count。8. popup density。9. max active。10. popup frame pct。11. chasePopup event。12. suppressed event。13. focused check 条件。14. matrix 条件。15. score は据え置く。16. gauge は据え置く。17. route y は据え置く。18. enemies は据え置く。19. guide は据え置く。20. title を更新。21. README 更新。22. devlog 更新。23. continuous directive 更新。24. staging 更新。25. raw JSONL 追記許容。26. route/aggressive/marksman の popup を見る。27. camper は報酬なしを維持。28. popup density < 0.45。29. max active <= 3。30. popup pct < 0.35。初回検証で density が高かったため、最終採用値は cooldown 24f / life 24f にした。

筋の良い案: `CHASE` 報酬自体は維持し、表示だけを cooldown と active cap で間引く。

解決できる問題: 報酬の意味を残しながら、画面上の文字ノイズを抑えられる。新しい懸念: 間引きすぎると人間が報酬を感じにくくなる。

## 設計サイクル 2

現状案の良いところ/悪いところ 30件: 1. 既存 wave を壊さない。2. 報酬 tuning を変えない。3. bot policy 比較を継続できる。4. v59 との比較が読みやすい。5. popup だけの変更なのでリスクが小さい。6. telemetry が増える。7. headless で表示過多を検査できる。8. human-visible も残る。9. `CHASE xN` は累積感が出る。10. active cap は重なりを防ぐ。11. cooldown は連打感を抑える。12. suppressed が多すぎると見えなさすぎ。13. popup density だけでは位置の邪魔は測れない。14. 画面上の遮蔽はブラウザ目視が必要。15. route は popup 少なめ。16. aggressive は多め。17. marksman は多め。18. それぞれが上限内なら妥当。19. camper は 0 のままでよい。20. novice は失敗してよい。21. survival は低報酬でよい。22. panic は失敗してよい。23. score の意味は変えない。24. CHASE 累計 UI は残す。25. eventCount は増える。26. check 閾値は増加分を許容する。27. raw matrix は後で比較できる。28. popup pct は滞在時間の proxy。29. max active は重なりの proxy。30. 次の目視対象が明確になる。

改善案 30件: 1. cooldown 24f。2. cap 3。3. life 24。4. y speed 0.34。5. `kind:'chase'`。6. generic popup には影響しない。7. `chasePopupFrames`。8. `chasePopupCount`。9. `suppressedChasePopups`。10. `chasePopupDensity`。11. `maxChasePopupsActive`。12. `chasePopupBurstMax`。13. focused check に `chasePopupNoiseBounded`。14. matrix に `meanChasePopupDensity`。15. matrix に `maxChasePopupsActive`。16. matrix に `meanChasePopupPct`。17. core policies だけ厳しめに見る。18. camper は forwardRewardSeparates で見る。19. source note に v60 を追加。20. export source を v60 にする。21. title を v60 にする。22. README を v60 にする。23. devlog に結果を書く。24. directive last_result を更新。25. staging に evidence。26. commit 対象限定。27. push。28. 失敗したら cooldown を短くしない。29. 表示不足なら `CHASE xN` 周期を下げる。30. 目視で邪魔なら cap 2 を検討。

筋の良い案: popup を個別 kill の全表示から「短い間隔での代表表示」へ変える。

解決できる問題: 視認性と報酬感の衝突を小さくできる。新しい懸念: headless の popup 指標は実際の遮蔽面積を直接測っていない。

## 設計サイクル 3

採用前の良いところ/悪いところ 30件: 1. playable diff。2. stage unchanged。3. enemy unchanged。4. reward unchanged。5. bot unchanged。6. UI feedback changed。7. telemetry extended。8. focused check extended。9. matrix extended。10. v59 の成果を保つ。11. 報酬削減ではない。12. 罰強化でもない。13. popup だけなので次に戻しやすい。14. ただし体感は未確定。15. 表示不足の可能性。16. 表示過多の可能性。17. aggressive の popup は多いはず。18. route の popup は適量が望ましい。19. marksman の popup は高くても cap 内ならよい。20. camper は 0 でよい。21. `CHASE xN` が説明的すぎる可能性。22. でも 5 回ごとなら許容。23. boss cue 表示と競合しないか要確認。24. CORE CHARGED とは別 kind。25. generic popup は壊さない。26. event count は増える。27. check 閾値を緩める必要があるかもしれない。28. matrix JSONL は今回の差分として stage しない。29. continuous directive は更新する。30. 次は Browser Use 目視に進める。

改善案 30件: 1. 実装する。2. focused check を走らせる。3. matrix を走らせる。4. route clear を確認。5. forward reward 維持を確認。6. camper 失敗を確認。7. popup density を確認。8. max active を確認。9. popup pct を確認。10. suppressed が観測されるなら良い。11. suppressed 0 でも密度低ければ良い。12. aggressive/marksman の cap を見る。13. README に実行方法。14. devlog に数値。15. staging に記録。16. directive に last_result。17. commit。18. push。19. 目視は次タスク候補。20. 敵配置は触らない。21. score は触らない。22. gauge は触らない。23. BOMB は触らない。24. Active DEF は触らない。25. guide は触らない。26. memory index は触らない。27. Slack pending はないので close しない。28. raw feedback はなし。29. 既存無関係差分は混ぜない。30. 完了。

採用案: `v05_1_cdx_v60` として CHASE popup restraint と popup telemetry を実装する。

## 検証方法

- `node tools\headless_graze_log_cdx_v05_2_v60_check.js`
- `node tools\headless_graze_log_cdx_v05_2_v60_policy_matrix_check.js`

合格条件:

- route が clear し、routeCoveragePct 1 を維持する。
- v59 の `forwardAttackPct` / `forwardChaseKills` / `chaseBonus` が route で観測される。
- route/aggressive/marksman が chaseBonus を得て、camper が得られない。
- `chasePopupCount > 0`、`chasePopupDensity < 0.45`、`maxChasePopupsActive <= 3`、`chasePopupPct < 0.35` を満たす。
- v58/v59 の density / boss cue / guide trace 条件を壊さない。
