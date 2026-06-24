# Playbook Football Lab v028

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なフットボール試作として育てているプロトタイプ。

## v028 の狙い

v027 で `Reads / Man / Zone` の表示レイヤーを切り替えられるようになった。v028 ではその選択を localStorage に保存し、次に開いた時も同じ視界で守備設計を続けられるようにした。

## 操作

- `Reads`: preview read line の表示を切り替える
- `Man`: man/press target link の表示を切り替える
- `Zone`: zone landmark pad の表示を切り替える
- `Defender / Duty / Target`: 選択中 defender の責任と man target を直接指定する
- `Save defense`: 守備位置、責任、man target をまとめて保存する

## 実装済み

- `overlayStorageKey()`
- `loadOverlayPrefs()` / `persistOverlayPrefs()` / `syncOverlayToggles()`
- overlay toggle の localStorage 保存
- `overlayStorageKey` snapshot
- v028 用 storage key と v027 route legacy 読み

