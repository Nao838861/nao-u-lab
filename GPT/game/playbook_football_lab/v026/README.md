# Playbook Football Lab v026

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なフットボール試作として育てているプロトタイプ。

## v026 の狙い

v025 で man/press の担当線は見えるようになった。v026 では `hook / curl / flat / deep` の zone duty も setup 中に gold pad として表示し、守備設計の意味をフィールド上で読めるようにした。

## 操作

- `Edit defense`: 守備選手をドラッグして配置を調整する
- `Cycle duty`: フィールド上の defender をクリックして責任を巡回する
- `Cycle target`: フィールド上の defender をクリックして man target を巡回する
- `Defender / Duty / Target`: 選択中 defender の責任と man target を直接指定する
- `Save defense`: 守備位置、責任、man target をまとめて保存する

## 実装済み

- `drawManTargetLines()` による setup 中の man/press target link
- `drawZoneLandmarks()` による setup 中の zone pad
- 選択中 defender の target link / zone pad 強調
- `zoneLandmarks` snapshot
- v026 用 storage key と v025 route legacy 読み

