#!/usr/bin/env python3
"""Derived title-cluster helpers for memory atom recall display.

Cluster key definition:
  normalized_title + sorted tags + sorted kind + source identity.

This index is intentionally a sidecar. It does not rewrite atom titles or atom
content; it only gives recall enough context to disambiguate generic titles.
"""
from __future__ import annotations

import hashlib
import json
import re
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
ATOMS_DIR = MEMORY_DIR / "atoms"
TITLE_CLUSTER_INDEX_PATH = ATOMS_DIR / "title_cluster_index.jsonl"

GENERIC_TITLE_PREFIXES = (
    "[Codex external research]",
    "[Codex shared-reads",
    "[Codex shared_reads",
    "■ 概要",
    "■ 内容分析",
    "■ メリット・デメリット",
    "@",
    "笆",
    "讎りｦ",
    "繝｡繝ｪ繝・ヨ",
    "繝・Γ繝ｪ繝・ヨ",
)


def normalized_title(atom: dict[str, Any]) -> str:
    return re.sub(r"\s+", " ", str(atom.get("title") or "").strip())


def is_generic_title(title: str) -> bool:
    normalized = re.sub(r"\s+", " ", str(title or "").strip())
    return any(normalized.startswith(prefix) for prefix in GENERIC_TITLE_PREFIXES)


def source_identity(atom: dict[str, Any]) -> str:
    for key in ("source", "channel", "ingested_via"):
        value = str(atom.get(key) or "").strip()
        if value:
            return value
    atom_id = str(atom.get("id") or "")
    if atom_id.startswith("sr-"):
        return "shared-reads"
    if atom_id.startswith("gr-"):
        return "game-rights"
    if atom_id.startswith("local-"):
        return "local"
    return "unknown"


def cluster_key_parts(atom: dict[str, Any]) -> dict[str, Any]:
    return {
        "normalized_title": normalized_title(atom),
        "tags": sorted(str(tag) for tag in atom.get("tags", []) if str(tag).strip()),
        "kind": sorted(str(kind) for kind in atom.get("kind", []) if str(kind).strip()),
        "source": source_identity(atom),
    }


def cluster_key(atom: dict[str, Any]) -> str:
    return json.dumps(cluster_key_parts(atom), ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def cluster_id_for(key: str) -> str:
    return "title:" + hashlib.sha1(key.encode("utf-8")).hexdigest()[:16]


def parse_source_ts(atom: dict[str, Any]) -> float:
    try:
        return float(atom.get("source_ts") or 0)
    except (TypeError, ValueError):
        return 0.0


def atom_date(atom: dict[str, Any]) -> str:
    dt_raw = str(atom.get("datetime") or "").strip()
    if dt_raw:
        return dt_raw[:10]
    ts = parse_source_ts(atom)
    if ts <= 0:
        return "unknown-date"
    try:
        return datetime.fromtimestamp(ts).strftime("%Y-%m-%d")
    except (OSError, OverflowError, ValueError):
        return "unknown-date"


def source_kind(atom: dict[str, Any]) -> str:
    source_text = " ".join(
        [
            str(atom.get("source") or ""),
            str(atom.get("ingested_via") or ""),
            str(atom.get("channel") or ""),
            str(atom.get("id") or ""),
        ]
    ).lower()
    if "game-rights" in source_text or str(atom.get("id") or "").startswith("gr-"):
        return "game-rights"
    if "shared" in source_text or str(atom.get("id") or "").startswith("sr-"):
        return "shared-reads"
    if "local" in source_text or str(atom.get("id") or "").startswith("local-"):
        return "local"
    return "atom"


def first_domain(atom: dict[str, Any]) -> str:
    links = atom.get("links", [])
    if not isinstance(links, list):
        return ""
    for link in links:
        parsed = urlparse(str(link).strip("<>"))
        if parsed.netloc:
            return parsed.netloc.lower().removeprefix("www.")
    return ""


def keyword_hint(atom: dict[str, Any], max_len: int = 42) -> str:
    raw_text = " ".join(
        str(atom.get(key) or "").strip()
        for key in ("excerpt", "trigger")
        if str(atom.get(key) or "").strip()
    )
    heading = re.search(r"(?:^|\s)##\s+\d+\.\s+(.+?)(?:\s+-\s+|\s+■\s+|$)", raw_text)
    if heading:
        text = heading.group(1).strip()
    else:
        text = raw_text
        title = normalized_title(atom)
        if title:
            text = text.replace(title, " ")
        text = re.sub(r"\[Log_cdx\]|\bLog[_ ]cdx\b", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"https?://\S+", " ", text)
    text = re.sub(r"[<>\[\]`*_#|]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip(" -:：/、。")
    if not text:
        return ""

    bracket = re.search(r"【([^】]{4,80})】", text)
    if bracket:
        text = bracket.group(1).strip()

    if len(text) <= max_len:
        return text
    return text[: max_len - 1].rstrip() + "…"


def semantic_alias(atom: dict[str, Any], max_len: int = 96) -> tuple[str, str]:
    """Return a deterministic content-derived alias and its provenance."""
    raw_text = " ".join(
        str(atom.get(key) or "").strip()
        for key in ("excerpt", "trigger")
        if str(atom.get(key) or "").strip()
    )
    heading_patterns = (
        r"(?:^|\s)##\s+\d+\.\s+(.+?)(?:\s+-\s+|\s+■\s+|$)",
        r"(?:^|\s)#+\s+([^#\n|]{4,160})",
        r"【([^】]{4,160})】",
    )
    for pattern in heading_patterns:
        match = re.search(pattern, raw_text)
        if match:
            value = re.sub(r"\s+", " ", match.group(1)).strip(" -:：/、。")
            if value and not is_generic_title(value):
                return _truncate(value, max_len), "explicit_heading"

    title = normalized_title(atom)
    for prefix in GENERIC_TITLE_PREFIXES:
        if title.startswith(prefix):
            remainder = title[len(prefix) :].strip(" -:：/、。")
            if len(remainder) >= 4 and not is_generic_title(remainder):
                return _truncate(remainder, max_len), "title_remainder"

    hint = keyword_hint(atom, max_len=max_len)
    if hint and not is_generic_title(hint):
        return hint, "keyword_hint"

    fallback = " | ".join(
        value for value in (normalized_title(atom), str(atom.get("source_ts") or ""), atom_id(atom)) if value
    )
    return _truncate(fallback, max_len), "deterministic_fallback"


def _truncate(text: str, max_len: int) -> str:
    if len(text) <= max_len:
        return text
    return text[: max_len - 1].rstrip() + "…"


def atom_id(atom: dict[str, Any]) -> str:
    return str(atom.get("id") or "")


def display_disambiguator(atom: dict[str, Any]) -> str:
    parts = [atom_date(atom), source_kind(atom)]
    domain = first_domain(atom)
    if domain:
        parts.append(domain)
    hint = keyword_hint(atom)
    if hint:
        parts.append(hint)
    return " | ".join(parts)


def build_title_cluster_rows(atoms: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for atom in atoms:
        if normalized_title(atom):
            grouped[cluster_key(atom)].append(atom)

    generated_at = datetime.now().isoformat(timespec="seconds")
    rows: list[dict[str, Any]] = []
    for key, group in grouped.items():
        generic_group = any(is_generic_title(normalized_title(atom)) for atom in group)
        if len(group) < 2 and not generic_group:
            continue
        parts = json.loads(key)
        members = []
        for atom in sorted(group, key=lambda row: (parse_source_ts(row), atom_id(row))):
            alias, alias_source = semantic_alias(atom)
            members.append(
                {
                    "id": atom_id(atom),
                    "source_ts": atom.get("source_ts"),
                    "url_domain": first_domain(atom),
                    "keyword_hint": keyword_hint(atom),
                    "display_disambiguator": display_disambiguator(atom),
                    "semantic_alias": alias,
                    "alias_source": alias_source,
                }
            )
        rows.append(
            {
                "cluster_id": cluster_id_for(key),
                "key": parts,
                "count": len(group),
                "members": members,
                "generated_at": generated_at,
            }
        )

    rows.sort(key=lambda row: (-int(row["count"]), row["cluster_id"]))
    return rows


def load_title_cluster_map(path: Path = TITLE_CLUSTER_INDEX_PATH) -> dict[str, dict[str, Any]]:
    if not path.exists():
        return {}
    mapped: dict[str, dict[str, Any]] = {}
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            count = int(row.get("count") or 0)
            cluster_id = str(row.get("cluster_id") or "")
            for member in row.get("members", []):
                atom_id_value = str(member.get("id") or "")
                if not atom_id_value:
                    continue
                mapped[atom_id_value] = {
                    "cluster_id": cluster_id,
                    "cluster_size": count,
                    "display_disambiguator": str(member.get("display_disambiguator") or ""),
                    "semantic_alias": str(member.get("semantic_alias") or ""),
                    "alias_source": str(member.get("alias_source") or ""),
                }
    return mapped
