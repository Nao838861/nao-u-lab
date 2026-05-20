# graze_log v05.2_cdx_v27 devlog

## 目的

v26 は橙強敵の露出窓を「寄って撃つ」操作へ寄せた。ただし成功時のリターンは主にダメージ差で、プレイヤーが横へ寄る理由としてはまだ弱い。今回は露出窓ヒットの初回だけ `FOCUS BREAK` を発生させ、局所弾消しと少量ゲージ返還を返す。

## 実装

- v26 から `v05_1_cdx_v27` を作成。
- `ORANGE_FOCUS_BREAK_RADIUS=48` と `ORANGE_FOCUS_BREAK_GAUGE=3` を追加。
- orangeAce に `focusBreakRewarded` を持たせ、敵ごとに初回 1 回だけ報酬が出るようにした。
- `triggerOrangeFocusBreak(e)` を追加し、露出窓ヒット時に近傍 enemy bullet を消し、消した弾を graze 成果として数え、ゲージ +3、ring、`FOCUS BREAK +3` popup を出す。
- title を `v05.2_cdx_v27 - focus break rewards` に更新した。

## 検証

実行:

```powershell
node tools\headless_graze_log_cdx_v05_2_v27_check.js
```

確認項目:

- v26 の BOMB / Active DEF / midboss / boss / clear / route contract 検査を維持する。
- 閉じた橙強敵への自弾が 1 ダメージである。
- 露出窓中の橙強敵への自弾が 3 ダメージである。
- 予告中の橙が commit lane へ寄る。
- 露出窓中の橙近くで自弾吸い込みが働く。
- 露出窓ヒットの初回だけ `FOCUS BREAK +3` が出て、近傍弾が消え、ゲージが +3 され、graze / DEF readiness に接続される。
- simpleBot が clear する。

## 残リスク

headless では focus break の発火と clear 維持は確認できるが、人間プレイで報酬が強すぎないか、または +3 が弱すぎて気づきにくいかは未確認。次回は v27 を実プレイ前提で、橙窓成功が「横へ寄って撃つ」判断として自然に見えるかを見る。
