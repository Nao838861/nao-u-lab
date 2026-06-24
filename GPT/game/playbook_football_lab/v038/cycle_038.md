# cycle_038

## 判断

v037 で weak cue の読みやすさは上がった。次に扱うべきは、守備ルック削除の `Confirm delete` が残り続けることだった。破壊的操作の確認状態が長く残ると、後で何気なく押した時に削除される不安がある。

## 実装

- v038 用 storage key に更新した。
- `deleteLookConfirmTimeoutMs` と `deleteLookConfirmTimer` を追加した。
- `setDeleteLookConfirming()` が timer を clear してから状態を更新するようにした。
- 確認状態は約 3.2 秒で自動解除される。
- debug snapshot に timeout 値を追加した。

## 検証

- `node --check game\playbook_football_lab\v038\game.js`
- `node --check game\playbook_football_lab\v038\verify.js`
- `node verify.js`
- v038 内に v037 固有のタイトル・サイクル名が残っていないことを検索する

## 次の観察

削除操作は安全になった。次は zone defender が「誰に反応して弱いのか」をフィールド上の線で示すと、分析がさらに直感的になる。
