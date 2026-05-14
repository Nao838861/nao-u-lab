# Claude記憶read-pathシナリオ検証レポート

作成日: 2026-05-14
対応タスク: CMI-008 Add read-path scenario checks
担当: GPT/Codex

## 目的

CMI-005とCMI-007で作ったcompiled/canonical artifactが、実際の作業場面から到達できる形になっているかを検証する。

今回の検証は、起動時read pathを増やすための変更ではない。`CLAUDE.md`, `Claude/memory/MEMORY.md`, `Claude/memory/session_primer.md` への接続はまだ行わず、まず「どのシナリオで、どのファイルへ到達すべきか」を明示し、最低限の存在・内容チェックを自動化した。

## 追加した検証スクリプト

- `GPT/tools/validate_claude_read_paths.py`

検証対象は4シナリオ。

## シナリオ1: 記憶システム改善

トリガー:

- Claude側の記憶階層、compiled artifact、raw/compiled、配置分類を変更する。

期待read path:

- `Claude/memory/memory_operation_compiled_guide.md`

確認内容:

- `いつ読むか` がある。
- `write / manage / read` がある。
- `State / Runtime I/O` がある。
- `rawを消さない` がある。

意図:

記憶改善タスクで、いきなり中核記憶やscheduler stateを触る前に、配置分類とraw/compiled境界へ到達できるようにする。

## シナリオ2: 新ルール・Protocol追加

トリガー:

- Nao_uの指摘を受けて、新しいProtocol、M-XX、kaizen、skill specを追加したくなる。

期待read path:

- `Claude/memory/feedback_rule_proliferation_canonical.md`
- `Claude/memory/feedback_index.md`

確認内容:

- `Nao_uの指摘は教師データ` がある。
- `ルール追加より、既存原則への吸収を先に試す` がある。
- `specを作ったら、満たすところまで` がある。
- `feedback_index.md` から canonical file へのポインタがある。

意図:

個別指摘をそのままルール化する前に、既存原則への吸収、canonical化、raw保持の判断へ戻す。

## シナリオ3: 新ゲーム制作・改修判断

トリガー:

- 新しいゲーム制作、改修判断、cross_review、Nao_u評価受領の前に関連lessonへ到達する。

期待read path:

- `Claude/memory/game_dev_index.md`
- `Claude/memory/game_lessons_log.md`
- `Claude/skills/lessons-recall/SKILL.md`

確認内容:

- `game_dev_index.md` に `新ゲーム着手前`, `着手前ゲート`, `game_lessons_log.md`, `lessons-recall` がある。
- `game_lessons_log.md` に `新ゲーム着手前` がある。
- `lessons-recall` skill に `新規 game/<id>/v01/ 着手前` の起動条件がある。

意図:

記憶システム改善が目的化して、ゲーム制作の判断へ戻らなくなることを防ぐ。記憶はゲーム制作の判断を助けるためにある。

## シナリオ4: scheduler / runtime incident

トリガー:

- scheduler、cycle、inbox、next_tasks、stagingなどruntime stateに触りたくなる。

期待read path:

- `Claude/memory/memory_operation_compiled_guide.md`
- `Claude/docs/scheduler_architecture.md`

確認内容:

- `schedulerやcycleが読むruntime state` がある。
- `State / Runtime I/O` がある。
- `直接編集しない` がある。
- `scheduler、auto_diary、inbox処理のコード` がある。
- scheduler architecture文書が存在する。

意図:

記憶ファイルに見えるものの中にruntime stateが混在しているため、手作業の整形や思いつきの修正で定時サイクルを壊さないようにする。

## 実行結果

実行コマンド:

```powershell
python GPT\tools\validate_claude_read_paths.py
```

結果:

```text
scenarios: 4
errors: 0
warnings: 0
```

## 判定

CMI-008は完了。4つの実作業シナリオについて、期待する入口ファイルと最低限の判断材料が存在することを確認した。

次のCMI-009では、`CLAUDE.md`, `Claude/memory/MEMORY.md`, `Claude/memory/session_primer.md` へ本当にポインタを足すべきかをレビューする。今回の結果だけでは、まだ接続は行わない。
