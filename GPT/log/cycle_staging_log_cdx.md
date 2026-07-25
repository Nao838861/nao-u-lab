# log_cdx Cycle Staging — 2026-07-25 22:58

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
- `memory/shared_reads_candidates/20260725_dark_maze_custom_web_engine_postmortem.md` — 純 JavaScript / Canvas 製ホラーゲームで、grid と視界制限による緊張設計、描画と物理の分離、browser audio・responsive 配布制約をまとめた postmortem。
- duplicate preflight: `continue`。canonical URL は `https://itch.io/devlog/1583161/designing-a-web-horror-game-from-scratch-decisions-process-learnings.amp`。
- pending 確認: `slack_directives.jsonl` / `slack_broadcasts.jsonl` ともに 0 件。直近の web_research / atom / raw Slack URL は既投稿 work が中心だったため、新規検索で上記 1 件を収集。

## Phase 2: 分析
```yaml
total_candidates: 6
pass:
  - memory/shared_reads_candidates/20260518_personalized_super_mario_level_gan.md
  - memory/shared_reads_candidates/20260725_dark_maze_custom_web_engine_postmortem.md
fail:
  - path: memory/shared_reads_candidates/20260525_deadhaus_persistent_history_rpg.md
    reason: "発売前構想と標語が中心で、実装手順・検証結果・小型ゲームへの具体的転用を抽出できない"
postpone:
  - path: memory/shared_reads_candidates/20260518_pcg_player_personas_evolution.md
    reason: "persona/metric 定義、進化処理、比較結果が abstract 相当の保持情報から不足"
  - path: memory/shared_reads_candidates/20260526_designing_game_feel_survey.md
    reason: "survey の選別・統合方法、domain 境界、反例を復元する本文情報が不足"
  - path: memory/shared_reads_candidates/20260526_sphinx2_narrative_puzzles_open_world.md
    reason: "puzzle heuristics、生成手順、study 規模が不足"
stale_reviewed:
  - handoff_id: cha-7d7eec4047f90523
    path: memory/shared_reads_candidates/20260518_pcg_player_personas_evolution.md
    previous_status: postponed
    decision: postpone
    updated_stale_after: "2026-08-24"
  - handoff_id: cha-01ebba9044c990d2
    path: memory/shared_reads_candidates/20260518_personalized_super_mario_level_gan.md
    previous_status: needs_review
    decision: pass
    updated_stale_after: "2026-08-24"
  - handoff_id: cha-603b87c1142f5203
    path: memory/shared_reads_candidates/20260525_deadhaus_persistent_history_rpg.md
    previous_status: postponed
    decision: fail
    updated_stale_after: "2026-08-24"
  - handoff_id: cha-ce982a94c61840b7
    path: memory/shared_reads_candidates/20260526_designing_game_feel_survey.md
    previous_status: postponed
    decision: postpone
    updated_stale_after: "2026-08-24"
  - handoff_id: cha-596516996450148c
    path: memory/shared_reads_candidates/20260526_sphinx2_narrative_puzzles_open_world.md
    previous_status: postponed
    decision: postpone
    updated_stale_after: "2026-08-24"
candidate_handoff_audit:
  pending_before: 5
  read_ids:
    - cha-7d7eec4047f90523
    - cha-01ebba9044c990d2
    - cha-603b87c1142f5203
    - cha-ce982a94c61840b7
    - cha-596516996450148c
  resolved_ids:
    - cha-7d7eec4047f90523
    - cha-01ebba9044c990d2
    - cha-603b87c1142f5203
    - cha-ce982a94c61840b7
    - cha-596516996450148c
  deferred_ids: []
  partial_ids: []
  pending_after: 0
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

## Phase 3: Shared-reads 投稿
```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260518_personalized_super_mario_level_gan.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784989190154389
    char_count: 4231
skipped:
  - candidate: memory/shared_reads_candidates/20260725_dark_maze_custom_web_engine_postmortem.md
    reason: "元記事に端末別測定、frame timing の実装値、公開前後比較、playtest 規模、失敗件数がなく、3500-4500字へ広げると一般論が原資料を上回る"
    action: postpone
reviewed_at: "2026-07-25T23:20:35+09:00"
```

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1784980873-acd9f46f98
    source_ts: "1784980873.267569"
    title: "Sakura Danmaku — AIの局所生成・検査と人間のsystem-level判断を分けた8日間の弾幕制作postmortem"
    reason: "未レビュー条件を満たす最新のscore 12 atomで、memory・harness・game-design・operation・evaluationの5優先タグを持つ。AIの生成量を増やした後に、rule相互作用・支配戦略・視認性・score economyをどの検査主体と証拠へ割り当てるかが、次のprototypeで既存controlと異なる判断差を作るか確認するため選んだ。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 2
    non_redundancy: 1
    risk_control: 1
    reversibility: 3
    total: 13
  decision: reject
  decision_reason: "合計13で採用条件の14に届かず、risk_controlも必須閾値2を下回る。原典は局所task／interaction監査、固定tick・seed・input trace、policy別replay、score内訳・難易度順序・視認性・mechanic間衝突を具体化する一方、単独作者・1作品の自己報告で、対照制作、工数内訳、採用率、player数、完走率、死亡地点、難易度曲線、視認性testを欠く。既存のlocal/global evaluator、rules-core regression、feedback-loop evidence、human calibration probesが同じ次回判断をすでに覆い、321件のactive_probesとPhase 4a向けpending leaseがあるため、複合controlを追加しない。"
  existing_probes:
    - probe-20260609-local-constraint-global-evaluator-split
    - probe-20260603-rules-core-parity-regression
    - probe-20260606-game-feedback-loop-asymmetry
    - probe-20260608-calibration-boundary-human-judgment
  change:
    summary: "reviewed/source_tsと、既存controlとの重複およびprobe inventory過多によるreject理由だけをstateへ記録した。probe・metric・lease・directive・恒久ルールは追加していない。"
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
  - "memory/MEMORY.md の atom index 50件を atoms.jsonl と照合し、broken link 0件を確認"
  - "atoms.jsonl 2748件の ID 重複 0件、per-file/index mirror の欠落・parse error・content conflict 0件を確認"
  - "shared-reads title canonical / mixed / open-group / stale-triage / group-action sidecar を再生成"
  - "期限超過 candidate 176件から group lease と重複しない5件を candidate handoff inbox へ冪等 enqueue"
  - "Slack directive / broadcast の pending 0件を確認（handled 更新対象なし）"
  - "30日超の raw 95件を監査し、一次資料・Slack archive の正本保持を優先して移動なし"
issues: []
recommendation:
  needs_design: false
  priority_issues: []
encoding_audit:
  source_file_status: "memory/MEMORY.md は UTF-8 明示読みで有効。代表語「記憶」「ゲーム設計」「敵パターン」を取得。「評価軸」は現行 index 本文に完全一致語がないが、文字化け兆候ではない"
  display_or_tooling_status: "none"
atom_audit:
  rows: 2748
  duplicate_id_count: 0
  raw_normalized_content_duplicate_groups: 40
  recall_visible_normalized_content_duplicate_groups: 3
  content_fold_status: "既存 normalized_content_hash fold が適用済み"
  mirror_content_conflicts: 0
  lifecycle_status_counts:
    active: 2560
    superseded: 188
  note: "既存 title-quality sidecar が扱う repeated-title warning はあるが、新規の構造設計 issue にはしない"
candidate_lifecycle_audit:
  files: 1099
  status_counts:
    posted: 482
    ready_to_post: 10
    postponed: 330
    failed: 259
    needs_review: 17
    skipped_unreviewed: 1
  skipped_unreviewed_files: 25
  no_frontmatter: 0
  missing_stale_after: 4
  missing_stale_after_open_candidate_count: 0
  overdue_for_reassessment: 176
  current_state_conflicts: 0
raw_archive_audit:
  older_than_30_days: 95
  action: "hold_in_place"
  reason: "memory/raw は一次資料の正本で、最古層も Slack archive・PDF・抽出 text が中心。Phase 4a での移動は検索導線を弱めるため見送った"
title_duplicate_audit:
  terminal_canonical_groups: 68
  suppressible_siblings: 0
  mixed_groups: 49
  open_duplicate_groups: 56
  all_open_groups: 7
stale_backlog:
  overdue_open_total: 176
  stale_triage_queue_rows: 50
  open_duplicate_group_count: 56
  mixed_group_count: 49
  all_open_group_count: 7
  actionable_group_count: 0
  backlog_high_water: false
  high_water_reason: "overdue_open_total > queue rows だが actionable group が3件未満（0件）のため"
  group_handoff_budget: 1
  handed_off_group_count: 0
  handoff_inbox_pending_count: 0
  handoff_inbox_ids: []
  candidate_handoff_enqueued_count: 5
  candidate_handoff_pending_count: 5
  candidate_handoff_ids:
    - cha-6df20308349a54b1
    - cha-e1325aa5c667bff9
    - cha-d9f9926e64a0e43f
    - cha-510a9b82a4883c83
    - cha-b14b34231ab45641
  remaining_overdue_backlog: 171
group_action_handoff: []
probe_lifecycle:
  inspected_due_count: 0
  inspected_probe_id: null
  outcome: none
  next_pending_probe_id: probe-20260724-minimum-sufficient-scope-ladder
  next_lease_due: "2026-07-31T00:23:59+09:00"
  counts:
    pending: 1
    resolved: 1
    dormant: 1
    merged: 0
    retired: 0
  validate_errors: 0
stale_review_batch:
  - handoff_id: cha-6df20308349a54b1
    path: memory/shared_reads_candidates/20260527_ai_enhanced_mda_educational_game_design.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "AI×MDA は転用価値があるが、設計手順・評価対象・失敗条件を本文から補う必要がある"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-e1325aa5c667bff9
    path: memory/shared_reads_candidates/20260527_capcom_ai_playtesting_debug_agents.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "routine check と director concept 照合 agent は有用だが、一次 interview で運用フローと発見例を確認する必要がある"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-d9f9926e64a0e43f
    path: memory/shared_reads_candidates/20260527_death_howl_genre_blend_design.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "prototype と tester 反応から genre が立ち上がる設計観点は有用だが、探索・戦闘・死亡回収の具体を再読する必要がある"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-510a9b82a4883c83
    path: memory/shared_reads_candidates/20260527_personified_llm_crowdsourced_gui_testing.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "persona 別 GUI 探索を game UI へ転用できるが、評価条件と bug 発見差の本文確認が必要"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-b14b34231ab45641
    path: memory/shared_reads_candidates/20260527_programming_smart_playtesting.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "DSL / agent-based playtesting は headless regression に接続可能だが、DSL 構文・実験設計・比較結果が不足"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
