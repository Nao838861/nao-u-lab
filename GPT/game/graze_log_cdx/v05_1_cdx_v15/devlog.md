# graze_log v05.2_cdx_v15 devlog

## 目的

v14 で入れた wave intent と medium anchor は維持しつつ、graze / Active DEF が「見える」「使う価値がある」状態に寄せる。

## 実装

- v14 から `v05_1_cdx_v15` を作成。
- `grazeWindowCount()` を追加し、graze 半径の外縁にある弾数を HUD に `WINDOW n` として表示。
- graze window に弾がある時だけ、プレイヤー周囲に薄い外周リングを出すようにした。
- Active DEF が消した弾数に応じて gauge を返すようにした。報酬は `2 * cleared`、上限 14。
- Active DEF popup を `DEF x4 +8` のように、消した弾数と gauge 回復が同時に読める形に変更。
- `tools/headless_graze_log_cdx_v05_2_v15_check.js` を追加し、既存の clear-capable 検査に Active DEF focused probe を追加。

## 検証

実行:

```powershell
node tools\headless_graze_log_cdx_v05_2_v15_check.js
```

結果は staging に記録する。

## 所感

今回の差分は難度の追加ではなく、既にある危険への読みを太くするもの。`WINDOW` は説明文ではなく計器として扱い、Active DEF の gauge 報酬も BOMB を即返す量にはしていない。次の評価では、HUD の情報量が増えすぎていないかと、実プレイで DEF が自然に押されるかを見る。
