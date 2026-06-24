# Playbook Football Lab v046 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v045 で保存スロットの整理は攻守ともに揃った。次は破壊的操作の状態表示が弱い。`Confirm delete` は自動解除されるが、残り時間が見えないため、いつ安全状態へ戻るか分かりにくい。ボタン文言に countdown を出すのが最小で効果的だと判断した。

## 変更

- `deleteLookConfirmInterval` と `deleteLookConfirmDeadline` を追加した。
- `deleteLookConfirmRemainingMs()` を追加した。
- `updateDeleteLookConfirmText()` を追加した。
- 確認中は `Confirm 3s` のように残り秒数を表示する。
- debug snapshot に `deleteLookConfirmRemainingMs` を追加した。

## 残り

- second weak の線には grade に応じた濃淡がない。
- replay marker から preview 差分地点へはまだジャンプできない。
