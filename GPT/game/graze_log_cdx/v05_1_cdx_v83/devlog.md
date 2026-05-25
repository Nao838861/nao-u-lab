# graze_log v05.2_cdx_v83 devlog

## 2026-05-25 Codex v83: input trace comparator

### 背景

v82 で `j4/lag4` が route failure、`j6/lag6` が route clear になる非単調 cell を保存した。次の未解決点は、同じ seed で死亡直前の入力履歴、route intent、Active DEF / BOMB timing を比較することだった。

### 実装

- `v05_1_cdx_v83` を v82 から派生。
- gameplay、敵配置、報酬、既定 bot は変更しない。
- `index.html` に `botTrace` telemetry を追加。
- trace には key state、route intent、target type/position、pre-lag target、lag source、jitter delta、final target、nearest threat、shield/gauge、Active DEF/BOMB action を保存する。
- `review_packet.html` を v83 input trace packet として更新。
- `tools/headless_graze_log_cdx_v05_2_v83_input_trace_check.js` を追加。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v83_input_trace_check.js
```

pass。baseline route は seeds `12345 / 77777` の両方で clear。`j4/lag4` は両 seed で failure、`j6/lag6` は両 seed で clear。入力列の分岐は両 seed で検出し、`finalTargetDelta` は seed `12345` が `302`、seed `77777` が `43`。packet DOM と screenshot contract も通った。

### 次

次に進むなら、v83 の `botTrace` を使って「j4 はなぜ右下/下端へ寄って shield を失うのか」「j6 はなぜ BOMB まで到達できるのか」を、Active DEF timing、BOMB cue timing、target選択、lag source の4軸で分解する。
