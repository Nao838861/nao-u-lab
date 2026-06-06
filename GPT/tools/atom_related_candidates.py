#!/usr/bin/env python3
"""Build candidate peer-link sidecar rows for memory atoms.

This module only proposes related atom ids. It does not write confirmed links
to atom frontmatter or markdown bodies.
"""
from __future__ import annotations

import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
ATOMS_DIR = MEMORY_DIR / "atoms"
RELATED_CANDIDATES_PATH = ATOMS_DIR / "related_candidates.jsonl"

TARGET_TAGS = {
    "game-rights",
    "game-design",
    "game-dev-teacher",
    "harness",
    "headless-eval",
    "memory",
    "memory-routing",
    "nao-u-feedback",
    "px-evaluation",
    "skills",
}
STOP_TOKENS = {
    "and",
    "for",
    "from",
    "that",
    "the",
    "this",
    "when",
    "with",
}
RECENT_WINDOW_DAYS = 14
DEFAULT_LIMIT = 5
MIN_SCORE = 4.0


def parse_source_ts(atom: dict[str, Any]) -> float:
    try:
        return float(atom.get("source_ts") or 0)
    except (TypeError, ValueError):
        return 0.0


def atom_id(atom: dict[str, Any]) -> str:
    return str(atom.get("id") or "")


def tags(atom: dict[str, Any]) -> set[str]:
    return {str(tag).lower() for tag in atom.get("tags", []) if tag}


def text_tokens(atom: dict[str, Any]) -> set[str]:
    text = " ".join(
        str(atom.get(key) or "")
        for key in ("title", "trigger", "excerpt")
    ).lower()
    tokens = set(re.findall(r"[a-z0-9_./-]{3,}", text))
    tokens.update(re.findall(r"[\u30a0-\u30ff]{3,}", text))
    tokens.update(re.findall(r"[\u4e00-\u9fff]{2,6}", text))
    return {token for token in tokens if token not in STOP_TOKENS}


def link_domains(atom: dict[str, Any]) -> set[str]:
    domains: set[str] = set()
    for link in atom.get("links", []):
        parsed = urlparse(str(link))
        if parsed.netloc:
            domains.add(parsed.netloc.lower())
    return domains


def shared_count(left: set[str], right: set[str]) -> int:
    return len(left & right)


def is_target_atom(atom: dict[str, Any], recent_cutoff: float) -> bool:
    if tags(atom) & TARGET_TAGS:
        return True
    ts = parse_source_ts(atom)
    return bool(ts and recent_cutoff and ts >= recent_cutoff)


def candidate_score(
    target: dict[str, Any],
    candidate: dict[str, Any],
    target_tags: set[str],
    candidate_tags: set[str],
    target_tokens: set[str],
    candidate_tokens: set[str],
    target_domains: set[str],
    candidate_domains: set[str],
) -> tuple[float, list[str]]:
    reasons: list[str] = []
    score = 0.0

    common_tags = sorted(target_tags & candidate_tags)
    if common_tags:
        score += min(len(common_tags), 5) * 1.8
        reasons.append("shared_tags:" + ",".join(common_tags[:5]))

    common_tokens = sorted(target_tokens & candidate_tokens)
    strong_tokens = [token for token in common_tokens if len(token) >= 5]
    if strong_tokens:
        score += min(len(strong_tokens), 4) * 1.0
        reasons.append("shared_terms:" + ",".join(strong_tokens[:4]))

    common_domains = sorted(target_domains & candidate_domains)
    if common_domains:
        score += min(len(common_domains), 2) * 2.0
        reasons.append("shared_domains:" + ",".join(common_domains[:2]))

    if str(target.get("source") or "") == str(candidate.get("source") or ""):
        score += 0.8
        reasons.append("same_source")

    if str(target.get("channel") or "") and target.get("channel") == candidate.get("channel"):
        score += 0.5
        reasons.append("same_channel")

    target_kind = {str(item) for item in target.get("kind", [])}
    candidate_kind = {str(item) for item in candidate.get("kind", [])}
    common_kind = sorted(target_kind & candidate_kind)
    if common_kind:
        score += 0.4
        reasons.append("shared_kind:" + ",".join(common_kind[:3]))

    return score, reasons


def build_related_candidate_rows(
    atoms: list[dict[str, Any]],
    limit: int = DEFAULT_LIMIT,
    min_score: float = MIN_SCORE,
    generated_at: str | None = None,
) -> list[dict[str, Any]]:
    generated = generated_at or datetime.now().isoformat(timespec="seconds")
    valid_atoms = [atom for atom in atoms if atom_id(atom)]
    max_ts = max((parse_source_ts(atom) for atom in valid_atoms), default=0.0)
    recent_cutoff = max_ts - RECENT_WINDOW_DAYS * 86400 if max_ts else 0.0

    tag_map = {atom_id(atom): tags(atom) for atom in valid_atoms}
    token_map = {atom_id(atom): text_tokens(atom) for atom in valid_atoms}
    domain_map = {atom_id(atom): link_domains(atom) for atom in valid_atoms}
    hash_map = {atom_id(atom): str(atom.get("normalized_content_hash") or "") for atom in valid_atoms}

    rows: list[dict[str, Any]] = []
    targets = [atom for atom in valid_atoms if is_target_atom(atom, recent_cutoff)]
    for target in targets:
        target_id = atom_id(target)
        scored: list[tuple[float, dict[str, Any], list[str]]] = []
        for candidate in valid_atoms:
            candidate_id = atom_id(candidate)
            if not candidate_id or candidate_id == target_id:
                continue
            if hash_map.get(target_id) and hash_map.get(target_id) == hash_map.get(candidate_id):
                continue
            score, reasons = candidate_score(
                target,
                candidate,
                tag_map[target_id],
                tag_map[candidate_id],
                token_map[target_id],
                token_map[candidate_id],
                domain_map[target_id],
                domain_map[candidate_id],
            )
            if score >= min_score and reasons:
                scored.append((score, candidate, reasons))

        scored.sort(key=lambda item: (-item[0], -parse_source_ts(item[1]), atom_id(item[1])))
        selected = scored[:limit]
        if not selected:
            continue
        candidates = [
            {
                "id": atom_id(candidate),
                "title": candidate.get("title") or "",
                "score": round(score, 3),
                "reasons": reasons[:5],
            }
            for score, candidate, reasons in selected
        ]
        rows.append(
            {
                "atom_id": target_id,
                "title": target.get("title") or "",
                "tags": sorted(tag_map[target_id]),
                "source": target.get("source") or "",
                "created_at": target.get("datetime") or "",
                "source_ts": target.get("source_ts") or "",
                "reasons": sorted({reason.split(":", 1)[0] for _score, _candidate, rs in selected for reason in rs}),
                "candidate_ids": [row["id"] for row in candidates],
                "candidates": candidates,
                "review_status": "candidate",
                "scope": "game-memory-or-recent",
                "generated_at": generated,
            }
        )

    rows.sort(key=lambda row: (-len(row["candidate_ids"]), str(row.get("source_ts") or ""), row["atom_id"]))
    return rows


def summarize_rows(rows: list[dict[str, Any]], target_count: int) -> dict[str, Any]:
    candidate_counts = [len(row.get("candidate_ids", [])) for row in rows]
    reason_counts = Counter(reason for row in rows for reason in row.get("reasons", []))
    return {
        "target_atoms": target_count,
        "atoms_with_candidates": len(rows),
        "candidate_coverage": round(len(rows) / target_count, 4) if target_count else 0.0,
        "candidate_edges": sum(candidate_counts),
        "avg_candidates": round(sum(candidate_counts) / len(rows), 3) if rows else 0.0,
        "top_reasons": reason_counts.most_common(8),
    }


def count_targets(atoms: list[dict[str, Any]]) -> int:
    valid_atoms = [atom for atom in atoms if atom_id(atom)]
    max_ts = max((parse_source_ts(atom) for atom in valid_atoms), default=0.0)
    recent_cutoff = max_ts - RECENT_WINDOW_DAYS * 86400 if max_ts else 0.0
    return sum(1 for atom in valid_atoms if is_target_atom(atom, recent_cutoff))


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")
