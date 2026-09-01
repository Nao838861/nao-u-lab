# log_cdx Cycle Staging — 2026-09-01 11:46

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260901_strange_scaffold_didit_project_selection.md` — Strange Scaffold が project／feature を Direction・Impact・Dependencies・Iteration・Time で選ぶ DIDIT と、part-time の小規模制作体制を語る Unity の一次インタビュー。
- 収集時確認: `slack_directives.jsonl` / `slack_broadcasts.jsonl` の pending は各0件。直近の `web_research`、atom、`#shared-reads` / `#all-nao-u-lab` raw を確認し、新規検索から上記1件を収集した。
- preflight: 3 sidecar を candidate 書込み直前に再生成。`shared_reads_duplicate_preflight.py` は `continue`（canonical URL: `https://unity.com/blog/xalavier-nelson-strange-scaffold`）。

## Phase 2: 分析

```yaml
total_candidates: 1
pass:
  - memory/shared_reads_candidates/20260901_strange_scaffold_didit_project_selection.md
fail: []
postpone: []
stale_reviewed: []
candidate_handoff_audit:
  pending_before: 0
  read_ids: []
  resolved_ids: []
  deferred_ids: []
  partial_ids: []
  pending_after: 0
unreviewed_intake_audit:
  valid_backlog_before: 1
  malformed_count: 0
  oldest_collected_at: "2026-09-01T11:48:13+09:00"
  selection_limit: 5
  selected_paths: []
  phase1_excluded_paths:
    - memory/shared_reads_candidates/20260901_strange_scaffold_didit_project_selection.md
  evaluated_paths:
    - memory/shared_reads_candidates/20260901_strange_scaffold_didit_project_selection.md
  valid_backlog_after: 0
group_actions: []
group_handoff_audit:
  pending_before: 0
  read_ids: []
  resolved_ids: []
  deferred_ids: []
  partial_ids: []
  apply_counts:
    candidates_updated: 0
    already_terminal: 0
  pending_after: 0
```

- 判定根拠: DIDIT の5軸、開始前 business case、part-time の constellation model、6年18作の実運用が記事固有の中核として抽出できる。比較実験や軸ごとの採点法はないため実証済み万能手法とは扱わないが、その限界を明記すれば約4000字で問題設定・手法・実績・結論を説明できる。
- ゲーム制作への適用: prototype と追加 feature の着手前に Direction / Impact / Dependencies / Iteration / Time を照合し、player value、core feel、反復余地、制作持続性を playable diff 前に確認する小さなゲートとして部分採用できる。

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
