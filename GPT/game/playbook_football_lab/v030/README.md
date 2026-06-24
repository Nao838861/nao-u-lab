# Playbook Football Lab v030

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なフットボール試作として育てているプロトタイプ。

## v030 の狙い

守備 look を複数保存できるようになったため、次はその look の良し悪しを比較しやすくする。v030 では defender ごとの coverage / pressure strength を表示し、どの選手が強く、どこが弱点かを見えるようにした。

## 操作

- `Defender strength`: 現在の守備 look における defender ごとの強さを見る
- `Save defense`: active look を上書き保存する
- `New look`: 現在の守備設定を新しい look として保存する
- 保存済み look: クリックで呼び出す
- `Defender / Duty / Target`: 選択中 defender の責任と man target を直接指定する

## 実装済み

- `coverageCard`
- `currentCoverageStrength()`
- `renderCoverageCard()`
- duty 別の簡易 strength 評価
- `coverageStrength` snapshot
- v030 用 storage key と v029 route legacy 読み

