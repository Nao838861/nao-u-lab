"""Shared helper for building claude CLI commands with system identity prompt.

Phase 2 of system prompt 3-layer restructuring (2026-04-03).
All scripts should use build_claude_cmd() instead of constructing the command manually.
"""
from pathlib import Path

REPO_DIR = Path(__file__).parent
SYSTEM_PROMPT_FILE = REPO_DIR / ".claude" / "system_identity.md"


def build_claude_cmd(prompt):
    """Build claude --print command with system identity prompt injected."""
    cmd = ["claude", "--print"]
    if SYSTEM_PROMPT_FILE.exists():
        cmd.extend(["--append-system-prompt-file", str(SYSTEM_PROMPT_FILE)])
    cmd.extend(["-p", prompt])
    return cmd
