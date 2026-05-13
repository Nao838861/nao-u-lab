"""git_sync.py — 自動git同期（タスクスケジューラ用）"""
import subprocess
import os
import sys

REPO = os.path.dirname(os.path.abspath(__file__))

# Rebase 検出ガード — rebase 中に commit/push を続けると意図 commit が分岐して
# reachable history から脱落する (knowledge/20260513_auto_sync_rebase_trap.md)
# 本リポは .git が REPO の親 (C:/AI/nao-u-lab/.git) にあるため、git rev-parse で実体解決する
_git_dir_proc = subprocess.run(["git", "-C", REPO, "rev-parse", "--git-dir"], cwd=REPO, capture_output=True, text=True)
if _git_dir_proc.returncode == 0:
    _git_dir = _git_dir_proc.stdout.strip()
    if not os.path.isabs(_git_dir):
        _git_dir = os.path.join(REPO, _git_dir)
    if os.path.isdir(os.path.join(_git_dir, "rebase-merge")) or os.path.isdir(os.path.join(_git_dir, "rebase-apply")):
        print(f"[git_sync] SKIP: rebase in progress ({_git_dir})")
        sys.exit(0)

os.chdir(REPO)

subprocess.run(["git", "pull", "origin", "master", "--rebase"], cwd=REPO)
subprocess.run(["git", "add", "memory/", "log/", "CLAUDE.md"], cwd=REPO)
r = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=REPO)
if r.returncode != 0:
    subprocess.run(["git", "commit", "-m", "Auto sync from Win2"], cwd=REPO)
    subprocess.run(["git", "push", "origin", "master"], cwd=REPO)
