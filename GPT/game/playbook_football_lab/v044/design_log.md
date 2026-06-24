# Playbook Football Lab v044 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v043 で並び替えは機能したが、`Up` / `Down` の文字ボタンはツール UI として冗長だった。ここは機能を増やすより、操作面の密度を上げる小さな polish が妥当だと判断した。

## 変更

- `moveDefenseUpButton` の表示を `↑` にした。
- `moveDefenseDownButton` の表示を `↓` にした。
- aria-label は維持し、意味は読み上げ可能にした。
- verify に矢印表示の確認を追加した。
- storage key を v044 に更新した。

## 残り

- 保存済み route slot には並び替えがない。
- `Confirm delete` の残り時間は UI 上に表示していない。
