# cycle_057

## 判断

v056 で replay marker の現在位置は読めるようになった。次に残るアクセシビリティ上の粗さは、削除確認の progress が視覚だけに寄っていることだった。危険操作なので、確認中・残り時間・削除不可・削除完了を live region と aria label でも伝える。

## 実装

- `deleteLookStatus` の `aria-live="polite"` live region を追加した。
- `resetDefenseButton` に `aria-describedby` を追加した。
- confirmation 中は `aria-pressed` と `aria-label` を更新するようにした。
- live region に確認中の残り秒数、削除不可、削除完了を通知するようにした。
- debug snapshot に `deleteLookAriaLabel` と `deleteLookStatus` を追加した。
- v057 用 storage key に更新し、v056 route を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v057\game.js`
- `node --check game\playbook_football_lab\v057\verify.js`
- `node verify.js`
- v057 内に v056 固有のタイトル・サイクル名が残っていないことを検索する

## 次の候補

- marker active を近傍 frame でも保持する。
- toolbar の mobile 折り返しをさらに調整する。
- badge 文を日本語 UI に寄せる。
