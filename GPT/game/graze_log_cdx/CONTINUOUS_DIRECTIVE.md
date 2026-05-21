# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-22T07:18:51+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v49/` で v47/v48 の手作り横移動 wave に薄い lane guide と専用敵色を追加した。敵数・弾・route timeline は変えず、`crossLockGuide` / `postMidCrossGuide` / `readabilityGuides` を trace に記録する。`tools/headless_graze_log_cdx_v05_2_v49_check.js` は route clear / grade S / routeEvents 29 / `crossLockWave: 1` / `postMidCrossWave: 1` / `crossLockGuide: 1` / `postMidCrossGuide: 1` / `readabilityGuides: 2` / `bossCueSteer: 1` を確認し、`tools/headless_game_style_compare_v009.js` は v49 record を `memory/raw/game_eval/graze_log_style_compare.jsonl` に保存した。`tools/compare_graze_log_style_latest2.js` は v48 -> v49 の delta で route/aggressive/defensive の `readabilityGuides` 0 -> 2、route の kills / pressure / movementSwitches 同値を確認した。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v47 で boss 前の手作り wave `DP cross-lock carrier braid` は `crossLockWave` と route event として trace に入った。
2. v48 で midboss 後の手作り wave `DP post-midboss cross squeeze` は `postMidCrossWave` と route event として trace に入った。
3. v49 で 2 つの横移動 wave に薄い lane guide と専用敵色を追加し、`readabilityGuides: 2` を trace に入れた。
4. 次は v49 をブラウザで見て、guide が敵本体より目立ちすぎないか、中央線が説明過多でないかを確認する。必要なら alpha / 色 / 中央線を調整する。
5. headless は「楽しい」を直接判定しない。coverage / pressure / movement / event trace / policy split を、人間評価前の比較補助として使う。
6. 敵配置を変える場合は、参照した具体 wave、敵数、座標、duration、実装後 trace を `design_log.md` に明記する。
7. `panic` は人間の焦りの再現ではなく端逃げ policy。次に使う時はこの限界を明記する。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用を検証する。
- Active DEF の cue と使用価値が実プレイでも読める。
- 敵配置が「ランダム出現」ではなく、手作り wave として見える。
- 複数 bot policy で変化が観測でき、単一 bot の適性だけで評価しない。
- Nao_u が「完成」または「止めろ」と判断する。
