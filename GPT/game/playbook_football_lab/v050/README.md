# Playbook Football Lab v050

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v050 の狙い

v049 で weak threat line が down / distance を見るようになった。v050 では `PREVIEW DELTA` marker で戻った frame に field badge を出し、なぜその結果になったのかを field 上で読めるようにした。

## 操作

- 赤い `weak` は最弱 defender
- 琥珀色の `next weak` は 2 番目に弱い defender
- weak threat line は down / distance が厳しいほど少し強くなる
- `PREVIEW DELTA` marker は結果カードの preview 差分地点へジャンプする
- `PREVIEW DELTA` frame では field 右上に分析 badge が出る
- `Delete look` は `Confirm 3s` のように残り秒数を表示する
- route slot と defensive look はどちらも `↑` / `↓` で並び替え可能

## 実装済み

- preview delta field badge
- down / distance urgency for weak threat lines
- preview delta replay marker
- `previewDeltaMarker` / `previewDeltaBadge` snapshot
- second weak danger styling
- delete confirmation countdown
- route slot reorder controls
- v050 用 storage key と v049 route legacy 読み
