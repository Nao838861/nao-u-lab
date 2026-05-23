# graze_log v05.2_cdx_v68 design_log

## 対象 directive と原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。Nao_u の継続指示は、`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまで定時サイクルで改善を続ける、というもの。

直近の補足方針は「別指示があるまでは、ゲーム制作そのものよりも AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要ならゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証」。

## 実装前判断

v67 は `probeReview=1` の canvas 下に CHASE review panel を出し、frame / policy / side / distance / readable を DOM と screenshot で確認できるようにした。残っていた弱点は、数値を見た人間が「これは読める frame なのか、まだ見直すべき frame なのか」を毎回解釈する必要があることだった。

今回は gameplay を変えず、review surface を一段だけ評価器寄りにする。採用する過去知見は次の通り。

- `memory/game_headless_action_eval_playbook_20260523.md`: headless は面白さ判定ではなく、主観 feedback を policy / telemetry に翻訳する補助。
- `memory/game_headless_eval_causality_lesson_20260523.md`: gameplay と評価器を同時に動かした時は因果を混ぜない。今回は評価 surface だけを変える。
- `memory/game_memory_task_lens_index.md` の Playable / Headless 評価: 起動確認だけでなく、人間評価前の比較証拠を残す。

## 設計サイクル 1

現状の良い点: v67 は通常 gameplay を汚さず review URL だけに panel を出す、route/aggressive/marksman は clear と CHASE bonus を維持する、camper は clear 0 / CHASE 0 を維持する、DOM dump と screenshot が同じ URL を見る、bare canvas pixel probe も残っている、panel は frame と popup box を示す。

悪い点: `readable=yes` だけでは、距離が許容帯なのか、HUD/自機/遠距離のどれで落ちたのかが分からない。検査が pass しても panel 自体が canvas の下にあることを screenshot 側で確認していない。DOM contract は dataset の存在を見るが、frame を人間に渡す前の pass/inspect 判定がない。

改善案: panel に `verdict`、`band`、`occlusion` を追加する。`band` は player distance を `near/readable/far` に分類し、`occlusion` は `hud/player/far/clear` を出す。`verdict=pass` は CHASE popup が canvas 内、HUD 近傍ではなく、自機に近すぎず、遠すぎず、距離 band も readable の時だけにする。visual probe は panel が canvas より下に存在すること、DOM が `data-review-verdict="pass"` / `data-distance-band="readable"` / `data-occlusion="clear"` を持つことを検査する。

筋の良い案: v68 は v67 の gameplay を完全に維持し、review surface だけを強化する。これなら前版の policy matrix と比較可能で、失敗時も gameplay の悪化ではなく review contract の問題として切り分けられる。

## 設計サイクル 2

採用しない案: CHASE popup の色や大きさを変える、報酬量を変える、敵配置を変える、bot policy を増やす、OCR を導入する、Browser Use 専用の手順だけを残す。これらは「報酬感の判断」へ踏み込みすぎるか、今回の headless surface 強化から外れる。

今回の合格条件は、v67 から gameplay 指標を変えないことと、review URL が人間に渡す前の最低限の判定を持つこと。面白さや気持ちよさはまだ判定しない。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v68_check.js
node tools\headless_graze_log_cdx_v05_2_v68_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v68_visual_probe_check.js
```

合格条件:

- focused check が route clear、boss cue、BOMB、Active DEF、CHASE reward telemetry を維持する。
- policy matrix が route/aggressive/marksman clear と CHASE bonus、camper clear 0 / CHASE 0 を維持する。
- visual probe が bare canvas pixel、review screenshot、DOM contract、review panel の `verdict/band/occlusion` contract、panel が canvas 下にあることを確認する。

## 結果

2026-05-24 に 3 本とも pass。v68 は gameplay を v67 から変えず、review panel に `verdict=pass`、`band=readable`、`occlusion=clear` を追加し、Chrome screenshot でも panel が canvas の下にあることを検査できるようにした。
