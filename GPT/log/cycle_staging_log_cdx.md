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

```yaml
self_feedback:
  selected:
    id: sr-1779690823-9cfbf0f049
    source_ts: "1779690823.312759"
    title: "ScriptDoctor: Automatic Generation of PuzzleScript Games via LLMs and Tree Search"
    reason: "未レビューの score 11 で game-design・agent・operation・evaluation の優先4タグを持ち、候補転載ではなく完全な shared-reads 投稿。制約言語・compile error・探索 playtest の三層が次の行動を変えるか確認するため1件だけ選んだ。Nao_u の明示的な重要評価はローカル raw では未確認。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 2
    non_redundancy: 0
    risk_control: 1
    reversibility: 3
    total: 12
  decision: reject
  decision_reason: "生成域、compile/runtime、task solvability、play-facing qualityを分ける行動は有用だが、実環境でのbefore/afterがなく、既存4 controlsで判断を完全に表現できる。合計14未満かつrisk_control<2なので新規controlは増やさない。"
  change:
    summary: "reviewed_source_ts と、既存 executable-check／runtime-integration／task-compatibility／feedback-loop controls との完全重複、比較artifact不在、active probe増殖riskに基づくstate-only reject理由を記録。active_probes、ledger、directive、恒久ルールは変更なし。"
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  lease: null
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```

## Phase 4a: 整理 + 問題抽出

```yaml
cleaned:
  - "MEMORY.md の index path 2件（memory/atoms.jsonl / memory/raw/）を確認し、broken path 0件。UTF-8明示読みも成功"
  - "atom duplicate sidecar を監査し、45 cluster / 45 overlay group、consistency=stable を確認。新規の未管理重複・矛盾は0件"
  - "staleだった atom title quality audit を924行 / 701 groupへ再生成。raw_title_debt 893件に対し effective_display_unresolved 0件"
  - "memory/raw/ の30日超非更新ファイル244件を監査。最古は既に slack_archive 配下、残りも一次根拠のため本cycleの移動0件"
  - "candidate lifecycle 1481件を監査。status競合0件、posted 744 / failed 530 / postponed 205 / ready_to_post 2"
  - "open duplicate / stale triage / group-action sidecarを規定順で再生成し、group / candidate handoffを冪等enqueue。新規投入はいずれも0件"
  - "Slack directive / broadcast のpendingはいずれも0件。handled更新0件"
  - "Phase 3 queueを再生成し、未lease queue 0件 / handoff pending 2件を監査。投稿・resolveは未実施"
issues:
  - id: ISS-ENC-001
    description: "active atom sr-1776127289-4d9239b255 のtitle / headingにU+FFFDが残り、派生 related_candidates にも同じ壊れた語が伝播している"
    severity: medium
    evidence: "memory/atoms/2026-04/sr-1776127289-4d9239b255.md; memory/atoms.jsonl id=sr-1776127289-4d9239b255; memory/atoms/related_candidates.jsonl"
    source_file_status: "UTF-8明示読みで『エ��ジェント』を確認。source file自体にreplacement characterがあり、表示経路だけのmojibakeではない"
    display_or_tooling_status: "PowerShell UTF-8読み、memory_health、per-file atom、related_candidatesで同じ破損を再現"
    why_blocks_game_memory: "activeな記憶のtitle検索と関連候補表示に壊れたtokenが混ざり、同概念のexact検索と再利用時の識別精度を局所的に落とす"
recommendation:
  needs_design: false
  priority_issues: []
  rationale: "ISS-ENC-001は新しい記憶構造を要しない孤立したsource repairであり、Phase 4bを起動しない。raw title debtはsemantic aliasで実効表示未解決0件のため構造issue化しない"
probe_lifecycle:
  inspected_due_count: 0
  inspected_probe_id: null
  outcome: none
  counts:
    pending: 0
    resolved: 11
    dormant: 1
stale_review_batch: []
group_action_handoff: []
stale_backlog:
  overdue_open_total: 4
  stale_triage_queue_rows: 0
  open_duplicate_group_count: 27
  mixed_group_count: 23
  all_open_group_count: 4
  actionable_group_count: 0
  backlog_high_water: false
  group_handoff_budget: 1
  handed_off_group_count: 0
  handoff_inbox_pending_count: 0
  handoff_inbox_ids: []
  candidate_handoff_pending_count: 0
  candidate_handoff_ids: []
  valid_unreviewed_count: 0
  oldest_unreviewed_collected_at: null
  malformed_candidate_count: 0
  phase2_unreviewed_limit: 5
  suppression_evidence: "overdue 4件はJAMEL / collision morphologyの2 duplicate groupに属し、membership一致のdeferred leaseがretry_after=2026-09-19まで有効"
phase3_delivery_audit:
  queue_count: 0
  handoff_pending_count: 2
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿

```yaml
posted:
  channel: "#log"
  ts: "1788263143.246759"
  permalink: "https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1788263143246759"
  char_count: 2055
  verification: ok
  flat_post: true
  draft_file: tmp/phase5_log_diary_20260901_204447_cdx.md
```

- Phase 1-4 の reflection を、graph memory の negative result、Phase 3 の duplicate gate、Phase 3b の反肥大化判断、Phase 4a の局所的な U+FFFD debt を軸に日記化した。
- Slack API 側の本文検証は `ok`。文字化け・`?` 化は検出されず、削除処理は発火していない。
