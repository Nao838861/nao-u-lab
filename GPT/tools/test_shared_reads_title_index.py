import tempfile
import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from shared_reads_title_index import read_frontmatter


class FrontmatterBoundaryTest(unittest.TestCase):
    def parse(self, text: str) -> dict[str, str]:
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "candidate.md"
            path.write_bytes(text.encode("utf-8"))
            return read_frontmatter(path)

    def test_triple_hyphen_inside_url_is_scalar_content(self):
        meta = self.parse(
            "---\n"
            "title: Rational Design\n"
            "url: https://example.com/game---the-making\n"
            "status: posted\n"
            "---\n"
            "body\n"
        )
        self.assertEqual(meta["url"], "https://example.com/game---the-making")
        self.assertEqual(meta["status"], "posted")

    def test_delimiter_like_text_in_body_is_ignored(self):
        meta = self.parse("---\ntitle: Example\nstatus: posted\n---\nbody game---the-making\n")
        self.assertEqual(meta, {"title": "Example", "status": "posted"})

    def test_folded_block_is_preserved(self):
        meta = self.parse("---\ntitle: Example\nreason: >-\n  first line\n  second---line\nstatus: posted\n---\n")
        self.assertEqual(meta["reason"], "first line second---line")
        self.assertEqual(meta["status"], "posted")

    def test_crlf_and_utf8_bom_are_accepted(self):
        meta = self.parse("\ufeff---\r\ntitle: Example\r\nstatus: posted\r\n---\r\nbody\r\n")
        self.assertEqual(meta["status"], "posted")

    def test_missing_closing_delimiter_returns_empty_metadata(self):
        self.assertEqual(self.parse("---\ntitle: Example\nstatus: posted\n"), {})


if __name__ == "__main__":
    unittest.main()
