# Playbook Football Lab v038 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v037 でフィールド上の weak cue は読みやすくなった。次は保存ルック管理の破壊的操作で、`Confirm delete` が残り続けると後続操作時に誤削除の不安が残るため、時間で解除するのが妥当だと判断した。

## 変更

- `deleteLookConfirmTimeoutMs` と `deleteLookConfirmTimer` を追加した。
- `setDeleteLookConfirming()` が既存 timer を必ず clear するようにした。
- 確認状態に入ったら 3.2 秒後に自動解除する。
- 自動解除時に event log へ `Delete confirmation expired.` を残す。
- debug snapshot に timeout 値を追加した。

## 残り

- zone defender と receiver の関係は文字だけで、線としてはまだ見えない。
- 保存済み look の並び替えはまだできない。
