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
- [ ] 真孤児 57 件のうち優先5件を親接続 (Log サイクル末尾 90 秒で 1〜3 件ずつ) — 次サイクル以降継続
- [x] orphan_check.py v0.1: 矢印記法 `→ filename.md` も参照として認識する LINK_RE 拡張完了（C180 Phase 4）
- [x] MEMORY.md トリガー追加（`_TAG_VOCABULARY.md` / `shared_reads/README.md`）— C182 Phase 4 で「構造と運用」セクションに 2 行追加
- [ ] Mir / Ash に inbox 伝達（タグ語彙 v0 への準拠依頼）
- [ ] 既存 `memory/feedback_*.md` 91 件への tags 付与（Log サイクル末尾で 1〜3 件ずつ）
- [ ] 新規未登録 14 件のレビュー (`kaizen_tracker.md` を MEMORY.md トリガーに追加検討、shared_reads/ 個別ファイルを `shared_reads/README.md` から再帰参照可能化)
- [ ] **v0.3 設計種（C183 Phase 2 由来、graphiti Temporal Context Graph 接続）**: frontmatter に `belief_valid_at` / `belief_invalid_at` を optional 追加 → `orphan_check.py` が **superseded クラス**を 4 クラス目（真孤児 / 静止親接続 / 新規未登録 + superseded）として分類 → 1mm 進め基準を「stale_linked のうち内容的に置換済を死亡宣告 + 後継ファイル link」に拡張。**警戒線**: graphiti フルスケール（Neo4j + temporal graph + point-in-time query）は infrastructure 過剰投資、「2点記法 + superseded クラス 1 個」だけ取り入れる。**実装条件**: kaizen #106「Phase 2/3 で強制利用しない」抵触回避のため kaizen 起票は保留、本 projects ファイルへの設計種記録に留める。次サイクル以降に独立した活動として再評価。**素材**: memory/shared_reads/20260512_graphiti_temporal_context_log.md
- [ ] **v0.3 設計種 (B) — age=unknown 57件問題 (C183 Phase 3 由来)**: 本サイクル走査で真孤児 57 件のうち 57 件すべてが `age=9999 (unknown)` 判定だった。`git log --pretty=format:"%h %ci" --name-only -- memory/action_reservations.md` 等で個別確認した結果、**5/8 リロケートコミット `30556a1d2e11` が当該ファイルの唯一の git 記録**であり、v0.2 の `--invert-grep --grep=^log: relocate` フィルタによって履歴ゼロ件に縮退している。`git log --follow` でリネーム前の旧パス履歴を辿ると、例: `memory/action_reservations.md` の真の最終編集は 2026-04-18 (R-004 完了済扱い移動)、`feedback_log_temperature.md` 等同様。**結果**: 「真に古い stale ファイル」と「リロケート後一度も触られていない新規っぽいファイル」が age=9999 に混合され、優先親接続の判定材料が失われている。**改善案**: `get_last_edit_dates()` で date=None になったファイルについて 1 ファイルずつ `git log --follow --invert-grep --grep=^log: relocate -1 --pretty=format:%ci -- <path>` を実行する第二パスを追加（一括 git log では `--follow` が単一ファイル限定のため `xargs -I {}` 個別呼出、260 ファイル中 57 件のみが対象なので実行時間影響は軽微）。**実装規模**: `get_last_edit_dates()` に約 15-20 行追加、`infrastructure 警戒線 (~100行)` 内。**完遂判定**: 真孤児クラスから age=unknown が消える (=全件に有効な age 値が入る)、v0.2 dry-run と v0.3 dry-run で真孤児件数の意味が変わることを記録

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
- 2026-05-11 C181 Phase 4 (Log): **大作業完遂 = orphan_check.py v0.2 起点拡張で false positive 構造的除去**。背景: C181 Phase 3 §1 で `feedback_identity_names.md` が真孤児扱いだが CLAUDE.md から直接参照されており false positive と判明。「装置の精度を上げず手作業ルールを増やす」(Nao_u 5/2 不可視ルール堆積罠) を避けるため、装置側で根本対処。(a) `INDEX_FILES` 構築を関数化 (`_build_index_files()`) し、起点に instruction / system 層を追加: `CLAUDE.md` / `.claude/system_identity.md` (直接列挙) + `docs/*.md` (glob、game_dev_foundation など memory/ を 20 参照) + `skills/**/SKILL.md` (glob、genre-deep-analysis 7 + lessons-recall 10 参照)。起点 9 → 29 (+20)。(b) dry-run 比較: 真孤児 v0.1=64 → v0.2=63 (−1)、reachable v0.1=398 → v0.2=399 (+1、整合)。`feedback_identity_names.md` が v0.1 true_orphan (refs=0) → v0.2 stale_linked (refs=1) へ移行確認 = false positive が現実に 1 件除去。(c) 回帰防止確認: 過去親接続 3 件 (`feedback_recognize_own_work.md` / `feedback_prior_art_citation_must_verify.md` / `feedback_judgment_postpone_patterns.md`) は v0.2 でも stale_linked のまま (refs=1 維持、親接続無効化なし)。tools/orphan_check_dry_run_20260511_phase4_v0_2.txt にエビデンス保存。考察: reachable +1 のみ = CLAUDE.md / docs/ / skills/ 経由で reachable になる memory/ ファイルは feedback_identity_names のみで、他は MEMORY.md 経由で既に reachable だった。これは v0.1 の網羅性が高かった裏付けでもあり、本 v0.2 は「装置の意味的妥当性」(refs=0 = どの instruction からも reachable でない) を担保する infrastructure。今後 Log サイクル末尾 1mm 進めは「v0.2 真孤児 63 件」を母集合にして真に親接続が必要なファイルへ集中可能。
