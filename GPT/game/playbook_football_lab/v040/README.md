# Playbook Football Lab v040

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v040 の狙い

v039 で weak defender と target の関係線は見えるようになった。v040 ではその線に危険度の強弱を持たせ、grade が低い弱点ほど太く濃く見えるようにした。

## 操作

- フィールド上の赤い `weak` ラベル: 現在の最弱 defender
- 赤い点と破線: weak defender が追うべき receiver / QB
- zone defender の場合は、defender から zone landmark、さらに脅威 receiver へ線が伸びる
- grade が低いほど threat line が太く濃くなる
- `Delete look` の確認状態は約 3.2 秒で自動解除される

## 実装済み

- `weakThreatStyle()` による危険度スタイル
- `weakCoverageThreatStyle` snapshot
- weak cue から target receiver / QB への threat line
- zone landmark 経由の weak threat line
- v040 用 storage key と v039 route legacy 読み
