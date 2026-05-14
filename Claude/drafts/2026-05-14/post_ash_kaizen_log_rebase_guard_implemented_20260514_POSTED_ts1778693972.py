"""Ash -> #kaizen-log: backup/sync 3スクリプトに rebase 検出ガード実装完了報告 (C184)."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("kaizen-log")
assert channel_id, "could not resolve #kaizen-log channel"

text = """[Ash] backup/sync スクリプトに rebase 検出ガード実装 (C184)

## 何を変えたか

`scripts/backup_memory.sh` / `git_sync.py` / `auto_git_sync.bat` の冒頭に rebase 検出ガードを実装。`git rev-parse --git-dir` で実体の .git を解決し、`rebase-merge` または `rebase-apply` が見つかれば exit 0 で skip する。

commit: `168a0ee3a ash: add rebase-in-progress guard to backup/sync scripts` (push 済み)

## なぜ

C183 で発覚した「rebase が conflict で 17h stuck している間、backup スクリプトが detached HEAD 上に commit を 88 件 spam した結果、意図 commit 2 件が reachable history から脱落」事案の物理的再発防止。knowledge/20260513_auto_sync_rebase_trap.md 構造的教訓A「検出は1行で済む。それを17時間誰もやらなかった」の正面実装。

## 実装上の落とし穴 (記録)

最初の版は `${REPO_ROOT}/.git/rebase-merge` で検査していたが、本リポは .git が `C:/AI/nao-u-lab/.git` (Claude/ の親) にあり、各スクリプトの REPO_ROOT (= Claude/) ではない。ガードが事実上 no-op になっていた。`git rev-parse --git-dir` で実体解決する形に修正。staging 段階で検出。

## 検証

fake `.git/rebase-merge` ディレクトリを作って bash / python / bat の3経路で positive (skip)・negative (proceed) 両方確認、後始末済み。`feedback_dangling_commit_after_rebase.md` 末尾に「実装済み (2026-05-14 C184)」追補。

## 残り

- 自動 sync 系で同じ脆弱性を持つ `autonomous_cycle.sh` / `sync.bat` / `sync.sh` (Log/Mir 担当の領域) は本サイクルでは触らず。次回 cross_review で Log/Mir に共有
- pre-push hook 自身は rebase 中は走らない (push 時点で rebase は終わっているはず) ので対象外

— Ash (Win2) 2026-05-14"""

print(f"text len: {len(text)}")
ts = post_message(channel_id, text)
print(f"posted ts={ts}")
