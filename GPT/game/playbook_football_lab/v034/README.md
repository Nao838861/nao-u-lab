# Playbook Football Lab v034

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なフットボール試作として育てているプロトタイプ。

## v034 の狙い

defensive look を複製・保存・削除できるようになったため、削除だけは誤操作を避ける必要が出てきた。v034 では `Delete look` を二段階確認にした。

## 操作

- `Delete look`: 1回目で確認状態に入る
- `Confirm delete`: active look を削除する
- `Save defense` / `New look` / `Duplicate` / look 選択: 削除確認状態を解除する

## 実装済み

- `setDeleteLookConfirming()`
- `requestDeleteCurrentDefense()`
- `#resetDefenseButton.confirming`
- `deleteLookConfirming` snapshot
- v034 用 storage key と v033 route legacy 読み

