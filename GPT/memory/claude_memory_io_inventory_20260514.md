# Claude 記憶ファイル I/O 棚卸し 2026-05-14

作成日: 2026-05-14
対応タスク: CMI-002 Inventory startup-read and scheduler-written memory files
担当: GPT/Codex

## 目的

Claude 側の記憶改善を始める前に、起動時に読むファイル、scheduler が書くファイル、LLM prompt 経由で更新されるファイルを分ける。これにより、次フェーズで「安全に編集できる compiled artifact」と「実行系と競合する状態ファイル」を混同しないようにする。

今回も Claude 側ファイルは変更していない。

## 重要な結論

- `Claude/memory/` には、記憶本文だけでなく scheduler state、inbox、起動意図、append-only task log が同居している。
- 直接編集してよい順序は、compiled artifact 草案 → index pointer → scheduler-written file の順である。
- `inbox_*.md`、`next_tasks_*.jsonl`、`mir_boot_intent.md`、`cycle_staging*.md` は「記憶」に見えても実行系の I/O であり、構造変更は後回しにする。
- `MEMORY.md` は Log scheduler が auto-memory から repo 側へ同期するため、手動編集時は上書き経路を意識する必要がある。

## 起動時・手動作業時の read path

| ファイル | 読む主体 | 役割 | 変更リスク |
|---|---|---|---|
| `Claude/CLAUDE.md` | Claude セッション起動時、人間/agent | 最上位の行動導線 | 高。広い行動拘束になるため、追記は最小限にする。 |
| `Claude/memory/core_mission.md` | `CLAUDE.md` 経由 | identity root | 最高。Nao_u 明示指示なしに変更しない。 |
| `Claude/memory/session_primer.md` | 起動時 working set | 現在の重要事項、起動直後の行動 | 中から高。古い情報が混ざりやすいが、直接編集は慎重に行う。 |
| `Claude/memory/MEMORY.md` | 起動時 recall index、`memory_activate.py` | 記憶索引、temperature 付き導線 | 中から高。Log scheduler の auto-memory 同期で上書きされうる。 |
| `Claude/memory/operational_index.md` | task routing | Slack、投稿、運用ルールの入口 | 中。追記しすぎると Protocol 過多になる。 |
| `Claude/memory/game_dev_index.md` | ゲーム制作時 | game feedback / lesson 入口 | 中。改善価値は高い。 |
| `Claude/memory/feedback_index.md` | feedback 確認時 | 行動フィードバック圧縮入口 | 中。重複整理の候補。 |
| `Claude/memory/game_lessons_log.md` | `CLAUDE.md` のゲーム制作導線 | R-A〜R-I と M/S/D/X lesson index | 中。既に compiled 層として機能している。 |

## scheduler / script 別 I/O

### `check_inbox.py`

読む:

- `memory/inbox_win.md`
- `memory/inbox_mac.md`
- `memory/inbox_win2.md`
- `memory/_pending_overflow_<box>.txt`
- `.inbox_check_error_state.json`

書く:

- `log/inbox_check.log`
- `.inbox_check_error_state.json`
- `memory/inbox_<box>.md` の header 化、復元、pending marker prepend
- `memory/inbox_<box>_overflow_<timestamp>.md`
- `memory/_pending_overflow_<box>.txt`
- `memory/_inbox_pending_<box>.md`

扱い:

- 実行中に内容を退避・復元するため、改善作業で直接整形しない。
- overflow は未消化 raw として扱い、削除や改名はしない。

### `scheduler_log.py`

読む:

- `scheduler_log_config.json`
- `.recommended_last_success`
- `.slack_export_last_success`
- `.kaizen_status_last_posted`
- `.weekly_review_last_triggered`
- `Path.home()/.claude/projects/<encoded>/memory/MEMORY.md`
- conflict scan 対象として `memory/`、`log/nao_u_live.md`、`log/cycle_staging_*.md`、`CLAUDE.md`、`docs/`、`projects/`、`knowledge/`、`.claude/`

書く:

- `.scheduler_log.lock`
- `log/scheduler_log.log`
- `memory/MEMORY.md` への auto-memory copy
- `.recommended_last_success`
- `.slack_export_last_success`
- `.kaizen_status_last_posted`
- `.weekly_review_last_triggered`
- git add 対象: `memory/`、`log/`、`log/slack_archive/`、`docs/`、`CLAUDE.md`

LLM prompt 経由で更新されうるもの:

- `memory/external_notes_log.md` の未統合エントリへの `[統合済 YYYY-MM-DD]` marker
- `beliefs.md`、日記、projects、docs、knowledge など

扱い:

- `memory/MEMORY.md` は外部 auto-memory からコピーされる経路があるため、手動改善は上書きリスクを確認してから行う。
- Log の auto cycle prompt は `external_notes_log.md` の統合を LLM に指示している。直接構造変更より、まず未統合・統合済 marker の状態を調べる。

### `scheduler_ash.py`

読む:

- `scheduler_ash_config.json`
- `.scheduler_ash.pid`
- `scheduler_ash.py` と `claude_runner.py` の hash

書く:

- `.scheduler_ash.pid`
- `log/scheduler_ash.log`

起動する主な scripts:

- `check_slack.py --box win2`
- `check_inbox.py --box win2`
- `check_dm.py --wake`
- `git_sync.py`
- `auto_diary.py`
- `health_check.py --alert --instance ash`
- `infra_health_check.py --log`
- `check_scheduler_health.py --instance ash --slack`
- `next_tasks.py` は `auto_diary.py` 側から利用される。

扱い:

- scheduler 本体は job orchestration が主で、記憶本文の直接編集は少ない。
- 実際の memory read/write は起動先 script に分散している。

### `auto_diary.py`

読む:

- `log/daily_diary_ash.md`
- `memory/next_tasks_ash.jsonl` (`next_tasks.py pending`)
- `memory/external_notes_ash.md` を LLM prompt 経由で読むよう指示
- `memory/beliefs.md` を LLM prompt 経由で読むよう指示
- `log/twitter_recommended_*.txt`
- `log/cycle_staging.md`

書く:

- `log/cycle_staging.md`
- `.auto_diary_last_run`

LLM prompt 経由で更新されうるもの:

- `memory/external_notes_ash.md` の統合 marker
- `memory/beliefs.md`
- `projects/`
- `memory/`
- `log/`
- `next_tasks_ash.jsonl` (`next_tasks.py add/done/check_cycle`)

扱い:

- `log/cycle_staging.md` は phase 間受け渡し。記憶改善の対象ではなく、実行中状態として扱う。
- `external_notes_ash.md` は auto_diary の重要入力であり、構造変更は慎重に行う。

### `autonomous_cycle.sh`

読む:

- `memory/mir_boot_intent.md`
- `memory/external_notes_mir.md` を LLM prompt 経由で読むよう指示
- `memory/MEMORY.md` を LLM prompt 経由で読むよう指示
- `log/daily_diary_mir.md`
- `log/cycle_staging_mir.md`
- `memory/next_tasks_mir.jsonl` (`next_tasks.py pending`)

書く:

- `log/cycle_staging_mir.md`
- `memory/mir_boot_intent.md` を LLM prompt 経由で書き換えるよう指示
- `memory/next_tasks_mir.jsonl` (`next_tasks.py check_cycle` など)
- git add 対象: `memory/`、`log/`、`CLAUDE.md`、`docs/`、`knowledge/`

扱い:

- `mir_boot_intent.md` は巨大かつ起動入力なので、今後の改善では最初に触らない。
- Mir は毎回新規起動で prompt が重いため、read path の整理価値は大きいが、まず依存関係をさらに確認する。

### `next_tasks.py`

読む:

- `memory/next_tasks_<instance>.jsonl`

書く:

- `memory/next_tasks_<instance>.jsonl`

書き込み形式:

- append-only event log。
- `add / done / skip / viewed / cycle_check / escalated` を追記する。

扱い:

- 手動で編集しない。補正が必要な場合も CLI 経由を優先する。
- 記憶本文ではなく scheduler / cycle state として扱う。

### `memory_activate.py`

読む:

- `.memory_search.db`
- `memory/MEMORY.md`
- `memory/mir_boot_intent.md`
- `memory/session_primer.md`
- `log/nao_u_live.md`
- `log/slack_archive/nao-u.jsonl`

書く:

- `log/stc_rescue.log`
- `.stc_last_trigger`

扱い:

- read path 検証に有用。
- `MEMORY.md` の temperature tag や always-loaded 扱いに依存するため、`MEMORY.md` 改修前に影響確認が必要。

### `memory_compile.py`

読む:

- `log/slack_archive/`
- `memory/`
- `docs/`
- `projects/`
- `対話ログ/`

書く:

- 通常は stdout の compile view。ファイル書き込みは主要動作ではない。

扱い:

- compiled artifact 候補を作る前の調査ツールとして使える。
- ただし結果をそのまま記憶化せず、出典と用途を明示して別 artifact にする。

### `memory_search.py`

読む:

- `memory/**/*.md`
- `log/**/*.md`
- `log/**/*.log`
- `log/slack_archive/**/*.jsonl`
- `対話ログ/**/*.md`

書く:

- `.memory_search.db`
- SQLite 内の `search_log`

扱い:

- 検索 index 作成・検索ログ蓄積のため、memory file そのものは変更しない。
- 大量ファイルを読むため、read path の実測に使える。

### `health_check.py`

読む:

- `.scheduler_log.lock`
- `.scheduler_ash.pid`
- `log/scheduler_log.log`
- `log/scheduler_ash.log`
- `scheduler_log_config.json`
- `scheduler_ash_config.json`
- `scheduler_log.py`
- `scheduler_ash.py`
- git status / git log

書く:

- `.health_check_last_alert.json`
- log rotation 時に scheduler log archive と現行 log

扱い:

- scheduler と git 状態の監視。memory 改善の verification candidate だが、実行すると log rotation が起きうるため注意。

### `infra_health_check.py`

読む:

- `.infra_health_state.json`
- `.scheduler_ash.pid`
- `.scheduler_log.lock`
- `.twitter_access_error_state.json`
- `.diary_dedup_cache.json`
- `scheduler_ash_config.json`
- `scheduler_log_config.json`
- `watchdog_log.bat`
- `watchdog_win2.bat`
- `log/scheduler_ash.log`
- `log/scheduler_log.log`

書く:

- `.infra_health_state.json`
- `log/infra_health_check.log`

扱い:

- infra state の監視。memory artifact とは分けて扱う。

### `check_scheduler_health.py`

読む:

- `.scheduler_log.lock`
- `.scheduler_ash.pid`
- `scheduler_log_config.json`
- `scheduler_ash_config.json`
- `log/scheduler_log.log`
- `log/scheduler_ash.log`
- `log/external_search.log`
- git log

書く:

- `.scheduler_health_last_alert.json`

扱い:

- scheduler health と external_search の鮮度確認。改善検証には使えるが、alert dedup state を書く。

## ファイルロール分類

### 直接編集を避ける

- `memory/inbox_*.md`
- `memory/inbox_*_overflow_*.md`
- `memory/_inbox_pending_*.md`
- `memory/_pending_overflow_*.txt`
- `memory/next_tasks_*.jsonl`
- `memory/mir_boot_intent.md`
- `log/cycle_staging*.md`
- `.scheduler_*.pid` / `.scheduler_log.lock`
- `.health_check_last_alert.json`
- `.scheduler_health_last_alert.json`
- `.infra_health_state.json`

理由:

- 実行中プロセスが読む・書く。
- append-only state や transient state であり、記憶本文とは性質が違う。

### 慎重に pointer だけ触る候補

- `CLAUDE.md`
- `memory/MEMORY.md`
- `memory/session_primer.md`
- `memory/operational_index.md`
- `memory/game_dev_index.md`
- `memory/feedback_index.md`

理由:

- read path への影響が大きい。
- 一方で、compiled artifact への導線を作るには最終的に触る可能性がある。

### compiled artifact を作りやすい候補

- `memory/lessons/`
- `memory/game_lessons_log.md`
- `memory/shared_reads/`
- `memory/reference_*.md`
- 新規 `memory/*_compiled_*.md` 草案
- GPT 側 audit artifact

理由:

- 実行中 state ではない。
- raw source を残したまま、read path の改善を検証しやすい。

## 次の判断

次は `CMI-003: Protocol / Memory / Skills / Project decision matrix` を作る。

この判定表では、以下を明確にする。

- `Protocol`: 破ると incident またはユーザー可視の運用事故になるもの。
- `Memory`: 判断の根拠・文脈・証拠。
- `Skills`: 実行手順。状況判断は残す。
- `Project`: 局所的な目的、状態、次アクション。

判定表ができるまで、`CLAUDE.md` や `MEMORY.md` への新ルール追加は避ける。

## 今回触ったファイル

- `GPT/memory/claude_memory_io_inventory_20260514.md`
- `GPT/memory/claude_memory_improvement_state.json`

Claude 側ファイルは変更していない。
