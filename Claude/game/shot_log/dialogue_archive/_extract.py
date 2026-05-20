r"""
Extract shot_log-related dialogues from Claude Code transcripts.

Scope:
- Transcripts in C:\Users\owner\.claude\projects\D--AI-Nao-u-BOT-Claude\
- Time window: 2026-04-24 to 2026-04-27 (v01 creation) and 2026-05-16 to 2026-05-18 (v02 planning)
- Only sessions where shot_log appears in user or assistant text content
- Output: one Markdown per session, with INDEX.md
"""
import json
import os
import re
from pathlib import Path
from datetime import datetime, timezone

PROJECTS = [
    Path(r"C:\Users\owner\.claude\projects\D--AI-Nao-u-BOT-Claude"),
    Path(r"C:\Users\owner\.claude\projects\D--AI-Nao-u-BOT"),
]
OUT_DIR = Path(r"D:\AI\Nao_u_BOT\Claude\game\shot_log\dialogue_archive")
OUT_DIR.mkdir(parents=True, exist_ok=True)

WINDOWS = [
    (datetime(2026, 4, 24), datetime(2026, 4, 27, 23, 59, 59), "v01_creation"),
    (datetime(2026, 5, 16), datetime(2026, 5, 18, 23, 59, 59), "v02_planning"),
]

def parse_ts(s):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone().replace(tzinfo=None)
    except Exception:
        return None

def extract_text(content):
    """Extract human-readable text from a message.content (string or list of blocks)."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if not isinstance(block, dict):
                continue
            btype = block.get("type")
            if btype == "text":
                parts.append(block.get("text", ""))
            elif btype == "tool_use":
                name = block.get("name", "?")
                inp = block.get("input", {})
                if name == "Bash" and isinstance(inp, dict):
                    cmd = inp.get("command", "")[:200]
                    parts.append(f"[tool: Bash] {cmd}")
                elif name in ("Read", "Edit", "Write") and isinstance(inp, dict):
                    fp = inp.get("file_path", "")
                    parts.append(f"[tool: {name}] {fp}")
                # ignore noisy tool calls in dialogue rendering
            elif btype == "tool_result":
                # tool results are noise for dialogue archive
                pass
        return "\n".join(p for p in parts if p)
    return str(content)

def process_jsonl(path):
    """Return (records, session_window_label or None). records is list of (ts, role, text)."""
    records = []
    has_shot_log = False
    earliest = None
    latest = None
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
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
        # Skip tool-result user entries
        if t == "user" and d.get("toolUseResult") is not None:
            continue
        content = msg.get("content")
        text = extract_text(content)
        if not text or not text.strip():
            continue
        ts = parse_ts(d.get("timestamp"))
        if ts is None:
            continue
        if earliest is None or ts < earliest:
            earliest = ts
        if latest is None or ts > latest:
            latest = ts
        if "shot_log" in text:
            has_shot_log = True
        role = "User" if t == "user" else "Assistant"
        records.append((ts, role, text))
    if not has_shot_log or not records:
        return None
    # Find which window this session falls in (use earliest msg)
    label = None
    for start, end, name in WINDOWS:
        if start <= earliest <= end:
            label = name
            break
    if label is None:
        return None
    return {"records": records, "label": label, "earliest": earliest, "latest": latest, "path": path}

def render_md(session):
    out = []
    earliest = session["earliest"].strftime("%Y-%m-%d %H:%M:%S")
    latest = session["latest"].strftime("%Y-%m-%d %H:%M:%S")
    out.append(f"# Session: {session['path'].stem}")
    out.append("")
    out.append(f"- Window: **{session['label']}**")
    out.append(f"- Start: {earliest}")
    out.append(f"- End: {latest}")
    out.append(f"- Source: `{session['path']}`")
    out.append("")
    out.append("---")
    out.append("")
    for ts, role, text in session["records"]:
        ts_str = ts.strftime("%H:%M:%S")
        out.append(f"## [{ts_str}] {role}")
        out.append("")
        out.append(text.rstrip())
        out.append("")
    return "\n".join(out)

def main():
    sessions = []
    seen_sids = set()
    for project_dir in PROJECTS:
        if not project_dir.exists():
            continue
        for jsonl in project_dir.glob("*.jsonl"):
            try:
                sid = jsonl.stem
                if sid in seen_sids:
                    continue
                # Fast pre-filter by content
                with open(jsonl, "rb") as f:
                    head = f.read(200_000)
                if b"shot_log" not in head:
                    # check rest of file too if header didn't catch it
                    if b"shot_log" not in jsonl.read_bytes():
                        continue
                result = process_jsonl(jsonl)
                if result:
                    sessions.append(result)
                    seen_sids.add(sid)
            except Exception as e:
                print(f"ERR {jsonl.name}: {e}")
                continue
    sessions.sort(key=lambda s: s["earliest"])
    # Write per-session MD
    for s in sessions:
        date_prefix = s["earliest"].strftime("%Y%m%d_%H%M")
        out_path = OUT_DIR / f"{s['label']}_{date_prefix}_{s['path'].stem[:8]}.md"
        out_path.write_text(render_md(s), encoding="utf-8")
    # INDEX.md
    idx = ["# shot_log dialogue archive", ""]
    idx.append("Extracted from Claude Code transcripts (~/.claude/projects/) — sessions where `shot_log` appears, within v01 creation (2026-04-24 to 04-27) and v02 planning (2026-05-16 to 05-18) windows.")
    idx.append("")
    current_label = None
    for s in sessions:
        if s["label"] != current_label:
            current_label = s["label"]
            idx.append("")
            idx.append(f"## {current_label}")
            idx.append("")
        date_prefix = s["earliest"].strftime("%Y%m%d_%H%M")
        fname = f"{s['label']}_{date_prefix}_{s['path'].stem[:8]}.md"
        msg_count = len(s["records"])
        idx.append(f"- [{s['earliest'].strftime('%Y-%m-%d %H:%M')} → {s['latest'].strftime('%H:%M')}]({fname}) — {msg_count} messages")
    (OUT_DIR / "INDEX.md").write_text("\n".join(idx) + "\n", encoding="utf-8")
    print(f"Sessions extracted: {len(sessions)}")
    print(f"Output dir: {OUT_DIR}")

if __name__ == "__main__":
    main()
