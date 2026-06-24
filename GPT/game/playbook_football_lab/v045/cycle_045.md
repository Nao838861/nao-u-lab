# cycle_045

## 判断

v044 で defensive look の並び替えボタンは締まった。次に目立つのは、攻撃 route slot 側には同じ並び替えがないことだった。攻守どちらも保存・比較するツールなので、保存操作の対称性を上げる。

## 実装

- v045 用 storage key に更新した。
- route slot に `↑` / `↓` ボタンを追加した。
- `moveActiveRouteSlot(delta)` を追加した。
- active route slot を上下に動かしても activeId は維持する。
- debug snapshot に `activeSavedSlotIndex` を追加した。

## 検証

- `node --check game\playbook_football_lab\v045\game.js`
- `node --check game\playbook_football_lab\v045\verify.js`
- `node verify.js`
- v045 内に v044 固有のタイトル・サイクル名が残っていないことを検索する

## 次の観察

攻守の保存スロットは整理できるようになった。次は `Confirm delete` の残り時間を可視化すると、破壊的操作の状態がさらに分かりやすくなる。
