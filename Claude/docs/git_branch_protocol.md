# Git ブランチ運用プロトコル (Log/Win 用 v0)

由来: 2026-05-19 00:07 #human-steering Nao_u broadcast「各作業単位でブランチを切って、ローカルとリモートが一致しなければ同期完了まで作業開始しない、終了時には確実にpush仕切ってクリーンになるまで続ける」を Log (Win) 環境で実装するための最小骨格。Mir/Ash は別文書で各自実装。

関連:
- [scheduler_architecture.md](scheduler_architecture.md) — 定期実行と git_sync ジョブの位置づけ
- [scheduler_incidents.md](scheduler_incidents.md) — INC-018 等の同期障害履歴
- `knowledge/20260513_auto_sync_rebase_trap.md` — rebase 中 commit が reachable history から脱落する罠

## 1. 作業開始時の3ステップ

1. **fetch + 同期確認**: `git fetch origin && git status -uno` — `Your branch is up to date with 'origin/master'` を観測するまで開始しない。差分があれば `git pull --rebase origin master` を先に通す
2. **作業中の未push commit がないか確認**: `git log @{u}..HEAD --oneline` が空であること。空でなければ既存ブランチに残作業があるサインなので先に片付ける
3. **作業用ブランチを切る**: `git checkout -b log/<task>` または `git checkout -b log/c<cycle>-phase<n>-<date>T<HHMM>`。作業中に scheduler_log.py の git_sync ジョブが master に commit してもブランチ側は影響を受けない構造を作る

## 2. 作業終了時の3ステップ

1. **commit**: 改修系統ごとに分離する (CLAUDE.md 厳守事項)。`game:` (game/ 配下のゲーム改修) / `rule:` (CLAUDE.md, .claude/rules/, memory/feedback_*) / `log:` (log/, memory/atoms/, knowledge/) / `codex:` (../GPT/ 配下) を prefix に使う。1コミットに複数系統を混ぜない
2. **master へ merge + push**: `git checkout master && git merge --ff-only log/<task> && git push origin master`。fast-forward 不可なら `git pull --rebase` を挟む。push 失敗時は INC-006/INC-018 系の調査に入る
3. **ブランチ削除**: `git branch -d log/<task>` (削除拒否されたら未 merge があるサイン)。最後に `git status -uno` がクリーン (`nothing to commit, working tree clean`) であることを観測

## 3. 命名規約

- **サイクル内タスク**: `log/c<cycle>-phase<n>-<task>-<date>T<HHMM>` 例: `log/c212-phase4-protocol-20260519T2335`
- **横断タスク**: `log/<task>` 例: `log/lockfile-prototype`、`log/git-branch-protocol-draft`
- **緊急復旧**: `log/rescue-<date>T<HHMM>` 例: `log/rescue-20260517T2030` (C209 git 破損復旧と同型)
- prefix `log/` は Log (Win) 固有。Mir は `mir/`、Ash は `ash/`、Codex は `codex/` を使う (インスタンス間の押しつけ事故防止)

## 4. Codex worktree との分離

- Codex (../GPT 配下) は同一リポジトリの worktree ではなく **別ディレクトリ・別 git リポジトリ** として運用 (D:/AI/Nao_u_BOT/.git が Claude 側、../GPT は Codex 側の独立リポジトリ)
- Log (Claude) のブランチ操作は `D:/AI/Nao_u_BOT/Claude/` 配下の作業のみを対象とする。../GPT 配下のファイルは Codex 側のサイクルで処理されるため Log 側のブランチには含めない
- git_sync.py / scheduler_log.py::git_sync の add 対象は `memory/`, `log/`, `log/slack_archive/`, `docs/`, `CLAUDE.md` に限定済 (../GPT は対象外)
- Codex 側で git の異常 (rebase 中, conflict marker 残置) が検出されたら #human-steering で報告し、Log 側からは手を出さない

## 5. Win 固有事情

### 5.1 lockfile 前提

- Log (Win) には scheduler_log.py の git_sync ジョブ (30分間隔) と root の `git_sync.py` (タスクスケジューラ呼び出し用、現在 disable 中) と手動実行が並列実行されうる経路がある
- これらが同時に `git pull --rebase` / `git push` を打つと INC-018 系の同期事故 (rebase 中 commit 脱落、conflict marker 残置) が再発する
- 対策: `git_sync.py` 冒頭で `.git/log_git_sync.lock` を msvcrt.locking で排他取得。取れなければ silent exit 0 (エラー扱いしない)
- scheduler_log.py::git_sync 関数本体への組み込みは次サイクル以降 (PID lock で多重起動は防げているため scope 優先度低)

### 5.2 partial clone 解除確認

- C209 (2026-05-17) で `git fsck` が loose object corruption を検出した経緯あり。partial clone (`promisor.advertise` 設定) を併用していると corruption リカバリ手段が制限される
- 作業開始時に `git config --get remote.origin.promisor` が空であること (= partial clone でないこと) を確認。設定が残っていたら `git config --unset remote.origin.promisor` で剥がす
- Win タスクスケジューラの scheduled task 4本 (現在 disable 中) を再有効化する前提条件: lockfile 化完了 + partial clone 設定が完全に剥がれていること

### 5.3 ブランチ運用の自己適用 (dogfood)

- 本プロトコル自体の整備サイクル (C212 Phase 4) もブランチ `log/c212-phase4-protocol-20260519T2335` で実施。プロトコルが実運用に乗ることを最初のサイクルで確認する
- 失敗パターン (push 失敗、merge 不可、削除拒否) は scheduler_incidents.md に INC として追記すること
