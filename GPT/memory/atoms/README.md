# atoms/ — per-file memory atoms

`memory/atoms.jsonl` の単一バルク jsonl から、**per-atom .md (YAML frontmatter, Obsidian 互換) + 軽量 `index.jsonl`** のハイブリッド構成に移行中。

決定経緯と移行計画は `../directive_atoms_per_file_migration_20260513.md`。

## ディレクトリ構造

```
memory/atoms/
├── README.md                                # 本ファイル
├── index.jsonl                              # recall 用軽量索引
├── 2026-05/
│   ├── sr-1778621157-d0033ec3a9.md
│   ├── sr-1778621842-0f7967e2da.md
│   └── ...
├── 2026-04/
│   └── ...
└── unknown/                                 # source_ts が無い atom
```

サブディレクトリは `source_ts` を JST month に変換した `YYYY-MM`。

## atom .md ファイル仕様

```markdown
---
id: sr-1778621157-d0033ec3a9
title: "..."
source: slack_api/shared-reads
source_ts: 1778621157.789119
author: Ash
channel: shared-reads
user: U0AMQKE69BJ
tags: [memory, game-design, agent, identity]
kind: [synthesis, observation]
score: 14
status: active                # active | superseded | archived
group_id: null
canonical_id: null
supersedes: []
superseded_by: null
ingested_via: slack_memory_ingest.py
ingested_at: 2026-05-13T06:25:57
links:
  - http://example.com
  - "[[related-atom-id]]"
---

# (title)

## Use when

trigger 文 (recall フックとして使うキーフレーズ)

## Excerpt

excerpt 全文 (atoms.jsonl では切り詰めていた部分も含めて自由長で書ける)

## Notes

任意。後から追記される反映・cross_review コメント等。

## Links (本文中)

- 外部 URL は plain link
- 内部 atom は `[[atom-id]]` の Obsidian wikilink
```

## index.jsonl 仕様

各行が 1 atom のメタ情報。recall ranking が atom 全文を読まずに済むよう、必要最小限のフィールドのみ。

```json
{"id": "sr-1778621157-d0033ec3a9", "path": "2026-05/sr-1778621157-d0033ec3a9.md", "title": "...", "tags": [...], "source_ts": "1778621157.789119", "status": "active", "canonical_id": null, "score": 14}
```

## Obsidian Graph view を使う

このディレクトリを Obsidian の vault または vault サブフォルダとして開けば、
- frontmatter `tags` で色分け
- 本文中の `[[atom-id]]` でリンク表示
- group / supersede 関係も visualization 可能

Codex / Claude / memory_*.py は Obsidian を介さず直接 .md を読むので、Obsidian なしでも運用は完結する。

## 互換性 (移行中)

Phase B 完了時点では:
- `memory/atoms.jsonl` (source of truth、既存ツールが読む)
- `memory/atoms/*.md` + `memory/atoms/index.jsonl` (新フォーマット、scaffold 段階)

Phase C で `memory_ingest.py` / `memory_recall.py` / `memory_lifecycle.py` が新フォーマットを書き込み・参照するように改修される。Phase D で `atoms.jsonl` retire。

## 操作ツール

- `tools/migrate_atoms_to_per_file.py` — `atoms.jsonl` → per-file 一括移行 (idempotent)
- `tools/rebuild_atom_index.py` — (Phase C 以降) `index.jsonl` 再生成
- `tools/memory_recall.py` — Phase C 以降は新フォーマットを使う
- `tools/memory_lifecycle.py` — Phase C 以降は frontmatter + index 両方を更新
