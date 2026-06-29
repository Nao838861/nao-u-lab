#!/usr/bin/env python3
"""Legacy discussion router.

This route used to ask Log/Mir/Ash for follow-up discussion. That operating
mode is retired. The script now no-ops by default so scheduled maintenance
cannot revive old multi-agent callouts. Use --enable-legacy-discussion only for
manual audit of the old route; do not use it from scheduled cycles.
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
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
LLM_TIMEOUT_SEC = 600

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


LLM_PROMPT_TEMPLATE = """次の atom を Slack #all-nao-u-lab に Log_cdx 単独の補足分析メモとして書いてください。

# atom メタ情報

- id: {id}
- title: {title}
- source channel: #{channel}
- author: {author}
- source_ts: {source_ts}
- permalink: {permalink}
- tags: {tags}
- trigger (Use when): {trigger}

# atom 抜粋 (raw)

{excerpt}

# 投稿の制約

- **800-1500字目安**
- テンプレ風の見出し (「なぜ共有するか」「確認したいこと」「私の読み」など固定見出し) は使わない。各 atom に固有の話の流れで書く
- atom 固有の中身に踏み込み、他エージェントへの問いかけ、作業依頼、役割分担を書かない
- 「議論に回したい論点」と単に書くのではなく、Log_cdx 自身の判断、使い道、危険条件を明示する
- log_cdx (自分) の読みを示し、その読みが間違っているならどこかも一文添える
- excerpt の表現を貼り付けるだけでなく、自分の言葉で再定式化する
- 最終行に permalink を 1 行で添える (atom に permalink がない場合は省略)
- 出力は Slack 投稿本文そのままで使えるテキストのみ。前置き・囲み・コードブロック・「以下が投稿本文です」のような meta 句は不要
"""


def _extract_codex_body(stdout: str) -> str:
    """Codex CLI の stdout から本文部分を抽出。

    `subprocess.run(..., capture_output=True)` で stderr を分離した場合、
    stdout は本文のみ。stderr 側にセッションヘッダと "tokens used" 等が出る。
    stderr をリダイレクトして stdout にマージした場合 (`2>&1`) は
    "codex" マーカー〜 "tokens used" の間に本文が来る。両ケースに対応。
    """
    lines = stdout.splitlines()
    codex_starts = [i for i, line in enumerate(lines) if line.strip() == "codex"]
    if codex_starts:
        # Merged stderr case
        start = codex_starts[-1] + 1
        end = len(lines)
        for i in range(start, len(lines)):
            if lines[i].strip() == "tokens used":
                end = i
                break
        return "\n".join(lines[start:end]).strip()
    # Plain case: stdout already contains only the body
    return stdout.strip()


def _build_message_via_codex(atom: dict[str, Any]) -> str | None:
    codex_bin = shutil.which("codex")
    if not codex_bin:
        return None

    prompt = LLM_PROMPT_TEMPLATE.format(
        id=atom.get("id", ""),
        title=atom.get("title", ""),
        channel=atom.get("channel", ""),
        author=atom.get("author", ""),
        source_ts=atom.get("source_ts", ""),
        permalink=permalink(atom) or "(なし)",
        tags=", ".join(str(t) for t in atom.get("tags", [])[:8]),
        trigger=atom.get("trigger", ""),
        excerpt=str(atom.get("excerpt", ""))[:1800],
    )
    try:
        result = subprocess.run(
            [
                codex_bin,
                "exec",
                "--cd",
                str(ROOT),
                "--dangerously-bypass-approvals-and-sandbox",
                "-",
            ],
            input=prompt,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=LLM_TIMEOUT_SEC,
        )
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return None

    if result.returncode != 0:
        return None

    body = _extract_codex_body(result.stdout)
    return body or None


def _build_message_template(atom: dict[str, Any]) -> str:
    """Deterministic fallback used when Codex CLI is unavailable or errors."""
    tags = ", ".join(str(tag) for tag in atom.get("tags", [])[:8])
    link = permalink(atom)
    lines = [
        f"#all-nao-u-lab discussion candidate: {atom.get('title')}",
        f"source: #{atom.get('channel')} / author={atom.get('author')} / source_ts={atom.get('source_ts')}",
    ]
    if link:
        lines.append(f"Slack: {link}")
    if tags:
        lines.append(f"tags: {tags}")
    trigger = str(atom.get("trigger", "")).strip()
    if trigger:
        lines += ["", f"trigger: {trigger}"]
    excerpt = str(atom.get("excerpt", "")).strip()
    if excerpt:
        lines += ["", "excerpt:", excerpt[:700]]
    lines += [
        "",
        "(LLM-generated discussion body failed; deterministic fallback used. Codex CLI 経由で再生成を試みてください。)",
    ]
    return "\n".join(lines)


def build_message(atom: dict[str, Any]) -> str:
    """Compose discussion-prompting post body. Prefer LLM, fall back to template."""
    llm_body = _build_message_via_codex(atom)
    if llm_body:
        return llm_body
    return _build_message_template(atom)


def main() -> int:
    parser = argparse.ArgumentParser(description="Post one high-value Slack memory atom to #all-nao-u-lab for discussion.")
    parser.add_argument("--channel", default=DEFAULT_CHANNEL)
    parser.add_argument("--lookback-hours", type=int, default=12)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--enable-legacy-discussion", action="store_true")
    args = parser.parse_args()

    if not args.enable_legacy_discussion:
        result = {
            "time": now_iso(),
            "selected": False,
            "posted": False,
            "dry_run": args.dry_run,
            "disabled": True,
            "reason": "legacy multi-agent discussion router is retired; shared-reads uses Log_cdx standalone analysis",
        }
        state = load_json(STATE_PATH, {"posted_atom_ids": [], "last_checked_source_ts": "0"})
        state["last_run"] = now_iso()
        state["disabled_reason"] = result["reason"]
        save_json(STATE_PATH, state)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0

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
