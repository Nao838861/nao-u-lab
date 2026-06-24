# cycle_037

## 判断

v036 で守備ルック複製名の衝突は減った。次に目立つ弱点は、v035 で追加した weak cue の理由ラベルが固定 offset のままで、フィールド端に近い defender では読みにくくなることだった。

## 実装

- v037 用 storage key に更新した。
- `clampValue()` を追加した。
- weak cue ラベルの x/y を field bounds 内に clamp した。
- ラベル幅を `weak` 行と理由行の text width から計算した。
- `weakCoverageLabelBounds()` を debug snapshot に追加した。

## 検証

- `node --check game\playbook_football_lab\v037\game.js`
- `node --check game\playbook_football_lab\v037\verify.js`
- `node verify.js`
- v037 内に v036 固有のタイトル・サイクル名が残っていないことを検索する

## 次の観察

フィールド上の説明は読みやすくなった。次は `Confirm delete` の確認状態が残り続ける問題を扱うと、保存ルック管理の操作ミスをさらに減らせる。
