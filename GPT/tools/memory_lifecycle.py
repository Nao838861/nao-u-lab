#!/usr/bin/env python3
"""Lifecycle helpers for Codex memory atoms.

Lifecycle fields are optional. Old atoms without these fields are treated as
active, so tools can adopt dedup metadata incrementally.
"""
from __future__ import annotations

import hashlib
import re
from collections import defaultdict
from typing import Any, Iterable


HIDDEN_STATUSES = {"superseded", "archived"}


def normalized_content(atom: dict[str, Any]) -> str:
    """Return a stable display-dedupe body for one atom.

    This intentionally uses only fields that are already available in both
    atoms.jsonl and per-file atom reads. It is a display/index fold key, not a
    destructive data migration.
    """
    parts = [
        str(atom.get("title") or ""),
        str(atom.get("trigger") or ""),
        str(atom.get("excerpt") or ""),
    ]
    text = "\n".join(part for part in parts if part.strip()).lower()
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalized_content_hash(atom: dict[str, Any]) -> str:
    content = normalized_content(atom)
    if not content:
        return ""
    return hashlib.sha1(content.encode("utf-8")).hexdigest()[:16]


def atom_status(atom: dict[str, Any]) -> str:
    return str(atom.get("status") or "active")


def is_hidden(atom: dict[str, Any]) -> bool:
    return atom_status(atom) in HIDDEN_STATUSES


def atom_id(atom: dict[str, Any]) -> str:
    return str(atom.get("id") or "")


def group_id(atom: dict[str, Any]) -> str:
    return str(atom.get("group_id") or atom.get("canonical_id") or atom.get("id") or "")


def canonical_id(atom: dict[str, Any]) -> str:
    return str(atom.get("canonical_id") or atom.get("id") or "")


def index_by_id(atoms: Iterable[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {atom_id(atom): atom for atom in atoms if atom_id(atom)}


def preferred_atom(atoms: list[dict[str, Any]]) -> dict[str, Any]:
    """Pick the canonical representative for a lifecycle group."""
    by_id = index_by_id(atoms)
    canonical_ids = [canonical_id(atom) for atom in atoms if canonical_id(atom)]
    for cid in canonical_ids:
        candidate = by_id.get(cid)
        if candidate and not is_hidden(candidate):
            return candidate
    active = [atom for atom in atoms if not is_hidden(atom)]
    if active:
        return sorted(active, key=lambda a: (int(a.get("score", 0)), str(a.get("datetime", ""))), reverse=True)[0]
    return sorted(atoms, key=lambda a: (int(a.get("score", 0)), str(a.get("datetime", ""))), reverse=True)[0]


def preferred_content_atom(atoms: list[dict[str, Any]]) -> dict[str, Any]:
    """Pick a deterministic representative for same-content atoms."""
    by_id = index_by_id(atoms)
    for atom in atoms:
        cid = canonical_id(atom)
        if cid != atom_id(atom):
            candidate = by_id.get(cid)
            if candidate and not is_hidden(candidate):
                return candidate

    visible = [atom for atom in atoms if not is_hidden(atom)] or atoms

    def source_ts_value(atom: dict[str, Any]) -> float:
        try:
            return float(atom.get("source_ts") or 0)
        except (TypeError, ValueError):
            return 0.0

    def key(atom: dict[str, Any]) -> tuple[int, float, str]:
        active_rank = 0 if atom_status(atom) == "active" else 1
        source_ts = source_ts_value(atom)
        if source_ts <= 0:
            source_ts = float("inf")
        return (active_rank, source_ts, atom_id(atom))

    return sorted(visible, key=key)[0]


def representative_reason(atom: dict[str, Any], group: list[dict[str, Any]]) -> str:
    reasons: list[str] = []
    if atom.get("group_id") or atom.get("canonical_id"):
        reasons.append("canonical_id")
    if atom_status(atom) == "active":
        reasons.append("active")
    status = str(atom.get("status") or "").lower()
    if status in {"reviewed", "curated"}:
        reasons.append(f"status={status}")
    source_text = " ".join(
        str(atom.get(field) or "")
        for field in ("source", "ingested_via", "channel", "id", "title")
    ).lower()
    if "shared" in source_text or str(atom.get("id") or "").startswith("sr-"):
        reasons.append("shared_reads_signal")
    try:
        source_ts = float(atom.get("source_ts") or 0)
    except (TypeError, ValueError):
        source_ts = 0.0
    if source_ts:
        reasons.append("oldest_source_ts")
    if not reasons:
        reasons.append("newest_visible")
    return ", ".join(reasons)


def annotate_fold(atom: dict[str, Any], group: list[dict[str, Any]], content_hash: str = "") -> dict[str, Any]:
    row = dict(atom)
    folded_count = len(group) - 1
    if folded_count > 0:
        grouped_ids = [atom_id(a) for a in group if atom_id(a) and atom_id(a) != atom_id(atom)]
        row["folded_count"] = folded_count
        row["folded_ids"] = grouped_ids
        row["duplicate_count"] = folded_count
        row["duplicate_ids"] = grouped_ids
        row["grouped_count"] = len(group)
        row["grouped_ids"] = grouped_ids
        row["representative_reason"] = representative_reason(atom, group)
    if content_hash:
        row["normalized_content_hash"] = content_hash
    return row


def fold_atoms(atoms: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return one display atom per lifecycle/content group."""
    rows = list(atoms)
    lifecycle_groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    plain_rows: list[dict[str, Any]] = []
    for atom in rows:
        has_lifecycle_group = bool(atom.get("group_id") or atom.get("canonical_id") or atom_status(atom) != "active")
        if has_lifecycle_group:
            lifecycle_groups[group_id(atom)].append(atom)
        else:
            plain_rows.append(atom)

    folded: list[dict[str, Any]] = []
    for group in lifecycle_groups.values():
        representative = preferred_atom(group)
        if not is_hidden(representative):
            folded.append(annotate_fold(representative, group, normalized_content_hash(representative)))

    content_groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for atom in plain_rows:
        content_hash = str(atom.get("normalized_content_hash") or normalized_content_hash(atom) or atom_id(atom))
        content_groups[content_hash].append(atom)

    for content_hash, group in content_groups.items():
        representative = preferred_content_atom(group)
        if not is_hidden(representative):
            folded.append(annotate_fold(representative, group, content_hash))

    folded.sort(key=lambda a: (-int(a.get("score", 0)), str(a.get("datetime", ""))))
    return folded


def fold_scored(
    scored: Iterable[tuple[float, dict[str, Any]]],
    atoms_by_id: dict[str, dict[str, Any]],
) -> list[tuple[float, dict[str, Any]]]:
    """Fold scored recall rows by lifecycle group, then normalized content."""
    scored_rows = list(scored)
    lifecycle_groups: dict[str, list[tuple[float, dict[str, Any]]]] = defaultdict(list)
    plain_rows: list[tuple[float, dict[str, Any]]] = []
    for score, atom in scored_rows:
        has_lifecycle_group = bool(atom.get("group_id") or atom.get("canonical_id") or atom_status(atom) != "active")
        if has_lifecycle_group:
            lifecycle_groups[group_id(atom)].append((score, atom))
        else:
            plain_rows.append((score, atom))

    folded: list[tuple[float, dict[str, Any]]] = []
    for group_rows in lifecycle_groups.values():
        best_score = max(score for score, _atom in group_rows)
        group_atoms = [atom for _score, atom in group_rows]
        cid = canonical_id(group_atoms[0])
        representative = atoms_by_id.get(cid) or preferred_atom(group_atoms)
        if not is_hidden(representative):
            folded.append((best_score, annotate_fold(representative, group_atoms, normalized_content_hash(representative))))

    content_groups: dict[str, list[tuple[float, dict[str, Any]]]] = defaultdict(list)
    for score, atom in plain_rows:
        content_hash = str(atom.get("normalized_content_hash") or normalized_content_hash(atom) or atom_id(atom))
        content_groups[content_hash].append((score, atom))

    for content_hash, group_rows in content_groups.items():
        best_score = max(score for score, _atom in group_rows)
        group_atoms = [atom for _score, atom in group_rows]
        representative = preferred_content_atom(group_atoms)
        if not is_hidden(representative):
            folded.append((best_score, annotate_fold(representative, group_atoms, content_hash)))

    folded.sort(key=lambda item: (-item[0], str(item[1].get("datetime", ""))))
    return folded


def folded_count(atoms: Iterable[dict[str, Any]]) -> int:
    rows = list(atoms)
    return len(rows) - len(fold_atoms(rows))
