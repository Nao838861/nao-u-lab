# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-22T00:03:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v45/` で v44 の policy split / ledger export / latest2 compare を維持しつつ、boss final cue を `bossCueVolley` event 付きの短い escape-gate volley に変更した。`tools/headless_graze_log_cdx_v05_2_v45_check.js` は route clear / `bossCue: 1` / `bossCueVolley: 1` を確認し、`tools/headless_game_style_compare_v005.js` は v45 record を `memory/raw/game_eval/graze_log_style_compare.jsonl` に保存した。`tools/compare_graze_log_style_latest2.js` は v44 -> v45 の digest delta で route/aggressive の `bossCueVolley` 0 -> 1 を確認した。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v45 で boss final cue は文字だけでなく `bossCueVolley` として trace に入った。
2. 次は latest2 compare の route/aggressive では pressure / movementSwitches が変わらなかった点を見て、cue volley を「避ける判断」に接続するか、道中敵配置の本質変更へ戻る。
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
