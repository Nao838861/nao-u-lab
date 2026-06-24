# cycle_050

## 判断

v049 で weak cue は状況重要度を反映するようになった。次に残る粗さは、`PREVIEW DELTA` marker が strip 上の文字だけで、field 上では何の frame を見ているのか分かりにくい点だった。結果の納得感を上げるには、marker で飛んだ frame 自体に分析 badge が必要だと判断した。

## 実装

- replay frame に `previewDeltaBadge` を保存するようにした。
- `markPreviewDeltaMarker()` で該当 frame に badge 情報を差し込むようにした。
- `drawPreviewDeltaBadge()` を追加し、field 右上に `PREVIEW DELTA` と理由を表示するようにした。
- debug snapshot に `previewDeltaBadge` を追加した。
- v050 用 storage key に更新し、v049 route を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v050\game.js`
- `node --check game\playbook_football_lab\v050\verify.js`
- `node verify.js`
- v050 内に v049 固有のタイトル・サイクル名が残っていないことを検索する

## 次の候補

- 保存ボタン群を toolbar として整理する。
- delete countdown を progress 表現にする。
- route/defense reorder の端状態を disabled で示す。
