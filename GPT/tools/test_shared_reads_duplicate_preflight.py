import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from shared_reads_title_index import duplicate_preflight


class DuplicatePreflightTest(unittest.TestCase):
    INDEX = {"same title": {"terminal_evidence": True, "canonical_path": "posted.md", "posted_source_urls": ["https://example.com/paper?utm_source=x"]}}

    def test_same_title_and_url_skips(self):
        self.assertEqual(duplicate_preflight("Same Title", "https://example.com/paper/", self.INDEX)["decision"], "skip")

    def test_same_title_and_different_url_reviews(self):
        self.assertEqual(duplicate_preflight("Same Title", "https://example.com/revision", self.INDEX)["decision"], "review")

    def test_new_title_continues(self):
        self.assertEqual(duplicate_preflight("New Title", "https://example.com/paper", self.INDEX)["decision"], "continue")


if __name__ == "__main__":
    unittest.main()
