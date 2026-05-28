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
