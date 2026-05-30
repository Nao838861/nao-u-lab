#!/usr/bin/env python3
"""Build Codex-side memory atoms from GPT-owned raw Slack logs."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import memory_lifecycle
from atoms_fileformat import sync_per_file_atoms
from memory_game_task_facets import build_game_task_entry_points


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
RAW_DIR = MEMORY_DIR / "raw"
ATOMS_PATH = MEMORY_DIR / "atoms.jsonl"
ATOMS_DIR = MEMORY_DIR / "atoms"
INDEX_PATH = MEMORY_DIR / "MEMORY.md"
STATE_PATH = MEMORY_DIR / "state.json"
SHARED_READS_PATH = RAW_DIR / "slack_archive" / "shared-reads.jsonl"

if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)

USER_NAMES = {
    "U0ALW4DKTT7": "Mir",
    "U0AM1F23FQU": "Log",
    "U0AMQKE69BJ": "Ash",
    "U0ALSUK8P9B": "Nao_u",
}

TAG_RULES = [
    ("memory", r"記憶|memory|MEMORY|想起|忘却|forget|recall|RAG|Knowledge Base"),
    ("skills", r"Skill|Skills|skill|スキル|progressive disclosure|description"),
    ("harness", r"ハーネス|harness|headless|観測装置|検証器|self[_ -]?judg"),
    ("game-design", r"ゲーム|game|brick_log|graze_log|sokoban|Pot|textadv|M-\d+"),
    ("slack", r"Slack|shared-reads|all-nao-u-lab|チャンネル"),
    ("agent", r"agent|Agent|エージェント|subagent|Codex|Claude Code"),
    ("identity", r"同一性|identity|自我|人格|Log|Mir|Ash"),
    ("knowledge", r"knowledge/|知識|記事|外部|source:|src:|URL"),
    ("operation", r"運用|scheduler|commit|git|auto|自動|装置|同期"),
    ("evaluation", r"評価|判定|面白|スコア|MPS|レビュー|cross_review"),
    ("principle", r"原則|CLAUDE\.md|beliefs|B\d{3}|ルール|処方"),
]

NOISE_PATTERNS = [
    r"^\s*$",
    r"^\s*[-*]\s*`[^`]+`",
]

GENERIC_TITLE_PATTERNS = [
    re.compile(r"^\[Codex external research\] 日記前検索:"),
    re.compile(r"^日記前検索:"),
    re.compile(r"^\[Codex shared-reads再投稿"),
    re.compile(r"^Nao_u から(?:の全員宛 broadcast| log_cdx 宛の指示)を受領しました。?$"),
    re.compile(r"^Nao_u からの全員宛 broadcast を log_cdx も受領しました。?$"),
    re.compile(r"^投稿者:\s*"),
]


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        return rows
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def load_state() -> dict[str, Any]:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    return {"last_ts": "0", "last_run": None}


def save_state(last_ts: str, added: int, total: int) -> None:
    STATE_PATH.write_text(
        json.dumps(
            {
                "last_ts": last_ts,
                "last_run": datetime.now().isoformat(timespec="seconds"),
                "last_added": added,
                "total_atoms": total,
                "source": str(SHARED_READS_PATH),
                "raw_scope": "gpt-local",
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


def source_ts_sort_key(atom: dict[str, Any]) -> tuple[int, float, str]:
    raw = str(atom.get("source_ts", "0"))
    try:
        return (0, float(raw), str(atom.get("id", "")))
    except ValueError:
        return (1, 0.0, str(atom.get("id", "")))


def stable_id(ts: str, text: str) -> str:
    digest = hashlib.sha1(f"{ts}\n{text[:500]}".encode("utf-8")).hexdigest()[:10]
    return f"sr-{ts.split('.')[0]}-{digest}"


def first_title(text: str) -> str:
    for raw in text.splitlines():
        line = raw.strip()
        if not line or any(re.search(p, line) for p in NOISE_PATTERNS):
            continue
        line = re.sub(r"^#+\s*", "", line)
        line = re.sub(r"^[【\[]([^】\]]+)[】\]]\s*", "", line)
        line = re.sub(r"\s+", " ", line)
        if line:
            return line[:140]
    return "(untitled shared-read)"


def concrete_title(title: str, row: dict[str, Any], text: str) -> str:
    """Make recurring operational titles specific enough for future recall."""
    if not any(pattern.search(title) for pattern in GENERIC_TITLE_PATTERNS):
        return title

    dt = str(row.get("datetime") or row.get("ts") or "")[:16]
    channel = str(row.get("channel") or "shared-reads")
    links = extract_links(text)
    if links:
        tail = links[0].rstrip("/").split("/")[-1][:32]
    else:
        digest = hashlib.sha1(text[:500].encode("utf-8")).hexdigest()[:8]
        tail = digest
    suffix_parts = [part for part in (channel, dt, tail) if part]
    suffix = " / ".join(suffix_parts)
    return f"{title} — {suffix}"[:180]


def extract_links(text: str) -> list[str]:
    links = re.findall(r"https?://[^\s<>\)]+", text)
    links += re.findall(r"\b(?:knowledge|memory|projects|docs|game)/[A-Za-z0-9_\-./]+\.md\b", text)
    seen = set()
    out = []
    for link in links:
        link = link.rstrip("。、，.,;:)")
        if link not in seen:
            out.append(link)
            seen.add(link)
    return out[:12]


def classify_kind(text: str) -> list[str]:
    kinds = []
    if re.search(r"処方|提案|必須|テンプレ|設計|should|must|候補", text, re.I):
        kinds.append("prescription")
    if re.search(r"×|合成|三角|接続|重ね|直結|比較|対比", text):
        kinds.append("synthesis")
    if re.search(r"source:|src:|https?://|元ツイート|一次資料|論文|公式", text, re.I):
        kinds.append("observation")
    if re.search(r"なぜ拾った|自警告|気づき|発見|体験|反省|未解決の問い", text):
        kinds.append("reflection")
    return kinds[:2] or ["observation"]


def extract_tags(text: str) -> list[str]:
    tags = []
    for tag, pattern in TAG_RULES:
        if re.search(pattern, text, re.I):
            tags.append(tag)

    ids = re.findall(r"\b(?:M|B)-?\d{2,3}\b", text)
    tags.extend(id_.replace("-", "") for id_ in ids[:6])

    for file_ref in re.findall(r"\b(?:knowledge|memory|projects|docs|game)/([A-Za-z0-9_\-./]+)\.md\b", text):
        stem = Path(file_ref).stem
        if stem:
            tags.append(stem[:48])

    seen = set()
    out = []
    for tag in tags:
        normalized = tag.lower()
        if normalized not in seen:
            out.append(normalized)
            seen.add(normalized)
    return out[:16]


def importance_score(text: str, links: list[str], tags: list[str]) -> int:
    score = 0
    score += min(len(links), 5)
    score += min(len(tags), 8)
    score += 2 if "未解決の問い" in text else 0
    score += 2 if re.search(r"処方|提案|テンプレ|必須", text) else 0
    score += 2 if re.search(r"knowledge/|memory/|projects/", text) else 0
    score += 1 if len(text) > 800 else 0
    return score


def excerpt(text: str, limit: int = 420) -> str:
    compact = re.sub(r"\s+", " ", text).strip()
    return compact[:limit]


def make_trigger(title: str, tags: list[str], kind: list[str]) -> str:
    contexts = []
    if "memory" in tags:
        contexts.append("記憶・想起・圧縮を扱う時")
    if "game-design" in tags:
        contexts.append("ゲーム設計や自己判定をする時")
    if "harness" in tags:
        contexts.append("観測装置や検証ループを作る時")
    if "skills" in tags:
        contexts.append("スキル/起動時インデックスを設計する時")
    if "operation" in tags:
        contexts.append("自律運用や同期の問題を見る時")
    if not contexts:
        contexts.append("shared-reads由来の外部知見を探す時")
    return f"Use when {contexts[0]}。{title} ({'/'.join(kind)})"


def should_keep(text: str, score: int) -> bool:
    if len(text.strip()) < 160:
        return False
    if score >= 5:
        return True
    return bool(re.search(r"knowledge/|memory/|projects/|未解決の問い|処方|M-\d+|B\d{3}", text))


def row_to_atom(row: dict[str, Any]) -> dict[str, Any] | None:
    text = row.get("text", "")
    links = extract_links(text)
    tags = extract_tags(text)
    kind = classify_kind(text)
    score = importance_score(text, links, tags)
    if not should_keep(text, score):
        return None
    ts = str(row.get("ts", "0"))
    title = concrete_title(first_title(text), row, text)
    return {
        "id": stable_id(ts, text),
        "source": "slack_archive/shared-reads.jsonl",
        "source_ts": ts,
        "datetime": row.get("datetime"),
        "channel": row.get("channel", "shared-reads"),
        "user": row.get("user"),
        "author": USER_NAMES.get(row.get("user"), row.get("user_name") or row.get("user")),
        "title": title,
        "kind": kind,
        "tags": tags,
        "links": links,
        "score": score,
        "trigger": make_trigger(title, tags, kind),
        "excerpt": excerpt(text),
    }


def cutoff_ts(days: int) -> float:
    dt = datetime.now() - timedelta(days=days)
    return dt.timestamp()


def render_index(atoms: list[dict[str, Any]], source_count: int) -> str:
    display_atoms = memory_lifecycle.fold_atoms(atoms)
    atoms_sorted = sorted(display_atoms, key=lambda a: (-int(a.get("score", 0)), str(a.get("datetime", ""))))
    recent = sorted(display_atoms, key=lambda a: str(a.get("datetime", "")), reverse=True)[:20]
    by_tag: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for atom in atoms_sorted:
        for tag in atom.get("tags", [])[:8]:
            by_tag[tag].append(atom)

    tag_counts = Counter(tag for atom in display_atoms for tag in atom.get("tags", []))
    generated = datetime.now().isoformat(timespec="seconds")
    lines = [
        "# Codex Memory Index",
        "",
        "shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。",
        "",
        "## 起動時の使い方",
        "- まず `python tools/memory_ingest.py` で増分取り込みする。",
        "- 作業に入る前に `python tools/memory_recall.py \"<今回の焦点>\"` で関連 atom を引く。",
        "- このファイルは常時読むための索引で、長い要約や反省を増やさない。",
        "",
        f"- generated: {generated}",
        f"- atoms: {len(atoms)}",
        f"- display atoms after lifecycle/content fold: {len(display_atoms)}",
        f"- folded by lifecycle/content metadata: {len(atoms) - len(display_atoms)}",
        f"- scanned shared-reads rows: {source_count}",
        "",
        "## High Signal",
    ]
    for atom in atoms_sorted[:30]:
        tag_str = ", ".join(atom.get("tags", [])[:6])
        lines.append(f"- `{atom['id']}` {atom['trigger']} tags=[{tag_str}]")

    lines += ["", "## Recent"]
    for atom in recent:
        tag_str = ", ".join(atom.get("tags", [])[:5])
        lines.append(f"- `{atom['id']}` {atom.get('datetime', '')} {atom['title']} tags=[{tag_str}]")

    lines += ["", "## Game Task Entry Points"]
    for entry in build_game_task_entry_points(display_atoms):
        examples = " / ".join(entry["examples"])
        lines.append(f"- `{entry['name']}` ({entry['count']}): {examples}")

    lines += ["", "## Tag Entry Points"]
    for tag, count in tag_counts.most_common(24):
        examples = " / ".join(a["id"] for a in by_tag[tag][:3])
        lines.append(f"- `{tag}` ({count}): {examples}")

    lines += [
        "",
        "## 原則",
        "- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。",
        "- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。",
        "- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest shared-reads into Codex memory atoms.")
    parser.add_argument("--all", action="store_true", help="scan all shared-reads rows")
    parser.add_argument("--rebuild", action="store_true", help="rebuild atoms.jsonl from scratch")
    parser.add_argument("--days", type=int, default=14, help="initial lookback when state is empty")
    parser.add_argument("--min-score", type=int, default=5, help="minimum score for normal retention")
    args = parser.parse_args()

    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    rows = read_jsonl(SHARED_READS_PATH)
    existing_atoms = [] if args.rebuild else read_jsonl(ATOMS_PATH)
    seen_ts = {str(a.get("source_ts")) for a in existing_atoms}
    state = load_state()

    last_ts = 0.0 if args.all else float(state.get("last_ts") or 0)
    if not args.all and not existing_atoms and last_ts == 0:
        last_ts = cutoff_ts(args.days)

    added: list[dict[str, Any]] = []
    max_ts = state.get("last_ts", "0")
    for row in rows:
        ts = str(row.get("ts", "0"))
        try:
            ts_float = float(ts)
        except ValueError:
            continue
        if ts_float <= float(max_ts or 0):
            max_ts = str(max(float(max_ts or 0), ts_float))
        if not args.all and ts_float <= last_ts:
            continue
        if ts in seen_ts:
            continue
        atom = row_to_atom(row)
        if atom and int(atom["score"]) >= args.min_score:
            added.append(atom)
            seen_ts.add(ts)
        max_ts = str(max(float(max_ts or 0), ts_float))

    all_atoms = existing_atoms + added
    all_atoms.sort(key=source_ts_sort_key)
    write_jsonl(ATOMS_PATH, all_atoms)
    INDEX_PATH.write_text(render_index(all_atoms, len(rows)), encoding="utf-8", newline="\n")
    save_state(max_ts, len(added), len(all_atoms))

    # Phase C dual-write: keep per-file .md + atoms/index.jsonl in sync
    per_file_changed, per_file_total = sync_per_file_atoms(all_atoms, ATOMS_DIR)

    print(f"source rows: {len(rows)}")
    print(f"added atoms: {len(added)}")
    print(f"total atoms: {len(all_atoms)}")
    print(f"index: {INDEX_PATH}")
    print(f"per-file: changed={per_file_changed} total={per_file_total} dir={ATOMS_DIR}")


if __name__ == "__main__":
    main()
