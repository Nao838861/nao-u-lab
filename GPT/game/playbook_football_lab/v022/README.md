# Playbook Football Lab v022

PlayMaker Football の「プレーを作って結果を見る」面白さを、現代的なフットボール試作盤として育てているプロトタイプ。

## v022 の狙い

v021 でpreviewと実結果の差分がつながったが、守備責任の `zone` が粗すぎて、previewも実挙動も説明力が弱かった。v022 では zone を `hook / curl / flat / deep` に分け、守備のランドマークとpreview評価に差が出るようにした。

## 実装済み

- 守備責任の循環を `rush / press / man / hook / curl / flat / deep` に拡張
- 旧 `zone` 保存値を `hook` として正規化
- `zoneLandmark()` による守備ランドマーク分岐
- `hook / curl / flat / deep` ごとのpreview leverage
- 実プレー中のzone系守備移動をランドマーク別に変更
- v021のpreview差分表示は維持
