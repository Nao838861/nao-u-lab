#!/usr/bin/env python3
from __future__ import annotations

import sys
import unittest
from datetime import datetime
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

import memory_health
import memory_recall


def fixture_atom() -> dict:
    return {
        "id": "local-health-snapshot-fixture",
        "title": "Memory health snapshot fixture",
        "trigger": "記憶 システム shared-reads ゲーム 自己判定 ハーネス substrate surface memory",
        "excerpt": "single immutable input for all recall probes",
        "source_ts": "1786400000.0",
        "source": "test",
        "tags": ["memory", "game-design", "harness"],
        "kind": ["observation"],
        "score": 10,
        "status": "active",
    }


def empty_mirror_audit(**_kwargs) -> dict:
    return {
        "counts": {"atoms_jsonl": 1, "per_file_md": 1, "index_jsonl": 1},
        "per_file_only": [],
        "index_only": [],
        "jsonl_only": [],
        "missing_file": [],
        "parse_errors": [],
        "index_errors": [],
        "content_conflicts": [],
    }


class MemoryHealthSnapshotTests(unittest.TestCase):
    def build_with_fingerprints(self, fingerprints: list[dict], mirror_audit=None):
        now = datetime.now().isoformat(timespec="seconds")

        def load_jsonl(path: Path) -> list[dict]:
            if path == memory_health.RAW_SHARED_READS_PATH:
                return [{"ts": "fixture"}]
            return []

        def load_json(path: Path, default):
            if path == memory_health.ATOM_STATS_PATH:
                return {"atoms": {}, "queries": 1}
            if path in {memory_health.STATE_PATH, memory_health.SLACK_STATE_PATH}:
                return {"last_run": now}
            return default

        mirror = mirror_audit or empty_mirror_audit
        with (
            patch.object(memory_health, "capture_memory_input_fingerprint", side_effect=fingerprints),
            patch.object(memory_health, "load_atoms_jsonl", return_value=[fixture_atom()]) as atoms_loader,
            patch.object(memory_health, "load_canonical_overlay", return_value=[]),
            patch.object(memory_health, "load_jsonl", side_effect=load_jsonl),
            patch.object(memory_health, "load_json", side_effect=load_json),
            patch.object(memory_health.audit_atom_mirror_drift, "build_audit", side_effect=mirror),
            patch.object(
                memory_health.topology_audit,
                "build_audit",
                return_value={"edges": 0, "edge_kinds": [], "summary": {}, "thresholds": {}},
            ),
            patch.object(memory_recall, "load_title_cluster_map", return_value={}),
            patch.object(memory_recall, "load_atoms", side_effect=AssertionError("standalone raw reader used")),
            patch.object(
                memory_recall,
                "load_atoms_for_recall",
                side_effect=AssertionError("standalone canonical reader used"),
            ),
        ):
            health = memory_health.build_health()
        return health, atoms_loader

    def test_health_reads_atoms_jsonl_once_and_reuses_snapshot_for_all_probes(self) -> None:
        fingerprint = {"digest": "stable", "files": 4}
        seen_views = []
        original = memory_recall.search_atoms

        def observe(query, limit, raw_atoms, canonical_atoms, **kwargs):
            seen_views.append((id(raw_atoms), id(canonical_atoms)))
            return original(query, limit, raw_atoms, canonical_atoms, **kwargs)

        with patch.object(memory_recall, "search_atoms", side_effect=observe):
            health, atoms_loader = self.build_with_fingerprints([fingerprint, fingerprint])

        self.assertEqual(atoms_loader.call_count, 1)
        self.assertEqual(len(health["recall_smoke"]), 3)
        self.assertTrue(all(row["hits"] for row in health["recall_smoke"]))
        self.assertEqual(len(set(seen_views)), 1)
        self.assertEqual(health["input_consistency"]["status"], "stable")

    def test_concurrent_change_makes_mirror_drift_inconclusive(self) -> None:
        before = {"digest": "before", "files": 4}
        after = {"digest": "after", "files": 5}

        def drifting_audit(**kwargs) -> dict:
            report = empty_mirror_audit(**kwargs)
            report["jsonl_only"] = ["local-transient-row"]
            return report

        health, _atoms_loader = self.build_with_fingerprints([before, after], drifting_audit)

        self.assertEqual(health["input_consistency"]["status"], "inconclusive")
        self.assertEqual(health["input_consistency"]["reason"], "concurrent_write")
        self.assertEqual(health["atom_mirror_audit"]["status"], "inconclusive")
        self.assertFalse(any("atom mirror drift" in error for error in health["errors"]))

    def test_standalone_search_keeps_existing_loaders_and_result_shape(self) -> None:
        atom = fixture_atom()
        with (
            patch.object(memory_recall, "load_atoms", return_value=[dict(atom)]) as raw_loader,
            patch.object(memory_recall, "load_atoms_for_recall", return_value=[dict(atom)]) as canonical_loader,
            patch.object(memory_recall, "load_title_cluster_map", return_value={}),
        ):
            results = memory_recall.search("memory", 3)

        raw_loader.assert_called_once_with()
        canonical_loader.assert_called_once_with()
        self.assertEqual(results[0][1]["id"], atom["id"])
        self.assertIsInstance(results[0][0], float)


if __name__ == "__main__":
    unittest.main()
