# Playbook Football Lab v045

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v045 の狙い

v044 で defensive look の並び替え操作は締まった。v045 では保存済み route slot にも `↑` / `↓` を追加し、攻撃ルートの保存バリエーションも比較順に整理できるようにした。

## 操作

- `Save slot` で active play の route variation を保存
- route slot を選んで `↑` / `↓` で上下に移動
- active slot は移動後も選択されたまま残る
- defensive look 側も `↑` / `↓` で並び替え可能
- 赤い `weak` と琥珀色の `next weak` で守備の弱点を比較できる

## 実装済み

- saved route slot reorder controls
- `moveActiveRouteSlot(delta)`
- `activeSavedSlotIndex` snapshot
- arrow defensive look reorder buttons
- v045 用 storage key と v044 route legacy 読み
