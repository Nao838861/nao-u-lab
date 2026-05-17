# graze_log v05.2_cdx_v02 — BOMB burst / DEF midpoint

`v05_1_cdx_v01/` からの比較用調整版。v01 の「BOMB を撃つ価値を作る」方向は維持しつつ、懸念として残っていた「overdrive 5-way が長すぎて、溜まり次第撃つだけになる」点を先に潰す。

## 採択案

BOMB は引き続き、発火後に LV3 を保持し、敵弾全消去、敵 HP -2、短時間の強化射撃を与える。ただし v01 の `overdrive 6s / cooldown 8s` から、v02 では `burst 4s / cooldown 10s` に変更した。これにより、撃った直後の押し返しは残しながら、cooldown 後半に通常 LV3 で耐える時間を 6 秒作る。

Active DEF は v01 の `graze 9連 / 半径58 / 36F` から、`graze 8連 / 半径62 / 42F` に戻した。v05.1 base よりは重いが、v01 より初心者が初回到達しやすい中間値として置く。

## v01 との差分要約

- `GRAZE_STREAK_TH=8`, `ACTIVE_DEF_FRAMES=42`, `ACTIVE_DEF_RADIUS=62`
- `BOMB_COOLDOWN_FRAMES=600`, `BOMB_OVERDRIVE_FRAMES=240`
- BOMB 後の LV3 維持、敵弾全消去、敵 HP -2、5-way burst は継続
- cooldown 中の BOMB 連発不可と HUD 表示は継続
- title 表記を `v05.2_cdx_v02` に更新

## 実行

`index.html` をブラウザで開く。focused check は以下。

```powershell
node tools/headless_graze_log_cdx_v05_2_v02_check.js
```
