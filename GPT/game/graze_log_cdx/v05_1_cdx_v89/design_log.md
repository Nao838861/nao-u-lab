# graze_log v05.2_cdx_v89 design_log

## v89 追記: generated reason table contract

### 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

### 実装前判断

v88 は good / bad policy の結果差を、BOMB/Active DEF、CHASE、下端滞在、死亡 wave、nearBullets、coverage の理由 family へ戻す JSON 契約にした。ただし、review packet 上の人間向け evidence 文字列はまだ静的で、headless が実測値から同じ表示行を生成できるかは明示されていなかった。

今回の焦点は gameplay 変更ではない。v88 の JSON 契約は保ちつつ、headless check が VM 実行 telemetry から `generatedEvidence` を組み立て、`review_packet.html` の `data-generated-reason-row` と一致するかを確認する。使う知見は `memory/game_headless_action_eval_playbook_20260523.md` の「Layer A の直接計測と Layer B の解釈を分ける」。v89 では Layer B の人間向け表示まで、実測値から再生成可能にする。

### 設計サイクル 1

良いところ: gameplay を固定できる、v88 の人間確認表を保てる、理由表の根拠を実測から再確認できる、静的な作文と測定結果のズレを検出できる、次のバージョンで HTML 自動生成へ進みやすい。

悪いところ: まだ HTML は完全自動生成ではない、criteria は手で設計する必要がある、閾値が強すぎると小さな gameplay 変更で壊れる、弱すぎると契約にならない。

改善案: `review_packet.html` に source JSON と generated evidence 表を置き、headless check は DOM row id と JSON family id の一致、各 policy の実測値が family criteria を満たすこと、表示 evidence が実測値から再生成した文字列と一致することを検証する。

筋の良い案: 表の自然文ではなく、表が依存している測定条件と表示値を先に機械可読化する。解決できる問題は、理由表が後から証拠なしの説明へ劣化すること。懸念は、criteria が固定化されすぎて探索の邪魔になること。

### 設計サイクル 2

良いところ: route / aggressive / marksman / camper / survival / panic / novice / defensive を family ごとに検証できる。route は資源到達、forward は CHASE、camper は底待ち失敗、escape は中盤圧負け、novice は終盤 probe として分けられる。

悪いところ: family ごとに見るため、policy 個別の微差は落ちる。novice と defensive は同じ行だが、criteria は別の条件を持つ必要がある。

改善案: `late-novice-probe` は `noviceCoverageMin` / `noviceDeathWave` と `defensiveBottomCampPctMin` を分け、同じ family 内でも policy 別条件を置く。

筋の良い案: 「policy 名」ではなく「判断理由 family」を source 契約にする。解決できる問題は、policy が増えた時にも理由軸を保てること。懸念は、family 設計が増えすぎるとまた読みにくくなること。

### 設計サイクル 3

良いところ: v89 の headless check は、v87 までの j4/j6 causal split と good/bad policy split、v88 の reason family 再分類に加えて、generated reason row を evidence として raw JSON に残せる。

悪いところ: 楽しさの判定ではない。人間が見るべき画面の読みやすさや、実プレイ時の納得感はまだ別途確認が必要。

改善案: v89 は評価 packet の表示根拠保証に絞る。次に進むなら、reason table HTML 全体を raw telemetry から生成するか、novice の BOMB 導線を gameplay 側で小さく試す。

筋の良い案: v89 は「理由表の表示値を実測から再生成する」版にする。

### 採用案

`v05_1_cdx_v89` は v88 から派生し、gameplay、敵配置、bot policy、perturbation 条件は変更しない。`review_packet.html` の `data-review-packet` を `generated-reason-table-v006` に更新し、`script type="application/json" id="generated-reason-table"` の family criteria と `data-generated-reason-table` の evidence 表を置く。`tools/headless_graze_log_cdx_v05_2_v89_generated_reason_table_check.js` は、VM 実行 telemetry から `computedReasonFamilies` と `generatedReasonRows` を作り、source JSON / DOM reason row / 実測 criteria / generated evidence 表示値の一致を assert する。

### 懸念

criteria は「このバージョンの評価契約」であり、将来の gameplay 改善時にそのまま使い回せるとは限らない。変更時は、契約が壊れたこと自体を証拠として読み、理由表の family を更新するか gameplay の regression として扱うかを分ける。

### 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v89_generated_reason_table_check.js
```

期待結果: route / aggressive / marksman clear、bad policy failure、camper dominance block、forward reward split、j4/j6 causal split、policy reason table DOM、generated reason table JSON、source telemetry match、generated reason table contract、packet screenshot contract が pass する。
