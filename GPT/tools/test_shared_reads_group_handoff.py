import tempfile
import unittest
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from shared_reads_group_handoff import (
    acknowledge,
    enqueue_rows,
    membership_fingerprint,
    pending_rows,
    read_jsonl,
    resolution_suppresses,
    resolve,
    update_frontmatter_fields,
    validate_rows,
    write_jsonl_atomic,
)
from build_shared_reads_group_action_queue import build_queue


def payload(group_key: str, open_siblings: list[str] | None = None) -> dict:
    return {
        "group_key": group_key,
        "representative": f"memory/shared_reads_candidates/{group_key}.md",
        "open_siblings": open_siblings or [],
        "terminal_siblings": [],
        "priority_reason": "fixture",
    }


def candidate(path: Path, status: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        f"---\ntitle: Fixture\nstatus: {status}\ncandidate_status: {status}\n---\nbody\n",
        encoding="utf-8",
    )


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

    def test_close_siblings_partial_apply_recovers_idempotently(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            a = "memory/shared_reads_candidates/a.md"
            b = "memory/shared_reads_candidates/b.md"
            terminal = "memory/shared_reads_candidates/terminal.md"
            candidate(root / a, "postponed")
            candidate(root / terminal, "posted")
            item_payload = payload("alpha", [a, b])
            item_payload["representative"] = a
            item_payload["terminal_siblings"] = [terminal]
            rows, _ = enqueue_rows([], [item_payload], "cycle-a", "2026-07-18T00:00:00+09:00", root)
            row_id = rows[0]["id"]
            decision = {
                "group_key": "alpha",
                "action": "close_siblings",
                "target_paths": [a, b],
                "reason": "same posted work",
                "terminal_evidence": [{"path": terminal, "evidence": "status: posted"}],
                "representative_decision": "postpone",
            }

            rows, result = resolve(rows, row_id, decision, "fixture", "2026-07-19T00:00:00+09:00", root)
            self.assertEqual(result, "partial")
            self.assertEqual(rows[0]["status"], "pending")
            self.assertEqual(read_jsonl_after_write(root, rows)[0]["apply_result"]["state"], "partial")
            self.assertEqual(read_candidate_status(root / a), "failed")
            self.assertEqual(read_candidate_field(root / a, "last_decision"), "failed")
            self.assertEqual(
                read_candidate_field(root / a, "duplicate_reason"),
                "failed_duplicate_of_terminal_sibling",
            )

            candidate(root / b, "needs_review")
            rows, result = resolve(rows, row_id, decision, "fixture", "2026-07-19T00:01:00+09:00", root)
            self.assertEqual(result, "resolved")
            self.assertEqual(rows[0]["status"], "handled")
            self.assertEqual(read_candidate_status(root / b), "failed")

    def test_keep_distinct_suppresses_only_matching_membership(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            open_path = "memory/shared_reads_candidates/open.md"
            terminal = "memory/shared_reads_candidates/terminal.md"
            candidate(root / open_path, "postponed")
            candidate(root / terminal, "posted")
            item_payload = payload("alpha", [open_path])
            item_payload["representative"] = open_path
            item_payload["terminal_siblings"] = [terminal]
            rows, _ = enqueue_rows([], [item_payload], "cycle-a", "2026-07-18T00:00:00+09:00", root)
            decision = {
                "group_key": "alpha",
                "action": "keep_distinct",
                "target_paths": [open_path],
                "reason": "different source and scope",
                "terminal_evidence": [{"path": terminal, "evidence": "different experiment"}],
            }
            rows, result = resolve(rows, rows[0]["id"], decision, "fixture", "2026-07-19T00:00:00+09:00", root)
            self.assertEqual(result, "resolved")
            self.assertTrue(resolution_suppresses(item_payload, rows, root))
            stale_rows = [{"path": open_path, "stale_after": "2026-07-01", "game_transfer_value": "high"}]
            mixed_rows = [
                {
                    "group_key": "alpha",
                    "evidence": {"open_paths": [open_path], "terminal_paths": [terminal]},
                    "recommended_action": "reevaluate_representative",
                }
            ]
            self.assertEqual(build_queue(stale_rows, mixed_rows, rows, root), [])
            before = membership_fingerprint(item_payload, root)
            update_frontmatter_fields(root / open_path, {"status": "ready_to_post"})
            self.assertNotEqual(before, membership_fingerprint(item_payload, root))
            self.assertFalse(resolution_suppresses(item_payload, rows, root))
            self.assertEqual(len(build_queue(stale_rows, mixed_rows, rows, root)), 1)

    def test_all_open_keep_distinct_uses_source_evidence_and_reopens_on_membership_change(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            a = "memory/shared_reads_candidates/a.md"
            b = "memory/shared_reads_candidates/b.md"
            candidate(root / a, "postponed")
            candidate(root / b, "needs_review")
            item_payload = payload("same-name", [a, b])
            item_payload["representative"] = a
            item_payload["group_kind"] = "all_open"
            rows, _ = enqueue_rows([], [item_payload], "cycle-a", "2026-07-18T00:00:00+09:00", root)
            decision = {
                "group_key": "same-name",
                "action": "keep_distinct",
                "target_paths": [a, b],
                "reason": "same title but different works",
                "terminal_evidence": [
                    {"path": a, "evidence": "source:https://example.com/work-a"},
                    {"path": b, "evidence": "source:https://example.org/work-b"},
                ],
            }
            rows, result = resolve(rows, rows[0]["id"], decision, "fixture", "2026-07-19T00:00:00+09:00", root)
            self.assertEqual(result, "resolved")
            self.assertTrue(resolution_suppresses(item_payload, rows, root))
            update_frontmatter_fields(root / b, {"status": "ready_to_post"})
            self.assertFalse(resolution_suppresses(item_payload, rows, root))

    def test_defer_is_ineligible_until_retry_after(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            open_path = "memory/shared_reads_candidates/open.md"
            candidate(root / open_path, "postponed")
            item_payload = payload("alpha", [open_path])
            item_payload["representative"] = open_path
            base = datetime(2026, 7, 19, tzinfo=timezone.utc)
            rows, _ = enqueue_rows([], [item_payload], "cycle-a", base.isoformat(), root)
            decision = {
                "group_key": "alpha",
                "action": "defer",
                "target_paths": [],
                "reason": "source evidence missing",
                "terminal_evidence": [],
                "retry_after": (base + timedelta(days=2)).isoformat(),
            }
            rows, result = resolve(rows, rows[0]["id"], decision, "fixture", base.isoformat(), root)
            self.assertEqual(result, "deferred")
            self.assertTrue(resolution_suppresses(item_payload, rows, root, base + timedelta(days=1)))
            self.assertFalse(resolution_suppresses(item_payload, rows, root, base + timedelta(days=3)))
            self.assertEqual(pending_rows(rows, as_of=base + timedelta(days=1)), [])
            self.assertEqual(len(pending_rows(rows, as_of=base + timedelta(days=3))), 1)
            rows, due_reselection = enqueue_rows(rows, [item_payload], "cycle-due", "later", root)
            self.assertEqual(due_reselection[0]["result"], "pending_duplicate_suppressed")
            self.assertEqual(len(rows), 1)

            update_frontmatter_fields(root / open_path, {"status": "needs_review"})
            self.assertFalse(resolution_suppresses(item_payload, rows, root, base + timedelta(days=1)))
            rows, reselected = enqueue_rows(rows, [item_payload], "cycle-b", "later", root)
            self.assertEqual(reselected[0]["result"], "enqueued")

    def test_legacy_handled_row_remains_valid(self):
        legacy = {
            "id": "legacy",
            "group_key": "alpha",
            "source_cycle_id": "old",
            "status": "handled",
            "payload": {},
            "handled_evidence": "staging only",
        }
        self.assertEqual(validate_rows([legacy]), [])


def read_candidate_status(path: Path) -> str:
    return read_candidate_field(path, "status")


def read_candidate_field(path: Path, key: str) -> str:
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith(f"{key}:"):
            return line.split(":", 1)[1].strip().strip('"')
    return ""


def read_jsonl_after_write(root: Path, rows: list[dict]) -> list[dict]:
    path = root / "inbox.jsonl"
    write_jsonl_atomic(path, rows)
    return read_jsonl(path)


if __name__ == "__main__":
    unittest.main()
