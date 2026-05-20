# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-21T02:58:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v26/` で v25 の残リスクだった橙弱点窓の読みやすさに対し、橙が露出前に commit lane へ寄り、露出中だけ自弾を軽く吸い込み、露出直後だけ発射を抑える commit window に変更した。headless clear / final BOMB / Active DEF / route contract / 橙ダメージ差 / 予告移動 / 自弾吸い込みを確認済み。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v26 を人間プレイで確認し、橙の予告移動と自弾吸い込みが「横へ寄って撃つ」操作として自然か、補助が強すぎないかを見る。
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
