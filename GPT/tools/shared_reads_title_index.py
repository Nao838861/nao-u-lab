#!/usr/bin/env python3
"""Utilities for shared-reads title-level canonical decisions."""

from __future__ import annotations

import json
import re
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CANDIDATES_DIR = ROOT / "memory" / "shared_reads_candidates"
DEFAULT_TITLE_INDEX = ROOT / "memory" / "shared_reads_title_canonical_index.jsonl"
DEFAULT_MIXED_QUEUE = ROOT / "memory" / "shared_reads_mixed_duplicate_queue.jsonl"
TERMINAL_STATUSES = {"posted", "failed"}
TRACKING_QUERY_KEYS = {"fbclid", "gclid", "mc_cid", "mc_eid"}


def normalize_title_key(title: str) -> str:
    """Return the stable title key used by the canonical index."""
    title = title.casefold()
    title = re.sub(r"https?://\S+", " ", title)
    title = re.sub(r"[_\W]+", " ", title, flags=re.UNICODE)
    return " ".join(title.split())


def canonicalize_url(url: str) -> str:
    """Normalize a source URL for duplicate preflight comparisons."""
    url = url.strip()
    if not url:
        return ""
    parts = urlsplit(url)
    scheme = parts.scheme.casefold()
    host = (parts.hostname or "").casefold()
    port = parts.port
    netloc = host
    if port and not ((scheme == "http" and port == 80) or (scheme == "https" and port == 443)):
        netloc = f"{host}:{port}"
    path = re.sub(r"/{2,}", "/", parts.path or "/")
    if path != "/":
        path = path.rstrip("/")
    query = urlencode(
        sorted(
            (key, value)
            for key, value in parse_qsl(parts.query, keep_blank_values=True)
            if not key.casefold().startswith("utm_") and key.casefold() not in TRACKING_QUERY_KEYS
        ),
        doseq=True,
    )
    return urlunsplit((scheme, netloc, path, query, ""))


def duplicate_preflight(
    title: str,
    url: str,
    index: dict[str, dict[str, Any]],
    posted_source_rows: list[dict[str, Any]] | None = None,
    posted_source_status: dict[str, Any] | None = None,
    title_index_status: dict[str, Any] | None = None,
    mixed_queue: dict[str, dict[str, Any]] | None = None,
    mixed_queue_status: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Return continue/review/skip before a shared-reads candidate is written."""
    title_key = normalize_title_key(title)
    canonical_url = canonicalize_url(url)

    if posted_source_rows is not None:
        status = posted_source_status or {"healthy": False, "reason": "posted_source_index_status_missing"}
        if not status.get("healthy"):
            return {
                "decision": "review",
                "title_key": title_key,
                "canonical_url": canonical_url,
                "reason": str(status.get("reason") or "posted_source_index_unhealthy"),
            }
        from shared_reads_posted_source_index import find_source_match

        matched_row, match_reason = find_source_match(canonical_url, posted_source_rows)
        if matched_row:
            matched_title_keys = list(matched_row.get("title_keys", []))
            permalinks = list(matched_row.get("permalinks", []))
            evidence = {
                "title_key": title_key,
                "canonical_url": canonical_url,
                "matched_work_identity": matched_row.get("work_identity", ""),
                "matched_title_key": title_key if title_key in matched_title_keys else next(iter(matched_title_keys), ""),
                "canonical_path": next(iter(matched_row.get("candidate_paths", [])), ""),
                "permalink": permalinks[-1] if permalinks else "",
            }
            if not matched_row.get("provenance_complete"):
                return {
                    "decision": "review",
                    **evidence,
                    "reason": "posted_source_provenance_incomplete",
                }
            return {"decision": "skip", **evidence, "reason": match_reason}
        if title_key and title_key in set(status.get("unresolved_title_keys", [])):
            return {
                "decision": "review",
                "title_key": title_key,
                "canonical_url": canonical_url,
                "reason": "posted_source_extraction_unresolved",
            }

    # Backward-compatible fallback for callers that have not supplied the actual-post index.
    if posted_source_rows is None and canonical_url:
        for matched_title_key, matched_row in index.items():
            posted_urls = {
                canonicalize_url(str(item))
                for item in matched_row.get("posted_source_urls", [])
                if canonicalize_url(str(item))
            }
            if canonical_url in posted_urls:
                return {
                    "decision": "skip",
                    "title_key": title_key,
                    "matched_title_key": matched_title_key,
                    "canonical_url": canonical_url,
                    "canonical_path": matched_row.get("canonical_path", ""),
                    "permalink": matched_row.get("permalink", ""),
                    "reason": "posted_url_match",
                }

    if title_index_status is not None and not title_index_status.get("healthy"):
        return {
            "decision": "review",
            "title_key": title_key,
            "canonical_url": canonical_url,
            "reason": str(title_index_status.get("reason") or "title_index_unhealthy"),
        }

    row = index.get(title_key)
    if row and row.get("terminal_evidence"):
        return {
            "decision": "review",
            "title_key": title_key,
            "canonical_url": canonical_url,
            "canonical_path": row.get("canonical_path", ""),
            "permalink": row.get("permalink", ""),
            "reason": "closed_title_match",
        }

    if mixed_queue_status is not None and not mixed_queue_status.get("healthy"):
        return {
            "decision": "review",
            "title_key": title_key,
            "canonical_url": canonical_url,
            "reason": str(mixed_queue_status.get("reason") or "mixed_queue_unhealthy"),
        }

    mixed_row = (mixed_queue or {}).get(title_key)
    if mixed_row:
        return {
            "decision": "review",
            "title_key": title_key,
            "canonical_url": canonical_url,
            "representative_paths": list(mixed_row.get("representative_paths", [])),
            "reason": "mixed_title_match",
        }

    return {"decision": "continue", "title_key": title_key, "canonical_url": canonical_url}


def strip_scalar(value: str) -> str:
    value = value.strip()
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        return value[1:-1]
    return value


def read_frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8-sig")
    lines = text.splitlines()
    if not lines or lines[0] != "---":
        return {}
    closing_index = next((index for index, line in enumerate(lines[1:], start=1) if line == "---"), None)
    if closing_index is None:
        return {}
    frontmatter_lines = lines[1:closing_index]

    data: dict[str, str] = {}
    current_key: str | None = None
    folded: list[str] = []

    def flush_folded() -> None:
        nonlocal current_key, folded
        if current_key is not None:
            data[current_key] = " ".join(part.strip() for part in folded if part.strip())
        current_key = None
        folded = []

    for raw_line in frontmatter_lines:
        if current_key is not None:
            if raw_line.startswith((" ", "\t")) or not raw_line.strip():
                folded.append(raw_line)
                continue
            flush_folded()

        if ":" not in raw_line:
            continue
        key, value = raw_line.split(":", 1)
        key = key.strip()
        value = value.strip()
        if value in {">", ">-", "|", "|-"}:
            current_key = key
            folded = []
            continue
        data[key] = strip_scalar(value)

    flush_folded()
    return data


def candidate_title_key(path: Path) -> str:
    return normalize_title_key(read_frontmatter(path).get("title", ""))


def rel_path(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def load_title_index(path: Path = DEFAULT_TITLE_INDEX) -> dict[str, dict[str, Any]]:
    if not path.exists():
        return {}

    rows: dict[str, dict[str, Any]] = {}
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            title_key = str(row.get("title_key") or "")
            if not title_key:
                raise ValueError(f"{path}:{line_number}: missing title_key")
            rows[title_key] = row
    return rows


def _derived_index_status(path: Path, candidates_dir: Path, name: str) -> dict[str, Any]:
    if not path.exists():
        return {"healthy": False, "reason": f"{name}_missing"}
    candidate_mtimes = [
        item.stat().st_mtime_ns
        for item in candidates_dir.glob("*.md")
        if item.name.upper() != "README.MD"
    ]
    newest_candidate = max(candidate_mtimes, default=0)
    if path.stat().st_mtime_ns < newest_candidate:
        return {"healthy": False, "reason": f"{name}_stale_candidates"}
    return {"healthy": True, "reason": "fresh"}


def load_title_index_with_status(
    path: Path = DEFAULT_TITLE_INDEX,
    candidates_dir: Path = DEFAULT_CANDIDATES_DIR,
) -> tuple[dict[str, dict[str, Any]], dict[str, Any]]:
    status = _derived_index_status(path, candidates_dir, "title_index")
    if not status["healthy"]:
        return {}, status
    try:
        return load_title_index(path), status
    except (OSError, ValueError, json.JSONDecodeError):
        return {}, {"healthy": False, "reason": "title_index_invalid"}


def load_mixed_queue_with_status(
    path: Path = DEFAULT_MIXED_QUEUE,
    candidates_dir: Path = DEFAULT_CANDIDATES_DIR,
) -> tuple[dict[str, dict[str, Any]], dict[str, Any]]:
    status = _derived_index_status(path, candidates_dir, "mixed_queue")
    if not status["healthy"]:
        return {}, status
    rows: dict[str, dict[str, Any]] = {}
    try:
        with path.open("r", encoding="utf-8") as handle:
            for line_number, line in enumerate(handle, start=1):
                if not line.strip():
                    continue
                row = json.loads(line)
                group_key = str(row.get("group_key") or "")
                if not group_key:
                    raise ValueError(f"{path}:{line_number}: missing group_key")
                rows[group_key] = row
    except (OSError, ValueError, json.JSONDecodeError):
        return {}, {"healthy": False, "reason": "mixed_queue_invalid"}
    return rows, status


def title_index_terminal_match(meta: dict[str, str], index: dict[str, dict[str, Any]]) -> dict[str, Any] | None:
    title_key = normalize_title_key(meta.get("title", ""))
    if not title_key:
        return None
    row = index.get(title_key)
    if not row:
        return None
    best_status = str(row.get("best_status") or "").lower()
    if best_status not in TERMINAL_STATUSES:
        return None
    return row
