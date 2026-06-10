"""Merge git conflict markers in jsonl files by taking union of both sides, deduplicated by ts field.

Slack archive jsonl files (log/slack_archive/*.jsonl) are append-only logs. A botched sync
left conflict markers committed in the file body. resolve_conflict_markers_keep_head.py
would drop the "other" side's entries; this tool instead takes the UNION of both sides
deduplicated by the `ts` field, preserving all real data.

For non-jsonl lines or lines without a `ts` field, falls back to full-line dedup.
Output is sorted by ts (ascending) within each resolved block.

Usage:
    python resolve_jsonl_conflict_markers_union.py FILE [FILE ...]
"""
import json
import sys
from pathlib import Path


def key_for(line: str) -> str:
    line = line.rstrip("\r\n")
    if not line:
        return ""
    try:
        obj = json.loads(line)
        ts = obj.get("ts")
        if ts is not None:
            return f"ts:{ts}"
    except Exception:
        pass
    return f"raw:{line}"


def resolve(text: str) -> tuple[str, int]:
    out: list[str] = []
    state = "normal"
    head_buf: list[str] = []
    other_buf: list[str] = []
    fixed = 0
    for line in text.splitlines(keepends=True):
        bare = line.rstrip("\r\n")
        if state == "normal":
            if bare.startswith("<<<<<<< "):
                state = "head"
                head_buf = []
                other_buf = []
                fixed += 1
                continue
            out.append(line)
        elif state == "head":
            if bare == "=======":
                state = "other"
                continue
            if bare.startswith("<<<<<<< "):
                continue
            head_buf.append(line)
        elif state == "other":
            if bare.startswith(">>>>>>> "):
                merged: dict[str, str] = {}
                for buf in (head_buf, other_buf):
                    for ln in buf:
                        k = key_for(ln)
                        if k == "":
                            continue
                        if k not in merged:
                            merged[k] = ln
                ts_items = []
                other_items = []
                for k, ln in merged.items():
                    if k.startswith("ts:"):
                        ts_items.append((k[3:], ln))
                    else:
                        other_items.append(ln)
                try:
                    ts_items.sort(key=lambda x: float(x[0]))
                except ValueError:
                    ts_items.sort(key=lambda x: x[0])
                out.extend(other_items)
                out.extend(ln for _, ln in ts_items)
                state = "normal"
                continue
            other_buf.append(line)
    return "".join(out), fixed


def main(argv: list[str]) -> int:
    rc = 0
    for arg in argv:
        p = Path(arg)
        if not p.is_file():
            print(f"skip {arg}: not a file")
            rc = 1
            continue
        raw = p.read_bytes()
        text = raw.decode("utf-8", errors="replace")
        new, n = resolve(text)
        if n:
            p.write_text(new, encoding="utf-8", newline="")
            print(f"resolved {n} conflict block(s) in {arg}")
        else:
            print(f"no conflict markers in {arg}")
    return rc


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
