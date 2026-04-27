"""Shared helper for building claude CLI commands with system identity prompt.

Phase 2 of system prompt 3-layer restructuring (2026-04-03).
All scripts should use build_claude_cmd() instead of constructing the command manually.
"""
from pathlib import Path

REPO_DIR = Path(__file__).parent
SYSTEM_PROMPT_FILE = REPO_DIR / ".claude" / "system_identity.md"


def build_claude_cmd(prompt=None):
    """Build claude --print command with system identity prompt injected.

    prompt=None → stdin経由でプロンプトを渡す前提のコマンドを返す（-p引数なし）。
    呼び出し側は subprocess.run(cmd, input=prompt, ...) で渡すこと。
    Windows の CreateProcess コマンドライン上限（~32KB）を回避するため、
    大きなプロンプトを扱う処理は必ず stdin 経由を使う。
    """
    cmd = ["claude", "--print", "--model", "claude-opus-4-7"]
    if SYSTEM_PROMPT_FILE.exists():
        cmd.extend(["--append-system-prompt-file", str(SYSTEM_PROMPT_FILE)])
    if prompt is not None:
        cmd.extend(["-p", prompt])
    return cmd
