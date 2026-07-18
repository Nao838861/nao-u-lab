#!/usr/bin/env python3
"""Build and load the actual-post source index used by shared-reads preflight."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlsplit

from shared_reads_title_index import (
    DEFAULT_CANDIDATES_DIR,
    canonicalize_url,
    normalize_title_key,
    read_frontmatter,
    rel_path,
)


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_RAW_SLACK = ROOT / "memory" / "raw" / "slack_api" / "shared-reads.jsonl"
DEFAULT_POSTED_SOURCE_INDEX = ROOT / "memory" / "shared_reads_posted_source_index.jsonl"
SLACK_WORKSPACE_BASE = "https://nao-u-lab.slack.com"
URL_RE = re.compile(r"https?://[^\s<>|]+", re.IGNORECASE)
ANALYSIS_MARKERS = ("■ 概要", "■ 要約", "■ 内容分析")


def index_path(path: Path) -> str:
    try:
        return rel_path(path)
    except ValueError:
        return str(path.resolve())


def normalize_work_identity(url: str) -> str:
    """Collapse version/PDF variants only for domains with explicit rules."""
    canonical = canonicalize_url(url)
    if not canonical:
        return ""
    parts = urlsplit(canonical)
    host = (parts.hostname or "").casefold()
    path = unquote(parts.path).rstrip("/")
    if host in {"arxiv.org", "www.arxiv.org"}:
        match = re.match(r"/(?:abs|pdf|html)/(\d{4}\.\d{4,5})(?:v\d+)?(?:\.pdf)?$", path, re.IGNORECASE)
        if match:
            return f"arxiv:{match.group(1).casefold()}"
    if host in {"openreview.net", "www.openreview.net"} and path.casefold() == "/forum":
        forum_id = (parse_qs(parts.query).get("id") or [""])[0]
        if forum_id:
            return f"openreview:{forum_id.casefold()}"
    if host in {"doi.org", "dx.doi.org"} and path:
        return "doi:" + path.lstrip("/").casefold()
    if host in {"dl.acm.org", "www.dl.acm.org"}:
        match = re.match(r"/doi/(?:abs|pdf|full|fullhtml)?/?(.+)$", path, re.IGNORECASE)
        if match:
            return "doi:" + match.group(1).casefold()
    return "url:" + canonical


def slack_permalink(channel_id: str, ts: str) -> str:
    compact_ts = re.sub(r"\D", "", ts)
    if not channel_id or not compact_ts:
        return ""
    return f"{SLACK_WORKSPACE_BASE}/archives/{channel_id}/p{compact_ts}"


def extract_urls(text: str) -> list[str]:
    return [match.rstrip(".,;:)]}") for match in URL_RE.findall(text)]


def source_section(text: str) -> str:
    url_header = re.search(r"■\s*URL\s*", text)
    if url_header:
        return text[url_header.end() :]
    source_header = re.search(r"出典\s*:\s*", text)
    if source_header:
        tail = text[source_header.end() :]
        next_section = re.search(r"(?m)^■\s+", tail)
        return tail[: next_section.start()] if next_section else tail
    return ""


def extract_source_urls(text: str) -> list[str]:
    urls = extract_urls(source_section(text))
    result: list[str] = []
    for url in urls:
        host = (urlsplit(url).hostname or "").casefold()
        if host.endswith("slack.com"):
            continue
        canonical = canonicalize_url(url)
        if canonical and canonical not in result:
            result.append(canonical)
    return result


def title_evidence(text: str) -> list[str]:
    titles: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        explicit = re.match(r"[-*]\s*title\s*:\s*(.+)$", stripped, re.IGNORECASE)
        if explicit:
            titles.append(explicit.group(1).strip())
        if not titles:
            first = re.sub(r"^(?:\[Log_cdx\]\s*)?(?:\[shared-reads\]\s*)?", "", stripped)
            if first:
                sentence = re.match(r"(.{1,220}?[。.!?])(?:\s|$)", first)
                titles.append((sentence.group(1) if sentence else first[:220]).strip())
        if explicit or titles:
            # Keep scanning for an explicit title, but the first non-empty line is enough otherwise.
            continue
    deduped: list[str] = []
    for title in titles:
        if title and title not in deduped:
            deduped.append(title)
    return deduped


def candidate_snapshot_ns(candidates_dir: Path) -> int:
    mtimes = []
    for path in candidates_dir.glob("*.md"):
        if path.name.casefold() == "readme.md":
            continue
        meta = read_frontmatter(path)
        status = (meta.get("status") or meta.get("candidate_status") or "").casefold()
        if status == "posted":
            mtimes.append(path.stat().st_mtime_ns)
    return max(mtimes, default=0)


def build_index(
    raw_path: Path,
    candidates_dir: Path,
    generated_at: str,
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    grouped: dict[str, dict[str, Any]] = {}
    unresolved: list[dict[str, Any]] = []

    def ensure_row(url: str) -> dict[str, Any]:
        canonical = canonicalize_url(url)
        identity = normalize_work_identity(canonical)
        key = identity or "url:" + canonical
        row = grouped.setdefault(
            key,
            {
                "record_type": "source",
                "canonical_url": canonical,
                "work_identity": identity,
                "source_urls": [],
                "slack_ts": [],
                "permalinks": [],
                "title_evidence": [],
                "title_keys": [],
                "candidate_paths": [],
                "provenance": [],
            },
        )
        if canonical and canonical not in row["source_urls"]:
            row["source_urls"].append(canonical)
        return row

    if raw_path.exists():
        with raw_path.open("r", encoding="utf-8-sig") as handle:
            for line_number, line in enumerate(handle, start=1):
                if not line.strip():
                    continue
                raw = json.loads(line)
                text = str(raw.get("text") or "")
                if raw.get("channel") != "shared-reads" or "[Log_cdx]" not in text:
                    continue
                if not any(marker in text for marker in ANALYSIS_MARKERS):
                    continue
                titles = title_evidence(text)
                urls = extract_source_urls(text)
                ts = str(raw.get("ts") or "")
                channel_id = str(raw.get("_slack_channel_id") or "")
                permalink = slack_permalink(channel_id, ts)
                if not urls:
                    unresolved.append(
                        {
                            "ts": ts,
                            "title_keys": [normalize_title_key(title) for title in titles if title],
                            "reason": "source_url_not_extracted",
                        }
                    )
                    continue
                for url in urls:
                    row = ensure_row(url)
                    for value, field in ((ts, "slack_ts"), (permalink, "permalinks")):
                        if value and value not in row[field]:
                            row[field].append(value)
                    for title in titles:
                        key = normalize_title_key(title)
                        if title and title not in row["title_evidence"]:
                            row["title_evidence"].append(title)
                        if key and key not in row["title_keys"]:
                            row["title_keys"].append(key)
                    row["provenance"].append(
                        {"kind": "slack_raw", "path": index_path(raw_path), "line": line_number, "ts": ts}
                    )

    for path in sorted(candidates_dir.glob("*.md")):
        if path.name.casefold() == "readme.md":
            continue
        meta = read_frontmatter(path)
        status = (meta.get("status") or meta.get("candidate_status") or "").casefold()
        url = meta.get("url", "")
        if status != "posted" or not url:
            continue
        row = ensure_row(url)
        relative = index_path(path)
        if relative not in row["candidate_paths"]:
            row["candidate_paths"].append(relative)
        title = meta.get("title", "")
        title_key = normalize_title_key(title)
        if title and title not in row["title_evidence"]:
            row["title_evidence"].append(title)
        if title_key and title_key not in row["title_keys"]:
            row["title_keys"].append(title_key)
        evidence_urls = extract_urls(meta.get("evidence", ""))
        candidate_permalink = next((item for item in evidence_urls if "slack.com/archives/" in item), "")
        if candidate_permalink and candidate_permalink not in row["permalinks"]:
            row["permalinks"].append(candidate_permalink)
        row["provenance"].append(
            {"kind": "posted_candidate", "path": relative, "evidence_permalink": candidate_permalink}
        )

    rows: list[dict[str, Any]] = []
    for row in grouped.values():
        for field in (
            "source_urls",
            "slack_ts",
            "permalinks",
            "title_evidence",
            "title_keys",
            "candidate_paths",
        ):
            row[field] = sorted(set(row[field]))
        raw_verified = any(item.get("kind") == "slack_raw" for item in row["provenance"])
        candidate_verified = any(
            item.get("kind") == "posted_candidate" and item.get("evidence_permalink")
            for item in row["provenance"]
        )
        row["posted_verified"] = bool(raw_verified or candidate_verified)
        row["provenance_complete"] = bool(
            row["posted_verified"] and row["permalinks"] and row["title_evidence"] and row["source_urls"]
        )
        row["generated_at"] = generated_at
        rows.append(row)
    rows.sort(key=lambda row: (str(row.get("work_identity") or ""), str(row.get("canonical_url") or "")))
    metadata = {
        "record_type": "metadata",
        "schema_version": 1,
        "generated_at": generated_at,
        "raw_path": index_path(raw_path),
        "raw_mtime_ns": raw_path.stat().st_mtime_ns if raw_path.exists() else 0,
        "candidates_dir": index_path(candidates_dir),
        "candidates_snapshot_ns": candidate_snapshot_ns(candidates_dir),
        "source_rows": len(rows),
        "unresolved_posts": unresolved,
    }
    return metadata, rows


def render_index(metadata: dict[str, Any], rows: list[dict[str, Any]]) -> str:
    return "".join(
        json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
        for row in [metadata, *rows]
    )


def load_index(
    path: Path = DEFAULT_POSTED_SOURCE_INDEX,
    raw_path: Path = DEFAULT_RAW_SLACK,
    candidates_dir: Path = DEFAULT_CANDIDATES_DIR,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    if not path.exists():
        return [], {"healthy": False, "reason": "posted_source_index_missing", "unresolved_title_keys": []}
    with path.open("r", encoding="utf-8-sig") as handle:
        all_rows = [json.loads(line) for line in handle if line.strip()]
    if not all_rows or all_rows[0].get("record_type") != "metadata":
        return [], {"healthy": False, "reason": "posted_source_index_metadata_missing", "unresolved_title_keys": []}
    metadata = all_rows[0]
    unresolved_title_keys = sorted(
        {
            key
            for post in metadata.get("unresolved_posts", [])
            for key in post.get("title_keys", [])
            if key
        }
    )
    status = {"healthy": True, "reason": "fresh", "unresolved_title_keys": unresolved_title_keys}
    current_raw_mtime = raw_path.stat().st_mtime_ns if raw_path.exists() else 0
    if int(metadata.get("raw_mtime_ns") or 0) != current_raw_mtime:
        status = {**status, "healthy": False, "reason": "posted_source_index_stale_raw"}
    elif int(metadata.get("candidates_snapshot_ns") or 0) != candidate_snapshot_ns(candidates_dir):
        status = {**status, "healthy": False, "reason": "posted_source_index_stale_candidates"}
    return [row for row in all_rows[1:] if row.get("record_type") == "source"], status


def find_source_match(url: str, rows: list[dict[str, Any]]) -> tuple[dict[str, Any] | None, str]:
    canonical = canonicalize_url(url)
    work_identity = normalize_work_identity(canonical)
    for row in rows:
        source_urls = {canonicalize_url(str(item)) for item in row.get("source_urls", []) if item}
        if canonical and canonical in source_urls:
            return row, "posted_source_url_match"
    if work_identity:
        for row in rows:
            if row.get("work_identity") == work_identity:
                return row, "posted_source_work_match"
    return None, ""
