# Playbook Football Lab v057

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v057 の狙い

v056 で replay marker の現在位置は strip 上で読めるようになった。v057 では defensive look 削除確認の状態を aria label と live region でも伝え、危険操作の補助を視覚以外にも広げた。

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
- 現在 frame と一致する replay marker は active 表示になる
- defensive look 削除確認は live region で残り秒数と結果を通知する
- `Delete look` は `Confirm 3s` のように残り秒数を表示する
- route slot と defensive look はどちらも `↑` / `↓` で並び替え可能

## 実装済み

- delete confirmation aria status
- active replay marker highlight
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
- v057 用 storage key と v056 route legacy 読み
