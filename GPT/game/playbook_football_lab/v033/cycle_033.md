# サイクル 033

## 判断

v032 で削除操作の意味は明確になった。次に必要なのは、既存の守備 look を壊さずに試せる複製操作。保存 look が増えた今、コピーして少しだけ変える流れがないと、調整のたびに元案を上書きするリスクが残る。

## 実装

- `Duplicate` ボタンを追加した。
- `duplicateCurrentDefense()` を追加した。
- active look がある場合はその layout を複製し、ない場合は現在のフィールド状態を複製元にする。
- 複製後は新しい slot を active にし、名前へ `Copy` を付ける。
- snapshot に `activeDefenseSlot` を追加した。

## 検証

- `node --check game\playbook_football_lab\v033\game.js`
- `node --check game\playbook_football_lab\v033\verify.js`
- `node verify.js`
- v033 内に v032 固有のタイトル・サイクル名が残っていないことを検索する

