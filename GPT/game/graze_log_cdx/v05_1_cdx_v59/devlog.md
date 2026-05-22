# graze_log v05.2_cdx_v59 devlog

## 2026-05-23 Codex v59: 前進迎撃の報酬化

### 背景

v58 では camper policy を追加し、下端で左右に揺れながら撃つだけの bot が早期 game over になることを確認した。ただしこれは「底にいると不利」という罰の設計であり、プレイヤーが上中段へ出て横切り敵を追う積極的な理由はまだ弱かった。

### 実装

- `GAME_VERSION` を `v05_1_cdx_v59` に更新。
- route bot の基準 y を `H-170` に上げた。
- `forwardAttackPct` を追加し、上中段にいる割合を telemetry に出した。
- 上中段で `raider` / lateral target を倒すと `CHASE` bonus を得るようにした。
- chase reward は score / gauge / grazeStreak に小さく反映する。
- `chaseBonus` / `chaseBonusCount` / `forwardChaseKills` / `midfieldKills` を summary と matrix に追加した。
- `tools/headless_graze_log_cdx_v05_2_v59_check.js` と `tools/headless_graze_log_cdx_v05_2_v59_policy_matrix_check.js` を作成した。
- route bot が前進報酬を取りつつ boss まで到達した時に抱え落ちしないよう、boss 300 frame 後かつ shield 1 以下では緊急 BOMB を許可した。

### 検証コマンド

```powershell
node tools\headless_graze_log_cdx_v05_2_v59_check.js
node tools\headless_graze_log_cdx_v05_2_v59_policy_matrix_check.js
```

### 解釈

v59 の合格条件は「route が clear する」だけではない。route/aggressive/marksman が `CHASE` 報酬を得て、camper が底に残ったままその報酬を得られないことを確認する。

### 検証結果

2026-05-23 実行。両方 pass。

- focused check: route bot clear、`chaseBonus 19157`、`forwardAttackPct 0.558`、`forwardChaseKills 66`。
- policy matrix: route clearRate 1 / coverage 1 / chaseBonus 19157。
- policy matrix: aggressive clearRate 1 / coverage 1 / chaseBonus 54322。
- policy matrix: marksman clearRate 1 / coverage 1 / chaseBonus 51377。
- policy matrix: camper clearRate 0 / coverage 0.313 / chaseBonus 0。
- matrix summary は `memory/raw/headless_eval/graze_log_cdx_policy_matrix.jsonl` に追記。

### 次の確認点

数値が通った後も、人間プレイで CHASE 表示がうるさくないか、上中段の危険量が納得できるか、報酬が強すぎて突撃一択になっていないかを見る必要がある。
