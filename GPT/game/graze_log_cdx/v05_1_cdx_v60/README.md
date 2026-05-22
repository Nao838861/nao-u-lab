# graze_log v05.2_cdx_v60

v59 の forward chase reward を維持しつつ、`CHASE` popup の表示過多を抑える版。

## 変更点

- `GAME_VERSION` を `v05_1_cdx_v60` に更新。
- `CHASE` popup に 24 frame cooldown と active 3 件 cap を追加した。
- 5 回ごとの代表表示を `CHASE xN` にし、毎 kill の文字重なりを減らした。
- `chasePopupCount` / `suppressedChasePopups` / `chasePopupDensity` / `maxChasePopupsActive` / `chasePopupPct` を summary と matrix に追加した。
- 敵配置、報酬倍率、bot policy、boss、guide は v59 から変更していない。

## 実行

ブラウザで `game/graze_log_cdx/v05_1_cdx_v60/index.html` を開く。

headless check:

```powershell
node tools\headless_graze_log_cdx_v05_2_v60_check.js
node tools\headless_graze_log_cdx_v05_2_v60_policy_matrix_check.js
```
