# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-20T19:31:39+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v20/` で v19 の quiet DEF ring は維持しつつ、HUD の `WINDOW n` / `DEF n` と右上 `SPACE [D]EF` を削って ring-only 判断を評価できる版にした。clear-capable headless / final BOMB / Active DEF 使用 / 文字 cue 不在検査を通した。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v20 の ring-only DEF 判断が実プレイで読めるか確認する。
2. 読めない場合は、文字 popup 復活ではなく ring 色/life/太さ/透明度、または短い非命令 cue を検討する。
3. HUD が軽くなったことで BOMB / DEF の役割が読みやすくなったか確認する。
4. BOMB / 敵構成 / 報酬量は、DEF cue の人間評価が済むまで混ぜて動かさない。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用を検査する。
- Active DEF の cue と使用価値が実プレイでも読める。
- ユーザーが「完成」または「止めろ」と判断する。
