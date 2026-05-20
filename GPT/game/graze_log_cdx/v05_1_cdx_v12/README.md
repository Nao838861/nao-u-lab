# graze_log v05.2_cdx_v12

v11 を基に、shot_log v01 の配置文法を graze_log 用に移植した版。

主な変更:

- `shot_log center column` / `side sweep` / `v clamp` / `dive curtain` / `medium anchor` / `cross pressure` を追加。
- 敵を散発出現ではなく、中央列、横圧、V字、潜り込み、中型アンカー、ボス前ラッシュの順に組む。
- ボムは v11 同様、5-way 常時化を避けるため使用後 `G_LV3` に戻し、クールダウンと brake を維持。
- 圧を上げたぶん、shot_log の「被弾してもリカバーできる」方向に合わせてシールド在庫を追加。
- ヘッドレスは v12 用の stage grammar と clear-capable simpleBot を検査する。

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v12_check.js
```
