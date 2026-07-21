import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from backfill_shared_reads_candidate_status import parse_frontmatter, scalar_fields
from migrate_shared_reads_last_decision import migrate_file


class LastDecisionMigrationTest(unittest.TestCase):
    def test_duplicate_reason_is_separated_from_state(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "candidate.md"
            path.write_text(
                "---\n"
                "gate_decision: pass\n"
                "status: postponed\n"
                "candidate_status: postponed\n"
                "last_decision: posted_url_match\n"
                'evidence: "canonical_path:fixture"\n'
                "---\nbody\n",
                encoding="utf-8",
            )
            result = migrate_file(path, True)
            parsed = parse_frontmatter(path.read_text(encoding="utf-8"))
            assert parsed is not None
            migrated = scalar_fields(parsed[1])
            self.assertEqual(result["status"], "changed")
            self.assertEqual(migrated["last_decision"], "postponed")
            self.assertEqual(migrated["duplicate_reason"], "posted_url_match")
            self.assertNotIn("\n\n---\n", path.read_text(encoding="utf-8"))

    def test_conflicting_current_state_is_not_rewritten(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "candidate.md"
            original = (
                "---\n"
                "status: failed\n"
                "candidate_status: failed\n"
                "last_decision: posted_url_match\n"
                "---\nbody\n"
            )
            path.write_text(original, encoding="utf-8")
            result = migrate_file(path, True)
            self.assertEqual(result["status"], "conflict")
            self.assertEqual(path.read_text(encoding="utf-8"), original)


if __name__ == "__main__":
    unittest.main()
