# cycle_053

## 判断

v052 で reorder toolbar の状態は明確になった。次に残る操作上の粗さは、defensive look の削除確認が `Confirm 3s` の文言だけで、残り時間の減りが視覚的に分からない点だった。削除は危険操作なので、時間制限を progress として読めるようにする。

## 実装

- confirming 中の `resetDefenseButton` に `--confirm-progress` を設定するようにした。
- `updateDeleteLookConfirmText()` で残り時間から progress percentage を更新する。
- confirming button に progress background を追加した。
- confirmation が解除されたら custom property を消すようにした。
- debug snapshot に `deleteLookConfirmProgress` を追加した。
- v053 用 storage key に更新し、v052 route を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v053\game.js`
- `node --check game\playbook_football_lab\v053\verify.js`
- `node verify.js`
- v053 内に v052 固有のタイトル・サイクル名が残っていないことを検索する

## 次の候補

- badge 文を outcome 別に短く整形する。
- urgency に field position を少しだけ反映する。
- toolbar の mobile 折り返しをさらに調整する。
