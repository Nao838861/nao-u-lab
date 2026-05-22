# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-22T21:47:41+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v54/` で v53 の stage / enemy / bullet / guide / bot policy を維持したまま、ヘッドレス評価の baseline 版を作った。`tools/headless_graze_log_cdx_v05_2_v54_check.js` は route clear / grade S / routeEvents 29 / `readabilityGuides: 2` を確認。`tools/headless_graze_log_cdx_v05_2_v54_policy_matrix_check.js` は 5 seed × 4 policy を走らせ、best/mean/worst/clearRate/pressure/movement/emergency/coverage を出した。現行実装では seed 差はほぼ出ず、policy 差は明確。route/aggressive は clear、defensive は guide まで到達して game over、panic は routeCoverage 0.379 で早期 game over し、早期 churn signal として観測できた。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v47 で boss 前の手作り wave `DP cross-lock carrier braid` は `crossLockWave` と route event として trace に入った。
2. v48 で midboss 後の手作り wave `DP post-midboss cross squeeze` は `postMidCrossWave` と route event として trace に入った。
3. v49 で 2 つの横移動 wave に薄い lane guide と専用敵色を追加し、`readabilityGuides: 2` を trace に入れた。
4. v50 で guide を alpha 0.10 / lineWidth 2.2 に下げ、post-midboss の中央線を削った。
5. v53 で alpha 0.12 は採用可能に見える。Browser Use Node REPL が使えるセッションで in-app browser 目視する余地は残る。
6. v54 の matrix では seed 差がほぼ出ない。次は seed を増やす前に、policy 側へ「初心者らしい迷い」「狙い撃ち優先」「生存優先」などを足す方が有効。
7. headless は「楽しい」を直接判定しない。coverage / pressure / movement / event trace / policy split / best-case / worst-case を、人間評価前の比較補助として使う。
8. 敵配置を変える場合は、参照した具体 wave、敵数、座標、duration、実装後 trace を `design_log.md` に明記する。
9. `panic` は人間の焦りの再現ではなく端逃げ policy。v54 では早期 churn signal としては使えたが、人間らしい panic ではない。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用を検証する。
- Active DEF の cue と使用価値が実プレイでも読める。
- 敵配置が「ランダム出現」ではなく、手作り wave として見える。
- 複数 bot policy で変化が観測でき、単一 bot の適性だけで評価しない。
- Nao_u が「完成」または「止めろ」と判断する。
