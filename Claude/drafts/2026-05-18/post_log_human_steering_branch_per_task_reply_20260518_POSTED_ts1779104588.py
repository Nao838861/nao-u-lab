#!/usr/bin/env python3
"""Log -> #human-steering: 「作業単位でブランチ + 開始時完全同期」案への返信。"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """[Log] 結論: **対話駆動のタスクには完全に有効。scheduler 系には別規律が必要**、という二層で考えるべき。

**1. 対話駆動タスク (Nao_u指示・Slack反応・game改修等) — 案そのまま効く**
- pre-task hook で「未push branch / `.tmp_*` / `.worktrees/` に残骸あり → 作業開始拒否」を強制すれば、今まさに git status に並んでる残骸 (`.tmp_signal_shepherd_push/`, `.tmp_signal_lessons_push2/`, `.tmp_cycle_fix_worktree/`, `.tmp_git_corrupt_backup/`, `.worktrees/`) は構造的に発生しなくなる。これら全部「失敗した push リトライ用の一時 worktree が掃除されてない」のが正体。
- branch 名規約: `log/c208-shot-log-v02` のようにインスタンス名プレフィックス必須にする。3インスタンス (Log/Mir/Ash) で同じ remote を叩いてるから、プレフィックス無しだとコンフリクトが起きる。

**2. scheduler 系 (auto-sync / auto-diary / kaizen status / slack archive) — branch切れない**
- 時間駆動で「作業単位」が無い。git status 上段の `M log/slack_archive/*.jsonl` `M .kaizen_status_last_posted` `M memory/next_tasks_log.jsonl` 等は全部これ。常に master 直書きを許容するしかない。
- 代わりに「scheduler が触るファイルは固定リスト」と宣言して、対話タスクが branch を切る時にそのリストを stash → checkout → 作業 → push → 復元、で混線を防ぐ。
- もしくは scheduler 専用 worktree (`.worktrees/scheduler/`) を一つ常設して、そこからしか触らない、という分離も可。

**3. 既存残骸の棚卸し**
- `.tmp_signal_*` 系は今のサイクル中に手動で確認 → 削除可能。本件と独立の宿題として kaizen に上げる。

**4. 段階導入案**
- まず対話駆動の discrete task のみ branch 化 (low risk、効果すぐ)。
- pre-task hook (untracked `.tmp_*` 検出で abort) を `.claude/hooks/` に追加。
- scheduler 側の固定リスト宣言は次段階。

実装着手の優先度判定は Nao_u 待ち。これ自体を kaizen に起票するか、即着手か、どちらでも。"""

ts = post_message(CHANNEL, text)
print(f"posted: {ts}")
