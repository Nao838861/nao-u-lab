# graze_log v05.2_cdx_v86 design_log

## v86 追記: policy contrast review packet

### 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

### 実装前判断

v85 は `j4/lag4` failure と `j6/lag6` clear の差を trace table にした。ただし対象は route bot の摂動比較に偏っていた。今回の焦点は gameplay 変更ではなく、同じ review packet に good policy と bad policy の差を載せ、単一 bot の clear や平均スコアで判断しない headless evidence にすること。

使う知見は `memory/game_headless_action_eval_playbook_20260523.md` の「良い bot が勝ち、悪い bot が失敗する」、および `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の「headless は楽しいを直接判定しない。coverage / pressure / movement / event trace / policy split を人間評価前の比較証拠として使う」。

### 設計サイクル 1

良いところ: gameplay を固定できる、v85 の causal slice regression guard を残せる、route 以外の policy split が同じ画面で見える、camper failure を継続確認できる、aggressive / marksman の前進報酬が見える、novice と defensive の失敗位置を分けられる、headless check で DOM 契約と gameplay 契約を同時に検証できる。

悪いところ: 人間の楽しさ判定ではない、static table は自動生成ではない、seed は 2 個中心、policy 名は評価器都合であり人間プレイそのものではない、gameplay 改善は入らない。

改善案: v86 では review packet に `data-policy-table="good-bad-policy-contrast"` を追加し、route / aggressive / marksman / camper / survival / panic / defensive / novice の読み方を分ける。headless check は good policy clear、bad policy failure、camper 支配戦略の不成立、前進方針への CHASE 報酬を assert する。

筋の良い案: route 摂動差分を残したまま、policy split の表を足す。解決できる問題は、v85 が route-only に見えること。懸念は、表が増えて review packet が長くなること。

### 設計サイクル 2

良いところ: camper は bottomCampPct 0.999 / coverage 0.313 / CHASE 0 と明確に失敗する。aggressive / marksman は clear し、CHASE が 100 件以上出る。route は標準 clear guard として残る。

悪いところ: novice は coverage 0.969 まで進むため、単なる bad policy として潰すだけではもったいない。defensive は bottom 滞在が高く、camper と似た失敗に見える。survival / panic は早めに落ちる。

改善案: table の「人間確認へ渡す問い」に、初心者の失敗位置が次の調整候補になるかを残す。bad policy failure を喜ぶだけでなく、どの失敗が有用な調整候補かを分ける。

筋の良い案: policy を good/bad の二値で終えず、route guard、前進報酬、底待ち失敗、逃げ失敗、初心者終盤失敗として分ける。解決できる問題は、平均点化と過剰単純化。懸念は、評価軸が増えて次の playable change が遅くなること。

### 設計サイクル 3

良いところ: continuous directive の主眼である headless のあり方検証に合う。playable index は維持される。review packet はブラウザで開ける。focused check は Chrome screenshot、DOM contract、VM gameplay run をすべて見る。

悪いところ: 敵配置や演出は改善しない。Nao_u の実プレイ判断はまだ必要。policy table は静的要約なので、次に gameplay を変えた時は再生成または再記述が必要。

改善案: v86 は評価面の playable diff とし、次回はこの policy table を見て gameplay 変更へ進むか、novice failure の終盤を別 packet にする。

筋の良い案: v86 は「headless がどの方針を通し、どの方針を落としているか」を人間が 1 画面で確認するための版にする。

### 採用案

`v05_1_cdx_v86` は v85 から派生し、gameplay は変更しない。`index.html` は version と history 表記だけ更新する。`review_packet.html` に policy contrast table と camper/aggressive の追加 iframe を載せる。`tools/headless_graze_log_cdx_v05_2_v86_policy_contrast_check.js` は v85 の j4/j6 causal slice に加え、good policy clear / bad policy failure / camper block / forward reward split / DOM contract を assert する。

### 懸念

v86 も「楽しい」の自動判定ではない。今回言えるのは、底待ちや逃げ続ける方針が通らず、前へ出る方針と route 方針が通るという headless evidence を、人間確認用 packet に載せたことまで。

### 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v86_policy_contrast_check.js
```

結果: pass。route / aggressive / marksman は seeds `12345 / 77777` で clear。camper / survival / panic / defensive / novice は failure。camper は `bottomCampPct > 0.98` かつ `CHASE 0`。aggressive / marksman は `CHASE > 100` かつ bottom 滞在が低い。raw evidence は `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl` に追記した。
