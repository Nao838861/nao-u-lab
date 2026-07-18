---
name: directive_shared_reads_group_handoff_resolution_20260719
description: shared-reads group action を判断記録だけで終えず、同一 handoff ID で candidate lifecycle へ適用する運用変更
type: directive
status: active
introduced_at: "2026-07-19"
source: "Phase 4b ISS-4A-GROUP-ACTION-NO-CLOSURE"
---

# Shared-reads group handoff の resolve 運用

2026-07-19 Phase 4c から、Phase 2 の group action は staging 記録後の `acknowledge` だけでは完了しない。`tools/shared_reads_group_handoff.py resolve` を使い、判断、対象、適用結果を同じ handoff ID に保存する。

- `close_siblings`: 対象 open candidate を `failed` に更新し、全対象の terminal 状態を再確認してから handled にする。部分適用は pending を維持し、同じ ID で再実行する。
- `keep_distinct`: 現在の member path/status fingerprint を保存する。fingerprint が一致する間だけ派生 queue から除外し、構成変化時は再審査する。
- `defer`: `retry_after` までは再投入を抑止するが handled にしない。期限後は同じ handoff が再び eligible になる。

旧 schema の inbox row は読み取り可能なまま維持する。新規 row は decision fields、membership fingerprint、apply result、retry_after を持つ。具体的な呼び出しと staging の監査項目は `phases/phase2_analyze.md` を正本とする。
