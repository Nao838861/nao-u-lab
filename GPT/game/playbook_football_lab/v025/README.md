# Playbook Football Lab v025

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なフットボール試作として育てているプロトタイプ。

## v025 の狙い

v024 で defender / duty / target を直接指定できるようになった。v025 では、その設定がフィールド上で読めるように、setup 中に man/press defender と担当 receiver を青い線で結ぶ。

## 操作

- `Edit defense`: 守備選手をドラッグして配置を調整する
- `Cycle duty`: フィールド上の defender をクリックして責任を巡回する
- `Cycle target`: フィールド上の defender をクリックして man target を巡回する
- `Defender / Duty / Target`: 選択中 defender の責任と man target を直接指定する
- `Save defense`: 守備位置、責任、man target をまとめて保存する

## 実装済み

- `drawManTargetLines()` による setup 中の man/press target link
- 選択中 defender の target link 強調
- press は実線、man は破線
- `manTargetLinks` snapshot
- v025 用 storage key と v024 route legacy 読み

