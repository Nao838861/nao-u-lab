"""git_sync.py — 自動git同期（タスクスケジューラ用）"""
import subprocess
import os

REPO = r"C:\AI\nao-u-lab"
os.chdir(REPO)

subprocess.run(["git", "pull", "origin", "master", "--rebase"], cwd=REPO)
subprocess.run(["git", "add", "memory/", "log/", "CLAUDE.md"], cwd=REPO)
r = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=REPO)
if r.returncode != 0:
    subprocess.run(["git", "commit", "-m", "Auto sync from Win2"], cwd=REPO)
    subprocess.run(["git", "push", "origin", "master"], cwd=REPO)
