import tempfile
import unittest
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_shared_reads_group_action_queue import build_queue as build_group_action_queue
from build_shared_reads_open_duplicate_group_queue import build_queue, render_jsonl
from build_shared_reads_stale_triage_queue import build_queue as build_stale_triage_queue

ROOT = Path(__file__).resolve().parents[1]


def candidate(directory: Path, name: str, title: str, status: str, url: str, stale_after: str) -> None:
    (directory / name).write_text(
        "---\n"
        f'title: "{title}"\n'
        f"status: {status}\n"
        f"candidate_status: {status}\n"
        f'url: "{url}"\n'
        f'stale_after: "{stale_after}"\n'
        "genre_tags: [game-design, agent, benchmark]\n"
        "---\nbody\n",
        encoding="utf-8",
    )


class OpenDuplicateGroupQueueTest(unittest.TestCase):
    def test_classifies_mixed_and_all_open_and_preserves_url_evidence(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
            candidates = Path(temp_dir)
            candidate(candidates, "mixed-posted.md", "Mixed", "posted", "https://example.com/mixed", "2026-07-01")
            candidate(candidates, "mixed-open.md", "Mixed", "postponed", "https://example.com/mixed", "2026-07-01")
            candidate(candidates, "open-a.md", "Same Name", "postponed", "https://example.com/work-a", "2026-07-01")
            candidate(candidates, "open-b.md", "Same Name", "needs_review", "https://example.org/work-b", "2026-07-02")
            candidate(candidates, "closed-a.md", "Closed", "posted", "https://example.com/closed", "2026-07-01")
            candidate(candidates, "closed-b.md", "Closed", "failed", "https://example.com/closed", "2026-07-01")

            rows = build_queue(candidates)
            by_key = {row["group_key"]: row for row in rows}
            self.assertEqual(set(by_key), {"mixed", "same name"})
            self.assertEqual(by_key["mixed"]["group_kind"], "mixed")
            self.assertEqual(by_key["same name"]["group_kind"], "all_open")
            self.assertEqual(len(by_key["same name"]["source_url_evidence"]), 2)
            self.assertEqual(by_key["same name"]["recommended_action"], "review_group")

    def test_all_open_group_is_deduplicated_in_stale_triage_and_enters_action_queue(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
            candidates = Path(temp_dir) / "candidates"
            candidates.mkdir()
            candidate(candidates, "a.md", "All Open", "postponed", "https://example.com/a", "2026-07-01")
            candidate(candidates, "b.md", "All Open", "needs_review", "https://example.com/b", "2026-07-02")
            open_rows = build_queue(candidates)
            open_queue = Path(temp_dir) / "open.jsonl"
            open_queue.write_text(render_jsonl(open_rows), encoding="utf-8")

            stale_rows = build_stale_triage_queue(candidates, date(2026, 7, 21), open_queue, -1)
            self.assertEqual(len(stale_rows), 1)
            self.assertEqual(stale_rows[0]["duplicate_group_key"], "all open")
            action_rows = build_group_action_queue(stale_rows, open_rows, [], ROOT)
            self.assertEqual(len(action_rows), 1)
            self.assertEqual(action_rows[0]["group_kind"], "all_open")
            self.assertEqual(len(action_rows[0]["open_siblings"]), 2)

    def test_render_is_idempotent(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
            candidates = Path(temp_dir)
            candidate(candidates, "b.md", "Stable", "needs_review", "https://example.com/b", "2026-07-02")
            candidate(candidates, "a.md", "Stable", "postponed", "https://example.com/a", "2026-07-01")
            self.assertEqual(render_jsonl(build_queue(candidates)), render_jsonl(build_queue(candidates)))


if __name__ == "__main__":
    unittest.main()
