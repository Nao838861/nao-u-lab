# graze_log v05.2_cdx_v27 design_log

## 入力

継続 directive 原文:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

現在の焦点:

> v26 を人間プレイで確認し、橙の予告移動と自弾吸い込みが「横へ寄って撃つ」操作として自然か、補助が強すぎないかを見る。
> 「体感が変わらない」を潰すため、今後は UI/評価軸だけの変更を playable diff として扱わない。
> headless は clear 可能性とイベント発火の検査に使い、面白さ判定とは分ける。

## 実装前判断

v26 は橙強敵の弱点窓を「寄って撃つ」形に寄せたが、ヒット時の結果はダメージ増加が中心で、プレイヤーの短期判断としてはまだ弱い。今回は敵配置、BOMB、Active DEF、boss は触らず、橙の露出窓へ初回ヒットした時だけ `FOCUS BREAK` を出し、近傍弾を消して少量ゲージを返す。これにより、横へ寄って撃つ行為が「安全を作る」「BOMB 資源が戻る」という即時リターンになる。

採用する過去知見:

- `Playable / Headless 評価`: clear だけでなく、橙窓の成功時リターンを focused probe にする。
- `Balance / Rule Space`: 新 wave 追加ではなく、既存橙のリスク/リターンを変える。
- `Feedback / Rights / Human Judgment`: UI 説明ではなく、操作結果が画面と資源に返る playable diff にする。

## 設計サイクル 1

良いところ / 悪いところ 30件:

1. v26 は予告移動がある。2. 吸い込みもある。3. ただし成功報酬が薄い。4. 3ダメージは数値で見えにくい。5. 弾が減れば体感しやすい。6. ゲージが増えれば次行動に接続する。7. 全画面消去は強すぎる。8. 小半径なら局所報酬になる。9. 毎ヒット報酬は過剰。10. 初回だけなら管理しやすい。11. 橙を倒す前にも報酬が返る。12. BOMB 経済を壊す危険がある。13. +3 なら小さい。14. 弾消し半径 48 は画面全体ではない。15. popup は成功理解に役立つ。16. 文字が増えすぎると UI 依存。17. 一瞬の `FOCUS BREAK` なら許容。18. 敵配置は維持できる。19. boss は維持できる。20. DEF は維持できる。21. headless で報酬を検査できる。22. 人間の面白さは検査できない。23. v26 との差分が明確。24. 実装範囲が狭い。25. route contract は変えない。26. simpleBot clear は維持したい。27. 成功時 score 増加は小さくてよい。28. 近傍弾だけを消すべき。29. 残リスクは補助過多。30. 次回は実プレイで見る。

改善案 30件:

1. `ORANGE_FOCUS_BREAK_RADIUS` を追加。2. `ORANGE_FOCUS_BREAK_GAUGE` を追加。3. state に `orangeFocusBreaks` を追加。4. orangeAce に `focusBreakRewarded` を持たせる。5. 露出中ヒットで `triggerOrangeFocusBreak()` を呼ぶ。6. 初回だけ発火。7. 近傍 enemy bullet を消す。8. 消した弾に粒子を出す。9. ゲージを +3。10. popup を `FOCUS BREAK +3`。11. ring を出す。12. score は消弾 1 個 +6。13. 通常ヒットは変えない。14. 露出ダメージ 3 は維持。15. HP 6 は維持。16. 吸い込みは維持。17. 発射抑制は維持。18. 橙の commit lane は維持。19. title を v27 にする。20. README を更新。21. devlog を更新。22. design_log を更新。23. auto_verify を更新。24. headless path を v27 にする。25. headless constants に追加。26. headless probe で弾 2 個消去を確認。27. simpleBot clear を確認。28. directive を更新。29. staging を更新。30. commit/push する。

筋の良い案:

- 橙露出窓の初回ヒットだけを小さな成功イベントにする。成功が「敵が削れる」だけでなく「局所的に弾が薄くなる」「BOMB へ少し近づく」として返るため、横へ寄る判断の意味が強くなる。

新しく生じる懸念:

- 弾消しとゲージ返還が強すぎると橙が無料の安全地帯になる。今回は半径 48 / ゲージ +3 / 敵ごとに初回 1 回に限定し、BOMB の主役性を壊さない。

## 設計サイクル 2

良いところ / 悪いところ 30件:

1. 初回限定は読みやすい。2. 報酬が一度なので乱用しにくい。3. 弾消しは成功が見える。4. ゲージ返還は次の BOMB に効く。5. +3 は小さい。6. ただし複数橙で積み上がる。7. route の価値は残る。8. DEF とは役割が違う。9. BOMB とも役割が違う。10. 近傍弾だけなので避けは残る。11. 開放窓へ撃つ理由が増える。12. 吸い込みの意味も強くなる。13. 成功 popup は短い。14. UI 説明の増加ではない。15. boss 戦に影響しない。16. midboss にも間接的に資源が効く。17. clear bot が強くなりすぎるかもしれない。18. その場合はゲージを下げる余地がある。19. 弾消し半径も下げられる。20. 既存 constants と同じ作法で入る。21. headless は open hit で発火できる。22. ebullets の残数で検査できる。23. popup 文字でも検査できる。24. state counter でも検査できる。25. doc は v26 から作り直す。26. v18 削除には触らない。27. memory 大量差分には触らない。28. Slack pending はない。29. continuous directive が対象。30. push まで行う。

採用案:

- `triggerOrangeFocusBreak(e)` を新設し、露出窓ヒット時に初回だけ実行する。近傍弾を半径 48 で消し、消した弾を graze 成果として数え、ゲージ +3、リング、popup、counter を出す。

採用しない案:

- 橙撃破時だけ報酬を出す: 露出窓へ入った瞬間の手触りが弱い。
- 全画面弾消し: BOMB と Active DEF の役割を奪う。
- HP や wave を再調整する: 今回の焦点が「窓成功の体感」から散る。

## 設計サイクル 3

良いところ / 悪いところ 30件:

1. v27 は playable diff である。2. 操作結果が変わる。3. 橙窓成功で弾が消える。4. 橙窓成功でゲージが戻る。5. 開いた橙へ撃つ理由が強い。6. 通常時は弱くならない。7. BOMB は主役のまま。8. DEF は主役のまま。9. boss は触らない。10. stage は触らない。11. route contract は触らない。12. simpleBot clear を見る。13. final BOMB を見る。14. Active DEF を見る。15. orange open damage を見る。16. orange warn を見る。17. orange magnet を見る。18. focus break を見る。19. headless は面白さを断定しない。20. 人間確認は必要。21. +3 が弱すぎるかもしれない。22. 半径 76 が強すぎるかもしれない。23. popup が少し説明的かもしれない。24. ただし成功フィードバックとして短い。25. README は簡潔にする。26. devlog に残リスクを書く。27. directive は active 継続。28. staging に path を残す。29. commit する。30. push 後 status を確認する。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v27_check.js
```

期待:

- clear-capable bot が clear する。
- boss final cue と final BOMB 使用を維持する。
- Active DEF 使用を維持する。
- route contract の成功 / 失敗 probe が通る。
- 閉じた橙強敵へのヒットは 1 ダメージ。
- 露出窓中の橙強敵へのヒットは 3 ダメージ。
- 予告中の橙が commit lane へ寄る。
- 露出窓中の自弾吸い込みが働く。
- 露出窓ヒットの初回だけ `FOCUS BREAK +3` が出て、近傍弾が消え、ゲージが +3 され、消した弾が graze / DEF readiness へ接続される。
