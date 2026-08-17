# log_cdx Cycle Staging — 2026-08-18 01:58

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260818_mariopcg_semantic_granularity.md` — 自然言語制御の Mario レベル生成で、データセットと tile 表現の意味粒度が観測される instruction-following 性能をどう変えるかを扱う論文。

## Phase 2: 分析
```yaml
total_candidates: 9
pass:
  - memory/shared_reads_candidates/20260818_mariopcg_semantic_granularity.md
fail:
  - path: memory/shared_reads_candidates/20260530_apex_policy_exploration_self_evolving_agents.md
    reason: "posted-source canonical URL が既投稿 APEX と一致し、新規差分がない。"
  - path: memory/shared_reads_candidates/20260602_ca2_code_aware_game_testing.md
    reason: "posted-source canonical URL が既投稿 CA2 と一致し、新規差分がない。"
  - path: memory/shared_reads_candidates/20260719_flow_aware_rl_navigation.md
    reason: "posted-source arXiv work identity が既投稿版と一致し、新規差分がない。"
postpone:
  - path: memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
    reason: "実投稿と同一 arXiv work。参照用に保留。"
  - path: memory/shared_reads_candidates/20260531_mimic_py_personality_driven_game_testing.md
    reason: "実投稿と同一 canonical URL。参照用に保留。"
  - path: memory/shared_reads_candidates/20260531_pixie_code_level_mechanic_generation.md
    reason: "実投稿と同一 AIIDE URL。参照用に保留。"
  - path: memory/shared_reads_candidates/20260602_fly_fail_fix_iterative_game_repair.md
    reason: "publisher 版と既投稿 arXiv 版が同一 work で、新規差分がない。"
  - path: memory/shared_reads_candidates/20260602_gameuiagent_structured_ir.md
    reason: "実投稿と同一 arXiv work。参照用に保留。"
group_actions:
  - group_key: "apex autonomous policy exploration for self evolving llm agents"
    representative: memory/shared_reads_candidates/20260530_apex_policy_exploration_self_evolving_agents.md
    action: close_siblings
    target_paths:
      - memory/shared_reads_candidates/20260530_apex_policy_exploration_self_evolving_agents.md
    reason: "posted-source preflight が同一 arXiv work の canonical URL 一致で skip。代表候補に既投稿版との差分がないため、残る open sibling だけを重複として閉じる。"
    terminal_evidence:
      - path: memory/shared_reads_candidates/20260525_apex_policy_exploration.md
        evidence: "posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779669494944199"
      - path: memory/shared_reads_candidates/20260528_apex_autonomous_policy_exploration.md
        evidence: "posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779971995584189"
    representative_decision: fail
    analysis_time_minutes: 2
  - group_key: "ca2 code aware agent for automated game testing"
    representative: memory/shared_reads_candidates/20260602_ca2_code_aware_game_testing.md
    action: close_siblings
    target_paths:
      - memory/shared_reads_candidates/20260602_ca2_code_aware_game_testing.md
    reason: "posted-source preflight が同一 arXiv work の canonical URL 一致で skip。call stack 利用という手法にも既投稿版との差分がないため、残る open sibling だけを重複として閉じる。"
    terminal_evidence:
      - path: memory/shared_reads_candidates/20260528_ca2_code_aware_game_testing.md
        evidence: "posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779915242282019"
    representative_decision: fail
    analysis_time_minutes: 2
  - group_key: "flow aware optimal navigation in unsteady flows through reinforcement learning"
    representative: memory/shared_reads_candidates/20260719_flow_aware_rl_navigation.md
    action: close_siblings
    target_paths:
      - memory/shared_reads_candidates/20260719_flow_aware_rl_navigation.md
    reason: "posted-source preflight が URL の scheme 差を越えて同一 arXiv work identity で skip。観測戦略と評価結論も既投稿版と同じため、残る open sibling だけを重複として閉じる。"
    terminal_evidence:
      - path: memory/shared_reads_candidates/20260720_flow_aware_navigation_unsteady_flows.md
        evidence: "posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784488268673889"
    representative_decision: fail
    analysis_time_minutes: 2
group_handoff_audit:
  pending_before: 3
  read_ids:
    - gha-00d22909169258c0
    - gha-c4797ef1c6d64bdb
    - gha-21a4035411e0d199
  resolved_ids:
    - gha-00d22909169258c0
    - gha-c4797ef1c6d64bdb
    - gha-21a4035411e0d199
  deferred_ids: []
  partial_ids: []
  apply_counts:
    candidates_updated: 3
    already_terminal: 0
  pending_after: 0
stale_reviewed:
  - handoff_id: cha-cb10f4942c224e4a
    path: memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
    previous_status: postponed
    decision: postpone
    updated_stale_after: "2026-09-17"
  - handoff_id: cha-624c309f599462ba
    path: memory/shared_reads_candidates/20260531_mimic_py_personality_driven_game_testing.md
    previous_status: postponed
    decision: postpone
    updated_stale_after: "2026-09-17"
  - handoff_id: cha-364e9c70f11b0b65
    path: memory/shared_reads_candidates/20260531_pixie_code_level_mechanic_generation.md
    previous_status: postponed
    decision: postpone
    updated_stale_after: "2026-09-17"
  - handoff_id: cha-1f8724afd851de32
    path: memory/shared_reads_candidates/20260602_fly_fail_fix_iterative_game_repair.md
    previous_status: postponed
    decision: postpone
    updated_stale_after: "2026-09-17"
  - handoff_id: cha-dbb5c187d8597ecd
    path: memory/shared_reads_candidates/20260602_gameuiagent_structured_ir.md
    previous_status: postponed
    decision: postpone
    updated_stale_after: "2026-09-17"
candidate_handoff_audit:
  pending_before: 5
  read_ids:
    - cha-cb10f4942c224e4a
    - cha-624c309f599462ba
    - cha-364e9c70f11b0b65
    - cha-1f8724afd851de32
    - cha-dbb5c187d8597ecd
  resolved_ids:
    - cha-cb10f4942c224e4a
    - cha-624c309f599462ba
    - cha-364e9c70f11b0b65
    - cha-1f8724afd851de32
    - cha-dbb5c187d8597ecd
  deferred_ids: []
  partial_ids: []
  pending_after: 0
unreviewed_intake_audit:
  valid_backlog_before: 1
  malformed_count: 0
  oldest_collected_at: "2026-08-18T02:01:19+09:00"
  selection_limit: 5
  selected_paths: []
  phase1_excluded_paths:
    - memory/shared_reads_candidates/20260818_mariopcg_semantic_granularity.md
  evaluated_paths:
    - memory/shared_reads_candidates/20260818_mariopcg_semantic_granularity.md
  valid_backlog_after: 0
```

## Phase 3: Shared-reads 投稿
```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260818_mariopcg_semantic_granularity.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786987097063549
    char_count: 4138
skipped: []
review:
  source_checked: "OpenReview forum・検索 index 上の PDF 本文断片・実験表を照合"
  duplicate_preflight: continue
  policy_check: ok
  decision: posted
```

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1786978764-276f31071e
    source_ts: "1786978764.031099"
    title: "Postmortem: Kraven Manor"
    reason: "score 11 の最新未レビュー atom で、memory・harness・game-design・operation・evaluation の5優先タグを持つ。structured randomness の technical／playable／variation proof を分ける知見が、次の小規模 game prototype で既存 control と異なる判断差を作れるか確認するため1件だけ選んだ。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 2
    non_redundancy: 1
    risk_control: 2
    reversibility: 3
    total: 14
  decision: defer
  decision_reason: "content multiplier の概算と technical／playable／variation proof の分離は行動化できるが、単一 project の定性的 postmortem で比較 playtest や体験指標がない。既存の scope brief、hypothesis contract、acceptance surface、PCG tool-loop／layout-responsibility probes と部分重複し、現在の staging には procedural prototype、固定版 baseline、seed trace、人間 playtest がない。後続 Phase 4a は memory cleanup で実 consumer ではなく lease の consumer／artifact／判断差を指定できないため、state-only review に留める。"
  change:
    summary: "reviewed_source_ts と defer 理由のみ更新。active_probes・probe lifecycle ledger・directive・恒久ルールは変更していない。"
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
  - "memory/MEMORY.md は Markdown link 0 件で broken link なし。UTF-8 明示読みで代表語 `記憶` / `ゲーム設計` / `敵パターン` / `評価軸` を確認した。"
  - "memory/atoms.jsonl 2,892 件と per-file/index 各 2,892 件の mirror は一致し、content conflict 0 件。既知の duplicate cluster 45 群は canonical overlay と整合していた。"
  - "memory/raw/ の最終更新 30 日超 242 ファイルを監査した。shared-reads 原文、web research、headless 評価などの provenance なので、経過日数だけを根拠に移動せず保持した。"
  - "shared-reads candidate 1,319 件の lifecycle を監査した（failed 473 / needs_review 2 / posted 628 / postponed 207 / ready_to_post 9）。期限到来 open candidate 9 件を bounded handoff 対象にした。"
  - "open duplicate group / stale triage / group action sidecar を再生成し、1 group と単独 candidate 5 件を Phase 2 inbox へ冪等 enqueue した。"
  - "slack_directives.jsonl 23 行と slack_broadcasts.jsonl 21 行は pending 0 件で、handled 更新対象なし。"
  - "due probe lease は 0 件。ledger validate は errors 0 件だった。"
issues:
  - id: ISS-UTF8-001
    description: "atom `sr-1776127289-4d9239b255` の `エージェント` が raw provenance の時点から `エ��ジェント` に破損している。memory_health のもう1件の suspect `gr-1777083728-44d444ab7a` は UTF-8 明示読みで正常だった。"
    severity: low
    evidence: "memory/raw/slack_archive/shared-reads.jsonl:492; memory/atoms/2026-04/sr-1776127289-4d9239b255.md:3"
    source_file_status: "UTF-8 明示読みで raw source と per-atom file の双方に U+FFFD 2 文字を確認。source data 側の局所破損。"
    display_or_tooling_status: none
    why_blocks_game_memory: "`エージェント` の正規語検索で当該 atom の title / trigger が一致しにくくなるが、1 件のみで recall smoke 3 系統は通過している。"
recommendation:
  needs_design: false
  priority_issues: []
probe_lifecycle:
  inspected_due_count: 0
  inspected_probe_id: null
  outcome: none
  counts:
    pending: 0
    resolved: 7
    dormant: 1
stale_backlog:
  overdue_open_total: 9
  stale_triage_queue_rows: 6
  open_duplicate_group_count: 32
  mixed_group_count: 29
  all_open_group_count: 3
  actionable_group_count: 1
  backlog_high_water: false
  group_handoff_budget: 1
  handed_off_group_count: 1
  handoff_inbox_pending_count: 1
  handoff_inbox_ids:
    - gha-d857aeccc08f3b2d
  candidate_handoff_pending_count: 5
  candidate_handoff_ids:
    - cha-66d0b730ba18b0e9
    - cha-05fd895ca58ba1da
    - cha-5cb62d987bf773f6
    - cha-1ffffc0935d57786
    - cha-fa011f8dcfd37664
  valid_unreviewed_count: 0
  oldest_unreviewed_collected_at: null
  malformed_candidate_count: 0
  phase2_unreviewed_limit: 5
group_action_handoff:
  - handoff_id: gha-d857aeccc08f3b2d
    group_key: "tabletop roleplaying games as procedural content generators"
    representative: memory/shared_reads_candidates/20260719_tabletop_roleplaying_games_as_pcg.md
    open_siblings:
      - memory/shared_reads_candidates/20260719_tabletop_roleplaying_games_as_pcg.md
    terminal_siblings:
      - memory/shared_reads_candidates/20260713_ttrpg_as_procedural_content_generators.md
    latest_evidence: "stale_after=2026-08-18; open duplicate group present; candidate は概念対応の要約に留まり、case study の比較と設計知見の再評価が必要。"
stale_review_batch:
  - handoff_id: cha-66d0b730ba18b0e9
    path: memory/shared_reads_candidates/20260719_ai_npc_social_presence_open_world.md
    status: postponed
    stale_after: "2026-08-18"
    priority_reason: "541名調査の差分は有用だが、尺度・統計手法・効果量・交絡と限界が不足している。"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-05fd895ca58ba1da
    path: memory/shared_reads_candidates/20260719_ax_vs_hx_ai_playtesting.md
    status: postponed
    stale_after: "2026-08-18"
    priority_reason: "AX/HX の役割分離は有用だが、prototype 条件・指標・比較結果・issue 内訳が不足している。"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-5cb62d987bf773f6
    path: memory/shared_reads_candidates/20260719_context_quality_agent_preflight.md
    status: postponed
    stale_after: "2026-08-18"
    priority_reason: "context 品質基準は適用可能だが、juror 手順・実験規模・効果量と失敗例が不足している。"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-1ffffc0935d57786
    path: memory/shared_reads_candidates/20260719_forged_reasoning_agent_memory.md
    status: postponed
    stale_after: "2026-08-18"
    priority_reason: "reasoning trace 汚染は重要だが、検査 signal・攻撃条件・比較防御・モデル別結果が不足している。"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-fa011f8dcfd37664
    path: memory/shared_reads_candidates/20260719_open_dialogue_llm_npcs.md
    status: postponed
    stale_after: "2026-08-18"
    priority_reason: "会話型 NPC への接続は強いが、形式化・実装構成・評価方法・結果・限界が不足している。"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
