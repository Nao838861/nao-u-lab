---
name: nao-u-lab-backup-committer-hazard
description: "nao-u-lab リポジトリでは外部の backup_memory プロセスが作業中の worktree に「backup: mir memory」commit を差し込む — commit 後は即 push し、リモート先端を必ず検証する"
metadata: 
  node_type: memory
  type: project
  originSessionId: d3036457-1a3a-4fd0-82e5-cf4c15d26f80
  modified: 2026-07-22T19:44:02.582Z
---

nao-u-lab リポジトリ（Mac/Mir）では、スケジューラの backup_memory プロセスが git 操作のタイミングで「backup: mir memory (15 files)」という commit を**現在アクティブな worktree のブランチに**差し込む（2026-07-23 に観測）。`git -c core.hooksPath=/dev/null` でも防げない = git hook ではなく外部プロセス。しかも worktree 内ではリポジトリルート直下 `memory_backup/`（誤パス、正は `Claude/memory_backup/`）にファイルを復活させるため、そのままマージすると汚染になる。

**Why:** ブランチに意図しない commit が混ざると PR が汚れ、誤パスのバックアップファイルが master に入り込む。

**How to apply:** feature ブランチで commit したら (1) 即 push、(2) `git log origin/<branch>` でリモート先端が自分の commit だけか検証、(3) 混入していたら reset ではなく「master から新ブランチ + cherry-pick + push + 旧リモートブランチ削除」で作り直す（force-push はしない）。作業後の `git status` の .backup_info / memory_backup 差分はフック副作用なので `git checkout -- .` で捨ててよい。
