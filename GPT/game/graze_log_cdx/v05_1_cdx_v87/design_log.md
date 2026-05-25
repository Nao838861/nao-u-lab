# graze_log v05.2_cdx_v87 design_log

## v87 追記: policy reason review packet

### 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

### 実装前判断

v86 は good policy / bad policy の比較表を作った。ただし「route / aggressive / marksman が clear」「camper / survival / panic / defensive / novice が fail」という結果だけでは、人間確認時に「なぜそうなったか」を packet 内で追いにくい。今回の焦点は gameplay 変更ではなく、同じ headless 結果を、BOMB/Active DEF 到達、CHASE 報酬、下端滞在、死亡 wave、nearBullets、coverage に分解して、次の gameplay 判断へ渡せる形にすること。

使う知見は `memory/game_headless_action_eval_playbook_20260523.md` の「失敗 policy を数値で露出させる」「合格条件は良い bot が勝ち、悪い bot が失敗する」、および継続 directive の「headless は楽しいを直接判定しない。比較証拠として使う」。

### 設計サイクル 1

良いところ: gameplay を固定できる、v86 の policy split を維持できる、good/bad の二値を理由へ分解できる、camper の失敗理由を底待ち支配戦略の否定として読める、novice の終盤失敗を次の候補として残せる。

悪いところ: 表はまだ静的記述、raw telemetry から自動生成していない、gameplay 改善は入らない、packet が長くなる。

改善案: `policy outcome reason table` を追加し、route / forward / bottom denied / escape pressure / late novice probe の 5 行で分ける。

筋の良い案: 勝敗表の直後に reason table を置く。解決できる問題は、平均スコア化と good/bad 二値化。懸念は、人間確認前の資料が増えすぎること。

### 設計サイクル 2

良いところ: route は BOMB/Active DEF 到達、aggressive/marksman は CHASE 報酬、camper は wave 10 の下端失敗、survival/panic は wave 13 の圧負け、novice は wave 31 の終盤失敗として分かれる。

悪いところ: defensive は camper と似た下端寄り失敗で、独立した価値が薄い。survival と panic も同じ wave で落ちるため、表を細分化しすぎると読みづらい。

改善案: defensive は novice と同じ行に置き、次回の分岐候補として扱う。survival/panic は「逃げ続ける/乱れる方針」のまとめ行にする。

筋の良い案: policy 名単位ではなく、成功/失敗理由の family 単位でまとめる。解決できる問題は表の過密化。懸念は個別 policy の差が薄くなること。

### 設計サイクル 3

良いところ: v87 の headless check は DOM 契約だけでなく、reason evidence も assert できる。人間確認に渡す仮説を table に明示できる。

悪いところ: 「楽しい」の判定ではない。reason table が正しくても、画面上の読みやすさは最終的に人間確認が必要。

改善案: v87 は評価面の playable diff とし、次回は novice の BOMB 導線調整か、reason table 自動生成へ進む。

筋の良い案: v87 は「勝敗表から判断理由表へ一段進める」版にする。

### 採用案

`v05_1_cdx_v87` は v86 から派生し、gameplay は変更しない。`index.html` は version と history 表記だけ更新する。`review_packet.html` に `data-policy-reason-table="policy-outcome-reasons"` を追加する。`tools/headless_graze_log_cdx_v05_2_v87_policy_reason_check.js` は v86 の j4/j6 causal slice、good/bad policy split、DOM contract に加え、reason table DOM と reason evidence を assert する。

### 懸念

v87 も「楽しい」の自動判定ではない。今回言えるのは、headless が見た勝敗差を、次に人間が確認すべき理由へ分解したことまで。

### 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v87_policy_reason_check.js
```

結果: pass。route / aggressive / marksman clear、bad policy failure、camper dominance block、forward reward split、j4/j6 causal split、policy reason table DOM、reason evidence、packet screenshot contract が通った。raw evidence は `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl` に追記した。
