# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-24T01:45:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v66/` で v65 の gameplay を維持し、`probeReview=1` の実ブラウザ寄り review URL に DOM contract を追加した。`body[data-probe-mode=review]`、`data-game-version`、canvas `aria-label` / `data-probe-canvas` を付与し、`makeProbeSnapshot().visualContract.dom` と Chrome `--dump-dom` 検証を追加。`tools/headless_graze_log_cdx_v05_2_v66_check.js` / `tools/headless_graze_log_cdx_v05_2_v66_policy_matrix_check.js` / `tools/headless_graze_log_cdx_v05_2_v66_visual_probe_check.js` が pass。route clear、policy matrix の route/aggressive/marksman clear と camper clear 0 / chaseBonus 0、bare canvas pixel probe、normal UI review screenshot、browserDomContract すべて維持。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものより、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要ならゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

## 現在の焦点

1. v47-v49 の手作り cross wave と readability guide は維持する。
2. v55 以降の複数 bot policy は、単一 bot 適性に寄せないための比較軸として維持する。
3. v58 以降の camper / bottom-camp bad-policy 分離は維持する。
4. v59-v62 の CHASE reward / popup は、良い policy には報酬を出し、bad policy には出さない検証軸として扱う。
5. headless は「楽しい」を直接判定しない。coverage / pressure / movement / event trace / policy split / best-case / worst-case / bad-policy failure を、人間評価前の比較補助として使う。
6. 次の焦点は Browser Use または実機で、v66 の通常 UI 付き `probeFrame=838&probeDraw=1&probeReview=1` などを開き、プレイヤー近傍 rail `CHASE` が報酬として読めるか、邪魔にならないかを人間目視で確認すること。headless review probe は「画面 surface に文字がある」最低保証であり、報酬感の判定ではない。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化していない。
- clear-capable headless が boss final cue と BOMB 使用を検証する。
- Active DEF の cue と使用価値が実プレイでも読める。
- 敵配置がランダム出現ではなく、手作り wave として見える。
- 複数 bot policy で変化が観測でき、単一 bot の適性だけで評価しない。
- Nao_u が完成または停止を判断する。
