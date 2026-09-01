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

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260518_map_player_motives_inventory.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779051654204839
    char_count: 3932
    recovered_existing: true
skipped: []
delivery:
  handoff_id: p3h-7d415e7d6d6f3aa5
  decision: posted
  evidence:
    candidate: "posted block / status: posted / candidate_status: posted"
    staging: "Phase 3 posted receipt recovery entry"
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779051654204839"
preflight:
  state_fingerprint: "98cfe15289084c614860243ff233b8bfa52af44023b60505f7a0739c93bc1748"
  state_match: true
  duplicate_preflight_decision: continue
  duplicate_preflight_evidence: "canonical_url=https://link.springer.com/article/10.1007/s11257-025-09431-7; title_key=validating motives of autonomous players map inventory a bottom up model of general motivational factors to videogame play"
  verified_posted_source: "memory/raw/slack_api/shared-reads.jsonl ts=1779051654.204839; exact canonical URL and completed article-specific analysis"
  action: "Slack へ再投稿せず、既存 permalink から candidate lifecycle と handoff receipt を回復"
review:
  source_checked: "Springer Nature Link 本文（2025-03-30 published）"
  result: "既存投稿は問題設定、bottom-up 尺度開発、UK/US 検証、9因子、適用、限界を3932字で扱っており、記事固有の分析として投稿済みと確認"
```

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1788223537-60da0e8c2b
    source_ts: "1788223537.571019"
    title: "The Immortal John Triptych — art-first の探索層と project migration の一意性境界"
    reason: "score 10 の最新未レビュー atom で、memory・harness・game-design・evaluation の優先4タグを持つ。創作的曖昧さを残す層と runtime identifier／save／input／plugin を一意にする層の分離が、次回行動へ新しい判断差を作るか確認した。Nao_u の明示評価 thread はローカル raw で確認できなかった。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 2
    non_redundancy: 1
    risk_control: 1
    reversibility: 3
    total: 13
  decision: defer
  decision_reason: "art-first の fragment→scene→affordance→puzzle→story と、三 Unity project の scene name／variable／dialogue ID 衝突、hotspot 到達性、旧 plugin 固定の解除条件を分ける migration inventory は直接行動へ変換できる。一方、根拠は単一作者への Unity 公式インタビューで定量比較がなく、既存の atoms per-file migration directive、compiled-memory boundary、runtime integration gate、evaluation version boundary が中核を既に覆う。後続 Phase 4a には比較可能な統合 project または art-first playable がなく、active probe 327件へ同義 control を足す負荷が判断差を上回る。"
  change:
    summary: "reviewed_source_ts と state-only の defer 理由を記録した。active_probes・probe lifecycle ledger・directive・恒久ルールは変更していない。"
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
  - "MEMORY.md index を per-file atom index と照合し、broken link / 欠落 ID 0 件を確認した。"
  - "atom duplicate cluster / canonical overlay を再監査し、45 group は既存 overlay で fold 済み、mirror conflict 0 件を確認した。"
  - "shared-reads 派生 sidecar を規定順で再生成した: title canonical 109、mixed duplicate 26、open duplicate 30、stale triage 0、group action 0。"
  - "posted-source index を raw Slack から再生成して 909 rows とし、Phase 3 queue を healthy 状態で再監査した。"
issues:
  - id: ISS-P3-001
    description: >-
      ready_to_post 9 件のうち 4 件は Phase 3 handoff pending だが、残る 5 件は
      verified posted-source URL 一致によって Phase 3 queue から除外される一方、
      candidate 本体が ready_to_post / next_action: post_to_shared_reads のまま残る。
      再投稿は fail-closed で防げているが、投稿済み duplicate を terminal receipt へ閉じる
      lifecycle 導線がなく、queue_count=0 と ready_to_post_count=9 が恒常的に食い違う。
    severity: medium
    evidence: >-
      tools/build_shared_reads_phase3_queue.py:35-54;
      memory/shared_reads_phase3_queue.jsonl (0 rows);
      memory/shared_reads_phase3_handoff_inbox.jsonl (pending 4);
      memory/shared_reads_posted_source_index.jsonl rows 105,115,138,724,746;
      memory/shared_reads_candidates/20260516_pokeagent_challenge.md;
      memory/shared_reads_candidates/20260529_gamedevbench_agentic_game_development.md;
      memory/shared_reads_candidates/20260610_temporal_design_developer_perspectives.md;
      memory/shared_reads_candidates/20260628_clue_driven_investigative_narratives.md;
      memory/shared_reads_candidates/20260628_snap_controllable_interactive_narrative.md
    source_file_status: >-
      UTF-8 明示読みは正常。5 candidate は status / candidate_status が ready_to_post で一致するが、
      posted-source index は同一 URL の posted_verified=true を保持するため、source 間の operational state が不一致。
    display_or_tooling_status: none
    why_blocks_game_memory: >-
      投稿待ちと投稿済み重複を同じ open lifecycle として数えるため、将来のゲーム制作資料の配送 backlog、
      oldest-first 順序、完了判定を正しく読めず、再評価対象の検索性を落とす。
recommendation:
  needs_design: true
  priority_issues: [ISS-P3-001]
probe_lifecycle:
  inspected_due_count: 0
  inspected_probe_id: null
  outcome: none
  counts:
    pending: 0
    resolved: 11
    dormant: 1
candidate_lifecycle:
  total_files: 1478
  status_counts:
    posted: 737
    ready_to_post: 9
    postponed: 203
    failed: 529
    needs_review: 0
  overdue_open_total: 4
  missing_stale_after_total: 3
  missing_stale_after_scope: "posted terminal files only; reassessment queue への影響なし"
stale_review_batch: []
stale_backlog:
  overdue_open_total: 4
  stale_triage_queue_rows: 0
  open_duplicate_group_count: 30
  mixed_group_count: 26
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
  deferred_group_leases:
    - id: gha-e6d4d4b5a37a0808
      group_key: "joint agent memory and exploration learning via novelty signals"
      retry_after: "2026-09-19T14:08:16+09:00"
      covered_overdue_candidates: 2
    - id: gha-2313a247c62a9028
      group_key: "an exploration of collision based enemy morphology generation"
      retry_after: "2026-09-19T14:08:16+09:00"
      covered_overdue_candidates: 2
group_action_handoff: []
phase3_delivery_audit:
  queue_count: 0
  handoff_pending_count: 4
  ready_to_post_count: 9
  posted_source_suppressed_count: 5
  posted_source_index_status: healthy
raw_archive_audit:
  total_files: 247
  inactive_30d_or_more: 244
  archived_this_cycle: 0
  decision: >-
    memory/raw は Slack 原文・外部資料の provenance 保持層であり、古いことだけを根拠に移動しない。
    現行参照を壊す明確な archive 対象は確認できなかった。
encoding_audit:
  memory_md_utf8_decode: ok
  representative_terms:
    記憶: 22
    ゲーム設計: 8
    敵パターン: 1
    評価軸: 0
  source_file_status: >-
    UTF-8 decode error と U+FFFD は MEMORY.md で 0。評価軸の literal 不在は現行 index 内容によるもので、
    文字化け根拠ではない。既知の atom sr-1776127289-4d9239b255 には source 自体の U+FFFD が残るが、
    単一 row の既知データ品質警告であり、今回の構造 issue には昇格しない。
  display_or_tooling_status: none
inbox_audit:
  slack_directives_pending: 0
  slack_broadcasts_pending: 0
  handled_updates: 0
validation:
  memory_index: ok
  atom_mirror_counts: "atoms.jsonl=3001, per-file=3001, index=3001"
  atom_content_conflicts: 0
  duplicate_clusters: 45
  probe_lifecycle_errors: 0
  group_handoff_errors: 0
  candidate_handoff_errors: 0
  phase3_handoff_errors: 0
```

## Phase 4b: 仕組み検討 (条件起動)

```yaml
designs:
  - issue_id: ISS-P3-001
    problem_restatement: >-
      verified posted-source による再投稿抑止は機能しているが、その判定が queue からの除外だけで終わるため、
      candidate の open 状態と Slack 上の投稿済み状態を結ぶ durable receipt がない。
      このため配送安全性は保たれていても、backlog 数、oldest-first 順序、完了判定の正本が一致しない。
    alternatives:
      - name: 案A・effective status を読み取り時に合成
        sketch: >-
          candidate が ready_to_post でも、healthy な posted-source index に verified URL 一致があれば、
          audit と一覧では effective_status: posted として扱う。candidate 本体は変更しない。
        pros:
          - 既存 candidate と handoff schema を変えずに backlog 表示を直せる。
          - posted-source index が stale の時は従来状態へ戻せるため可逆性が高い。
        cons:
          - candidate frontmatter の open 状態と next_action は矛盾したまま残る。
          - consumer ごとに effective status 合成を実装すると、正本が暗黙化して判定差が再発する。
          - terminal receipt が残らず、なぜ閉じたかを candidate 単体から追えない。
        migration_cost: low
      - name: 案B・既存 Phase 3 handoff に recovered_existing mode を追加
        sketch: >-
          queue 構築時の verified URL 一致を黙って捨てず、action: recover_existing_post として既存 handoff ledger に渡す。
          Phase 3 は candidate fingerprint、healthy な posted-source、permalink を再確認し、Slack 投稿なしで candidate を posted に閉じ、
          delivery_mode: recovered_existing を持つ terminal receipt を残す。
        pros:
          - 既存の fingerprint、oldest-first、candidate/staging evidence、partial retry の境界を再利用できる。
          - candidate、posted-source、ledger が terminal 状態で一致し、監査値も自然に収束する。
          - 新規投稿と既投稿回収を delivery_mode で区別でき、再投稿を fail-closed のまま保てる。
        cons:
          - handoff schema と validator に mode 分岐が必要になる。
          - recovery では duplicate preflight の skip を成功条件として扱うため、通常投稿の continue 条件と明示的に分離する必要がある。
          - 既存5件を一度だけ backfill して terminal receipt へ閉じる移行が必要になる。
        migration_cost: medium
      - name: 案C・queue builder が一致時に candidate を直接 terminal 化
        sketch: >-
          verified posted-source URL 一致を検出した時点で、queue builder 自身が candidate frontmatter を posted に更新し、
          next_action を none にする。別の handoff は作らない。
        pros:
          - 1回の queue 再生成で5件の不一致を解消できる。
          - 新しい queue や ledger 種別を増やさずに済む。
        cons:
          - 再生成可能な view の builder が source lifecycle を更新するため責務が混ざる。
          - candidate 更新と evidence 記録の途中失敗を回復する durable receipt がない。
          - 誤一致時の変更理由と復旧経路が案Bより弱い。
        migration_cost: low
    recommended: 案B・既存 Phase 3 handoff に recovered_existing mode を追加
    recommended_reason: >-
      現行の Phase 3 handoff はすでに state fingerprint、permalink、candidate/staging evidence、partial retry を持ち、
      投稿済み状態へ閉じる境界に最も近い。mode 追加の移行手間はあるが、新しい独立 ledger を増やさず、
      candidate を正本として terminal 化できる。失敗時も candidate を ready_to_post のまま保ち、
      posted-source が healthy かつ verified URL 一致、permalink 取得済みという条件が揃うまで resolve しなければよいため、
      誤った再投稿や証拠なしの完了へ倒れにくい。
    decision: introduce
    decision_reason: >-
      問題は5件の一時的な表示ずれではなく、verified duplicate を lifecycle terminal へ運ぶ導線の欠落であり、
      今後も同じ stale open state を生成しうる。既存 handoff の安全境界を保った小さな schema 拡張で恒久的に閉じられ、
      現時点で対象5件と証拠行も特定済みなので Phase 4c に進める。
    outline_for_4c:
      - "Phase 3 queue / handoff record に action: normal_post | recover_existing_post を追加し、terminal receipt に delivery_mode を保存する。"
      - "verified URL 一致を単純除外せず recovery handoff 候補へ変換し、posted-source index が healthy で permalink を持つ場合だけ enqueue する。"
      - "recovery resolve は candidate fingerprint を再検証し、preflight: skip と exact verified match を成功条件にして、Slack へ投稿せず status / candidate_status を posted、next_action を none にする。"
      - "terminal receipt に matched canonical URL、permalink、posted-source provenance、candidate evidence、staging evidence、delivery_mode: recovered_existing を保存する。"
      - "途中失敗は partial/pending のまま残し、通常投稿の preflight: continue 条件と recovery 条件を validator で混同しない。"
      - "既存5 candidate を同じ経路で backfill し、ready_to_post 4件、handoff pending 4件、queue 0件という期待値を再監査する。"
      - "同一 URL の verified match、title-only match、stale index、permalink 欠落、fingerprint 変更、冪等再実行を検証する。"
```

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
