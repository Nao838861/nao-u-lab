# graze_log v05.2_cdx_v61 design_log

## 対象 directive と原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。Nao_u の継続指示は「このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける」。

今回の直接入力は v60 の残課題である。「次の焦点は、Browser Use または実機で `CHASE xN` が報酬感として足りるか、boss cue や敵弾と重なって邪魔に見えないかを目視すること。」

## 実装前判断

v60 は `CHASE` popup の頻度を cooldown 24f / life 24f / active cap 3 で抑えた。ここで敵配置や報酬を変えると、v59-v60 で分離した「良い policy は CHASE を得て、camper は得ない」という検証軸が崩れる。v61 では gameplay を変えず、表示位置だけを安全化し、boss cue / 敵弾との重なりを headless で測れる形へ進める。

採用する過去知見:

- `memory/game_headless_action_eval_playbook_20260523.md`: 人間の主観を、悪い policy と時系列指標に翻訳する。今回は「邪魔に見える」を遮蔽 telemetry に落とす。
- `memory/game_2d_shmup_reproduction_packet_20260523.md`: 敵配置を触るなら wave table が必要。今回は配置を触らず、既存 stage grammar を保つ。
- v60 design/dev log: 次焦点は `CHASE` popup の視認性と boss cue / 敵弾との競合。

## 設計サイクル 1

現状の良いところ/悪いところ 30件: 1. route は clear。2. aggressive も clear。3. marksman も clear。4. camper は失敗。5. CHASE 報酬は分離済み。6. popup 頻度は bounded。7. ただし位置の邪魔さは未検証。8. boss cue は中央上部に出る。9. 敵弾も上中段に集中する。10. kill 位置 popup は危険表示と重なり得る。11. 右端 rail は安全。12. 左端 rail も安全。13. rail は報酬発生地点から離れる。14. 離れすぎると手応えが弱い。15. cooldown は変えない方がよい。16. active cap も維持。17. score も維持。18. gauge も維持。19. stage も維持。20. bot policy も維持。21. telemetry だけ増やせる。22. headless は遮蔽面積そのものは見ない。23. 近接距離なら proxy になる。24. boss cue 帯は矩形で測れる。25. 敵弾近傍は半径で測れる。26. safe rail 退避回数も有用。27. 表示を消すより退避がよい。28. 退避しすぎなら報酬感が弱くなる。29. まず focused diff でよい。30. 次に実機目視へ渡せる。

改善案 30件: 1. kill 位置から少し上へ出す。2. 敵弾 34px 以内なら退避。3. boss cue 帯なら退避。4. 左右 rail を候補にする。5. rail y=86。6. だめなら y=126。7. だめなら y=166。8. `chasePopupRepositioned`。9. `chasePopupThreatOverlapPct`。10. `chasePopupBossCueOverlapPct`。11. focused check に遮蔽条件。12. matrix に遮蔽条件。13. v60 の popup density 条件を維持。14. route clear 維持。15. CHASE bonus 維持。16. camper 分離維持。17. title 更新。18. source note 更新。19. README 更新。20. devlog 更新。21. continuous directive 更新。22. staging 更新。23. raw matrix 追記許容。24. 実機目視は次へ。25. boss cue 表示は変更しない。26. 敵弾色は変更しない。27. popup 色は維持。28. popup life は維持。29. cooldown は維持。30. active cap は維持。

筋の良い案: 報酬の発生そのものは kill 位置に残し、表示は常に「危険情報を隠さない rail」へ退避する。

解決できる問題: `CHASE` が敵弾や boss cue を覆って判断を邪魔する危険を下げられる。新しい懸念: kill 位置と表示位置が離れ、何に対する報酬かが少し弱くなる。

## 設計サイクル 2

現状案の良いところ/悪いところ 30件: 1. gameplay 非破壊。2. v60 と比較しやすい。3. 報酬値を変えない。4. 敵を増やさない。5. 弾を増やさない。6. boss cue を消さない。7. popup を消さない。8. 退避回数が見える。9. overlap pct が見える。10. rail は画面端で読める。11. rail は主戦場から離れる。12. 下 rail は自機に近すぎる。13. 上 rail は HUD と競合。14. 中央 rail は boss cue と競合。15. 右左 rail が妥当。16. 弾近傍 proxy は厳しめ。17. boss cue overlap は 0 にできるはず。18. threat overlap もほぼ 0 にしたい。19. active popup が 1 なら重なりは少ない。20. density は v60 並みでよい。21. reposition が 0 でも安全ならよい。22. reposition が多すぎると報酬地点が読みにくい。23. route/aggressive/marksman を見る。24. camper は CHASE 0。25. novice は参考。26. survival は参考。27. panic は参考。28. matrix が重いが必要。29. 失敗時は rail 候補を増やす。30. 成功後は目視へ進む。

改善案 30件: 1. `CHASE_POPUP_THREAT_RADIUS=34`。2. `chasePopupThreatNearby()`。3. `chasePopupBossCueOverlap()`。4. `chooseChasePopupPosition()`。5. candidates 配列。6. sideX を kill 側で選ぶ。7. y 候補を 86/126/166。8. 最後に中央低め候補。9. event に repositioned。10. summary に pct。11. traceDigest に reposition count。12. matrix row に追加。13. aggregate に追加。14. assertion に追加。15. README に説明。16. devlog に未記入結果枠。17. check 実行後に追記。18. directive 更新。19. staging 更新。20. commit。21. push。22. 実機目視候補を残す。23. popup font は触らない。24. alpha は触らない。25. boss cue font は触らない。26. enemy bullet radius は触らない。27. existing raw feedback は引用維持。28. memory index は更新しない。29. Slack pending はない。30. continuous directive だけ更新する。

筋の良い案: 退避判定を描画ではなく popup 生成時に行い、検証用の overlap は frame 計測で別に出す。

解決できる問題: 実装が単純で、表示先がなぜ変わったかを event から追える。新しい懸念: 生成後に popup が上へ流れて後から敵弾へ近づく場合があるため、frame overlap も見る必要がある。

## 設計サイクル 3

採用前の良いところ/悪いところ 30件: 1. playable diff。2. v61 として独立。3. index だけで動く。4. headless check あり。5. matrix check あり。6. design log あり。7. devlog あり。8. README あり。9. directive 更新対象あり。10. staging 更新対象あり。11. score 変化なし想定。12. clear 変化なし想定。13. CHASE bonus 変化なし想定。14. camper 分離維持想定。15. boss cue 到達維持想定。16. route event 維持想定。17. density 維持想定。18. popup density 維持想定。19. overlap 0 付近想定。20. rail 表示は目視未評価。21. 報酬感の弱化は未解決。22. ただし邪魔さの前処理として妥当。23. failed なら候補位置を変える。24. passed なら次は Browser Use。25. 実機評価なしで完成とは言わない。26. 敵配置は触らない。27. BOMB は触らない。28. Active DEF は触らない。29. guide は触らない。30. 変更を限定する。

改善案 30件: 1. v61 実装。2. focused check。3. matrix check。4. devlog 結果追記。5. continuous directive last_result。6. staging Game Start。7. status 確認。8. 自分の files だけ stage。9. commit。10. push。11. push 後 status。12. 失敗時は報告。13. overlap 閾値を厳しめにする。14. route/aggressive/marksman を core とする。15. camper は forwardRewardSeparates で見る。16. source note で意図を残す。17. title で版を識別。18. README で実行方法。19. policy matrix JSONL は検証出力として扱う。20. 無関係 atoms は混ぜない。21. pulse_relay は触らない。22. Slack broadcasts は今回対象外。23. direct pending はない。24. local continuous は active。25. 目視は残課題。26. 人間評価の代替と言わない。27. headless は比較補助と書く。28. rail 弱化は懸念として残す。29. 完成判定はしない。30. 継続改善として閉じる。

採用案: `v05_1_cdx_v61` として CHASE popup safe rail と遮蔽 telemetry を実装する。初回実装では危険時だけ退避したが、matrix で aggressive/marksman に敵弾近傍 overlap が残ったため、最終実装では `CHASE` popup を常時左右 rail に出す。

## 検証方法

- `node tools\headless_graze_log_cdx_v05_2_v61_check.js`
- `node tools\headless_graze_log_cdx_v05_2_v61_policy_matrix_check.js`

合格条件:

- route が clear し、routeCoveragePct 1 を維持する。
- route/aggressive/marksman が chaseBonus を得て、camper が得られない。
- `chasePopupDensity < 0.45`、`maxChasePopupsActive <= 3`、`chasePopupPct < 0.35` を維持する。
- `chasePopupThreatOverlapPct <= 0.005`、`chasePopupBossCueOverlapPct === 0` を満たす。
- v58-v60 の density / boss cue / guide trace 条件を壊さない。
