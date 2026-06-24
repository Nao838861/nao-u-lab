# Playbook Football Lab v048

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v048 の狙い

v047 で `next weak` の線にも grade に応じた濃淡が入り、守備弱点の比較は読みやすくなった。v048 では結果カードの preview 差分を replay marker に接続し、`PREVIEW DELTA` を押すだけで結果が分岐した瞬間へ戻れるようにした。

## 操作

- 赤い `weak` は最弱 defender
- 琥珀色の `next weak` は 2 番目に弱い defender
- `PREVIEW DELTA` marker は結果カードの preview 差分地点へジャンプする
- `Delete look` は `Confirm 3s` のように残り秒数を表示する
- route slot と defensive look はどちらも `↑` / `↓` で並び替え可能

## 実装済み

- preview delta replay marker
- `previewDeltaMarker` snapshot
- second weak danger styling
- delete confirmation countdown
- route slot reorder controls
- v048 用 storage key と v047 route legacy 読み
