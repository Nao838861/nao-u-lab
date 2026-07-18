# v003 完成監査表

この表は、実装意図ではなく現在確認できる証拠を記録する。

| 要件 | 現在の証拠 | 判定 |
|---|---|---|
| 丸太→木製品→港→船の物流 | `tests/run.mjs` の `testPortAndMoneyShareOneState` | 確認済み |
| 在庫は到着時だけ移動 | `tests/run.mjs` の輸送・量保存検証 | 確認済み |
| 道路外荷車ゼロ | 長時間不変条件テスト | 確認済み |
| 建物3×3・港4×3・道路8方向 | `testFootprintsAndRoads` | 確認済み |
| 等級0〜4の外見と実資材増築 | `testVisibleLogisticsAndUpgrade` | 確認済み |
| 倉庫の建設・確認・章達成導線 | `testTutorialContinuesIntoWarehouse` | 確認済み |
| 複数回の定期便と収支 | 長時間テストの複数輸出検証 | 確認済み |
| 丸太と製材を色以外の形で識別 | `tests/browser_smoke.mjs` の形状契約と `material-shapes-desktop.png` | 確認済み |
| 秘書・書状・現物台帳 | `index.html` とブラウザテストのUI検査 | 要ブラウザ通し確認 |
| PC/スマホでの実操作 | `tests/browser_smoke.mjs` | 確認済み |
| 公開URLでの最新版確認 | 公開HTMLが `Build v003.2.0-material-shapes` を返すことをcurlで確認 | 確認済み |

## 残課題

1. 実ブラウザで第一章から倉庫確認までの表示文・書状・資金表示を確認する。
