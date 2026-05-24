# graze_log v05.2_cdx_v71 design_log

## 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してもよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

## 実装前判断

v70 は CHASE popup の `stable=yes` frame を headless が探し、DOM と screenshot に残すところまで到達した。残課題は、確認候補が route policy だけに閉じていること。route で読みやすい frame が見つかっても、aggressive / marksman / camper で同じ評価面がどう変わるかを見ないと、「headless が選んだ証拠が policy 偏りを持っていないか」を判断しにくい。

今回は gameplay、敵配置、報酬、bot 挙動は変更しない。v70 の評価 surface を使い、policy ごとに stable human-review candidate frame を探して比較する focused evaluation を追加する。これは `memory/game_headless_action_eval_playbook_20260523.md` の「主観評価を平均点に圧縮せず、悪い play policy と良い route policy を分けて検証する」という知見と、`memory/game_headless_eval_causality_lesson_20260523.md` の「gameplay と評価器を同時に動かして原因を混ぜない」に沿う。

## 設計サイクル

現状の良いところ:

- v70 の focused / policy matrix / visual probe / stable review は通っている。
- route / aggressive / marksman は clear し、camper は dominant strategy になっていない。
- CHASE popup は DOM と screenshot の両方で人間確認用 evidence にできる。

現状の悪いところ:

- stable review check は route の CHASE event だけを見ている。
- 複数 policy がそれぞれどの frame を「人間が見るべき候補」として提示するかが残っていない。
- policy 差分の screenshot contract がないため、今後の評価で「route だけを見ていた」問題を見落としやすい。

改善案:

1. v70 を v71 に複製し、gameplay は固定する。
2. `tools/headless_graze_log_cdx_v05_2_v71_policy_review_check.js` を追加し、route / aggressive / marksman / camper の CHASE event から stable frame を探す。
3. stable frame が見つかった policy について Chrome DOM dump と screenshot を取り、`policy` 行、`stable yes`、`stable readable CHASE popup`、`verdict pass` を contract として検証する。
4. route 以外にも stable frame があり、かつ route と異なる frame が提示されることを確認する。

採用案は 1-4。ゲーム体験そのものの改善ではなく、headless が evidence を選ぶ手順を一段広げる diff とする。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v71_check.js
node tools\headless_graze_log_cdx_v05_2_v71_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v71_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v71_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v71_policy_review_check.js
```

合格条件:

- v70 由来の focused / matrix / visual / stable review がすべて維持される。
- policy review で route は複数 stable frame を持つ。
- aggressive と marksman も stable review 候補を持つ。
- route 以外に route と異なる stable frame がある。
- Chrome DOM/screenshot contract が 3 policy 以上で通る。

## 結果

2026-05-24 に 5 本すべて pass。`policy_review_check` は route / aggressive / marksman / camper の stable candidate を比較し、少なくとも 3 policy の DOM と screenshot contract を確認した。

## 懸念と次

v71 は評価器の改善であり、プレイヤー体験の新要素は増やしていない。次に続けるなら、今回の policy 別 stable candidate を CHASE 以外の BOMB cue / Active DEF cue / boss cue にも広げるか、policy review の差分を raw headless eval に保存して時系列比較できるようにする。
