# graze_log v05.2_cdx_v14 devlog

## 目的

shot_log の5時間セッションを「個別指示の集合」ではなく、品質を作る手順として読み直し、graze_log に playable diff として反映する。

## 実装

- v13 から `v05_1_cdx_v14` を作成。
- shield 初期値を 6 から 4 に下げた。v13 のリカバー性は残しつつ、無視して進める耐久ゲームにしないため。
- `WAVE_INTENTS` を追加し、各 wave に `READ / REST / CLAMP / PRESS / RECOVER / BOSS` などの意図を割り当てた。
- wave 開始時に意図 popup を出し、HUD に現在の意図を表示するようにした。
- medium を r=16 / hp=6 / rewardGauge=10 の anchor 敵に寄せた。
- medium は一定時間後に `ANCHOR ESCAPING` を出して加速する。早く倒す価値と逃がした時の圧を作る。
- `tools/headless_graze_log_cdx_v05_2_v14_check.js` を追加し、v13 の clear-capable 検証に加えて wave intent、medium threat、shield 4 を検査する。

## 検証

実行:

```powershell
node tools\headless_graze_log_cdx_v05_2_v14_check.js
```

結果はこのサイクルの staging に記録する。

## 所感

v14 の狙いは「もっと派手にする」ではなく、shot_log で対話が担っていた評価軸をゲーム内と headless に移すこと。プレイヤーには波の意味が見え、作り手にはその意味が壊れていないか検査できる。
