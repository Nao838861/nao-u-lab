# graze_log v05.2_cdx_v49 devlog

## 2026-05-22 Codex v49: readable cross waves

### 背景

v47 で boss 前に `DP cross-lock carrier braid`、v48 で midboss 後に `DP post-midboss cross squeeze` を追加した。どちらも headless trace では成立したが、直近 directive の焦点は「人間に横移動判断として読めるか」だった。今回は敵数や stage 構成を増やさず、視認性を改善する playable diff にした。

### 実装

- `v05_1_cdx_v49/index.html` を v48 から派生。
- 表示名、`GAME_VERSION`、`exportEvalLedger().source`、source notes を v49 に更新。
- `state.guides` と `addWaveGuide()` / `drawGuide()` を追加。
- `spawnPostMidCrossSqueeze()` で `postMidCrossGuide` を trace に記録し、tank 交差 2 本と中央軸 1 本の translucent guide を出す。
- `spawnCrossLockCarriers()` で `crossLockGuide` を trace に記録し、stock carrier 交差 2 本の translucent guide を出す。
- cross-lock の stock / heli と post-midboss の tank / heli を通常敵と違う色にした。
- `tools/headless_graze_log_cdx_v05_2_v49_check.js` を追加し、guide trace と clear 維持を検証する。
- `tools/headless_game_style_compare_v009.js` を追加し、v49 record を JSONL に追記する。
- `tools/compare_graze_log_style_latest2.js` に readability guide delta を追加した。

### 戻す場合

v49 directory と v49/v009 script を削除し、`tools/compare_graze_log_style_latest2.js` の guide delta を戻す。v48 の stage 進行、敵数、弾、bot policy、ledger export は変更していない。

### 次の課題

- 実ブラウザで、薄い guide が敵本体より目立ちすぎないかを見る。
- guide が「読める予兆」ではなく「UI 記号を追うゲーム」になっている場合は、線をさらに薄くするか、敵側の色分けだけに寄せる。
- headless は guide の存在を trace するだけで、人間の納得感は測らない。
