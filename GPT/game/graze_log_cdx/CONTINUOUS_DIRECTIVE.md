# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-20T17:48:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v19/` で quiet DEF ring を文字 popup なしのまま読みやすくした。`DEF_PROMPT_FRAMES=78`、ring life 42、太めの prompt ring に変更し、clear-capable headless / final BOMB / Active DEF cue 使用検査を通した。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v19 の readable quiet DEF cue に実プレイで気づけるか確認する。
2. ring が強すぎて弾幕視認を邪魔する場合は、文字 popup 復活ではなく ring life / 太さ / 透明度で調整する。
3. `WINDOW n` + `DEF n` が HUD 上で情報過多なら、次回は HUD 文字を削る前に ring だけで判断できるかを評価する。
4. BOMB / 敵構成 / 報酬量は、DEF cue の人間評価が済むまで混ぜて動かさない。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用を検査する。
- Active DEF の cue と使用価値が実プレイでも読める。
- ユーザーが「完成」または「止めろ」と判断する。
