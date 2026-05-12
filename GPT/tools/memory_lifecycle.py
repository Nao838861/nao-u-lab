#!/usr/bin/env python3
"""Lifecycle helpers for Codex memory atoms.

Lifecycle fields are optional. Old atoms without these fields are treated as
active, so tools can adopt dedup metadata incrementally.
"""
from __future__ import annotations

from collections import defaultdict
from typing import Any, Iterable


HIDDEN_STATUSES = {"superseded", "archived"}


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


def fold_atoms(atoms: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return one display atom per lifecycle group, preferring canonical atoms."""
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for atom in atoms:
        groups[group_id(atom)].append(atom)
    folded = [preferred_atom(group) for group in groups.values()]
    folded.sort(key=lambda a: (-int(a.get("score", 0)), str(a.get("datetime", ""))))
    return folded


def folded_count(atoms: Iterable[dict[str, Any]]) -> int:
    rows = list(atoms)
    return len(rows) - len(fold_atoms(rows))
