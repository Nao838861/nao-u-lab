# graze_log v05.2_cdx_v04 - authored shmup stage

`v05_1_cdx_v03/` からのステージ構成強化版。v03 は「有限ステージ / boss / clear / BOMB 5-way 廃止」を入れたが、敵の出方はまだ直線的だった。v04 では既存シューティングの典型的な役割を参考に、popcorn、狙撃、横切り、砲台、escort、midboss、boss phase を入れてステージ内の緩急を作る。

## 採用案

- popcorn fan: 低 HP の雑魚で空白時間を埋め、撃破の気持ちよさと gauge 供給を作る。
- aimed pair / sniper underlay: プレイヤー位置へ撃つ敵で横移動を要求する。
- crossing scouts: 横切り敵で「画面の横方向を読む」区間を作る。
- turret gate: radial 弾で通路を作り、graze と位置取りを誘導する。
- elite escort: 中型硬めの敵と護衛で midboss 前の小山を作る。
- midboss: boss 前の山。ここを越えた後に短い breather を置く。
- boss: HP に応じて aimed / radial / mixed に変化する。

## v03 との差分要約

- 敵種 `scout`, `weaver`, `sniper`, `turret`, `midboss` を追加。
- stage script を 9 events から 14 events に拡張。
- boss 到達前に midboss と last wall を追加。
- headless に簡易 self-play bot を追加し、道中から boss まで到達できるかを観察する。

## 実行

`index.html` をブラウザで開く。

Focused headless check:

```powershell
node tools\headless_graze_log_cdx_v05_2_v04_check.js
```
