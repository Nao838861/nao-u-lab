# graze_log v05.2_cdx_v62 devlog

## 2026-05-23 Codex v62: CHASE popup readability telemetry

### 背景

v61 で CHASE popup は敵弾や boss cue を遮らない safe rail へ移った。ただし、表示が画面上部に寄りすぎると、headless 上は安全でも人間には報酬として弱い可能性がある。今回は「邪魔ではないが遠すぎる」状態を headless が検出できるかを実地検証した。

### 実装

- `chasePopupMeanSpawnPlayerDist` / `chasePopupMeanActivePlayerDist` / `chasePopupMeanSpawnKillDist` を追加。
- `chasePopupTooNearPct` / `chasePopupTooFarPct` / `chasePopupSideBalance` / `chasePopupSideSwitches` を追加。
- `chasePopup` event に side / playerDist / killDist を追加。
- CHASE popup を左右 rail のまま、`player.y-96` 付近へ寄せる候補配置に変更。
- focused check と policy matrix に `chasePopupReadabilityMeasured` assertion を追加。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v62_check.js
node tools\headless_graze_log_cdx_v05_2_v62_policy_matrix_check.js
```

### 結果

初回の v61 rail 相当では focused check が失敗した。route の `chasePopupMeanSpawnPlayerDist` は約 419.7px、`chasePopupTooFarPct` は 0.137 で、表示が遠すぎることを検出できた。

最終版は両 check が pass。

- focused check: route bot clear、`chaseBonus 19157`、`chasePopupCount 28`、`chasePopupMeanSpawnPlayerDist 148.3`、`chasePopupMeanActivePlayerDist 157`、`chasePopupTooFarPct 0`、`chasePopupThreatOverlapPct 0.001`、`chasePopupBossCueOverlapPct 0`、`chasePopupReadabilityMeasured true`。
- policy matrix: `chasePopupReadabilityMeasured true`。core policy の平均 spawn distance は route 148.3、aggressive 144.8、marksman 147.2。camper は CHASE popup 0 のまま。

### 次の確認点

headless の距離指標は pass したが、これは人間の報酬感の代替ではない。次は Browser Use または実機で、左右 rail の CHASE popup が視線誘導として弱すぎず、かつ弾避けの邪魔にならないかを見る。
