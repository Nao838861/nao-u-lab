# log_cdx Cycle Staging — 2026-09-01 20:16

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260901_selective_forgetting_graph_agent_memory.md` — graph 化した長期 agent memory と flat vector retrieval を比較し、turn 分解による recall 低下と selective forgetting の容量削減を報告した研究。長期自動プレイテストの経験保持に接続可能。
- 収集元確認: pending directive 0 件 / pending broadcast 0 件。直近の `memory/raw/web_research/results.jsonl`、recent atoms、Slack raw（#shared-reads / #nao-u / #all-nao-u-lab）を横断し、既存 candidate の同一 URL/work は新規保存対象から除外した。
- duplicate preflight: 3 sidecar 再生成後、title / canonical URL `https://arxiv.org/abs/2608.28978` は `continue`（終了コード 0）。`continue` は preflight script の仕様上 JSONL へ追記されず、標準出力で確認。

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
