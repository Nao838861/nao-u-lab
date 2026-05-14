# Claude 記憶配置 判定表 2026-05-14

作成日: 2026-05-14
対応タスク: CMI-003 Protocol / Memory / Skills / Project decision matrix
担当: GPT/Codex

## 目的

Claude 側の記憶改善で、新しい内容を `Protocol / Memory / Skills / Project` のどこに置くべきかを判断する基準を作る。内容のジャンルではなく、未来のエージェントに対する拘束の強さ、更新頻度、実行時裁量、状態管理の必要性で分ける。

今回も Claude 側ファイルは変更していない。この判定表は次フェーズで compiled artifact 候補を選ぶための判断材料である。

## 基本原則

- `Protocol` は行動を拘束する。破ると事故になるものだけ置く。
- `Memory` は判断材料である。証拠、文脈、温度、失敗例、成功例を残す。
- `Skills` は再利用可能な手順である。起動条件と実行手順を持つが、状況判断の余地を残す。
- `Project` は複数セッションにまたがる状態管理である。目的、現状、残課題、履歴を持つ。
- `State / Runtime I/O` は上記4分類とは別に扱う。`inbox_*.md`、`next_tasks_*.jsonl`、`cycle_staging*.md`、`mir_boot_intent.md` などは、記憶本文ではなく実行系の入出力でもある。

## 判定表

| 分類 | 置くもの | 置かないもの | 代表ファイル | 更新条件 | 読まれるタイミング |
|---|---|---|---|---|---|
| Protocol | 破ると事故・誤投稿・権限逸脱・同一性損傷・運用停止につながる拘束 | 1回の失敗、好み、参考例、未検証の提案 | `CLAUDE.md`, `.claude/rules/*.md`, `docs/scheduler_architecture.md`, `docs/slack_rules.md` | 同型失敗が複数回、または一度でも重大事故になる時 | 常時、該当 action 直前 |
| Memory | 判断の根拠、原文に近い feedback、成功/失敗例、外部資料、compiled artifact、索引 | 実行手順そのもの、進行中 task state、守らないと事故る拘束 | `memory/MEMORY.md`, `memory/feedback_*.md`, `memory/dialogue_*.md`, `memory/reference_*.md`, `memory/game_lessons_log.md` | 将来の判断に効く証拠や文脈が増えた時 | 起動時索引、task-time recall |
| Skills | 反復可能な作業手順、分析手順、想起手順、評価手順 | 単なる記録、単発プロジェクト、強制ルール、未検証アイデア | `skills/*/SKILL.md`, `.claude/commands/*.md` | 同じ手順を複数回使う、手順化で実行品質が上がる時 | 該当タスク開始時 |
| Project | 複数セッションにまたがる目的、現状、残課題、意思決定履歴 | 汎用ルール、単発メモ、raw log、実行中 scheduler state | `projects/*.md`, `projects/INDEX.md` | 議論・検討・実装が進んだ時 | そのプロジェクトに関係する作業時 |
| State / Runtime I/O | scheduler や cycle が読む/書く一時状態、append-only event log、起動意図 | 設計判断、汎用知識、compiled memory | `memory/inbox_*.md`, `memory/next_tasks_*.jsonl`, `log/cycle_staging*.md`, `memory/mir_boot_intent.md` | 実行系が更新する。手動編集は原則避ける | scheduler / cycle 実行時 |

## 判定フロー

新しい内容を置く前に、上から順に確認する。

1. 破るとユーザー可視の事故、権限逸脱、誤投稿、運用停止、identity drift になるか。
   - yes: `Protocol` 候補。ただし既存 protocol の修正・統合で済むか先に見る。
   - no: 次へ。
2. 複数セッションにまたがる目的・進捗・未完了作業を持つか。
   - yes: `Project` 候補。
   - no: 次へ。
3. 起動条件と反復手順があり、次回も同じ手順で実行する価値があるか。
   - yes: `Skills` 候補。
   - no: 次へ。
4. 将来の判断材料、証拠、文脈、成功例、失敗例、外部参照として残すものか。
   - yes: `Memory` 候補。
   - no: task log、draft、runtime state、または残さない候補。
5. scheduler や cycle が読んだり書いたりする状態ファイルか。
   - yes: `State / Runtime I/O` として扱い、記憶改善の対象にする前に readers/writers を確認する。

## Protocol に上げる条件

Protocol 化してよい条件:

- 破ると Nao_u の時間を直接奪う、誤投稿する、秘密情報を出す、scheduler を止める、git 衝突を作るなどの事故になる。
- 同型失敗が複数回起きており、Memory として残すだけでは行動が変わらなかった。
- ルールを増やす代わりに、既存ルールの曖昧さを減らす編集である。
- 未来のエージェントに裁量を残すより、拘束した方が明らかに損害が少ない。

Protocol 化しない条件:

- 1回の指摘だけで、まだ同型性が見えていない。
- 「こうすると良さそう」という未検証の提案。
- ゲーム制作の taste や創造判断のように、強制すると探索を狭めるもの。
- 長い背景説明や反省文。これは Memory に置く。

## Memory に置く条件

Memory に置くもの:

- Nao_u の原文に近い feedback。
- 失敗例とその発生文脈。
- 良い判断例とその成立条件。
- 外部資料の分析、reference、shared-reads。
- raw を直接読まなくて済む compiled artifact。
- task-time recall のための index。

Memory 内での昇格:

- raw: 原文、ログ、未整理素材。
- candidate: 使えそうだが判断基準としては未成熟。
- active: 何度か使われ、判断に効く。
- compiled: 複数 raw / feedback / reference から抽象化され、読む価値が高い。
- superseded: もっと良い compiled artifact に畳まれた。
- archived: 歴史的証拠として残すが、通常読まない。

## Skills に置く条件

Skills に置くもの:

- 新ゲーム着手前の分析手順。
- lesson recall の手順。
- shared-reads 投稿前の品質確認手順。
- memory audit や compiled artifact 作成の反復手順。

Skills に置く時の条件:

- description だけで「いつ使うか」が分かる。
- 入力、手順、出力、完了条件がある。
- 手順を実行しても、最後の判断はエージェントが行う。
- 使うたびに改善できる余地がある。

Skills に置かないもの:

- ただの資料集。
- 守らないと事故る禁止事項。
- 一回限りのプロジェクト状況。

## Project に置く条件

Project に置くもの:

- 複数回の議論・検討・実装が続くもの。
- 目的、現状、残課題、検討済み未実装、履歴が必要なもの。
- active / paused / completed の状態を持つもの。
- 関係者や担当が変わっても追える必要があるもの。

Project に置かないもの:

- 汎用的な行動ルール。
- raw feedback の単体。
- scheduler の一時状態。
- 一度きりの作業メモ。

## State / Runtime I/O の扱い

`State / Runtime I/O` は記憶改善で最も誤解しやすい。Markdown や JSONL でも、実行中 script が読む・書くなら、通常の記憶本文として編集しない。

代表:

- `memory/inbox_*.md`: `check_inbox.py` が header 化、復元、overflow 生成を行う。
- `memory/next_tasks_*.jsonl`: `next_tasks.py` の append-only event log。
- `log/cycle_staging*.md`: phase 間受け渡し。
- `memory/mir_boot_intent.md`: Mir 起動入力であり Phase 4 で更新される。
- `.health_check_last_alert.json` など: alert dedup state。

扱い:

- 構造変更しない。
- 手動補正が必要なら、対応 CLI や既存運用経路を優先する。
- compiled artifact 化する場合は、state を source として参照し、別ファイルに要約・索引を作る。

## 既存ファイルへの暫定分類

| ファイル | 暫定分類 | 理由 |
|---|---|---|
| `CLAUDE.md` | Protocol + index | 行動導線。root に長文背景を置かない方針が既にある。 |
| `.claude/rules/slack.md` | Protocol | Slack 行動の拘束。事故防止。 |
| `docs/scheduler_architecture.md` | Protocol | scheduler 変更時の破ると壊れる原則。 |
| `memory/core_mission.md` | Protocol / Identity root | 同一性根幹。変更不可領域。 |
| `memory/MEMORY.md` | Memory index | Level 2 索引、temperature、root 原則。 |
| `memory/operational_index.md` | Memory index / Protocol candidate 集 | action-trigger 別に operational rule を引く。 |
| `memory/feedback_*.md` | Memory | 失敗・指摘・判断材料。Protocol 化は同型反復後。 |
| `memory/sense_prediction_log.md` | Memory raw/candidate | Nao_u feedback の教師データ。 |
| `memory/game_lessons_log.md` | Memory compiled index | game lesson の compiled 入口。 |
| `memory/lessons/*.md` | Memory compiled units | 小単位 lesson。 |
| `skills/genre-deep-analysis/SKILL.md` | Skills | ゲーム分析の反復手順。 |
| `skills/lessons-recall/SKILL.md` | Skills | lesson 想起手順。 |
| `projects/*.md` | Project | 複数セッションの状態と履歴。 |
| `memory/inbox_*.md` | State / Runtime I/O | check_inbox の入力・退避対象。 |
| `memory/next_tasks_*.jsonl` | State / Runtime I/O | append-only task event log。 |
| `memory/mir_boot_intent.md` | State / Runtime I/O + Memory | 起動入力であり記憶でもある。高リスク。 |
| `log/cycle_staging*.md` | State / Runtime I/O | phase 間受け渡し。 |

## 次フェーズへの使い方

次の `CMI-004` では、最初の compiled artifact 候補を選ぶ。候補は `Memory` 分類から選び、`State / Runtime I/O` は source として読むだけにする。

最初の候補として安全なのは以下:

- `feedback_*` のうち、memory-system operation に関係する cluster。
- `game_lessons_log.md` と `lessons/` の read path 検証。
- `external_notes_*` そのものではなく、external_notes から昇格する判断基準の compiled artifact。

避けるもの:

- `mir_boot_intent.md` の直接整理。
- `next_tasks_*.jsonl` の手動編集。
- `CLAUDE.md` root への新ルール追加。
- scheduler code の変更。

## 今回触ったファイル

- `GPT/memory/claude_memory_boundary_matrix_20260514.md`
- `GPT/memory/claude_memory_improvement_state.json`

Claude 側ファイルは変更していない。
