# graze_log v05.2_cdx_v70 design_log

## 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示は、`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまで定時サイクルで改善を続けること。2026-05-22 の直接指示では、別指示があるまではゲーム制作そのものよりも「AI がゲームを作る際の headless のあり方」を検討し、必要ならゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの実地検証とされた。

## 実装前判断

v69 は CHASE popup review panel に `stable/window/reason` を追加し、単一 frame の `verdict=pass` と、前後込みでは `stable=no` になる曖昧 frame を区別できるようにした。残課題は、headless が人間確認に渡せる `stable=yes` の frame を自分で探し、同じ review URL / DOM / screenshot で証拠化すること。

今回は gameplay、敵配置、報酬値、bot policy は変更しない。評価面だけを増やし、v69 の「安定 frame を探す」という残課題に集中する。

採用する過去知見:

- `memory/game_headless_action_eval_playbook_20260523.md`: 主観評価を平均点に潰さず、確認したい状態を bot policy と telemetry に落とす。
- `memory/game_headless_eval_causality_lesson_20260523.md`: gameplay と評価器を同時に動かして原因を混ぜない。今回は評価器のみ変更する。
- `memory/game_memory_task_lens_index.md` の Playable / Headless 評価: 起動確認だけでなく、人間評価前の比較証拠を残す。

## 設計サイクル

現状の良いところ:

- v69 の route / aggressive / marksman は clear し、camper は clear 0 / CHASE 0 のまま分離されている。
- review URL は DOM dataset と screenshot の両方で検証できる。
- CHASE popup の単一 frame 可読性と、前後込みの安定性を別の値として表示できる。

現状の悪いところ:

- v69 の visual probe は `stable=no` の frame を証拠化していたため、人間が確認すべき「安定して読める frame」を headless が選ぶところまでは到達していなかった。
- `stable=yes` が実際に存在するか、存在するならどの frame を渡せばよいかが検証ログに残っていなかった。

改善案:

1. CHASE popup event の周辺 frame を headless で走査し、`makeReviewPacket()` が `stable=true` になる frame を探す。
2. 見つけた stable frame で `probeReview=1` の実ブラウザ DOM dump と screenshot を取り、`stable yes` / `stable readable CHASE popup` を契約として確認する。
3. gameplay は変えず、v69 までの clear / bad-policy failure 契約を継続する。

採用案は 1+2+3。これは v69 の評価 surface をそのまま使い、人間確認に渡せる frame 選定だけを追加する最小 diff である。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v70_check.js
node tools\headless_graze_log_cdx_v05_2_v70_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v70_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v70_stable_review_check.js
```

合格条件:

- focused check: route clear、boss cue、BOMB、Active DEF、CHASE reward telemetry を維持する。
- policy matrix: route/aggressive/marksman は clear、camper は clear 0 / CHASE 0 を維持する。
- visual probe: bare canvas pixel、review screenshot、DOM contract、v69 由来の stability packet contract を維持する。
- stable review check: 複数の CHASE event 周辺で `stableFrame` を見つけ、選択 frame の DOM と screenshot が `stable=yes` を示す。

## 結果

2026-05-24 に 4 本とも pass。

`tools/headless_graze_log_cdx_v05_2_v70_stable_review_check.js` は、少なくとも 6 件の CHASE event 周辺で stable frame を検出した。代表例は frame 425、window `423/425/427`、side `right`、距離 `150.1/156.9/163.8`、reason `stable readable CHASE popup`。実ブラウザ screenshot は `.tmp/graze_log_cdx_v70_stable_review/v70_stable_review_frame_425.png` に生成され、DOM contract も `data-review-stable="true"` と `stable yes` を確認した。

## 懸念と次

v70 は評価器の前進であり、ゲーム体験そのものの改善ではない。次に触るなら、stable frame 探索を CHASE 以外の人間確認ポイントにも広げるか、複数 policy の stable review 差分を比較して「どの policy が何を見せているか」を検証する。
