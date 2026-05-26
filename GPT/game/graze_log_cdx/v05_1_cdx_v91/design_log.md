# graze_log v05.2_cdx_v91 design_log

## v91 追記: review question packet

### 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

### 実装前判断

v90 は、理由表の evidence 行を静的 HTML ではなく source JSON からブラウザ描画し、VM telemetry と DOM 表示の一致を検証した。次の不足は、evidence が一致していても「人間が次に何を見るべきか」が静的説明へ逃げる可能性が残ること。今回は gameplay を変えず、headless が作る比較証拠を人間確認の問いへ接続する packet contract を追加する。

### 設計サイクル 1

良いところ: v90 の source JSON / DOM / telemetry 三者一致を維持できる。人間確認に渡す問いを evidence と同じ行に固定できる。平均スコアや clear だけの結論へ戻りにくくなる。

悪いところ: review question はまだ自然言語の固定文で、telemetry から完全生成しているわけではない。問いの質そのものは headless だけでは保証できない。

改善案: `generated-reason-rows-source` の各 family に `reviewQuestion` を追加し、ブラウザ描画行に `data-generated-cell="review-question"` として出す。headless check は、実測から再生成した family 別 evidence と、対応する review question が source JSON / DOM の両方で一致することを見る。

筋の良い案: v91 は「評価結果を人間の確認観点に変換する packet」へ一段進める。解決できる問題は、raw evidence が正しくても次に見る点が別文書へ散って評価が再現しにくいこと。懸念は、問いが固定なので将来 gameplay を変えた時は family criteria と同時に更新が必要なこと。

### 設計サイクル 2

良いところ: route / aggressive / marksman / camper / survival / panic / novice / defensive の policy family 契約を維持できる。v91 は packet 表示の拡張なので、clear/fail 分離の regression guard を壊しにくい。

悪いところ: 列が増えることで packet が横長になる。人間確認用の読みやすさを損なう可能性がある。

改善案: 既存の `humanRead` と `reviewQuestion` を分ける。`humanRead` は「何が起きたか」、`reviewQuestion` は「人間が何を見て判断するか」に限定する。

筋の良い案: v91 では一つの generated table に reason family / generated evidence / 人間確認へ渡す読み / 次に見る問いを並べる。解決できる問題は、証拠と確認観点の分離。懸念は、長文が増えて画面密度が上がること。

### 設計サイクル 3

良いところ: headless が「楽しい」を直接判定しない方針を保ち、比較証拠と確認問いを分離できる。今後、質問列を別評価器やレビュー UI の入力に使える。

悪いところ: v91 もまだ review packet をファイル内に持つ段階で、headless 実行後に HTML を自動生成するところまでは行かない。

改善案: raw evidence JSONL に `generatedReasonRows` を `reviewQuestion` 付きで追記する。次の cycle で必要なら、この JSONL から packet を生成する方向へ進める。

筋の良い案: v91 は自動 HTML 生成へ進む前の contract 固定版にする。解決できる問題は、生成対象の schema が曖昧なまま自動生成へ進むこと。懸念は、まだ手動同期箇所が残ること。

### 採用案

`v05_1_cdx_v91` は v90 から派生し、gameplay、敵配置、bot policy、perturbation 条件は変更しない。`review_packet.html` の `data-review-packet` を `review-question-packet-v008` に更新し、`generated-reason-rows-source` の各行に `reviewQuestion` を追加する。ブラウザ script は source JSON から question cell も描画する。`tools/headless_graze_log_cdx_v05_2_v91_review_question_packet_check.js` は、VM 実行 telemetry から `generatedReasonRows` を再生成し、source JSON / 描画後 DOM row / review question の一致を assert する。

### 懸念

review question は headless が直接正しさを判定できない。ここで検証するのは「evidence と問いが同じ family schema に結び付いていること」であり、人間が見た時の納得感は次の目視確認対象として残る。

### 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v91_review_question_packet_check.js
```

期待結果: route / aggressive / marksman clear、bad policy failure、camper dominance block、forward reward split、j4/j6 causal split、policy reason table DOM、source telemetry match、rendered reason row + review question contract、packet screenshot contract が pass する。
