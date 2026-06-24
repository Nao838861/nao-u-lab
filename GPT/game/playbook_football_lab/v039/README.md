# Playbook Football Lab v039

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v039 の狙い

v038 で削除確認は安全になった。v039 では weak defender が何に対して弱いのかをフィールド上の線で示し、zone / man / rush の理由を見た目で追いやすくした。

## 操作

- フィールド上の赤い `weak` ラベル: 現在の最弱 defender
- `weak` 下の小さな行: 弱い理由の要約
- 赤い点と破線: weak defender が追うべき receiver / QB
- zone defender の場合は、defender から zone landmark、さらに脅威 receiver へ線が伸びる
- `Delete look` の確認状態は約 3.2 秒で自動解除される

## 実装済み

- weak cue から target receiver / QB への threat line
- zone landmark 経由の weak threat line
- `weakCoverageTarget` snapshot
- delete confirmation timeout
- v039 用 storage key と v038 route legacy 読み
