# Playbook Football Lab v047

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v047 の狙い

v046 で削除確認の残り時間は分かりやすくなった。v047 では `next weak` の線にも grade に応じた濃淡を入れ、2 番手の弱点も危険度に応じて読めるようにした。

## 操作

- 赤い `weak` は最弱 defender
- 琥珀色の `next weak` は 2 番目に弱い defender
- `next weak` の線と点は grade が低いほど少し太く濃くなる
- `Delete look` は `Confirm 3s` のように残り秒数を表示する
- route slot と defensive look はどちらも `↑` / `↓` で並び替え可能

## 実装済み

- second weak danger styling
- `secondWeakThreatStyle` snapshot
- delete confirmation countdown
- route slot reorder controls
- v047 用 storage key と v046 route legacy 読み
