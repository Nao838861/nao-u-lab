# Playbook Football Lab v042

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v042 の狙い

v041 で 2 番目に弱い defender も表示できるようになった。v042 ではその `next weak` ラベルも field bounds 内に収め、端の defender でも比較表示が切れないようにした。

## 操作

- 赤い `weak` ラベル: 現在の最弱 defender
- 琥珀色の `next weak` ラベル: 2 番目に弱い defender
- `next weak` ラベルはフィールド端でも内側へ寄る
- 赤い threat line は最弱 defender の危険度に応じて太く濃くなる
- `Delete look` の確認状態は約 3.2 秒で自動解除される

## 実装済み

- second weak label bounds clamp
- `secondWeakCoverageLabel` snapshot
- second weak defender の薄い field cue
- danger weighted weak threat line
- v042 用 storage key と v041 route legacy 読み
