# graze_log v05.2_cdx_v03 - stage run / boss / bomb brake

`v05_1_cdx_v02/` からの構造修正版。Nao_u フィードバック「敵が同じパターンで出続けるだけで、緩急もリズムも展開もクリアもボスもなく、無限にだらだら続くだけ」「BOMB は懸念通り 5-way が実質ずっと続く」を直接潰す。

## 採用案

- 無限 `spawnWave()` を廃止し、固定タイムラインの `STAGE_EVENTS` に変更。
- 進行を `opening -> aimed pair -> sweep -> breather -> escort -> rush -> heavy pair -> final lane -> boss` に分けた。
- `boss` 敵を追加し、撃破後に `STAGE CLEAR` へ遷移する。
- BOMB は 5-way overdrive を完全撤去。`LV3 維持 + 全弾消し + 敵 HP 削り + 2 秒 brake + 12 秒 cooldown` に変更。
- BOMB 後の gauge は `G_LV3` まで落とすため、cooldown 終了時に自動で再発火可能にならない。

## v02 との差分要約

- `BOMB_OVERDRIVE_FRAMES` と overdrive 射撃分岐を削除。
- `BOMB_BRAKE_FRAMES=120`, `BOMB_COOLDOWN_FRAMES=720` を追加。
- `shotCount()` は通常 gauge level の 1/2/3-way のみ返す。
- wave 再利用/random 無限湧きをやめ、有限 stage script に変更。
- boss HP bar、clear 画面、stage progress 表示を追加。

## 実行

`index.html` をブラウザで開く。

Focused headless check:

```powershell
node tools\headless_graze_log_cdx_v05_2_v03_check.js
```
