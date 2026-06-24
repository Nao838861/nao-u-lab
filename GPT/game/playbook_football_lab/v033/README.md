# Playbook Football Lab v033

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なフットボール試作として育てているプロトタイプ。

## v033 の狙い

保存済みの defensive look を壊さずに実験できるように、active look の複製を追加した。元の look を残したまま責任や target を少し変えて、比較できる。

## 操作

- `Save defense`: active look を上書き保存する
- `New look`: 現在の守備設定を新しい look として保存する
- `Duplicate`: active look をコピーして新しい look にする
- `Delete look`: active look を削除する
- 保存済み look: クリックで呼び出す

## 実装済み

- `duplicateDefenseButton`
- `duplicateCurrentDefense()`
- active look または現在状態からの複製
- `activeDefenseSlot` snapshot
- v033 用 storage key と v032 route legacy 読み

