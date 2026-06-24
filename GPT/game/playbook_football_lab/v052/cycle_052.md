# cycle_052

## 判断

v051 で保存操作は toolbar として整理されたが、矢印ボタンは先頭や末尾でも押せる見た目のままだった。並び替えできない状態が操作前に分からないのは小さいが繰り返し触る UI ではストレスになる。v052 では route slot と defensive look の上下ボタンを list edge で disabled にする。

## 実装

- `syncRouteReorderButtons()` を追加した。
- `syncDefenseReorderButtons()` を追加した。
- `renderSlotList()` と `renderDefenseSlotList()` で active index を計算し、上下ボタンの disabled を同期するようにした。
- disabled の toolbar icon に専用スタイルを追加した。
- debug snapshot に `routeReorderDisabled` と `defenseReorderDisabled` を追加した。
- v052 用 storage key に更新し、v051 route を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v052\game.js`
- `node --check game\playbook_football_lab\v052\verify.js`
- `node verify.js`
- v052 内に v051 固有のタイトル・サイクル名が残っていないことを検索する

## 次の候補

- delete countdown を progress 表現にする。
- badge 文を outcome 別に短く整形する。
- urgency に field position を少しだけ反映する。
