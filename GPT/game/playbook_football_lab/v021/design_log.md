# Playbook Football Lab v021 設計ログ

日付: 2026-06-24

## v021 自律サイクル

### 現状観察

v020でpreviewの根拠線は表示できた。しかし、プレー後に「preview通りだったのか」「pressureや守備の動きで崩れたのか」を説明する接続がなかった。これでは学習ループが途切れる。

### 判断

今回は、スナップ直前のpreviewを保存し、結果カードに差分説明を出す。新しい戦術要素を増やすより、予測、実行、振り返りの一連の流れをつなげるほうが、完成度向上に効く。

### 実装

- `state.preSnapPreview` を追加。
- `startSnap()` で `computeMatchupPreview()` を保存。
- `previewDeltaText()` を追加。
- サック、インコンプリート、RAC終了、holdingに差分説明を付与。
- 結果カードに `preview-delta` 段落を表示。
- snapshotに `preSnapPreview` と `previewDelta` を追加。

### 残った弱点

差分説明はまだ短文で、時系列やリプレイ位置へ結びついていない。次は責任プリセットの解像度を上げるか、リプレイ上で差分地点へ飛べるようにする。
