---
name: directive_operational_ack_quarantine_20260531
description: Slack broadcast 受領通知などの低価値な運用 atom を通常 recall から外す層の導入記録
type: directive
status: active
introduced_at: 2026-05-31
source_phase: Phase 4c
---

# operational_ack quarantine

2026-05-31 Phase 4c で、Slack broadcast の受領通知や誤検知フォローアップのような低価値な運用通知 atom を通常 recall から外す層を追加した。

## 変更内容

- 対象 atom には `quality: quarantine` / `memory_layer: operational_ack` / `quality_reason` を付ける。
- `tools/memory_recall.py` は既定で `quality: quarantine` と `memory_layer: operational_ack` を除外する。
- 監査や原因確認では `python tools/memory_recall.py "<query>" --include-operational` を使う。
- 新規 ingest では `tools/atom_quality.py` の `apply_memory_layer()` が operational ack を判定する。
- 既存 atom への backfill は `tools/backfill_operational_ack_atoms.py` が担当し、対象 id と理由は `memory/atom_operational_ack_quarantine.jsonl` に残す。

## スコープ

この層は atom を削除しない。通常のゲーム制作・記憶 recall から低価値な受領通知を外し、監査時だけ明示的に読み戻せるようにするためのもの。
## 2026-06-08 Phase 4c 追記

Phase 4b `ISS-20260608-4A-ATOM-GENERIC-PREFIX` の introduce 判定に従い、同じ recall routing 層を `operational_log` / `lifecycle_repost` へ拡張した。対象は `[Codex external research]`、shared-reads 再投稿、議論候補のような大規模 generic prefix atom に限定し、atom 本体の削除や title 書き換えはしない。

- `tools/atom_quality.py` は routine atom に `quality: routine` と `memory_layer: operational_log` または `lifecycle_repost` を付ける。
- `tools/memory_recall.py` は通常検索で `operational_ack` / `operational_log` / `lifecycle_repost` を除外する。
- exact id / source_ts query は除外層でも読める。通常検索に含めたい時は `python tools/memory_recall.py "<query>" --include-operational` を使う。
- 既存 atom への backfill は `python tools/backfill_routine_memory_layers.py` が担当し、変更記録は `memory/atom_routine_layer_backfill.jsonl` に残す。
