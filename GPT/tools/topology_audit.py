#!/usr/bin/env python3
"""Dry-run topology audit for Codex memory atoms.

This tool does not modify atoms. It reports candidate link-shape risks that
Phase 4a/4b can inspect before deciding on consolidation or lifecycle changes.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from atoms_fileformat import load_atoms_from_per_file


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
ATOMS_PATH = MEMORY_DIR / "atoms.jsonl"
ATOMS_DIR = MEMORY_DIR / "atoms"

ATOM_ID_RE = re.compile(r"\b(?:sr|gr|local)-[A-Za-z0-9_.-]+\b")
WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)")
URL_RE = re.compile(r"^[a-z][a-z0-9+.-]*://", re.IGNORECASE)

LOCAL_TAGS = {
    "game-rights-feedback",
    "nao-u-feedback",
    "private",
    "personal",
    "sensitive",
    "local",
}
PERMANENT_TAGS = {
    "principle",
    "knowledge",
    "memory_redesign",
    "game_lessons_log",
}
PERMANENT_LAYERS = {
    "permanent",
    "durable",
    "canonical",
}


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def load_atoms() -> list[dict[str, Any]]:
    if ATOMS_PATH.exists():
        atoms: list[dict[str, Any]] = []
        with ATOMS_PATH.open("r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    atoms.append(json.loads(line))
        return atoms
    return load_atoms_from_per_file(ATOMS_DIR)


def parse_dt(value: Any) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value))
    except ValueError:
        return None


def atom_label(atom: dict[str, Any]) -> str:
    title = str(atom.get("title") or atom.get("trigger") or "")[:120]
    return title.replace("\n", " ")


def is_url(value: str) -> bool:
    return bool(URL_RE.match(value.strip()))


def normalize_ref(value: Any) -> str | None:
    ref = str(value or "").strip()
    if not ref or is_url(ref):
        return None
    if ref.startswith("[[") and ref.endswith("]]"):
        ref = ref[2:-2].split("|", 1)[0].split("#", 1)[0].strip()
    return ref or None


def collect_edges(atom: dict[str, Any], ids: set[str]) -> list[dict[str, str]]:
    source_id = str(atom.get("id") or "")
    edges: list[dict[str, str]] = []

    def add(target: Any, kind: str) -> None:
        ref = normalize_ref(target)
        if ref and ref in ids and ref != source_id:
            edges.append({"source": source_id, "target": ref, "kind": kind})

    for link in atom.get("links") or []:
        add(link, "link")
        for match in WIKILINK_RE.findall(str(link)):
            add(match, "wikilink")
        for match in ATOM_ID_RE.findall(str(link)):
            add(match, "atom_id")

    for field in ("title", "trigger", "excerpt"):
        text = str(atom.get(field) or "")
        for match in WIKILINK_RE.findall(text):
            add(match, f"{field}_wikilink")
        for match in ATOM_ID_RE.findall(text):
            add(match, f"{field}_atom_id")

    add(atom.get("canonical_id"), "canonical_id")
    add(atom.get("superseded_by"), "superseded_by")
    for target in atom.get("supersedes") or []:
        add(target, "supersedes")

    seen: set[tuple[str, str, str]] = set()
    result: list[dict[str, str]] = []
    for edge in edges:
        key = (edge["source"], edge["target"], edge["kind"])
        if key in seen:
            continue
        seen.add(key)
        result.append(edge)
    return result


def is_local_or_sensitive(atom: dict[str, Any]) -> bool:
    atom_id = str(atom.get("id") or "")
    tags = {str(tag) for tag in atom.get("tags") or []}
    source = str(atom.get("source") or "")
    return (
        atom_id.startswith("local-")
        or bool(tags & LOCAL_TAGS)
        or "game_rights" in source
        or "game-rights" in source
    )


def is_permanent_like(atom: dict[str, Any], score_threshold: int) -> bool:
    tags = {str(tag) for tag in atom.get("tags") or []}
    layer = str(atom.get("memory_layer") or "")
    try:
        score = float(atom.get("score") or 0)
    except (TypeError, ValueError):
        score = 0.0
    return layer in PERMANENT_LAYERS or bool(tags & PERMANENT_TAGS) or score >= score_threshold


def sample_atom(atom: dict[str, Any], extra: dict[str, Any] | None = None) -> dict[str, Any]:
    row = {
        "id": atom.get("id"),
        "title": atom_label(atom),
        "datetime": atom.get("datetime"),
        "tags": list(atom.get("tags") or [])[:8],
        "score": atom.get("score", 0),
        "memory_layer": atom.get("memory_layer"),
    }
    if extra:
        row.update(extra)
    return row


def build_audit(
    atoms: list[dict[str, Any]],
    high_inbound_threshold: int,
    permanent_score_threshold: int,
    stale_days: int,
    limit: int,
) -> dict[str, Any]:
    atoms_by_id = {str(atom.get("id")): atom for atom in atoms if atom.get("id")}
    ids = set(atoms_by_id)
    edges = [edge for atom in atoms for edge in collect_edges(atom, ids)]

    inbound: dict[str, list[dict[str, str]]] = defaultdict(list)
    edge_kinds = Counter()
    for edge in edges:
        inbound[edge["target"]].append(edge)
        edge_kinds[edge["kind"]] += 1

    high_inbound_candidates = []
    for atom_id, refs in inbound.items():
        unique_sources = sorted({ref["source"] for ref in refs})
        if len(unique_sources) < high_inbound_threshold:
            continue
        kind_counts = Counter(ref["kind"] for ref in refs)
        high_inbound_candidates.append(
            sample_atom(
                atoms_by_id[atom_id],
                {
                    "inbound": len(refs),
                    "unique_inbound_sources": len(unique_sources),
                    "edge_kinds": kind_counts.most_common(),
                    "source_sample": unique_sources[:limit],
                },
            )
        )
    high_inbound_candidates.sort(key=lambda row: (-int(row["unique_inbound_sources"]), str(row["id"])))

    sensitive_to_permanent = []
    for edge in edges:
        source = atoms_by_id[edge["source"]]
        target = atoms_by_id[edge["target"]]
        if not is_local_or_sensitive(source):
            continue
        if not is_permanent_like(target, permanent_score_threshold):
            continue
        sensitive_to_permanent.append(
            {
                "source": sample_atom(source),
                "target": sample_atom(target),
                "edge_kind": edge["kind"],
            }
        )

    now = datetime.now()
    stale_cutoff = now - timedelta(days=stale_days)
    stale_bridge_candidates = []
    for atom_id, refs in inbound.items():
        atom = atoms_by_id[atom_id]
        dt = parse_dt(atom.get("datetime"))
        if not dt or dt > stale_cutoff:
            continue
        recent_refs = []
        for ref in refs:
            source_dt = parse_dt(atoms_by_id[ref["source"]].get("datetime"))
            if source_dt and source_dt > stale_cutoff:
                recent_refs.append(ref)
        if not recent_refs:
            continue
        stale_bridge_candidates.append(
            sample_atom(
                atom,
                {
                    "age_days": (now - dt).days,
                    "recent_inbound": len(recent_refs),
                    "recent_source_sample": [ref["source"] for ref in recent_refs[:limit]],
                },
            )
        )
    stale_bridge_candidates.sort(key=lambda row: (-int(row["recent_inbound"]), -int(row["age_days"]), str(row["id"])))

    return {
        "generated_at": now.isoformat(timespec="seconds"),
        "source": str(ATOMS_PATH if ATOMS_PATH.exists() else ATOMS_DIR),
        "atoms": len(atoms),
        "edges": len(edges),
        "edge_kinds": edge_kinds.most_common(),
        "thresholds": {
            "high_inbound": high_inbound_threshold,
            "permanent_score": permanent_score_threshold,
            "stale_days": stale_days,
            "sample_limit": limit,
        },
        "summary": {
            "high_inbound": len(high_inbound_candidates),
            "sensitive_to_permanent": len(sensitive_to_permanent),
            "stale_bridge": len(stale_bridge_candidates),
        },
        "high_inbound": high_inbound_candidates[:limit],
        "sensitive_to_permanent": sensitive_to_permanent[:limit],
        "stale_bridge": stale_bridge_candidates[:limit],
    }


def render_markdown(audit: dict[str, Any]) -> str:
    lines = [
        "# Codex Memory Topology Audit",
        "",
        f"- generated_at: {audit['generated_at']}",
        f"- source: {audit['source']}",
        f"- atoms: {audit['atoms']}",
        f"- edges: {audit['edges']}",
        f"- edge_kinds: {audit['edge_kinds']}",
        f"- thresholds: {audit['thresholds']}",
        "",
        "## Summary",
        "",
    ]
    for key, count in audit["summary"].items():
        lines.append(f"- {key}: {count}")

    def atom_line(row: dict[str, Any]) -> str:
        bits = [f"`{row.get('id')}`", str(row.get("title") or "")]
        for key in ("unique_inbound_sources", "inbound", "recent_inbound", "age_days"):
            if key in row:
                bits.append(f"{key}={row[key]}")
        return " - ".join(bits)

    lines.extend(["", "## high_inbound", ""])
    for row in audit["high_inbound"]:
        lines.append(f"- {atom_line(row)}")
        if row.get("edge_kinds"):
            lines.append(f"  - edge_kinds: {row['edge_kinds']}")
        if row.get("source_sample"):
            lines.append(f"  - source_sample: {row['source_sample']}")

    lines.extend(["", "## sensitive_to_permanent", ""])
    for row in audit["sensitive_to_permanent"]:
        lines.append(
            f"- `{row['source'].get('id')}` -> `{row['target'].get('id')}` "
            f"kind={row['edge_kind']} target_title={row['target'].get('title')}"
        )

    lines.extend(["", "## stale_bridge", ""])
    for row in audit["stale_bridge"]:
        lines.append(f"- {atom_line(row)}")
        if row.get("recent_source_sample"):
            lines.append(f"  - recent_source_sample: {row['recent_source_sample']}")

    return "\n".join(lines) + "\n"


def compact_summary(audit: dict[str, Any]) -> str:
    summary = audit["summary"]
    return (
        "topology_audit="
        f"atoms={audit['atoms']} edges={audit['edges']} "
        f"high_inbound={summary['high_inbound']} "
        f"sensitive_to_permanent={summary['sensitive_to_permanent']} "
        f"stale_bridge={summary['stale_bridge']}"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Dry-run memory atom topology audit.")
    parser.add_argument("--json", action="store_true", help="print JSON")
    parser.add_argument("--compact", action="store_true", help="print one-line summary")
    parser.add_argument("--out", type=Path, help="write markdown report to this path")
    parser.add_argument("--high-inbound-threshold", type=int, default=12)
    parser.add_argument("--permanent-score-threshold", type=int, default=10)
    parser.add_argument("--stale-days", type=int, default=45)
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()

    audit = build_audit(
        load_atoms(),
        high_inbound_threshold=args.high_inbound_threshold,
        permanent_score_threshold=args.permanent_score_threshold,
        stale_days=args.stale_days,
        limit=args.limit,
    )

    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(render_markdown(audit), encoding="utf-8", newline="\n")

    if args.json:
        print(json.dumps(audit, ensure_ascii=False, indent=2))
    elif args.compact:
        print(compact_summary(audit))
    else:
        print(render_markdown(audit))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
