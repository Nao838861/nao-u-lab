# graze_log v05.2_cdx_v55

v55 は v54 から gameplay を変えず、headless 評価の policy split を拡張した版。stage 進行、敵配置、弾、スコア、BOMB、Active DEF、guide alpha は v54 と同じ。

## 遊び方

`index.html` をブラウザで開く。

- 矢印キー / WASD: 移動
- Space / B: BOMB
- Shift / X: Active DEF
- `?bot=1&botStyle=route`: route bot
- `?bot=1&botStyle=aggressive|defensive|panic|novice|marksman|survival`: 比較用 bot policy
- `?probeFrame=3090&probeDraw=1`: 指定 frame まで同期実行して 1 枚描画する検証モード

## 変更点

- `GAME_VERSION` を `v05_1_cdx_v55` に更新。
- `novice`、`marksman`、`survival` の 3 policy を追加。
- `tools/headless_graze_log_cdx_v05_2_v55_policy_matrix_check.js` が 5 seed × 7 policy を実行し、summary を `memory/raw/headless_eval/graze_log_cdx_policy_matrix.jsonl` に追記する。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v55_check.js
node tools\headless_graze_log_cdx_v05_2_v55_policy_matrix_check.js
```

policy matrix は「面白さの判定」ではなく、route / score ceiling / early churn / novice-like failure / survival pressure を分けて見るための補助である。
