# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-20T22:15:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v22/` で細かいUI調整から離れ、各ウェーブの intent を `graze / kills / bombs / defs / hits` の route contract に接続した。clear-capable headless / final BOMB / Active DEF 使用 / route contract 成功失敗 probe / simpleBot の contractScore 発火を通した。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v22 の route contract が実プレイで「良いプレイの目標」として読めるか確認する。
2. `READ` / `RESTOCK` / `BOSS` の条件が緩すぎる、または厳しすぎる場合は `phaseContractTarget()` だけを先に調整する。
3. contract が単なるリザルト加点に留まる場合は、次にウェーブ中の小さな cue や分岐報酬を検討する。
4. 敵配置 / BOMB 経済 / Active DEF ring は、contract の人間評価が済むまで混ぜて動かさない。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用を検査する。
- Active DEF の cue と使用価値が実プレイでも読める。
- ユーザーが「完成」または「止めろ」と判断する。
