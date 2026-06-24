# Playbook Football Lab v043

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v043 の狙い

v042 でフィールド上の弱点表示は安定してきた。v043 では保存済み defensive look を上下に並び替えられるようにし、比較したい順番でルックを整理できるようにした。

## 操作

- `Defense Looks` で active saved look を選ぶ
- `Up` / `Down` で active look をリスト内で移動する
- active look は移動後も選択されたまま残る
- 移動できない端では event log に理由が出る
- 赤い `weak` と琥珀色の `next weak` で守備の弱点を比較できる

## 実装済み

- saved defensive look reorder controls
- `moveActiveDefenseSlot(delta)`
- `activeDefenseSlotIndex` snapshot
- second weak label bounds clamp
- v043 用 storage key と v042 route legacy 読み
