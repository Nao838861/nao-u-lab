import sys
import tempfile
import unittest
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_shared_reads_open_duplicate_group_queue import build_queue as build_open_queue
from build_shared_reads_open_duplicate_group_queue import render_jsonl
from build_shared_reads_stale_triage_queue import build_queue as build_stale_queue
from shared_reads_group_handoff import enqueue_rows, resolve, write_jsonl_atomic


ROOT = Path(__file__).resolve().parents[1]


def candidate(path: Path, title: str, status: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        "---\n"
        f'title: "{title}"\n'
        f"status: {status}\n"
        f"candidate_status: {status}\n"
        'stale_after: "2026-07-01"\n'
        'genre_tags: [game-design, agent, benchmark]\n'
        "---\nbody\n",
        encoding="utf-8",
    )


class StaleTriageLeaseTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(dir=ROOT)
        self.root = Path(self.temp.name)
        self.candidates = self.root / "memory" / "shared_reads_candidates"
        candidate(self.candidates / "a.md", "Leased Group", "postponed")
        candidate(self.candidates / "b.md", "Leased Group", "needs_review")
        candidate(self.candidates / "single.md", "Unrelated Candidate", "postponed")
        self.open_rows = build_open_queue(self.candidates)
        self.open_queue = self.root / "open.jsonl"
        self.open_queue.write_text(render_jsonl(self.open_rows), encoding="utf-8")
        self.inbox = self.root / "inbox.jsonl"
        group = self.open_rows[0]
        self.payload = {
            "group_key": group["group_key"],
            "representative": group["representative_paths"][0],
            "open_siblings": group["open_paths"],
            "terminal_siblings": group["terminal_paths"],
            "priority_reason": "fixture",
        }
        self.base = datetime(2026, 7, 22, tzinfo=timezone.utc)

    def tearDown(self) -> None:
        self.temp.cleanup()

    def stale(self, as_of: datetime) -> list[dict]:
        return build_stale_queue(
            self.candidates,
            date(2026, 7, 22),
            self.open_queue,
            -1,
            self.inbox,
            as_of,
            ROOT,
        )

    def test_pending_suppresses_group_but_not_unrelated_candidate(self):
        rows, _ = enqueue_rows([], [self.payload], "cycle-a", self.base.isoformat(), ROOT)
        write_jsonl_atomic(self.inbox, rows)
        self.assertEqual([row["title"] for row in self.stale(self.base)], ["Unrelated Candidate"])

    def test_defer_suppresses_until_retry_and_reopens_on_membership_change(self):
        rows, _ = enqueue_rows([], [self.payload], "cycle-a", self.base.isoformat(), ROOT)
        decision = {
            "group_key": self.payload["group_key"],
            "action": "defer",
            "target_paths": [],
            "reason": "wait for full paper",
            "terminal_evidence": [],
            "retry_after": (self.base + timedelta(days=10)).isoformat(),
        }
        rows, _ = resolve(rows, rows[0]["id"], decision, "fixture", self.base.isoformat(), ROOT)
        write_jsonl_atomic(self.inbox, rows)
        self.assertEqual([row["title"] for row in self.stale(self.base)], ["Unrelated Candidate"])
        self.assertEqual(len(self.stale(self.base + timedelta(days=11))), 2)

        candidate(self.candidates / "c.md", "Leased Group", "postponed")
        changed_rows = build_open_queue(self.candidates)
        self.open_queue.write_text(render_jsonl(changed_rows), encoding="utf-8")
        self.assertEqual(len(self.stale(self.base)), 2)

    def test_unrelated_group_lease_does_not_suppress(self):
        unrelated_payload = dict(self.payload)
        unrelated_payload["group_key"] = "some other group"
        rows, _ = enqueue_rows([], [unrelated_payload], "cycle-a", self.base.isoformat(), ROOT)
        write_jsonl_atomic(self.inbox, rows)
        self.assertEqual(len(self.stale(self.base)), 2)


if __name__ == "__main__":
    unittest.main()
