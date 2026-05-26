# graze_log v05.2_cdx_v90 design_log

## v90 追記: rendered reason packet

### 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

### 実装前判断

v89 は good / bad policy の実測値から generated evidence 文字列を再生成し、`review_packet.html` の表示値と一致するかを検証した。ただし、表示表の `<tr>` はまだ静的 HTML だった。今回の焦点は gameplay 変更ではなく、評価 packet の生成経路を一段厳しくすること。`memory/game_headless_action_eval_playbook_20260523.md` の「直接計測と解釈を分ける」を使い、実測から作る source JSON、ブラウザで描画される DOM、人間確認用表示の一致を検証する。

### 設計サイクル 1

良いところ: gameplay を固定できる、v89 の policy family 契約を保てる、静的 HTML 行の作文劣化を検出できる、次に完全自動生成へ進む準備になる。

悪いところ: source JSON の値はまだファイル内に埋め込む必要がある。headless 実行後に review packet 自体を生成する段階ではない。

改善案: generated reason rows の `<tbody>` を空にし、`generated-reason-rows-source` JSON からブラウザ側 script が行を生成する。headless check は静的 HTML 内に `data-generated-reason-row` がないこと、dump-dom 後には同じ行が生成されること、実測値から再生成した evidence と一致することを assert する。

筋の良い案: v90 は「DOM 表示を source JSON から生成する」版にする。解決できる問題は、評価 packet が人間向け静的表へ戻ってしまうこと。懸念は、JSON source 自体の生成はまだ手作業なこと。

### 設計サイクル 2

良いところ: route / aggressive / marksman / camper / survival / panic / novice / defensive の分類軸は v89 のまま維持できる。v90 の差分は packet rendering contract に限定できる。

悪いところ: table rendering の検証に Chrome dump-dom が必要で、VM 単体検証より遅い。ブラウザ script の失敗は gameplay ではなく packet 生成失敗として扱う必要がある。

改善案: `renderedRowsSource` を headless report に含め、raw evidence にも source と生成結果を残す。将来壊れた時に gameplay failure と packet rendering failure を分ける。

筋の良い案: v90 の headless check は、source JSON、DOM row、VM telemetry の三者一致だけを見る。

### 採用案

`v05_1_cdx_v90` は v89 から派生し、gameplay、敵配置、bot policy、perturbation 条件は変更しない。`review_packet.html` の `data-review-packet` を `rendered-reason-packet-v007` に更新し、`generated-reason-rows-source` JSON と空の `generated-reason-table-body` を置く。ブラウザ script は source JSON から `data-generated-reason-row` 行を描画する。`tools/headless_graze_log_cdx_v05_2_v90_rendered_reason_packet_check.js` は、VM 実行 telemetry から `computedReasonFamilies` と `generatedReasonRows` を作り、source JSON / 描画後 DOM row / 実測 criteria / generated evidence 表示値の一致を assert する。

### 懸念

criteria は「このバージョンの評価契約」であり、将来の gameplay 改善時にそのまま使い回せるとは限らない。変更時は、契約が壊れたこと自体を証拠として読み、reason family を更新するか gameplay regression として扱うかを分ける。

### 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v90_rendered_reason_packet_check.js
```

期待結果: route / aggressive / marksman clear、bad policy failure、camper dominance block、forward reward split、j4/j6 causal split、policy reason table DOM、source telemetry match、rendered reason row contract、packet screenshot contract が pass する。
