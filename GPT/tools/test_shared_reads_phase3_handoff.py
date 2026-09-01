import sys
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_shared_reads_phase3_queue import build_queue
from shared_reads_phase3_handoff import (
    enqueue_rows,
    pending_rows,
    resolve,
    state_fingerprint,
    state_snapshot_from_meta,
    validate_rows,
)


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SELECTED_AT = "2026-09-01T10:00:00+09:00"


def candidate_text(
    title: str,
    url: str,
    evaluated_at: str,
    status: str = "ready_to_post",
    permalink: str = "",
) -> str:
    last_decision = "posted" if status == "posted" else ("postponed" if status == "postponed" else "pass")
    next_action = "none" if status == "posted" else (
        "revise_or_research" if status == "postponed" else "post_to_shared_reads"
    )
    lines = [
        "---",
        f'title: "{title}"',
        f'url: "{url}"',
        f'evaluated_at: "{evaluated_at}"',
        f'last_reviewed_at: "{evaluated_at}"',
        f"status: {status}",
        f"candidate_status: {status}",
        f"last_decision: {last_decision}",
        'stale_after: "2026-10-01"',
        f"next_action: {next_action}",
    ]
    if status == "posted":
        lines.extend(
            [
                "posted:",
                '  ts: "1788224400.000100"',
                f'  permalink: "{permalink}"',
                "  char_count: 4012",
                '  posted_at: "2026-09-01T10:20:00+09:00"',
                f'evidence: "{permalink}"',
            ]
        )
    else:
        lines.append('evidence: "gate_decision:pass"')
    lines.extend(["---", "body", ""])
    return "\n".join(lines)


def queue_row(relative: str, evaluated_at: str = "2026-05-01T09:00:00+09:00") -> dict:
    snapshot = state_snapshot_from_meta(
        {
            "title": "Fixture",
            "url": "https://example.com/fixture",
            "evaluated_at": evaluated_at,
            "last_reviewed_at": evaluated_at,
            "status": "ready_to_post",
            "candidate_status": "ready_to_post",
            "stale_after": "2026-10-01",
            "next_action": "post_to_shared_reads",
        }
    )
    return {
        "path": relative,
        "title": snapshot["title"],
        "url": snapshot["url"],
        "evaluated_at": evaluated_at,
        "stale_after": snapshot["stale_after"],
        "state_fingerprint": state_fingerprint(snapshot),
        "selected_candidate_state": snapshot,
        "priority_order": 1,
        "priority_reason": "oldest first",
    }


class Phase3QueueTest(unittest.TestCase):
    def test_queue_excludes_verified_posted_source_and_orders_oldest_first(self):
        with tempfile.TemporaryDirectory(dir=PROJECT_ROOT) as temp_dir:
            candidates = Path(temp_dir) / "candidates"
            candidates.mkdir()
            (candidates / "new.md").write_text(
                candidate_text("New", "https://example.com/new", "2026-06-01T09:00:00+09:00"),
                encoding="utf-8",
            )
            (candidates / "old.md").write_text(
                candidate_text("Old", "https://example.com/old", "2026-05-01T09:00:00+09:00"),
                encoding="utf-8",
            )
            (candidates / "posted-source.md").write_text(
                candidate_text("Already posted", "https://example.com/posted", "2026-04-01T09:00:00+09:00"),
                encoding="utf-8",
            )
            posted_rows = [
                {
                    "canonical_url": "https://example.com/posted",
                    "source_urls": ["https://example.com/posted"],
                    "work_identity": "url:https://example.com/posted",
                    "posted_verified": True,
                }
            ]
            rows = build_queue(candidates, [], posted_rows)
            self.assertEqual([row["title"] for row in rows], ["Old", "New"])
            self.assertEqual([row["priority_order"] for row in rows], [1, 2])
            self.assertTrue(all(row["title_evidence"] and row["url_evidence"] for row in rows))

    def test_queue_suppresses_exact_handled_selection(self):
        with tempfile.TemporaryDirectory(dir=PROJECT_ROOT) as temp_dir:
            root = Path(temp_dir)
            relative = "candidate.md"
            path = root / relative
            path.write_text(
                candidate_text("Fixture", "https://example.com/fixture", "2026-05-01T09:00:00+09:00"),
                encoding="utf-8",
            )
            queue = build_queue(root, [], [])
            rows, _ = enqueue_rows([], queue, "cycle-a", SELECTED_AT)
            rows[0]["status"] = "handled"
            rows[0]["decision"] = "invalidated"
            rows[0]["staging_evidence"] = "fixture"
            rows[0]["handled_evidence"] = "fixture"
            self.assertEqual(build_queue(root, rows, []), [])


class Phase3HandoffTest(unittest.TestCase):
    def test_enqueue_is_idempotent(self):
        relative = "memory/shared_reads_candidates/a.md"
        rows, first = enqueue_rows([], [queue_row(relative)], "cycle-a", SELECTED_AT)
        rows, second = enqueue_rows(rows, [queue_row(relative)], "cycle-b", SELECTED_AT)
        self.assertEqual(first[0]["result"], "enqueued")
        self.assertEqual(second[0]["result"], "already_enqueued")
        self.assertEqual(len(rows), 1)
        self.assertEqual(validate_rows(rows), [])

    def test_changed_state_is_delivered_for_invalidation(self):
        with tempfile.TemporaryDirectory(dir=PROJECT_ROOT) as temp_dir:
            root = Path(temp_dir)
            relative = "memory/shared_reads_candidates/a.md"
            path = root / relative
            path.parent.mkdir(parents=True)
            path.write_text(
                candidate_text("Fixture", "https://example.com/fixture", "2026-05-01T09:00:00+09:00"),
                encoding="utf-8",
            )
            rows, _ = enqueue_rows([], [queue_row(relative)], "cycle-a", SELECTED_AT)
            path.write_text(
                candidate_text(
                    "Fixture",
                    "https://example.com/fixture",
                    "2026-05-02T09:00:00+09:00",
                    status="postponed",
                ),
                encoding="utf-8",
            )
            selected = pending_rows(rows, root)
            self.assertEqual(selected[0]["delivery_action"], "invalidate")
            rows, result = resolve(
                rows,
                rows[0]["id"],
                "invalidated",
                "candidate changed",
                "continue",
                "",
                "candidate frontmatter changed",
                "Phase 3 invalidated[0]",
                "fixture",
                SELECTED_AT,
                root,
            )
            self.assertEqual(result, "handled")
            self.assertEqual(pending_rows(rows, root), [])

    def test_deferred_item_reappears_when_retry_is_due(self):
        with tempfile.TemporaryDirectory(dir=PROJECT_ROOT) as temp_dir:
            root = Path(temp_dir)
            relative = "memory/shared_reads_candidates/a.md"
            path = root / relative
            path.parent.mkdir(parents=True)
            path.write_text(
                candidate_text("Fixture", "https://example.com/fixture", "2026-05-01T09:00:00+09:00"),
                encoding="utf-8",
            )
            rows, _ = enqueue_rows([], [queue_row(relative)], "cycle-a", SELECTED_AT)
            as_of = datetime(2026, 9, 1, tzinfo=timezone.utc)
            retry_after = (as_of + timedelta(days=1)).isoformat()
            rows, result = resolve(
                rows,
                rows[0]["id"],
                "defer",
                "Slack temporary failure",
                "continue",
                "Phase 3 preflight[0]",
                "",
                "Phase 3 deferred[0]",
                "fixture",
                as_of.isoformat(),
                root,
                retry_after,
            )
            self.assertEqual(result, "deferred")
            self.assertEqual(pending_rows(rows, root, as_of=as_of), [])
            due = pending_rows(rows, root, as_of=as_of + timedelta(days=2))
            self.assertEqual(due[0]["delivery_action"], "process")

    def test_posted_receipt_requires_permalink_candidate_and_staging_evidence(self):
        with tempfile.TemporaryDirectory(dir=PROJECT_ROOT) as temp_dir:
            root = Path(temp_dir)
            relative = "memory/shared_reads_candidates/a.md"
            path = root / relative
            path.parent.mkdir(parents=True)
            path.write_text(
                candidate_text("Fixture", "https://example.com/fixture", "2026-05-01T09:00:00+09:00"),
                encoding="utf-8",
            )
            rows, _ = enqueue_rows([], [queue_row(relative)], "cycle-a", SELECTED_AT)
            permalink = "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1788224400000100"
            path.write_text(
                candidate_text(
                    "Fixture",
                    "https://example.com/fixture",
                    "2026-05-01T09:00:00+09:00",
                    status="posted",
                    permalink=permalink,
                ),
                encoding="utf-8",
            )
            with self.assertRaisesRegex(ValueError, "candidate evidence"):
                resolve(
                    rows,
                    rows[0]["id"],
                    "posted",
                    "posted successfully",
                    "continue",
                    "Phase 3 preflight[0]",
                    "",
                    "Phase 3 posted[0]",
                    "fixture",
                    SELECTED_AT,
                    root,
                    permalink=permalink,
                )
            rows, result = resolve(
                rows,
                rows[0]["id"],
                "posted",
                "posted successfully",
                "continue",
                "Phase 3 preflight[0]",
                f"{relative} posted block",
                "Phase 3 posted[0]",
                "fixture",
                SELECTED_AT,
                root,
                permalink=permalink,
            )
            self.assertEqual(result, "handled")
            self.assertEqual(rows[0]["slack_permalink"], permalink)
            self.assertEqual(validate_rows(rows), [])

    def test_quality_rejection_closes_only_after_postponed_frontmatter_and_staging(self):
        with tempfile.TemporaryDirectory(dir=PROJECT_ROOT) as temp_dir:
            root = Path(temp_dir)
            relative = "memory/shared_reads_candidates/a.md"
            path = root / relative
            path.parent.mkdir(parents=True)
            path.write_text(
                candidate_text("Fixture", "https://example.com/fixture", "2026-05-01T09:00:00+09:00"),
                encoding="utf-8",
            )
            rows, _ = enqueue_rows([], [queue_row(relative)], "cycle-a", SELECTED_AT)
            path.write_text(
                candidate_text(
                    "Fixture",
                    "https://example.com/fixture",
                    "2026-05-01T09:00:00+09:00",
                    status="postponed",
                ),
                encoding="utf-8",
            )
            rows, result = resolve(
                rows,
                rows[0]["id"],
                "postponed",
                "final quality gate did not pass",
                "review",
                "Phase 3 preflight[0]",
                f"{relative} lifecycle fields",
                "Phase 3 skipped[0]",
                "fixture",
                SELECTED_AT,
                root,
            )
            self.assertEqual(result, "handled")
            self.assertEqual(rows[0]["decision"], "postponed")
            self.assertEqual(validate_rows(rows), [])


if __name__ == "__main__":
    unittest.main()
