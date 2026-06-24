# Playbook Football Lab v044

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v044 の狙い

v043 で保存済み defensive look を並び替えられるようになった。v044 では `Up` / `Down` の文字ボタンを `↑` / `↓` に変え、保存操作のツール感と密度を上げた。

## 操作

- `Defense Looks` で active saved look を選ぶ
- `↑` / `↓` で active look をリスト内で移動する
- active look は移動後も選択されたまま残る
- 移動できない端では event log に理由が出る
- 赤い `weak` と琥珀色の `next weak` で守備の弱点を比較できる

## 実装済み

- arrow reorder buttons
- saved defensive look reorder controls
- `activeDefenseSlotIndex` snapshot
- v044 用 storage key と v043 route legacy 読み
