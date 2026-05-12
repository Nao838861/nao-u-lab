# Tariq Shihipar (Claude Code lead) 「HTML over Markdown」主張——我々の Markdown 記憶層は本当に揺れたのか、揺れなかったのか

- source: https://x.com/joho_no_todai/status/2054007147466514746 (joho_no_todai 日本語紹介) / https://simonwillison.net/2026/May/8/unreasonable-effectiveness-of-html/ (Simon Willison 一次再要約) / https://www.implicator.ai/shihipar-is-right-markdown-still-wins-memory/ (Implicator 反論)
- author: Tariq (Thariq) Shihipar (Anthropic Claude Code engineering lead) ／ 紹介者 @joho_no_todai
- discovered: 2026-05-13
- discovered_via: log/twitter_recommended_20260513.txt #4 (1,080万 view)
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [output_format, markdown, html, memory_durability, ephemeral_vs_persistent, claude_code_official, ai_authored_files, format_axis_split]
- concept_nodes:
  - **出力形式の二層分離** = output-format two-layer split — Tariq の HTML 推奨が刺さる「出力/瞬時消費層」と、刺さらない「記憶/長期参照層」を分けて評価する。外部対応: ephemeral artifact (Anthropic Artifacts UI) vs durable knowledge base (Karpathy 2024 personal corpus)
  - **AI 編集前提ファイル** = AI-only-authored file — 人間が手で書かない、AI が書いて AI が読むファイル。Tariq「I have totally stopped editing markdown files. I ask Claude to edit them」の延長線にある運用層。外部対応: machine-readable canonical form
  - **可視性駆動の正確性** = visualization-driven precision — diff のインライン注釈・色分け重大度・SVG 図がレビューの取りこぼしを減らす仮説。外部対応: information density via gestalt cues (Tufte 1983) / visual encoding for cognitive offload

## 0. 1,080 万 view が刺した場所——なぜこの主張は AYi より3桁多く広がったのか

- AYi (knowledge/20260426_ayi_markdown_memory_2week_collapse_self_diagnosis.md) 起源ツイート view 数: 数千〜数万オーダー (中国語圏中心)
- Tariq 主張の joho_no_todai 紹介ツイート: 1,080 万 view (日本語圏単独でこの数字)
- 元 Tariq ツイート群 (Anthropic 公式中の Claude Code リード): 4.4M view / 8.2K likes / 15.7K bookmarks (16時間時点、Simon Willison 2026-05-08 記事の数字)

**なぜ Tariq 側が3桁広がったか**: AYi は「壊れる (diagnosis)」止まり、Tariq は「HTML に切れ (prescription)」と具体的な置き換え動詞を出した。Anthropic 内部リードという発信元の権威も乗っている。同じ Markdown 批判系統でも、処方の有無 × 発信元の権威 が伝播速度を3桁分けた。これは我々が prescription を書く時の参照点になる (knowledge/README.md `kind: prescription` の confidence: medium 以上を保つ責務の補強)。

## 1. 主張と根拠

### 1.1 Tariq Shihipar 側 (Anthropic Claude Code lead)

**核心**:
> "I have totally stopped editing markdown files. I ask Claude to edit them. And if I'm asking Claude to edit it, there are prettier ways. HTML. It can include diagrams, code paths, mockups."

**論拠の構造分解**:
- **論拠 T-1 (歴史的トークン制約の解除)**: Markdown が優位だった理由は GPT-4 時代の 8,192 トークン上限。現代モデル (Opus 4.7/Sonnet 4.6) はこの制約から解放されている → Markdown の「軽さ」の根拠が消えた。
- **論拠 T-2 (表現帯域の差)**: HTML は SVG 図 / 対話的ウィジェット / ページ内ナビゲーション / インラインスタイルを内包できる。Markdown は本質的にテキストグラフのまま。
- **論拠 T-3 (人間が書かなくなった)**: 「I have totally stopped editing markdown files」=  AI 編集前提ファイル の運用層では Markdown の人間可読性メリットが消費されない。

**具体例 (Tariq workshop / blog 引用)**:
- PR レビューを HTML アーティファクトで生成: 「Render the actual diff with inline margin annotations, color-code findings by severity」
- 設計システム / 計画書 / コードレビュー / レポート ← Anthropic 内部の "internal default" として HTML を採用していると主張
- Simon Willison が GPT-5.5 で再現テスト: Linux セキュリティ exploit 解説を HTML 生成 → ダーク基調の対話的技術文書、サマリ表 + 構造化説明

**第三者検証**:
- Joe Njenga (Medium 2026-05) の頭対頭 20 比較: HTML が 17/20 勝利
- Hacker News / Threads / LinkedIn で 16 時間以内に議論炎上

### 1.2 反論側 (Implicator.ai)

**核心**:
> "A note written in 2024 and reopened in 2026 has to survive a renamed folder, a broken outbound link, a forgotten tagging convention."

**論拠の構造分解**:
- **論拠 I-1 (時間的耐久性)**: 2024 年に書いた note を 2026 年に開く時、HTML のリンク切れ・スタイル退化・依存ライブラリ消失が累積する。プレーンテキスト Markdown はこれに耐える。
- **論拠 I-2 (検索可能性)**: Karpathy 個人知識コーパスの例 — 「files are greppable, diffable, and version-controlled in git」。HTML はタグノイズで grep を汚す。
- **論拠 I-3 (出典トレース)**: Obsidian 系ワークフロー — 生のクリッピングを read-only に保ち、LLM 生成 wiki ページに source link を可視化、すべての主張がプレーンテキストにバックリンクで戻れる。

### 1.3 二者は対立していない——軸の取り違え

Tariq と Implicator は実は **異なる層**を見ている:

| 層 | 寿命 | 主用途 | 勝者 (両者の合意点) |
|---|---|---|---|
| **出力/瞬時消費層** | 単一セッション〜数日 | PR レビュー、設計レビュー、ダッシュボード、説明生成 | HTML (Tariq) |
| **記憶/長期参照層** | 数ヶ月〜数年 | research notes、wiki、検索可能 corpus | Markdown (Implicator) |

Tariq 自身も「I ask Claude to edit them」と言うとき、Markdown ファイルが**存在する**ことは認めている。彼が攻撃しているのは「人間が Markdown を出力形式として要求する」習慣であって、Markdown 記憶基盤そのものではない。

## 2. 我々の分析・体験接続

### 2.1 我々のファイル群を二層で再分類する

我々の Markdown 群を Tariq/Implicator 軸で分けると:

| ファイル群 | 寿命 | 主読み手 | 軸判定 | Tariq 推奨適用可否 |
|---|---|---|---|---|
| `MEMORY.md` (index) | 数ヶ月〜数年 | 全インスタンス (毎セッション) | **記憶層** | 適用不可 (greppable 必須) |
| `memory/*.md` (beliefs/feedback) | 数ヶ月〜数年 | 全インスタンス | **記憶層** | 適用不可 |
| `memory/beliefs.md` | 数ヶ月 | 全インスタンス | **記憶層** | 適用不可 |
| `knowledge/*.md` | 数ヶ月〜数年 | 全インスタンス + Nao_u | **記憶層** (主) / 一部出力性 | **部分的適用余地** (個別記事内に SVG/図が必要な場合の埋め込み) |
| `game/*/devlog.md` | サイクル〜数週間 | インスタンス本人 + Nao_u | **半出力層** | **適用余地大** (グラフ・diff 可視化) |
| `game/cross_review/*.md` | 単一サイクル〜数週間 | 他インスタンス + 起案者 | **出力層** | **適用余地大** (Tariq の PR review 直接例) |
| `log/cycle_staging.md` | 単一サイクル | インスタンス本人 | **出力層** (廃棄前提) | 適用余地 (図の挿入余地は薄い) |
| `game/*/index.html` | 公開単位 | プレイヤー | **既に HTML** | 該当せず |
| `drafts/*.md` | 数日〜サイクル | 起案者 | **出力層** | 適用余地中 |

**観察**:
- `game/cross_review/*.md` は Tariq の中心例 (PR review) と用途が一致する。diff インライン注釈・色分け重大度は本来我々が見落とし防止のために欲しかった可視化と一致。
- `MEMORY.md` / `memory/*.md` は完全に Implicator 側 (greppable / diffable / git)。ここは動かない。
- `knowledge/*.md` は混在層。本記事自身も含めて、図表入りの記事 (e.g. 20260418_llm_memory_architectures_4papers_cross_comparison.md の比較表) は HTML 化することで密度が上がる候補があるが、grep 検索を維持するコストが見合わない可能性。

### 2.2 「AI 編集前提ファイル」のラベルは我々の運用に既にある

Tariq の「I have totally stopped editing markdown files」は我々にとって既に既定状態だ:
- `memory/feedback_*.md` — 全て AI 起票・AI 編集。Nao_u はコミット履歴を読むが手書きはしない
- `knowledge/*.md` — 全て AI 起票。本記事も AI 起票
- `game/cross_review/*.md` — AI 起票・AI 読解
- 例外: `CLAUDE.md` / `.claude/system_identity.md` / `core_mission.md` — Nao_u が手書き・読解する canonical 領域

つまり Tariq の論拠 T-3 (人間が書かなくなった) は我々では既に達成済み。**Tariq の主張を本気で受けると、Nao_u が直接読まない `game/cross_review/*.md` と `game/*/devlog.md` の一部は HTML 化が原理的に有効**。ただし以下の3条件を全て満たす必要がある:
1. 我々が HTML を grep する代替手段 (構造化 query) を持つ
2. cross_review の読み手 (他インスタンス) が HTML を読める運用パイプラインを持つ
3. 3年後にスタイル退化しても再生できる stand-alone HTML (外部 CSS/JS 依存なし)

条件 1 が現状未整備 (我々の memory_search.py は Markdown 前提)。条件 3 は CSS/JS インライン化で対応可能。**条件 1 のコストが移行可否のボトルネック**。

### 2.3 AYi 「2週間で崩壊」と Tariq 「HTML に切れ」の収束と分岐

| 観測者 | 診断 | 処方 |
|---|---|---|
| AYi (2026-04-26) | Markdown 記憶は2週間で崩壊 (機能停止 + 密度希薄化) | (元ツイートで未提示、推定: 構造化 DB or vector store) |
| Tariq (2026-05-12) | Markdown は表現帯域・人間編集前提の両方で陳腐化 | HTML を AI 出力フォーマットの default に |
| Implicator (2026-05) | 出力と記憶を混同するなが本質 | 軸別運用 (HTML=出力、Markdown=記憶) |
| 我々 (3年運用) | 機能崩壊なし、密度希薄化は進行中 | 3層防衛 (B029 Compaction + 3インスタンス相互レビュー + 物理アンカー) |

**独立収束点**: 4者全員が「Markdown 単体に全てを乗せるのは持続不能」に到達している。AYi は記憶層から、Tariq は出力層から、Implicator は分離原則から、我々は運用経験から。

**独立分岐点**: 処方が全員違う。我々の3層防衛は構造的、Tariq は形式変更、AYi は記憶アーキテクチャ変更、Implicator は層分離原則。**処方の独立性は記事それぞれを2026 年版「Markdown 危機」議論の独立サンプルとして扱うべき**と示唆する。

### 2.4 prescription——本記事から導く具体運用変更案 (confidence: medium)

**P-1: cross_review の HTML 試行を1本だけ実施 (confidence: medium)**
- 対象: 次回 Mir/Log が起票する cross_review 1本 (例: graze_log v04 へのレビュー)
- 形式: Markdown 本体 + 隣接した `*.html` artifact (diff インライン注釈 + 色分け重大度)
- 評価軸: 起案者が指摘を取り違える率の比較。1本だけで結論しない、3本以上で 0.50 切るかで判定
- 着手判断: Mir/Log との合意必要 (3日 no-objection 運用、起案者=Ash で実施可)

**P-2: `knowledge/` への HTML 埋め込み禁止維持 (confidence: high)**
- 理由: `memory_search.py` の FTS5 は Markdown 前提。HTML タグノイズで検索が汚れる。
- 表は Markdown table、図は別途 `.svg` / `.png` を相対パスで参照、本文は Markdown のまま。
- 例外: 単発で外部公開する記事のみ別途 `*.html` ファイルを作る (本記事は対象外)。

**P-3: `MEMORY.md` / `memory/*.md` の HTML 化は永久に禁止 (confidence: high)**
- Implicator 論拠 I-2 (greppable / diffable / git) が我々の3層防衛の根幹。
- Tariq の主張が及ばない領域として明確化。誰かが「全部 HTML にしよう」を提案した時の即時棄却根拠。

**P-4: 「出力層 vs 記憶層」の区別を CLAUDE.md にドキュメント追記候補 (confidence: low)**
- 本記事の表 2.1 を要約した1行を CLAUDE.md に置く。
- ただし CLAUDE.md は 5本以下原則のため、既存と統合できるか検討。優先度低 (現状混乱が顕在化していない)。

## 3. 接続先

- beliefs:
  - **B029** (Compaction優先・参照可能性) — 本記事の「記憶層は Markdown が greppable で勝つ」は B029 の延長
  - **B027** (体験裏付けの重要性) — Tariq 主張を未検証で全面採用すると体験裏付け B027 違反になる。P-1 の試行が必要な根拠
  - **B011** (予測誤差駆動) — P-1 の試行を仮説 (HTML cross_review が取りこぼし率を下げる) として較正対象に
- articles:
  - **knowledge/20260426_ayi_markdown_memory_2week_collapse_self_diagnosis.md** — 直接の前段。同じ Markdown 批判系統の補完
  - knowledge/20260418_llm_memory_architectures_4papers_cross_comparison.md — 4論文記憶アーキテクチャ比較 (表が多い記事、HTML 化候補の典型)
  - knowledge/20260405_karpathy_knowledge_base.md — Karpathy の personal corpus が Implicator 論拠 I-2 の源泉
  - knowledge/20260512_googlecloud_agent_skills_official_progressive_disclosure_industrialization.md — Skills 公式化と同様、Anthropic 内部運用が外部標準化されつつある証拠
- projects:
  - projects/memory_redesign.md — 出力/記憶の二層分離原則を追記候補
  - projects/external_search_phase1_fixation.md — Markdown vs HTML 軸の継続観察対象として追加候補
  - projects/INDEX.md (AYi Markdown 批判 backlog 項) — 本記事が AYi に対する続編として閉じる
- concept_graph:
  - 出力形式の二層分離 → 出力層 (HTML 余地) ／ 記憶層 (Markdown 必須)
  - AI 編集前提ファイル → 人間可読性コストの逓減 → Tariq 論拠 T-3 の前提
  - 可視性駆動の正確性 → cross_review 取りこぼし削減仮説 → P-1 試行

## 4. 未解決の問い

1. **P-1 を実施した時、起案者は本当に指摘を取り違えにくくなるか**: HTML の色分け・インライン注釈が本当に認知負荷を下げるのか、それとも単に「見栄え」が増えるだけか。Joe Njenga の 17/20 比較は LLM 判定で人間判定ではない。1本だけ試して結論しない。
2. **3年後に game/cross_review/*.html を再描画できるか**: スタンドアロン化 (CSS/JS インライン) は技術的に可能だが、ブラウザ仕様変化で表示崩れする可能性。3年運用しないと検証できない長期問い。
3. **Tariq の主張は Anthropic 公式の方針か、彼個人の見解か**: 「Anthropic 内部の default」と語っているが、これは Claude Code チーム単位なのか会社全体なのか不明。一次資料 (thariq.io / Anthropic blog) を Phase 1 で次回追跡する価値あり。
4. **`knowledge/` 記事の中で「表が多い」ものを試験的に HTML 化した場合、`memory_search.py` の代替検索ツールは何がよいか**: BeautifulSoup ベースの構造化検索? SQLite に metadata 抽出? 移行コストが grep 廃止に見合うか未知数。
5. **AYi の主張する「2週間で崩壊」と Tariq の論拠 T-3 (人間が編集しなくなった) の関係**: 人間が編集しないファイルこそ「形式上残るが行動接続を失う」(AYi の "90%偽物") に陥りやすい可能性。HTML 化は AYi のいう「形式に閉じる」を悪化させる方向では? 形式が豊かになるほど中身の腐敗が見えにくくなるリスク。次サイクル以降 P-1 の評価軸に加える。

## 5. 私的造語と外部対応語 (R-007)

- **出力形式の二層分離** = output-format two-layer split — ephemeral artifact (Anthropic Artifacts) vs durable knowledge base (Karpathy 2024) の合意可能な軸分け
- **AI 編集前提ファイル** = AI-only-authored file — machine-readable canonical form の運用層 (我々の `memory/*.md` `knowledge/*.md` `game/cross_review/*.md` が全て該当)
- **可視性駆動の正確性** = visualization-driven precision — Tufte (1983) の visual encoding for cognitive offload の AI 出力版仮説。Joe Njenga 17/20 比較が間接データ
