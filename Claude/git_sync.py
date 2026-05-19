"""git_sync.py — 自動git同期（タスクスケジューラ用）

lockfile: scheduler_log.py::git_sync (30分間隔) と本スクリプト (タスクスケジューラ/手動)
の二重実行による rebase 中 commit 脱落 (INC-018系) を防ぐため、`.git/log_git_sync.lock`
を排他取得。取れなければ silent exit 0。詳細は docs/git_branch_protocol.md §5.1。
"""
import subprocess
import os
import sys

REPO = os.path.dirname(os.path.abspath(__file__))

# Resolve .git dir (本リポは .git が REPO の親にあるケースを含む)
_git_dir_proc = subprocess.run(["git", "-C", REPO, "rev-parse", "--git-dir"], cwd=REPO, capture_output=True, text=True)
if _git_dir_proc.returncode != 0:
    print("[git_sync] SKIP: not a git repository")
    sys.exit(0)
_GIT_DIR = _git_dir_proc.stdout.strip()
if not os.path.isabs(_GIT_DIR):
    _GIT_DIR = os.path.join(REPO, _GIT_DIR)

# 1. lockfile 排他取得 (二重実行防止)
#    取れなければ silent exit 0。scheduler_log.py の git_sync ジョブ (30分間隔) と
#    タスクスケジューラ呼び出しが同時に git pull/push を打つと rebase 中 commit 脱落が再発する
_LOCK_PATH = os.path.join(_GIT_DIR, "log_git_sync.lock")
_lock_fh = open(_LOCK_PATH, "a+b")
try:
    if sys.platform == "win32":
        import msvcrt
        try:
            msvcrt.locking(_lock_fh.fileno(), msvcrt.LK_NBLCK, 1)
        except OSError:
            print(f"[git_sync] SKIP: another git_sync holds {_LOCK_PATH}")
            sys.exit(0)
    else:
        import fcntl
        try:
            fcntl.flock(_lock_fh.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError:
            print(f"[git_sync] SKIP: another git_sync holds {_LOCK_PATH}")
            sys.exit(0)
except Exception as e:
    # ロック機構自体が壊れた場合は安全側に倒して exit 0
    print(f"[git_sync] SKIP: lock acquisition failed: {e}")
    sys.exit(0)

# 2. Rebase 検出ガード — rebase 中に commit/push を続けると意図 commit が分岐して
# reachable history から脱落する (knowledge/20260513_auto_sync_rebase_trap.md)
if os.path.isdir(os.path.join(_GIT_DIR, "rebase-merge")) or os.path.isdir(os.path.join(_GIT_DIR, "rebase-apply")):
    print(f"[git_sync] SKIP: rebase in progress ({_GIT_DIR})")
    sys.exit(0)

os.chdir(REPO)

subprocess.run(["git", "pull", "origin", "master", "--rebase"], cwd=REPO)
subprocess.run(["git", "add", "memory/", "log/", "CLAUDE.md"], cwd=REPO)
r = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=REPO)
if r.returncode != 0:
    subprocess.run(["git", "commit", "-m", "Auto sync from Win2"], cwd=REPO)
    subprocess.run(["git", "push", "origin", "master"], cwd=REPO)
