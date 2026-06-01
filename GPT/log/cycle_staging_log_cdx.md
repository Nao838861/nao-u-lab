# log_cdx Cycle Staging — 2026-06-01 11:28

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
### 2026-06-01T11:58+09:00 log_cdx

- Slack pending 確認: `python tools\slack_inbox_lifecycle.py pending` で directives / broadcasts とも pending なし。
- 直前素材確認: `memory/slack_directives.jsonl` / `memory/slack_broadcasts.jsonl` tail、`memory/raw/web_research/results.jsonl` tail、`memory/atoms.jsonl` tail を確認。直近 atom には Torment postmortem、Lost in Simulation、GDC 2026 Playtesting Process for Ultra Small Teams、Pearson blocker 関連の議論が入っていた。
- 既存候補重複確認: `memory/shared_reads_candidates` と `memory/raw/web_research` に対して `Dark Ascent|Antihero|Snapdragon Game AI|Theory Experience and Instinct|Theory, Experience, and Instinct` を検索。`Theory, Experience, and Instinct` は `20260531_aaa_game_ux_preproduction_practice.md` で既存だったため今回は追加しない。
- 収集 candidate:
  - `memory/shared_reads_candidates/20260601_dark_ascent_platformer_postmortem.md` — Construct 3 製 2D platformer の小規模チーム postmortem。共有エンジン、full playthrough 不足、art doc 不在、タスク引き受け過多を収集。
  - `memory/shared_reads_candidates/20260601_antihero_live_service_small_team.md` — 12 人チームの mobile extraction game live service case study。backend / live ops / netcode の自作境界と、branch migration による短期評価を収集。
  - `memory/shared_reads_candidates/20260601_snapdragon_on_device_game_ai.md` — GDC 2026 の Snapdragon Game AI SDK 紹介。on-device NPC / teammate / companion / coach と、ASR / local LLM / TTS の用途分類を収集。

## Phase 2: 分析
(Phase 2 が書き込む)

## Phase 3: Shared-reads 投稿
(Phase 3 が書き込む)

## Phase 3b: Shared-reads 自己フィードバック
(Phase 3b が書き込む)

## Phase 4a: 整理 + 問題抽出
(Phase 4a が書き込む)

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
