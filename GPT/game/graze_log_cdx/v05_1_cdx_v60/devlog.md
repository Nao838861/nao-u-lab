# graze_log v05.2_cdx_v60 devlog

## 2026-05-23 Codex v60: CHASE popup の間引きと表示ノイズ計測

### 背景

v59 で上中段の横切り敵を倒す `CHASE` 報酬を追加し、route/aggressive/marksman が得をして camper が得をしないことは確認できた。次の焦点は、実プレイ時に `CHASE` 表示がうるさくないか、報酬が突撃一択に見えないかだった。

### 実装

- `CHASE` popup に 24 frame cooldown と active 3 件 cap を追加。
- 間引かれた popup は `suppressedChasePopups` として記録。
- `chasePopupCount` / `chasePopupDensity` / `maxChasePopupsActive` / `chasePopupBurstMax` / `chasePopupPct` を telemetry に追加。
- focused check と policy matrix に `chasePopupNoiseBounded` 条件を追加。
- gameplay ルールは v59 のまま維持。

### 検証コマンド

```powershell
node tools\headless_graze_log_cdx_v05_2_v60_check.js
node tools\headless_graze_log_cdx_v05_2_v60_policy_matrix_check.js
```

### 検証結果

2026-05-23 実行。初回は cooldown 12f / life 30f で `chasePopupDensity` が route 0.576 / aggressive 0.598 / marksman 0.624 となり、表示しすぎとして失敗。cooldown 24f / life 24f に調整して再実行し、両方 pass。

- focused check: route bot clear、`chaseBonus 19157`、`forwardChaseKills 66`、`chasePopupCount 28`、`suppressedChasePopups 38`、`chasePopupDensity 0.424`、`maxChasePopupsActive 1`、`chasePopupPct 0.137`。
- policy matrix: route clearRate 1 / chaseBonus 19157 / popupDensity 0.424 / popupPct 0.141 / maxActive 1。
- policy matrix: aggressive clearRate 1 / chaseBonus 54322 / popupDensity 0.421 / popupPct 0.237 / maxActive 1。
- policy matrix: marksman clearRate 1 / chaseBonus 51377 / popupDensity 0.431 / popupPct 0.248 / maxActive 1。
- policy matrix: camper clearRate 0 / bottomCampPct 0.999 / chaseBonus 0。

### 次の確認点

headless では「表示頻度が bounded である」ことまで確認した。次は Browser Use または実機で、`CHASE xN` が報酬感として足りるか、boss cue や敵弾と重なって邪魔に見えないかを目視する。
