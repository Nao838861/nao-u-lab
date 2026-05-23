# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-23T13:34:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v62/` で CHASE popup の headless readability telemetry を追加した。v61 の上部 safe rail は遮蔽しないが遠すぎることを focused check が `chasePopupMeanSpawnPlayerDist 419.7` / `chasePopupTooFarPct 0.137` として検出したため、左右 rail を維持しつつ `player.y-96` 近傍へ寄せた。最終版は `tools/headless_graze_log_cdx_v05_2_v62_check.js` と `tools/headless_graze_log_cdx_v05_2_v62_policy_matrix_check.js` が pass。focused route は `chasePopupMeanSpawnPlayerDist 148.3` / `chasePopupMeanActivePlayerDist 157` / `chasePopupTooFarPct 0` / `chasePopupThreatOverlapPct 0.001` / `chasePopupBossCueOverlapPct 0` / `chasePopupReadabilityMeasured true`。matrix でも route/aggressive/marksman の `chasePopupReadabilityMeasured` が true。camper は clear 0 / chaseBonus 0 を維持。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものより、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要ならゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

## 現在の焦点

1. v47-v49 の手作り cross wave と readability guide は維持する。
2. v55 以降の複数 bot policy は、単一 bot 適性に寄せないための比較軸として維持する。
3. v58 以降の camper / bottom-camp bad-policy 分離は維持する。
4. v59-v62 の CHASE reward / popup は、良い policy には報酬を出し、bad policy には出さない検証軸として扱う。
5. headless は「楽しい」を直接判定しない。coverage / pressure / movement / event trace / policy split / best-case / worst-case / bad-policy failure を、人間評価前の比較補助として使う。
6. 次の焦点は Browser Use または実機で、v62 のプレイヤー近傍 rail `CHASE` が報酬として読めるか、邪魔にならないかを確認すること。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化していない。
- clear-capable headless が boss final cue と BOMB 使用を検証する。
- Active DEF の cue と使用価値が実プレイでも読める。
- 敵配置がランダム出現ではなく、手作り wave として見える。
- 複数 bot policy で変化が観測でき、単一 bot の適性だけで評価しない。
- Nao_u が完成または停止を判断する。
