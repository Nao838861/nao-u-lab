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


if __name__ == "__main__":
    unittest.main()
