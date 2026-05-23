# graze_log v05.2_cdx_v69 design_log

## 対象 directive と原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。Nao_u の継続指示は、`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまで定時サイクルで改善を続ける、というもの。

直近の補足方針は「別指示があるまでは、ゲーム制作そのものよりも AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要ならゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証」。

## 実装前判断

v68 は review URL の canvas 下に `verdict` / `band` / `occlusion` を追加し、単一フレームの CHASE popup が「見えるか」を DOM と screenshot で確認できるようにした。残る弱点は、1 フレームだけ読める popup を安定した人間確認候補として扱ってしまうことだった。

今回は gameplay、敵配置、報酬、bot policy を変えない。v68 の review surface に、対象フレームの前後 2 frame を含む `reviewPacket` を追加し、単一フレームの pass と、前後込みの安定性を分離する。

採用する過去知見:

- `memory/game_headless_action_eval_playbook_20260523.md`: headless は面白さ判定ではなく、主観 feedback を policy / telemetry に翻訳する補助。
- `memory/game_headless_eval_causality_lesson_20260523.md`: gameplay と評価器を同時に動かした時は因果を混ぜない。今回は評価 surface だけを変更する。
- `memory/game_memory_task_lens_index.md` の Playable / Headless 評価: 起動確認だけでなく、人間評価前の比較証拠を残す。

## 設計サイクル

現状の良い点: v68 は route / aggressive / marksman の clear、camper clear 0、CHASE popup の可読性、review panel の DOM contract を維持している。review URL は通常 gameplay を汚さず、Chrome screenshot と DOM dump の両方で確認できる。

悪い点: `verdict=pass` は対象 frame だけの判定で、popup が出た瞬間や消える直前でも pass になり得る。人間に渡す frame は、前後数 frame も同じ側・同じ可読条件を保つかを見た方がよい。

改善案: `classifyReviewSnapshot()` と `makeReviewPacket()` を追加する。`probeReview=1` の時だけ `frame-2 / frame / frame+2` を評価し、panel に `stable`、`window`、`reason` を表示し、DOM dataset に `data-review-stable`、`data-review-window`、`data-review-reason` を出す。

採用案: gameplay は v68 と同一。review panel だけを拡張し、単一 frame の `verdict=pass` と前後込みの `stable=no` を同時に出せるようにする。これは「この frame は見えるが、安定候補ではない」という headless の注意情報として使える。

## 懸念

`stable=yes` を無理に作るために popup の寿命や表示位置を変えると、報酬演出そのものを変えてしまう。今回は `stable=no` が出る frame も合格とし、headless が曖昧な frame を曖昧だと報告できることを検証する。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v69_check.js
node tools\headless_graze_log_cdx_v05_2_v69_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v69_visual_probe_check.js
```

合格条件:

- focused check が route clear、boss cue、BOMB、Active DEF、CHASE reward telemetry を維持する。
- policy matrix が route/aggressive/marksman clear と CHASE bonus、camper clear 0 / CHASE 0 を維持する。
- visual probe が bare canvas pixel、review screenshot、DOM contract を通し、review panel の `stable/window/reason` contract を確認する。

## 結果

2026-05-24 に 3 本とも pass。v69 は gameplay を v68 から変えず、review panel に `stable`、`window`、`reason` を追加した。visual probe では対象 CHASE frame が `verdict=pass` のまま、前後込みでは `stable=no` / `reason=unstable neighboring frames` として DOM に出ることを確認した。
