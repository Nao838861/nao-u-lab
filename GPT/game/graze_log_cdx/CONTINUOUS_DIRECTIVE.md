# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-21T05:40:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v25/` で v24 までの敵出現ソースを捨て、既存ゲームの編隊文法をブレストしてから再実装した。Galaga 的な曲線進入レーン、1942 的な横幅圧と安全穴、DonPachi 系の優先順位と切り替え誘導を、現在のオートショット縦シュー向けに変換した。headless で clean source / brainstorm / wave label / expected position / stage flags / BOMB / Active DEF / boss / clear / bot clear を確認済み。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v25 を人間プレイで確認し、左右切り替え、面圧、安全穴、中ボス前後の意図が体感できるかを見る。
2. 「体感が変わらない」を潰すため、今後の変更は小さなパラメータ調整だけで playable diff として扱わない。
3. 敵配置を変える場合は、参考にした型、プレイヤーに取らせたい位置、実装した wave / enemy pattern を `design_log.md` に明記する。
4. headless は clear 可能性とイベント発火の検証に使う。面白さ判定とは分ける。
5. v25 の simple bot は clear するが BOMB を必須使用しない。次は「人間が自然に撃ちたくなる final cue」として BOMB の役割を再評価する。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用を検証する。
- Active DEF の cue と使用価値が実プレイでも読める。
- 敵配置が「散発的なランダム出現」ではなく、手作り wave として見える。
- Nao_u が「完成」または「止めろ」と判断する。
