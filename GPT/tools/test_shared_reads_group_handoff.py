import tempfile
import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from shared_reads_group_handoff import (
    acknowledge,
    enqueue_rows,
    pending_rows,
    read_jsonl,
    validate_rows,
    write_jsonl_atomic,
)


def payload(group_key: str) -> dict:
    return {
        "group_key": group_key,
        "representative": f"memory/shared_reads_candidates/{group_key}.md",
        "priority_reason": "fixture",
    }


class GroupHandoffTest(unittest.TestCase):
    def test_staging_reset_and_retry_do_not_lose_or_duplicate_pending(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            inbox = Path(temp_dir) / "inbox.jsonl"
            rows, first = enqueue_rows([], [payload("alpha")], "cycle-a", "2026-07-18T00:00:00+09:00")
            write_jsonl_atomic(inbox, rows)

            # A staging reset has no effect: the next process reconstructs from the inbox.
            reloaded = read_jsonl(inbox)
            self.assertEqual([row["group_key"] for row in pending_rows(reloaded)], ["alpha"])

            retried, second = enqueue_rows(reloaded, [payload("alpha")], "cycle-a", "later")
            self.assertEqual(first[0]["result"], "enqueued")
            self.assertEqual(second[0]["result"], "already_enqueued")
            self.assertEqual(len(retried), 1)

    def test_partial_ack_and_same_group_reselection_are_idempotent(self):
        rows, _ = enqueue_rows(
            [],
            [payload("alpha"), payload("beta")],
            "cycle-a",
            "2026-07-18T00:00:00+09:00",
        )
        alpha_id = pending_rows(rows)[0]["id"]
        rows, result = acknowledge(rows, alpha_id, "staging Phase 2 group_actions[0]", "fixture", "handled")
        self.assertEqual(result, "handled")
        self.assertEqual([row["group_key"] for row in pending_rows(rows)], ["beta"])

        rows, suppressed = enqueue_rows(rows, [payload("beta")], "cycle-b", "later")
        self.assertEqual(suppressed[0]["result"], "pending_duplicate_suppressed")
        self.assertEqual([row["group_key"] for row in pending_rows(rows)], ["beta"])

        # Once handled, a later cycle may intentionally select the same group again.
        beta_id = pending_rows(rows)[0]["id"]
        rows, _ = acknowledge(rows, beta_id, "staging evidence", "fixture", "handled")
        rows, reselected = enqueue_rows(rows, [payload("beta")], "cycle-c", "later-still")
        self.assertEqual(reselected[0]["result"], "enqueued")
        self.assertEqual(len(pending_rows(rows)), 1)
        self.assertEqual(validate_rows(rows), [])


if __name__ == "__main__":
    unittest.main()
