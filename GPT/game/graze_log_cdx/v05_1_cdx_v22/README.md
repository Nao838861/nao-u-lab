# graze_log v05.2_cdx_v22

`v05_1_cdx_v21` からの継続改善版。v21 は Active DEF ring の視認性調整に留まっていたため、v22 ではゲームの本質側として「各ウェーブで何を達成したか」を評価する route contract を追加した。

## 変更点

- 各ステージイベント開始時に前ウェーブの contract を評価する。
- intent ごとに `graze / kills / bombs / defs / hits` の達成条件を持たせた。
- contract 成功時は `ROUTE +bonus` と chain bonus を加算し、失敗時は chain を切る。
- HUD とクリア画面に `ROUTE / CHAIN / BREAK / grade` を表示する。
- 敵構成、BOMB 経済、Active DEF ring、boss final cue は v21 から維持した。

## 実行

`index.html` をブラウザで開く。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v22_check.js
```
