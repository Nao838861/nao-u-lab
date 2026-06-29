#!/usr/bin/env python3
"""Guarded git sync for autonomous Codex cycles.

The scheduled cycles should never create another local commit when the
repository is already corrupt, behind its upstream, or unable to reach the
remote. In those cases this module returns a structured blocked result before
`git add` / `git commit`.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parent
SAFE_DIRECTORY = REPO_ROOT.as_posix()

CORRUPTION_MARKERS = (
    "corrupt loose object",
    "object corrupt or missing",
    "inflate: data stream error",
    "fatal: loose object",
    "fatal: unable to read",
    "broken link from",
    "missing blob",
    "bad object",
)


def _trim(text: str, limit: int = 1600) -> str:
    text = (text or "").strip()
    if len(text) <= limit:
        return text
    return text[:limit] + "...[truncated]"


def run_git(args: list[str], timeout: int = 60) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", "-c", f"safe.directory={SAFE_DIRECTORY}", "-C", str(REPO_ROOT), *args],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
    )


def _result(
    ok: bool,
    stage: str,
    reason: str = "",
    *,
    blocked: bool = False,
    details: str = "",
    **extra: Any,
) -> dict[str, Any]:
    data: dict[str, Any] = {
        "ok": ok,
        "blocked": blocked,
        "stage": stage,
    }
    if reason:
        data["reason"] = reason
    if details:
        data["details"] = _trim(details)
    data.update(extra)
    return data


def _combined_output(proc: subprocess.CompletedProcess[str]) -> str:
    return "\n".join(part for part in (proc.stdout, proc.stderr) if part)


def looks_corrupt(text: str) -> bool:
    lower = text.lower()
    return any(marker in lower for marker in CORRUPTION_MARKERS)


def check_repository_integrity() -> dict[str, Any]:
    try:
        proc = run_git(["fsck", "--connectivity-only", "--no-dangling"], timeout=45)
    except subprocess.TimeoutExpired:
        return _result(
            False,
            "fsck",
            "git_integrity_check_timeout",
            blocked=True,
            details="git fsck --connectivity-only did not finish within 45 seconds",
        )

    output = _combined_output(proc)
    if proc.returncode == 0:
        return _result(True, "fsck")
    reason = "git_repository_corrupt" if looks_corrupt(output) else "git_integrity_check_failed"
    return _result(False, "fsck", reason, blocked=True, details=output)


def upstream_name() -> tuple[str | None, dict[str, Any] | None]:
    proc = run_git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], timeout=30)
    if proc.returncode != 0:
        return None, _result(
            False,
            "upstream",
            "git_upstream_missing_or_unreadable",
            blocked=True,
            details=_combined_output(proc),
        )
    upstream = proc.stdout.strip()
    if not upstream:
        return None, _result(False, "upstream", "git_upstream_empty", blocked=True)
    return upstream, None


def check_ahead_behind(upstream: str) -> dict[str, Any]:
    proc = run_git(["rev-list", "--left-right", "--count", f"HEAD...{upstream}"], timeout=60)
    output = _combined_output(proc)
    if proc.returncode != 0:
        reason = "git_repository_corrupt" if looks_corrupt(output) else "git_ahead_behind_check_failed"
        return _result(False, "ahead_behind", reason, blocked=True, details=output, upstream=upstream)
    parts = proc.stdout.strip().split()
    if len(parts) < 2:
        return _result(
            False,
            "ahead_behind",
            "git_ahead_behind_unparseable",
            blocked=True,
            details=proc.stdout,
            upstream=upstream,
        )
    ahead, behind = int(parts[0]), int(parts[1])
    if behind:
        return _result(
            False,
            "ahead_behind",
            "git_upstream_behind",
            blocked=True,
            upstream=upstream,
            ahead=ahead,
            behind=behind,
        )
    return _result(True, "ahead_behind", upstream=upstream, ahead=ahead, behind=behind)


def check_remote_reachable(upstream: str) -> dict[str, Any]:
    remote = upstream.split("/", 1)[0] if "/" in upstream else "origin"
    proc = run_git(["ls-remote", "--exit-code", remote, "HEAD"], timeout=60)
    output = _combined_output(proc)
    if proc.returncode != 0:
        reason = "git_repository_corrupt" if looks_corrupt(output) else "git_remote_unreachable"
        return _result(False, "remote", reason, blocked=True, details=output, upstream=upstream, remote=remote)
    return _result(True, "remote", upstream=upstream, remote=remote)


def preflight() -> dict[str, Any]:
    integrity = check_repository_integrity()
    if not integrity.get("ok"):
        return integrity

    upstream, upstream_error = upstream_name()
    if upstream_error:
        return upstream_error

    divergence = check_ahead_behind(upstream)
    if not divergence.get("ok"):
        return divergence

    remote = check_remote_reachable(upstream)
    if not remote.get("ok"):
        return remote

    return _result(
        True,
        "preflight",
        upstream=upstream,
        ahead=divergence.get("ahead", 0),
        behind=divergence.get("behind", 0),
        remote=remote.get("remote"),
    )


def sync_gpt_outputs(message: str, paths: list[str] | None = None, no_push: bool = False) -> dict[str, Any]:
    paths = paths or ["GPT"]
    guard = preflight()
    if not guard.get("ok"):
        guard["committed"] = False
        guard["pushed"] = False
        return guard

    add = run_git(["add", "--", *paths], timeout=120)
    if add.returncode != 0:
        return _result(False, "add", "git_add_failed", blocked=True, details=_combined_output(add), committed=False, pushed=False)

    staged = run_git(["diff", "--cached", "--name-only"], timeout=60)
    if staged.returncode != 0:
        return _result(False, "diff_cached", "git_cached_diff_failed", blocked=True, details=_combined_output(staged), committed=False, pushed=False)
    staged_files = [line for line in staged.stdout.splitlines() if line.strip()]
    if not staged_files:
        return _result(True, "sync", committed=False, pushed=False, staged_files=0)

    commit = run_git(["commit", "-m", message], timeout=180)
    if commit.returncode != 0:
        return _result(False, "commit", "git_commit_failed", blocked=True, details=_combined_output(commit), committed=False, pushed=False)

    rev = run_git(["rev-parse", "--short", "HEAD"], timeout=30)
    commit_hash = rev.stdout.strip() if rev.returncode == 0 else ""

    if no_push:
        return _result(True, "sync", committed=True, pushed=False, staged_files=len(staged_files), commit=commit_hash)

    push = run_git(["push", "--no-verify"], timeout=300)
    if push.returncode != 0:
        return _result(
            False,
            "push",
            "git_push_failed_after_commit",
            blocked=True,
            details=_combined_output(push),
            committed=True,
            pushed=False,
            staged_files=len(staged_files),
            commit=commit_hash,
        )

    return _result(True, "sync", committed=True, pushed=True, staged_files=len(staged_files), commit=commit_hash)


def main() -> int:
    parser = argparse.ArgumentParser(description="Guarded git sync helper for Codex automation.")
    parser.add_argument("--preflight", action="store_true", help="only run the pre-commit checks")
    parser.add_argument("--sync", action="store_true", help="run guarded add/commit/push")
    parser.add_argument("--message", default="codex: sync outputs")
    parser.add_argument("--path", action="append", dest="paths", help="path to stage; can be repeated")
    parser.add_argument("--no-push", action="store_true")
    args = parser.parse_args()

    result = preflight() if args.preflight or not args.sync else sync_gpt_outputs(args.message, args.paths, args.no_push)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
