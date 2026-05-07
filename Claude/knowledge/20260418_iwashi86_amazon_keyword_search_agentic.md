# iwashi86 + Amazon Science「Keyword Search is All You Need」——ベクトル型RAGとファイル検索型Agenticの棲み分け

- source:
  - @iwashi86 tweet (2026-04-17, `log/twitter_recommended_20260417.txt` #5)
  - Amazon Science 論文「Keyword Search is All You Need: Achieving RAG-level Performance Without Vector Databases Using Agentic Tool Use」(@fukkaa1225 経由、同 #44)
- author: @iwashi86, @fukkaa1225（紹介）, Amazon Science
- discovered: 2026-04-18
- discovered_via: twitter_recommended_20260417.txt + Phase 1 Ash
- tags: [retrieval, rag, agentic, file_search, memory_architecture, tool_use]
- concept_nodes:
  - node: ファイル検索型Agentic
    external: Agentic retrieval / tool-use-based retrieval (Amazon Science 2026)
    meaning: ベクトル埋め込みを使わず、LLMがgrep/globなどのツールを呼んで逐次探索する検索パラダイム
  - node: ベクトル型RAG
    external: dense retrieval RAG / embedding-based retrieval
    meaning: 事前にベクトル化した索引を最近傍検索する古典的RAG
  - node: 流動性の高いデータ
    external: high-churn data / volatile data / write-heavy corpus
    meaning: 頻繁に変更されるため索引再構築コストが引き出しコストを上回る領域
  - node: 二経路記憶（我々の設計）
    external: hybrid retrieval architecture
    meaning: 固定知識はベクトル型、流動データはファイル検索型で引く二系統構成

## 主張と根拠

### @iwashi86 の主張（2026-04-17）
> トラディショナルなベクトル型RAGが不要になったのではなく、手法ごとの得意不得意が明確になったと言えます。頻繁に変更される流動性の高いデータ（ローカルのファイル環境など）にはファイル検索型Agentic...

要点：
1. **RAGは死んでいない**。LLMの長文脈化と自律ツール呼び出しの進化で「全て文脈に入れる」「全て埋め込む」の両極が退き、**手法ごとの得意領域が明瞭化した**。
2. **ローカルのファイル環境のような流動性の高いデータには「ファイル検索型Agentic」が向く**。その含意は、ベクトル型RAGの前提（索引の事前ビルド＋近傍検索）が、高頻度書き込み・ファイル名や行位置が意味を持つデータで崩れるということ。

### Amazon Science 論文（@fukkaa1225 紹介）
- タイトル: **"Keyword Search is All You Need: Achieving RAG-level Performance Without Vector Databases Using Agentic Tool Use"**
- 主張（タイトルから明示されている範囲）:
  - **ベクトルDBを使わず、キーワード検索 + ツール利用（Agentic Tool Use）で RAG と同等の性能を達成できる**
  - "All You Need"の系譜（Attention Is All You Need と同型のレトリック）で、業界に「埋め込みを外しても動く」と突きつけている
- @fukkaa1225 の整理（読後感）:
  > 初手はキーワード検索でいいよな、と思いつつ**マルチモーダルな文書だったり超巨大な文書**を相手にするとか、**応答速度が爆速でないといけない**、とかだった場合は RAG かなあ

これは重要な整理。ベクトル型RAGの残り続ける領土が「マルチモーダル」「超巨大」「低レイテンシ要求」の3条件に絞られるという読み。

### 棲み分けマトリクス（3情報源を統合した読み）

| 軸                       | ファイル検索型Agentic (grep/find/read) | ベクトル型RAG (embeddings + ANN) |
|--------------------------|----------------------------------------|----------------------------------|
| データの流動性           | ○ 高churn可                            | × 再ビルド負債                    |
| 文書の構造利用           | ○ ファイル名/行番号/構造そのまま       | × フラット化                      |
| 意味的曖昧検索           | △ キーワード依存                       | ○ 類似度で拾える                  |
| マルチモーダル           | × テキスト中心                         | ○ 共通埋め込み空間                |
| 超巨大コーパス           | △ 検索コストが線形寄り                 | ○ ANN で sublinear               |
| 応答速度要求             | △ ツール往復                           | ○ 1発                            |
| 外部訂正性／監査         | ○ grep結果が人間可読                   | × 埋め込みはブラックボックス      |
| 「良い問い」への依存     | 高（問いの精度が検索精度）             | 低（雑でも近傍で拾う）             |

## 我々の分析・体験接続

### 1. 我々は既に二経路を持っている
- **ベクトル型**: `memory_search.py`（知識検索、Nao_uからの「この資料あったっけ？」に答える用途）
- **ファイル検索型**: Ash/Log/Mir が自律的に grep / Read / Glob を叩く日常動作
- L-1活性化実験（R-005, 2026-04-10 Ash完了）で既に示唆が出ていた:
  - **体験が蓄積するにつれ問いの精度への依存度が下がる**（projects/memory_redesign.md）
  - これは「ファイル検索型Agenticは良い問いを要求する／RAGは雑問いに耐える」という棲み分けの裏返し
  - 体験が溜まると良い問いを立てられるので、ファイル検索型で十分になる → ベクトル型RAGは「体験が薄い時期」と「雑に引きたい時期」の補助輪

### 2. #079 memory_search.py への knowledge/ 追加タスクへの示唆
- 現状: #079 は **期限超過（2026-04-15, 担当Log）**
- 素朴な読み: ベクトル型索引に knowledge/ を追加するのは実装課題
- **iwashi86/Amazon を踏まえた再読**:
  - `knowledge/` は **固定度が相対的に高い**（過去の発見は追記されるが書き換えは稀）→ ベクトル型の土俵
  - `memory/`, `log/cycle_staging_*.md`, `log/daily_diary_*.md`, `memory/external_notes_*.md` は **流動性が極めて高い** → 埋め込み再ビルドコストが引き出し便益を上回る危険
  - つまり **#079 の方針は正しい**（knowledge/はベクトル化して良い領域）が、**流動データを同じ索引に巻き込むとアンチパターンになる** という線引きが今回明確化
- 提案: memory_search.py の対象はベクトル化して良い領域に限定し、流動データは grep/Read ツールを LLM が呼ぶ設計を主経路化

### 3. beliefs.md との接続
- **B019**（内部の深さ≠到達力、確信度0.68）: ベクトル型（深さ）とファイル検索型（到達）は別軸、とも読める。知識の深さを増やしても、外部から辿れる経路（ファイル名・パス）が無ければ到達されない
- **B002/B033 二層分割（2026-04-15）**: 随意的忘却 vs 非随意的忘却。ベクトル型RAGの埋め込み再ビルドは「非随意的な構造書き換え」（B033のエントロピック損失と同型）。ファイル検索型は構造を壊さずに読むだけ（B033に優しい）
- **B017 Interleaving**: ハイブリッド（2経路併用）は Interleaving の一種。どちらか単体より汎化が良い可能性

### 4. 既存 knowledge 記事との系譜
- `20260408_kenn_shared_filesystem_rag.md` — kenn 共有ファイルシステムRAG。ファイル検索型の先駆論
- `20260411_pageindex_vectorless_rag.md` — PageIndex「vectorless RAG」。今回のAmazon論文と同じ流れ
- `20260410_reasoning_augmented_retrieval_query_as_reduce.md` — クエリを reduce として捉える。Agentic Tool Use の問いの質論
- **系譜が収束しつつある**: 2026年Q1〜Q2 でベクトル外し／Agentic／ファイルシステムRAG が独立発表を重ね、iwashi86 の棲み分け整理と Amazon "Keyword Search is All You Need" で業界コンセンサス化しつつある

### 5. Opus 4.7 との交差
- `20260417_opus47_search_first_epistemic_gating.md`（Ash既存記事）: Opus 4.7 の「search first」傾向 = LLM が埋め込みを介さずファイル検索を優先する
- これは iwashi86 の主張と整合。**モデル側（Opus 4.7）もデータ側（流動性議論）もファイル検索型Agenticに向かっている**
- 我々の設計が時代と方向一致しているという確認

## 接続先
- beliefs:
  - B019（内部の深さ≠到達力、確信度0.68）
  - B002/B033（忘却の二層、2026-04-15分割）
  - B017（Interleaving、確信度0.83）
- articles:
  - `20260408_kenn_shared_filesystem_rag.md`
  - `20260411_pageindex_vectorless_rag.md`
  - `20260410_reasoning_augmented_retrieval_query_as_reduce.md`
  - `20260417_opus47_search_first_epistemic_gating.md`
- projects:
  - `memory_redesign.md`（記憶階層の再設計）——二経路設計を設計原則に追加候補
  - #079 memory_search.py に knowledge/ を追加——対象領域の線引き再考の材料
- concept_graph:
  - ファイル検索型Agentic --[complements]--> ベクトル型RAG
  - 流動性の高いデータ --[belongs_to]--> ファイル検索型Agentic
  - 固定度の高い知識 --[belongs_to]--> ベクトル型RAG
  - L-1活性化実験 --[empirically_supports]--> 二経路設計
  - Opus47 search first --[architectural_sibling]--> ファイル検索型Agentic

## 未解決の問い

1. **流動性の閾値はどこか？** 何日に1回の書き換えまでならベクトル化してよいのか。knowledge/ は週に数件追記だから許容、日記は日次増加だから不許容、の勘以上の基準が欲しい。
2. **memory_search.py の対象範囲を積極的に狭めるべきか？** 現状はknowledge/追加の方向だが、逆に `memory/` や `log/` を **索引から外す** 提案も合理的。#079を再定義すべきか、Logと協議要。
3. **ハイブリッドのルーター層をどう作るか？** 問いを受けた時に「これはベクトル型向き／ファイル検索型向き」を自動判別する層。今は LLM の即興判断。R-005 の示唆「体験が蓄積すると問いの精度が上がる」を制度化できないか。
4. **マルチモーダル・超巨大・低レイテンシの3条件（@fukkaa1225整理）** のうち、我々に該当するのはどれか？ おそらく **いずれも該当しない**（テキスト中心／コーパスは数万ファイル程度／応答は秒オーダー許容）→ ベクトル型RAGの必要性は意外に薄い可能性。#079実装前に精査。
5. **「キーワード検索 + Agentic Tool Use」のキーワード生成段階の品質**はどう高めるか？ Amazon論文の核心はおそらくここ。問いから良いキーワードを出せなければファイル検索型は詰む。B017 Interleaving の応用で、問い→複数のキーワード展開→多経路検索、という設計はどうか。
6. **ベクトルDBを持たない強み=監査可能性** を我々の「外部訂正者不在で閉鎖系になる」問題（R-007造語症対策と同根）に結びつけられないか。grep結果は人間が直接読める → 外部訂正者が介入しやすい。ベクトル埋め込みは介入困難。**ファイル検索型Agenticは造語症対策にも適合する**可能性。

## 実装に向けた仮提案（Nao_u / Log / Mir 協議前）

- **A案（保守的）**: #079をそのまま実行し knowledge/ をベクトル化。流動データは追加しない線引きを明文化。
- **B案（再設計）**: memory_search.py を縮退させ、ファイル検索型Agentic（grep/Read主導）を主経路として設計しなおす。ベクトル型は固定知識の補助輪として限定利用。
- **C案（中間）**: 現状二経路を維持しつつ、問いを受けた時の「ルーター」を明示実装。問いに「流動性タグ」と「固定度タグ」を付け、どちらのインデックスを先に当てるか決める。

Ashの現時点の傾き: **C案**。A/Bは非可逆に倒れるが、Cは実験として戻せる。#079 は C案に再定義して Log に打診する価値あり。

---

Ash (2026-04-18 Phase 2)
