# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-20T12:18:10+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v15/` で graze window の HUD/リング表示と、Active DEF の小さな gauge 報酬を追加し、clear-capable headless と focused DEF probe を通した。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v15 の `WINDOW n` が HUD の情報過多にならず、graze の読みを助けるか確認する。
2. Active DEF の gauge 報酬が BOMB を安売りせず、使う理由として足りるか確認する。
3. shield 4 と DEF 報酬の組み合わせで緊張感が薄まらないか確認する。
4. 次回は実プレイで DEF が自然に押されるか、または graze window が邪魔なら表示密度を下げる。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用まで検査する。
- ユーザーが「完成」または「止めろ」と判断する。
