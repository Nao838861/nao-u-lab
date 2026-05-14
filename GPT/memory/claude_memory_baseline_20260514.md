# Claude 記憶システム baseline 2026-05-14

作成日: 2026-05-14
対応タスク: CMI-001 Baseline Claude memory map and risk list
担当: GPT/Codex

## 目的

Claude 側の記憶システムを直接改善する前に、現在の構造、リスク、最初に触るべきでない領域、改善候補を記録する。今回は baseline であり、Claude 側ファイルは変更していない。

## 作業時点の前提

- `Claude/` への直接改善は許可された。
- `Claude/memory/core_mission.md` は Nao_u の明示指示なしでは変更しない。
- スケジューラ挙動、間隔、起動チェーンは今回変更しない。
- 既存 worktree には多数の差分がある。今回の改善作業では、ユーザーや他エージェントの差分を混ぜない。
- `git status` は通常実行では safe.directory で止まるため、確認時は `git -c safe.directory=D:/AI/Nao_u_BOT status --short` を使った。

## 観測した主な構造

### 1. 起動・行動を強く拘束する層

対象:

- `Claude/CLAUDE.md`
- `Claude/.claude/system_identity.md`
- `Claude/.claude/rules/*.md`
- `Claude/memory/core_mission.md`
- `Claude/memory/session_primer.md`
- `Claude/memory/MEMORY.md`
- `Claude/memory/operational_index.md`
- `Claude/docs/scheduler_architecture.md`
- `Claude/docs/slack_rules.md`

性質:

- boot 時または task routing 時に読まれる可能性が高い。
- ここに安易に追記すると、読み取り負荷や行動拘束が増える。
- `core_mission.md` は読み取り専用扱い。

初期方針:

- 直接追記は最後に回す。
- まず下層に compiled artifact を作り、必要なら最小限の pointer だけを追加する。

### 2. scheduler が読む・書く層

対象:

- `Claude/memory/inbox_win.md`
- `Claude/memory/inbox_mac.md`
- `Claude/memory/inbox_win2.md`
- `Claude/memory/inbox_*_overflow_*.md`
- `Claude/memory/mir_boot_intent.md`
- `Claude/memory/next_tasks_log.jsonl`
- `Claude/memory/next_tasks_ash.jsonl`
- `Claude/memory/next_tasks_mir.jsonl`
- `Claude/memory/external_notes_log.md`
- `Claude/memory/external_notes_ash.md`
- `Claude/memory/external_notes_mir.md`
- `Claude/memory/kaizen_tracker.md`
- `Claude/log/cycle_staging*.md`

観測:

- `check_inbox.py` は inbox を読み、処理中は pending file や overflow を作る。
- `scheduler_log.py` は auto-memory の `MEMORY.md` を repo 側 `memory/MEMORY.md` に同期する処理を持つ。
- `autonomous_cycle.sh` は `memory/mir_boot_intent.md` を読み、Phase 4 で書き換える。
- `auto_diary.py` は `external_notes_ash.md`、`next_tasks_ash.jsonl`、`log/cycle_staging.md` を主要な受け渡しに使う。

初期方針:

- これらは実行中プロセスと競合しやすい。直接の構造変更は `CMI-002` で readers/writers をさらに確定してから行う。
- 特に `mir_boot_intent.md`、`next_tasks_*.jsonl`、inbox 系は、改修対象というより「触る時の危険領域」として扱う。

### 3. raw / append-only に近い層

巨大ファイル上位:

| ファイル | サイズ | 観測 |
|---|---:|---|
| `reflections_mac.md` | 6,492,966 bytes | 非常に大きい。直接読む対象としては重い。index はあるが本文が巨大。 |
| `reflections.md` | 582,643 bytes | Win 側の全内省ログ。`reflections_index.md` が入口。 |
| `kaizen_tracker.md` | 449,914 bytes | 進捗・検証の蓄積。scheduler や review 系と絡む可能性が高い。 |
| `external_notes_mir.md` | 428,487 bytes | 未統合素材が残りやすい。 |
| `mir_boot_intent.md` | 408,355 bytes | 起動入力でもあるため特に高リスク。 |
| `external_notes_log.md` | 394,129 bytes | Log 側の外部ノート。 |
| `external_notes_ash.md` | 329,639 bytes | Ash auto_diary の入力。 |
| `beliefs.md` | 167,005 bytes | 詳細側。`beliefs_compact.md` がある。 |
| `l2_dual_index.md` | 153,993 bytes | 役割再確認が必要。 |
| `feedback_tweet_style.md` | 101,834 bytes | feedback 系としては大きい。 |

初期方針:

- これらを「読めばよい」とする設計は維持しない。
- index / compact / compiled artifact による read path を優先する。
- raw は保持し、直接編集・削除・分割は後回しにする。

### 4. feedback / lesson の compiled 層

対象:

- `Claude/memory/feedback_index.md`
- `Claude/memory/game_dev_index.md`
- `Claude/memory/game_lessons_log.md`
- `Claude/memory/lessons/*.md`
- `Claude/memory/sense_prediction_log.md`
- `Claude/memory/dialogue_micromanagement_20260504.md`
- `Claude/memory/feedback_few_rules_big_effect.md`

観測:

- `CLAUDE.md` はゲーム制作時に `game_lessons_log.md` 冒頭の抽象ルール R-A から R-I を読むよう指示している。
- `sense_prediction_log.md` はユーザーフィードバックを教師データとして扱う思想と直結している。
- `lessons/` は小さな単位に分割されており、compiled artifact 化の良い先行例に見える。

初期方針:

- 最初の compiled artifact 候補はこの層から選ぶのが安全。
- 既に index と lesson 分割があるため、破壊的 migration ではなく「read path 検証」や「重複 cluster の canonical 化」から入れる。

### 5. reference / shared-reads 層

対象:

- `Claude/memory/shared_reads/*.md`
- `Claude/memory/shared_reads/README.md`
- `Claude/memory/references_external_index.md`
- `Claude/memory/reference_*.md`
- `Claude/knowledge/*.md`

観測:

- shared_reads は比較的新しく、ファイル数もまだ扱いやすい。
- external_notes から reference / knowledge / shared_reads への昇格経路が manage 層の重要課題に見える。

初期方針:

- `external_notes_*` からの昇格判定をいきなり自動化しない。
- まず「どの形式に昇格すべきか」の decision matrix を作る。

## 初期リスク分類

### 高リスク

- `Claude/memory/core_mission.md`: identity root。明示指示なしに変更不可。
- `Claude/memory/mir_boot_intent.md`: 巨大であり、Mir 起動入力でもある。
- `Claude/memory/inbox_*.md`: scheduler と check_inbox が処理する。
- `Claude/memory/next_tasks_*.jsonl`: scheduler / next_tasks.py と絡む構造状態。
- `Claude/memory/kaizen_tracker.md`: 進捗管理と検証状態が混在し、同時更新されやすい。
- `Claude/scheduler_*.py`、`Claude/autonomous_cycle.sh`、`Claude/auto_diary.py`: 記憶改善のために安易に触ると運用事故になる。

### 中リスク

- `Claude/memory/MEMORY.md`: 起動・recall の入口。変更効果が大きいが読み取り負荷も増えやすい。
- `Claude/memory/session_primer.md`: 起動時 working set。古い状態が混ざっている可能性があるが、直接改修は慎重に行う。
- `Claude/memory/operational_index.md`: 行動ルールの入口。追加しすぎると protocol 過多になる。
- `Claude/memory/game_dev_index.md`: ゲーム制作 read path の要。改善価値は高いが、既存設計の意図確認が必要。
- `Claude/memory/feedback_index.md`: feedback の圧縮入口。重複 cluster の発見に使える。

### 低リスクから始めやすい

- 新規 GPT 側 audit artifact。
- 新規 Claude 側の compiled artifact 草案。ただし既存 index への接続は後段で最小化する。
- `Claude/memory/lessons/` の read path 調査。
- `Claude/memory/shared_reads/README.md` や reference index の参照状況調査。

## manage 層の暫定ボトルネック上位 5 件

1. raw / compiled の境界が弱い。`external_notes_*`、`reflections*`、`feedback_*` が「保存された」状態から「判断に効く形」へ昇格する基準が揺れやすい。
2. 起動時入口が複数あり、何が must-read で何が task-time read かが混ざりやすい。`CLAUDE.md`、`MEMORY.md`、`session_primer.md`、index 類の責務再確認が必要。
3. scheduler-written file と memory artifact が同じ `Claude/memory/` に混在している。人間が見れば記憶だが、実行系から見ると状態ファイルでもあるものがある。
4. feedback は大量に分割されているが、重複 cluster を canonical に畳む lifecycle がまだ弱い。`feedback_index.md` は入口だが、退役・superseded の規約が明確ではない。
5. 良い例と失敗例の扱いが対称でない可能性がある。`sense_prediction_log.md` に教師データを蓄積する思想はあるが、成功判断の compiled path を確認する必要がある。

## 次に実行するべきこと

次タスクは `CMI-002: 起動時に読むファイルと scheduler が書くファイルを棚卸しする`。

具体的には、以下を readers/writers ごとに表にする。

- `check_inbox.py`
- `scheduler_log.py`
- `scheduler_ash.py`
- `auto_diary.py`
- `autonomous_cycle.sh`
- `next_tasks.py`
- `memory_activate.py`
- `memory_compile.py`
- `memory_search.py`
- `health_check.py`
- `infra_health_check.py`

この棚卸しが終わるまで、`mir_boot_intent.md`、`next_tasks_*.jsonl`、`inbox_*.md`、scheduler code は改善対象として編集しない。

## 今回触ったファイル

- `GPT/memory/claude_memory_baseline_20260514.md`
- `GPT/memory/claude_memory_improvement_state.json`

Claude 側ファイルは変更していない。
