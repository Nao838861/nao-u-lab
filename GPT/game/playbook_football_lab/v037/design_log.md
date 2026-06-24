# Playbook Football Lab v037 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v036 で保存ルックの複製名は安定した。次はフィールド上の説明が増えたことで、端に近い defender の weak cue が読みにくくなる問題を先に潰すべきだと判断した。

## 変更

- `clampValue()` を追加した。
- `drawWeakCoverageCue()` のラベル矩形を field bounds 内へ収めるようにした。
- ラベル幅を `weak` 行と理由行の長さから測るようにした。
- `weakCoverageLabelBounds()` を追加し、debug snapshot で位置を確認できるようにした。
- storage key を v037 に更新した。

## 残り

- `Confirm delete` の確認状態は手動解除だけで、自動 timeout はまだない。
- zone defender と receiver の関係は文字だけで、線としてはまだ見えない。
