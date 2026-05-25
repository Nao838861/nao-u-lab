# graze_log v05.2_cdx_v84 design_log

## v84 追記: causal slice comparator

### 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

### 実装前判断

v83 は同 seed の `j4/lag4` failure と `j6/lag6` clear を `botTrace` で保存し、入力列と target が分岐することを確認した。ただし、その evidence はまだ「trace がある」段階で、人間確認や次の評価器設計に渡すには、何が到達差になっているのかが読みにくい。

今回は gameplay、敵配置、報酬、既定 bot を変えない。v83 の trace を使い、`target divergence`、`late survival`、`Active DEF reach`、`BOMB reach` の4軸へ分ける focused evaluation を作る。使う知見は `memory/game_headless_action_eval_playbook_20260523.md` の policy split、`memory/game_headless_eval_causality_lesson_20260523.md` の「原因を決める前に policy 比較」、および `memory/game_special_system_hud_affordance_lesson_20260525.md` の「特殊システムは発動可能性と意味を分ける」。

### 設計サイクル 1

良いところ: gameplay固定、v83からの差分が明確、同 seed 比較、baseline維持、j4 failure維持、j6 clear維持、入力列保存、target保存、lag source保存、jitter保存、Active DEF保存、BOMB保存、shield保存、route coverage保存、raw JSONL保存、packet DOMあり、screenshotあり、平均点に逃げない、次回の因果分解に渡せる、playable index維持。

悪いところ: 人間の楽しさ判定ではない、route bot固有、seed 2個中心、j6が人間耐性を意味しない、j4原因の断定はまだ危険、BOMB差の良し悪しは別問題、Active DEF差の良し悪しも別問題、trace解釈が専門的、visual stable frame探索ではない、gameplay完成度は上がらない。

改善案: v83 traceを causal slice 化、late survival frame を assert、BOMB到達差を assert、Active DEF回数差を assert、target/input分岐を assert、rawを別ファイル保存、packet文言更新、README更新、devlog更新、directive更新、staging更新、次回は policy 追加か人間確認 packet へ進める。

筋の良い案: `j4` と `j6` の差を「j6が勝つ」ではなく、「j4 は late BOMB へ到達せず、j6 は到達する」として保存する。解決できる問題は、非単調 cell の合否を行動到達差へ変換できること。懸念は、この到達差が bot policy の癖なのか gameplay の危険点なのかはまだ決めないこと。

### 設計サイクル 2

良いところ: seed 12345 では final target delta が大きい、seed 77777 でも route coverage と survival gap が大きい、両 seed で BOMB gap が出る、両 seed で Active DEF count gap が出る、baseline が clear する、packet がブラウザで開ける、headless が DOM と screenshot を見る、raw evidence が蓄積される。

悪いところ: stdout が大きい、raw を読まないと詳細が見えない、packet は静的ガイドで live trace 表ではない、bad policy 併走は今回外す、j12 stress は外す、mobile未確認、manual browser目視未実施、completion条件には未到達。

改善案: causalSlices を report に追加、`lateSurvivalFrames > 250` を条件化、`bombGap === 1` を条件化、`activeDefGap > 0` を条件化、`routeCoverageGap > 0` を条件化、packet の data-review-packet を `bot-perturbation-causal-slice-v001` にする。

筋の良い案: v84 は「原因修正」ではなく「原因候補の分類」で止める。解決できる問題は、次回以降に評価器を変える時、どの観測軸が壊れたかを比較しやすくなること。懸念は、ゲームそのものの手触り改善は次の playable diff に残ること。

### 設計サイクル 3

良いところ: continuous directive に沿う、headless のあり方検証、playable diffあり、focused evaluationあり、design_logあり、devlogあり、READMEあり、raw evidenceあり、screenshotあり、DOMあり、baseline/j4/j6 の三点比較、target/input/late survival/Active DEF/BOMB の分類、gameplay非変更、commit単位明確。

悪いところ: Nao_u実評価待ち、trace表の可視化はまだ弱い、policy split は route の中だけ、seed数は少ない、BOMBが良い入力かどうかは人間確認が必要、Active DEFの意味も人間確認が必要、完成判定ではない。

改善案: 次回は v84 causal slice を使い、route 以外の good policy / bad policy にも同じ slice を出すか、人間確認用 packet に trace表を載せる。gameplay変更へ進むなら、j4が失う shield と BOMB到達不可が実プレイでも起きるかを先に確認する。

筋の良い案: v84 は headless が「勝敗」から「到達できた操作」に一段深く降りるための評価 diff とする。

### 採用案

`v05_1_cdx_v84` は v83 から派生し、gameplay は変更しない。`index.html` は version と history 表記だけを v84 causal slice 用に更新する。`review_packet.html` は `bot-perturbation-causal-slice-v001` の静的 packet にし、`tools/headless_graze_log_cdx_v05_2_v84_causal_slice_check.js` が causal slice を生成・assert する。

### 懸念

v84 は人間の「楽しい」を判定しない。`j4/lag4` が落ち、`j6/lag6` が通る理由を「j6が正しい」と断定しない。今回言えるのは、同 seed 比較で `j6` が late BOMB と clear へ到達し、`j4` はその手前で route coverage を失う、という再現可能な観測まで。

### 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v84_causal_slice_check.js
```

結果: pass。baseline route は seeds `12345 / 77777` の両方で clear。`j4/lag4` は両 seed で failure。`j6/lag6` は両 seed で clear。`causalSlicesBuilt`、`bombReachSplit`、`activeDefSplit`、`inputDivergenceVisible`、packet DOM、screenshot contract はすべて pass。raw evidence は `memory/raw/headless_eval/graze_log_cdx_bot_perturbation_causal_slice.jsonl` に追記した。
