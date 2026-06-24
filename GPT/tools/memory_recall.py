#!/usr/bin/env python3
"""
Search Codex memory atoms.

The scorer is deliberately simple: exact token overlap, tag matches, recency,
and importance score. It avoids network or model dependencies.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import memory_lifecycle
from atom_title_clusters import load_title_cluster_map
from atoms_fileformat import load_atoms_from_per_file, load_atoms_with_view


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
ATOMS_PATH = MEMORY_DIR / "atoms.jsonl"
ATOMS_DIR = MEMORY_DIR / "atoms"
RECALL_LOG_PATH = MEMORY_DIR / "recall_log.jsonl"
ATOM_STATS_PATH = MEMORY_DIR / "atom_stats.json"
EXCLUDED_MEMORY_LAYERS = {"operational_ack", "operational_log", "lifecycle_repost"}
EXCLUDED_QUALITIES = {"quarantine"}

if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def load_atoms() -> list[dict[str, Any]]:
    """Load atoms.

    Phase C (atoms.jsonl 存在): atoms.jsonl を canonical source として読む。
        per-file .md は mirror として並走しているが、atoms.jsonl の方が高速かつ確実。
    Phase D (atoms.jsonl 不在): per-file .md (memory/atoms/index.jsonl) から読む。
    """
    if ATOMS_PATH.exists():
        atoms = []
        with ATOMS_PATH.open("r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    atoms.append(json.loads(line))
        return atoms
    return load_atoms_from_per_file(ATOMS_DIR)


def load_atoms_for_recall() -> list[dict[str, Any]]:
    return load_atoms_with_view(ATOMS_PATH, ATOMS_DIR, view="canonical")


def tokenize(text: str) -> list[str]:
    text = text.lower()
    tokens = re.findall(r"[a-z0-9_./-]{3,}", text)
    tokens += [t for t in re.findall(r"[a-z0-9_./-]{2}", text) if t in {"ai", "px", "ui"}]
    tokens += re.findall(r"[\u30a0-\u30ff]{3,}", text)
    tokens += re.findall(r"[\u4e00-\u9fff]{2,6}", text)
    tokens += re.findall(r"[\u3040-\u30ff\u3400-\u9fff]{2,}", text)
    stop = {
        "する", "ある", "いる", "ない", "できる", "という", "ため", "今回",
        "the", "and", "for", "with", "from", "that", "this", "when",
    }
    return [t for t in tokens if t not in stop]


def atom_text(atom: dict[str, Any]) -> str:
    fields = [
        atom.get("title", ""),
        atom.get("trigger", ""),
        atom.get("excerpt", ""),
        " ".join(atom.get("tags", [])),
        " ".join(atom.get("kind", [])),
        " ".join(atom.get("links", [])),
    ]
    return "\n".join(fields)


def recency_bonus(atom: dict[str, Any]) -> float:
    dt_raw = atom.get("datetime")
    if not dt_raw:
        return 0.0
    try:
        dt = datetime.fromisoformat(dt_raw)
    except ValueError:
        return 0.0
    age_days = max((datetime.now() - dt).days, 0)
    return max(0.0, 2.0 - math.log1p(age_days) / 2.0)


def score_atom(atom: dict[str, Any], query_terms: list[str]) -> float:
    haystack = atom_text(atom).lower()
    tags = {str(t).lower() for t in atom.get("tags", [])}
    score = 0.0
    for term in query_terms:
        if term in tags:
            score += 6.0
        occurrences = haystack.count(term)
        if occurrences:
            score += 1.0 + min(occurrences, 5)
    score += min(float(atom.get("score", 0)), 12.0) / 4.0
    score += recency_bonus(atom)
    return score


def is_default_excluded(atom: dict[str, Any]) -> bool:
    return (
        str(atom.get("memory_layer", "")) in EXCLUDED_MEMORY_LAYERS
        or str(atom.get("quality", "")) in EXCLUDED_QUALITIES
    )


def exact_reference_matches(atoms: list[dict[str, Any]], query: str) -> list[tuple[float, dict[str, Any]]]:
    ref = query.strip()
    if not ref:
        return []
    matches = [
        atom
        for atom in atoms
        if ref in {str(atom.get("id", "")), str(atom.get("source_ts", ""))}
    ]
    return [(999.0, atom) for atom in matches]


def looks_like_reference_query(query: str) -> bool:
    ref = query.strip()
    return bool(re.fullmatch(r"(?:sr|gr|local)-[A-Za-z0-9_.-]+", ref) or re.fullmatch(r"\d{10}(?:\.\d+)?", ref))


def fold_scored(
    scored: list[tuple[float, dict[str, Any]]],
    atoms_by_id: dict[str, dict[str, Any]],
) -> list[tuple[float, dict[str, Any]]]:
    return memory_lifecycle.fold_scored(scored, atoms_by_id)


def normalized_title(atom: dict[str, Any]) -> str:
    return re.sub(r"\s+", " ", str(atom.get("title") or "").strip())


def title_counts(atoms: list[dict[str, Any]]) -> Counter[str]:
    return Counter(title for title in (normalized_title(atom) for atom in atoms) if title)


GENERIC_TITLE_PREFIXES = (
    "[Codex external research]",
    "[Codex shared-reads",
    "■ 概要",
    "笆",
)


def is_generic_title(title: str) -> bool:
    return any(title.startswith(prefix) for prefix in GENERIC_TITLE_PREFIXES)


def first_url_hint(atom: dict[str, Any]) -> str:
    links = atom.get("links", [])
    if not isinstance(links, list):
        return ""
    for link in links:
        parsed = urlparse(str(link).strip("<>"))
        if not parsed.netloc:
            continue
        host = parsed.netloc.lower().removeprefix("www.")
        path_parts = [part for part in parsed.path.split("/") if part]
        if path_parts:
            return f"{host}/{path_parts[0][:32]}"
        return host
    return ""


def content_head_hint(atom: dict[str, Any], title: str, max_len: int = 48) -> str:
    text = " ".join(
        str(atom.get(key) or "").strip()
        for key in ("excerpt", "trigger")
        if str(atom.get(key) or "").strip()
    )
    if title:
        text = text.replace(title, " ")
    text = re.sub(r"^Use when\s+[^。.\n]+[。.]\s*", " ", text)
    text = re.sub(r"\((?:prescription|observation|synthesis)[^)]+\)", " ", text)
    text = re.sub(r"https?://\S+", " ", text)
    text = re.sub(r"[<>\[\]`*_#|]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip(" -:。、「」・")
    if not text:
        return ""
    if len(text) <= max_len:
        return text
    return text[: max_len - 1].rstrip() + "..."


def display_secondary_key(atom: dict[str, Any]) -> str:
    """Build a deterministic display-only key from existing atom fields."""
    title = normalized_title(atom)
    parts = []
    url_hint = first_url_hint(atom)
    if url_hint:
        parts.append(url_hint)
    source_ts = str(atom.get("source_ts") or "").strip()
    if source_ts:
        parts.append(f"ts:{source_ts}")
    hint = content_head_hint(atom, title)
    if hint:
        parts.append(hint)
    return " | ".join(parts)


def fallback_display_label(atom: dict[str, Any], counts: Counter[str]) -> str:
    title = normalized_title(atom)
    if not title or (counts.get(title, 0) <= 1 and not is_generic_title(title)):
        return title
    secondary_key = display_secondary_key(atom)
    if not secondary_key:
        return f"{title} | duplicate-title"
    return f"{title} | {secondary_key}"


def should_add_secondary_key(atom: dict[str, Any], counts: Counter[str]) -> bool:
    title = normalized_title(atom)
    return bool(title and (counts.get(title, 0) > 1 or is_generic_title(title)))


def annotate_display_labels(
    results: list[tuple[float, dict[str, Any]]],
    title_cluster_map: dict[str, dict[str, Any]],
    fallback_counts: Counter[str],
) -> list[tuple[float, dict[str, Any]]]:
    annotated = []
    for score, atom in results:
        row = dict(atom)
        cluster = title_cluster_map.get(str(row.get("id") or ""))
        label = normalized_title(row)
        if cluster and int(cluster.get("cluster_size") or 0) >= 2:
            disambiguator = str(cluster.get("display_disambiguator") or "").strip()
            if disambiguator:
                row["display_disambiguator"] = disambiguator
                row["title_cluster_id"] = cluster.get("cluster_id")
                row["title_cluster_size"] = cluster.get("cluster_size")
                label = f"{label} | {disambiguator}"
        elif not title_cluster_map:
            label = fallback_display_label(row, fallback_counts)
        if should_add_secondary_key(row, fallback_counts):
            secondary_key = display_secondary_key(row)
            if secondary_key:
                row["display_secondary_key"] = secondary_key
                if secondary_key not in label:
                    label = f"{label} | {secondary_key}"
        if label and label != normalized_title(row):
            row["display_label"] = label
        annotated.append((score, row))
    return annotated


def search(query: str, limit: int, include_operational: bool = False) -> list[tuple[float, dict[str, Any]]]:
    raw_atoms = load_atoms()
    title_cluster_map = load_title_cluster_map()
    exact_matches = exact_reference_matches(raw_atoms, query)
    if exact_matches:
        duplicate_title_counts = title_counts(raw_atoms)
        return annotate_display_labels(exact_matches[:limit], title_cluster_map, duplicate_title_counts)
    if looks_like_reference_query(query):
        return []

    atoms = load_atoms_for_recall()
    if not include_operational:
        atoms = [atom for atom in atoms if not is_default_excluded(atom)]
    duplicate_title_counts = title_counts(atoms)

    terms = tokenize(query)
    if not terms:
        return []
    scored = [(score_atom(atom, terms), atom) for atom in atoms]
    scored = [(score, atom) for score, atom in scored if score > 0]
    results = fold_scored(scored, memory_lifecycle.index_by_id(atoms))[:limit]
    return annotate_display_labels(results, title_cluster_map, duplicate_title_counts)


def result_title(atom: dict[str, Any]) -> str:
    return str(atom.get("display_label") or atom.get("title") or "")


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def record_recall(query: str, results: list[tuple[float, dict[str, Any]]]) -> None:
    """Record recall usage so the memory system can improve from actual use."""
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    now = datetime.now().isoformat(timespec="seconds")
    result_rows = [
        {
            "id": atom.get("id"),
            "score": round(score, 3),
            "title": atom.get("title"),
            "display_label": atom.get("display_label"),
            "display_secondary_key": atom.get("display_secondary_key"),
            "display_disambiguator": atom.get("display_disambiguator"),
            "title_cluster_id": atom.get("title_cluster_id"),
            "title_cluster_size": atom.get("title_cluster_size"),
            "tags": atom.get("tags", [])[:8],
            "folded_count": atom.get("folded_count", 0),
            "folded_ids": atom.get("folded_ids", [])[:20],
            "duplicate_count": atom.get("duplicate_count", atom.get("folded_count", 0)),
            "duplicate_ids": atom.get("duplicate_ids", atom.get("folded_ids", []))[:20],
            "grouped_count": atom.get("grouped_count", 1),
            "grouped_ids": atom.get("grouped_ids", [])[:20],
            "overlay_reason": atom.get("overlay_reason"),
            "representative_reason": atom.get("representative_reason"),
            "normalized_content_hash": atom.get("normalized_content_hash"),
        }
        for score, atom in results
    ]
    with RECALL_LOG_PATH.open("a", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps({"time": now, "query": query, "results": result_rows}, ensure_ascii=False) + "\n")

    stats = load_json(ATOM_STATS_PATH, {"atoms": {}, "queries": 0, "last_query": None})
    stats["queries"] = int(stats.get("queries", 0)) + 1
    stats["last_query"] = {"time": now, "query": query}
    atom_stats = stats.setdefault("atoms", {})
    for rank, (_score, atom) in enumerate(results, 1):
        atom_id = atom.get("id")
        if not atom_id:
            continue
        entry = atom_stats.setdefault(atom_id, {"recall_count": 0, "top1_count": 0, "last_recalled": None})
        entry["recall_count"] = int(entry.get("recall_count", 0)) + 1
        if rank == 1:
            entry["top1_count"] = int(entry.get("top1_count", 0)) + 1
        entry["last_recalled"] = now
        entry["title"] = atom.get("title")
        if atom.get("display_label"):
            entry["display_label"] = atom.get("display_label")
        if atom.get("display_secondary_key"):
            entry["display_secondary_key"] = atom.get("display_secondary_key")
        if atom.get("display_disambiguator"):
            entry["display_disambiguator"] = atom.get("display_disambiguator")
    write_json(ATOM_STATS_PATH, stats)


def print_result(score: float, atom: dict[str, Any], compact: bool) -> None:
    tags = ", ".join(atom.get("tags", [])[:8])
    links = atom.get("links", [])
    folded_count = int(atom.get("folded_count") or 0)
    folded_ids = [str(aid) for aid in atom.get("folded_ids", []) if aid]
    duplicate_count = int(atom.get("duplicate_count") or folded_count)
    duplicate_ids = [str(aid) for aid in atom.get("duplicate_ids", folded_ids) if aid]
    grouped_count = int(atom.get("grouped_count") or (folded_count + 1 if folded_count else 1))
    grouped_ids = [str(aid) for aid in atom.get("grouped_ids", folded_ids) if aid]
    overlay_reason = str(atom.get("overlay_reason") or "")
    representative_reason = str(atom.get("representative_reason") or "")
    if compact:
        suffix = ""
        if folded_count:
            suffix = (
                f" grouped_count={grouped_count}"
                f" grouped_ids=[{', '.join(grouped_ids[:5])}]"
            )
        label = result_title(atom)
        label_prefix = f"{label} :: " if atom.get("display_label") else ""
        print(f"- `{atom['id']}` {label_prefix}{atom['trigger']} tags=[{tags}]{suffix}")
        return
    print(f"[{atom['id']}] score={score:.1f} {atom.get('datetime', '')} {atom.get('author', '')}")
    print(f"title: {result_title(atom)}")
    if atom.get("display_label"):
        print(f"source_title: {atom.get('title', '')}")
    if atom.get("display_secondary_key"):
        print(f"display_secondary_key: {atom.get('display_secondary_key')}")
    print(f"trigger: {atom.get('trigger', '')}")
    print(f"tags: {tags}")
    if links:
        print(f"links: {', '.join(links[:4])}")
    if folded_count:
        print(f"folded_count: {folded_count}")
        print(f"folded_ids: {', '.join(folded_ids)}")
        print(f"duplicate_count: {duplicate_count}")
        print(f"duplicate_ids: {', '.join(duplicate_ids)}")
        print(f"grouped_count: {grouped_count}")
        print(f"grouped_ids: {', '.join(grouped_ids)}")
        if representative_reason:
            print(f"representative_reason: {representative_reason}")
        if overlay_reason:
            print(f"overlay_reason: {overlay_reason}")
        if atom.get("normalized_content_hash"):
            print(f"normalized_content_hash: {atom.get('normalized_content_hash')}")
    print(f"excerpt: {atom.get('excerpt', '')}")
    print()


def main() -> None:
    parser = argparse.ArgumentParser(description="Recall Codex memory atoms.")
    parser.add_argument("query", nargs="+", help="query words")
    parser.add_argument("--limit", type=int, default=8)
    parser.add_argument("--compact", action="store_true")
    parser.add_argument("--no-log", action="store_true", help="do not record recall usage")
    parser.add_argument("--tags", action="store_true", help="show tag counts and exit")
    parser.add_argument(
        "--include-operational",
        action="store_true",
        help="include operational_log, lifecycle_repost, and quarantined operational_ack atoms",
    )
    args = parser.parse_args()

    atoms = load_atoms()
    if args.tags:
        counts = Counter(tag for atom in atoms for tag in atom.get("tags", []))
        for tag, count in counts.most_common(50):
            print(f"{tag}\t{count}")
        return

    query = " ".join(args.query)
    results = search(query, args.limit, include_operational=args.include_operational)
    if not results:
        print("No memory atoms matched.")
        return

    if not args.no_log:
        record_recall(query, results)

    for score, atom in results:
        print_result(score, atom, args.compact)


if __name__ == "__main__":
    main()
