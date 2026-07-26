#!/usr/bin/env python3
"""Build memory/atoms/title_quality_audit.jsonl.

This is a sidecar audit for repeated or boilerplate atom titles. It does not
rewrite atom titles, atoms.jsonl, or per-file atom markdown.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

import memory_recall
from atom_title_clusters import is_generic_title, load_title_cluster_map, semantic_alias
from atoms_fileformat import load_atoms_from_per_file


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
ATOMS_PATH = MEMORY_DIR / "atoms.jsonl"
ATOMS_DIR = MEMORY_DIR / "atoms"
TITLE_QUALITY_AUDIT_PATH = ATOMS_DIR / "title_quality_audit.jsonl"


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


BOILERPLATE_PATTERNS = [
    "■ 概要",
    "■ 内容分析",
    "■ メリット・デメリット",
    "笆",
    "讎りｦ",
    "繝｡繝ｪ繝・ヨ",
    "繝・Γ繝ｪ繝・ヨ",
]
PREFIX_PATTERNS = [
    "[Codex external research]",
    "[Codex shared-reads",
    "[Codex shared_reads",
]


def load_atoms() -> list[dict[str, Any]]:
    if ATOMS_PATH.exists():
        rows: list[dict[str, Any]] = []
        with ATOMS_PATH.open("r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    rows.append(json.loads(line))
        return rows
    return load_atoms_from_per_file(ATOMS_DIR)


def normalized_title(atom: dict[str, Any]) -> str:
    return re.sub(r"\s+", " ", str(atom.get("title") or "").strip())


def parse_source_ts(atom: dict[str, Any]) -> float:
    try:
        return float(atom.get("source_ts") or 0)
    except (TypeError, ValueError):
        return 0.0


def title_group_id(title: str) -> str:
    digest = hashlib.sha1(title.encode("utf-8")).hexdigest()[:16]
    return f"title-quality:{digest}"


def detection_reasons(title: str, raw_count: int, visible_count: int, any_ungrouped: bool) -> list[str]:
    reasons: list[str] = []
    if raw_count > 1:
        reasons.append("repeated_title")
    if visible_count > 1:
        reasons.append("recall_visible_repeated_title")
    if any_ungrouped:
        reasons.append("ungrouped_repeated_title")
    if raw_count >= 5:
        reasons.append("large_repeated_group")
    if any(pattern in title for pattern in BOILERPLATE_PATTERNS):
        reasons.append("boilerplate_or_section_title")
    if any(title.startswith(pattern) for pattern in PREFIX_PATTERNS):
        reasons.append("fixed_prefix_title")
    return reasons


def recommended_action(reasons: list[str], recall_visible: bool) -> str:
    if not recall_visible:
        return "postpone"
    if "boilerplate_or_section_title" in reasons or "fixed_prefix_title" in reasons:
        return "retitle"
    if "large_repeated_group" in reasons:
        return "display_title"
    return "display_title"


def sample_hint(atom: dict[str, Any], limit: int = 96) -> str:
    text = " ".join(
        str(atom.get(key) or "").strip()
        for key in ("trigger", "excerpt")
        if str(atom.get(key) or "").strip()
    )
    text = re.sub(r"https?://\S+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def build_audit_rows(
    atoms: list[dict[str, Any]],
    title_cluster_map: dict[str, dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    title_counts = Counter(normalized_title(atom) for atom in atoms if normalized_title(atom))
    visible_atoms = [atom for atom in atoms if not memory_recall.is_default_excluded(atom)]
    visible_title_counts = Counter(normalized_title(atom) for atom in visible_atoms if normalized_title(atom))
    if title_cluster_map is None:
        title_cluster_map = load_title_cluster_map()

    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for atom in atoms:
        title = normalized_title(atom)
        if title:
            grouped[title].append(atom)

    generated_at = datetime.now().isoformat(timespec="seconds")
    rows: list[dict[str, Any]] = []
    for title, group in grouped.items():
        raw_count = title_counts[title]
        visible_count = visible_title_counts[title]
        any_ungrouped = any(not atom.get("group_id") for atom in group)
        reasons = detection_reasons(title, raw_count, visible_count, any_ungrouped)
        if not reasons:
            continue
        if raw_count < 2 and "boilerplate_or_section_title" not in reasons and "fixed_prefix_title" not in reasons:
            continue
        group_id = title_group_id(title)
        for atom in sorted(group, key=lambda row: (parse_source_ts(row), str(row.get("id") or ""))):
            recall_visible = not memory_recall.is_default_excluded(atom)
            alias, alias_source = semantic_alias(atom)
            generic = is_generic_title(title)
            raw_title_debt = bool(generic or raw_count > 1)
            annotated = memory_recall.annotate_display_labels(
                [(0.0, atom)],
                title_cluster_map,
                visible_title_counts,
            )[0][1]
            effective_display_label = memory_recall.result_title(annotated)
            effective_display_unresolved = bool(
                recall_visible
                and raw_title_debt
                and effective_display_label == title
            )
            rows.append(
                {
                    "audit_id": f"{group_id}:{atom.get('id')}",
                    "title_group_id": group_id,
                    "atom_id": atom.get("id"),
                    "source_ts": atom.get("source_ts"),
                    "current_title": title,
                    "raw_title_count": raw_count,
                    "recall_visible_title_count": visible_count,
                    "recall_visible": recall_visible,
                    "has_group_id": bool(atom.get("group_id")),
                    "detection_reasons": reasons,
                    "recommended_action": recommended_action(reasons, recall_visible),
                    "sample_hint": sample_hint(atom),
                    "generic_title": generic,
                    "semantic_alias": alias if generic else "",
                    "alias_source": alias_source if generic else "",
                    "semantic_alias_covered": bool(generic and alias_source != "deterministic_fallback"),
                    "semantic_alias_fallback": bool(generic and alias_source == "deterministic_fallback"),
                    "raw_title_debt": raw_title_debt,
                    "effective_display_label": effective_display_label,
                    "effective_display_unresolved": effective_display_unresolved,
                    "effective_display_resolution": (
                        "semantic_alias"
                        if annotated.get("semantic_alias")
                        else "display_disambiguator"
                        if annotated.get("display_disambiguator")
                        else "display_secondary_key"
                        if annotated.get("display_secondary_key")
                        else "unresolved"
                        if effective_display_unresolved
                        else "raw_title"
                    ),
                    "generated_at": generated_at,
                }
            )

    rows.sort(
        key=lambda row: (
            -int(row["recall_visible_title_count"]),
            -int(row["raw_title_count"]),
            str(row["current_title"]),
            parse_source_ts({"source_ts": row.get("source_ts")}),
            str(row.get("atom_id") or ""),
        )
    )
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")


def read_generated_at(path: Path) -> str | None:
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                value = json.loads(line).get("generated_at")
            except json.JSONDecodeError:
                return None
            return str(value) if value else None
    return None


def render_jsonl(rows: list[dict[str, Any]], generated_at: str | None = None) -> str:
    rendered_rows = []
    for row in rows:
        rendered = dict(row)
        if generated_at is not None:
            rendered["generated_at"] = generated_at
        rendered_rows.append(json.dumps(rendered, ensure_ascii=False, separators=(",", ":")) + "\n")
    return "".join(rendered_rows)


def main() -> int:
    parser = argparse.ArgumentParser(description="Build memory/atoms/title_quality_audit.jsonl.")
    parser.add_argument("--output", type=Path, default=TITLE_QUALITY_AUDIT_PATH)
    parser.add_argument("--check", action="store_true", help="do not write; fail if output is stale")
    args = parser.parse_args()

    rows = build_audit_rows(load_atoms())
    if args.check:
        expected = render_jsonl(rows, generated_at=read_generated_at(args.output))
        current = args.output.read_text(encoding="utf-8") if args.output.exists() else ""
        if current != expected:
            print(f"{args.output} is stale: expected {len(rows)} title quality audit rows", file=sys.stderr)
            return 1
        print(f"ok: {args.output} is current ({len(rows)} title quality audit rows)")
        return 0

    write_jsonl(args.output, rows)
    groups = len({row["title_group_id"] for row in rows})
    generic_rows = [row for row in rows if row.get("generic_title") and row.get("recall_visible")]
    covered = sum(bool(row.get("semantic_alias_covered")) for row in generic_rows)
    fallback = sum(bool(row.get("semantic_alias_fallback")) for row in generic_rows)
    raw_title_debt = sum(bool(row.get("raw_title_debt")) for row in rows)
    unresolved = sum(bool(row.get("effective_display_unresolved")) for row in rows)
    print(
        f"wrote {len(rows)} title quality audit rows / {groups} title groups to {args.output}; "
        f"raw_title_debt={raw_title_debt} effective_display_unresolved={unresolved}; "
        f"recall-visible generic={len(generic_rows)} alias_covered={covered} fallback={fallback}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
