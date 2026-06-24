# Playbook Football Lab v041

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v041 の狙い

v040 で weak threat line は危険度つきで読めるようになった。v041 では 2 番目に弱い defender も薄く表示し、守備を動かした時に次に崩れる場所を比較しやすくした。

## 操作

- 赤い `weak` ラベル: 現在の最弱 defender
- 赤い threat line: 最弱 defender が追うべき target
- 琥珀色の `next weak` ラベル: 2 番目に弱い defender
- 琥珀色の薄い破線: 2 番手の target
- `Delete look` の確認状態は約 3.2 秒で自動解除される

## 実装済み

- second weak defender の薄い field cue
- `secondWeakCoverage` snapshot
- danger weighted weak threat line
- v041 用 storage key と v040 route legacy 読み
