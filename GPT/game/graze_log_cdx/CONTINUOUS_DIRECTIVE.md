# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-20T21:16:32+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v21/` で v20 の ring-only 方針を維持し、文字 cue を戻さずに Active DEF prompt を二重 ring + 長めの life にした。clear-capable headless / final BOMB / Active DEF 使用 / 文字 cue 不在 / 二重 ring 検査を通した。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v21 の二重 ring が実プレイで読めるか、また過剰にうるさくないか確認する。
2. 読めるが強すぎる場合は、外側 ring の透明度 / life を下げる。
3. まだ読めない場合は、文字 popup 復活ではなく短い音、色変化、ring 寿命の追加を検討する。
4. BOMB / 敵構成 / 報酬量は、DEF cue の人間評価が済むまで混ぜて動かさない。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用を検査する。
- Active DEF の cue と使用価値が実プレイでも読める。
- ユーザーが「完成」または「止めろ」と判断する。
