import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from shared_reads_title_index import duplicate_preflight


class DuplicatePreflightTest(unittest.TestCase):
    INDEX = {
        "same title": {
            "terminal_evidence": True,
            "canonical_path": "posted.md",
            "permalink": "https://slack.example/posted",
            "posted_source_urls": ["https://example.com/paper?utm_source=x"],
        }
    }

    def test_same_title_and_url_skips(self):
        result = duplicate_preflight("Same Title", "https://example.com/paper/", self.INDEX)
        self.assertEqual(result["decision"], "skip")
        self.assertEqual(result["reason"], "posted_url_match")
        self.assertEqual(result["matched_title_key"], "same title")
        self.assertEqual(result["canonical_path"], "posted.md")
        self.assertEqual(result["permalink"], "https://slack.example/posted")

    def test_different_title_and_same_url_skips(self):
        result = duplicate_preflight("Alternate Title", "https://example.com/paper", self.INDEX)
        self.assertEqual(result["decision"], "skip")
        self.assertEqual(result["title_key"], "alternate title")
        self.assertEqual(result["matched_title_key"], "same title")

    def test_same_title_and_different_url_reviews(self):
        self.assertEqual(duplicate_preflight("Same Title", "https://example.com/revision", self.INDEX)["decision"], "review")

    def test_new_title_and_url_continues(self):
        self.assertEqual(duplicate_preflight("New Title", "https://example.com/new", self.INDEX)["decision"], "continue")

    def test_actual_post_work_match_skips_before_title(self):
        posted = [
            {
                "work_identity": "arxiv:2604.15267",
                "source_urls": ["http://arxiv.org/abs/2604.15267v1"],
                "title_keys": ["coopeval old title"],
                "candidate_paths": [],
                "permalinks": ["https://slack.example/coopeval"],
                "provenance_complete": True,
            }
        ]
        result = duplicate_preflight(
            "CoopEval v2",
            "https://arxiv.org/abs/2604.15267",
            {},
            posted_source_rows=posted,
            posted_source_status={"healthy": True, "reason": "fresh", "unresolved_title_keys": []},
        )
        self.assertEqual(result["decision"], "skip")
        self.assertEqual(result["reason"], "posted_source_work_match")

    def test_stale_or_incomplete_source_index_reviews(self):
        stale = duplicate_preflight(
            "New Title",
            "https://example.com/new",
            {},
            posted_source_rows=[],
            posted_source_status={"healthy": False, "reason": "posted_source_index_stale_raw"},
        )
        self.assertEqual(stale["decision"], "review")
        self.assertEqual(stale["reason"], "posted_source_index_stale_raw")

        incomplete = duplicate_preflight(
            "New Title",
            "https://example.com/new",
            {},
            posted_source_rows=[
                {
                    "work_identity": "url:https://example.com/new",
                    "source_urls": ["https://example.com/new"],
                    "title_keys": ["new title"],
                    "candidate_paths": ["candidate.md"],
                    "permalinks": [],
                    "provenance_complete": False,
                }
            ],
            posted_source_status={"healthy": True, "reason": "fresh", "unresolved_title_keys": []},
        )
        self.assertEqual(incomplete["decision"], "review")
        self.assertEqual(incomplete["reason"], "posted_source_provenance_incomplete")


if __name__ == "__main__":
    unittest.main()
