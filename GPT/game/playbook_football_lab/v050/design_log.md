# Playbook Football Lab v050 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v049 で pre-snap の弱点 cue は状況を少し見るようになった。次に気になるのは、`PREVIEW DELTA` marker を押しても field 上には分析内容が出ず、結果カードとの対応を目で追う必要がある点。リプレイを見ている frame 自体に短い badge を出す。

## 変更

- replay frame に `previewDeltaBadge` を保存するようにした。
- 結果確定時に marker frame へ badge 情報を差し込むようにした。
- `drawPreviewDeltaBadge()` を追加した。
- debug snapshot に `previewDeltaBadge` を追加した。
- storage key を v050 に更新した。

## 残り

- 保存ボタン群はまだ散らかっている。
- delete countdown はまだ progress 表現ではない。
