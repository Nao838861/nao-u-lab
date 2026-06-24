# Playbook Football Lab v027

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なフットボール試作として育てているプロトタイプ。

## v027 の狙い

v026 で man target と zone landmark が見えるようになったが、情報量が増えた。v027 では `Reads / Man / Zone` の表示レイヤーを切り替えられるようにし、編集したい戦術要素だけを見やすくする。

## 操作

- `Reads`: preview read line の表示を切り替える
- `Man`: man/press target link の表示を切り替える
- `Zone`: zone landmark pad の表示を切り替える
- `Defender / Duty / Target`: 選択中 defender の責任と man target を直接指定する
- `Save defense`: 守備位置、責任、man target をまとめて保存する

## 実装済み

- `showPreviewLines` / `showManLinks` / `showZonePads`
- `previewLayerToggle` / `manLayerToggle` / `zoneLayerToggle`
- 描画関数ごとの overlay gate
- `overlayLayers` snapshot
- v027 用 storage key と v026 route legacy 読み

