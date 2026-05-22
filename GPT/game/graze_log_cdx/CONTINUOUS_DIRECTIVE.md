# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-22T12:39:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v52/` で v51 の通常プレイを変えず、`?probeFrame=N&probeDraw=1` の deterministic visual probe を追加した。Browser Use Node REPL がないため Chrome headless を使い、`tools/headless_graze_log_cdx_v05_2_v52_chrome_probe_check.js` で post-midboss frame 3090 と cross-lock frame 3890 の PNG を `.tmp/graze_log_cdx_v52_probe/` に生成した。画像では guide はかなり薄いが、左右へ交差する path として視認でき、chevron 的な矢印感は戻っていない。通常 headless は route clear / grade S / routeEvents 29 / `readabilityGuides: 2` / `chevrons:false` を維持し、`tools/compare_graze_log_style_latest2.js` は v51 -> v52 の gameplay digest 同値を確認した。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 現在の焦点

1. v47 で boss 前の手作り wave `DP cross-lock carrier braid` は `crossLockWave` と route event として trace に入った。
2. v48 で midboss 後の手作り wave `DP post-midboss cross squeeze` は `postMidCrossWave` と route event として trace に入った。
3. v49 で 2 つの横移動 wave に薄い lane guide と専用敵色を追加し、`readabilityGuides: 2` を trace に入れた。
4. v50 で guide を alpha 0.10 / lineWidth 2.2 に下げ、post-midboss の中央線を削った。
5. 次は still screenshot だけでなく、probeFrame を複数連続で撮るか、Browser Use Node REPL が使えるセッションで実ブラウザ目視し、alpha 0.10 の guide が動きとして読めるかを確認する。薄すぎる場合は alpha 0.12 か短い fade 調整を試す。
6. headless は「楽しい」を直接判定しない。coverage / pressure / movement / event trace / policy split を、人間評価前の比較補助として使う。
7. 敵配置を変える場合は、参照した具体 wave、敵数、座標、duration、実装後 trace を `design_log.md` に明記する。
8. `panic` は人間の焦りの再現ではなく端逃げ policy。次に使う時はこの限界を明記する。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化しない。
- clear-capable headless が boss final cue と BOMB 使用を検証する。
- Active DEF の cue と使用価値が実プレイでも読める。
- 敵配置が「ランダム出現」ではなく、手作り wave として見える。
- 複数 bot policy で変化が観測でき、単一 bot の適性だけで評価しない。
- Nao_u が「完成」または「止めろ」と判断する。
