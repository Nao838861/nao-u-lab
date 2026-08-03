import sys
from pathlib import Path
import tempfile
import unittest


sys.path.insert(0, str(Path(__file__).resolve().parent))

from shared_reads_unreviewed_intake import build_report, inspect_candidates


def write_candidate(path: Path, fields: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"---\n{fields}---\nbody\n", encoding="utf-8")


def provenance(title: str, collected_at: str) -> str:
    return (
        f'title: "{title}"\n'
        f'url: "https://example.com/{path_slug(title)}"\n'
        f'collected_at: "{collected_at}"\n'
        'collected_by: "log_cdx (Phase 1)"\n'
    )


def path_slug(value: str) -> str:
    return value.casefold().replace(" ", "-")


class UnreviewedIntakeTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.candidates = self.root / "memory" / "shared_reads_candidates"

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_requires_provenance_and_all_evaluation_fields_to_be_absent(self):
        write_candidate(
            self.candidates / "valid.md",
            provenance("Valid", "2026-08-01T10:00:00+09:00"),
        )
        write_candidate(
            self.candidates / "already_started.md",
            provenance("Started", "2026-08-01T09:00:00+09:00") + "status: needs_review\n",
        )
        write_candidate(
            self.candidates / "missing_url.md",
            'title: "Missing"\ncollected_at: "2026-08-01T08:00:00+09:00"\n'
            'collected_by: "log_cdx (Phase 1)"\n',
        )

        valid, malformed, evaluated = inspect_candidates(self.candidates, self.root)

        self.assertEqual([item.path for item in valid], ["memory/shared_reads_candidates/valid.md"])
        self.assertEqual(evaluated, 1)
        self.assertEqual(len(malformed), 1)
        self.assertEqual(malformed[0]["missing_fields"], ["url"])

    def test_selects_by_collected_at_then_path_and_excludes_phase1_paths(self):
        write_candidate(
            self.candidates / "b.md",
            provenance("B", "2026-08-01T10:00:00+09:00"),
        )
        write_candidate(
            self.candidates / "a.md",
            provenance("A", "2026-08-01T10:00:00+09:00"),
        )
        write_candidate(
            self.candidates / "old.md",
            provenance("Old", "2026-07-01T10:00:00+09:00"),
        )
        staging = self.root / "log" / "cycle_staging_log_cdx.md"
        staging.parent.mkdir(parents=True)
        staging.write_text(
            "# cycle\n\n## Phase 1: 情報収集\n"
            "- `memory/shared_reads_candidates/old.md`\n"
            "\n## Phase 2: 分析\n",
            encoding="utf-8",
        )

        report = build_report(self.candidates, self.root, 1, staging)

        self.assertEqual(report["valid_unreviewed_count"], 3)
        self.assertEqual(report["phase1_excluded_paths"], ["memory/shared_reads_candidates/old.md"])
        self.assertEqual(
            [item["path"] for item in report["selected"]],
            ["memory/shared_reads_candidates/a.md"],
        )

    def test_invalid_collected_at_is_malformed(self):
        write_candidate(
            self.candidates / "bad_date.md",
            provenance("Bad Date", "not-a-date"),
        )

        valid, malformed, _ = inspect_candidates(self.candidates, self.root)

        self.assertEqual(valid, [])
        self.assertEqual(malformed[0]["missing_fields"], ["collected_at(valid ISO 8601)"])


if __name__ == "__main__":
    unittest.main()
