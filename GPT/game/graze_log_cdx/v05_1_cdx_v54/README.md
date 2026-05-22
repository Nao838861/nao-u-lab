# graze_log v05.2_cdx_v54

v54 は v53 からゲーム内容を変えず、ヘッドレス評価の検証対象として固定した版。stage 進行、敵配置、弾、スコア、BOMB、Active DEF、bot policy、probeFrame、guide alpha は v53 と同じ。

## 遊び方

`index.html` をブラウザで開く。

- 矢印キー / WASD: 移動
- Space / B: BOMB
- Shift / X: Active DEF
- `?bot=1&botStyle=route`: route bot
- `?bot=1&botStyle=aggressive|defensive|panic`: 比較用 bot policy
- `?probeFrame=3090&probeDraw=1`: 指定 frame まで同期実行して 1 枚描画する検証モード

## 変更点

- `GAME_VERSION` を `v05_1_cdx_v54` に更新。
- ledger source と画面表示を v54 に更新。
- v54 source note として「ゲーム内容は v53 と同一、multi-seed / multi-policy headless matrix の基準版」と明記。
- gameplay 実装は v53 と同じ。今回の主成果は `tools/headless_graze_log_cdx_v05_2_v54_policy_matrix_check.js`。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v54_check.js
node tools\headless_graze_log_cdx_v05_2_v54_policy_matrix_check.js
```

policy matrix check は `route/aggressive/defensive/panic` を複数 seed で走らせ、policy ごとの best-case / mean / worst / clear rate / pressure / movement / emergency / route coverage を出す。これは「面白さの判定」ではなく、人間評価前にどの差分を見るべきかを絞る補助である。
