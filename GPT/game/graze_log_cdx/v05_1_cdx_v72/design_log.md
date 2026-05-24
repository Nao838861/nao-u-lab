# graze_log v05.2_cdx_v72 design_log

## 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してもよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

## 実装前判断

v71 は CHASE popup に限定して、policy 別の stable human-review candidate frame を選べるようにした。次の不足は、headless が「見せるべき瞬間」を CHASE 報酬だけに寄せすぎること。BOMB、Active DEF、boss final cue はゲームのリスク処理と到達確認に関わるため、人間確認用 screenshot 候補として同じ枠で抽出できる必要がある。

今回は gameplay、敵配置、報酬、bot policy は変更しない。`memory/game_headless_action_eval_playbook_20260523.md` の「主観を平均点へ圧縮しない」と、`memory/game_headless_eval_causality_lesson_20260523.md` の「評価器変更と gameplay 変更を混ぜない」を優先し、v71 のゲームを固定して cue family 別の focused evaluation を追加する。

## 設計サイクル

現状の良いところ:

- v71 の focused / matrix / visual / stable / policy review check は通る。
- route は clear し、BOMB と Active DEF と boss cue は event ledger に残る。
- CHASE popup では stable frame と browser screenshot contract が取れている。

現状の悪いところ:

- stable candidate の対象が CHASE popup に偏っている。
- BOMB / Active DEF / boss cue は event count と trace digest では見えるが、人間が確認する frame 候補としては保存されない。
- 「どの cue family を見せるか」の比較がないため、headless evidence がスコア報酬の瞬間だけに偏る危険がある。

改善案:

1. v71 を v72 に複製し、gameplay は固定する。
2. `tools/headless_graze_log_cdx_v05_2_v72_cue_review_check.js` を追加する。
3. route / seed 12345 で `chasePopup` / `activeDef` / `bossCue` / `bomb` の event を探し、各 event 周辺で 3 frame window が安定して cue を保持する frame を選ぶ。
4. 選んだ frame を Chrome headless の実 DOM / screenshot で確認し、game version / canvas contract / screenshot size を evidence として残す。
5. 既存の v72 focused / matrix / visual / stable / policy review も通して、評価器追加で既存 contract が壊れていないことを確認する。

採用案は 1-5。今回は playable diff として v72 を作るが、主眼はゲーム体験の新要素ではなく cue family review の評価器拡張。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v72_check.js
node tools\headless_graze_log_cdx_v05_2_v72_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v72_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v72_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v72_policy_review_check.js
node tools\headless_graze_log_cdx_v05_2_v72_cue_review_check.js
```

合格条件:

- v71 由来の focused / matrix / visual / stable / policy review が維持される。
- cue review が CHASE / Active DEF / boss cue / BOMB の 4 family すべてで stable frame を見つける。
- route は clear し、BOMB と Active DEF を使い、boss cue が記録される。
- 4 family の browser screenshot contract が通る。
- cue review の raw JSONL が `memory/raw/headless_eval/graze_log_cdx_cue_review.jsonl` に残る。

## 結果

2026-05-24 に 6 本すべて pass。新規 `cue_review_check` は `chasePopup` 425f、`activeDef` 1138f、`bossCue` 4693f、`bomb` 4705f を stable candidate として選び、4 件すべてで Chrome DOM / screenshot contract を確認した。route は clear、BOMB 1 回、Active DEF 18 回、boss cue 1 回を維持した。

## 懸念と次

v72 も評価器の改善であり、プレイヤー体験の新要素は増やしていない。次に続けるなら、cue family ごとの screenshot を人間評価用 packet として 1 HTML にまとめるか、policy 別に BOMB / Active DEF / boss cue の候補 frame がどう変わるかを見る。
