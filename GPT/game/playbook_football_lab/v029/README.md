# Playbook Football Lab v029

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なフットボール試作として育てているプロトタイプ。

## v029 の狙い

守備の位置、責任、man target を複数案として保存できるようにした。これにより、同じ守備コールの中で blitz 寄り、zone 寄り、man 寄りの look を作り分けて比較できる。

## 操作

- `Defense save name`: 保存する守備 look の名前
- `Save defense`: active look を上書き保存する
- `New look`: 現在の守備設定を新しい look として保存する
- 保存済み look: クリックで呼び出す
- `Reset defense`: active look を削除する

## 実装済み

- 守備保存の named slots 化
- 旧単発保存形式から `Saved 1` への移行
- `renderDefenseSlotList()` / `selectDefenseSlot()`
- `defenseSlotSummary()`
- `defenseSlots` snapshot
- v029 用 defense storage key と v028 route legacy 読み

