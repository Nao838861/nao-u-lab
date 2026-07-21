---
name: directive_shared_reads_probe_lifecycle_20260721
description: shared-reads 自己フィードバック probe を期限付き lease と利用 receipt で運用する導入記録
type: directive
status: active
introduced_at: "2026-07-21"
source_issue: ISS-PROBE-001
---

# Shared-reads probe lifecycle 導入

Phase 4b の `ISS-PROBE-001` に対する introduce 判定に基づき、probe 本文と運用状態を分離した。

- probe 本文の正本は従来どおり `memory/shared_reads_self_feedback_state.json` の `active_probes` とする。
- operational lifecycle の正本は `memory/shared_reads_probe_lifecycle.jsonl` とし、ledger にない legacy probe は dormant とみなす。本文は削除しない。
- Phase 3b で `adopt_probe` / `adopt_metric` とする場合は、consumer、trigger artifact、期待する判断差、期限を指定し、`tools/shared_reads_probe_lifecycle.py enqueue` で1件だけ lease する。指定できない知見は state-only review に留める。
- Phase 4a は期限到来 lease を1 cycle 1件だけ確認し、before / after decision、判断差、evidence pointer を receipt に残す。未観測は dormant とし、自動削除しない。
- helper は存在しない probe、同一 probe の重複 pending、evidence のない resolved、循環する `superseded_by` を拒否する。

初期 migration は `probe-20260604-memory-discard-operation-gate` と `probe-20260625-amvl-retention-utility-lifecycle` の2件だけである。残りの legacy probe は一括移行しない。
