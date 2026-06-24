# cycle_042

## 判断

v041 で 2 番目に弱い defender は表示できた。ただし `next weak` ラベルは固定 offset のままで、フィールド端で切れる可能性があった。比較表示を増やした直後なので、まずその読みやすさを安定させる。

## 実装

- v042 用 storage key に更新した。
- `secondWeakCoverageLabelBounds()` を追加した。
- `next weak` ラベルの x/y を field bounds 内に clamp した。
- `drawSecondWeakCoverageCue()` が bounds helper を使うようにした。
- debug snapshot に `secondWeakCoverageLabel` を追加した。

## 検証

- `node --check game\playbook_football_lab\v042\game.js`
- `node --check game\playbook_football_lab\v042\verify.js`
- `node verify.js`
- v042 内に v041 固有のタイトル・サイクル名が残っていないことを検索する

## 次の観察

フィールド上の弱点表示はかなり安定してきた。次は保存済み守備ルックの並び替えを入れると、比較・試行錯誤の操作性が上がる。
