# サイクル 034

## 判断

v033 で defensive look を複製できるようになった。保存 look を増やせるようになると、削除の誤クリックが相対的に痛くなる。今回は `Delete look` を二段階確認にし、誤削除を減らす。

## 実装

- `setDeleteLookConfirming()` を追加した。
- `requestDeleteCurrentDefense()` を追加し、1回目は `Confirm delete` 表示に切り替えるようにした。
- 2回目のクリックで active look を削除する。
- 保存、選択、複製時には確認状態を解除する。
- snapshot に `deleteLookConfirming` を追加した。

## 検証

- `node --check game\playbook_football_lab\v034\game.js`
- `node --check game\playbook_football_lab\v034\verify.js`
- `node verify.js`
- v034 内に v033 固有のタイトル・サイクル名が残っていないことを検索する

