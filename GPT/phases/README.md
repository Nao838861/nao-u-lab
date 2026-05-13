# GPT/phases/

log_cdx 定時サイクルのフェーズプロンプト集。

## サイクル全体の目的

ゲーム制作のための情報収集 **+** その経験を次の制作に活かす記憶システムの構築。

## フェーズ構成 (Ash auto_diary 4 フェーズ分割と同型、5+ 段)

| Phase | 名前 | 起動 | プロンプト |
|---|---|---|---|
| 1 | 情報収集 | 毎回 | `phase1_collect.md` |
| 2 | 分析 | 毎回 | `phase2_analyze.md` |
| 3 | Shared-reads 投稿 | 毎回 (pass が 0 件なら no-op) | `phase3_post_shared_reads.md` |
| 4a | 記憶階層: 整理 + 問題抽出 | 毎回 | `phase4a_cleanup.md` |
| 4b | 記憶階層: 仕組み検討 | 4a で needs_design: true の時 | `phase4b_design.md` |
| 4c | 記憶階層: 導入 | 4b で decision: introduce の時 | `phase4c_introduce.md` |
| 5 | 日記投稿 | 毎回 | `phase5_diary.md` |

## 設計原則

1 phase = 1 LLM 起動。Phase 間の情報受け渡しは staging file (`log/cycle_staging_log_cdx.md`) を使う。一気にやらない (末尾劣化を避ける)。各 phase プロンプトに「やること / やらないこと」を明示してスコープを制御する。

詳細経緯: Claude 側 `docs/scheduler_architecture.md` セクション 11 (Ash 2 モード起動設計)。本フェーズ群はそれを log_cdx 文脈に適用したもの。

## 設定値

- サイクル間隔: 2.5h 目安 (現状 stub、orchestrator 実装時に確定)
- 推奨実行コマンド: `python tools/codex_phases_cycle.py` (現 stub、Codex CLI 起動は TODO)

## staging file の流れ

各サイクル開始時に `log/cycle_staging_log_cdx.md` を初期化 (空テンプレート) し、各 phase が自分のセクションに追記していく。前 phase の内容は **消さない**。

## 既存の deterministic cycle (`codex_log_cycle.py`) との関係

- `codex_log_cycle.py`: 15 分タスクスケジューラ → 90 分 elapsed gate で deterministic maintenance (LLM なし、shared-reads index 更新 + Slack #log への status 投稿)
- 本フェーズ群: 2.5h 目安の **LLM 駆動 cycle**。並列で動作

両者は独立して動く。deterministic 側が状態を提供し、phase 側が深い思考と実装を担う。

## ゲーム記憶システム (進化中)

Phase 4b/4c で iteratively 育てていく。出発点となる既存資産:
- `memory/game_design_rules.md`
- `memory/gravity_courier_v001_success_case.md` 等の case study
- `memory/atoms.jsonl` (構造化メモ)

Phase 4a が「次の制作に活かせるか?」の観点で issue を立て、4b/4c が構造改善を進める。
