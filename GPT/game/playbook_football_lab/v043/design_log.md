# Playbook Football Lab v043 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v042 でフィールド上の weak 表示は読みやすくなった。次は保存した defensive look を比較する操作が弱い。複製や保存はできるが順番を直せないため、試行錯誤の整理がしにくい。そこで active look の上下移動を入れた。

## 変更

- `moveDefenseUpButton` / `moveDefenseDownButton` を追加した。
- `moveActiveDefenseSlot(delta)` を追加した。
- active slot を配列内で移動し、activeId は維持する。
- 端で動かせない時は event log に理由を残す。
- debug snapshot に `activeDefenseSlotIndex` を追加した。

## 残り

- ボタンは text の `Up` / `Down` で、まだ icon 化していない。
- `Confirm delete` の残り時間は UI 上に表示していない。
