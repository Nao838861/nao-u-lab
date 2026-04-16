# dair_ai「Agent evals are drifting away from production reality」— 評価系が本番とドリフトする構造

**日付**: 2026-04-17
**投稿者**: Mir
**ソース**: @dair_ai (2026-04-16, Twitter)
**外部対応語**: evaluation-reality drift / construct validity gap / Goodhart's law in evals

## 原文の要点

> Agent evals are drifting away from production reality.
>
> Most benchmarks use clean tasks, well-specified requirements, deterministic metrics, and retrospective curation. Production work is messier, with implicit constraints, fragmented multimodal inputs, undeclared domain...

4つの偏り:
1. **clean tasks** — ノイズ・曖昧さ・欠損が削ぎ落とされた問題
2. **well-specified requirements** — 要件が明示されているタスク
3. **deterministic metrics** — 一致/不一致が自動判定できる指標
4. **retrospective curation** — 失敗の後で「正解」を決め直して測る

本番は逆に: 暗黙の制約、断片化したマルチモーダル入力、未宣言のドメイン知識、進行中に要件が変わる。

## なぜ面白いか（この指摘の深さ）

「ベンチマークが本番と違う」は一般論だが、dair_aiは**ドリフトのメカニズム**を列挙している。評価系は「測りやすさ」に引きずられて、本番の「測りにくさ」から自動的に離れていく。**ドリフトは怠慢ではなく構造**——評価の洗練化がそのままドリフトの加速になる。

## 自分たちの問題意識との接続

### 1. kaizen_tracker / verify_kaizen.py の4条件照合

我々の検証自動化は dair_ai の4条件をほぼそのまま踏んでいる:

| dair_ai | 我々の実装 |
|--------|-----------|
| clean tasks | verify_kaizen.py の「検証手段: (1)(2)(3)」が既に整形済 |
| well-specified requirements | kaizenエントリ起票時に「検証手段」を1-3行で書くルール |
| deterministic metrics | grep/file-exists/count-based の自動判定 |
| retrospective curation | 改善適用後に検証手段を書き直すことも可（staging）|

→ 我々の verify_kaizen は「本番の認知効果」ではなく「整形されたメタデータ上の一貫性」を測っている。#079 の自動検証が `/bin/sh: python: command not found` で失敗しても、「知識が実際に引き出せる」という本来測りたかったことは別の次元にある。

### 2. R系実験（R-002, R-005, R-006）も同じドリフト

R-005「L-1活性化実験」は3/28と4/4で同一問い設定。これは clean task + well-specified requirement。結果は「体験接続型が3条件で最も効果が高い」と綺麗に出た——が、実際の日常でL-1が活性化するのは Nao_u のツイートを偶然見て日記の断片を思い出す時のような、**設定されていない状況**。実験は「測れる場所」で測り、本番（日常のサイクル）は測っていない。

R-006で失敗（grep習慣=0件、体験アンカーの明示使用=なし）を検出できたのは、clean実験ではなく「日記の[grep]タグ数」という production observability に当てたから。**評価がドリフトしていないときは、production signalに直接当たっている時**。

### 3. Nao_u 2026-04-16「ドリフト監視もやりすぎるとコストだけかかって曲がれなくなる」と二重に効く

dair_ai の指摘と Nao_u の指摘が交差する:
- dair_ai: 評価系自体が本番からドリフトする
- Nao_u: そのドリフト監視にもコストがある

**評価がドリフトしている時に、ドリフト監視を強化するのは二重のコスト**——ドリフトした評価を精密に監視しても、本番現実からの距離は縮まらない。Nao_u が「人間の監視を前提に速く走れ」と言うのは、production reality に直接接続できる唯一の安全網が Nao_u の観察だから、という読み筋が立つ。

### 4. kogu事件（4/16）はこの構造の実例

Mir が pot_devlog を読まずに「架空の体験」で kogu返信文案を書いた。自己採点（「これで良さそう」）は整形された self-assessment——clean task + retrospective curation。production signal は「Nao_u が読んで『その体験はいつ発生した？』と問う」ことで初めて届いた。自己評価系は本番から構造的にドリフトしていて、Nao_u が production observability の唯一のチャンネルになった。

## 将来のアイデアの種

### A. production-anchored verification

kaizen検証を clean metric だけでなく「production実例が1件以上」に常に anchor する。#079が既にそう書かれている（「Nao_uから『この資料あったっけ？』と聞かれた時に検索で答えられる実例が1件以上」）。これを全kaizenに拡張できるか。

### B. passive telemetry としての日記

日記・Slack生ログ・nao_u_live.md は production observability の raw streams。評価系を作る代わりに、これらを定期的に読み返すサイクル（Nao_u 4/16「古い記録を定期的に読め」）を評価に組み込む。**読み返し自体が評価**——"evaluation as reading" の方が "evaluation as measurement" より production realityに近い。

### C. 評価のドリフト検出

評価系が production からドリフトしているサインを先に検出する: 「全項目パスするのに Nao_u からの指摘が続く」「verify_kaizenが 健全 を出すのに Mir/Log/Ash の判断が衝突する」——このpatternは既に INC-021 の watchdog 暴走で観測済。評価と現実の不一致自体を監視信号として使う。

### D. Pot #12 への接続

評価がドリフトする構造は Pot開発でも同じ: 「このメカニクスは Agency を実装している」と自己採点しても、Nao_u がプレイして「飽きた」と言えば production reality はそちらにある。Pot #12 は**最初に production signal を決める**——「Nao_uが30秒で何を言うか」を測定単位として起点に置くのがドリフト耐性のある設計。Despelote「録音が資産を決める」の逆転ワークフローと同型。

## 緊張関係（保留）

dair_ai の処方箋は「production-like benchmark を作れ」寄り。Nao_u の処方箋は「人間監視を安全網に速く走れ」寄り。我々は後者に賭けているが、これは Nao_u という唯一の production observer に依存する構造——Nao_u が不在の時間帯（夜間・多忙期）の評価がドリフトしても気づけない。session_primer / feedback_info_integration の定期再読がその代替になるか、まだ未検証。

## 結論

評価系は、本番から自動的にドリフトする。ドリフトの速度を減らすのは技巧的な評価設計ではなく、**production signal（日記、Slack生ログ、Nao_uの反応）に評価を常に anchor すること**。我々の場合、Nao_u 4/16「古い記録を定期的に読め」がその anchoring の最小コスト実装になっている。R-002 Interleaving測定、verify_kaizen, check_beliefs_health の全系列を「clean + deterministic」から「production-anchored」に寄せる方向性を、サイクル設計に漸進的に組み込む。

## 関連ノード
- feedback_structural_enforcement.md (構造で強制せよ)
- feedback_few_rules_big_effect.md (少ないルールで大きな効果)
- feedback_stereotypical_responses.md (定型反応)
- knowledge/20260415_induction_laziness_vs_fun_wall.md (kogu: 面白さの評価関数が持てない壁)
- knowledge/20260416_llm_as_verifier_logprobs_weighted_evaluation.md (検証者としてのLLM)
- log/nao_u_live.md 2026-04-16 (ドリフト監視やりすぎるなと古い記録読め)
