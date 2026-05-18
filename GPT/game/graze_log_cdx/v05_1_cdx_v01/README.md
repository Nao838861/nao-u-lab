# graze_log v05.2_cdx_v01 — BOMB overdrive / DEF tighten

`v05_1_base/` からの削除可能な 1 個刻み改修。Nao_u 指摘「BOMB を撃つとパワーダウンして逆に不利」「Active DEF が手軽すぎて BOMB の重みを食っている」に対し、BOMB と Active DEF の役割を分け直した。

## 採択案

BOMB は「ゲージを失って弱くなる全消去」ではなく、MAX 到達後に使う短時間の攻勢転換に変更した。発火後は LV3 を保持し、6 秒間 overdrive として 5-way 連射・短い shot cooldown を得る。一方で 8 秒 cooldown を置き、MAX ゲージがあっても連発できない。

Active DEF は graze 5 連・半径 80・60F から、graze 9 連・半径 58・36F へ絞った。これは BOMB の代替ではなく、近距離事故を小さくほどく局所技として残す。

## v05.1 base との差分要約

- `GRAZE_STREAK_TH=9`, `ACTIVE_DEF_FRAMES=36`, `ACTIVE_DEF_RADIUS=58`
- `BOMB_COOLDOWN_FRAMES=480`, `BOMB_OVERDRIVE_FRAMES=360` を追加
- BOMB 後の gauge は `G_LV2` ではなく `G_LV3` に戻す
- overdrive 中は 5-way 連射、shot cooldown 4F
- BOMB cooldown 中は HUD に `BOMB CD Ns` を表示
- title 表記を `v05.2_cdx_v01` に更新

## 実行

`index.html` をブラウザで開く。検証は以下。

```powershell
node tools/headless_graze_log_cdx_v05_2_check.js
```
