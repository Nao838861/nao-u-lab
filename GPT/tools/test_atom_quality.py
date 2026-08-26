#!/usr/bin/env python3
from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from atom_quality import (
    atom_quality_report,
    is_mojibake_suspect,
    mojibake_score,
    slack_ingest_quality_action,
)
from memory_health import atom_quality_findings


def fixture(atom_id: str, title: str) -> dict:
    return {
        "id": atom_id,
        "title": title,
        "trigger": "通常のトリガー",
        "excerpt": "通常の本文",
    }


class AtomQualityTests(unittest.TestCase):
    def setUp(self) -> None:
        self.hard = fixture("hard", "壊れた文字 \ufffd を含む")
        self.intentional_ui = fixture("ui", "ボス名が???として表示される")
        self.normal = fixture("normal", "正常なゲーム本文")
        self.high_ratio = fixture("ratio", "a?b?c?d")

    def test_fixed_field_fixtures_are_reason_coded(self) -> None:
        hard = mojibake_score(self.hard["title"])
        ui = mojibake_score(self.intentional_ui["title"])
        normal = mojibake_score(self.normal["title"])
        ratio = mojibake_score(self.high_ratio["title"])

        self.assertEqual(hard["classifications"], ["hard_corruption"])
        self.assertEqual(hard["hard_reasons"], ["replacement_character"])
        self.assertFalse(hard["ambiguous_question_run"])

        self.assertTrue(ui["ambiguous_question_run"])
        self.assertIn("question_run", ui["ambiguous_reasons"])
        self.assertFalse(ui["hard_corruption"])

        self.assertFalse(normal["suspect"])
        self.assertEqual(normal["classifications"], [])

        self.assertTrue(ratio["ambiguous_question_run"])
        self.assertIn("question_ratio_threshold", ratio["ambiguous_reasons"])
        self.assertNotIn("question_run", ratio["ambiguous_reasons"])

    def test_atom_report_keeps_legacy_union_but_separates_fields(self) -> None:
        atom = {
            "id": "mixed",
            "title": "壊れた \ufffd title",
            "trigger": "UI の ??? 表記",
            "excerpt": "normal",
        }
        report = atom_quality_report(atom)

        self.assertTrue(report["suspect"])
        self.assertEqual(report["hard_fields"], ["title"])
        self.assertEqual(report["ambiguous_fields"], ["trigger"])
        self.assertEqual(
            report["reason_codes"]["hard_corruption"],
            ["replacement_character"],
        )
        self.assertIn("question_run", report["reason_codes"]["ambiguous_question_run"])

    def test_slack_ingest_quarantines_only_hard_corruption(self) -> None:
        self.assertEqual(slack_ingest_quality_action(self.hard), "quarantine")
        self.assertEqual(slack_ingest_quality_action(self.intentional_ui), "ingest")
        self.assertEqual(slack_ingest_quality_action(self.high_ratio), "ingest")
        self.assertEqual(slack_ingest_quality_action(self.normal), "ingest")
        self.assertTrue(is_mojibake_suspect(self.intentional_ui))

    def test_health_findings_keep_hard_and_review_only_rows_separate(self) -> None:
        findings = atom_quality_findings(
            [self.hard, self.intentional_ui, self.normal, self.high_ratio]
        )

        self.assertEqual([row["id"] for row in findings["hard_corruption"]], ["hard"])
        self.assertEqual(
            [row["id"] for row in findings["ambiguous_question_run"]],
            ["ui", "ratio"],
        )
        self.assertEqual(
            findings["hard_corruption"][0]["reasons"],
            ["replacement_character"],
        )
        self.assertIn(
            "question_ratio_threshold",
            findings["ambiguous_question_run"][1]["reasons"],
        )


if __name__ == "__main__":
    unittest.main()
