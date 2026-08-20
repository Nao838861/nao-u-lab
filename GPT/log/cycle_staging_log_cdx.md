# log_cdx Cycle Staging — 2026-08-20 20:43

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260820_peak_friendslop_rapid_development.md` — GDC 2026のNick Kaman講演。『PEAK』の1か月ゲームジャムから予想外のローンチまでと、短期制作・studio culture・burnoutの関係を収集。
- preflight: `continue`（title / URLに既存のposted-source、closed canonical title、open duplicate group一致なし）。
- pending確認: `slack_directives.jsonl` 0件、`slack_broadcasts.jsonl` 0件。

## Phase 2: 分析

```yaml
total_candidates: 1
pass: []
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260820_peak_friendslop_rapid_development.md
    reason: "講演ページの紹介文だけでは、短期制作の具体工程・判断・失敗・burnout 抑制策・評価証拠が不足し、約4000字の概要を推測なしに構成できない"
stale_reviewed: []
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
  oldest_collected_at: "2026-08-20T20:46:03+09:00"
  selection_limit: 5
  selected_paths: []
  phase1_excluded_paths:
    - memory/shared_reads_candidates/20260820_peak_friendslop_rapid_development.md
  evaluated_paths:
    - memory/shared_reads_candidates/20260820_peak_friendslop_rapid_development.md
  valid_backlog_after: 0
duplicate_preflight:
  path: memory/shared_reads_candidates/20260820_peak_friendslop_rapid_development.md
  decision: review
  reason: open_duplicate_title_match
  title_key: putting the friends in friendslop the story of peak
  group_kind: all_open
  representative_paths:
    - memory/shared_reads_candidates/20260728_peak_friendslop_game_jam_studio_culture.md
    - memory/shared_reads_candidates/20260820_peak_friendslop_rapid_development.md
  note: "frontmatter 更新後の sidecar 再生成で同一 URL の postponed sibling が可視化された。posted-source 一致ではないため skip せず、group 一括更新は Phase 4a handoff に委ねる"
```

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
