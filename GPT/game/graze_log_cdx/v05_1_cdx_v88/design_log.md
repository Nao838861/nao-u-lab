# graze_log v05.2_cdx_v88 design_log

## v88 追記: policy reason source contract

### 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

### 実装前判断

v87 は good / bad policy の結果差を、BOMB/Active DEF、CHASE、下端滞在、死亡 wave、nearBullets、coverage の理由表へ分解した。ただし、その理由表は review packet 上の静的な説明で、headless が再実行した telemetry から同じ分類を再構成できるかは明示されていなかった。

今回の焦点は gameplay 変更ではない。v87 の理由表を `policy-reason-source` JSON 契約として packet 内に埋め、headless check が VM 実行 telemetry から family 判定を作り直して、DOM の reason row と一致するかを確認する。使う知見は `memory/game_headless_action_eval_playbook_20260523.md` の「Layer A の直接計測と Layer B の解釈を分ける」。v88 では Layer A から Layer B へ上げる条件を JSON に残す。

### 設計サイクル 1

良いところ: gameplay を固定できる、v87 の人間確認表を保てる、理由表の根拠を実測から再確認できる、静的な作文と測定結果のズレを検出できる、次のバージョンで自動生成へ進みやすい。

悪いところ: まだ HTML は完全自動生成ではない、criteria は手で設計する必要がある、閾値が強すぎると小さな gameplay 変更で壊れる、弱すぎると契約にならない。

改善案: `review_packet.html` に source JSON を置き、headless check は DOM row id と JSON family id の一致、各 policy の実測値が family criteria を満たすことを検証する。

筋の良い案: 表の自然文ではなく、表が依存している測定条件を先に機械可読化する。解決できる問題は、理由表が後から証拠なしの説明へ劣化すること。懸念は、criteria が固定化されすぎて探索の邪魔になること。

### 設計サイクル 2

良いところ: route / aggressive / marksman / camper / survival / panic / novice / defensive を family ごとに検証できる。route は資源到達、forward は CHASE、camper は底待ち失敗、escape は中盤圧負け、novice は終盤 probe として分けられる。

悪いところ: family ごとに見るため、policy 個別の微差は落ちる。novice と defensive は同じ行だが、criteria は別の条件を持つ必要がある。

改善案: `late-novice-probe` は `noviceCoverageMin` / `noviceDeathWave` と `defensiveBottomCampPctMin` を分け、同じ family 内でも policy 別条件を置く。

筋の良い案: 「policy 名」ではなく「判断理由 family」を source 契約にする。解決できる問題は、policy が増えた時にも理由軸を保てること。懸念は、family 設計が増えすぎるとまた読みにくくなること。

### 設計サイクル 3

良いところ: v88 の headless check は、v87 までの j4/j6 causal split と good/bad policy split に加えて、reason source から再分類した結果を evidence として raw JSON に残せる。

悪いところ: 楽しさの判定ではない。人間が見るべき画面の読みやすさや、実プレイ時の納得感はまだ別途確認が必要。

改善案: v88 は評価 packet の根拠保証に絞る。次に進むなら、reason table 自体を raw telemetry から生成するか、novice の BOMB 導線を gameplay 側で小さく試す。

筋の良い案: v88 は「理由表を測定契約に戻す」版にする。

### 採用案

`v05_1_cdx_v88` は v87 から派生し、gameplay、敵配置、bot policy、perturbation 条件は変更しない。`review_packet.html` の `data-review-packet` を `policy-reason-source-trace-table-v005` に更新し、`script type="application/json" id="policy-reason-source"` に family criteria を埋める。`tools/headless_graze_log_cdx_v05_2_v88_policy_reason_source_check.js` は、VM 実行 telemetry から `computedReasonFamilies` を作り、source JSON / DOM reason row / 実測 criteria の一致を assert する。

### 懸念

criteria は「このバージョンの評価契約」であり、将来の gameplay 改善時にそのまま使い回せるとは限らない。変更時は、契約が壊れたこと自体を証拠として読み、理由表の family を更新するか gameplay の regression として扱うかを分ける。

### 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v88_policy_reason_source_check.js
```

期待結果: route / aggressive / marksman clear、bad policy failure、camper dominance block、forward reward split、j4/j6 causal split、policy reason table DOM、policy reason source JSON、source telemetry match、packet screenshot contract が pass する。
