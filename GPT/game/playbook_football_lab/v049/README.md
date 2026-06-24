# Playbook Football Lab v049

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v049 の狙い

v048 で結果カードの preview 差分を replay marker に接続した。v049 では weak threat line の危険度に down / distance を反映し、3rd short や 4th down では弱点 cue がより強く見えるようにした。

## 操作

- 赤い `weak` は最弱 defender
- 琥珀色の `next weak` は 2 番目に弱い defender
- weak threat line は down / distance が厳しいほど少し強くなる
- `PREVIEW DELTA` marker は結果カードの preview 差分地点へジャンプする
- `Delete look` は `Confirm 3s` のように残り秒数を表示する
- route slot と defensive look はどちらも `↑` / `↓` で並び替え可能

## 実装済み

- down / distance urgency for weak threat lines
- preview delta replay marker
- `previewDeltaMarker` snapshot
- second weak danger styling
- delete confirmation countdown
- route slot reorder controls
- v049 用 storage key と v048 route legacy 読み
