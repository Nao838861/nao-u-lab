# Playbook Football Lab v023

PlayMaker Football の「プレーを作って結果を見る」面白さを、現代的なフットボール試作盤として育てているプロトタイプ。

## v023 の狙い

v022 でzone責任の解像度は上がったが、man/press責任はまだCBが外WRを見る前提に近かった。v023 では、守備選手ごとにman対象を `X / Y / H / Z` から循環選択できるようにした。

## 操作

- `Cycle target`: 守備選手をクリックしてman対象を `X / Y / H / Z` の順に切り替える
- `Save defense`: 守備位置、責任、man対象をまとめて保存

## 実装済み

- `targetEditButton` / `targetEdit` モード
- `defaultManTarget()` / `targetableReceivers()` / `manTargetFor()`
- `cycleManTarget()` による対象切替
- man/pressの実移動を `manTarget` に接続
- matchup previewのman/press leverageを `manTarget` に接続
- 守備保存とsnapshotに `manTarget` を追加
