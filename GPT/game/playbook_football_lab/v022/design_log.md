# Playbook Football Lab v022 設計ログ

日付: 2026-06-24

## v022 自律サイクル

### 現状観察

v021でpreviewと結果の差分は出るようになったが、守備責任の `zone` が1種類しかなく、予測と実挙動の解像度が低かった。これでは「どのzoneに投げたのか」「どの空間を守られたのか」が見えにくい。

### 判断

今回はzone責任をhook/curl/flat/deepへ分ける。新しいUIを増やすより先に、既存の `Cycle duty` の循環先を増やし、previewとAI移動の両方に責任差を反映する。

### 実装

- `normalizeDuty()` で旧 `zone` を `hook` に移行。
- `isZoneDuty()` と `zoneLandmark()` を追加。
- duty循環順を `rush / press / man / hook / curl / flat / deep` に変更。
- `defenderLeverage()` にzone責任別の評価を追加。
- 実プレー中のzone系守備AIを `zoneLandmark()` ベースに変更。

### 残った弱点

man対象選択がまだ粗い。次はLB/Sが誰をmanで見るかを選べるようにすると、守備作戦盤としての納得感が上がる。
