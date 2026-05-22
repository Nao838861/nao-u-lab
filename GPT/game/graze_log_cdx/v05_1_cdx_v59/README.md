# graze_log v05.2_cdx_v59

v59 は、v58 で潰した「画面下で左右移動しながら撃つだけ」の支配戦略に対して、次の段階として「上中段へ出て横切り敵を追うと得をする」報酬を追加した版です。

## 主な変更

- route bot の基準位置を少し上げ、横切り `raider` を追う動きに寄せた。
- 上中段で `raider` / lateral target を倒すと `CHASE` bonus、追加 score、追加 gauge、短い streak 補助を得る。
- UI に `CHASE` 累計値を表示する。
- telemetry に `forwardAttackPct` / `forwardChaseKills` / `chaseBonus` / `midfieldKills` を追加した。
- headless check と policy matrix は、route/aggressive/marksman が chase bonus を得て、camper が得られないことを検査する。

## 遊び方

`index.html` をブラウザで開きます。

- 矢印キー / WASD: 移動
- Space / B: BOMB
- Shift / X: Active DEF
- `?bot=1&botStyle=route`: 通常検証 bot
- `?bot=1&botStyle=camper`: 画面下左右移動 bot
- `?bot=1&botStyle=aggressive|defensive|panic|novice|marksman|survival`: 比較用 bot policy

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v59_check.js
node tools\headless_graze_log_cdx_v05_2_v59_policy_matrix_check.js
```

## 残課題

headless は「前へ出る報酬が数値上分離したか」までを見る。人間が実際に上中段へ出たくなる見た目・危険量・気持ちよさになったかは、次回 Browser Use か実機目視で確認する。
