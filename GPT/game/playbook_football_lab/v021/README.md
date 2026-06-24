# Playbook Football Lab v021

PlayMaker Football の「プレーを作って結果を見る」面白さを、現代的なフットボール試作盤として育てているプロトタイプ。

## v021 の狙い

v020 でpreviewの根拠線は見えるようになったが、実プレー後に「previewと何が違ったのか」はまだ分からなかった。v021 では、スナップ直前のpreviewを保存し、結果カードに差分説明を追加する。

サックなら「preview以前にpressureで壊れた」、パス失敗なら「予測ターゲットと実ターゲット、閉じた守備選手」、成功なら「preview通りか、別ターゲットへ動いたか」を短く表示する。

## 実装済み

- スナップ直前の `preSnapPreview` 保存
- 結果カード内の `previewDelta`
- サック/インコンプリート/キャッチ後タックル/holding時の差分説明
- snapshot の `preSnapPreview` / `previewDelta`
- 差分表示用CSS
