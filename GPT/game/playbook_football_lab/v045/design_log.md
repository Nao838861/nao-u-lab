# Playbook Football Lab v045 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v044 で defensive look の並び替え UI は短くなった。次は攻撃側の保存 route slot に同じ整理機能がない非対称さが目立つ。プレー作成ツールとして、攻撃と守備の保存操作は揃っている方が扱いやすい。

## 変更

- `moveSlotUpButton` / `moveSlotDownButton` を追加した。
- `moveActiveRouteSlot(delta)` を追加した。
- active route slot を配列内で移動し、activeId は維持する。
- debug snapshot に `activeSavedSlotIndex` を追加した。
- verify に route slot reorder controls を追加した。

## 残り

- `Confirm delete` の残り時間は UI 上に表示していない。
- second weak の線には grade に応じた濃淡がない。
