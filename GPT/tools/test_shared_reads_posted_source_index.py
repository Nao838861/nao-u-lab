import json
import tempfile
import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from shared_reads_posted_source_index import (
    build_index,
    find_source_match,
    load_index,
    normalize_work_identity,
    render_index,
)


class PostedSourceIndexTest(unittest.TestCase):
    def test_domain_limited_work_identity(self):
        self.assertEqual(normalize_work_identity("https://arxiv.org/abs/2604.15267v1"), "arxiv:2604.15267")
        self.assertEqual(normalize_work_identity("https://arxiv.org/pdf/2604.15267v2.pdf"), "arxiv:2604.15267")
        self.assertNotEqual(
            normalize_work_identity("https://example.com/paper/v1"),
            normalize_work_identity("https://example.com/paper/v2"),
        )

    def test_coopeval_and_openlife_regression_fixture(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            raw = root / "shared-reads.jsonl"
            candidates = root / "candidates"
            candidates.mkdir()
            posts = [
                {
                    "_slack_channel_id": "C0AN2FEHEJJ",
                    "channel": "shared-reads",
                    "ts": "1778536700.085879",
                    "text": "[Log_cdx] [shared-reads] CoopEval\n\n出典:\n- arXiv: <http://arxiv.org/abs/2604.15267v1>\n\n■ 要約\nfixture",
                },
                {
                    "_slack_channel_id": "C0AN2FEHEJJ",
                    "channel": "shared-reads",
                    "ts": "1783304602.130549",
                    "text": "[Log_cdx] ■ 概要 OpenLife fixture. ■ URL <https://arxiv.org/abs/2606.31046v1>",
                },
            ]
            raw.write_text("".join(json.dumps(post) + "\n" for post in posts), encoding="utf-8")
            metadata, rows = build_index(raw, candidates, "fixture")
            self.assertEqual(metadata["unresolved_posts"], [])
            coopeval, reason = find_source_match("https://arxiv.org/abs/2604.15267", rows)
            self.assertEqual(reason, "posted_source_work_match")
            self.assertTrue(coopeval["provenance_complete"])
            openlife, reason = find_source_match("https://arxiv.org/abs/2606.31046", rows)
            self.assertEqual(reason, "posted_source_work_match")
            self.assertTrue(openlife["provenance_complete"])
            self.assertIn("1778536700.085879", render_index(metadata, rows))

            index = root / "index.jsonl"
            index.write_text(render_index(metadata, rows), encoding="utf-8")
            _, status = load_index(index, raw_path=raw, candidates_dir=candidates)
            self.assertTrue(status["healthy"])

            # A newly collected, non-posted candidate is not an index input and must not stale it.
            (candidates / "new.md").write_text(
                "---\ntitle: New\nurl: https://example.com/new\nstatus: postponed\n---\n",
                encoding="utf-8",
            )
            _, status = load_index(index, raw_path=raw, candidates_dir=candidates)
            self.assertTrue(status["healthy"])

            # A posted candidate is an auxiliary input and therefore requires regeneration.
            (candidates / "new.md").write_text(
                "---\ntitle: New\nurl: https://example.com/new\nstatus: posted\n---\n",
                encoding="utf-8",
            )
            _, status = load_index(index, raw_path=raw, candidates_dir=candidates)
            self.assertFalse(status["healthy"])
            self.assertEqual(status["reason"], "posted_source_index_stale_candidates")


if __name__ == "__main__":
    unittest.main()
