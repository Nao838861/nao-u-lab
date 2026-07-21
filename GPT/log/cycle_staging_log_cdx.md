# log_cdx Cycle Staging — 2026-07-21 22:28

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260721_eli_real_user_seam_playtesting.md` — 一人の自己テストでは通らない offline→online、world→world、初見 user→二台目 machine の seam で発見された不具合と discoverability の記録。
- `memory/shared_reads_candidates/20260721_battle_arena_animation_state_sync.md` — 一週間の action prototype で Startup / Active / Recovery / Transition を animation、hitbox、入力割込み、logical state に共有した実装記録。
- `slack_directives.jsonl` / `slack_broadcasts.jsonl`: `status: pending` なし。
- 収集経路: 直近 `memory/raw/web_research/results.jsonl` と最近の atom を確認し、投稿済み work の反復を避けて一次資料を新規検索。各 candidate の書込み直前に3 sidecarを再生成し、duplicate preflight `continue` を確認。Slack 投稿は未実施。

## Phase 2: 分析

```yaml
total_candidates: 2
pass:
  - memory/shared_reads_candidates/20260721_eli_real_user_seam_playtesting.md
  - memory/shared_reads_candidates/20260721_battle_arena_animation_state_sync.md
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
duplicate_preflight:
  sidecars_rebuilt: true
  sidecars_fresh: true
  results:
    - path: memory/shared_reads_candidates/20260721_eli_real_user_seam_playtesting.md
      decision: continue
      title_key: postmortem release 2026 06 15
    - path: memory/shared_reads_candidates/20260721_battle_arena_animation_state_sync.md
      decision: continue
      title_key: postmortem one week from idea to internal playtest
```

## Phase 3: Shared-reads 投稿

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260721_eli_real_user_seam_playtesting.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784641228892699
    char_count: 4378
  - candidate: memory/shared_reads_candidates/20260721_battle_arena_animation_state_sync.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784641237651129
    char_count: 4463
skipped: []
review:
  required_sections: pass
  banned_phrases: pass
  canonical_urls_at_end: pass
  duplicate_preflight: continue
  post_verification: pass
notes:
  - ELI candidate の非 canonical URL が通常表示で 404 だったため、原文の canonical URL に置換してから投稿した。
```

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1781008433-15d205b332
    source_ts: "1781008433.930809"
    title: MemoryArena vs LoCoMo の passive recall / active decision-relevant memory gap
    reason: Phase 4a が記憶整理案を選ぶ直前なので、想起・保持できた事実ではなく、その記憶が後続判断を変えたかを一度だけ判定へ使うため。
  scores:
    relevance: 3
    actionability: 3
    evidence: 3
    non_redundancy: 1
    risk_control: 3
    reversibility: 3
    total: 16
  decision: adopt_probe
  decision_reason: MemoryArena の相互依存 multi-session task は passive recall と active decision-relevant use の差を具体化する。ただし既存 AMV-L probe が action impact / downstream reuse をすでに問うため、新規 probe は追加せず既存 probe を1回だけ再利用する。
  change:
    summary: 既存 AMV-L retention/utility probe を次の Phase 4a だけ operational に lease した。新規 probe、directive、恒久ルールは追加していない。
    files:
      - memory/shared_reads_self_feedback_state.json
      - memory/shared_reads_probe_lifecycle.jsonl
      - log/cycle_staging_log_cdx.md
  lease:
    probe_id: probe-20260625-amvl-retention-utility-lifecycle
    consumer_phase: Phase 4a
    trigger_artifact: log/cycle_staging_log_cdx.md#Phase-4a
    expected_delta: recall・retention・stale の passive 証拠しかない改善候補は即採用せず active_utility_unverified とし、後続判断を変えた証拠がある候補を優先する。
    lease_due: "2026-07-22T23:00:00+09:00"
    enqueue_result: enqueued
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```

## Phase 4a: 整理 + 問題抽出

```yaml
cleaned:
  - memory/MEMORY.md の entry index を per-file atom index と照合し、broken link 0 件を確認した。
  - atoms.jsonl / per-file .md / index.jsonl の 2714 件を照合し、ID 重複・parse error・mirror content conflict が 0 件であることを確認した。
  - normalized body 重複 40 群は既存 lifecycle fold、45 群は canonical overlay に収載済みで、自動削除や再編は行わなかった。
  - 30 日超の raw 95 件（web_research 87、headless_eval 6、slack_archive 1、raw 直下 1）を archive 候補として棚卸しし、原文保持契約があるため移動しなかった。
  - candidate lifecycle 1042 件を dry-run 監査し、open duplicate / stale triage / group action の 3 sidecar を再生成した。内容差分は 0 件だった。
  - slack_directives.jsonl / slack_broadcasts.jsonl の pending が 0 件だったため handled 更新は行わなかった。
  - group handoff inbox を audit し、pending 0 / error 0 を確認した。actionable group が 0 件のため enqueue は 0 件だった。
issues:
  - id: ISS-4A-STALE-BACKLOG
    description: postponed / needs_review の期限到来が 182 件あり、stale triage sidecar の 50 行上限を超えている。既存 queue で処理可能だが、未処理残は継続している。
    severity: medium
    evidence: "tools/backfill_shared_reads_candidate_status.py --today 2026-07-21: overdue_for_reassessment=182; memory/shared_reads_stale_triage_queue.jsonl: rows=50"
    source_file_status: candidate frontmatter と sidecar は UTF-8 で正常に読める。
    display_or_tooling_status: none
    why_blocks_game_memory: 古い候補が再評価入口を占有し続けると、ゲーム制作へ転用価値の高い候補が Phase 2 の少数 review budget に到達しにくい。
  - id: ISS-4A-TITLE-SEARCH
    description: recall-visible repeated title group が 15 群あり、未 grouping の repeated title も 14 種残る。既存 title quality audit はあるが、active な後続判断を変えた証拠は今回観測できなかったため design 起動根拠にはしない。
    severity: medium
    evidence: "tools/memory_health.py --json: recall_visible_repeated_title_groups=15; ungrouped_repeated_title_groups=14; memory/atoms/title_quality_audit.jsonl: rows=621"
    source_file_status: 対象 index / audit は UTF-8 で正常に読める。内容品質の問題であり encoding 破損ではない。
    display_or_tooling_status: none
    why_blocks_game_memory: 同名・定型 title は検索結果で個別の制作知見を識別しにくくするが、今回の Phase 4a では実利用時の判断差まで確認できていない。
  - id: ISS-4A-ATOM-MOJIBAKE
    description: sr-1776127289-4d9239b255 の「エージェント」が replacement 文字を含む形で保存されている。別の mojibake suspect 1 件は本文中の "???" による false positive だった。
    severity: low
    evidence: "memory/raw/slack_archive/shared-reads.jsonl:492; memory/atoms/2026-04/sr-1776127289-4d9239b255.md"
    source_file_status: UTF-8 明示読みでも raw archive と atom の双方に「エ��ジェント」が保存されており、source data 自体の局所破損である。
    display_or_tooling_status: none。PowerShell 表示経路だけの mojibake ではない。
    why_blocks_game_memory: 「エージェント」の exact keyword 検索と title 識別を1件だけ弱める。
recommendation:
  needs_design: false
  priority_issues: []
  rationale: 3 issue とも既存の Phase 2 handoff、title audit、局所データ修復で扱える。新構造を設計する前に既存経路で active utility の差分を観測すべきである。
atom_audit:
  atoms: 2714
  mirror_content_conflicts: 0
  raw_normalized_content_duplicate_groups: 40
  recall_visible_normalized_content_duplicate_groups: 3
  canonical_overlay_duplicate_groups: 45
  errors: 0
candidate_lifecycle:
  posted: 449
  ready_to_post: 9
  postponed: 325
  failed: 240
  needs_review: 18
  skipped_unreviewed: 1
  missing_stale_after: 4
  overdue_for_reassessment: 182
probe_lifecycle:
  inspected_due_count: 0
  inspected_probe_id: null
  outcome: none
  counts:
    pending: 1
    resolved: 0
    dormant: 1
  due_receipt: null
  note: probe-20260625-amvl-retention-utility-lifecycle は 2026-07-22T23:00:00+09:00 が due のため、この cycle では resolve しない。
stale_backlog:
  overdue_open_total: 182
  stale_triage_queue_rows: 50
  open_duplicate_group_count: 56
  mixed_group_count: 49
  all_open_group_count: 7
  actionable_group_count: 0
  backlog_high_water: false
  high_water_reason: overdue_open_total > stale_triage_queue_rows は満たすが、actionable group が 3 件以上ではない。
  group_handoff_budget: 1
  handed_off_group_count: 0
  handoff_inbox_pending_count: 0
  handoff_inbox_ids: []
  suppressed_existing_group:
    group_key: joint agent memory and exploration learning via novelty signals
    inbox_id: gha-e6d4d4b5a37a0808
    status: deferred
    retry_after: "2026-08-20T13:19:04+09:00"
group_action_handoff: []
stale_review_batch:
  - path: memory/shared_reads_candidates/20260515_zork_llm_reasoning_limits.md
    status: postponed
    stale_after: "2026-06-14"
    priority_reason: Zork の探索・計画限界は headless playtest に転用価値が高いが、評価条件・失敗分類・モデル比較の本文確認が不足している。
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_countdown_game_planning_benchmark.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: 検証可能な短い planning benchmark はゲーム評価へ使いやすいが、実験設計と比較結果の詳細が不足している。
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_inmind_social_deduction_reasoning_styles.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: social deduction の推論スタイル追跡は有用だが、評価指標・失敗例と既存投稿との重複確認が必要である。
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_pangea_procedural_artificial_narrative.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: LLM NPC の memory / validation 構成はゲーム転用しやすいが、empirical study と ablation の詳細が不足している。
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260517_access_profiles_game_accessibility.md
    status: postponed
    stale_after: "2026-06-16"
    priority_reason: accessibility を player・engine・launcher 間の基盤として扱う着想は高価値で、本文の評価結果を補えば制作導線へ接続できる。
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
