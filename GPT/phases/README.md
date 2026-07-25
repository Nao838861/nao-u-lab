# GPT/phases/

log_cdx 定時サイクルのフェーズプロンプト集。

## サイクル全体の目的

ゲーム制作のための情報収集 **+** その経験を次の制作に活かす記憶システムの構築。

## フェーズ構成 (Ash auto_diary 4 フェーズ分割と同型、5+ 段)

| Phase | 名前 | 起動 | プロンプト |
|---|---|---|---|
| game-start | ゲーム制作着手 | pending の game directive がある時、通常サイクルより優先 | `phase_game_start.md` |
| 1 | 情報収集 | 毎回 | `phase1_collect.md` |
| 2 | 分析 | 毎回 | `phase2_analyze.md` |
| 3 | Shared-reads 投稿 | 毎回 (pass が 0 件なら no-op) | `phase3_post_shared_reads.md` |
| 3b | Shared-reads 自己フィードバック | 毎回 | `phase3b_self_feedback.md` |
| 4a | 記憶階層: 整理 + 問題抽出 | 毎回 | `phase4a_cleanup.md` |
| 4b | 記憶階層: 仕組み検討 | 4a で needs_design: true の時 | `phase4b_design.md` |
| 4c | 記憶階層: 導入 | 4b で decision: introduce の時 | `phase4c_introduce.md` |
| 5 | 日記投稿 | 毎回 | `phase5_diary.md` |

## 設計原則

1 phase = 1 LLM 起動。同一 cycle 内の Phase 間の情報受け渡しは staging file (`log/cycle_staging_log_cdx.md`) を使う。一気にやらない (末尾劣化を避ける)。跨 cycle で acknowledgment まで保持すべき group action と stale candidate は、それぞれ `memory/shared_reads_group_handoff_inbox.jsonl` と `memory/shared_reads_candidate_handoff_inbox.jsonl` を正本とし、staging は当該 cycle の入出力表示に限定する。各 phase プロンプトに「やること / やらないこと」を明示してスコープを制御する。

Phase 3b は、過去の shared-reads から 1 件だけ選び、Codex 自身の行動へ小さく反映するための安全弁付きフェーズ。恒久ルールを増やすのではなく、原則として一時 probe、評価表、state 更新に留める。採用は relevance / actionability / evidence / non_redundancy / risk_control / reversibility の 6 指標で絞る。

`memory/slack_directives.jsonl` に未処理のゲーム制作指示がある時は、通常の情報収集サイクルへ流さず `phase_game_start.md` を先に実行する。これは「pending を確認したが後フェーズ送り」のまま制作が始まらない失敗を防ぐための入口。

詳細経緯: Claude 側 `docs/scheduler_architecture.md` セクション 11 (Ash 2 モード起動設計)。本フェーズ群はそれを log_cdx 文脈に適用したもの。

## 設定値

- サイクル間隔: 15 分ごとに runner を起動し、`codex_phases_cycle.py` 側の 90 分 gate で本処理を間引く。
- 推奨実行コマンド: `python tools/codex_phases_cycle.py`
- Windows タスク登録: `powershell -ExecutionPolicy Bypass -File tools\install_codex_phases_cycle_task.ps1`

## staging file の流れ

各サイクル開始時に `log/cycle_staging_log_cdx.md` を初期化 (空テンプレート) し、各 phase が自分のセクションに追記していく。前 phase の内容は **消さない**。

Phase 4a から次 cycle の Phase 2 へ渡す group action は `tools/shared_reads_group_handoff.py`、stale candidate は `tools/shared_reads_candidate_handoff.py` で pending / handled / deferred を管理する。Phase 2 は対応する staging 結果と candidate frontmatter の完了条件を満たした item だけ resolve する。

## 既存の deterministic cycle (`codex_log_cycle.py`) との関係

- `codex_log_cycle.py`: 15 分タスクスケジューラ → 90 分 elapsed gate で deterministic maintenance (LLM なし、shared-reads index 更新 + Slack/記憶取り込み + status のローカル保存)
- 本フェーズ群: 15 分タスクスケジューラ → 90 分 elapsed gate の **LLM 駆動 cycle**。並列で動作

両者は独立して動く。deterministic 側が状態を提供し、phase 側が深い思考と実装を担う。

## ゲーム記憶システム (進化中)

Phase 4b/4c で iteratively 育てていく。出発点となる既存資産:
- `memory/game_design_rules.md`
- `memory/gravity_courier_v001_success_case.md` 等の case study
- `memory/atoms.jsonl` (構造化メモ)

Phase 4a が「次の制作に活かせるか?」の観点で issue を立て、4b/4c が構造改善を進める。
