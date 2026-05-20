# graze_log v05.2_cdx_v15

`v14` の wave intent / medium anchor / shield 4 を維持し、graze window と Active DEF の価値を読みやすくした版。

## 起動

`index.html` をブラウザで開く。

可視自動検証:

```text
auto_verify.html
```

headless:

```powershell
node tools\headless_graze_log_cdx_v05_2_v15_check.js
```

## v15 の変更

- HUD に `WINDOW n` を追加し、graze 可能な弾が近くにあることを読めるようにした。
- graze window に弾がある時、プレイヤー周囲の外周リングを強める。
- Active DEF が消した弾数に応じて gauge を少量返すようにした。
- headless check で Active DEF の gauge 報酬と `WINDOW` 表示を確認。
