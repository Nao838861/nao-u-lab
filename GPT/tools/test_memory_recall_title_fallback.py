#!/usr/bin/env python3
from __future__ import annotations

import sys
import unittest
from collections import Counter
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

import build_atom_title_quality_audit
import memory_health
import memory_recall


class MemoryRecallTitleFallbackTests(unittest.TestCase):
    def atom(
        self,
        atom_id: str,
        *,
        title: str = "■ 概要",
        excerpt: str = "## 1. HarnessFix による失敗層の診断 - 本文",
        source_ts: str = "1780000000.1",
    ) -> dict:
        return {
            "id": atom_id,
            "title": title,
            "excerpt": excerpt,
            "trigger": "Use when HarnessFix の評価を行う。",
            "source_ts": source_ts,
            "source": "slack_api/shared-reads",
            "tags": ["memory"],
            "kind": ["synthesis"],
            "status": "active",
        }

    def annotate(self, atom: dict, sidecar: dict[str, dict]) -> dict:
        counts = Counter({str(atom["title"]): 1})
        return memory_recall.annotate_display_labels([(1.0, atom)], sidecar, counts)[0][1]

    def test_current_stale_and_absent_sidecar_keep_generic_title_identifiable(self) -> None:
        atom = self.atom("sr-fixture")
        current = {
            "sr-fixture": {
                "semantic_alias": "Sidecar Alias",
                "alias_source": "explicit_heading",
                "display_disambiguator": "2026-05-28 | shared-reads",
                "cluster_id": "title:fixture",
                "cluster_size": 1,
            }
        }
        stale = {"sr-other": current["sr-fixture"]}

        current_row = self.annotate(atom, current)
        stale_row = self.annotate(atom, stale)
        absent_row = self.annotate(atom, {})

        self.assertTrue(current_row["display_label"].startswith("Sidecar Alias | "))
        self.assertEqual(current_row["semantic_alias_origin"], "title_cluster_index")
        for row in (stale_row, absent_row):
            self.assertTrue(row["display_label"].startswith("HarnessFix による失敗層の診断"))
            self.assertEqual(row["semantic_alias_origin"], "runtime_fallback")
            self.assertNotEqual(row["display_label"], atom["title"])

    def test_secondary_key_remains_when_no_meaningful_alias_exists(self) -> None:
        atom = self.atom("sr-secondary", excerpt="", source_ts="1780000000.2")
        atom["trigger"] = ""
        row = self.annotate(atom, {"sr-other": {}})
        self.assertNotIn("semantic_alias", row)
        self.assertEqual(row["display_secondary_key"], "ts:1780000000.2")
        self.assertEqual(row["display_label"], "■ 概要 | ts:1780000000.2")

    def test_title_audit_separates_raw_debt_from_effective_display(self) -> None:
        resolved = self.atom("sr-resolved")
        unresolved = self.atom("sr-unresolved", excerpt="", source_ts="")
        unresolved["trigger"] = ""
        rows = build_atom_title_quality_audit.build_audit_rows(
            [resolved, unresolved],
            title_cluster_map={},
        )
        by_id = {row["atom_id"]: row for row in rows}

        self.assertTrue(by_id["sr-resolved"]["raw_title_debt"])
        self.assertFalse(by_id["sr-resolved"]["effective_display_unresolved"])
        self.assertTrue(by_id["sr-unresolved"]["raw_title_debt"])
        self.assertTrue(by_id["sr-unresolved"]["effective_display_unresolved"])
        self.assertFalse(by_id["sr-unresolved"]["has_group_id"])

    def test_runtime_alias_preserves_canonical_fold_and_exact_reference(self) -> None:
        canonical = self.atom("sr-canonical")
        canonical.update({"group_id": "fixture-group", "canonical_id": "sr-canonical"})
        superseded = self.atom("sr-superseded")
        superseded.update(
            {
                "group_id": "fixture-group",
                "canonical_id": "sr-canonical",
                "status": "superseded",
            }
        )
        fixture_atoms = [canonical, superseded]

        with (
            patch.object(memory_recall, "load_atoms", return_value=[dict(row) for row in fixture_atoms]),
            patch.object(
                memory_recall,
                "load_atoms_for_recall",
                return_value=[dict(row) for row in fixture_atoms],
            ),
            patch.object(memory_recall, "load_title_cluster_map", return_value={}),
        ):
            folded = memory_recall.search("HarnessFix", limit=10)
            exact = memory_recall.search("sr-superseded", limit=10)

        self.assertEqual(len(folded), 1)
        self.assertEqual(folded[0][1]["id"], "sr-canonical")
        self.assertEqual(folded[0][1]["grouped_count"], 2)
        self.assertEqual(len(exact), 1)
        self.assertEqual(exact[0][1]["id"], "sr-superseded")
        self.assertTrue(exact[0][1]["display_label"].startswith("HarnessFix による失敗層の診断"))

    def test_memory_health_aggregates_raw_and_effective_debt_separately(self) -> None:
        audit_rows = [
            {
                "audit_id": "audit:resolved",
                "title_group_id": "group:one",
                "raw_title_debt": True,
                "effective_display_unresolved": False,
            },
            {
                "audit_id": "audit:unresolved",
                "title_group_id": "group:two",
                "raw_title_debt": True,
                "effective_display_unresolved": True,
            },
        ]
        with patch.object(memory_health, "load_jsonl", return_value=audit_rows):
            summary = memory_health.title_quality_audit_summary()

        self.assertEqual(summary["raw_title_debt_rows"], 2)
        self.assertEqual(summary["raw_title_debt_groups"], 2)
        self.assertEqual(summary["effective_display_unresolved_rows"], 1)
        self.assertEqual(summary["effective_display_unresolved_groups"], 1)


if __name__ == "__main__":
    unittest.main()
