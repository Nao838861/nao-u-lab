#!/usr/bin/env python3
from __future__ import annotations

import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from atom_title_clusters import build_title_cluster_rows, is_generic_title, semantic_alias


class AtomTitleClusterTests(unittest.TestCase):
    def atom(self, atom_id: str, title: str, excerpt: str = "", trigger: str = "") -> dict:
        return {
            "id": atom_id,
            "title": title,
            "excerpt": excerpt,
            "trigger": trigger,
            "source_ts": "1780000000.1",
            "source": "slack_api/shared-reads",
            "tags": ["memory"],
            "kind": ["synthesis"],
        }

    def test_explicit_heading_alias_for_overview_title(self) -> None:
        atom = self.atom("sr-overview", "■ 概要", "## 1. HarnessFix による失敗層の診断 - 本文")
        self.assertEqual(semantic_alias(atom), ("HarnessFix による失敗層の診断", "explicit_heading"))

    def test_singleton_generic_title_is_indexed(self) -> None:
        atom = self.atom("sr-single", "@", trigger="【ゲーム記憶の検索改善】本文")
        rows = build_title_cluster_rows([atom])
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["count"], 1)
        self.assertEqual(rows[0]["members"][0]["semantic_alias"], "ゲーム記憶の検索改善")

    def test_fallback_is_deterministic(self) -> None:
        atom = self.atom("sr-fallback", "■ メリット・デメリット")
        alias, source = semantic_alias(atom)
        self.assertEqual(source, "deterministic_fallback")
        self.assertIn("sr-fallback", alias)

    def test_non_generic_singleton_is_not_indexed(self) -> None:
        atom = self.atom("local-specific", "固有のゲーム設計判断", excerpt="本文")
        self.assertFalse(is_generic_title(atom["title"]))
        self.assertEqual(build_title_cluster_rows([atom]), [])


if __name__ == "__main__":
    unittest.main()
