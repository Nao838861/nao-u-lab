# Playbook Football Lab v055

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v055 の狙い

v054 で `PREVIEW DELTA` badge は読みやすくなった。v055 では weak threat line の urgency に field position を加え、敵陣深くで弱点 cue が少し強く出るようにした。

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
- weak threat line は red zone に近づくほど少し強くなる
- `Delete look` は `Confirm 3s` のように残り秒数を表示する
- route slot と defensive look はどちらも `↑` / `↓` で並び替え可能

## 実装済み

- field position urgency for weak threats
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
- v055 用 storage key と v054 route legacy 読み
