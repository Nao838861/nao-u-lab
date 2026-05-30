#!/usr/bin/env python3
"""Shared atom file format helpers (per-file .md + index.jsonl).

Used by:
  - migrate_atoms_to_per_file.py (initial migration)
  - memory_ingest.py (dual-write on each ingest)
  - memory_recall.py (dual-read; index.jsonl + .md frontmatter)

Format spec: see GPT/memory/atoms/README.md and
GPT/memory/directive_atoms_per_file_migration_20260513.md.
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

import memory_lifecycle


FRONTMATTER_KEYS = [
    "id",
    "title",
    "source",
    "source_ts",
    "author",
    "channel",
    "user",
    "tags",
    "kind",
    "score",
    "quality",
    "memory_layer",
    "quality_reason",
    "status",
    "group_id",
    "canonical_id",
    "supersedes",
    "superseded_by",
    "duplicate_reason",
    "ingested_via",
    "ingested_at",
    "datetime",
]


def shard_for(atom: dict[str, Any]) -> str:
    ts_raw = atom.get("source_ts")
    try:
        ts = float(ts_raw) if ts_raw else 0.0
    except (TypeError, ValueError):
        ts = 0.0
    if ts <= 0:
        return "unknown"
    try:
        return datetime.fromtimestamp(ts).strftime("%Y-%m")
    except (OSError, OverflowError, ValueError):
        return "unknown"


def yaml_inline_scalar(v: Any) -> str:
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return json.dumps(v)
    if isinstance(v, str):
        return yaml_string(v)
    return json.dumps(v, ensure_ascii=False)


def yaml_string(s: str) -> str:
    if s == "":
        return '""'
    risky_chars = set("\n\r\t:#&*?{}[],\"'\\|<>=!%@`")
    if any(c in risky_chars for c in s) or s[0] in "-?:%@`" or s.lower() in {"true", "false", "null", "yes", "no", "~", "on", "off"}:
        escaped = s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t")
        return f'"{escaped}"'
    try:
        float(s)
        return f'"{s}"'
    except ValueError:
        pass
    return s


def yaml_list(items: list[Any]) -> str:
    if not items:
        return "[]"
    parts = [yaml_inline_scalar(x) for x in items]
    return "[" + ", ".join(parts) + "]"


def yaml_dump_frontmatter(d: dict[str, Any]) -> str:
    lines = []
    for k, v in d.items():
        if v is None:
            lines.append(f"{k}: null")
        elif isinstance(v, bool):
            lines.append(f"{k}: {'true' if v else 'false'}")
        elif isinstance(v, (int, float)):
            lines.append(f"{k}: {v}")
        elif isinstance(v, list):
            lines.append(f"{k}: {yaml_list(v)}")
        elif isinstance(v, str):
            lines.append(f"{k}: {yaml_string(v)}")
        else:
            lines.append(f"{k}: {json.dumps(v, ensure_ascii=False)}")
    return "\n".join(lines)


def build_atom_md(atom: dict[str, Any]) -> str:
    fm: dict[str, Any] = {}
    for key in FRONTMATTER_KEYS:
        if key in atom:
            fm[key] = atom[key]
    if "status" not in fm:
        fm["status"] = "active"
    fm_text = yaml_dump_frontmatter(fm)

    title = str(atom.get("title", atom.get("id", "")))
    body_parts: list[str] = [f"# {title}"]

    trigger = str(atom.get("trigger", "")).strip()
    if trigger:
        body_parts.append("## Use when\n\n" + trigger)

    excerpt = str(atom.get("excerpt", "")).strip()
    if excerpt:
        body_parts.append("## Excerpt\n\n" + excerpt)

    links = atom.get("links")
    if isinstance(links, list) and links:
        link_lines = [f"- {str(link)}" for link in links]
        body_parts.append("## Links\n\n" + "\n".join(link_lines))

    return f"---\n{fm_text}\n---\n\n" + "\n\n".join(body_parts) + "\n"


def build_index_entry(atom: dict[str, Any], rel_path: str) -> dict[str, Any]:
    entry = {
        "id": atom.get("id"),
        "path": rel_path,
        "title": atom.get("title"),
        "tags": atom.get("tags", []),
        "source_ts": atom.get("source_ts"),
        "status": atom.get("status", "active"),
        "canonical_id": atom.get("canonical_id"),
        "normalized_content_hash": atom.get("normalized_content_hash") or memory_lifecycle.normalized_content_hash(atom),
        "score": atom.get("score", 0),
    }
    if atom.get("quality"):
        entry["quality"] = atom.get("quality")
    if atom.get("memory_layer"):
        entry["memory_layer"] = atom.get("memory_layer")
    return entry


def parse_yaml_simple(text: str) -> dict[str, Any]:
    """Parse our atom frontmatter (limited YAML subset).

    Supports: scalars (str/int/float/null/bool), inline lists [a, b, c].
    Does NOT support: nested objects, multi-line strings.
    Strings that were emitted by yaml_string() with quotes are unquoted/unescaped.
    """
    result: dict[str, Any] = {}
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if ":" not in stripped:
            continue
        key, _, val = stripped.partition(":")
        key = key.strip()
        val = val.strip()
        if val == "" or val == "null" or val == "~":
            result[key] = None
        elif val.lower() == "true":
            result[key] = True
        elif val.lower() == "false":
            result[key] = False
        elif val.startswith("[") and val.endswith("]"):
            inner = val[1:-1].strip()
            if not inner:
                result[key] = []
            else:
                items = _split_inline_list(inner)
                result[key] = [_parse_inline_scalar(x) for x in items]
        elif val.startswith('"') and val.endswith('"') and len(val) >= 2:
            result[key] = _unescape_yaml_string(val[1:-1])
        else:
            try:
                if "." in val or "e" in val.lower():
                    result[key] = float(val)
                else:
                    result[key] = int(val)
            except ValueError:
                result[key] = val
    return result


def _split_inline_list(inner: str) -> list[str]:
    """Split items separated by commas at top level (respecting quotes)."""
    items: list[str] = []
    buf = []
    in_quote = False
    quote_char = ""
    for ch in inner:
        if in_quote:
            buf.append(ch)
            if ch == quote_char and (len(buf) < 2 or buf[-2] != "\\"):
                in_quote = False
            continue
        if ch in ('"', "'"):
            in_quote = True
            quote_char = ch
            buf.append(ch)
        elif ch == ",":
            items.append("".join(buf).strip())
            buf = []
        else:
            buf.append(ch)
    if buf:
        last = "".join(buf).strip()
        if last:
            items.append(last)
    return items


def _parse_inline_scalar(s: str) -> Any:
    s = s.strip()
    if s == "" or s == "null":
        return None
    if s.lower() == "true":
        return True
    if s.lower() == "false":
        return False
    if s.startswith('"') and s.endswith('"') and len(s) >= 2:
        return _unescape_yaml_string(s[1:-1])
    try:
        if "." in s or "e" in s.lower():
            return float(s)
        return int(s)
    except ValueError:
        return s


def _unescape_yaml_string(s: str) -> str:
    return (
        s.replace("\\n", "\n")
        .replace("\\r", "\r")
        .replace("\\t", "\t")
        .replace('\\"', '"')
        .replace("\\\\", "\\")
    )


def parse_atom_md(path: Path) -> dict[str, Any]:
    """Read an atom .md file and return the merged frontmatter + body sections.

    Returns dict compatible with atoms.jsonl row shape (with extras `trigger`,
    `excerpt`, `links` reconstructed from body sections).
    """
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    # Split frontmatter
    nl = text.find("\n")
    if nl == -1:
        return {}
    # Strip leading marker line
    rest = text[nl + 1:]
    end = rest.find("\n---")
    if end == -1:
        return {}
    fm_text = rest[:end]
    body = rest[end + 4:].lstrip("\n")

    atom = parse_yaml_simple(fm_text)

    # Body sections
    sections = _split_markdown_sections(body)
    use_when = sections.get("Use when", "").strip()
    excerpt = sections.get("Excerpt", "").strip()
    links_block = sections.get("Links", "").strip()
    if use_when:
        atom["trigger"] = use_when
    if excerpt:
        atom["excerpt"] = excerpt
    if links_block:
        links = []
        for line in links_block.splitlines():
            line = line.strip()
            if line.startswith("- "):
                links.append(line[2:].strip())
        if links:
            atom["links"] = links
    return atom


_KNOWN_SECTIONS = {"Use when", "Excerpt", "Links", "Notes", "Related"}


def _split_markdown_sections(body: str) -> dict[str, str]:
    """Split atom body into named sections.

    KNOWN section names だけを区切りとして扱う。それ以外の `## ...` 行は
    現在の section の本文として保持する (Slack 抜粋内の `## ` を section 切れ目と
    誤認しないため)。
    """
    sections: dict[str, str] = {}
    current_name: str | None = None
    current_lines: list[str] = []
    for line in body.splitlines():
        if line.startswith("## "):
            candidate = line[3:].strip()
            if candidate in _KNOWN_SECTIONS:
                if current_name is not None:
                    sections[current_name] = "\n".join(current_lines).rstrip()
                current_name = candidate
                current_lines = []
                continue
        if line.startswith("# "):
            if current_name is not None:
                sections[current_name] = "\n".join(current_lines).rstrip()
                current_name = None
                current_lines = []
            continue
        if current_name is not None:
            current_lines.append(line)
    if current_name is not None:
        sections[current_name] = "\n".join(current_lines).rstrip()
    return sections


def load_atoms_from_per_file(atoms_dir: Path) -> list[dict[str, Any]]:
    """Read all atoms from per-file .md format (using index.jsonl as guide).

    Returns full atom dicts (frontmatter + reconstructed body fields).
    """
    index_path = atoms_dir / "index.jsonl"
    if not index_path.exists():
        return []
    atoms: list[dict[str, Any]] = []
    with index_path.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                stub = json.loads(line)
            except json.JSONDecodeError:
                continue
            rel = stub.get("path", "")
            md_path = atoms_dir / rel
            if md_path.exists():
                atom = parse_atom_md(md_path)
                if atom:
                    atoms.append(atom)
                    continue
            # Fall back to stub data
            atoms.append(stub)
    return atoms


def sync_per_file_atoms(atoms: list[dict[str, Any]], atoms_dir: Path) -> tuple[int, int]:
    """Write per-atom .md and refresh index.jsonl. Idempotent.

    Returns (newly_written_or_changed, total_md_files_written).
    """
    atoms_dir.mkdir(parents=True, exist_ok=True)
    index_path = atoms_dir / "index.jsonl"
    new_writes = 0
    index_entries: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    for atom in atoms:
        aid = atom.get("id")
        if not aid or aid in seen_ids:
            continue
        seen_ids.add(aid)
        shard = shard_for(atom)
        shard_dir = atoms_dir / shard
        target = shard_dir / f"{aid}.md"
        content = build_atom_md(atom)
        write_needed = True
        if target.exists():
            try:
                if target.read_text(encoding="utf-8") == content:
                    write_needed = False
            except OSError:
                pass
        if write_needed:
            shard_dir.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8", newline="\n")
            new_writes += 1
        index_entries.append(build_index_entry(atom, f"{shard}/{aid}.md"))
    with index_path.open("w", encoding="utf-8", newline="\n") as f:
        for entry in index_entries:
            f.write(json.dumps(entry, ensure_ascii=False, sort_keys=True) + "\n")
    return new_writes, len(index_entries)
