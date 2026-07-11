# atoms/ — per-file memory atoms

`memory/atoms.jsonl` の単一バルク jsonl から、**per-atom .md (YAML frontmatter, Obsidian 互換) + 軽量 `index.jsonl`** のハイブリッド構成に移行中。

決定経緯と移行計画は `../directive_atoms_per_file_migration_20260513.md`。

## ディレクトリ構造

```
memory/atoms/
├── README.md                                # 本ファイル
├── index.jsonl                              # recall 用軽量索引
├── duplicate_groups.jsonl                   # 同一内容 atom 群の派生 index
├── canonical_overlay.jsonl                  # raw atom を残したまま canonical view を作る overlay
├── title_cluster_index.jsonl                # generic title cluster の recall 表示補助 sidecar
├── 2026-05/
│   ├── sr-1778621157-d0033ec3a9.md
│   ├── sr-1778621842-0f7967e2da.md
│   └── ...
├── 2026-04/
│   └── ...
└── unknown/                                 # source_ts / datetime のどちらからも月を決められない atom
```

サブディレクトリは原則として `source_ts` を JST month に変換した `YYYY-MM`。`source_ts` が local-memory 由来の識別子など UNIX timestamp として解釈できない場合は、frontmatter の `datetime` から `YYYY-MM` を使う。両方から月を決められない atom だけを `unknown/` に置く。

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

## canonical_topic_groups.jsonl 仕様

`canonical_topic_groups.jsonl` は、同一論文・同一記事・同一 Slack 議論に由来する atom 群を読む時の入口補助 index。atom の削除や正本固定ではなく、recall / task lens で「まずどれを読むか」を安定させるために使う。`canonical_atom` は更新可能な代表であり、後続の補足・訂正・再評価で差し替えてよい。

1 レコードは 1 topic group。必須フィールドは次の通り。

```json
{"group_id":"ctg-20260515-memsad-memory-poisoning","normalized_link_key":"arxiv:2605.03482v2","topic_label":"MEMSAD: RAG/長期記憶エージェントの記憶汚染防御","canonical_atom":"sr-1778536137-c07e04d08a","supporting_atoms":["sr-1778536160-392329fd76"],"superseded_atoms":["sr-1778535120-82ea7a1005","sr-1778535738-ed839f9805"],"game_memory_tags":["memory","agent","harness","evaluation","operation"],"rationale":"代表選定の理由","updated_at":"2026-05-15T15:38+09:00"}
```

## duplicate_groups.jsonl 仕様

`duplicate_groups.jsonl` は、`normalized_content_hash` が同一の atom 群を記録する派生 index。atom 本体の削除・schema 変更・canonical 固定は行わず、重複の所在を deterministic に確認するための補助資料として使う。

1 レコードは 1 content group。`canonical_id` は provenance anchor として最古の `source_ts`、`preferred_id` は補正投稿や再投稿の確認入口として最新の `source_ts` を選ぶ。

```json
{"content_hash":"...","canonical_id":"sr-...","preferred_id":"sr-...","duplicate_ids":["sr-..."],"count":2,"source_ts_min":1778535120.0,"source_ts_max":1778535738.0,"sample_title":"...","generated_at":"2026-05-17T19:05:00"}
```

再生成:

```powershell
python tools/build_atom_duplicate_groups.py
```

## canonical_overlay.jsonl 仕様

`canonical_overlay.jsonl` は `duplicate_groups.jsonl` から派生する軽量 overlay。atom 本体は削除せず、raw view では従来通り全 atom を読み、canonical view では `duplicate_ids` を `canonical_id` に畳んで読む。

1 レコードは 1 content group。`reason` / `hash_basis` は fold 根拠 (`normalized_content_hash`, `title_excerpt_exact`, `title_trigger_excerpt_exact`) を示し、`evidence_hash` はその根拠 key の hash。

```json
{"group_id":"content:...","canonical_id":"sr-...","preferred_id":"sr-...","duplicate_ids":["sr-..."],"member_ids":["sr-...","sr-..."],"reason":"normalized_content_hash","evidence_hash":"...","count":2,"sample_title":"...","generated_at":"2026-06-05T00:00:00"}
```

`tools/atoms_fileformat.py` の `load_atoms_with_view(..., view="raw"|"canonical")` で読み分ける。raw 直読系スクリプトは Phase D 前の移行対象から順に canonical view へ寄せる。

### secondary duplicate key

2026-06-12 以降、`canonical_overlay.jsonl` は `normalized_content_hash` に加えて `title+trigger+excerpt` の正規化完全一致も `reason=title_trigger_excerpt_exact` として記録する。これはリンク差分だけで同じ投稿内容が別 atom として残るケースを代表表示で畳むための非破壊 sidecar であり、`atoms.jsonl` や per-file `.md` の raw atom は削除・上書きしない。

同一 atom が `normalized_content_hash` group と secondary key group の両方に入り得る場合は、既存の `normalized_content_hash` group を優先し、secondary key では重複登録しない。canonical 代表は active / non-quarantine、shared-reads / Slack permalink signal、本文量、最古 `source_ts`、id の順で deterministic に決める。

## title_cluster_index.jsonl 仕様

`title_cluster_index.jsonl` は、同じ generic title が recall に大量に並ぶ時の判別性を上げるための再生成可能な sidecar。atom 本体、`atoms.jsonl`、per-file `.md` の `title` は書き換えない。

cluster key は `normalized_title`、`tags`、`kind`、`source` の組み合わせ。各 member は `source_ts`、URL domain、本文先頭から抽出した短い `keyword_hint`、recall 表示用の `display_disambiguator` を持つ。

再生成:

```powershell
python tools/build_atom_title_cluster_index.py
```

`tools/memory_recall.py` は cluster size が 2 以上の atom だけ、title の後ろに `display_disambiguator` を補助ラベルとして表示する。

## related_candidates.jsonl 仕様

`related_candidates.jsonl` は、atom 間の peer-link 候補を記録する再生成可能な sidecar。source of truth ではなく、確定 link でもない。atom 本体、frontmatter、本文中の wikilink はこの index だけでは変更しない。

初期導入では対象を game-memory 関連 tag を持つ atom と直近 atom に限定する。一括 backfill は行わず、候補の coverage とノイズを Phase 4a で見てから、採用するものだけを別段階で links 化する。

1 レコードは 1 target atom。主なフィールドは次の通り。

```json
{"atom_id":"sr-...","title":"...","tags":["game-design","memory"],"source":"slack_api/shared-reads","created_at":"2026-06-07T00:00:00","source_ts":"1780...","reasons":["shared_tags","shared_terms"],"candidate_ids":["sr-..."],"candidates":[{"id":"sr-...","title":"...","score":7.4,"reasons":["shared_tags:memory,game-design"]}],"review_status":"candidate","scope":"game-memory-or-recent","generated_at":"2026-06-07T00:00:00"}
```

Phase 4a で見る最小指標:

- `candidate_coverage`: 対象 atom のうち候補が出た割合。
- `candidate_edges`: 候補 edge 数。
- `accepted links`: 後続で atom 本体に採用済み link として反映された数。
- `rejected/noisy examples`: Phase 4a 監査で誤リンク・弱い候補として見つけた例。

再生成:

```powershell
python tools/build_atom_related_candidates.py
python tools/build_atom_related_candidates.py --check
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
- `tools/audit_atom_mirror_drift.py` — `atoms.jsonl` / per-file `.md` / `index.jsonl` の id・内容 drift を監査する。`--reconcile`（`--repair` は互換 alias）は parse/index error、内容衝突、逆方向欠落がない時だけ per-file-only atom を補完し、通常 health check は自動修復せず drift をエラー表示する
- `tools/build_atom_duplicate_groups.py` — 同一内容 atom 群の派生 index / canonical overlay 再生成
- `tools/build_atom_title_cluster_index.py` — generic title cluster の recall 表示補助 sidecar 再生成
- `tools/rebuild_atom_index.py` — (Phase C 以降) `index.jsonl` 再生成
- `tools/memory_recall.py` — Phase C 以降は新フォーマットを使う
- `tools/memory_lifecycle.py` — Phase C 以降は frontmatter + index 両方を更新
## 2026-06-12 Phase 4c: duplicate cluster overlay

Phase 4c で `memory/atoms/duplicate_clusters.jsonl` を導入した。これは atom 本体を書き換えず、`title + excerpt` の正規化完全一致と既存の `normalized_content_hash` から重複候補 cluster を記録する派生 index である。

- canonical view は `memory/atoms/canonical_overlay.jsonl` を読む。`tools/memory_recall.py` と `tools/memory_ingest.py` の `MEMORY.md` 生成は、この overlay が存在する場合だけ canonical 表示を優先する。
- `canonical_id` は同一 cluster 内で `status` が `active` / `posted` かつ quarantine でない atom を優先し、その中で新しい `source_ts` / `created_at` / `ingested_at` / `datetime` を選ぶ。
- 互換用に `duplicate_groups.jsonl` も同じ内容で更新するが、Phase 4c 以降の正本は `duplicate_clusters.jsonl` と `canonical_overlay.jsonl`。
- 再生成は `python tools/build_atom_duplicate_groups.py`、検証は `python tools/build_atom_duplicate_groups.py --check`。
- `title_excerpt_exact` (2026-06-19): ISS-001 の導入として、`tools/build_atom_duplicate_groups.py` の secondary duplicate key を `title + excerpt` の正規化完全一致にも広げた。120 文字以上の key だけを対象にし、既存の `normalized_content_hash` group の外側で source atom を削除せず canonical view だけを畳む。
- `title_excerpt_exact` で畳まれた atom は、従来の `title_trigger_excerpt_exact` には重複登録しない。canonical 代表は active / non-quarantine、shared-reads / Slack permalink signal、本文量、最古 `source_ts`、id の順で deterministic に決める。
- `hash_basis` (2026-06-25): Phase 4c ISS-002 の sidecar index に fold 根拠を明示するため、`duplicate_clusters.jsonl` / `duplicate_groups.jsonl` / `canonical_overlay.jsonl` の各 row に `hash_basis` を追加した。raw atom と per-file atom は変更しない。
