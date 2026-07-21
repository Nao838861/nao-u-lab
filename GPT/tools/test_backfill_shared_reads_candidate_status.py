import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from backfill_shared_reads_candidate_status import audit_file, scalar_fields, parse_frontmatter


ROOT = Path(__file__).resolve().parents[1]


def write_candidate(path: Path, fields: str, body: str = "body\n") -> None:
    path.write_text(f"---\n{fields}---\n{body}", encoding="utf-8")


def fields(path: Path) -> dict[str, str]:
    parsed = parse_frontmatter(path.read_text(encoding="utf-8"))
    assert parsed is not None
    return scalar_fields(parsed[1])


class CandidateLifecycleAuditTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(dir=ROOT)
        self.path = Path(self.temp.name) / "candidate.md"
        self.today = date(2026, 7, 22)

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_later_terminal_transition_is_not_rewound_to_historical_gate(self):
        write_candidate(
            self.path,
            "gate_decision: postpone\n"
            "candidate_status: failed\n"
            "status: failed\n"
            "last_decision: failed_duplicate_of_terminal_sibling\n"
            'evidence: "group_handoff:fixture"\n',
        )
        result = audit_file(self.path, True, True, False, self.today)
        self.assertEqual(result["anomalies"], [])
        self.assertEqual(fields(self.path)["status"], "failed")
        self.assertEqual(fields(self.path)["candidate_status"], "failed")

    def test_transition_without_evidence_is_reported_but_not_auto_rewound(self):
        write_candidate(
            self.path,
            "gate_decision: postpone\n"
            "candidate_status: failed\n"
            "status: failed\n",
        )
        result = audit_file(self.path, True, True, False, self.today)
        self.assertIn("current_state_transition_lacks_evidence:postponed->failed", result["anomalies"])
        self.assertEqual(fields(self.path)["status"], "failed")

    def test_mismatched_current_fields_use_decision_evidence_for_safe_repair(self):
        write_candidate(
            self.path,
            "gate_decision: postpone\n"
            "candidate_status: postponed\n"
            "status: failed\n"
            "last_decision: failed_duplicate_of_terminal_sibling\n"
            'evidence: "group_handoff:fixture"\n',
        )
        result = audit_file(self.path, True, True, False, self.today)
        self.assertIn("status_candidate_status_mismatch:failed!=postponed", result["anomalies"])
        self.assertEqual(fields(self.path)["status"], "failed")
        self.assertEqual(fields(self.path)["candidate_status"], "failed")

    def test_gate_decision_is_only_a_missing_field_fallback(self):
        write_candidate(self.path, "gate_decision: postpone\n")
        audit_file(self.path, True, True, False, self.today)
        self.assertEqual(fields(self.path)["status"], "postponed")
        self.assertEqual(fields(self.path)["candidate_status"], "postponed")

    def test_later_evidenced_terminal_state_survives_historical_phase3_skip(self):
        write_candidate(
            self.path,
            "gate_decision: pass\n"
            "candidate_status: failed\n"
            "status: failed\n"
            "last_decision: failed_duplicate_of_terminal_sibling\n"
            'evidence: "group_handoff:fixture"\n'
            "phase3_skip:\n"
            '  skipped_at: "2026-05-28T05:54:06+09:00"\n'
            '  reason: "duplicate_url_already_posted"\n',
        )
        result = audit_file(self.path, True, True, False, self.today)
        self.assertEqual(result["status_source"], "decision_evidence_after_phase3_skip")
        self.assertEqual(fields(self.path)["status"], "failed")


if __name__ == "__main__":
    unittest.main()
