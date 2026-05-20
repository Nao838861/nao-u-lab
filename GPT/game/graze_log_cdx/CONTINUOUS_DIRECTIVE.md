# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-21T01:05:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v25/` で v24 の残リスクだった橙強敵の硬さを、短い弱点露出窓へ変更した。通常ヒット 1、露出窓ヒット 3 とし、FOCUS を「硬い敵を長く撃つ」ではなく「窓を読んで撃ち込む」操作に寄せた。headless clear / final BOMB / Active DEF / route contract / 橙窓ダメージ差を確認済み。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v25 を人間プレイで確認し、橙強敵の弱点露出窓が見て読めるか、撃ち込むタイミングとして自然かを見る。
2. 「体感が変わらない」を潰すため、今後は UI/評価軸だけの変更を playable diff として扱わない。
3. 敵配置を変える場合は、参考にした型と、実装した wave / enemy pattern を design_log に明記する。
4. headless は clear 可能性とイベント発火の検査に使い、面白さ判定とは分ける。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用を検査する。
- Active DEF の cue と使用価値が実プレイでも読める。
- 敵配置が「散発的なランダム出現」ではなく、手作り wave として見える。
- Nao_u が「完成」または「止めろ」と判断する。
