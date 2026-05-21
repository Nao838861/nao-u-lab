# graze_log v05.2_cdx_v42 devlog

## 2026-05-21 Codex v42: graze_log 側の bot policy split

### 背景

継続 directive では、v41 の次作業として「graze_log 側にも複数 bot style を追加し、shot_log と同じ policy split で比較する」ことが残っていた。v41 は telemetry の器を作ったが、graze_log は route-targeting bot 1 種だけだったため、比較が「ゲーム差」より「bot 差」に寄りやすかった。

### 実装

- `v05_1_cdx_v42/index.html` を v41 から派生。
- query `botStyle=route|aggressive|defensive|panic` を追加。
- `route` は v41 相当の基準 bot。
- `aggressive` は target への寄せを強め、前に出て kill 数が増えるようにした。
- `defensive` は弾回避の重みを上げ、chain と生存寄りの挙動を出す。
- `panic` は危険時に端へ逃げ、被圧と緊急処理の差が出るようにした。
- `summarizeEvalTelemetry()` に `botStyle` を含めた。
- `tools/headless_graze_log_cdx_v05_2_v42_check.js` を追加し、route の既存成立条件と policy split を検証。
- `tools/headless_game_style_compare_v002.js` を追加し、shot_log と graze_log の policy split を同じ report に載せた。

### 検証結果

```powershell
node tools\headless_graze_log_cdx_v05_2_v42_check.js
node tools\headless_game_style_compare_v002.js
```

両方 pass。主な観測値:

- route: clear、score 85530、kill 140、maxChain 18、urgentPct 0.036。
- aggressive: clear、kill 164。route より撃破数が多い。
- defensive: style compare では gameOver だが maxChain 22。route より長い chain を保持。
- panic: style compare では 30.73 秒で gameOver、urgentPct 0.221。route より高圧で早く崩れる。

### 戻す場合

`updateBot()` 内の style 分岐、`BOT_STYLES` / `BOT_STYLE`、summary の `botStyle`、v42 用 headless scripts を取り除けば v41 相当に戻せる。

### 次の課題

- style compare v002 の結果を JSONL に保存し、v42 以降の推移差分を見られるようにする。
- `panic` の左右反転が非常に多い。これは「危険時に端へ逃げる」実装の結果だが、人間の panic らしさとは別問題なので、次は movement 指標を解釈し直す。
- 複数 bot policy は「面白さ」を決めない。人間プレイの感触と照合して、どの差が良い変化なのかを分ける必要がある。
