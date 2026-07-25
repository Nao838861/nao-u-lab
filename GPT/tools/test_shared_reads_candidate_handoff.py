import sys
import tempfile
import unittest
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_shared_reads_stale_triage_queue import build_queue as build_stale_queue
from shared_reads_candidate_handoff import (
    enqueue_rows,
    lease_suppresses,
    pending_rows,
    read_jsonl,
    resolve,
    validate_rows,
    write_jsonl_atomic,
)


SELECTED_AT = "2026-07-25T16:13:00+09:00"
PROJECT_ROOT = Path(__file__).resolve().parents[1]


def queue_row(relative: str, status: str = "postponed", stale_after: str = "2026-06-14") -> dict:
    return {
        "path": relative,
        "status": status,
        "stale_after": stale_after,
        "reason": "fixture priority",
        "recommended_review_action": "keep_for_phase2",
    }


def candidate(path: Path, status: str, stale_after: str, reviewed: bool = False) -> None:
    fields = [
        "---",
        "title: Fixture game research",
        f"status: {status}",
        f"candidate_status: {status}",
        f'stale_after: "{stale_after}"',
    ]
    if reviewed:
        fields.extend(
            [
                'last_reviewed_at: "2026-07-26T09:00:00+09:00"',
                "last_decision: postpone",
                'evidence: "primary source checked"',
                "next_action: revise_or_research",
            ]
        )
    fields.extend(["---", "body", ""])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(fields), encoding="utf-8")


class CandidateHandoffTest(unittest.TestCase):
    def test_enqueue_is_idempotent_and_survives_staging_reset(self):
        with tempfile.TemporaryDirectory(dir=PROJECT_ROOT) as temp_dir:
            root = Path(temp_dir)
            relative = "memory/shared_reads_candidates/a.md"
            candidate(root / relative, "postponed", "2026-06-14")
            rows, first = enqueue_rows([], [queue_row(relative)], "cycle-a", SELECTED_AT)
            inbox = root / "inbox.jsonl"
            write_jsonl_atomic(inbox, rows)

            reloaded = read_jsonl(inbox)
            self.assertEqual([row["candidate_path"] for row in pending_rows(reloaded, root)], [relative])
            rows, second = enqueue_rows(reloaded, [queue_row(relative)], "cycle-a", SELECTED_AT)
            self.assertEqual(first[0]["result"], "enqueued")
            self.assertEqual(second[0]["result"], "already_enqueued")
            self.assertEqual(len(rows), 1)
            self.assertEqual(validate_rows(rows), [])

    def test_partial_completion_replays_until_frontmatter_and_staging_are_verified(self):
        with tempfile.TemporaryDirectory(dir=PROJECT_ROOT) as temp_dir:
            root = Path(temp_dir)
            relative = "memory/shared_reads_candidates/a.md"
            candidate(root / relative, "postponed", "2026-06-14")
            rows, _ = enqueue_rows([], [queue_row(relative)], "cycle-a", SELECTED_AT)
            row_id = rows[0]["id"]

            rows, result = resolve(
                rows,
                row_id,
                "postpone",
                "source still incomplete",
                "Phase 2 stale_reviewed[0]",
                "fixture",
                "2026-07-26T09:00:00+09:00",
                root,
            )
            self.assertEqual(result, "partial")
            self.assertEqual(rows[0]["status"], "pending")
            self.assertEqual(len(pending_rows(rows, root)), 1)

            candidate(root / relative, "postponed", "2026-08-26", reviewed=True)
            self.assertEqual(len(pending_rows(rows, root)), 1)
            rows, result = resolve(
                rows,
                row_id,
                "postpone",
                "source still incomplete",
                "Phase 2 stale_reviewed[0]",
                "fixture",
                "2026-07-26T09:01:00+09:00",
                root,
            )
            self.assertEqual(result, "handled")
            self.assertEqual(rows[0]["status"], "handled")
            self.assertEqual(pending_rows(rows, root), [])

    def test_handled_state_is_not_redelivered_and_new_stale_after_gets_new_lease(self):
        with tempfile.TemporaryDirectory(dir=PROJECT_ROOT) as temp_dir:
            root = Path(temp_dir)
            relative = "memory/shared_reads_candidates/a.md"
            candidate(root / relative, "postponed", "2026-06-14")
            rows, _ = enqueue_rows([], [queue_row(relative)], "cycle-a", SELECTED_AT)
            candidate(root / relative, "postponed", "2026-08-26", reviewed=True)
            rows, result = resolve(
                rows,
                rows[0]["id"],
                "postpone",
                "retry after source release",
                "Phase 2 stale_reviewed[0]",
                "fixture",
                "2026-07-26T09:00:00+09:00",
                root,
            )
            self.assertEqual(result, "handled")

            rows, old_state = enqueue_rows(rows, [queue_row(relative)], "cycle-b", SELECTED_AT)
            self.assertEqual(old_state[0]["result"], "handled_state_suppressed")
            self.assertFalse(
                lease_suppresses(
                    relative,
                    "postponed",
                    "2026-08-26",
                    rows,
                    datetime(2026, 8, 26, tzinfo=timezone.utc),
                )
            )
            rows, new_state = enqueue_rows(
                rows,
                [queue_row(relative, stale_after="2026-08-26")],
                "cycle-c",
                "2026-08-26T09:00:00+09:00",
            )
            self.assertEqual(new_state[0]["result"], "enqueued")
            self.assertEqual(len(rows), 2)
            self.assertEqual(len(pending_rows(rows, root)), 1)

    def test_pending_and_deferred_leases_filter_stale_triage_fail_open(self):
        with tempfile.TemporaryDirectory(dir=PROJECT_ROOT) as temp_dir:
            sandbox = Path(temp_dir)
            candidates_dir = sandbox / "memory" / "shared_reads_candidates"
            relative = (candidates_dir / "a.md").relative_to(PROJECT_ROOT).as_posix()
            candidate(PROJECT_ROOT / relative, "postponed", "2026-06-14")
            rows, _ = enqueue_rows([], [queue_row(relative)], "cycle-a", SELECTED_AT)
            inbox = sandbox / "candidate_inbox.jsonl"
            write_jsonl_atomic(inbox, rows)
            open_queue = sandbox / "open_groups.jsonl"
            open_queue.write_text("", encoding="utf-8")
            as_of = datetime(2026, 7, 25, tzinfo=timezone.utc)

            self.assertEqual(
                build_stale_queue(
                    candidates_dir,
                    date(2026, 7, 25),
                    open_queue,
                    -1,
                    None,
                    as_of,
                    PROJECT_ROOT,
                    inbox,
                ),
                [],
            )
            rows, result = resolve(
                rows,
                rows[0]["id"],
                "defer",
                "primary source unavailable",
                "",
                "fixture",
                as_of.isoformat(),
                PROJECT_ROOT,
                (as_of + timedelta(days=2)).isoformat(),
            )
            self.assertEqual(result, "deferred")
            write_jsonl_atomic(inbox, rows)
            self.assertTrue(
                lease_suppresses(relative, "postponed", "2026-06-14", rows, as_of + timedelta(days=1))
            )
            self.assertEqual(
                build_stale_queue(
                    candidates_dir,
                    date(2026, 7, 26),
                    open_queue,
                    -1,
                    None,
                    as_of + timedelta(days=1),
                    PROJECT_ROOT,
                    inbox,
                ),
                [],
            )
            due = build_stale_queue(
                candidates_dir,
                date(2026, 7, 28),
                open_queue,
                -1,
                None,
                as_of + timedelta(days=3),
                PROJECT_ROOT,
                inbox,
            )
            self.assertEqual([row["path"] for row in due], [relative])

            candidate(PROJECT_ROOT / relative, "needs_review", "2026-06-14")
            changed = build_stale_queue(
                candidates_dir,
                date(2026, 7, 26),
                open_queue,
                -1,
                None,
                as_of + timedelta(days=1),
                PROJECT_ROOT,
                inbox,
            )
            self.assertEqual([row["path"] for row in changed], [relative])


if __name__ == "__main__":
    unittest.main()
