# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-21T10:35:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v38/` で v37 の relay を gate として読ませるため、shield break 時の即時 side connector を外し、relay 撃破時に side route を開く playable diff を追加した。`shieldBreakCreatesRelay`、`shieldRelayDestroyed`、`shieldRelayOpensRoute`、`relayOpensSideRoute`、DonPachi 単一文法 / chain window / mid-late density / anti-instant-kill / guaranteedFollowUpResidency / readableShieldAbsorption / bossFinalCue / bot BOMB S clear を確認済み。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v28 を人間プレイで確認し、1942 trace の赤5機/10機、side curl、下方 bonus plane、大型機前護衛が「既存ゲームの出現パターンを写したもの」に見えるかを見る。
2. 「体感が変わらない」を潰すため、今後の変更は小さなパラメータ調整だけで playable diff として扱わない。
3. 敵配置を変える場合は、参考にした型ではなく、参照した具体 wave、敵数、原作座標、duration、実装した trace を `design_log.md` に明記する。
4. headless は clear 可能性とイベント発火の検証に使う。面白さ判定とは分ける。
5. v38 の simple bot は clear し、BOMB も使用する。次は人間プレイで、`shield break -> relay -> side route` の順序が「relay を倒すと次の route が開く」と読めるか、またはまだ敵追加に見えるかを確認する。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用を検証する。
- Active DEF の cue と使用価値が実プレイでも読める。
- 敵配置が「散発的なランダム出現」ではなく、手作り wave として見える。
- Nao_u が「完成」または「止めろ」と判断する。
