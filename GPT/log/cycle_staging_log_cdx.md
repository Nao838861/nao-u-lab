# log_cdx Cycle Staging — 2026-09-01 20:16

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260901_selective_forgetting_graph_agent_memory.md` — graph 化した長期 agent memory と flat vector retrieval を比較し、turn 分解による recall 低下と selective forgetting の容量削減を報告した研究。長期自動プレイテストの経験保持に接続可能。
- 収集元確認: pending directive 0 件 / pending broadcast 0 件。直近の `memory/raw/web_research/results.jsonl`、recent atoms、Slack raw（#shared-reads / #nao-u / #all-nao-u-lab）を横断し、既存 candidate の同一 URL/work は新規保存対象から除外した。
- duplicate preflight: 3 sidecar 再生成後、title / canonical URL `https://arxiv.org/abs/2608.28978` は `continue`（終了コード 0）。`continue` は preflight script の仕様上 JSONL へ追記されず、標準出力で確認。

## Phase 2: 分析

```yaml
total_candidates: 1
pass:
  - memory/shared_reads_candidates/20260901_selective_forgetting_graph_agent_memory.md
fail: []
postpone: []
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
  oldest_collected_at: "2026-09-01T20:18:23+09:00"
  selection_limit: 5
  selected_paths: []
  phase1_excluded_paths:
    - memory/shared_reads_candidates/20260901_selective_forgetting_graph_agent_memory.md
  evaluated_paths:
    - memory/shared_reads_candidates/20260901_selective_forgetting_graph_agent_memory.md
  valid_backlog_after: 0
duplicate_preflight:
  decision: continue
  canonical_url: "https://arxiv.org/abs/2608.28978"
  sidecars_rebuilt_before_evaluation: true
```

- 判定: **pass**。graph memory の優位性を支持しない negative result と、forgetting による約10%の容量削減を分離しており、宣伝的な「構造化すれば良い」を避けた密度ある概要が書ける。
- ゲーム制作への適用: 長期自動プレイテストの raw episode を保持したまま構造化記憶を併設し、同じ retrieval budget で recall と bad-policy 回帰を比較してから、再生成可能な派生記憶だけを pruning する probe に落とせる。
- 限界: LongMemEval、単一 extractor、pruning 1 回の結果であり、graph memory 一般や実ゲーム履歴への一般化は主張しない。

## Phase 3: Shared-reads 投稿

```yaml
posted: []
skipped:
  - candidate: memory/shared_reads_candidates/20260723_harness_induced_belief_divergence.md
    reason: "duplicate preflight が review（open_duplicate_title_match / mixed group）。normal_post の必須条件である continue を満たさないため投稿せず、同一 arXiv work の failed sibling を含む重複群の整合を次回再評価へ送った"
    action: candidate_revise
preflight:
  title: "Measuring Harness-Induced Belief Divergence in Multi-Step LLM Agents"
  canonical_url: "https://arxiv.org/abs/2607.04528v1"
  decision: review
  reason: open_duplicate_title_match
  group_kind: mixed
  representative_paths:
    - memory/shared_reads_candidates/20260723_harness_induced_belief_divergence.md
  candidate_state_fingerprint_unchanged_before_decision: true
delivery:
  handoff_id: p3h-ea8adc7aaf02af11
  decision: postponed
  delivery_mode: new_post
  evidence: "candidate lifecycle fields + Phase 3 preflight entry; Slack post_message は未実行"
```

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
