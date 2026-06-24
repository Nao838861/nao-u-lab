# cycle_048

## 判断

v047 で weak cue の比較表示は強くなった。一方で、結果カードに `Preview liked ...` と出ても、その差分がリプレイのどの瞬間で起きたかを探すには手動で scrubber を動かす必要があった。これはプレー結果の納得感を下げるので、v048 では preview 差分を replay marker として直接ジャンプできるようにした。

## 実装

- replay marker 追加処理を `addReplayMarker` に分離した。
- サック、パス失敗、捕球後終了、Holding の結果確定時に `PREVIEW DELTA` marker を追加した。
- debug snapshot に `previewDeltaMarker` を追加した。
- v048 用 storage key に更新し、v047 route を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v048\game.js`
- `node --check game\playbook_football_lab\v048\verify.js`
- `node verify.js`
- v048 内に v047 固有のタイトル・サイクル名が残っていないことを検索する

## 次の候補

- threat line の危険度に down / distance を反映する。
- `PREVIEW DELTA` frame で field 上にも一瞬の分析 badge を出す。
- 保存ボタン群を toolbar として整理する。
