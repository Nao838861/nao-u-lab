# サイクル 032

## 判断

v031 で weak defender は見えるようになったが、守備 look の削除操作が `Reset defense` のままだった。実際には active look を消す操作なので、この文言は保存スロット UI として誤解を招く。今回は小さいが、操作の意味を正しく表示する。

## 実装

- `Reset defense` の表示を `Delete look` に変更した。
- aria label を `Delete active defensive look` にした。
- 削除時ログを `look deleted` に変更した。
- 保存 look がない時は `no saved look to delete` と表示する。
- storage key を v032 に更新した。

## 検証

- `node --check game\playbook_football_lab\v032\game.js`
- `node --check game\playbook_football_lab\v032\verify.js`
- `node verify.js`
- v032 内に v031 固有のタイトル・サイクル名が残っていないことを検索する

