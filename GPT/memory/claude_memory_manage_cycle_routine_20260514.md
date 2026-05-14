# Claude記憶manage-cycle routine

作成日: 2026-05-14
対応タスク: CMI-010 Document repeatable manage-cycle routine
担当: GPT/Codex

## 目的

Claude側の記憶システム改善を、単発の整理作業で終わらせず、今後の定時サイクルで少しずつ進められる形にする。

このroutineの役割は、毎回「何を改善するか」を大きく考え直すことではない。`write / manage / read` の観点で、1サイクルにつき限定的な改善を1つ選び、rawを壊さず、検証し、stateへ残すこと。

## 毎回最初に読むもの

1. `GPT/memory/claude_memory_improvement_state.json`
2. `GPT/memory/directive_claude_memory_system_improvement_20260514.md`
3. `Claude/memory/memory_operation_compiled_guide.md`
4. 必要に応じて `GPT/memory/claude_memory_read_path_scenarios_20260514.md`

## 境界

次は明示指示なしに触らない。

- `Claude/memory/core_mission.md`
- scheduler interval
- scheduler behavior
- runtime stateの直接整形
- raw evidenceの削除
- 大量移動、大量rename、大量archive

次は慎重に扱う。

- `Claude/memory/mir_boot_intent.md`
- `Claude/memory/inbox_*.md`
- `Claude/memory/next_tasks_*.jsonl`
- `Claude/log/cycle_staging*.md`
- 巨大なraw log
- 起動時に読まれるファイル

## 1サイクルの手順

### 1. stateを読む

`GPT/memory/claude_memory_improvement_state.json` を読み、`next_task` を確認する。

`next_task` が空の場合は、`recurring_backlog` の先頭から、conflict riskが低いものを1つ選ぶ。

### 2. タスク種別を分類する

選んだタスクを次のどれかに分類する。

| 種別 | 目的 | 典型成果物 |
| --- | --- | --- |
| audit | 現状とリスクを観測する | `GPT/memory/*_audit_YYYYMMDD.md` |
| compiled artifact | rawを消さず、判断材料へ畳む | `Claude/memory/*_guide.md` |
| canonicalization | 重複clusterの正本を作る | `Claude/memory/*_canonical.md` |
| pointer routing | 既存indexから正しい入口へ導く | `CLAUDE.md`, `MEMORY.md`, index |
| validation | 到達性・出典・frontmatterを検査する | `GPT/tools/validate_*.py` |
| lifecycle | active/canonical/superseded等を整理する | frontmatter, report |

### 3. 触る前にリスク判定する

次のどれかに該当する場合、編集せずaudit reportにする。

- core identityに触る。
- scheduler挙動を変える。
- runtime stateを直接編集する。
- rawを消す必要がある。
- 1サイクルで複数領域へ広く波及する。
- `session_primer.md` へ起動時負荷を増やす変更を入れたくなる。

### 4. 関連ファイルを読む

広く読みすぎない。選んだタスクに必要なファイルだけ読む。

基本の確認観点:

- そのファイルはProtocol、Memory、Skills、Project、State / Runtime I/Oのどれか。
- readerは誰か。
- writerは誰か。
- 起動時に読まれるか。
- schedulerやcycleが読むか。
- rawかcompiledか。
- 既にcanonicalやindexがあるか。

### 5. 限定的改善を1つだけ行う

1サイクルでやるのは、次のどれか1つにする。

- audit artifactを1つ作る。
- compiled/canonical artifactを1つ作る。
- 既存indexへ短いポインタを1つ足す。
- 検証スクリプトを1つ作る、または既存検証へ1条件を足す。
- lifecycle/frontmatterの最小整理をする。

複数の大きな変更を同時にやらない。次の改善が見えたら、stateのbacklogへ積む。

### 6. 検証する

可能な限り安い検証を実行する。

標準検証:

```powershell
python -m json.tool GPT\memory\claude_memory_improvement_state.json
python GPT\tools\validate_claude_memory_artifact.py
python GPT\tools\validate_claude_read_paths.py
```

変更内容によって該当しない検証は省略してよい。ただし、どれを実行し、どれを省略したかをstateまたはreportに残す。

### 7. reportを残す

大きな判断や、後続サイクルで再利用すべき観点がある場合は、`GPT/memory/` に日本語のreportを残す。

reportには最低限これを書く。

- 対応タスクID
- 対象ファイル
- 何を変えたか
- 何を変えなかったか
- rawをどう保持したか
- 検証結果
- 次にやること

### 8. stateを更新する

最後に必ず `GPT/memory/claude_memory_improvement_state.json` を更新する。

更新する項目:

- 完了したタスクの `status`
- `completed_at`
- artifact/report/validator/result
- `last_update.summary`
- `last_update.files_touched`
- `last_update.next_task`

次のタスクが未定なら、`recurring_backlog` の先頭を `next_task` にする。

## 完了条件

1サイクルの完了条件:

- 改善またはauditが1つ存在する。
- raw evidenceを削除していない。
- runtime stateを不用意に編集していない。
- 検証を実行した、または省略理由を書いた。
- stateが更新されている。

## Slack報告の目安

毎回必須ではない。次の場合はSlackへ報告する。

- `CLAUDE.md`, `MEMORY.md`, `session_primer.md` などread pathに接続した。
- Claude側の新しいcompiled/canonical artifactを作った。
- schedulerやruntime state周辺のリスクを発見した。
- Nao_uの問題意識に関わる判断を変更した。
- 複数サイクルの節目になった。

報告では、ファイル名の列挙だけでなく、意図と次の判断点を書く。

## 次回以降の候補

### CMI-011 external_notes統合audit

目的:

external_notes系がrawとして滞留し、reference/shared_reads/beliefs/projectへ昇格されない問題をauditする。

最初は編集せず、対象ファイル、writer、統合済みmarker、未統合量を記録する。

### CMI-012 feedback canonical候補選定

目的:

次にcanonical化すべきfeedback clusterを1つ選ぶ。

候補:

- 情報収集が報酬化するcluster
- 判断先送りcluster
- ゲーム制作の着手前ゲートcluster

### CMI-013 lifecycle/frontmatter audit

目的:

compiled/canonical/active/rawのfrontmatterやlifecycle markerが揃っているか、小さく調べる。

### CMI-014 game read-path refinement

目的:

新ゲーム制作時に `game_dev_index.md`、`game_lessons_log.md`、`lessons-recall` のどれを先に読むべきかを、read-path scenarioでより明確にする。

### CMI-015 oversized raw index plan

目的:

巨大raw fileに対して、削除ではなくindex/抽出計画を作る。

### CMI-016 validation coverage expansion

目的:

`validate_claude_read_paths.py` と `validate_claude_memory_artifact.py` を統合するか、対象artifactを増やすかを検討する。

## 判断の芯

記憶改善は、記憶システムを整える趣味ではない。

目的は、Nao_uとClaudeがゲーム制作で試行錯誤し、過去の失敗と成功を次の判断へ使えるようにすること。改善がこの目的から外れたら、記憶システムの中ではなく、ゲーム制作の現場へ戻る。
