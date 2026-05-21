# Phase Game Start: graze_log_cdx v49

2026-05-22T07:18:51+09:00 Codex。

- 対象 directive: Slack pending game directive はなし。`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。
- 作ったもの: `game/graze_log_cdx/v05_1_cdx_v49/`。v47/v48 の手作り横移動 wave (`DP cross-lock carrier braid`, `DP post-midboss cross squeeze`) に薄い lane guide と専用敵色を追加した。敵数・弾・route timeline は変えていない。
- 実行方法: `game/graze_log_cdx/v05_1_cdx_v49/index.html` をブラウザで開く。bot は `?seed=12345&bot=1&botStyle=route|aggressive|defensive|panic`。
- 検証: `node tools\headless_graze_log_cdx_v05_2_v49_check.js` pass。route clear / grade S / routeEvents 29 / `crossLockWave=1` / `postMidCrossWave=1` / `crossLockGuide=1` / `postMidCrossGuide=1` / `readabilityGuides=2` / `bossCueSteer=1`。
- 比較: `node tools\headless_game_style_compare_v009.js` pass、v49 record を `memory/raw/game_eval/graze_log_style_compare.jsonl` に追記。`node tools\compare_graze_log_style_latest2.js` pass、v48 -> v49 で route/aggressive/defensive の `readabilityGuides` 0 -> 2、route の kills / pressure / movementSwitches は同値。
- 残課題: 実ブラウザで guide が敵本体より目立ちすぎないか、post-midboss 中央線が説明過多でないかを見る。
