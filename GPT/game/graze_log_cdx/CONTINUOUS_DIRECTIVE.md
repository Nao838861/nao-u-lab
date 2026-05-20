# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-20T10:35:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v13/` で shot_log の dialogue_archive を再分析し、配置文法、MAX 到達 cue、中ボス/ボス存在感、リカバー用 shield、可視 auto verify、clear-capable headless を反映した。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v13 の人間プレイ感を確認する。
2. shield 6 が緊張感を薄めていないか確認する。
3. `auto_verify.html` で見える自動検証が、実際のプレイ改善判断に使えるか確認する。
4. 次回は v13 の配置をさらに「休符 / 圧 / 回復 / ボス前」の波形として調整する。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用まで検査する。
- ユーザーが「完成」または「止めろ」と判断する。
