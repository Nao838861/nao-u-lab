# cycle_044

## 判断

v043 で defensive look の並び替えは入った。次に目立つ粗さは `Up` / `Down` の文字ボタンだった。ツール操作としては矢印の方が直感的で、パネル内の密度も上がる。

## 実装

- v044 用 storage key に更新した。
- `Up` を `↑` に変更した。
- `Down` を `↓` に変更した。
- aria-label は維持した。
- verify に矢印表示の確認を追加した。

## 検証

- `node --check game\playbook_football_lab\v044\game.js`
- `node --check game\playbook_football_lab\v044\verify.js`
- `node verify.js`
- v044 内に v043 固有のタイトル・サイクル名が残っていないことを検索する

## 次の観察

defense look 側の保存操作はまとまってきた。次は route slot 側にも並び替えを入れると、攻撃・守備の保存操作が揃う。
