# Playbook Football Lab v038

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v038 の狙い

v037 で weak cue の位置は安定した。v038 では守備ルック削除の `Confirm delete` が残り続ける問題を直し、押し間違え後に危険な確認状態が長く残らないようにした。

## 操作

- `Delete look` を押すと一時的に `Confirm delete` へ変わる
- もう一度押すと active saved defensive look を削除する
- 確認状態は約 3.2 秒で自動的に `Delete look` へ戻る
- 保存、複製、別ルック選択でも確認状態は解除される
- フィールド上の `weak` ラベルは端でもフィールド内へ寄る

## 実装済み

- delete confirmation timeout
- weak cue ラベル位置の field bounds clamp
- 守備ルック複製名の一意化
- `deleteLookConfirmTimeoutMs` snapshot
- v038 用 storage key と v037 route legacy 読み
