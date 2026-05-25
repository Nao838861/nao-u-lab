# graze_log v05.2_cdx_v85 design_log

## v85 追記: trace table review packet

### 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

### 実装前判断

v84 は `j4/lag4` failure と `j6/lag6` clear を causal slice に分解し、同 seed の target divergence、late survival、Active DEF reach、BOMB reach を保存した。次の問題は、raw JSONL を読まないと人間確認に渡しにくいこと。今回は gameplay を変えず、v84 の評価結果を review packet 上の trace table に変換する。

使う知見は `memory/game_headless_action_eval_playbook_20260523.md` の「bad policy / good policy を平均に潰さない」、`memory/game_headless_eval_causality_lesson_20260523.md` の「原因を決める前に policy 比較」、および `memory/game_special_system_hud_affordance_lesson_20260525.md` の「特殊システムは発動可能性と意味を分ける」。

### 設計サイクル 1

良いところ: gameplay 固定、v84 からの差分が明確、raw JSONL と review packet の対応がある、seed と policy cell が見える、j4 failure と j6 clear を同じ表で読める、到達差と次に見る点を分ける、headless が DOM contract を検証できる、既存 screenshot packet を維持する、playable index を維持する、次回の人間確認に渡しやすい。

悪いところ: 楽しさ判定ではない、trace table は静的で live trace 全量ではない、route bot 固有、seed 2個中心、j6 が正しいとは言えない、j4 の失敗原因はまだ仮説、BOMB 到達差の良し悪しは別問題、gameplay 完成度は上がらない、mobile 目視は未実施。

改善案: review packet に `data-trace-table` を追加、4行の代表 trace row を置く、headless check で row contract を assert、raw evidence は v85 専用 JSONL に保存、README / devlog / directive / staging を更新する。

筋の良い案: v85 は「評価器が見た差を人間が同じ画面で読む」ための diff とする。解決できる問題は、次回以降に gameplay 変更へ進む前に、どの観測差を見ているのかを共有しやすくなること。懸念は、表が分かりやすくなっても原因断定ではないこと。

### 設計サイクル 2

良いところ: `data-review-packet="bot-perturbation-trace-table-v002"` で v84 と区別できる、trace row ごとに seed / policy / 結果 / window の読み / 到達差 / 次に見る点が分かれる、screenshot と DOM dump の両方で存在確認できる。

悪いところ: raw trace の全フレームは載せない、iframe の代表 frame は補助に留まる、数値 table の自動生成ではなく静的要約、検証 script と packet の二重管理になる。

改善案: 静的 table は契約面に絞り、詳細値は JSONL に残す。headless check は gameplay assertion と packet assertion を同時に通す。次回は必要なら JSONL から table を生成する。

筋の良い案: 今回は「静的で読める packet」を優先する。解決できる問題は、人間確認時に raw JSONL を開かずに比較の軸を理解できること。懸念は、静的 table が古くならないよう version ごとに切ること。

### 設計サイクル 3

良いところ: continuous directive に沿う、headless のあり方検証、playable diff あり、focused evaluation あり、design_log あり、devlog あり、README あり、raw evidence あり、screenshot あり、DOM contract あり、gameplay 非変更、commit 単位が明確。

悪いところ: Nao_u 実評価待ち、route 以外の policy には未展開、trace table の自動生成は未実装、完成判定ではない。

改善案: 次回は trace table を good / bad policy 全体へ拡張するか、gameplay 変更に入る前の人間確認 packet として使う。

筋の良い案: v85 は headless が「勝敗」から「人間に渡せる観測差」へ進むための評価 diff とする。

### 採用案

`v05_1_cdx_v85` は v84 から派生し、gameplay は変更しない。`index.html` は version と history 表記だけを v85 trace table 用に更新する。`review_packet.html` は `bot-perturbation-trace-table-v002` の packet にし、`tools/headless_graze_log_cdx_v05_2_v85_trace_table_check.js` が causal slice と trace table DOM を assert する。

### 懸念

v85 は人間の「楽しい」を判定しない。`j4/lag4` が落ち、`j6/lag6` が通る理由を「j6 が正しい」と断定しない。今回言えるのは、同 seed 比較で `j6` が late BOMB と clear へ到達し、`j4` はその手前で route coverage を失う、という観測を人間確認用に読める形へ変換したことまで。

### 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v85_trace_table_check.js
```

結果: pass。baseline route は seeds `12345 / 77777` の両方で clear。`j4/lag4` は両 seed で failure。`j6/lag6` は両 seed で clear。`causalSlicesBuilt`、`bombReachSplit`、`activeDefSplit`、`inputDivergenceVisible`、packet DOM、trace table DOM、screenshot contract はすべて pass。raw evidence は `memory/raw/headless_eval/graze_log_cdx_bot_perturbation_trace_table.jsonl` に追記した。
