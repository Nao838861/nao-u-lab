# graze_log v05.2_cdx_v59 design_log

## 対象 directive と原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。Nao_u の継続指示は「このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける」。

今回の直接の入力は v58 の残課題である。「底待ちは数値上は支配戦略ではなくなった。ただし、これは『底にいると死ぬ』方向の対策なので、次は実プレイで『上へ出て迎撃したくなる』『横切り敵を追うと気持ちよく倒せる』方向の手触りを確認する必要がある。」

## 実装前判断

v58 は `camper` policy を追加し、画面下で左右に揺れるだけの雑な勝ち方を失敗させた。この状態でさらに敵密度や弾量を増やすと、底待ち対策は強くなるが「前へ出る理由」は増えない。v59 では罰ではなく報酬を足す。

採用する過去知見:

- `memory/game_headless_action_eval_playbook_20260523.md`: 悪い policy と良い policy の差を数値で見る。平均スコアだけで判断しない。
- `memory/game_2d_shmup_reproduction_packet_20260523.md`: 敵配置はプレイヤーをどこへ動かしたいかまで書く。今回の対象は横切り `raider` を上中段で追う判断。
- `v58 design_log`: 底待ちの成立条件は壊した。次は上中段の積極報酬。

## 設計サイクル 1

現状の良いところ/悪いところ 30件:
1. camper が独立した。2. route は clear できる。3. raider が即死しにくい。4. bottomCampPct が取れる。5. policy matrix がある。6. 横切り敵が増えた。7. entry shield が読める。8. 密度 timeline がある。9. stage は有限。10. boss cue が残っている。11. ただし前へ出る報酬が薄い。12. 底待ちの罰が主役。13. route bot の y がまだ低い。14. chase 成功が telemetry にない。15. 人間に得が見えにくい。16. CHAIN はあるが位置と結びつきが弱い。17. graze は弾依存。18. 横切り敵を追っても表示差がない。19. camper と route の報酬差が score だけ。20. boss 以外で上へ出る動機が弱い。21. BOMB/DEF の価値は測れる。22. ザコ撃破の快感はある。23. でも上中段撃破の快感が記録されない。24. shot_log 的な「倒して伸びる」循環が弱い。25. 敵を増やすとまた密度頼みになる。26. 罰だけでは人間の納得が弱い。27. UI は CHAIN を見せる。28. CHASE 表示はない。29. headless は新報酬を検査できる。30. 小変更で検証できる。

改善案 30件:
1. 上中段撃破 bonus。2. raider 限定 bonus。3. 横切り敵限定 gauge。4. CHASE popup。5. forwardAttackPct。6. forwardChaseKills。7. chaseBonus。8. route bot を少し上げる。9. camper は変えない。10. marksman/aggressive も差を見る。11. 底撃破 penalty は維持。12. 弾量は増やさない。13. HP は変えない。14. wave は変えない。15. UI に CHASE を出す。16. kill event に chase を入れる。17. matrix に meanChaseBonus。18. check に route > camper。19. skilled policies が bonus を取る条件。20. guide は触らない。21. boss は触らない。22. Active DEF は触らない。23. reward multiplier は控えめ。24. gauge 追加は小さく。25. grazeStreak を少し伸ばす。26. chain を直接壊さない。27. bottomCamp は bonus 対象外。28. telemetry は Layer A。29. 解釈は design_log に残す。30. 次回は実機目視。

筋の良い案: `raider` / lateral target を上中段で倒した時だけ CHASE bonus を与え、route/aggressive/marksman が得をし、camper が得をしないことを headless で見る。

解決できる問題: 前へ出る積極理由ができる。新しい懸念: reward が強すぎると被弾覚悟で突っ込むだけになる。

## 設計サイクル 2

現状案の良いところ/悪いところ 30件:
1. wave を壊さない。2. v58 の検証資産を流用できる。3. telemetry 差が明確。4. route を前に出せる。5. camper は底に残る。6. 人間にも CHASE が見える。7. score に反映される。8. gauge にも反映される。9. chain との相性が良い。10. raider の役割が増える。11. ただし見た目が小さい。12. popup が多い可能性。13. route bot が危険を踏む可能性。14. forward threshold が曖昧。15. lateral target 定義が広すぎる可能性。16. score inflation の危険。17. boss score 比較に影響。18. novice がどうなるか不明。19. survival は取りにくい。20. defensive は取りにくい。21. それは policy 差として有効。22. 弾量不変なので理不尽化しにくい。23. HP不変なので難易度急上昇しにくい。24. route y 変更が最大リスク。25. headless で即検出できる。26. matrix 追記で比較できる。27. stage grammar は維持。28. design intent は明確。29. 実機体感は未検証。30. 次回 browser 目視が必要。

改善案 30件:
1. threshold は `H-155`。2. route y を `H-170`。3. aggressive/marksman は維持。4. camper y は維持。5. `raider` bonus 1.75。6. その他 lateral 1.35。7. bonus は base*chain*0.42。8. gauge +8/+4。9. grazeStreak +2。10. `CHASE` popup。11. UI に cumulative CHASE。12. summary に chaseBonus。13. summary に forwardAttackPct。14. summary に forwardChaseKills。15. summary に midfieldKills。16. traceDigest に forward。17. check で visible。18. matrix で separates。19. skilled policies 条件。20. camperNotDominant 維持。21. density 条件維持。22. boss 条件維持。23. source note 更新。24. README 更新。25. devlog 更新。26. continuous directive 更新。27. staging 更新。28. commit/push。29. 実機目視は次回。30. 失敗したら threshold を戻す。

筋の良い案: route の基準位置だけ少し上げ、報酬は上中段撃破時に限定する。

解決できる問題: bot も人間も「上へ出る理由」を持つ。新しい懸念: route clear が不安定になる可能性。

## 設計サイクル 3

採用前の良いところ/悪いところ 30件:
1. 小さい diff。2. v58 の意図を継承。3. 罰から報酬へ進む。4. human-visible。5. machine-visible。6. stage unchanged。7. boss unchanged。8. wave unchanged。9. policy matrix extended。10. telemetry reusable。11. ただし面白さの最終判定ではない。12. popup は説明的すぎるかも。13. bonus 数値は仮。14. route が上がると被弾増。15. aggressive が強くなりすぎる可能性。16. marksman が最高得点化するのは自然。17. camper は失敗継続すべき。18. novice は失敗してよい。19. survival は得しなくてよい。20. score 比較の基準が変わる。21. v58 との単純比較は注意。22. raw JSONL に残る。23. design_log に意図を残す。24. devlog に結果を残す。25. README に実行方法。26. continuous directive で次焦点。27. staging で evidence。28. commit を分ける。29. push する。30. 次は目視。

改善案 30件:
1. 採用。2. しきい値だけ先に実装。3. route y 実装。4. summary 実装。5. kill reward 実装。6. UI 実装。7. check path 更新。8. version 更新。9. matrix 更新。10. docs 更新。11. headless 実行。12. 数値確認。13. 失敗時は bonus 弱める。14. route clear 失敗時は y を戻す。15. camper clear なら罰を戻す。16. score 逆転なら multiplier 調整。17. density 悪化なら wave は触らず route 調整。18. eventCount 閾値を確認。19. browser は任意。20. raw append 許容。21. unrelated diff は混ぜない。22. commit 対象限定。23. push。24. staging。25. directive last_result。26. future focus。27. no Slack direct unless requested。28. no new rules。29. no memory index update。30. close cycle。

採用案: `v05_1_cdx_v59` として forward chase reward を実装する。

## 検証方法

- `node tools\headless_graze_log_cdx_v05_2_v59_check.js`
- `node tools\headless_graze_log_cdx_v05_2_v59_policy_matrix_check.js`

合格条件:

- route が clear し、routeCoveragePct 1 を維持する。
- `forwardAttackPct` / `forwardChaseKills` / `chaseBonus` が route で観測される。
- route/aggressive/marksman が chaseBonus を得る。
- camper は bottomCampPct が高いまま、chaseBonus と forwardChaseKills が route より低い。
- v58 の density / boss cue / guide trace 条件を壊さない。
