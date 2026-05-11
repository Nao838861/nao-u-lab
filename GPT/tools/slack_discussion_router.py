#!/usr/bin/env python3
"""Promote high-value Slack memory atoms to #all-nao-u-lab for discussion."""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from slack_client import post_message


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
ATOMS_PATH = MEMORY_DIR / "atoms.jsonl"
STATE_PATH = MEMORY_DIR / "slack_discussion_router_state.json"
DEFAULT_CHANNEL = "all-nao-u-lab"

CORE_TAGS = {
    "memory",
    "game-design",
    "harness",
    "agent",
    "identity",
    "operation",
    "evaluation",
    "principle",
    "game-dev-teacher",
    "supervised-feedback",
}


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def save_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows


def parse_ts(value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def recent_cutoff_ts(hours: int) -> float:
    return (datetime.now() - timedelta(hours=hours)).timestamp()


def permalink(atom: dict[str, Any]) -> str | None:
    channel_ids = {
        "shared-reads": "C0AN2FEHEJJ",
        "all-nao-u-lab": "C0ALWBRNJ66",
        "game-rights": "C0ANQ9DRQ1K",
        "human-steering": "C0ALVUSHK8E",
    }
    channel = str(atom.get("channel", ""))
    ts = str(atom.get("source_ts", ""))
    channel_id = channel_ids.get(channel)
    if not channel_id or not ts:
        return None
    return f"https://nao-u-lab.slack.com/archives/{channel_id}/p{ts.replace('.', '')}"


def candidate_score(atom: dict[str, Any]) -> int:
    tags = set(str(tag) for tag in atom.get("tags", []))
    score = int(atom.get("score", 0) or 0)
    score += 4 * len(tags & CORE_TAGS)
    if {"memory", "agent"} <= tags:
        score += 8
    if {"game-design", "evaluation"} <= tags:
        score += 8
    if {"game-design", "game-dev-teacher"} & tags:
        score += 6
    if atom.get("author") == "Nao_u":
        score += 6
    if str(atom.get("channel")) == "all-nao-u-lab":
        score -= 8
    if str(atom.get("excerpt", "")).lstrip().startswith("[Log_cdx]"):
        score -= 30
    return score


def is_candidate(atom: dict[str, Any], posted: set[str], min_ts: float) -> bool:
    atom_id = str(atom.get("id", ""))
    if not atom_id or atom_id in posted:
        return False
    if parse_ts(atom.get("source_ts")) < min_ts:
        return False
    tags = set(str(tag) for tag in atom.get("tags", []))
    if not (tags & CORE_TAGS):
        return False
    if str(atom.get("channel")) == "all-nao-u-lab" and str(atom.get("excerpt", "")).lstrip().startswith("[Log_cdx]"):
        return False
    return candidate_score(atom) >= 18


def select_candidate(atoms: list[dict[str, Any]], state: dict[str, Any], lookback_hours: int, force: bool) -> dict[str, Any] | None:
    posted = set(str(x) for x in state.get("posted_atom_ids", []))
    if force:
        min_ts = recent_cutoff_ts(lookback_hours)
    else:
        min_ts = max(parse_ts(state.get("last_checked_source_ts")), recent_cutoff_ts(lookback_hours))
    candidates = [atom for atom in atoms if is_candidate(atom, posted, min_ts)]
    if not candidates and force:
        candidates = [atom for atom in atoms if is_candidate(atom, posted, recent_cutoff_ts(72))]
    if not candidates:
        return None
    return sorted(candidates, key=lambda a: (-candidate_score(a), -parse_ts(a.get("source_ts"))))[0]


def build_message(atom: dict[str, Any]) -> str:
    tags = ", ".join(str(tag) for tag in atom.get("tags", [])[:8])
    link = permalink(atom)
    lines = [
        "議論に回したい論点: 新規Slack/記憶atomから拾ったコアミッション関連",
        "",
        f"対象: {atom.get('title')}",
        f"出典: #{atom.get('channel')} / author={atom.get('author')} / source_ts={atom.get('source_ts')}",
    ]
    if link:
        lines.append(f"Slack: {link}")
    if tags:
        lines.append(f"tags: {tags}")
    lines += [
        "",
        "なぜ共有するか:",
        "- ゲームデザイン、AIの記憶階層、自律運用、評価ハーネスのどれかに直接触れている。",
        "- 個別知識として保存するだけでなく、Mir/Ash/Log の別視点で反論・補強・運用化を検討する価値がある。",
        "",
        "私の読み:",
        f"- {atom.get('trigger') or '次の設計判断に使える外部/内部知見として扱う。'}",
        "",
        "確認したいこと:",
        "- これはルールや記憶に固定すべきか、それとも一時的な観測として残すだけでよいか。",
        "- ゲーム制作・記憶運用・自己評価のどの層に戻すと一番効くか。",
    ]
    excerpt = str(atom.get("excerpt", "")).strip()
    if excerpt:
        lines += ["", "抜粋:", excerpt[:700]]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Post one high-value Slack memory atom to #all-nao-u-lab for discussion.")
    parser.add_argument("--channel", default=DEFAULT_CHANNEL)
    parser.add_argument("--lookback-hours", type=int, default=12)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    atoms = read_jsonl(ATOMS_PATH)
    state = load_json(STATE_PATH, {"posted_atom_ids": [], "last_checked_source_ts": "0"})
    candidate = select_candidate(atoms, state, args.lookback_hours, args.force)
    result: dict[str, Any] = {
        "time": now_iso(),
        "selected": bool(candidate),
        "posted": False,
        "dry_run": args.dry_run,
    }
    if candidate:
        message = build_message(candidate)
        result["atom_id"] = candidate.get("id")
        result["source_ts"] = candidate.get("source_ts")
        result["score"] = candidate_score(candidate)
        result["message"] = message
        if not args.dry_run:
            post_result = post_message(args.channel, message)
            result["post_result"] = post_result
            if not post_result.get("ok"):
                raise RuntimeError(f"Slack post failed: {post_result}")
            result["posted"] = True
            posted = [str(x) for x in state.get("posted_atom_ids", [])]
            posted.append(str(candidate.get("id")))
            state["posted_atom_ids"] = posted[-300:]
    max_ts = max((parse_ts(atom.get("source_ts")) for atom in atoms), default=0.0)
    state["last_checked_source_ts"] = str(max_ts)
    state["last_run"] = now_iso()
    state["last_selected"] = result.get("atom_id")
    save_json(STATE_PATH, state)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
