# Playbook Football Lab v054

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v054 の狙い

v053 で削除確認の残り時間は視覚的に分かるようになった。v054 では `PREVIEW DELTA` field badge の本文を outcome 別に短くし、サック、パス失敗、反則、成功の理由を field 上で読みやすくした。

## 操作

- 赤い `weak` は最弱 defender
- 琥珀色の `next weak` は 2 番目に弱い defender
- weak threat line は down / distance が厳しいほど少し強くなる
- `PREVIEW DELTA` marker は結果カードの preview 差分地点へジャンプする
- `PREVIEW DELTA` frame では field 右上に分析 badge が出る
- route slot / defensive look は compact toolbar で保存、並び替え、削除する
- 並び替えできない端では `↑` / `↓` が disabled になる
- `Delete` 確認中は残り時間が progress として減る
- `PREVIEW DELTA` badge は outcome 別の短い理由を表示する
- `Delete look` は `Confirm 3s` のように残り秒数を表示する
- route slot と defensive look はどちらも `↑` / `↓` で並び替え可能

## 実装済み

- outcome-specific preview delta badge copy
- delete confirmation progress
- reorder edge disabled states
- compact save toolbars
- preview delta field badge
- down / distance urgency for weak threat lines
- preview delta replay marker
- `previewDeltaMarker` / `previewDeltaBadge` snapshot
- second weak danger styling
- delete confirmation countdown
- route slot reorder controls
- v054 用 storage key と v053 route legacy 読み
