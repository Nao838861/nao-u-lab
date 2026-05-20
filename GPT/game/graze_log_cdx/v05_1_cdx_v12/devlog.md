# graze_log v05.2_cdx_v12 devlog

## 目的

shot_log の敵配置が効いた理由を再分析し、graze_log へ打ち返し弾ではなく配置・圧迫感・リズムだけを移植する。

## 実装

- v11 をコピーして v12 を作成。
- `shot_log center column`、`shot_log left/right sweep`、`shot_log v clamp`、`shot_log dive curtain`、`shot_log medium anchor`、`shot_log cross pressure` を stage script に追加。
- 敵の出現を「中央列 -> 横圧 -> V字 -> 潜り込み -> 中型アンカー -> ボス前ラッシュ」の流れに再編。
- 圧を上げたことで simpleBot が途中死亡したため、密度を調整し、heavy tank midboss のHP/発火を緩めた。
- 事故吸収としてシールド在庫を追加。
- v12 用 headless check を作成。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v12_check.js
```

結果:

- clear-capable simpleBot が boss final cue を見て BOMB を使い、clear する。
- BOMB は 5-way 常時化せず、使用後 `G_LV3` に戻る。
- finite stage / midboss / boss / stage clear を維持。
