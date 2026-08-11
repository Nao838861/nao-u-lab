---
name: directive_atoms_per_file_migration_20260513
description: atoms.jsonl 単一ファイルから per-atom .md (Obsidian 互換 YAML frontmatter) + 軽量 index.jsonl への移行決定。
type: directive
source_ts: "(2026-05-13 サイクル中の Nao_u 対話)"
target: "Log_cdx (GPT/Codex), 次以降の Phase 4c"
status: active
---

# Nao_u 指示原文 (2026-05-13)

> atoms.jsonl が肥大化しているのが気になる。これは個別の要素は個別のファイルに入るほうが良いのでは？そうなるとファイルは増えるが。また、jsonより.mdにしたり、obsidianで見れる形式の方がよかったりする？最近の検証結果などを踏まえて判断して、今後の展開を見据えた形で実装を進めて。

# 決定 (Log = Claude Opus 4.7)

**per-atom .md (YAML frontmatter, Obsidian 互換) + index.jsonl (recall 用軽量 index) のハイブリッド構成に移行する。**

## 決定の根拠 (最近の検証結果から)

1. **既存プロジェクトの per-file .md パターンと整合**: `shared_reads_candidates/`, `knowledge/`, `directive_*.md` などは既に per-file .md。`atoms.jsonl` だけが「単一バルク jsonl」で例外的。
2. **Phase 4a/4b/4c (2026-05-13 サイクル) で得た知見**: 1000 atoms 中 120 atoms (12%) が repeated title cluster。lifecycle metadata (`group_id`, `status`, `canonical_id`) を導入したが、jsonl 単一ファイルではこれらの cross-reference が見えにくい。
3. **Tariq Shihipar "HTML over Markdown" 議論 (本サイクルで shared-reads 投稿)**: AI が編集主体になった時、構造化フォーマットが壊れにくい。ただし論点は「Markdown を捨てる」ではなく「人間可読な Markdown と機械可読な構造の境界をどこに置くか」。.md + YAML frontmatter は両者を両立。
4. **git diff の粒度**: atoms.jsonl への追加は単一ファイル diff、cross_review・履歴追跡しにくい。per-file なら atom 単位 diff。
5. **Obsidian Graph view**: `tags`, `links`, `group_id` を frontmatter + `[[wikilinks]]` に持てば人間 (Nao_u) が記憶構造を視覚的に探索できる。Codex/Claude は Obsidian 経由せず直接 .md を読めるので AI 側オーバーヘッドゼロ。

## 採用しない選択肢

- **per-atom JSON**: Obsidian 非対応、人間可読性低、Markdown prose body が持てない
- **atoms.jsonl のまま archive 戦略**: 単一ファイル問題は解決せず、12% 重複への対症療法
- **HTML 化**: Tariq の議論を字面で取りすぎ、我々の運用文脈に合わない

## 新フォーマット仕様

ファイル: `GPT/memory/atoms/<YYYY-MM>/<id>.md`

```yaml
---
id: sr-1778621157-d0033ec3a9
title: "<title>"
source: slack_api/shared-reads
source_ts: 1778621157.789119
author: Ash
channel: shared-reads
user: U0AMQKE69BJ
tags: [memory, game-design, agent, identity]
kind: [synthesis, observation]
score: 14
status: active
group_id: null
canonical_id: null
supersedes: []
superseded_by: null
ingested_via: slack_memory_ingest.py
ingested_at: 2026-05-13T06:25:57
---

# (title)

## Use when
(trigger 文)

## Excerpt
(excerpt 全文)

## Links
- http://example.com
- [[related-atom-id]]
```

Index: `GPT/memory/atoms/index.jsonl` — recall 用の軽量索引。各 atom の `id / path / title / tags / source_ts / status / canonical_id / score` のみ。

## 移行計画

### Phase A (本 commit、scaffold)
- 移行スクリプト `tools/migrate_atoms_to_per_file.py` (dry-run default) を作成
- `memory/atoms/README.md` でフォーマット仕様を公開
- 既存 `atoms.jsonl` には触らない
- 既存ツール (`memory_ingest.py` / `memory_recall.py` / `memory_lifecycle.py`) も触らない
- 本 directive を作成

### Phase B (本 commit に続けて実施)
- 移行スクリプトを実行 (1000 atoms を per-file 化)
- `memory/atoms/index.jsonl` を生成
- 検証: 元 `atoms.jsonl` 行数 = 生成 .md ファイル数 = `index.jsonl` エントリ数

### Phase C (次の Phase 4c で Codex が実装)
- `memory_ingest.py` を改修: 新規 atom 作成時に per-file .md と `index.jsonl` 両方を書く (dual-write)
- `memory_recall.py` を改修: `index.jsonl` で rank し、必要時に .md 全文読み
- `memory_lifecycle.py` を改修: status 更新時に該当 .md frontmatter と `index.jsonl` 両方を更新
- 検証: 新規 atom が両形式で同期され、recall 結果が変わらないこと

### Phase D (Phase C 完了 + 十分な実運用検証後)
- `atoms.jsonl` を read-only legacy にする
- 最終的に archive (delete はしない、`memory/legacy/atoms_jsonl_<date>.jsonl` に退避)

## 設計上の保証

- **append-only**: 新規 atom は新規 .md ファイル作成。既存 atom の .md は基本上書きしない (status 変更等の frontmatter 更新は除く)
- **削除は base 規則**: supersede / status 更新で folding。実体は残す
- **逆方向互換 (Phase B→C 間)**: atoms.jsonl と per-file 両方が存在。既存ツールは atoms.jsonl を引き続き使用
- **idempotent migration**: 移行スクリプトは複数回実行しても同じ結果

## 実装メモ（2026-08-11 Phase 4c）

`tools/memory_health.py` は health 1 回につき `atoms.jsonl` を一度だけ読み、raw view と canonical overlay view を同じ read-only snapshot から各集計、recall smoke、mirror audit へ渡すようになった。report の `snapshot` に snapshot ID と source fingerprint、`input_consistency` に監査前後の安定性を出す。監査中に `atoms.jsonl` / canonical overlay / index / per-atom `.md` の fingerprint が変わった場合、mirror drift を corruption と確定せず `concurrent_write / inconclusive` として扱う。standalone の `tools/memory_recall.py` の CLI と記録動作は変更しない。

## 関連 directive

- `directive_shared_reads_overview_20260512.md` — shared-reads 品質基準
- `directive_shared_reads_candidate_gate_20260512.md` — candidate gate + 4000字バー
