# Playbook Football Lab v046

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v046 の狙い

v045 で攻守の保存スロットは並び替えられるようになった。v046 では `Delete look` の確認状態に残り秒数を表示し、破壊的操作がいつ解除されるかをボタン上で分かるようにした。

## 操作

- `Delete look` を押すと `Confirm 4s` のように残り秒数が出る
- もう一度押すと active defensive look を削除する
- countdown が切れると自動的に `Delete look` へ戻る
- route slot と defensive look はどちらも `↑` / `↓` で並び替え可能

## 実装済み

- delete confirmation countdown
- `deleteLookConfirmRemainingMs` snapshot
- route slot reorder controls
- defensive look reorder controls
- v046 用 storage key と v045 route legacy 読み
