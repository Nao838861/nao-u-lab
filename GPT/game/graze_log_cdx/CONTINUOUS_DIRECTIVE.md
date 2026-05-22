# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-22T10:51:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v51/` で v50 の lane guide から chevron を削除した。敵数・弾・route timeline・bot policy は変えず、`GUIDE_ALPHA=0.10`、`GUIDE_LINE_WIDTH=2.2`、cross-lock / post-midboss 各 2 path は維持し、guide state と event に `chevrons:false` を記録する。`tools/headless_graze_log_cdx_v05_2_v51_check.js` は route clear / grade S / routeEvents 29 / `crossLockWave: 1` / `postMidCrossWave: 1` / `crossLockGuide: 1` / `postMidCrossGuide: 1` / `readabilityGuides: 2` / `bossCueSteer: 1` / `chevrons:false` を確認した。`tools/headless_graze_log_cdx_v05_2_v51_visual_check.js` は frame 3090 / 3890 の canvas draw command で guide path stroke 2 本、chevron-like stroke 0 本、nonblank draw ops を確認した。`tools/headless_game_style_compare_v011.js` は v51 record を `memory/raw/game_eval/graze_log_style_compare.jsonl` に保存し、`tools/compare_graze_log_style_latest2.js` は v50 -> v51 の digest 同値を確認した。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v47 で boss 前の手作り wave `DP cross-lock carrier braid` は `crossLockWave` と route event として trace に入った。
2. v48 で midboss 後の手作り wave `DP post-midboss cross squeeze` は `postMidCrossWave` と route event として trace に入った。
3. v49 で 2 つの横移動 wave に薄い lane guide と専用敵色を追加し、`readabilityGuides: 2` を trace に入れた。
4. v50 で guide を alpha 0.10 / lineWidth 2.2 に下げ、post-midboss の中央線を削った。
5. 次は v51 を実ブラウザで見て、chevron なしでも横移動 wave の左右圧が読めるか、alpha 0.10 が薄すぎないかを確認する。Browser Use Node REPL が使えない場合は、今回追加した canvas visual check を補助証拠として使い、実目視は未完了と明記する。
6. headless は「楽しい」を直接判定しない。coverage / pressure / movement / event trace / policy split を、人間評価前の比較補助として使う。
7. 敵配置を変える場合は、参照した具体 wave、敵数、座標、duration、実装後 trace を `design_log.md` に明記する。
8. `panic` は人間の焦りの再現ではなく端逃げ policy。次に使う時はこの限界を明記する。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用を検証する。
- Active DEF の cue と使用価値が実プレイでも読める。
- 敵配置が「ランダム出現」ではなく、手作り wave として見える。
- 複数 bot policy で変化が観測でき、単一 bot の適性だけで評価しない。
- Nao_u が「完成」または「止めろ」と判断する。
