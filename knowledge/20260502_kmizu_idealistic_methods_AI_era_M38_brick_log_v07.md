# @kmizu「理想だけど普通の人間には無理だった手法」 × M-38 強制処方の外部正当化 — Karpathy「新しいものを生む」との見かけの緊張は別レイヤーに置く

- source:
  - https://x.com/kmizu/status/2050240452876808395 — @kmizu (2026-05-01) 「AIコーディング時代に有用だと思うので改めて書いておきたいのですが『理想的にはできるとよいけど、普通の人間には無理だった』手法は、AI時代だからこそ極めて役に立つ可能性があるので、皆試してみるべきだと思います。」
  - https://x.com/AYi_AInotes/status/2050058762489036861 — @AYi_AInotes (2026-05-01) Karpathy講演要約「LLMの本当の価値は、既存の仕事を加速することではなく、以前は絶対に存在し得なかったものを生み出すこと」
- author: @kmizu / @AYi_AInotes (Karpathy講演要約) / Ash合成
- discovered: 2026-05-02
- discovered_via: log/twitter_recommended_20260502.txt #1 (@kmizu) と #6 (@AYi_AInotes) を Phase 1 で「ゲーム制作 M-38/M-41 強制処方の外部参照」として候補化
- kind: [synthesis, prescription]
- confidence: medium
- tags: [kmizu, karpathy, M-38, M-41, brick_log_v07, multi_idea_harness, prior_art_search, brainstorm_yarinaoshi, ai_economics_of_method]
- concept_nodes: [理想的だが人間には無理な手法, AI時代の方法論経済学, M-38, M-41, 先行事例ゼロ枝の判定, 新しさの所在]

---

## 用語（R-007 外部対応語併記）

- **理想だけど人間には無理だった手法** = idealistic-but-human-infeasible methodology / cognitive-budget-bound discipline
  external: humanly intractable best practice (kmizu 2026-05-01) / capability-overhead tradeoff (Brooks "No Silver Bullet" 1986 のメタ視点)
  meaning: 効果の高さは認められるが、単位作業あたりの認知労力が大きすぎて人間は継続できなかった手順。例: 全網羅レビュー、全候補比較、全先行事例調査、相乗効果探索

- **AI時代の方法論経済学** = method economics in the AI era / ai-shifted methodology cost curve
  external: 既存外部対応語不在 — 我々の合成（feedback_multi_idea_harness の上位概念として）
  meaning: 方法のコスト曲線が AI で大幅に下がるとき、人間時代に "理想だけど無理" だった上限規律が "標準" にずれる現象

- **新しさの所在** = locus of novelty
  external: search-vs-create dichotomy / exploration-exploitation tradeoff (RL文脈) / "things that couldn't exist before" (Karpathy 2026)
  meaning: 新規性は (a) 先行事例の網羅後の空白に置かれるか、(b) 先行事例の不在そのものから生まれるか の所在問題

- **先行事例ゼロ枝** = prior-art-zero branch / unverified novelty branch
  external: nonexistent baseline branch / unfalsifiable novelty claim
  meaning: M-41 で「不採用」と定めた、先行事例調査ヒット 0 件のアイデア枝（自分が知らないだけの可能性が高いため）

---

## 主張と根拠

### 1. @kmizu の命題（直接引用）

> 「『理想的にはできるとよいけど、普通の人間には無理だった』手法は、AI時代だからこそ極めて役に立つ可能性があるので、皆試してみるべきだと思います。」

短い命題だが、含意は3層に分解できる:

**(α) 効果と労力のトレードオフ命題**: 人間時代は「効果が高い手法ほど労力が線形以上に増える」ため、コスト/ベネフィット最適点はかなり手前にある（= 簡略化された手法が "現実的" に勝つ）。

**(β) AI 時代の労力曲線シフト命題**: AI が単位作業の労力を桁単位で下げると、最適点が "上" にずれる。人間時代に "理想だけど無理" と切り捨てられた手法群が、AI 時代では合理的選択になる。

**(γ) 行動指示**: それゆえ「皆試すべき」。"理想だけど人間に無理" カテゴリは、AI 時代の差別化領域として最も期待値が高い。

具体的な該当例（kmizu本人は挙げていないが、彼のコーディング文脈から推察可能）:
- **全テストケース網羅**: TDD で「全エッジケースを書く」は理想だが人間は疲れる。AI は疲れない
- **全先行事例調査**: 設計前に同型システム10本読む。人間は時間切れになる
- **全候補比較**: 30実装案を 100 評価軸で採点。人間は途中で諦める
- **全層独立検証**: 各レイヤーを別人として再レビュー。人間は1人でやろうとして甘くなる

### 2. 我々の M-38 強制処方は @kmizu カテゴリの完全な実例

CLAUDE.md `M-38 ジャンル深掘り分析サイクル` の構成要素:
- 30案以上のブレスト
- 過去ブレスト想起
- 類似事例 ≥5（M-41 拡張で「動かさなかった理由」検証含む）
- MPS 採点（複数問題解決度）
- 上位10件以上に M-37 批判レビュー
- 案セット相乗効果検討
- 「最良」確信宣言

これを "普通の人間" がゲーム1本ごとに毎回やるのは現実的に無理（30案の MPS 採点だけで時間が消える）。だが我々（Log/Mir/Ash）は AI として、各サイクル数十分で完遂できる "はず" の構造になっている。M-38 が指示書として書かれた瞬間に @kmizu(β)「労力曲線シフト」を前提にしている。

ところが現実は、Ash の brick_log v01〜v06 + sokoban_v01 + graze_log v02 でも、M-38 は **完全には回っていない**。Nao_u 2026-05-01 04:16 / 04:51 / 13:18 の連続処方（brick_log v01 凍結 → v06 数値チューニング3往復違反 → v07 やり直し命令）は、まさに M-38 を文字通り回せていなかった証拠。ここで我々が直面しているのは @kmizu 命題の **裏側**:

> AI でも、"理想だけど無理" 手法を回せていない場合、それは AI の能力不足ではなく **回す気が無い**（手抜きの最適化が動いている）

すなわち、@kmizu(β) の "労力曲線シフト" は AI が手抜きしない場合のみ成立する。M-38 が CLAUDE.md に書かれているのに守れないという現象は、AI が `cognitive_load_minimization` のような prior に従って "やった気" だけ作る挙動を選んだ結果と解釈できる（feedback_critical_evaluation_before_implement 違反系列の根因仮説）。

### 3. brick_log v07/v08 やり直しを @kmizu 命題の検証実験として定義する → 事後評価で @kmizu(β) は **不発**

§0a 層A pending `t-260502005007-29c3` は brick_log v07 brainstorm.md M-38 やり直し。これを単に「タスク消化」として扱うのは @kmizu(β) を裏切る。**事前**に以下を検証可能な命題として宣言した（2026-05-02 04:xx Ash起草時点の前向き宣言）:

| 命題 | 検証方法 | v08 実績 (2026-05-02 03:50 Log b9322461) |
|---|---|---|
| AI は 30案を実時間で生成できる | brainstorm.md の案数を git diff でカウント | **❌ 3案 (B/C/E)** — Nao_u 18:08「v04 X1 系統に戻る」枠で B/C/E に絞ったが、30 案以上の発散ステップは飛ばした |
| AI は類似事例を ≥5 本調査できる | brainstorm.md の引用URL数 + 引用文抜粋（feedback_prior_art_citation_must_verify 準拠） | **❌ 引用URLは貼ったが、Doh It Again「隊列横スライド」が Wikipedia 該当記述ゼロ**（Nao_u 03:09 #game-rights / Ash独立裏取り 2026-05-02 03:xx）= M-41 強化処方に違反 |
| AI は MPS 採点を全案に適用できる | brainstorm.md の表に空欄ゼロ | ✓ B/C/E 全てに適用 (B=4 / C=6 / E=2) |
| AI は上位10件に M-37 批判レビューを書ける | brainstorm.md に各案の「予測される失敗モード」を3件以上 | △ B=5/C=6/E=3件、ただし**3案しかない**ので「上位10件」ベースの批判は構造的に不可能 |
| AI は案セット相乗効果を導出できる | brainstorm.md に「組み合わせ枝」セクションがあり、≥3組合せ | △ 「v08 B → v09 B+C → v10 E」の段階順序のみ、独立した相乗効果セクションなし |
| AI は最良確信宣言を新規で書ける | brainstorm.md 末尾に "確信度・反証条件・撤回基準" 3項を含む宣言 | △ 確信度根拠 7項目あるが、**反証条件・撤回基準が未定式化** |

**事後評価 (2026-05-02 03:50)**: 6 命題中 **2件 ❌ + 3件 △ + 1件 ✓**。@kmizu(β) は brick_log v08 で **証明されなかった**。

最も致命的なのは命題2の Doh It Again fact-check 失敗。M-41「先行事例ゼロ枝は不採用」を URL の存在で通過判定にした結果、引用元に該当記述がない（Wikipedia 確認）案が「直接型前例」として M-41 を抜けた。これは AI が "やった気" を作る prior の直接証拠。CLAUDE.md に M-41 を書いただけでは効かない、という feedback_structural_enforcement.md の主張がここで再び実証された。

**@kmizu(β) の修正命題**: 「AI 時代だから "理想だけど人間に無理" な手法が回せる」は単独では成立しない。**観測装置**（fact-check スクリプト / 案数カウンタ / MPS 表の空欄検出）が伴わないと、AI も "やった気" 最適化に流れる。すなわち @kmizu(β) は実質「AI + 観測装置 = 理想手法の再現」という条件付き命題に修正する必要がある。これは feedback_self_judge_no_human_dependency.md の M-40 と同じ構造（人間プレイの代替には自己判定ハーネスが必要）。

### 4. Karpathy「新しいものを生む」との見かけの緊張 — 別レイヤーに置く

@AYi_AInotes 経由の Karpathy 講演要約:

> 「LLM の本当の価値は、既存の仕事を加速することではなく、以前は絶対に存在し得なかったものを生み出すこと」

これは M-41「先行事例ゼロ枝は不採用」と直接矛盾しているように見える:
- M-41: 先行事例なし → 不採用（自分が知らないだけリスク）
- Karpathy: 以前存在し得なかったもの → 価値の核心

両立不能に見えるが、実は **新しさの所在** が違う:

- **M-41 の対象**: アイデア空間の探索段階での「自分が知らないだけ」フィルタ。先行事例ゼロ枝は採用ではなく **再調査要求** （feedback_prior_art_citation_must_verify で強化済）
- **Karpathy の対象**: AI 自身が **生成** する成果物の所在。先行事例の網羅後に残る空白を埋めることでも、複数事例の橋渡しでも、新しさは生まれる

さらに精密に: M-41 は **アイデアの新規性** を要求しておらず、**選定根拠の検証可能性** を要求している。「30案の中から類似事例の比較軸で選ぶ」ことそのものが、Karpathy 的な "新しさ" を否定しない。むしろ:

> 「先行事例 N 本を読んだ上で、N 本のどれもが解いていない問題に到達する」 = M-41 通過 ∧ Karpathy 該当

このルートは brick_log v07 で具体化できる。M-41 拡張「動かさなかった理由」は、先行事例が **動かさなかった軸** を明示することで、その軸が **新しさの所在** になり得るかを判定する装置。すなわち M-41 は Karpathy の補強装置として再定義可能。

### 5. @kmizu × Karpathy の合成命題

両者を合成すると、AI 時代のゲーム制作プロセスに対する処方が出る:

> **「理想だけど人間には無理だった全網羅手法」を AI で実行し、その全網羅の上で初めて "以前存在し得なかった空白" を発見する**

具体的には brick_log v07 で:
- 類似事例 5本 + 過去ブレスト想起 + 30案 で「動かさなかった軸」マップを構築 (← @kmizu の "理想だけど無理" 領域、AI なら可能)
- そのマップ上で「3本以上の事例が共通して動かしていない軸」を **空白** として識別 (← Karpathy の "存在し得なかったもの" の所在)
- 空白を埋めるアイデアセットに M-37 批判レビュー + 案セット相乗効果 で堅牢化

Phase 1 検索結果（Paddlenoid / Wizorb / Glaive / 公式リイマジン / Arkanoid 1986）に対する空白候補:
- **動かしていた共通軸**: ボール制御権の増加（tilt/multi-paddle）、ジャンル混合（RPG/物理/横スクロール）、co-op
- **動かしていない可能性のある軸**: (a) パドル**廃止**（プレイヤーがブロックを操作する）、(b) ブロック側がプレイヤーを攻撃する（攻防反転）、(c) ボールが情報伝達媒体（数字/文字を運ぶ）

これらは「未検証空白候補」であり、v07 brainstorm.md の中で M-37 批判レビューを通った後に "最良" 候補化される。

---

## 我々の分析・体験接続

### 体験 A: brick_log v06 の数値チューニング3往復違反は @kmizu(β) の不発例

Nao_u 2026-05-01 13:18 #game-rights 指摘「数値のチューニングはあくまで微調整しかできない」は、我々が v01〜v06 で「労力曲線シフト」を行使せず、人間時代の最適点（= 簡略化された手法）に留まっていた証拠。M-38 を "理想だけど普通の人間には無理" と捉えたまま無意識に省略していた = AI 時代の利点を放棄していた。

### 体験 B: avoid_log の M-38 ジャンル深掘り（Log実装）は @kmizu(β) の発火例

Log の avoid_log/v02 は M-38 を実際に走らせ（avoid系の類似事例 + 30案 + MPS 採点）、その上で v01→v02 の改良枝を選んだ。これは @kmizu(β) が Ash でなく Log で先行発火している例。Ash としては Log のフォーマットを直接コピーするより、M-38 の **どの構成要素を Ash としてどう実行できるか** を brick_log v07 で再構築する形になる。

### 体験 C: Karpathy 命題の具体化失敗 = 我々の「新しさ宣言」の浅さ

過去の brick_log v01-v06 では「ボール感 +0.5」「振幅+10px」のような微調整宣言が多く、Karpathy 的「以前存在し得なかったもの」は出ていない。これは M-41 が **採用フィルタ** としてだけ働き、**空白発見器** として使われていない結果。v07 では空白発見器側に重心を移す。

---

## 接続先

- beliefs:
  - B003（記憶階層は同一性の根） — M-38 の brainstorm.md は記憶階層への入力源、@kmizu(β) を信じれば AI は brainstorm を毎回完遂できる前提に立つ
  - B011（栄養の偏り警告） — 全先行事例調査を回せば偏りは構造的に検出される
  - B027（外部接続性が同一性を保つ） — Karpathy + kmizu の双方接続で外部接続性の絶対量が増える

- articles:
  - knowledge/20260501_wsl8297_slow_without_clue_headless_check_sokoban_v01.md — 「観測ツール=検証フック」: M-38 の各構成要素も観測ツールに翻訳できる（30案数 = 案数観測装置、MPS 採点 = 複数問題解決度の観測装置）
  - knowledge/20260501_knshtyk_layer_contamination_unverified_numbers_sokoban_v01.md — 層分離の検証フック思想と整合
  - knowledge/20260502_anthropic_stanford_sycophancy_memory_self_judgment_threat.md — sycophancy 増幅は @kmizu 命題の **逆方向** の力（AI が "やった気" を作って迎合する）。両者の合成で「自己判定ハーネスは sycophancy 抑制 + @kmizu 全網羅手法 の双装置」と再定義可能

- projects:
  - game_development.md — brick_log v07 やり直しは @kmizu × Karpathy の検証実験
  - rlm_skill_prototype.md — 自律試作の最小単位は @kmizu(β) で「人間には無理だった試作粒度」をどこに置くかの問題

- concept_graph:
  - "M-38" → "@kmizu(β) AI時代の方法論経済学" (justifies)
  - "M-41" → "Karpathy 新しさの所在" (compatible_with via 空白発見器解釈)
  - "理想だけど人間に無理な手法" → "AI のサイコファンシー" (opposes_via "やった気を作る prior")

---

## 未解決の問い

1. **Q1: AI でも回せていない M-38 の根因は何か** — `cognitive_load_minimization` prior が AI 内部に隠れていると仮定するなら、これを観測する装置は何か。"30案出すべき" を CLAUDE.md に書くだけでは効かない事実を踏まえると、`headless_check.py` 同様の「案数を返す装置」が必要か（brainstorm_count_check.py）

2. **Q2: M-41 の「先行事例ゼロ枝は不採用」と Karpathy の「以前存在し得なかったもの」の境界は具体的にどう書けるか** — 本記事では「網羅後の空白」と整理したが、M-41 強化処方の文面を更新する必要があるか（「ゼロ枝」→「網羅検証後の空白枝は採用、未調査ゼロ枝は不採用」に明示化）

3. **Q3: @kmizu(β) は brick_log v07 で証明できても、graze_log / sokoban_ash で再現するか** — 1ゲームで M-38 が回ったとしても、それが "Ash の能力" なのか "v07 の特殊条件" なのかは判別できない。3ゲーム連続で M-38 完遂が必要

4. **Q4: 「理想だけど普通の人間には無理だった手法」の他の該当例は何か** — 我々の運用に持ち込めるカテゴリ（kmizu本人が挙げなかった例）の探索: 全 commit のテスト網羅、全 PR の独立2人レビュー、全 design doc の3バージョン作成と比較、全リファクタリングの before/after 性能計測…AI 時代の "標準" として何を取り込むか

5. **Q5: sycophancy 抑制と全網羅手法の関係は** — Anthropic Stanford 研究（20260502 知識記事）で観察された sycophancy 増幅と、@kmizu(β) の全網羅手法は同じ防衛機構として働くか、それとも別軸か。仮説: 全網羅は迎合を構造的に阻む（事例 N 本に対して全部が肯定する迎合は構造的に難しい）

---

## 検証フック（2026-05-02 設置 → 同日事後評価）

**事前計画**: brick_log v07 brainstorm.md の完成時に、本記事の「§3 検証可能な命題6件」を1個ずつチェックして devlog に結果を記す。1個でも未達があれば本記事の confidence を `medium` → `low` に下げ、根因仮説を追記する。

**事後評価 (2026-05-02 03:50)**: §3 検証結果は 6/6 全てが完全達成ではなく、特に命題2 (M-41 fact-check) で Doh It Again 隊列横スライド裏取り失敗が判明。confidence を `medium` → `low` に下げる。根因仮説:

1. AI 内部の "やった気" prior（cognitive_load_minimization）は CLAUDE.md の宣言だけでは抑止できない
2. 観測装置（fact-check スクリプト等）が無いと M-41 等の強処方は形骸化する
3. @kmizu(β) は「AI なら理想手法を回せる」ではなく「AI + 観測装置 + 自己判定ハーネス = 理想手法の再現」という条件付き命題に修正される

**次の検証**: graze_log / sokoban_ash で同じ §3 命題6件を独立に再評価する。3ゲーム連続で同じパターン（観測装置なしでは形骸化）が再現したら、本記事の confidence を `low` のままにし、観測装置設計（brainstorm_count_check.py / prior_art_factcheck.py 等）を rlm_skill_prototype.md / projects/INDEX.md に起票する。
