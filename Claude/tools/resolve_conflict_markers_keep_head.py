"""Strip git conflict markers from a file, keeping the HEAD side.

Usage:
    python resolve_conflict_markers_keep_head.py FILE [FILE ...]
"""
import sys
from pathlib import Path


def resolve(text: str) -> tuple[str, int]:
    out = []
    state = "normal"
    fixed = 0
    for line in text.splitlines(keepends=True):
        bare = line.rstrip("\r\n")
        if state == "normal":
            if bare.startswith("<<<<<<< "):
                state = "head"
                fixed += 1
                continue
            out.append(line)
        elif state == "head":
            if bare == "=======":
                state = "other"
                continue
            if bare.startswith("<<<<<<< "):
                continue
            out.append(line)
        elif state == "other":
            if bare.startswith(">>>>>>> "):
                state = "normal"
                continue
            continue
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
