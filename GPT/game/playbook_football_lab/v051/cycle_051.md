# cycle_051

## 判断

v050 で replay の意味づけはかなり改善した。次に目立つのは、route slot と defensive look の保存操作がただのボタングリッドで、保存、並び替え、複製、削除が同じ重みに見えることだった。頻繁に触る編集 UI なので、操作密度を上げつつ危険操作を見分けやすくする。

## 実装

- route slot 操作に `slot-toolbar` を追加した。
- defense look 操作にも `defense-toolbar` を追加した。
- Save を primary、矢印を固定幅 icon、Delete を danger として見た目を分けた。
- defense toolbar のラベルを `Save / New / Copy / ↑ / ↓ / Delete` に短縮した。
- v051 用 storage key に更新し、v050 route を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v051\game.js`
- `node --check game\playbook_football_lab\v051\verify.js`
- `node verify.js`
- v051 内に v050 固有のタイトル・サイクル名が残っていないことを検索する

## 次の候補

- delete countdown を progress 表現にする。
- route/defense reorder の端状態を disabled で示す。
- badge 文を outcome 別に短く整形する。
