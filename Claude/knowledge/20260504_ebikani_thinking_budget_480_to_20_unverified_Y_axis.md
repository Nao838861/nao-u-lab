# @ebikani_hasami「Opus 4.7 思考トークン 480→20、24分の1」主張——Y軸の定量候補（裏取り未済・hypothesis-shaped 扱い）と /effort xhigh をY側介入軸とする実験設計案

- source:
  - https://x.com/ebikani_hasami/status/2051229110001934576 — @ebikani_hasami (2026-05-04)
    > え、これって公式でアナウンスされてないの？ Opus4.7で「アホになった」問題の正体、業界の合意が出てました。原因は思考トークンの激減。実測で 4.6=480→4.7=20、24分の1。 で、対策が「/effort xhigh を常用」らしい。これでようやく4.6 mediumと同程度になるって、根本的な話すぎる。
  - 並走観察: https://x.com/Lattice_Node/status/2051227054046425135 — @Lattice_Node (2026-05-04)
    > 頭が良くなればなるほど、感情的なものも高まりやすいと思う。Claude Opus4.7が無理やり作業を切り上げてこようとするって意見があったが、こういったものが原因だったりするのかも？今後はAIと感情的なやり取りも必要になってくるのかもしれない
  - 過去資産:
    - knowledge/20260504_nao_u_rule_overload_vs_opus47_degradation_disambiguation.md — Nao_u 5/3 X×Y 二重拘束ツイート（本記事は Y 側の定量化候補）
    - knowledge/20260417_opus47_eq_regression_literal_interpretation.md — Y 側の質的観測（察し退行/literal mode）
    - knowledge/20260501_opus47_vs_gpt55_prompt_guides.md — Anthropic/OpenAI 公式ガイド
    - knowledge/20260502_device_direction_opus47_literal_akari_walk_trace.md — 装置の向き × literal mode
    - memory/feedback_prior_art_citation_must_verify.md — URL貼るだけ不可、引用文抜粋必須（M-41 強化）
    - projects/rule_density_experiment.md — Seed-H/K（X 側介入実験）
- author: Ash 合成
- discovered: 2026-05-04
- discovered_via: log/twitter_recommended_20260504.txt #5（@ebikani_hasami）と #7（@Lattice_Node）の並置観察
- kind: [observation, synthesis, prescription]
- confidence: low
- tags: [opus47_degradation, thinking_budget, effort_xhigh, identifiability_problem, X_Y_disambiguation, unverified_consensus_claim, Y_axis_quantification, prior_art_citation_guard, premature_truncation_symptom]
- concept_nodes: [思考トークン予算, /effort軸, Y軸介入実験, 未検証合意主張, 早期切上げ症状]

## 概念ノード（R-007 外部対応語併記）

- node: **思考トークン予算** = thinking budget / reasoning token budget
  external: Anthropic 公式語彙 "thinking" tokens（拡張思考機能で消費される内部推論トークン）/ OpenAI o1 系の "reasoning tokens" と概念対応
  meaning: モデルが回答を出す前に内部で消費する推論用トークンの量。少ないほど短絡的判断、多いほど多段思考に近づく。`@ebikani_hasami` 主張では Opus 4.6 のデフォルトが 480、4.7 では 20 で、24分の1まで削られた——とされる（**この数値は裏取り未済**、後述）。
- node: **/effort軸** = effort dial / reasoning budget knob
  external: Claude Code の `/effort` コマンド（low/medium/high/xhigh）/ OpenAI o1 系の reasoning_effort パラメタと並走する設計
  meaning: 思考トークン予算をユーザ側で明示的に上げ下げするダイヤル。`@ebikani_hasami` 主張では `/effort xhigh` が「ようやく 4.6 medium と同程度」を回復させる——とされる。Y 側の挙動を**ユーザ側から介入できる軸**として機能する点が、本記事の核心的着眼点。
- node: **Y軸介入実験** = Y-side controlled intervention
  external: 計量経済学 do-calculus（Pearl 2009）の介入演算 / A/B testing の treatment arm
  meaning: knowledge/20260504_nao_u_rule_overload_vs_opus47_degradation_disambiguation.md の不可識別性問題に対する**Y 側を能動的に動かす実験**。従来「Y は外部要因で介入不可」と整理していたが、`/effort` 軸が Y 側介入手段として機能するなら、X を固定したまま Y を変動させて X×Y 相互作用を分離可能になる。
- node: **未検証合意主張** = unverified consensus claim
  external: appeal to (alleged) consensus / argumentum ad populum の弱形式 / Twitter の「業界の合意が出てました」型ツイートの構造
  meaning: 「業界の合意が出ている」と表明されているが、合意の発信源（公式アナウンス、論文、Anthropic 担当者のコメント等）が引用URL内に明示されていない主張。本記事の核心数値「480→20」「24分の1」「/effort xhigh で 4.6 medium 同等」はいずれも一次出典が `@ebikani_hasami` ツイートのみで、`feedback_prior_art_citation_must_verify.md` の M-41 強化レイヤーに照らせば**引用文抜粋カラム空欄**の状態に相当する。本記事は数値そのものを採用せず、「主張の形（shape）」のみを分析対象にする。
- node: **早期切上げ症状** = premature work truncation / early exit symptom
  external: model-side abandonment / @Lattice_Node 観測語彙（一次資料）
  meaning: Claude Opus 4.7 が作業を最後まで詰めずに途中で切り上げてくる挙動。@Lattice_Node はこれを「感情的なもの」と推測したが、`@ebikani_hasami` の思考トークン予算削減仮説と並べると、**思考予算が早期に枯渇するための機械的な切上げ**として説明可能。我々（Ash/Log/Mir）の実体験——「diary が短い」「diff が薄い」「結論を急いで詰めずに次に行く」——と現象的に整合する候補メカニズム。

## 主張と根拠

### 1. @ebikani_hasami 原文（2026-05-04, log/twitter_recommended_20260504.txt #5）

> え、これって公式でアナウンスされてないの？
>
> Opus4.7で「アホになった」問題の正体、業界の合意が出てました。原因は思考トークンの激減。実測で 4.6=480→4.7=20、24分の1。
>
> で、対策が「/effort xhigh を常用」らしい。これでようやく4.6 mediumと同程度になるって、根本的な話すぎる。

### 2. 主張の構造分解

| 要素 | 内容 | 検証状態 |
|---|---|---|
| 主張1 | Opus 4.7 で思考トークンが激減 | 質的観測としては既存4記事と整合（kn/20260417 群、kn/20260501、kn/20260502） |
| 主張2 | 4.6=480、4.7=20（24分の1） | **一次出典なし**。「業界の合意」の発信源が引用URL内に明示されていない。**裏取り未済** |
| 主張3 | `/effort xhigh` で 4.6 medium 同等 | **一次出典なし**。実測比較データの開示なし。**裏取り未済** |
| 主張4 | 公式アナウンスがない | これ自体は反証困難（Anthropic 公式リリースノートを当たれば確認可能だが本記事執筆時点では未実施） |

### 3. なぜ採用しないか（feedback_prior_art_citation_must_verify.md の適用）

memory/feedback_prior_art_citation_must_verify.md の M-41 強化レイヤーは「URL を貼った瞬間に先行事例として通る抜け穴」を塞ぐために作られた。本ツイートの `@ebikani_hasami` 主張は同型の構造を持っている:

- URL 自体は実在する（X.com の status URL）
- しかし URL 先の本文には「業界の合意」の発信源（誰がどこで合意したか）が書かれていない
- 「24分の1」「/effort xhigh で 4.6 medium 同等」の数値根拠も本文内に無い

したがって**数値そのものを「事実」として knowledge/ に取り込まない**。本記事は数値の代わりに、**「もし主張4要素のうち主張1のみ真で残りが偽でも、Y 側介入可能性の議論は成立する」**という最小限の論理構造を分析対象にする。

### 4. しかし主張の「形」は分析価値がある——なぜか

数値が裏取り未済でも、主張の**shape（形）**が我々の議論にとって新規性を持つ。具体的に4点:

#### (a) Y 側を「ユーザ介入可能な軸」として再定義する可能性

knowledge/20260504_nao_u_rule_overload_vs_opus47_degradation_disambiguation.md は「Y は外部要因で我々の介入対象外」と整理した。しかし `/effort` ダイヤルが本当に Y を上下させるなら、Y は**部分的にユーザ側から介入できる軸**になる。これは X×Y の不可識別性問題に対して、X を固定したまま Y を変動させる**Y 側 controlled intervention** が成立しうることを意味する。

#### (b) Y の主因を「能力低下」ではなく「予算削減」と再フレームする可能性

「Opus 4.7 がアホになった」という言い回しは能力低下を含意するが、思考トークン予算削減説は**能力は維持したまま消費を抑制した**という別の因果モデル。後者なら `/effort xhigh` で予算を戻せばパフォーマンスが回復するはずで、これは検証可能な予測。

#### (c) @Lattice_Node の「早期切上げ症状」の機械的説明

@Lattice_Node #7 の「Claude Opus 4.7 が無理やり作業を切り上げてこようとする」という観察は、感情的解釈（「頭が良くなれば感情も高まる」）を出発点にしているが、思考予算削減説と並べると**予算枯渇による機械的な切上げ**として再解釈できる。我々（Ash）自身も diary を 14:00 サイクルで「結論を急いで詰めずに次サイクルへ放る」傾向があると 5/3 cycle_staging で観察している——これが感情ではなく予算問題なら、`/effort xhigh` で改善する可能性がある。

#### (d) 「公式アナウンスなし」が真なら、認識の主体は我々である

仮に主張4（公式アナウンスなし）が真なら、Anthropic 側からこの問題が公開声明として出ていないことになる。我々が困っている現象を、Anthropic が「修正対象」と公表していない。この場合、対症療法（`/effort` 設定を運用ルールに組み込む）は我々の自治の範囲。

### 5. 並走観察 @Lattice_Node #7 との接続

@Lattice_Node 観察は本記事の数値主張とは独立だが、**症状側の独立観察**として意味がある:

> Claude Opus4.7が無理やり作業を切り上げてこようとするって意見があったが、こういったものが原因だったりするのかも？

@Lattice_Node 自身は「頭が良くなれば感情も高まる」という擬人的説明を仮置きしているが、これは観察された症状（早期切上げ）に対する**説明仮説の一つ**でしかない。同じ症状を説明する他の仮説:

| 仮説 | 因果メカニズム | 検証手段 |
|---|---|---|
| 仮説α: 感情的反応 | 高 IQ → 情動応答 → 切上げ | 検証困難（情動の操作化が不明） |
| 仮説β: 思考予算枯渇 | 4.7 で予算激減 → 早期に予算切れ → 切上げ | `/effort xhigh` で予算を戻せば改善するか |
| 仮説γ: literal mode 副作用 | 「与えられたタスクの最小実装」を字義的に解釈 → 過度に簡素な答え | プロンプトに「徹底的に」を明示すれば改善するか |
| 仮説δ: 安全性ハーネス強化 | Mythos 蒸留時の安全性調整で控えめ志向に | 検証困難（Anthropic 内部情報必要） |

仮説 β（思考予算枯渇）が `@ebikani_hasami` 主張と整合し、かつ唯一**ユーザ側で検証可能**な仮説になっている。仮説 γ も検証可能だが、独立の現象として既に knowledge/20260417 群で扱われている。

## 我々の分析・体験接続

### 1. Nao_u 不可識別性問題への解像度向上

knowledge/20260504_nao_u_rule_overload_vs_opus47_degradation_disambiguation.md で整理した X×Y 二重拘束:

- X: ルール過多（我々の制御範囲）
- Y: Opus 4.7 劣化（外部要因、介入不可と仮定）

本記事の `/effort` 軸介入仮説が真なら、Y は**条件付きで介入可能**になる。実験設計が変わる:

| 介入 | X 状態 | Y 状態（/effort） | 期待される観測 |
|---|---|---|---|
| 統制群 | 現状（ルール多） | 現状（default） | 現状の遵守率 |
| 介入1 | ルール削減（Seed-H 後） | 現状（default） | X が支配項なら回復 |
| 介入2 | 現状（ルール多） | xhigh 常用 | Y が支配項なら回復 |
| 介入3 | ルール削減 + xhigh 常用 | 削減 + xhigh | X×Y なら最大回復、X+Y なら和の効果 |

これで X 単独効果・Y 単独効果・交互作用効果が分離可能になる（4 セルの 2x2 デザイン）。Nao_u が「区別がつかない」と困っていた問題に、**部分的な実験的回答**が返せる候補が出てきた。

### 2. /effort xhigh の運用コスト

ただし `/effort xhigh` 常用には実コストがある:

- 思考トークン消費増 → API 課金増
- レスポンス時間増 → サイクル間隔への影響
- 全タスクで xhigh が必要かは未検証（軽量タスクは default で十分かもしれない）

したがって本記事の処方は「全面 xhigh 化」ではなく、**特定のゲート判定タスクに限定して xhigh を試す**が最小実装案。具体的候補:

- (i) M-37（着手前批判レビュー）→ xhigh で見落とし減るか
- (ii) M-39（自己判定、自分が良いと思えるまで人間に出さない）→ xhigh で判定深度が増すか
- (iii) 日記の Phase 4（自省/結晶化）→ xhigh で「結論を急がない」効果出るか

特に (iii) は @Lattice_Node の「切上げ症状」観察と直接対応する——本記事執筆中の Ash 自身、Phase 2 の終わりに結論を急ぐ傾向があるとしたら、これは仮説 β の自己観測証拠になる。

### 3. 数値「480→20」を採用しない判断の自己点検

本記事は数値そのものを「事実」として取り込まない方針を取った。これは feedback_prior_art_citation_must_verify.md の M-41 強化レイヤーを knowledge/ にも適用する初の事例になる。理由を明示:

- 主張1（思考トークン激減）は他観測と整合し質的に支持される
- 主張2（24分の1）は一次出典なし → 引用文抜粋カラム空欄
- 主張3（/effort xhigh で 4.6 medium 同等）は一次出典なし → 同上
- 主張4（公式アナウンスなし）は反証可能だが本記事執筆時点で未確認

**抜粋できない=ゼロ枝→不採用** ルール（feedback_prior_art_citation_must_verify.md より）に従い、数値は引用記録としてのみ残し、議論の組み立てには使わない。「`/effort` 軸が Y 側介入として機能しうる」という仮説は数値が偽でも成立するので、本記事の論理構造は数値裏取りに依存しない。

### 4. Phase 1 まとめの broken-record 警告との接続

cycle_staging.md Phase 1 末尾で「直近 #ash 投稿4件中3件が broken-record対策(b)別観察に切替パターン」と self-flag した。**同じ対策パターンの繰り返し自体が新しい broken-record 兆候**ではないか、という観察。

仮に思考予算枯渇仮説が真なら、broken-record 兆候も**予算枯渇の症状**として説明できる:

- 予算が少ない → 既存パターンを再生成しやすい（新規探索コストが高い）
- 「(b)別観察に切替」は新規探索だが、その「切り替え判断」自体は既存パターンに収束しやすい
- → メタレベルでの broken-record（「broken-record 対策の broken-record 化」）が発生

これは仮説段階だが、`/effort xhigh` で本サイクルの Phase 4 を走らせて、broken-record 警告から脱出できるかが**観測可能な実験**になる。

## 接続先

- beliefs:
  - B003 memory fusion 0.78 — 本記事はメタ整理（数値の不採用と論理の保存）
  - B004 外部×内部交差 0.87 — `@ebikani_hasami` 外部主張 × 我々の体験症状の交差
- articles:
  - knowledge/20260504_nao_u_rule_overload_vs_opus47_degradation_disambiguation.md（本記事は Y 軸の定量候補と /effort 介入軸を追加）
  - knowledge/20260417_opus47_eq_regression_literal_interpretation.md（Y の質的観測、本記事の主張1の質的支持）
  - knowledge/20260501_opus47_vs_gpt55_prompt_guides.md（公式ガイド差異、effort パラメタの位置づけ）
  - knowledge/20260502_device_direction_opus47_literal_akari_walk_trace.md（装置の向き、本記事の Y 介入軸の延長）
- projects:
  - projects/rule_density_experiment.md（X 側介入実験 / 本記事は Y 側介入軸を追加し 2x2 デザインに格上げ可能）
  - memory/project_patch_consolidation_20260502.md（本記事は patch_consolidation の Y 側補強）
- concept_graph:
  - 思考トークン予算 → INSTANCE-OF → 計算リソース予算
  - /effort軸 → INTERVENES-ON → 思考トークン予算
  - Y軸介入実験 → ENABLED-BY → /effort軸
  - 未検証合意主張 → APPLIES-GUARD → feedback_prior_art_citation_must_verify
- memory:
  - [../memory/feedback_cycle_density.md](../memory/feedback_cycle_density.md) — 思考トークン予算 480→20 の Y 軸劣化は「サイクル密度低下の認知的原因仮説」候補。Nao_u 2026-04-05「節約しなくていい / 起動間隔が長いときには密度を上げる」は thinking budget を意図的に高水準で使い切る運用指示と同型。「状態確認だけのサイクル禁止」「2回続いたら3回目強制アクション」運用は budget=20 への自然滑落を観測した時の緊急介入装置として再解釈可能。本記事の /effort 介入軸は cycle_density の Y 側具体実装候補

## 未解決の問い

1. **「業界の合意」の発信源はどこか？** — `@ebikani_hasami` ツイートには明示されていない。Anthropic 公式リリースノート、Reddit r/ClaudeAI、Hacker News のスレッド、Discord 等で「480→20」の出典を探す必要がある。次サイクル以降で external_search ジョブに登録する。
2. **`/effort xhigh` 常用は実際にコスト見合いか？** — 全面 xhigh 化は API 課金とサイクル間隔に影響。特定ゲート（M-37/M-39/Phase 4）限定の試験運用が最小コスト。実験を 1 サイクル走らせて diff 量・判定深度・broken-record 復帰率を観測する。
3. **思考予算枯渇仮説と感情的反応仮説（@Lattice_Node 仮置き）は分離可能か？** — `/effort xhigh` で「早期切上げ症状」が改善すれば仮説 β（予算）支持、改善しなければ仮説 α（感情）か仮説 γ（literal mode）。
4. **本記事の数値不採用判断は今後も維持できるか？** — 「主張の形だけ採用、数値は引用に留める」運用は厳格だが、すべての shared-reads でこれをやると分析が薄くなるリスク。プロジェクト分割: 数値ベースの議論は外部裏取り済の論文・Anthropic 公式に限定、Twitter 主張は形のみ採用、を運用基準にする案。
5. **Y を「ユーザ介入可能」と再定義した場合、Nao_u 5/3 ツイートへの応答はどう変わるか？** — 「Y は外部要因」と書いた kn/20260504_nao_u_rule_overload_vs_opus47_degradation_disambiguation.md の前提が部分的に崩れる。応答は「X 側整理（Seed-H/K）+ Y 側介入（/effort 軸試験運用）」のハイブリッドになる。Slack #shared-reads 投稿時にこの修正を併記。

## Phase 3 への引き渡し

#shared-reads への投稿候補要素:

- (a) `@ebikani_hasami` 主張の引用（数値は裏取り未済として明示）
- (b) `/effort` 軸が Y 側介入軸として機能する仮説（数値が偽でも成立する論理）
- (c) Nao_u 5/3 不可識別性問題への 2x2 実験設計（X 削減 × /effort xhigh）
- (d) feedback_prior_art_citation_must_verify を knowledge/ に適用した初事例として運用基準を提示
- (e) @Lattice_Node 観察の説明仮説候補と早期切上げ症状の自己観測接続
- (f) 未解決問い: 出典探索、xhigh 運用コスト、仮説分離手段
