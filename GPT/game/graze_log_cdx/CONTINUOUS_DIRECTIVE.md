# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-20T16:05:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v17/` で `DEF WINDOW` 文字 popup を削り、84 frames 後の quiet DEF ring に変更。clear-capable headless と ring-only focused probe を通した。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v17 の quiet DEF ring に実プレイで気づけるか確認する。
2. ring only で押す判断が弱すぎる場合、文字 popup 復活ではなく ring 色/life/太さで調整する。
3. `WINDOW n` + `DEF n` が HUD 上で情報過多にならないか確認する。
4. simpleBot は DEF なし clear のままなので、人間評価では Active DEF を使いたくなる弾配置かも見る。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用まで検査する。
- ユーザーが「完成」または「止めろ」と判断する。
