# Playbook Football Lab v036 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v035 で weak cue の理由表示は入った。次の問題は、守備ルックを複製して比較する流れで名前が `Copy` に偏り、同じ call 内に似た名前が並んでしまうことだった。

## 変更

- `uniqueDefenseSlotName()` を追加した。
- `duplicateCurrentDefense()` が新 helper で複製名を決めるようにした。
- `Base Copy` が存在する場合は `Base Copy 2` 以降を探す。
- storage key を v036 に更新した。
- verify に複製名 helper の確認を追加した。

## 残り

- weak cue ラベルが端で読みにくくなる可能性は残る。
- `Confirm delete` の確認状態は手動解除だけで、自動 timeout はまだない。
