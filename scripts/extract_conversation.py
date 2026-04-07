#!/usr/bin/env python
"""
Claude Code .jsonl セッションから人間が読める対話ログを抽出する。
Nao_uの指示: 「私とあなたの発言は全文綺麗に残して、それ以外は必要最小限に」

使い方:
  python scripts/extract_conversation.py <session_id> [--output <path>]
  python scripts/extract_conversation.py 1c42588d  # UUIDの先頭でもOK
  python scripts/extract_conversation.py --list-interactive  # 対話セッション一覧
"""

import json
import os
import sys
import glob
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path

JST = timezone(timedelta(hours=9))
CLAUDE_DIR = Path.home() / ".claude" / "projects" / "D--AI-Nao-u-BOT"

# Tool calls that produce important visible output
IMPORTANT_TOOLS = {"Write", "Edit", "Bash"}
# Tool calls to completely skip in output
SKIP_TOOLS = {"Glob", "Grep", "Read", "ToolSearch", "TodoWrite"}


def find_session(partial_id: str) -> Path:
    """Partial UUID match for session files."""
    candidates = list(CLAUDE_DIR.glob(f"{partial_id}*.jsonl"))
    if not candidates:
        # Try anywhere in name
        candidates = list(CLAUDE_DIR.glob(f"*{partial_id}*.jsonl"))
    if not candidates:
        raise FileNotFoundError(f"No session matching '{partial_id}'")
    if len(candidates) > 1:
        # Sort by size (biggest first - likely the main session)
        candidates.sort(key=lambda p: p.stat().st_size, reverse=True)
        print(f"Multiple matches, using largest: {candidates[0].name}", file=sys.stderr)
    return candidates[0]


def parse_timestamp(ts_str: str) -> str:
    """ISO timestamp -> JST readable string."""
    if not ts_str:
        return ""
    try:
        dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        jst = dt.astimezone(JST)
        return jst.strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return ts_str


def extract_text_from_content(content) -> str:
    """Extract plain text from message content (string or list of blocks)."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        texts = []
        for block in content:
            if isinstance(block, dict):
                if block.get("type") == "text":
                    texts.append(block.get("text", ""))
        return "\n".join(texts)
    return ""


def extract_tool_calls(content) -> list:
    """Extract tool call summaries from assistant content."""
    if not isinstance(content, list):
        return []
    calls = []
    for block in content:
        if isinstance(block, dict) and block.get("type") == "tool_use":
            name = block.get("name", "")
            inp = block.get("input", {})
            calls.append((name, inp))
    return calls


def summarize_tool_call(name: str, inp: dict) -> str:
    """One-line summary of a tool call."""
    if name == "Write":
        path = inp.get("file_path", "")
        return f"[Write: {Path(path).name}]"
    elif name == "Edit":
        path = inp.get("file_path", "")
        old = inp.get("old_string", "")[:60]
        new = inp.get("new_string", "")[:60]
        return f"[Edit: {Path(path).name}] {old!r} -> {new!r}"
    elif name == "Bash":
        cmd = inp.get("command", "")[:120]
        return f"[Bash: {cmd}]"
    elif name in SKIP_TOOLS:
        return ""  # Skip entirely
    else:
        return f"[{name}]"


def format_code_snippet(inp: dict, name: str) -> str:
    """Extract code content from Write/Edit for inclusion."""
    if name == "Write":
        content = inp.get("content", "")
        path = inp.get("file_path", "")
        ext = Path(path).suffix
        lang = {"py": "python", ".js": "javascript", ".md": "markdown"}.get(ext, "")
        if len(content) > 2000:
            content = content[:2000] + "\n... (truncated)"
        return f"```{lang}\n# {Path(path).name}\n{content}\n```"
    return ""


def extract_session(session_path: Path) -> str:
    """Main extraction: session .jsonl -> readable markdown."""
    with open(session_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    entries = []
    for line in lines:
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError:
            continue

    # Get session metadata
    session_id = session_path.stem
    first_ts = ""
    for e in entries:
        if e.get("timestamp"):
            first_ts = e["timestamp"]
            break

    output = []
    output.append(f"# 対話ログ: {session_id}")
    output.append(f"# 抽出日: {datetime.now(JST).strftime('%Y-%m-%d %H:%M')}")
    output.append(f"# セッション開始: {parse_timestamp(first_ts)}")
    output.append("")
    output.append("---")
    output.append("")

    last_speaker = None
    message_num = 0

    for entry in entries:
        etype = entry.get("type")

        if etype == "user":
            user_type = entry.get("userType", "")
            msg = entry.get("message", {})
            content = msg.get("content", "")
            ts = parse_timestamp(entry.get("timestamp", ""))

            # External = human (Nao_u), otherwise = tool results / system
            if user_type == "external":
                text = extract_text_from_content(content)
                if text.strip():
                    message_num += 1
                    output.append(f"## Nao_u [{ts}]")
                    output.append("")
                    output.append(text.strip())
                    output.append("")
                    last_speaker = "user"
            # Skip tool results and system messages

        elif etype == "assistant":
            msg = entry.get("message", {})
            content = msg.get("content", "")
            ts = parse_timestamp(entry.get("timestamp", ""))

            text = extract_text_from_content(content)
            tool_calls = extract_tool_calls(content)

            has_text = text.strip()
            has_tools = bool(tool_calls)

            if has_text:
                if last_speaker != "assistant_text":
                    output.append(f"### Claude [{ts}]")
                    output.append("")
                output.append(text.strip())
                output.append("")
                last_speaker = "assistant_text"

            if has_tools:
                tool_lines = []
                code_snippets = []
                for name, inp in tool_calls:
                    summary = summarize_tool_call(name, inp)
                    if summary:
                        tool_lines.append(summary)
                    # Include code for Write operations (important source code)
                    if name == "Write" and inp.get("file_path", ""):
                        fpath = inp.get("file_path", "")
                        # Only include game-related source files
                        if any(kw in fpath.lower() for kw in ["game", "mario", "platformer", "study_"]):
                            snippet = format_code_snippet(inp, name)
                            if snippet:
                                code_snippets.append(snippet)

                if tool_lines:
                    if last_speaker != "assistant_text":
                        output.append(f"### Claude [{ts}]")
                        output.append("")
                    for tl in tool_lines:
                        output.append(f"> {tl}")
                    output.append("")

                for snippet in code_snippets:
                    output.append(snippet)
                    output.append("")

                last_speaker = "assistant_tool"

    # Stats
    user_count = sum(1 for e in entries if e.get("type") == "user" and e.get("userType") == "external")
    assistant_count = sum(1 for e in entries if e.get("type") == "assistant")

    output.append("---")
    output.append(f"# 統計: Nao_u発言 {user_count}回, Claude応答 {assistant_count}回, 総エントリ {len(entries)}件")

    return "\n".join(output)


def list_interactive_sessions():
    """List sessions that have external (human) user messages."""
    jsonl_files = list(CLAUDE_DIR.glob("*.jsonl"))
    sessions = []

    for f in jsonl_files:
        try:
            external_count = 0
            first_ts = ""
            first_user_text = ""
            total = 0
            with open(f, "r", encoding="utf-8") as fh:
                for line in fh:
                    try:
                        entry = json.loads(line)
                        total += 1
                        if not first_ts and entry.get("timestamp"):
                            first_ts = entry["timestamp"]
                        if entry.get("type") == "user" and entry.get("userType") == "external":
                            external_count += 1
                            if not first_user_text:
                                content = entry.get("message", {}).get("content", "")
                                first_user_text = extract_text_from_content(content)[:80]
                    except json.JSONDecodeError:
                        continue
            if external_count > 0:
                size_mb = f.stat().st_size / (1024 * 1024)
                sessions.append((first_ts, f.stem, external_count, total, size_mb, first_user_text))
        except Exception:
            continue

    sessions.sort(reverse=True)
    print(f"{'Date':<20} {'Session ID':<38} {'Human':>5} {'Total':>6} {'MB':>6}  First message")
    print("-" * 130)
    for ts, sid, ext, tot, mb, text in sessions[:30]:
        dt = parse_timestamp(ts)[:16]
        print(f"{dt:<20} {sid:<38} {ext:>5} {tot:>6} {mb:>6.1f}  {text[:50]}")


def find_game_sessions():
    """Find sessions related to game development."""
    jsonl_files = list(CLAUDE_DIR.glob("*.jsonl"))
    game_keywords = ["mario", "platformer", "study_platformer", "play.py", "ai_play",
                     "sprite", "collision", "tilemap", "level_1", "core.py", "renderer"]
    sessions = []

    for f in jsonl_files:
        try:
            has_game = False
            external_count = 0
            first_ts = ""
            first_user_text = ""
            with open(f, "r", encoding="utf-8") as fh:
                for line in fh:
                    try:
                        entry = json.loads(line)
                        if not first_ts and entry.get("timestamp"):
                            first_ts = entry["timestamp"]
                        content_str = json.dumps(entry).lower()
                        if any(kw in content_str for kw in game_keywords):
                            has_game = True
                        if entry.get("type") == "user" and entry.get("userType") == "external":
                            external_count += 1
                            if not first_user_text:
                                c = entry.get("message", {}).get("content", "")
                                first_user_text = extract_text_from_content(c)[:80]
                    except json.JSONDecodeError:
                        continue
            if has_game and external_count > 0:
                size_mb = f.stat().st_size / (1024 * 1024)
                sessions.append((first_ts, f.stem, external_count, size_mb, first_user_text))
        except Exception:
            continue

    sessions.sort(reverse=True)
    print(f"Game-related interactive sessions:")
    print(f"{'Date':<20} {'Session ID':<38} {'Human':>5} {'MB':>6}  First message")
    print("-" * 110)
    for ts, sid, ext, mb, text in sessions:
        dt = parse_timestamp(ts)[:16]
        print(f"{dt:<20} {sid:<38} {ext:>5} {mb:>6.1f}  {text[:50]}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    if sys.argv[1] == "--list-interactive":
        list_interactive_sessions()
    elif sys.argv[1] == "--list-game":
        find_game_sessions()
    else:
        partial_id = sys.argv[1]
        session_path = find_session(partial_id)
        print(f"Extracting: {session_path.name}", file=sys.stderr)

        result = extract_session(session_path)

        if "--output" in sys.argv:
            idx = sys.argv.index("--output")
            out_path = sys.argv[idx + 1]
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(result)
            print(f"Written to: {out_path}", file=sys.stderr)
        else:
            print(result)
