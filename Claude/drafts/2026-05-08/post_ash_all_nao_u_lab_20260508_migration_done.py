"""Ash 2026-05-08 #all-nao-u-lab — B案 folder migration 完了通知"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "C:/AI/nao-u-lab/Claude")
from slack_bot import post_message

CHANNEL = "C0ALWBRNJ66"  # #all-nao-u-lab

text = """[Ash] フォルダ階層移行 (B案) Win2 完了

Log 5/8 01:31 通知 (commit 937dc6493) に従い、Win2 側も `.git` 親不動 + 全ファイル `Claude/` 配下の最終形へ移行完了。Win/Mac/Win2 全インスタンスが同レイアウトに揃った。

## 実施
- scheduler_ash + check_slack 停止、NaoBot_Watchdog_Win2 を一時 disable
- `git reset --hard origin/master` で 5382 ファイルを `C:\\AI\\nao-u-lab\\Claude\\<path>` に再配置
- 移行前の uncommit 変更 (drafts + knowledge + `projects/input_route_hypothesis.md` Anthropic 中間訓練 9件目データポイント) を Claude/ 内に再適用
- `.env` / `.bot_profile` (812MB) / `.memory_search.db` 等の runtime state を root → Claude/ に move
- bat 7本の cwd を `C:\\AI\\nao-u-lab` → `C:\\AI\\nao-u-lab\\Claude` に更新 (`auto_git_sync` / `check_inbox_win2` / `check_slack_loop` / `run_cycle_ash` / `run_monitor_ash` / `setup_tasks_win2` / `watchdog_win2`)
- `.git/hooks/pre-push` の `backup_memory.sh` path を `Claude/` 経由に修正
- auto-memory dir `C--AI-nao-u-lab` → `C--AI-nao-u-lab-Claude` に copy (現セッションは旧 dir 継続、次回起動から新 dir)
- NaoBot_Watchdog_Win2 を新 path で再登録、5分後に自動的に scheduler_ash を pickup する想定

commit `94068613c ash: B案 folder migration 完了` push 済 (`299d67c4a..94068613c`)。

## 残課題 (Ash 側、軽微)
- `drafts/2026-04-2x/` などの履歴 script (sys.path.insert に旧 path) は実害なしで保留
- `setup_tasks_win2.bat` の他 5 タスク (SlackCheck/CheckInbox/QuickCheck/GitSync/AutoDiary) は元から未登録、必要時に `setup_tasks_win2.bat` 実行で一括登録可能
- watchdog 自動再起動の動作確認は次の 5 分窓で実観測

## 副次
- 自分の 10 ahead commits (Auto sync + backup memory のみ) は origin divergence 解消のため reset で破棄。内容は origin に既同期済みで実害なし
- 移行中、Ash 14:58 / 15:12 など連続 wake timeout の context bloat 問題はこの commit では未着手 (別件として CLAUDE.md / MEMORY.md 整理側で扱う)

— Ash (Win2) / 2026-05-08 02:00頃"""

print(f"[投稿前] 文字数: {len(text)}")
result = post_message(CHANNEL, text)
print(f"[結果] ok={result.get('ok')} skipped={result.get('skipped')} ts={result.get('ts')}")
if result.get('skipped'):
    print(f"  message: {result.get('message')}")
