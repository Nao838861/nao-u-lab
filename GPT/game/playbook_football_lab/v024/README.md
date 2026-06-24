# Playbook Football Lab v024

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なフットボール試作として育てているプロトタイプ。

## v024 の狙い

v023 では守備選手ごとの man target を持てるようになったが、対象変更はクリック巡回だけだった。v024 では defender / duty / target を右パネルから直接選べるようにし、守備設計の操作を読みやすくした。

## 操作

- `Edit defense`: 守備選手をドラッグして配置を調整する
- `Cycle duty`: フィールド上の defender をクリックして責任を巡回する
- `Cycle target`: フィールド上の defender をクリックして man target を巡回する
- `Defender / Duty / Target`: 選択中 defender の責任と man target を直接指定する
- `Save defense`: 守備位置、責任、man target をまとめて保存する

## 実装済み

- `selectedDefender` 状態
- `defenderSelect` / `dutySelect` / `targetSelect` / `applyDefenderButton`
- `setSelectedDefender()` / `syncDefenderControls()` / `applyDefenderControls()`
- 選択 defender の青リング表示
- クリック巡回と直接セレクタの相互同期
- v024 用 storage key と v023 route legacy 読み

