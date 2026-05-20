# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-20T14:02:04+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v16/` で DEF ready 中の `DEF WINDOW` cue と Active DEF 半径 preview を追加し、clear-capable headless と focused DEF prompt probe を通した。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v16 の `DEF WINDOW` cue が実プレイで押す判断を助けるか確認する。
2. Active DEF 半径 preview が弾幕視認を邪魔しないか確認する。
3. `WINDOW n` + `DEF n` で HUD が情報過多にならないか確認する。
4. cue が強すぎる場合は `DEF_PROMPT_FRAMES` を長くするか、popup を削って ring だけにする。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用まで検査する。
- ユーザーが「完成」または「止めろ」と判断する。
