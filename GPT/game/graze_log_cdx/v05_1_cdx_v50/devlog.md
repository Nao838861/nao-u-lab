# graze_log v05.2_cdx_v50 devlog

## 2026-05-22 Codex v50: quieter lane guides

### 背景

v49 で `DP cross-lock carrier braid` と `DP post-midboss cross squeeze` に薄い lane guide と専用敵色を追加した。直近 directive の焦点は「guide が敵本体より目立ちすぎないか、中央線が説明過多でないか」だった。Browser Use はこのセッションで Node REPL 操作ツールが出ておらず、外部 Playwright も未導入だったため、Chrome DevTools Protocol でのスクリーンショット取得を試みたが、CDP 受信処理が大きな screenshot JSON を分割受信できず完了しなかった。実装判断はコード上の描画順・alpha・線幅・guide path 数と headless trace に限定した。

### 実装

- `v05_1_cdx_v50/index.html` を v49 から派生。
- 表示名、`GAME_VERSION`、`exportEvalLedger().source`、source notes を v50 に更新。
- guide 用に `GUIDE_ALPHA = 0.10` と `GUIDE_LINE_WIDTH = 2.2` を定数化。
- `addWaveGuide()` が guide event に `alpha` / `lineWidth` / `paths` を記録するようにした。
- post-midboss guide から中央線を削り、左右交差の 2 path だけにした。
- 敵配置、敵数、弾、route timeline、bot policy、score / reward は変更していない。
- `tools/headless_graze_log_cdx_v05_2_v50_check.js` を追加し、clear 維持と quiet guide style を検証する。
- `tools/headless_game_style_compare_v010.js` を追加し、v50 record を JSONL に追記できるようにした。

### 戻す場合

v50 directory と v50/v010 script を削除する。v49 の stage 進行、敵数、弾、bot policy、ledger export は変更していない。

### 次の課題

- 実ブラウザで、alpha 0.10 / lineWidth 2.2 が薄すぎず、敵の横移動を読む助けになっているかを見る。
- guide がまだ UI 記号に見える場合は、線をさらに短くして敵の出現前だけに限定する。
- headless は guide の薄さと path 数を trace するだけで、人間の納得感は測らない。
