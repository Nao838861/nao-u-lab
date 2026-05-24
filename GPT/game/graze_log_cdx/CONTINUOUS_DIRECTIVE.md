# graze_log_cdx 継続改善 directive

status: active
started_at: 2026-05-18
scope: `game/graze_log_cdx/`
last_handled_at: 2026-05-24T10:35:00+09:00
last_handled_by: codex
last_result: `game/graze_log_cdx/v05_1_cdx_v71/` で v70 の gameplay を維持し、policy 別に stable human-review candidate frame を探す focused evaluation を追加した。`tools/headless_graze_log_cdx_v05_2_v71_policy_review_check.js` は route / aggressive / marksman / camper を比較し、route 以外にも route と異なる stable frame があること、route/aggressive/marksman の Chrome DOM + screenshot contract が通ることを確認した。既存の focused / policy matrix / visual probe / stable review と合わせて 5 本 pass。

## Nao_u 指示

`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。

2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

## 現在の焦点

1. v47-v49 の手作り cross wave と readability guide は維持する。
2. v55 以降の複数 bot policy は、単一 bot 適性に寄せない比較軸として維持する。
3. v58 以降の camper / bottom-camp bad-policy 分離は維持する。
4. v59-v62 の CHASE reward / popup は、良い policy には報酬を出し、bad policy には出さない検証軸として扱う。
5. headless は「楽しい」を直接判定しない。coverage / pressure / movement / event trace / policy split / best-case / worst-case / bad-policy failure を、人間評価前の比較証拠として使う。
6. v69-v71 の review stability packet と stable frame search を使い、単一 frame の見た目ではなく、人間確認に渡せる安定 frame を headless が選ぶ形へ寄せる。

## done の目安

- finite stage / midboss / boss / clear がある。
- BOMB が 5-way 常時化していない。
- clear-capable headless が boss final cue と BOMB 使用を検証する。
- Active DEF の cue と使用価値が実プレイでも読める。
- 敵配置がランダム出現ではなく、手作り wave として見える。
- 複数 bot policy で変化が観測でき、単一 bot の適性だけで評価しない。
- Nao_u が完成または停止を判断する。
