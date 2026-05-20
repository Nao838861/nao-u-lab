# graze_log v05.2_cdx_v13 devlog

## 目的

v12 実装後に shot_log の dialogue_archive を読み直し、当時の対話で実際に効いていた要素を再反映する。

## archive からの判断

shot_log の敵配置が効いた理由は、単に敵数を増やしたことではない。Nao_u の直接編集で auto-shoot、boss、path patterns が入り、さらに「中ボス/ボスの存在感」「MAX 到達の見落とし防止」「被弾してもリカバーできる」「30秒で死ぬAIでは評価しない」が対話で積み上がっていた。

今回 graze_log に移植する対象は、打ち返し弾ではなく、配置の波、節目の見せ方、リカバー可能性、クリアできるAI評価。

## 実装

- v12 の shot_log 由来 stage grammar を維持。
- MAX 到達時に `CORE CHARGED`、金色リング、短い画面フラッシュ、集中粒子を追加。
- volcano / heavy tank / boss の半径を大きくし、中ボスとボスの存在感を強化。
- シールド在庫を 6 に増やし、圧のある配置でも一発事故で終わりすぎないように調整。
- `auto_verify.html` と `?bot=1` の画面上自動プレイを追加。
- `tools/headless_graze_log_cdx_v05_2_v13_check.js` を v13 パスへ更新し、`CORE CHARGED` / `SHIELD BREAK` も検査対象に追加。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v13_check.js
```

結果:

- `mode=clear`
- `t=4508`
- `bombCount=1`
- `grazeCount=23`
- `activeDefCount=2`
- boss final cue 到達、final BOMB 使用、clear を確認。

## 所感

v12 は配置の緊張感を上げたが、archive 再読後の v13 は「見える節目」と「リカバー可能性」を足した。shot_log で効いていたのは高密度そのものではなく、密度上昇を読ませ、失敗しても立て直せる構造だった。
