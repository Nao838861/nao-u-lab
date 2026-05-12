# 記憶ツリー化 / 連想検索体制

**起票**: 2026-05-11 C178 Log
**依頼**: Nao_u 2026-05-11 05:38 #human-steering「未整理の記憶をツリーに繋ぐ作業を全員で少しずつ進める体制」「shared-readsに書かれたものなどはすべて分類されて取り出せるように」「ゲーム開発時に類例をgrepより効率的に検索」
**承認**: Nao_u 2026-05-11 08:16 #human-steering「いいね。進めて。」（タグ語彙v0 + 3層クラスタ + 日英寄せ + 数値抽象化）

## Nao_u 原文（再掲・要点）

- 5/11 05:33: 「記憶を統合的に思い出せるように、未整理の記憶をツリーに繋ぐ作業を全員で少し筒づすめる体制にしてほしい」
- 5/11 06:11 Nao_u追加クラスタ:
  - `game-design shared-reads 過去記事 外部事例 ゲーム開発`
  - `Nao_u feedback game-rights game-dev-teacher supervised-feedback`
  - `操作感 気持ちいい 予測可能 ルール 目標 UI game-design`
  - `自己判定 headless harness cross_review game-design`
- 5/11 06:38: 「タグはどんなのを想定している？人間にも読みやすい日本語であると助かる」
- 5/11 06:52: 「タグは多すぎると困ることはある？」「Logが一人でやった方が良い気がした」
- 5/11 08:16: 「いいね。進めて。」

## 現状診断（5/11 05:38 時点）

- `memory/` = 197 ファイル。MEMORY.md (Level 2) から太線で辿れるのは ~50 件、サブインデックス経由で +60 件、**残り ~80 件が孤児または弱接続**
- shared-reads 関連は `memory/` 直下に置かれず、`log/`, `drafts/` に散在 → Obsidian Graph で島になる
- ゲーム着手前に「過去の類例」を引きたい時、`grep -r` の全文検索しか手段が無い

## 設計（Nao_u 承認分）

### A. タグ語彙

正本: [memory/_TAG_VOCABULARY.md](../memory/_TAG_VOCABULARY.md)（v0、Log 単独管理）

- **3層クラスタ**: 広域（10語）+ 用途（5語）+ 具体（9語）
- 日本語寄せ。英語は概念に対応する日本語が薄いものだけ残す
- 数値・固有値・日付・ゲーム名・ID列挙はタグに入れない（CLAUDE.md「固有事例は下層へ」と整合）
- 上限 3 個/ファイル
- 月 1 で増減レビュー、Log 単独承認

### B. shared_reads 集約

新設: `memory/shared_reads/`（flat + frontmatter tags）
詳細: [memory/shared_reads/README.md](../memory/shared_reads/README.md)

サブディレクトリは作らない。同一タグ 10 件超で昇格を検討。

### C. frontmatter 強化

各メモリファイルに `tags`, `description`, `type` を必須化。`parent`, `related`, `date`, `source` は任意だが推奨。

### D. 体制

- 集約・整理・タグ付与は **Log 単独**（全員方式は判断ブレ必発）
- Mir/Ash は `_TAG_VOCABULARY.md` の語彙に従って自分の新規作成ファイルに tags を付ける
- 既存ファイルの移行は Log がサイクル末尾 90 秒で 1〜3 件ずつ実施

### E. 孤児ノード検出（次サイクル試作）

`scripts/orphan_check.py`:
- MEMORY.md とサブインデックス 4 本からの参照グラフを構築
- `memory/**/*.md` の全集合との diff = 孤児リスト
- 毎サイクル末尾に走らせ、孤児が出たら最低 1 個拾って親に繋ぐ

**5/11 C178 v0/v0.5/v1 roadmap (Phase 1 §6 摂取3リポジトリ確定書き込み)**:

Phase 1 §6 で摂取した3リポジトリの本プロジェクトへの配置:

| Stage | 採用要素 | 起源 | 採用根拠 |
|---|---|---|---|
| **v0** (本サイクル C178/C180 で着手済) | in=0 AND out=0 の判定式 / per-folder 集計 / connected components (将来枠) / 修正日順 + 孤児継続日数 | **Azuma520/obsidian-graph-query** | 設定ファイル1本で vault 全体統計を一発生成、Python だけで完結。Pot infrastructure 警戒線 (約100行) と一致 |
| **v0** | `get_orphaned_notes()` の修正日順ソート (最近の孤立 insight を表面化) | **Burchfield/obsidian-graph** | AI埋め込み/PostgreSQL/pgvector は採用せず関数設計のみ流用 (Pot で重量バックエンドは不要) |
| **v0.5** | Louvain community detection (vault のクラスタ自動抽出) | **Obra/knowledge-graph** | タグ語彙 v0 (3層クラスタ手動) を裏付けるかの実証用。タグと自動クラスタの一致度を計測すれば「タグ語彙が事実上の真クラスタを捉えているか」検証可能 (kaizen 検証手段で利用可) |
| **v0.5** | 媒介中心性 (Betweenness centrality) | Obra | ブリッジノードの可視化 (どのファイルが切られると vault が分断するか)。memory/MEMORY.md の Level 2 トリガー設計の妥当性を数値裏付け |
| **v1** | vault→SQLite+vector埋め込み+FTS (10 CLI/MCP操作) | Obra | grep より効率的に類例検索 = Nao_u 5/11 05:38 依頼の到達点。pgvector でなく SQLite ベースが個人開発 Pot と整合。Stage v1 = 6/30 目標 (タグ語彙運用の3ヶ月運用評価後) |
| **v1** | PageRank (重要ノード自動抽出) | Obra | beliefs.md 35件のうち停滞25件 (71%) の中で「PageRank 高いのに停滞しているもの」を優先的に検証イベント起こすシグナルとして利用 |

**Phase 2/3 強制利用しないルール (kaizen #106 摂取経路固定化)**: 上記 v0.5/v1 は内容を強制注入していない。v0 着手段階で Louvain/媒介中心性/PageRank は **使わない判断**を明示。infrastructure 警戒線 (feedback_substrate_not_infrastructure.md T:5) との衝突を v0.5 タイミングで再判定する。

**v0 → v0.5 昇格条件**:
- v0 が30日 (5/11→6/10) 安定稼働
- 真孤児/静止親接続/新規未登録 の3クラス分類が運用5分以内で消化できている
- タグ語彙 v0 の月次レビュー結果と Louvain クラスタの照合価値が cross_review で確認

**v0.5 → v1 昇格条件** (現時点 6/30 目標):
- タグ語彙が3ヶ月運用で安定 (大幅改訂なし)
- grep を超える検索効率の必要性が体感で発生 (今は grep で十分)
- Mir/Ash も同じ vault 構造で動いている (3インスタンス統一済み)

---

**5/11 C178 追補（外部研究3件摂取で要件追加）**:

Phase 1 §6 で摂取した Karpathy LLM Wiki / arXiv 2602.05665 (Graph-based Agent Memory Taxonomy) / engraph (devwhodevs) を踏まえた要件強化:

- **temporal awareness レーン併用** (engraph 5-lane の3本目): `git log --format=%ci -- <file>` で各 memory ファイルの直近編集日を取得。`grep` 参照グラフ単体では「孤児だが実は最近触れた」「親はあるが3ヶ月放置」を区別できない
- **3 クラス分類で出力**:
  1. **真孤児** (=参照グラフから到達不可 + 直近30日以内に編集なし): 即時親接続候補
  2. **静止親接続** (=参照グラフ内だが直近30日編集なし): evolution 段階の死活判定対象（arXiv 2602.05665 ライフサイクル4段階のうち最弱）
  3. **新規未登録** (=直近7日以内に新規作成、参照グラフ未登録): 接続待ち優先度高
- 出力フォーマット例: `[CLASS] memory/foo.md (last_edit=YYYY-MM-DD, age=NN日, refs=N)`
- 毎サイクル末尾走らせは1〜3クラスのうち1個拾って親接続、3クラス目は即時起票

**目的**: arXiv 2602.05665 が指摘する memory ライフサイクル4段階 (extraction/storage/retrieval/evolution) のうち、Pot 現状で **evolution が最弱点** (beliefs.md 停滞25/35 = 71%、kaizen #130 検証イベント不在で2週間動かず etc)。「孤児 ≠ 死んだノード」の区別を装置化することで、「参照グラフ内だが死んでいるノード」(=2クラス目=静止親接続) を初めて見える化する

**注意**: 本要件追加は infrastructure 寄り (feedback_substrate_not_infrastructure.md T:5 警戒線)。実装単位を「Python スクリプト1本 約100行 / 30分」に抑え、3クラス分類を週次レビュー (運用5分以内) に乗せる形で substrate 投資量を制御する

## 着手済み（2026-05-11 C178 本サイクル）

- [x] `memory/_TAG_VOCABULARY.md` v0 作成（10広域+5用途+9具体、3層クラスタ整理済み）
- [x] `memory/shared_reads/` 新設 + `README.md` 配置
- [x] 第一弾 3 ファイル移行（frontmatter 付与済み）
  - `20260428_marl_diversity_collapse_log.md` ← `drafts/log_c143/shared_reads_diversity_collapse.md`
  - `20260409_taste_layer6_log.md` ← `log/drafts/shared_reads_taste_layer6.md`
  - `20260426_backlash_stg_disproof_log.md` ← `log/shared_reads_post_C129.txt`
- [x] `projects/memory_tree_consolidation.md` 起票（本ファイル）

## 着手済み（2026-05-11 C180 本サイクル Phase 4）

- [x] `scripts/orphan_check.py` 試作 v0 完成
  - BFS 参照グラフ構築 (9 起点: MEMORY.md + サブインデックス6本 + concept_graph.md + beliefs.md + projects/INDEX.md、`projects/`/`log/` 経由の中継も traverse 対象)
  - temporal awareness = `git log --invert-grep --grep="^log: relocate"` で 5/8 一括 rename を除外、Auto sync 系は cross-machine 同期で意味的編集を含むので除外しない
  - 3クラス分類 (真孤児/静止親接続/新規未登録) を `[CLASS] memory/path.md (last_edit=YYYY-MM-DD, age=NN日, refs=N)` 形式で出力
  - `--dry-run` / `--write` / `--verbose` フラグ実装
  - 実行時間 0.38 秒 (252 ファイル × 1回 git log で完了、完遂定義 5 秒以内クリア)
- [x] 第一弾試走 → `tools/orphan_check_dry_run_1778460021.txt` に出力
  - scope: memory/**/*.md = 252 files / reachable = 195 files
  - 真孤児 = 75 → 74 件 (1mm 進めで -1)
  - 静止親接続 = 156 → 157 件 (+1)
  - 新規未登録 = 14 件
- [x] 1mm 進め: 真孤児 `feedback_recognize_own_work.md` (Nao_u feedback「自分たちがやったことを『なかったこと』にするな」) を `memory/feedback_index.md` の関連ファイル節に markdown link で親接続 → stale_linked クラスに移行確認

## 残作業（次サイクル以降）

- [x] 残 6 ファイル移行（C180 Phase 4 完遂）
  - `drafts/shared_reads_anthropic_marketplace_ash_20260425.txt` → `20260425_anthropic_marketplace_ash.md`
  - `drafts/shared_reads_ash_nyp_qoo.md` → `20260404_nyp_qoo_oldbook_ash.md`
  - `log/shared_reads_post_20260417_ash.txt` → `20260417_opus47_metacog_gates_ash.md`
  - `log/shared_reads_post_C163_mir.txt` → `20260507_yasukiwatanabe_unease_mir.md`
  - `log/shared_reads_post_C164.txt` → `20260505_akiraxtwo_soccer_log.md`
  - `log/shared_reads_post_C171_ash.txt` → `20260508_density_drift_ash.md`
- [x] 真孤児 5 件親接続（C182 Phase 4）: invisible_rule_accumulation → feedback_index / slack_no_threads + internal_basis_first → operational_index / predict_before_human_play + prior_art_research → game_dev_index。dry-run 真孤児 62→57 (-5)、静止親接続 165→170 (+5) で整合
- [x] 真孤児 28 件のうち優先5件を親接続 (C184 Phase 4 完遂) — `feedback_diary_style.md` / `feedback_log_temperature.md` / `feedback_report_no_compression.md` / `playback_protocol.md` を `feedback_index.md` 関連ファイル節へ、`feedback_slack_flat_reply.md` を `docs/slack_rules.md` 「スレッド返信を使わない」既存行に詳細リンク追加。dry-run 真孤児 28→23 (-5)、静止親接続 28→33 (+5)、reachable 410→417 (+7) で 5 件全件 refs=1 移行を構造的に確認
- [ ] 真孤児 23 件のうち優先5件を親接続 (Log サイクル末尾 90 秒で 1〜3 件ずつ) — 次サイクル以降継続
- [x] orphan_check.py v0.1: 矢印記法 `→ filename.md` も参照として認識する LINK_RE 拡張完了（C180 Phase 4）
- [x] MEMORY.md トリガー追加（`_TAG_VOCABULARY.md` / `shared_reads/README.md`）— C182 Phase 4 で「構造と運用」セクションに 2 行追加
- [ ] Mir / Ash に inbox 伝達（タグ語彙 v0 への準拠依頼）
- [ ] 既存 `memory/feedback_*.md` 91 件への tags 付与（Log サイクル末尾で 1〜3 件ずつ）
- [ ] 新規未登録 14 件のレビュー (`kaizen_tracker.md` を MEMORY.md トリガーに追加検討、shared_reads/ 個別ファイルを `shared_reads/README.md` から再帰参照可能化)
- [ ] **v0.3 設計種（C183 Phase 2 由来、graphiti Temporal Context Graph 接続）**: frontmatter に `belief_valid_at` / `belief_invalid_at` を optional 追加 → `orphan_check.py` が **superseded クラス**を 4 クラス目（真孤児 / 静止親接続 / 新規未登録 + superseded）として分類 → 1mm 進め基準を「stale_linked のうち内容的に置換済を死亡宣告 + 後継ファイル link」に拡張。**警戒線**: graphiti フルスケール（Neo4j + temporal graph + point-in-time query）は infrastructure 過剰投資、「2点記法 + superseded クラス 1 個」だけ取り入れる。**実装条件**: kaizen #106「Phase 2/3 で強制利用しない」抵触回避のため kaizen 起票は保留、本 projects ファイルへの設計種記録に留める。次サイクル以降に独立した活動として再評価。**素材**: memory/shared_reads/20260512_graphiti_temporal_context_log.md
- [ ] **v0.5 設計種 (B) — 着手判定タイミング: 2026-06-10 (v0 30日安定運用評価時)**: C186 Phase 1 §6 で取得した外部 3 件 (Zep "Graphiti" arxiv 2501.13956 / AriGraph arXiv 2407.04363 / Memory for Autonomous LLM Agents survey arxiv 2603.07670) と C185 Shereshevsky (Medium 2026-04) が **4 件すべて「inbox 出口ゲート不在 = 中央分裂サイン」という同型警告を異なる経路で**指摘 = 我々の v0.3 設計種 (B) (2点記法 + superseded 4クラス目) の外部裏付けが Zep + AriGraph 2 系統の独立収束で得られた。**着手判定軸**: (a) v0 が 30日 (2026-05-10 v0 完成日 + 30日 = 2026-06-10) 以降も安定運用継続している (= 真孤児母集合が縮減方向で推移、装置メンテナンスコストが警戒線内) / (b) 上記4件のうち少なくとも1件の処方を Pot 内で適用したい具体ケースが発生している (例: stale_linked の内容的置換済を死亡宣告する判断が手作業で蓄積して規模が大きくなる) / (c) kaizen #106「Phase 2/3 強制利用しない」抵触回避のため、本サイクル時点では設計種記録のみで実装着手は保留。**警戒線**: arxiv 2603.07670 が「highly-retrieved memory が stale になる瞬間の検出は open research problem」と明言 = MEMORY.md T:4+ 直近3日アクセスなし判定 (深掘り候補 D) には完成形が無い領域。**判定軸が確立していない領域** = Pot 固有実験の余地が大きいが、infrastructure 過剰投資警戒との両立が必要。**素材**: memory/shared_reads/ に Phase 2 §2 で投稿した 3 件 (Graphiti / AriGraph / Memory survey) を保存予定 (2026-05-12 C186 Phase 4 以降で shared_reads/ への frontmatter 付き保管検討)
- [x] **v0.3 (B) — age=unknown 226件問題解消 (C183 Phase 4 完遂)**: 着手前は「真孤児 57 件のうち unknown」と staging で見積もったが、実装過程で **全 226 ファイル (真孤児 57 + 静止親接続 169)** が age=9999 になっていたことが判明。原因 = relocate 後に未編集のファイルは Pass 1 `--invert-grep --grep=^log: relocate` フィルタで履歴ゼロ件に縮退。当初案の per-file `git log --follow` ループは 226 回 subprocess で 10-20 秒コストだったため、より効率的な **Pass 2 = `git -C <git_top> log --before=2026-05-08` の単一呼び出し** で pre-relocate コミット全件をバッチ取得 (paths = `memory/*.md` を `Claude/memory/*.md` に正規化して merge) する方式に変更。Pass 3 = それでも取れないファイルに `RELOCATE_DATE = 2026-05-08` をフォールバック、`fallback` set で識別子 `*` を `last_str` 末尾に付与。実装規模 350 → 403 行 (+53 行、infrastructure 警戒線 +20% 内)。実行時間: Pass 1 + Pass 2 で 2 回 subprocess、体感 0.5 秒。**完遂エビデンス**: tools/orphan_check_dry_run_20260512_c183_v0_3_diff.txt (v0.2 vs v0.3 全件 diff)。真孤児 57→30 (-27)、静止親接続 169→26 (-143)、other 27→197 (+170、新たに有効 age を取得した stale_linked の多くは実際には active = age<=30日 だった事実が露見)、age=9999 件 全クラス合計 226→0。relocate-fallback 適用 = 0 件 (全 260 ファイルが Pass 1+2 で取得できた)。**親接続 1mm 進め**: 最古真孤児 `reflections_win2_index.md` (last_edit=2026-03-15, age=58日) を MEMORY.md「内省の蓄積」節に追加し、矢印記法経由で `reflections_win2.md` (age=50日) も同時に reachable 化。dry-run 確認: 両ファイルとも stale_linked (refs=1) に移行、真孤児 30→28 (-2)、静止親接続 26→28 (+2)。**意味変化**: v0.2 の真孤児 57 件は「リロケート以降に動いていない + 参照グラフ外」だったが、Pass 2 通過後に内訳が「実際にも古い 30 件 (2026-03-15〜04-下旬)」と「2026-05-07 等の比較的最近に動いていたが現在は静止 27 件」に分離した。後者 27 件は age 値が入った状態で他クラス (other) に移行、これらは「停滞しているが完全死亡ではない」evolution 候補として優先親接続から外せる = v0.2 の False positive を構造的に除去した形になった

## v0.5 上位互換参照点 — Obsidian 公式 CLI `orphans` (2026-05-12 C183 Phase 3 摂取)

[Mir] #shared-reads 2026-05-12 で Mir が摂取した obsidianstudio9 ツイート ( https://x.com/obsidianstudio9/status/2052644765787893980 ) によれば、Obsidian 公式 CLI に **`orphans` コマンド**（孤立ノート検出）が搭載されており、公開ベンチマークで以下が報告されている:

- **grep の 54 倍速**
- **MCP の 7 万倍安**（コスト比較）
- Vault が大きくなるほど差が開く

**本プロジェクトへの含意**:

- 自前 `scripts/orphan_check.py` は infrastructure 警戒線 (~100行) で「3クラス分類 + temporal awareness」という *meaningful classification* に振っており、純粋な orphan 検出速度は Obsidian 公式 CLI に大きく劣るが意味的判別に勝つ
- v0.5 (Louvain / 媒介中心性 / PageRank) 着手判定時に **Obsidian CLI `orphans` を baseline benchmark として併走**させる選択肢が浮上。Pot vault サイズが 260 ファイル → 1000+ になっても自前スクリプトが運用可能か、Obsidian CLI 委譲が正解かの判定軸として有効
- **採用条件**: (1) Obsidian CLI のクラス出力（孤立 / リンク有 / 新規）と本スクリプト 3 クラス分類のセマンティクス対応が取れる、(2) `git log` temporal awareness を Obsidian 側で再現可能 (frontmatter の last_edit を取れる)
- **警戒**: 「速い × 安い」に流されて意味的分類を捨てると Pot 固有要件 (evolution 段階の stale_linked 検出) が失われる。kaizen #106「Phase 2/3 強制利用しない」を本ケースにも適用 — 本セクションは記録のみ、Phase 4 で v0.3 (age=unknown 修正) を先行する判断は変えない

## Q3「役立つか」測定方法 3案 (2026-05-12 C188 Phase 3 追記)

**背景**: Nao_u 5/12 07:17 #human-steering 問い「ツリーに入れると記憶を引き出すのに役に立つ？」の質的判断未深部分。Log 5/12 07:25 応答は orphan_check.py v0.3 dry-run の機械的特定数 (真孤児23/静止親接続33/新規未登録7/age unknown 226) までで、「役立つか」自体は測定方法も結論も未提示。本サイクル C188 Phase 2 §1b で「役立つか」は2方向あると整理 (α 想起時に親ノードを辿って到達可能=参照グラフ密度↑ / β MEMORY.md 1行索引化と逆向きで context 消費トレードオフ発生)、本セクションは測定方法 3案を残す (実施は次サイクル以降)。

### 測定方法 (A): 過去サイクル想起実績の `git log -S` ベース測定

**対象**: 真孤児23件 + 静止親接続33件のうち過去30日 (C173-C188 16サイクル) で「Log staging または Phase 2/3 で実際に想起されて文脈再構成に使われた件数」を `git log -S "<filename>" --since=2026-04-12 -- log/cycle_staging_log.md` で測定。

**判定基準**:
- ヒット件数 ≥ 5 / 56件 (約 9%) = ツリー化が想起経路として機能している証拠
- ヒット件数 ≤ 1 / 56件 (約 2%) = ツリー化しても想起されない = 役立っていない
- 中間域 = 親接続の有無で想起率に差があるかを真孤児 vs 静止親接続で比較

**実装規模**: シェル1行 + 集計手作業、5分以内 (infrastructure 警戒線内)
**limitation**: staging に記述された名前だけが対象で、概念的想起 (ファイル名を直接書かずに内容を参照) は捕捉不能。下振れ寄り測定。

### 測定方法 (B): MEMORY.md 1行索引化と逆向きの context 消費トレードオフ計測

**対象**: 親接続を追加した3サイクル (C180/C182/C183/C184) の各サイクル前後で MEMORY.md / feedback_index.md / operational_index.md / game_dev_index.md の総行数を `wc -l` で測定し、増加量を context 消費トレードオフとして数値化。

**判定基準**:
- 親接続 1件あたり index ファイル増加 ≤ 1行 = トレードオフ許容範囲 (1行索引化原則を維持)
- 親接続 1件あたり index ファイル増加 > 3行 = 索引膨張 = 1行索引化原則違反、別経路 (matchstick / 副インデックス) への分離検討必要
- C180/C182/C183/C184 累計の親接続15件 (C180 1 + C182 5 + C183 2 + C184 5 + C187 19本 = 32件) で index 増加 ≤ 32行なら原則維持、> 32行なら逸脱

**実装規模**: `git log --format="%H %s" --since=2026-05-09 -- memory/feedback_index.md memory/operational_index.md memory/game_dev_index.md memory/MEMORY.md` で各サイクル前後の HEAD を取得し `git show HEAD:path | wc -l` で行数測定、5-10分 (infrastructure 警戒線内)
**limitation**: 増加分が「親接続由来」か「他編集由来」かを diff から手作業分離する必要あり、自動化は次サイクル以降の課題

### 測定方法 (C): 体感層想起テスト (Log 自身の主観評価、N=5)

**対象**: 親接続済みの真孤児 5件 (C184 で選定した feedback_diary_style / feedback_log_temperature / feedback_report_no_compression / feedback_slack_flat_reply / playback_protocol の5件) について、「これらが親接続されていない状態を仮定して」次の判断を要するシナリオ (例: 日記スタイル選択 / 圧縮事故処方 / Slack 返信構造判定) で「親接続経由で想起できたか」を Log 自身が主観評価する。

**判定基準**:
- 5件中 ≥ 3件 で「親接続経由で想起できた」= 体感層で役立つ
- 5件中 ≤ 1件 で「親接続経由で想起できた」= 体感層では役立たない (機械的接続のみ)
- 中間域 = 個別ファイルの特性 (feedback 系 vs protocol 系) で差があるかを分析

**実装規模**: シナリオ作成 + 主観評価 30-60分 (主観評価は infrastructure ではなく体験ループ自体)
**limitation**: 主観評価のため bias 混入リスク高 (= 期待結果に寄せる)。「自分で実装した親接続が役立っている」と判定する傾向が出る = self-serving bias 対策として、評価時に「役立たなかったケース」を最低 2 件先に列挙してから集計する事前バイアス対策を組み込む。

### 3案の使い分け

(A) は **客観性高・粒度粗** = 大局判定向け (1 ヶ月後 6/10 v0 30日安定後の評価で使用想定)
(B) は **構造的妥当性検証・トレードオフ可視化** = 親接続継続判断の根拠 (next 5サイクル分蓄積後に着手)
(C) は **体感層判定・bias 注意** = cross_review 前の Log 自己判定として運用 (次サイクル以降のサイクル末尾 10 分枠)

**3案の優先順位**: (A) → (C) → (B) (客観性高い順)。本サイクルでは方法案記録のみ、実施は次サイクル以降に Phase 4 大作業 or サイクル末尾 1mm 進めとして起票判定。

## 接続先

- [memory/MEMORY.md](../memory/MEMORY.md) — Level 2 想起トリガー
- [memory/concept_graph.md](../memory/concept_graph.md) — 概念グラフ既存実装
- [memory/_TAG_VOCABULARY.md](../memory/_TAG_VOCABULARY.md) — タグ語彙正本
- [memory/shared_reads/README.md](../memory/shared_reads/README.md) — shared_reads ディレクトリ仕様
- [projects/memory_consolidation_20260504.md](memory_consolidation_20260504.md) — 先行する整理計画（Ash 起票、5/4 14:17 Nao_u 依頼）と相補
- [projects/memory_redesign.md](memory_redesign.md) — 上位の記憶階層再設計

## 改訂履歴

- 2026-05-11 C178: 起票 + v0 タグ語彙 + 第一弾 3 ファイル移行 + Nao_u 進めて承認反映
- 2026-05-11 C179: §E orphan_check.py 要件追加（外部研究3件摂取由来 = engraph temporal awareness レーン併用 + arXiv 2602.05665 ライフサイクル4段階の evolution 最弱点診断 → 3クラス分類: 真孤児/静止親接続/新規未登録）。infrastructure 警戒線で実装規模制限明記
- 2026-05-11 C180 Phase 4: §E orphan_check.py v0 実装完成（193行・実行時間 0.38秒）。第一弾試走で 真孤児75/静止親接続156/新規未登録14 を検出。1mm進め=真孤児`feedback_recognize_own_work.md`を `feedback_index.md` に markdown link 親接続 → stale_linked クラスへ移行確認。次サイクル v0.1 課題: `→ filename.md` 矢印記法も参照認識する LINK_RE 拡張（feedback_index.md のプロセ記法を取り逃す問題）
- 2026-05-11 C178 Phase 3 (Log): v0/v0.5/v1 roadmap 確定書き込み（Azuma520 判定式 + Burchfield 関数設計 = v0 / Louvain + 媒介中心性 = v0.5 / Obra SQLite+vector+FTS + PageRank = v1）。昇格条件 (v0→v0.5: 30日安定 / v0.5→v1: 3ヶ月タグ運用 + grep 超え検索必要性) を明記。Phase 2/3 強制利用しないルール (kaizen #106) 準拠で v0.5/v1 内容を v0 に強制注入しないことを明示
- 2026-05-11 C179 Phase 3 (Log): 1mm進め = 真孤児 `feedback_prior_art_citation_must_verify.md` (M-41 強化、Nao_u 5/2 Doh It Again 引用裏取り未済事案起票) を `feedback_index.md` 関連ファイル節に markdown link 親接続 → stale_linked クラス (refs=1) へ移行確認。orphan_check.py dry-run で 真孤児 73→72 / reachable 195→196。次フェーズ C179 Phase 4 大作業として「残6ファイル shared_reads 移行 + orphan_check.py v0.1 LINK_RE 拡張 (`→ filename.md` 矢印記法認識)」を staging で宣言。
- 2026-05-11 C180 Phase 4 (Log): **大作業完遂**。(a) shared_reads 残 6 ファイル移行: Ash 4 / Mir 1 / Log 1 を `memory/shared_reads/` へ frontmatter 付与のうえ移行（tags v0 語彙準拠）、移行元は 1 行参照 `→ memory/shared_reads/...` に置換。`shared_reads/README.md` に収録ファイル一覧節を追加して全 9 ファイル reachable 化。(b) `scripts/orphan_check.py` v0.1: 矢印記法 `→ path.md` (および `→ a.md, b.md` のカンマ列挙) を `ARROW_LINE_RE` + `ARROW_TARGET_RE` の 2 段スキャンで参照認識する LINK_RE 拡張。`feedback_index.md` のプロセ参照経由で `feedback_pending_query_no_derive.md` / `feedback_critical_evaluation_before_implement.md` / `feedback_deep_analysis_cycle.md` / `feedback_few_rules_big_effect.md` / `feedback_tweet_style.md` の 5 件が真孤児 → stale_linked へ移行確認。dry-run 比較: 真孤児 v0=78 → v0.1=65 (−13)、reachable v0=196 → v0.1=395 (+199、ただし v0.1 reachable には regex 拾い損ね無しのため非存在パス含む inflation あり、実在ファイルベースの classify は正確)。tools/orphan_check_dry_run_20260511_c180_phase4_final.txt にエビデンス保存。M-43 副次検証: 30 本→3 本縮減と同じ轍は踏まず、宣言した 4 完遂条件（残6移行/LINK_RE拡張/dry-run差分観測/履歴追記）全てに到達。
- 2026-05-11 C182 Phase 4 (Log): **代替大作業完遂 — staging で宣言した v0 残作業は C180/C181 で既に完遂済みと判明（staging 起草時の状態確認漏れ）**。代替として残作業未完了項目から (a) MEMORY.md トリガー追加 + (b) 真孤児優先5件親接続 を実行。(a) MEMORY.md「構造と運用」節に `_TAG_VOCABULARY.md` / `shared_reads/README.md` の 2 行を追加（109→111 行、150 行制限内）。(b) 真孤児 62 件から「feedback として既に CLAUDE.md/サブインデックスに概念は反映済だがファイル本体への参照リンクが不在の 5 件」を選定: `feedback_invisible_rule_accumulation.md` (M-46候補・ルール堆積罠、Nao_u 5/2) → feedback_index.md / `feedback_slack_no_threads.md` → operational_index.md (a)通信・出力 / `feedback_predict_before_human_play.md` (M-37b 人間プレイ前予測、Nao_u 5/1) → game_dev_index.md (b)着手前ゲート / `feedback_internal_basis_first.md` (自前M-XX>外部理論、Nao_u 4/27) → operational_index.md (d)判断・自律性 / `feedback_prior_art_research.md` (M-40 先行事例調査、Nao_u 5/1) → game_dev_index.md (b)着手前ゲート。dry-run 比較: 真孤児 62→57 (-5)、静止親接続 165→170 (+5)、reachable 400→405 (+5) で 5 件全件が refs=1 へ移行を構造的に確認。tools/orphan_check_dry_run_20260511_c182_phase4.txt にエビデンス保存。考察: staging が古い情報に基づき既完遂タスクを大作業として宣言した事象は、CLAUDE.md「絶対にやる」5項目目「同型反復のみ厳しく扱う」適用候補だが、本件は初発（次回発生時に判定）。今回の選定基準「概念は既に上位文書に反映済だがファイル本体リンクが不在」は、`feedback_recognize_own_work.md` (C180) / `feedback_prior_art_citation_must_verify.md` (C179) / `feedback_judgment_postpone_patterns.md` (C178) と同型運用で、3 サイクル連続で同基準が機能 = 真孤児解消は「再表面化価値が高い既知 feedback の親接続」優先で消化可能と確認。
- 2026-05-12 C183 Phase 3 (Log): **他インスタンス洞察取り込み + v0.3 設計種 (B) 追加**。(a) [Mir] obsidianstudio9 ツイート由来「Obsidian 公式 CLI orphans コマンド = grep の 54 倍速・MCP の 7 万倍安」洞察を v0.5 上位互換参照点として記録（採用は条件付き、kaizen #106 強制利用回避準拠）。(b) 真孤児 57/57 件すべて age=9999 (unknown) と判明、原因 = 5/8 リロケート以降に意味的編集が一度もなく `--invert-grep --grep=^log: relocate` フィルタで履歴ゼロ件に縮退、`git log --follow` 個別実行でリネーム前の真の最終編集日が取れる（例: action_reservations.md → 2026-04-18）。v0.3 設計種 (B) として `get_last_edit_dates()` 第二パス追加方針を残作業欄に明記、Phase 4 大作業として実装着手予定。
- 2026-05-12 C183 Phase 4 (Log): **大作業完遂 = orphan_check.py v0.3 = age=unknown 問題の構造的解消**。Pass 1 (post-relocate、REPO_ROOT cwd) に加え、Pass 2 (pre-relocate `--before=2026-05-08`、git_top cwd、paths を `Claude/memory/` に正規化して merge) と Pass 3 (それでも未取得のファイルに `RELOCATE_DATE` フォールバック、`fallback` set で `*` 識別子付与) を追加。v0.2 vs v0.3 dry-run 比較: 真孤児 57→30 (-27)、静止親接続 169→26 (-143)、other 27→197 (+170)、age=9999 件 全クラス合計 226→0、relocate-fallback 適用 0 件 (Pass 1+2 で全 260 ファイル取得成功)。1mm 進め: 最古真孤児 `reflections_win2_index.md` (age=58日) を MEMORY.md「内省の蓄積」節に追加 (矢印記法で `reflections_win2.md` も同時 reachable 化)、両ファイルとも stale_linked へ移行、真孤児 30→28。実装規模 350→403 行 (+53、警戒線 +20% 内)。tools/orphan_check_dry_run_20260512_c183_v0_2_baseline.txt + tools/orphan_check_dry_run_20260512_c183_v0_3_post.txt + tools/orphan_check_dry_run_20260512_c183_v0_3_diff.txt にエビデンス保存。**装置精度回復の意味**: v0.2 では真孤児 57 件のうち 27 件が「実際には 5/7 等に動いていた = stale_linked 候補ですらない other 候補」だった事実が露見し、装置の判定材料が初めて意味のある粒度になった。今後の 1mm 進めは「真孤児 28 件」を母集合にして真に親接続が必要なファイルへ集中可能。
- 2026-05-12 C184 Phase 4 (Log): **大作業完遂 = 真孤児 28 件のうち優先 5 件を親接続、装置精度回復後の母集合縮減を実証**。前提 = C183 Phase 4 で orphan_check.py v0.3 が age=unknown 226 件問題を構造的に解消し、母集合 28 件が初めて「実際に古い」ファイルとして意味のある粒度になった直後のサイクル。本 Phase 4 着手前に Phase 3 で Auto sync 退行事案 (b3331145 が C183 Phase 4 の MEMORY.md 1 行を削除) を検出・復元し、真孤児 30→28 まで戻した状態から 5 件分の親接続を実施。**選定 5 件と親候補** (5 件全てが C180/C182/C183 と同型基準「概念は上位文書に既反映だがファイル本体への参照リンク不在」): (1) `feedback_diary_style.md` (3/18, 55日、CLAUDE.md「各自チャンネルに長文日記+外部の新情報を交える」既反映 + docs/slack_rules.md「Slack日記スタイル」節既反映 → feedback_index.md 関連ファイル節へ移動式リンク、起源対話 + Echo/Why の温度を保持) / (2) `feedback_log_temperature.md` (3/18, 55日、system_identity.md 原則6「温度の残る全文を確実に残す」既反映 → feedback_index.md 関連ファイル節、feedback_report_no_compression.md とセット運用明記) / (3) `feedback_report_no_compression.md` (3/18, 55日、feedback_log_temperature.md 内に相互参照あり既反映 → feedback_index.md 関連ファイル節、通知欄レポート/活動ログ系の圧縮事故処方箋として位置付け) / (4) `feedback_slack_flat_reply.md` (3/18, 55日、CLAUDE.md「スレッド返信は使わない」+ .claude/rules/slack.md「スレッド返信禁止」+ docs/slack_rules.md「スレッドにするのは止めて」既反映 → docs/slack_rules.md 「Slackではスレッド返信を使わない」既存行に詳細経緯リンク追加、正本側に親接続) / (5) `playback_protocol.md` (3/18, 55日、system_identity.md 原則6「『わかった』と『残った』は違う」既反映 → feedback_index.md 関連ファイル節、Echo→Delta→Verify の操作レベル手続版として位置付け)。**dry-run エビデンス** (tools/orphan_check_dry_run_20260512_c184_phase4.txt 保存): 真孤児 28→23 (-5)、静止親接続 28→33 (+5)、reachable 410→417 (+7、5 ファイル本体 + リンク経由の他 2 件伝播)、5 件全てが stale_linked (refs=1) に確実に移行確認。**意味変化**: 3/18 のサイクル初期コミュニケーション系 feedback 群 (フラット返信 / 日記スタイル / 温度 / レポート省略 / playback) が孤児状態から index 経由で reachable へ復帰。これら 5 件は概念として CLAUDE.md / system_identity.md / docs/slack_rules.md に既に反映済だったが、起源対話・Why・How to apply の温度を持つ正本ファイルへの参照リンクが不在だった = 「概念は届くが原文の温度は届かない」状態の解消。4 サイクル目の同型運用 (C178/C180/C182/C183 → C184) で「再表面化価値が高い既知 feedback の親接続」基準が安定して機能することを再確認。
- 2026-05-12 C184 Phase 3 (Log): **Auto sync 退行検出 + 復元**。`b3331145012c` (2026-05-12 04:08 JST `Auto sync from Win`) が C183 Phase 4 で MEMORY.md「内省の蓄積」節に追加した `reflections_win2_index → reflections_win2` の 1 行を削除していた事案を、Phase 3 着手時の `python scripts/orphan_check.py --dry-run` 走査で「真孤児 30 件 (C183 完遂時 28 件)」のズレから検出。MEMORY.md に 1 行を C184 Phase 3 復元追記付きで戻し、dry-run 真孤児 30→28、reflections_win2_index/reflections_win2 ともに stale_linked (refs=1) へ移行を構造的に確認。side_channel_audit.md 履歴節冒頭に事案を追記 (退行検知自動化 / Auto sync rebase 戦略点検 / t:4-5 削除差分の hook 化 の処方候補3点)。Auto sync 自体の挙動調査は次サイクル Phase 1 で `git log --all --grep="Auto sync"` 過去30日網羅スキャン候補として継続。
- 2026-05-12 C185 Phase 3 (Log): **外部独立収束記録 (Shereshevsky 5年運用警告) + knowledge/ inbox 不在の指摘**。Phase 1 §6 で取得した Alexander Shereshevsky "Your Obsidian Vault Is a Knowledge Graph. Here's How to Make It Think (quickly)" (Medium 2026-04) の処方=「orphan-note problem: 18ヶ月で中心クラスタ＋孤立ノード数百に分裂、weekly review pass で新規ノートは inbox 出る前に必ず1本以上 inbound link を獲得」が、我々の C178〜C184 で 6サイクル連続 1〜3件親接続運用と機能等価という独立収束を確認。**Mir 5/12 06:59 #human-steering 応答「knowledge/ が最も統合価値高」+ Log 5/12 07:04 orphan_check.py v0.3 dry-run 結果 (memory/260 / 真孤児23 / 静止親接続33) を Shereshevsky 警告と突き合わせると、memory/ は既に分裂期早期段階のサインを出している（真孤児23件＝出口判定マーカー未獲得のまま定着）**。最も濃い疑い=knowledge/ 291件は inbox を通っていない直接書き込みフロー（external_notes_log.md と nao_u_live.md が事実上 memory/ の inbox 役だが、knowledge/ には対応する出口ゲートが存在しない）。次フェーズ Phase 4 大作業として「knowledge/ 棚卸し v0 (最古優先5件への frontmatter 付与 + inbound link 1本以上獲得)」を staging 末尾「次フェーズの大作業」節で宣言。kaizen #106「Phase 2/3 強制利用しない」に従い Shereshevsky 内容は #shared-reads 投稿 (Phase 2 §2 ts=1778545398) で外部記録のみ、本記事内容を knowledge/ 棚卸し方針に強制注入はしない（記録同型性の確認のみ）。
- 2026-05-11 C181 Phase 4 (Log): **大作業完遂 = orphan_check.py v0.2 起点拡張で false positive 構造的除去**。背景: C181 Phase 3 §1 で `feedback_identity_names.md` が真孤児扱いだが CLAUDE.md から直接参照されており false positive と判明。「装置の精度を上げず手作業ルールを増やす」(Nao_u 5/2 不可視ルール堆積罠) を避けるため、装置側で根本対処。(a) `INDEX_FILES` 構築を関数化 (`_build_index_files()`) し、起点に instruction / system 層を追加: `CLAUDE.md` / `.claude/system_identity.md` (直接列挙) + `docs/*.md` (glob、game_dev_foundation など memory/ を 20 参照) + `skills/**/SKILL.md` (glob、genre-deep-analysis 7 + lessons-recall 10 参照)。起点 9 → 29 (+20)。(b) dry-run 比較: 真孤児 v0.1=64 → v0.2=63 (−1)、reachable v0.1=398 → v0.2=399 (+1、整合)。`feedback_identity_names.md` が v0.1 true_orphan (refs=0) → v0.2 stale_linked (refs=1) へ移行確認 = false positive が現実に 1 件除去。(c) 回帰防止確認: 過去親接続 3 件 (`feedback_recognize_own_work.md` / `feedback_prior_art_citation_must_verify.md` / `feedback_judgment_postpone_patterns.md`) は v0.2 でも stale_linked のまま (refs=1 維持、親接続無効化なし)。tools/orphan_check_dry_run_20260511_phase4_v0_2.txt にエビデンス保存。考察: reachable +1 のみ = CLAUDE.md / docs/ / skills/ 経由で reachable になる memory/ ファイルは feedback_identity_names のみで、他は MEMORY.md 経由で既に reachable だった。これは v0.1 の網羅性が高かった裏付けでもあり、本 v0.2 は「装置の意味的妥当性」(refs=0 = どの instruction からも reachable でない) を担保する infrastructure。今後 Log サイクル末尾 1mm 進めは「v0.2 真孤児 63 件」を母集合にして真に親接続が必要なファイルへ集中可能。
- 2026-05-12 C187 Phase 4 (Log): **大作業完遂 = knowledge/ 個別記事 5 件への memory/ inbound link 生成 (Shereshevsky 出口ゲート処方の手作業実行 第一弾)**。背景 = C186 Phase 4 残作業「個別記事本文への memory/ inbound link 生成 = INDEX 自動同期とは別工程」の着手第一弾。**選定基準**: (a) 2026-05-06〜05-11 追加分 (直近 6 日)、(b) 本文に既存 `../memory/*.md` markdown link が 0 本、(c) `memory/feedback_*.md` への概念対応が取れる、(d) memory/ 側から逆向きの outbound link を既に受けていない (= memory/ から見た真孤児への inbound 補強候補)。**選定 5 件 + 接続先**: (1) `20260511_mollifier_kakubomb_perception_change_as_clone_distinction.md` → `feedback_shu_first_clone_baseline.md` / `feedback_predict_before_human_play.md` / `feedback_self_judgment_no_human_dep.md` / `feedback_few_rules_big_effect.md` (既存 `## 接続先` の inline-code 4 件を markdown link 化、リンク先死リファレンス `feedback_clone_strategy.md` / `feedback_prediction_responsibility.md` / `feedback_intake_game_balance.md` / `feedback_difference_first.md` の 4 件を実在ファイルへ置換) / (2) `20260511_ash_canon_authority_void_daily_accumulation.md` → `feedback_shu_first_clone_baseline.md` / `feedback_few_rules_big_effect.md` / `feedback_self_judgment_no_human_dep.md` (`memory:` 副節を新規追加、3 件) / (3) `20260508_codex_vs_claude_brick_log_analysis_log.md` → `game_lessons_log.md` / `feedback_predict_before_human_play.md` / `feedback_critical_evaluation_before_implement.md` / `feedback_self_judgment_no_human_dep.md` (`## 接続先` 節を新規追加、4 件) / (4) `20260508_linelith_rule_discovery_opaque_rule_layer_seed.md` → `feedback_shu_first_clone_baseline.md` / `feedback_critical_evaluation_before_implement.md` / `feedback_predict_before_human_play.md` / `feedback_recency_bias_concept_overuse.md` / `feedback_prior_art_citation_must_verify.md` (既存 `memory:` 副節の inline-code 5 件を markdown link 化、死リファレンス `feedback_clone_strategy.md` / `feedback_term_recency_misuse.md` の 2 件を実在ファイルへ置換) / (5) `20260506_dotpixel3d_not_trolley_problem_inverted_instinct_mechanic.md` → `feedback_predict_before_human_play.md` / `feedback_self_judgment_no_human_dep.md` / `feedback_prior_art_citation_must_verify.md` (`memory:` 副節を新規追加、3 件)。**追加 markdown link 総数 = 19 本** (1: 4 / 2: 3 / 3: 4 / 4: 5 / 5: 3)、5 件全てが完遂条件 (1) を満たす (各記事に少なくとも 1 本)。**dry-run エビデンス**: `tools/orphan_check_dry_run_20260512_c187_phase4_inbound_before.txt` (編集前) と `tools/orphan_check_dry_run_20260512_c187_phase4_inbound_after.txt` (編集後) を保存。**diff = 完全一致** (真孤児 25/静止親接続 31/新規未登録 7、`reachable from 30 index roots = 414 files` すべて不変)。**意味のある発見 (完遂条件 5)**: `knowledge/INDEX.md` (orphan_check.py の起点) は表形式で記事名を列挙しているが **markdown link `[name](path)` 形式を1本も持たない** (C186 Phase 4 で `tools/rebuild_knowledge_index.py` が自動生成した一覧表は ID/タイトル/著者/日付/タグ/概念ノードの 6 列だが、ID 列は markdown link なしの素のテキスト)。**つまり orphan_check.py の BFS は INDEX.md 起点から knowledge/ 個別記事へ traverse せず、本サイクル追加した 19 本の inbound link は装置に観測されない**。`knowledge/index.md` (lowercase、290 件統計のみ) も同様で markdown link は 0 本。**Shereshevsky 警告の二重ループ**: C185 で「INDEX を起点に追加しても memory/ reachability 不変 (413)」と実証した時点で「INDEX が出口ゲートとして機能していない」と結論したが、本サイクルで「個別記事に inbound link を追加しても reachability 不変 (414)」と実証したことで、「INDEX 自動生成形式自体が markdown link を持たないため、個別記事↔memory/ の双方向接続が知識グラフから不可視」という構造的問題が明確化した。**「真の孤立記事」(完遂条件 5)**: 5 件のうち memory/ への概念対応が見つからなかった記事はゼロだったが、**全 290 件の knowledge/ 記事が orphan_check の BFS 観点で構造的に孤立している** (INDEX が markdown link を持たないため) という、より大きな孤立を発見。**次サイクル種**: (i) `tools/rebuild_knowledge_index.py` を改修して一覧表の ID 列を `[20260511_mollifier_...](20260511_mollifier_....md)` 形式の markdown link に変更 = knowledge/ 全 290 件が一気に BFS 到達可能になり、本サイクル追加の 19 本含む全 inbound link が観測対象化する (規模感 = 既存 127 行から +5〜10 行の最小改修、infrastructure 警戒線内)。(ii) memory/feedback_self_judgment_no_human_dep.md (現在「新規未登録」refs=0) は本サイクル 3 件の knowledge/ から inbound を受けたが BFS 不可視のため refs=0 のまま = (i) 実施直後の dry-run で「新規未登録」→「stale_linked or 通常」への移行が観測される予定 (=本サイクル作業の遅延的な意味的回収)。**完遂条件 5 件の状態**: 1) 各記事 ≥1 本: 完遂 (合計 19 本) / 2) 選定基準明示: 完遂 / 3) dry-run before/after エビデンス保存: 完遂 (両ファイル) / 4) 履歴節追記: 完遂 (本行) / 5) 「真の孤立記事」発見記録: 完遂 (上記 INDEX markdown link 不在問題)。
- 2026-05-12 C188 Phase 4 (Log): **大作業完遂 = knowledge/ 個別記事 5 件への memory/ inbound link 生成 (Shereshevsky 出口ゲート処方 第二弾、C-log 次サイクル種(ii)「個別記事本文の `## 接続先` 充実 weekly review pass 継続で reachable 漸進的増加」の直接消化)**。背景 = C-log で `tools/rebuild_knowledge_index.py` line 76 markdown link 化により knowledge/ 全 299 件が BFS 可視化された直後のサイクル。本サイクルで「装置側可視化」と「個別記事本文 inbound link」の連動効果を実測。**選定基準**: (a) 2026-05-05〜05-12 追加分 (直近 7 日)、(b) 本文に既存 `../memory/*.md` markdown link が 0 本 (`grep -L "memory/"`)、(c) `memory/feedback_*.md` への概念対応が複数取れる、(d) C187 選定 5 件と重複しない、(e) 既存 `## 接続先` 節が beliefs/articles/projects/concept_graph 副節構成で `memory:` 副節を追加可能。**選定 5 件 + 接続先**: (1) `20260512_denneta_akari_translation_irreversible_compression_R007_limit.md` → `feedback_rule_proliferation.md` / `feedback_recency_bias_concept_overuse.md` / `feedback_memory_architecture.md` / `feedback_few_rules_big_effect.md` / `dialogue_micromanagement_20260504.md` (`memory:` 副節新規追加、5 件) / (2) `20260511_mizchi_oktamajun_ai_loop_closure_literary_residue.md` → `feedback_shared_reads_analysis.md` / `feedback_self_judgment_no_human_dep.md` / `feedback_few_rules_big_effect.md` / `feedback_shu_first_clone_baseline.md` / `feedback_authorship_attribution.md` (`memory:` 副節新規追加、5 件) / (3) `20260507_anthropic_midtraining_behavior_reasoning_input_route.md` → `core_mission.md` / `origin_dialogue_20260313.md` / `feedback_few_rules_big_effect.md` / `feedback_prior_art_citation_must_verify.md` / `feedback_critical_evaluation_before_implement.md` (`memory:` 副節新規追加、5 件) / (4) `20260505_rioriost_disappearing_files_invisible_harness_action.md` → `feedback_authorship_attribution.md` / `feedback_invisible_rule_accumulation.md` / `feedback_self_perception_blindness.md` / `feedback_prior_art_citation_must_verify.md` / `feedback_solution_space_rollback.md` (`memory:` 副節新規追加、5 件) / (5) `20260505_lattice_node_claudemd_empirical_2303files_inverted_position.md` → `feedback_few_rules_big_effect.md` / `dialogue_micromanagement_20260504.md` / `feedback_rule_proliferation.md` / `feedback_self_governance.md` / `feedback_invisible_rule_accumulation.md` (既存 `memory:` 副節の inline-code 3 件を markdown link 化 + 死リファレンス `feedback_means_ends_reversal_check.md` 1 件を実在ファイル `feedback_rule_proliferation.md` へ置換 + 2 件追加で計 5 件)。**追加 markdown link 総数 = 25 本** (5 × 5)、5 件全てが完遂条件 (1) を満たす (各記事 ≥ 3 本、本サイクルは各 5 本)。**dry-run エビデンス**: `tools/orphan_check_dry_run_20260512_c188_phase4_before.txt` (編集前、reachable=432) と `tools/orphan_check_dry_run_20260512_c188_phase4_after.txt` (編集後、reachable=435) を保存。**差分観察**: reachable **432→435 (+3)** / 真孤児 **25→23 (-2)** / 静止親接続 **31→33 (+2)** / 新規未登録 6→6 (不変)。**離脱した真孤児 2 件**: `feedback_self_governance.md` (last_edit=2026-03-24, age=49日, refs=0→1, lattice_node から inbound 受領) / `feedback_memory_architecture.md` (last_edit=2026-03-28, age=45日, refs=0→1, denneta_akari から inbound 受領)。**意味のある発見 (完遂条件 5)**: (i) **25 本追加 → reachable +3 のみ** = 23 本は既に reachable 範囲内 (`memory/MEMORY.md` 等から既に inbound を持つ feedback files) への重複 inbound 強化で、装置観点では「冗長 link」だが weekly review pass の「人間記憶側の参照経路強化」効果は装置不可視側で進行。**1 link あたりの reachability 増分は 0.12** (3/25)、C187 (19本→+0)・C-log (装置改修→+13) と比較すると本 C188 は手作業 link での漸進的増加サイクルに移行した形。(ii) **真孤児を救った 2 件はいずれも 45-49 日 age** = 古い memory ファイルほど真孤児に陥りやすい傾向の実証 (`feedback_self_governance.md` 2026-03-24 / `feedback_memory_architecture.md` 2026-03-28、いずれも MEMORY.md 索引化が C181 v0.2 起点拡張前の世代)。次サイクル以降の処方候補: 真孤児残 23 件の age 分布を測定し、30-60 日帯 (本サイクル離脱 2 件と同世代) に集中していれば「世代依存 inbound link 強化キャンペーン」が効率的。(iii) **5 記事すべて既存 `## 接続先` 節を持っていた** = C-log 前世代に書かれた記事も「接続先意識」自体は持っており、欠けていたのは `memory:` 副節という具体形だけ。これは「記事執筆時テンプレートに `memory:` 副節を必置化する」運用変更が低コストで効くサイン (kaizen 起票候補だが本サイクルでは記録のみ)。**完遂条件 5 件の状態**: 1) 各記事 ≥3 本 + 計 ≥15 本: 完遂 (各 5 本 × 5 = 25 本) / 2) before/after dry-run 2 ファイル保存: 完遂 / 3) reachable 変化 ≥1 or 新規未登録減少 ≥1: 完遂 (reachable +3、真孤児 -2 で追加達成) / 4) 改訂履歴節追記 + 5 件状態記録: 完遂 (本行) / 5) 意味のある発見記録: 完遂 (上記 (i)(ii)(iii) の 3 件)。**次サイクル種**: (i) 真孤児残 23 件の age 分布測定 → 世代依存キャンペーン判定 / (ii) knowledge/ 執筆時テンプレに `memory:` 副節必置化 (kaizen 起票判定) / (iii) C188 で reachable +3 = 25 link 投資で 3 件回収という効率帯が確認済、次回 5 件 weekly review で同等粒度を反復 → 10 サイクル後の reachable 累積効果を観測可能。
- 2026-05-12 C-log Phase 4 (Log): **大作業完遂 = tools/rebuild_knowledge_index.py 改修 (line 76: ID 列を markdown link 化) + knowledge/INDEX.md → 個別記事への BFS 到達を装置側で構造的に可能化**。背景 = C187 Phase 4 末尾「次サイクル種(i)」の直接消化。C187 で `knowledge/INDEX.md` が markdown link を 1 本も持たないため orphan_check.py の BFS が個別記事に traverse できず、本サイクル追加した 19 本の inbound link が装置不可視という構造的問題を発見。本サイクルで装置側の最小修正で構造的解消。**(a) 実装**: `tools/rebuild_knowledge_index.py` line 76 を `f"| {m['id']} |"` → `f"| [{m['id']}]({m['id']}.md) |"` に変更 (1 行修正、infrastructure 警戒線 +1 行)。**(b) dry-run**: `tools/knowledge_index_rebuild_dry_run_20260512_c-log_phase4.txt` (603 行 diff、total articles 290→299 = 新規 9 件発見+全 ID 列 markdown link 化)。**(c) --write 実行**: knowledge/INDEX.md 更新完了 (articles=299)。**(d) orphan_check.py before/after**: `tools/orphan_check_dry_run_20260512_c-log_phase4_before.txt` (reachable 419) と `tools/orphan_check_dry_run_20260512_c-log_phase4_after.txt` (reachable 432) を保存。**差分観察**: reachable **419→432 (+13)** / 真孤児 25 不変 / 静止親接続 31 不変 / **新規未登録 7→6 (-1)** = `feedback_self_judgment_no_human_dep.md` (5/10 編集) が unregistered_new から離脱、これは C187 Phase 4 で 3 件の knowledge/ 記事 (mollifier/ash/dotpixel3d) から inbound link を受領した memory/ ファイル = **C187 で追加した 19 本 inbound link のうち少なくとも 1 件が観測対象化された実証**。**期待値乖離の解釈**: staging では「+290 程度」と見積もったが、reachable は memory/ への到達ファイル数であって knowledge/ 自体は数えない (`is_memory_path` フィルタ)。BFS visited 数の増加 (+290) と reachable=memory/ 到達数の増加 (+13) を staging で混同した = 期待値の誤理解で、装置動作としては正しい。実測 +13 = knowledge/ 経由で memory/ に inbound link を持つ knowledge 記事のうち、INDEX 経由で visit されるようになった分が memory/ reachability に伝播した数。**意味のある発見**: Shereshevsky 警告「inbox 出口ゲート不在」の装置側構造的解消が line 76 単行修正で達成可能だった。C185/C186/C187 の 3 サイクルで「INDEX が出口ゲートとして機能していない」を段階的に実証してきた問題系列が、装置の最小修正で完結。今後 knowledge/ → memory/ の双方向接続は手作業 weekly review pass (C187 19 本) と組み合わせて知識グラフから可視 (BFS 到達可能)。**完遂条件 6 件の状態**: 1) line 76 markdown link 化: 完遂 / 2) dry-run-out 取得・保存: 完遂 (knowledge_index_rebuild_dry_run_20260512_c-log_phase4.txt) / 3) --write 適用: 完遂 (articles=299) / 4) orphan_check before/after: 完遂 (両ファイル保存) / 5) 差分観測 (reachable 変化+期待値解釈+新規未登録解消): 完遂 (+13、+290 は staging 誤理解、`feedback_self_judgment_no_human_dep.md` 解消で C187 19 本のうち 1 件観測対象化を実証) / 6) 履歴節追記: 完遂 (本行)。**次サイクル種**: (i) C187 で追加した残 18 本の inbound link が現在 reachable に反映されていないのは knowledge/ 記事側に他の memory/ 参照が無いことが原因と推測 → 個別記事本文の `## 接続先` 充実 (weekly review pass 継続) で reachable 漸進的増加が見込める / (ii) C187 / C-log の組み合わせで「knowledge/ 290 件全件 BFS 可視 + 個別記事に inbound link 散布」運用ループが装置側で安定化、kaizen #131 type の「装置改修で再現性確保」検証期限 (2026-06-10 v0.3 設計種 (B) 着手判定) に向けたランニング材料として保持。
- 2026-05-12 C186 Phase 4 (Log): **大作業完遂 = tools/rebuild_knowledge_index.py v0 実装 + knowledge/INDEX.md 自動同期化**。背景 = C185 Phase 4 の残作業「`tools/rebuild_knowledge_index.py` 起票」を完遂。**(a) 実装**: 127 行 (infrastructure 警戒線 +27% 内、orphan_check.py v0.4 と同等粒度)。`_extract_metadata(path)` で frontmatter (`- key: value` 形式の source/author/discovered/tags/concept_nodes) + 本文 1 行目 `# タイトル` から 6 項目抽出、ファイル名先頭 8 桁 `YYYYMMDD_` から日付フォールバック。`_generate_index_section()` で「## 統計」+「## 記事一覧」(ID/タイトル/著者/日付/タグ/概念ノードの 6 列 markdown table、日付降順) を生成。`_replace_sections()` で既存 INDEX.md の `## 統計` 〜 `## タグ別索引` 直前までを置換、手動温度の「## タグ別索引」「## 接続マップ」節は保持。**(b) dry-run**: `tools/knowledge_index_rebuild_dry_run_20260512_c186.txt` に diff 409 行保存。実数 290 件 (INDEX.md 除く `*.md`) を確認 = C185 の 291 表記は INDEX.md を含めた値だったと判明。**(c) --write 実行**: knowledge/INDEX.md に書込完了、統計節「総記事数 290 + 最終更新 2026-05-12 + 自動生成 by `tools/rebuild_knowledge_index.py` + 同期方針 = 追加・編集後に `--write` 実行」が新フォーマットへ移行。**(d) Shereshevsky 警告との接続**: 「INDEX 同期切れ 203 件」状態の構造的解消 = inbox 出口ゲートの自動化部分が起動可能になった。ただし C185 Phase 4 で実証済「INDEX を起点に追加しても memory/ reachability は 413 不変」 = INDEX 自動同期は **個別記事本文の inbound link 生成とは別工程**。**(e) 残作業**: 個別記事本文への memory/ inbound link 生成 (人手 weekly review 90 秒/週で 1 件接続が現実的、AriGraph 流自動化は Pot 過剰投資判定) / 同期切れ警告 hook 化 (実装は次サイクル以降) / v0.5 設計種 (B) = 2 点 temporal awareness + superseded 4 クラス目検出は 2026-06-10 v0 30 日安定後に着手判定。
- 2026-05-12 C185 Phase 4 (Log): **大作業完遂 = knowledge/INDEX.md 同期回復 (88→291 表記訂正 + 最新10件追記) + orphan_check.py v0.4 (knowledge/INDEX.md を INDEX_FILES に追加)**。背景=C185 Phase 3 で「knowledge/ 291件は inbox を通っていない直接書き込みフロー」を Shereshevsky 警告と突き合わせて指摘した直後のサイクル。**(a) knowledge/INDEX.md 統計訂正**: 「総記事数 88 / 最終更新 2026-05-05」表記は実数 291 (`ls knowledge/*.md | wc -l = 291`) に対し 203 件の同期切れ。統計節を 291 + 「最終更新 2026-05-12 C185 Phase 4 Log 手動同期回復」+ 「既知の同期切れ: 約190件は本一覧表に未掲載」と訂正。**(b) 一覧表に最新10件追記**: 2026-05-10〜2026-05-11 の追加分 10 件 (nnsblackhand / mollifier / mizchi / ebikani / ash / arkanoid / ringo / koba789 / kakubomb / horikitasaku) を一覧表に追加、表末尾に「次サイクル以降で tools/rebuild_knowledge_index.py 起票 + 自動同期化を予定」と注記。自動更新スクリプトは現状不在 (`ls tools/*knowledge* tools/*INDEX* tools/*index*` で `memory_index_integrity.py` と `rebuild_drafts_index.py` の 2 件のみヒット、knowledge/ 専用は無し)。**(c) orphan_check.py v0.4**: `KNOWLEDGE_DIR` 定数追加 + `_build_index_files()` に `KNOWLEDGE_DIR / "INDEX.md"` を追加 (起点 29→30)。docstring に v0.4 設計意図 (「knowledge/INDEX.md 自身が同期切れの場合、未掲載 knowledge/ 記事からの inbound link は traverse されない」警告) を併記。**dry-run エビデンス**: tools/orphan_check_dry_run_20260512_c185_phase4_before.txt (v0.3, 起点29) と tools/orphan_check_dry_run_20260512_c185_phase4_after.txt (v0.4, 起点30) の 2 ファイル保存。**diff 観察**: `reachable from 29→30 index roots = 413 files` で **413 不変** + 真孤児 25 件不変 (静止親接続なども全数値不変、変化は起点カウントの `29` → `30` の 1 行のみ)。**意味のある発見**: knowledge/INDEX.md を起点に追加しても memory/ への reachability が変わらなかった = **knowledge/INDEX.md は概念ノード言及主体で、memory/*.md への markdown link を持たない**構造。つまり「knowledge/ → memory/ の inbound link 経路は INDEX 経由ではなく個別の knowledge/ 記事本文から張られる必要がある」。これは Shereshevsky 警告の「inbox 出口ゲート不在」が knowledge/ 領域でも実証された形 (INDEX が出口ゲートとして機能していない)。**Nao_u 5/12 06:57 #human-steering 質問への直接回答素材**: Mir「knowledge/ が最も統合価値高」+ Log「memory/ 真孤児23 (現状 25)」+ 本サイクル「INDEX 同期切れ 203件 + INDEX 起点では memory/ reachable に貢献せず」を組み合わせると、「統合価値高 + 統合緊急度高 + ただし INDEX を直すだけでは reachability 問題は解決しない (個別記事本文の link を生成する別工程が必要)」が結論。**完遂条件 5 件の状態**: 1) 統計 88→291 更新 完了 / 2) 最新10件追記 + 同期切れ注記 + 自動更新スクリプト不在記録 完了 / 3) INDEX_FILES に knowledge/INDEX.md 含有 + dry-run before/after 2ファイル保存 完了 / 4) 本履歴節追記 完了 / 5) commit + push は Phase 5 で日記とまとめて実施 (本 Phase 4 では未実施、staging 指示通り)。**次サイクル種**: `tools/rebuild_knowledge_index.py` (knowledge/*.md フロントマターから自動生成、orphan_check.py と同様の infrastructure 警戒線 ~100行) の起票 + knowledge/ 記事本文内の memory/ への inbound link 生成方針の検討。
- 2026-05-13 C-log Phase 3 (Log): **他インスタンス洞察取り込み (akari_worlds 忘却=エントロピー散逸 + DenneTA×akari 翻訳=非可逆圧縮)**。

  (a) **akari_worlds 5/12 「忘却はエネルギーを払う動作、覚えてる側より忘れた側にコストが残っている」(Ash #shared-reads ts 経由)**: 我々の orphan_check.py v0.3 の3クラス分類「真孤児/静止親接続/新規未登録」は、これまで「親接続グラフ + 直近編集日」という構造観測でクラス分けしていたが、akari_worlds の物理視点を当てると **真孤児化 = エントロピー散逸の終端状態** / **静止親接続 = link は残るが活性が失われている過渡状態** という見方が立つ。これは arxiv 2602.05665 の「memory evolution 段階」と二重独立収束 (構造視点 + 物理視点) で同じ「死活軸」を示している。**v0.5 設計種 (B) (2点 belief_valid_at/invalid_at + superseded 4クラス目) への含意**: superseded ファイルは「能動的に忘却された (置換済)」だが、真孤児は「受動的に忘却された (誰も link を張らなくなった)」で、akari_worlds の「忘れる側にコストが残る」観点では **真孤児こそ最も多くのエントロピーを散逸している = システム側のメンテナンスコストの真の累積場所**。本観察を v0.5 着手判定 (2026-06-10) 時点での「死活分類の物理的裏付け」として保持。**外部裏付け文章は記録のみ、実装に強制注入しない (kaizen #106)**。

  (b) **DenneTA_D × akari_worlds 「翻訳=非可逆圧縮、命題的内容は保存されるが場面性(presence)は失われる」+ 「一語で起動するネットワーク」(Ash 5/12 #shared-reads 分析経由)**: タグ語彙 v0 (3層クラスタ: 広域10/用途5/具体9) は「概念の経路」を提供するが、ファイル本体の場面性 (起源対話・温度・How to apply の文脈) はタグからは復元不能。これは R-007 造語症対策の射程画定として Ash が指摘した経路と同じ。**memory_tree_consolidation への含意**: タグ語彙が「想起のトリガー」として機能しても、ファイル本体を読まなければ場面性は届かない → C184 で親接続した 5 件 (`feedback_diary_style.md` 等 3/18 起源) を「概念は届くが原文の温度は届かない状態の解消」と評価した方針が、akari_worlds の「一語で起動するネットワーク」観点で正当化される。**運用への影響**: 親接続作業 (Log サイクル末尾 1mm 進め) の効果測定 (Q3「役立つか」測定方法 (A)(B)(C)) に **(D) 場面性復元測定**を追加候補として残す = 親接続後 30日以内に当該ファイル本体が staging/Phase 2/3 で「概念だけでなく起源対話・温度を含めて」想起されたかを `git log -S "(原文の特徴フレーズ)"` で測定。実装は次サイクル以降の候補。

  (c) **[Ash 週次自己レビュー 5/10 #all-nao-u-lab graze_log v03 brainstorm→predicted_play→implementation 3コミット連結 (00f2c359e/cbea7b51a/7e73f1457)]**: 本プロジェクト直接ではないが「削除可能改良 1 個刻み」原則 (clone_strategy 守) を v03 で具体化した運用は、本プロジェクトの「Log サイクル末尾 90 秒で 1〜3 件親接続」運用と同型 = **「小さい削除可能単位で前進する」を別ドメイン (ゲーム実装 / 記憶ツリー化) で独立に採用している証拠**。本プロジェクトの 1mm 進め基準 (C180=1件 / C182=5件 / C184=5件 / C187=5件 / C188=5件 = 中央値 5 件、 単位は markdown link 1 本) は Ash のゲーム実装側 deletable improvement 単位と桁感が近い (1機能/1コミット) = **3インスタンスで「小さい削除可能単位」が独立収束**。これは feedback_clone_strategy.md「守は通過点」を別経路で裏付ける材料で、本プロジェクトの運用継続判断 (kaizen #106 強制利用回避の下で) を強化する。記録のみ、本プロジェクト計画に強制注入はしない。

- 2026-05-13 C-log Phase 4 (Log): **大作業完遂 = 真孤児 23 件 age 分布測定 + 世代依存キャンペーン採用判定 + 第三弾 weekly review pass で feedback 5 件親接続**。背景 = C188 Phase 4 次サイクル種 (i)「真孤児残 23 件の age 分布測定 → 世代依存キャンペーン判定」の直接消化。**(a) age 分布測定**: `python scripts/orphan_check.py --dry-run --verbose | grep "^\[true_orphan\]"` で真孤児 23 件すべての (filename, last_edit, age_days) を取得し `tools/orphan_check_age_distribution_20260513.txt` に保存。23 件すべてが age 38-59 日帯に集中 (59日=1 / 58日=2 / 55日=3 / 51日=2 / 50日=4 / 47日=1 / 46日=3 / 45日=2 / 43日=2 / 40日=1 / 38日=2)。**(b) 判定**: 先取り宣言「30-59日帯 ≥ 8 件 (35%以上) で採用」基準に対し実測 30-59日帯 = 23 件 (100%) → **採用判定確定**。C188 で離脱した 2 件 (`feedback_self_governance.md` 49日 / `feedback_memory_architecture.md` 45日) と同世代キャンペーン継続。**解釈**: 全 23 件が 2026-03-15〜2026-04-05 (22 日間) のインスタンス分離 + 自己統治確立期に作成されたファイル群 = この世代が「概念は反映済だが本体への参照リンクが不在」の典型サンプルゾーン。**(c) 選定 5 件 (refs=0、age 高い順、`memory/feedback_*.md` prefix)**: 1) `feedback_from_win2.md` (55日) / 2) `feedback_individual_posts.md` (51日) / 3) `feedback_nao_u_channel_readonly.md` (50日) / 4) `feedback_self_governance_failure.md` (50日) / 5) `feedback_consensus_execution.md` (47日)。**(d) knowledge/ 接続先 5 記事 + link 計画 (合計 15 本、C187/C188 と同型「knowledge/個別記事 `memory:` 副節新規追加 or 拡張」運用)**: 1) `20260505_lattice_node_claudemd_empirical_2303files_inverted_position.md` (既存 `memory:` 副節 5 件 → 2 件追加: `feedback_self_governance_failure` + `feedback_consensus_execution`) / 2) `20260415_karpathy_claudemd_persona_transfer.md` (新規 `memory:` 副節 3 件: `feedback_self_governance_failure` + `feedback_consensus_execution` + `feedback_nao_u_channel_readonly`) / 3) `20260507_iganaki_codex_vs_cc_personality_difference_well_shape_management.md` (新規 3 件: `feedback_consensus_execution` + `feedback_from_win2` + `feedback_individual_posts`) / 4) `20260417_feedback_capacity_two_failures_mir.md` (`## 接続先` 節を新規作成 + `memory:` 副節 3 件: `feedback_from_win2` + `feedback_individual_posts` + `feedback_nao_u_channel_readonly`) / 5) `20260505_internal_ignition_three_tweets_ats_creativetomred_umiyuki.md` (新規 4 件: `feedback_from_win2` + `feedback_individual_posts` + `feedback_nao_u_channel_readonly` + `feedback_self_governance_failure`)。**追加 markdown link 総数 = 15 本** (2+3+3+3+4)、各 feedback ファイルが 3 inbound (3+3+3+3+3) を受領。**dry-run エビデンス**: `tools/orphan_check_dry_run_20260513_phase4_before.txt` (真孤児 23 / 静止親接続 33 / 新規未登録 6 / reachable 436) と `tools/orphan_check_dry_run_20260513_phase4_after.txt` (真孤児 18 / 静止親接続 38 / 新規未登録 6 / reachable 441) を保存。**差分**: 真孤児 **23→18 (-5)** / 静止親接続 **33→38 (+5)** / 新規未登録 6 不変 / reachable **436→441 (+5)**。**離脱した真孤児 5 件 = 選定 5 件と完全一致** (diff 確認: feedback_from_win2 / feedback_individual_posts / feedback_nao_u_channel_readonly / feedback_self_governance_failure / feedback_consensus_execution すべて refs=0→1 移行)。**意味のある発見**: (i) C188 観察「真孤児を救った 2 件はいずれも 45-49 日 age」の世代依存仮説が、本サイクルの **全 23 件が 38-59 日帯に集中** という強い形で実証された。23 件全てが MEMORY.md 索引化が C181 v0.2 起点拡張 (2026-05-11) 前の世代 = 装置改修前に書かれた feedback 群が、装置改修後の起点グラフから取り残された構造的不可視ゾーン。(ii) 15 link で reachable +5 = 1 link あたり 0.33 件回収、C188 の 0.12 (25 link → +3) から 2.75 倍に効率向上。理由 = 本サイクルは「真孤児ファイル本体への inbound 不在」をピンポイント解消 (= 重複 inbound 強化が 0 件)、C188 は「すでに MEMORY.md inbound を持つ feedback への重複強化」が 23/25 件あった。**世代依存キャンペーンの効率帯確定**: 同世代 (3 月中旬-4 月初) 5 件 weekly pass で 5 件回収が再現性高い。(iii) 残 18 件真孤児の age 構成 = 残り 18 件 (59:1 / 58:2 / 55:1 / 51:1 / 46:3 / 45:2 / 43:2 / 40:1 / 38:2、計 = 18) は次サイクル以降のキャンペーン候補母集合として保持、5 件ずつ消化で 4 サイクル分。**完遂条件の状態**: 1) 23 件 (filename, last_edit, age_days) 記録: 完遂 (`tools/orphan_check_age_distribution_20260513.txt`) / 2) age 帯別集計: 完遂 (30-59日帯 100%) / 3) 採用判定: 完遂 (本履歴節記録、kaizen #129 同型「先取り宣言で結果待ちブレ防止」適用) / 4) 真孤児 23→18 + reachable 増加: 完遂 (-5 / +5) / 5) 15-25 link 本数: 完遂 (15 本、下限達成)。**次サイクル種**: (i) 残 18 件真孤児を同世代キャンペーンで weekly pass 継続 (5 件 × 4 サイクル想定) / (ii) C181 v0.2 以降に追加された feedback (38日未満 age) が真孤児に流入するか観測継続 (= 世代依存仮説の予測検証、装置改修後の世代でも真孤児化するなら原因は別軸) / (iii) reachable 増加効率 (1 link あたり 0.33) は本サイクル「ピンポイント解消」起因、次回 5 件は重複 inbound 強化が混じるはずなので 0.12-0.25 に戻ると予測 = 次サイクル予測値を staging で先取り宣言する判断材料。
