# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-20T07:24:00+09:00
last_handled_by: log_cdx_phase_game_start
last_result: `game/graze_log_cdx/v05_1_cdx_v10/` で boss warning を break/top-off wave に整理し、final cue 後に simpleBot が BOMB を使って clear する条件を headless で必須化。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v04 を起点に self-play 観察を続ける。
2. boss の削り感、BOMB を使いたくなる局面、初見クリア可能性を調整する。
3. headless は「値の一致」だけでなく、有限進行・boss・clear・BOMB 悪用不可を検証する。

## done の目安

- Nao_u が完成または停止を明示する。
- playable 版に finite stage / boss / clear / BOMB の意味ある使用判断 / self-play 評価ログが揃う。
