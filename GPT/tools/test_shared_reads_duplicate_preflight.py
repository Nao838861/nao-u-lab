import unittest
import sys
import os
import tempfile
import time
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

from shared_reads_title_index import (
    duplicate_preflight,
    load_mixed_queue_with_status,
    load_title_index_with_status,
)
from build_shared_reads_title_canonical_index import build_index_rows


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

    def test_three_sidecar_decision_boundaries(self):
        closed = {
            "closed title": {
                "terminal_evidence": True,
                "canonical_path": "closed.md",
            }
        }
        mixed = {
            "mixed title": {
                "group_key": "mixed title",
                "representative_paths": ["open.md"],
            }
        }
        healthy = {"healthy": True, "reason": "fresh"}
        common = {
            "posted_source_rows": [],
            "posted_source_status": healthy,
            "title_index_status": healthy,
            "mixed_queue": mixed,
            "mixed_queue_status": healthy,
        }

        closed_result = duplicate_preflight("Closed Title", "https://example.com/closed", closed, **common)
        self.assertEqual((closed_result["decision"], closed_result["reason"]), ("review", "closed_title_match"))

        mixed_result = duplicate_preflight("Mixed Title", "https://example.com/mixed", closed, **common)
        self.assertEqual((mixed_result["decision"], mixed_result["reason"]), ("review", "mixed_title_match"))

        new_result = duplicate_preflight("New Title", "https://example.com/new", closed, **common)
        self.assertEqual(new_result["decision"], "continue")

    def test_each_unhealthy_sidecar_reviews(self):
        healthy = {"healthy": True, "reason": "fresh"}
        cases = [
            {
                "posted_source_rows": [],
                "posted_source_status": {"healthy": False, "reason": "posted_source_index_missing"},
                "title_index_status": healthy,
                "mixed_queue": {},
                "mixed_queue_status": healthy,
                "expected": "posted_source_index_missing",
            },
            {
                "posted_source_rows": [],
                "posted_source_status": healthy,
                "title_index_status": {"healthy": False, "reason": "title_index_stale_candidates"},
                "mixed_queue": {},
                "mixed_queue_status": healthy,
                "expected": "title_index_stale_candidates",
            },
            {
                "posted_source_rows": [],
                "posted_source_status": healthy,
                "title_index_status": healthy,
                "mixed_queue": {},
                "mixed_queue_status": {"healthy": False, "reason": "mixed_queue_missing"},
                "expected": "mixed_queue_missing",
            },
        ]
        for case in cases:
            expected = case.pop("expected")
            with self.subTest(expected=expected):
                result = duplicate_preflight("New Title", "https://example.com/new", {}, **case)
                self.assertEqual((result["decision"], result["reason"]), ("review", expected))

    def test_canonical_builder_excludes_mixed_group(self):
        rows = [
            {"path": "posted.md", "status": "posted", "title": "Mixed", "title_key": "mixed", "url": "", "evidence": "", "last_decision": ""},
            {"path": "open.md", "status": "postponed", "title": "Mixed", "title_key": "mixed", "url": "", "evidence": "", "last_decision": ""},
            {"path": "failed.md", "status": "failed", "title": "Closed", "title_key": "closed", "url": "", "evidence": "", "last_decision": ""},
            {"path": "posted-closed.md", "status": "posted", "title": "Closed", "title_key": "closed", "url": "", "evidence": "", "last_decision": ""},
        ]
        with patch("build_shared_reads_title_canonical_index.candidate_rows", return_value=rows):
            result = build_index_rows(Path("unused"), "2026-07-20T00:00:00+09:00")
        self.assertEqual([row["title_key"] for row in result], ["closed"])
        self.assertIn("closed-group canonical", result[0]["decision_note"])

    def test_missing_and_stale_derived_sidecars_are_unhealthy(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            candidates = root / "candidates"
            candidates.mkdir()
            candidate = candidates / "candidate.md"
            candidate.write_text("---\ntitle: Fixture\n---\n", encoding="utf-8")
            title_index = root / "title.jsonl"
            mixed_queue = root / "mixed.jsonl"

            self.assertEqual(
                load_title_index_with_status(title_index, candidates)[1]["reason"],
                "title_index_missing",
            )
            self.assertEqual(
                load_mixed_queue_with_status(mixed_queue, candidates)[1]["reason"],
                "mixed_queue_missing",
            )

            title_index.write_text("", encoding="utf-8")
            mixed_queue.write_text("", encoding="utf-8")
            future = time.time_ns() + 2_000_000_000
            os.utime(candidate, ns=(future, future))
            self.assertEqual(
                load_title_index_with_status(title_index, candidates)[1]["reason"],
                "title_index_stale_candidates",
            )
            self.assertEqual(
                load_mixed_queue_with_status(mixed_queue, candidates)[1]["reason"],
                "mixed_queue_stale_candidates",
            )


if __name__ == "__main__":
    unittest.main()
