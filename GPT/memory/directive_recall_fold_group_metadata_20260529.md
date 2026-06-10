---
status: active
created: 2026-05-29
phase: 4c
issue_id: ISS-4A-20260529-001
---

# recall fold group metadata

`tools/memory_recall.py` は、同一 `normalized_content_hash` または lifecycle metadata で fold された atom を、削除せずに代表 1 件として表示する。

2026-05-29 以降、fold された検索結果には次を表示・記録する。

- `grouped_count`: 代表 atom を含む group 全体の件数
- `grouped_ids`: 代表以外の atom id 一覧
- `representative_reason`: 代表 atom を選んだ主な理由
- `normalized_content_hash`: 同一内容 fold の追跡用 hash

代表選択は、明示的な lifecycle metadata、`reviewed` / `curated` status、shared-reads 由来 signal、score、本文長、新しさを順に見る。raw atom / per-file atom は削除しない。
## 2026-06-10 Phase 4c 変更

ISS-001 の導入として、同一 `normalized_content_hash` fold の代表選択を `tools/memory_lifecycle.py` に固定した。明示的な lifecycle metadata、`reviewed` / `curated`、shared-reads signal を優先し、その次に `source_ts` が新しい atom を代表にする。最後は hash / id で deterministic に tie-break する。

`tools/memory_health.py` は raw duplicate の `duplicate_hash_groups` / `duplicate_atom_rows` と、表示 fold で畳まれる追加行数 `fold_extra` を出す。atom 本体、per-file atom、`atoms.jsonl` は削除・移動しない。
