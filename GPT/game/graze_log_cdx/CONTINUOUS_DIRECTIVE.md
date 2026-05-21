# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-21T18:20:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v42/` で v41 の 30f telemetry を維持しつつ、`botStyle=route|aggressive|defensive|panic` を追加した。route は v41 相当、aggressive は kill 数増、defensive は maxChain 長め、panic は high pressure / early failure を出す。`tools/headless_graze_log_cdx_v05_2_v42_check.js` と `tools/headless_game_style_compare_v002.js` は pass。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v42 で graze_log 側にも複数 bot style が入り、shot_log と同じ policy split 比較ができるようになった。
2. headless は「楽しい」を直接判定しない。coverage / pressure / movement / event trace / policy split を、人間評価前の比較補助として使う。
3. 敵配置を変える場合は、参照した具体 wave、敵数、座標、duration、実装後 trace を `design_log.md` に明記する。
4. `panic` は人間の焦りの再現ではなく端逃げ policy。次に使う時はこの限界を明記する。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用を検証する。
- Active DEF の cue と使用価値が実プレイでも読める。
- 敵配置が「ランダム出現」ではなく、手作り wave として見える。
- 複数 bot policy で変化が観測でき、単一 bot の適性だけで評価しない。
- Nao_u が「完成」または「止めろ」と判断する。
