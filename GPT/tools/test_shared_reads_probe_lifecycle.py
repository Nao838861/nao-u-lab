import sys
import unittest
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from shared_reads_probe_lifecycle import (
    current_status_counts,
    enqueue_probe,
    pending_rows,
    resolve_probe,
    validate_rows,
)


TARGET = "probe-20260604-memory-discard-operation-gate"
COMPARISON = "probe-20260625-amvl-retention-utility-lifecycle"
SOURCES = {TARGET: "1780514208.751289", COMPARISON: "1780460352.566409"}


def enqueue(
    rows: list[dict],
    probe_id: str = TARGET,
    leased_at: str = "2026-07-21T09:00:00+09:00",
    lease_due: str = "2026-07-21T10:00:00+09:00",
):
    return enqueue_probe(
        rows,
        SOURCES,
        probe_id,
        "Phase 4a",
        "log/cycle_staging_log_cdx.md#Phase-4a",
        "後続判断に固有の差が出るかを確認する",
        lease_due,
        leased_at,
    )


class ProbeLifecycleTest(unittest.TestCase):
    def test_usage_evidence_missing_due_lease_becomes_dormant(self):
        rows, _ = enqueue([])
        due = pending_rows(rows, due_only=True, as_of=datetime.fromisoformat("2026-07-21T11:00:00+09:00"), limit=1)
        self.assertEqual([row["probe_id"] for row in due], [TARGET])
        rows, _ = resolve_probe(rows, SOURCES, TARGET, "dormant", None, None, None, "usage_evidence_missing")
        self.assertEqual(current_status_counts(rows)["dormant"], 1)
        self.assertEqual(validate_rows(rows, SOURCES), [])

    def test_target_can_merge_into_comparison(self):
        rows, _ = enqueue([])
        rows, _ = resolve_probe(
            rows,
            SOURCES,
            TARGET,
            "merged",
            "discard probe と retention probe を別々に確認していた",
            "retention/utility lifecycle だけで同じ keep/merge 判断になった",
            False,
            "log/cycle_staging_log_cdx.md#Phase-4a-probe_reuse_audit",
            COMPARISON,
        )
        self.assertEqual(rows[0]["superseded_by"], COMPARISON)
        self.assertEqual(validate_rows(rows, SOURCES), [])

    def test_changed_receipt_allows_one_new_lease(self):
        rows, _ = enqueue([])
        rows, _ = resolve_probe(
            rows,
            SOURCES,
            TARGET,
            "resolved",
            "保持を既定にしていた",
            "discard candidate を staging に残した",
            True,
            "log/cycle_staging_log_cdx.md#decision-delta",
        )
        rows, _ = enqueue(
            rows,
            leased_at="2026-07-22T09:00:00+09:00",
            lease_due="2026-07-22T10:00:00+09:00",
        )
        self.assertEqual(len(rows), 2)
        self.assertEqual(current_status_counts(rows)["pending"], 1)
        with self.assertRaisesRegex(ValueError, "duplicate pending lease"):
            enqueue(
                rows,
                leased_at="2026-07-23T09:00:00+09:00",
                lease_due="2026-07-23T10:00:00+09:00",
            )

    def test_contract_rejects_unknown_probe_missing_evidence_and_cycle(self):
        with self.assertRaisesRegex(ValueError, "unknown probe_id"):
            enqueue([], probe_id="probe-missing")

        rows, _ = enqueue([])
        with self.assertRaisesRegex(ValueError, "requires receipt evidence"):
            resolve_probe(rows, SOURCES, TARGET, "resolved", "before", "after", False, None)

        target_rows, _ = enqueue([])
        target_rows, _ = resolve_probe(
            target_rows, SOURCES, TARGET, "merged", "before", "after", False, "evidence", COMPARISON
        )
        target_rows, _ = enqueue(
            target_rows,
            COMPARISON,
            "2026-07-22T09:00:00+09:00",
            "2026-07-22T10:00:00+09:00",
        )
        with self.assertRaisesRegex(ValueError, "circular superseded_by"):
            resolve_probe(
                target_rows, SOURCES, COMPARISON, "merged", "before", "after", False, "evidence", TARGET
            )


if __name__ == "__main__":
    unittest.main()
