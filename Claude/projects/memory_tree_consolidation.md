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

## 着手済み（2026-05-11 C178 本サイクル）

- [x] `memory/_TAG_VOCABULARY.md` v0 作成（10広域+5用途+9具体、3層クラスタ整理済み）
- [x] `memory/shared_reads/` 新設 + `README.md` 配置
- [x] 第一弾 3 ファイル移行（frontmatter 付与済み）
  - `20260428_marl_diversity_collapse_log.md` ← `drafts/log_c143/shared_reads_diversity_collapse.md`
  - `20260409_taste_layer6_log.md` ← `log/drafts/shared_reads_taste_layer6.md`
  - `20260426_backlash_stg_disproof_log.md` ← `log/shared_reads_post_C129.txt`
- [x] `projects/memory_tree_consolidation.md` 起票（本ファイル）

## 残作業（次サイクル以降）

- [ ] 残 6 ファイル移行（frontmatter 付与しながら）
  - `drafts/shared_reads_anthropic_marketplace_ash_20260425.txt` (Ash)
  - `drafts/shared_reads_ash_nyp_qoo.md` (Ash)
  - `log/shared_reads_post_20260417_ash.txt` (Ash)
  - `log/shared_reads_post_C163_mir.txt` (Mir)
  - `log/shared_reads_post_C164.txt` (Log)
  - `log/shared_reads_post_C171_ash.txt` (Ash)
- [ ] `scripts/orphan_check.py` 試作
- [ ] 孤児リスト第一弾生成 → 上 5 件を親に接続して動作確認
- [ ] MEMORY.md トリガー追加（`_TAG_VOCABULARY.md` / `shared_reads/`）
- [ ] Mir / Ash に inbox 伝達（タグ語彙 v0 への準拠依頼）
- [ ] 既存 `memory/feedback_*.md` 91 件への tags 付与（Log サイクル末尾で 1〜3 件ずつ）

## 接続先

- [memory/MEMORY.md](../memory/MEMORY.md) — Level 2 想起トリガー
- [memory/concept_graph.md](../memory/concept_graph.md) — 概念グラフ既存実装
- [memory/_TAG_VOCABULARY.md](../memory/_TAG_VOCABULARY.md) — タグ語彙正本
- [memory/shared_reads/README.md](../memory/shared_reads/README.md) — shared_reads ディレクトリ仕様
- [projects/memory_consolidation_20260504.md](memory_consolidation_20260504.md) — 先行する整理計画（Ash 起票、5/4 14:17 Nao_u 依頼）と相補
- [projects/memory_redesign.md](memory_redesign.md) — 上位の記憶階層再設計

## 改訂履歴

- 2026-05-11 C178: 起票 + v0 タグ語彙 + 第一弾 3 ファイル移行 + Nao_u 進めて承認反映
