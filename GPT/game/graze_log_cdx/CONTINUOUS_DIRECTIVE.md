# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-21T20:32:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v43/` で v42 の policy split を維持しつつ、`graze-ledger-v001` の評価 ledger export を追加した。`tools/headless_game_style_compare_v003.js` は shot_log / graze_log の比較結果を `memory/raw/game_eval/graze_log_style_compare.jsonl` に保存する。`tools/headless_graze_log_cdx_v05_2_v43_check.js` と `tools/headless_game_style_compare_v003.js` は pass。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v43 で policy split 比較を JSONL に保存できるようになった。
2. 次は `memory/raw/game_eval/graze_log_style_compare.jsonl` の最新2版を比較する script を作り、敵配置や boss cue の本質的変更を trace digest で見られるようにする。
3. headless は「楽しい」を直接判定しない。coverage / pressure / movement / event trace / policy split を、人間評価前の比較補助として使う。
4. 敵配置を変える場合は、参照した具体 wave、敵数、座標、duration、実装後 trace を `design_log.md` に明記する。
5. `panic` は人間の焦りの再現ではなく端逃げ policy。次に使う時はこの限界を明記する。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用を検証する。
- Active DEF の cue と使用価値が実プレイでも読める。
- 敵配置が「ランダム出現」ではなく、手作り wave として見える。
- 複数 bot policy で変化が観測でき、単一 bot の適性だけで評価しない。
- Nao_u が「完成」または「止めろ」と判断する。
