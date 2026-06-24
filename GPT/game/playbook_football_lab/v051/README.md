# Playbook Football Lab v051

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v051 の狙い

v050 で replay frame の意味は field badge で読みやすくなった。v051 では route slot と defensive look の保存操作を小さな toolbar として整理し、保存、並び替え、削除の重みを見分けやすくした。

## 操作

- 赤い `weak` は最弱 defender
- 琥珀色の `next weak` は 2 番目に弱い defender
- weak threat line は down / distance が厳しいほど少し強くなる
- `PREVIEW DELTA` marker は結果カードの preview 差分地点へジャンプする
- `PREVIEW DELTA` frame では field 右上に分析 badge が出る
- route slot / defensive look は compact toolbar で保存、並び替え、削除する
- `Delete look` は `Confirm 3s` のように残り秒数を表示する
- route slot と defensive look はどちらも `↑` / `↓` で並び替え可能

## 実装済み

- compact save toolbars
- preview delta field badge
- down / distance urgency for weak threat lines
- preview delta replay marker
- `previewDeltaMarker` / `previewDeltaBadge` snapshot
- second weak danger styling
- delete confirmation countdown
- route slot reorder controls
- v051 用 storage key と v050 route legacy 読み
