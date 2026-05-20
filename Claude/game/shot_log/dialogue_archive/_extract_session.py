r"""
Extract a single full session from a Claude Code transcript jsonl,
filtered to a date range to keep output focused.

Used to recover sessions that span outside the v01_creation/v02_planning windows
but contain the shot_log dialogue.
"""
import json
import sys
from pathlib import Path
from datetime import datetime

def extract_text(content):
    """Extract ONLY natural-language text blocks. Tool calls and thinking blocks are excluded."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if not isinstance(block, dict):
                continue
            if block.get("type") == "text":
                parts.append(block.get("text", ""))
        return "\n".join(p for p in parts if p)
    return ""

def parse_ts(s):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone().replace(tzinfo=None)
    except Exception:
        return None

def extract(jsonl_path, out_path, date_filter=None):
    records = []
    for line in Path(jsonl_path).read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            d = json.loads(line)
        except Exception:
            continue
        t = d.get("type")
        if t not in ("user", "assistant"):
            continue
        msg = d.get("message")
        if not isinstance(msg, dict):
            continue
        if t == "user" and d.get("toolUseResult") is not None:
            continue
        text = extract_text(msg.get("content"))
        if not text or not text.strip():
            continue
        ts = parse_ts(d.get("timestamp"))
        if ts is None:
            continue
        if date_filter and not (date_filter[0] <= ts <= date_filter[1]):
            continue
        role = "User" if t == "user" else "Assistant"
        records.append((ts, role, text))
    if not records:
        print("No records matched")
        return
    out = []
    out.append(f"# Session: {Path(jsonl_path).stem}")
    out.append("")
    out.append(f"- Source: `{jsonl_path}`")
    out.append(f"- Window: {date_filter[0]} → {date_filter[1]}" if date_filter else "- Window: full session")
    out.append(f"- Messages: {len(records)}")
    out.append(f"- First: {records[0][0]}")
    out.append(f"- Last:  {records[-1][0]}")
    out.append("")
    out.append("---")
    out.append("")
    for ts, role, text in records:
        ts_str = ts.strftime("%Y-%m-%d %H:%M:%S")
        out.append(f"## [{ts_str}] {role}")
        out.append("")
        out.append(text.rstrip())
        out.append("")
    Path(out_path).write_text("\n".join(out), encoding="utf-8")
    print(f"Wrote {out_path} ({len(records)} messages)")

if __name__ == "__main__":
    # 2545e542 — the long-spanning session that contains the "数学的に再現できる" exchange
    src = r"C:\Users\owner\.claude\projects\D--AI-Nao-u-BOT-Claude\2545e542-2099-47d7-bfa0-23e435b189d3.jsonl"
    # Full session (no date filter)
    out = Path(__file__).parent / "v01_creation_FULL_SESSION_2545e542.md"
    extract(src, out, date_filter=None)
