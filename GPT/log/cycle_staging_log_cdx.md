# log_cdx Cycle Staging — 2026-07-18 09:58

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260718_one_page_designs_communication.md` — 厚い design bible や分断された wiki に代えて、職種横断で設計意図を共有する One Page Designs の構成例と運用を収集。
- inbox 確認: `slack_directives.jsonl` / `slack_broadcasts.jsonl` の `status: pending` は 0 件。
- duplicate preflight: 既投稿 URL 一致 4 件を `skip` として非作成し、preflight log に根拠を保存。追加照合で判明したローカル既存 candidate 3 件も重複作成せず。

## Phase 2: 分析

```yaml
total_candidates: 1
pass:
  - memory/shared_reads_candidates/20260718_one_page_designs_communication.md
fail: []
postpone: []
stale_reviewed: []
group_actions: []
duplicate_preflight:
  decision: continue
  canonical_url: https://www.gamedeveloper.com/design/-the-goal-of-design-is-to-efficiently-communicate-ideas-
  title_key: the goal of design is to efficiently communicate ideas
evaluation_note: >-
  定量評価はなく制作事例と教育実践による定性的根拠に留まるが、問題設定、着想、
  手法の中核、運用例、結論を抽出できる。短期プロトタイプの実装前レビューへ直接適用でき、
  根拠の限界を含めて約4000字の現行フォーマットに展開可能なため pass とした。
```

## Phase 3: Shared-reads 投稿

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260718_one_page_designs_communication.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784337079340619
    char_count: 3641
skipped: []
```

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1778512954-3a1fe1c038
    source_ts: "1778512954.541829"
    title: "graphiti Temporal Context Graph — `[統合済 YYYY-MM-DD]` マーカーの時間軸2点拡張版"
    reason: >-
      未レビュー中最高の score 16 atom で memory・game-design・agent・operation の4優先タグを持つ。
      valid_at / invalid_at と replaced_by による記憶の現役・退役分離が、現在の
      directive・candidate・atom lifecycle に新しい行動差を作るか確認するため選んだ。
  scores:
    relevance: 3
    actionability: 1
    evidence: 3
    non_redundancy: 0
    risk_control: 3
    reversibility: 3
    total: 13
  decision: reject
  decision_reason: >-
    actionability が2未満、合計が14未満で採用条件を満たさない。投稿が提案した
    superseded・置換先・current / historical の分離は、現在の directive frontmatter、
    Slack inbox lifecycle、atom lifecycle で既に実装されている。さらに active な
    probe-20260710-automem-memory-action-audit が supersede_missing を、
    probe-20260709-atma-state-role-ghost-memory-check が current / historical / superseded と
    根拠 link を直接確認する。新しい2時点 probe や schema field を足すと既存機構の
    言い換えと317件の active probe 群の肥大化になるため反映しない。
  change:
    summary: reviewed_source_ts と reject 理由だけを更新。probe・評価表・directive・恒久ルールの追加なし。
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```

## Phase 4a: 整理 + 問題抽出

```yaml
cleaned:
  - memory/shared_reads_mixed_duplicate_queue.jsonl を再生成し、83 group・既存出力との差分なしを確認した。
  - memory/shared_reads_stale_triage_queue.jsonl を 2026-07-18 基準で再生成し、上限 50 行・既存出力との差分なしを確認した。
  - memory/shared_reads_group_action_queue.jsonl を再生成し、35 actionable group・既存出力との差分なしを確認した。
  - slack_directives.jsonl / slack_broadcasts.jsonl の pending は各 0 件で、handled 更新対象なしを確認した。
audits:
  memory_index:
    validator: OK
    broken_index_links: 0
    source_file_status: >-
      memory/MEMORY.md は UTF-8 明示読みで正常。代表語は「記憶」「ゲーム設計」
      「敵パターン」を取得でき、「評価軸」は現在の本文に完全一致なし。ただし
      evaluation tag と評価本文は正常に読め、index validator も通過しているため
      source file 破損とは判定しない。
    display_or_tooling_status: none
  atoms:
    rows: 2683
    mirror_counts:
      atoms_jsonl: 2683
      per_file_md: 2683
      index_jsonl: 2683
    mirror_conflicts: 0
    duplicate_ids: 0
    normalized_content_duplicate_groups: 40
    normalized_content_duplicate_rows: 80
    lifecycle_fold_extra_rows: 40
    canonical_overlay_groups: 45
    contradiction_result: >-
      exact-content 重複は既存 lifecycle / canonical overlay の fold 対象であり、
      atoms.jsonl・per-file・index 間の content conflict は 0。新しい矛盾は検出しなかった。
  raw_archive:
    older_than_30_days: 93
    archive_review_candidates:
      web_research: 85
      headless_eval: 6
    retained_operational_sources:
      slack_archive: 1
      other_state_file: 1
    action: >-
      91 件を archive 候補として識別したが、candidate / atom の provenance path を
      壊さないことをこのフェーズでは確認し切れないため移動しなかった。
  candidate_lifecycle:
    candidate_md_files: 980
    lifecycle_counts:
      posted: 416
      ready_to_post: 10
      postponed: 406
      failed: 125
      needs_review: 22
    non_candidate_readme_files: 1
    open_without_stale_after: 3
issues:
  - id: ISS-4A-STALE-META
    description: >-
      needs_review の3候補に stale_after がなく、日付基準の stale triage queue へ
      入る経路がない。
    severity: low
    evidence: >-
      memory/shared_reads_candidates/20260529_godot_30day_narrative_prototype.md;
      memory/shared_reads_candidates/20260529_stealth_lighting_readability.md;
      memory/shared_reads_candidates/20260529_text_animation_player_attention.md
    source_file_status: >-
      3ファイルとも UTF-8 読みと status: needs_review は正常。frontmatter の
      stale_after field だけが欠落している。
    display_or_tooling_status: none
    why_blocks_game_memory: >-
      古い候補を再評価・明示保持・fail のいずれにも送れず、ゲーム制作知見の
      採否が未決のまま検索対象に滞留する。
recommendation:
  needs_design: false
  priority_issues: []
  rationale: >-
    ISS-4A-STALE-META は既存 lifecycle 契約に沿う metadata backfill で解消できる。
    duplicate / stale backlog には既に group-action queue と bounded handoff があり、
    新しい仕組みの設計を起動する根拠はない。
stale_backlog:
  overdue_open_total: 236
  stale_triage_queue_rows: 50
  actionable_group_count: 35
  backlog_high_water: true
  group_handoff_budget: 3
  handed_off_group_count: 3
  previous_phase2_group_actions: 0
  budget_reason: >-
    overdue_open_total が sidecar 収載行数を超え、actionable group も3件以上あるため、
    この cycle の高水位条件を満たす。
group_action_handoff:
  - group_key: from world gen to quest line a dependency driven prompt pipeline for coherent rpg generation
    representative: memory/shared_reads_candidates/20260527_dependency_driven_rpg_generation.md
    open_siblings:
      - memory/shared_reads_candidates/20260526_world_gen_to_quest_line_rpg_pipeline.md
      - memory/shared_reads_candidates/20260527_dependency_driven_rpg_generation.md
      - memory/shared_reads_candidates/20260625_dependency_driven_rpg_generation.md
      - memory/shared_reads_candidates/20260708_rpg_dependency_prompt_pipeline.md
    terminal_siblings:
      - memory/shared_reads_candidates/20260515_world_gen_quest_line_dependency_pipeline.md
      - memory/shared_reads_candidates/20260609_world_gen_to_quest_line_rpg_pipeline.md
    latest_evidence:
      path: memory/shared_reads_candidates/20260527_dependency_driven_rpg_generation.md
      stale_after: "2026-06-26"
      reason: >-
        age_days=22; mixed duplicate group present; 依存関係付きprompt pipelineという着想とゲーム制作への接続は明確だが、候補本文では評価の中身、比較対象、結論の強さが不足している。 4000字概要を書くと一般論で膨らませる危険があるため、Phase 3投稿には回さず、原文またはraw詳細を補って再評価する。
  - group_key: large language models as pokemon battle agents strategic play and content generation
    representative: memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
    open_siblings:
      - memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
    terminal_siblings:
      - memory/shared_reads_candidates/20260515_pokemon_battle_llm_agents.md
      - memory/shared_reads_candidates/20260518_pokemon_battle_llm_agents.md
    latest_evidence:
      path: memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
      stale_after: "2026-06-26"
      reason: >-
        age_days=22; mixed duplicate group present; 抽録メモから評価指標と turn-based battle testbed の方向性は読めるが、arXiv ID が 2512 で現在日付から見て時系列確認が必要。 その確認なしに #shared-reads へ出すと出典信頼性が弱く、ゲーム制作への適用も現状は「LLM evaluator に使えそう」に留まる。
  - group_key: one policy infinite npcs persona traceable shared rl policies for scalable game agents
    representative: memory/shared_reads_candidates/20260529_one_policy_infinite_npcs.md
    open_siblings:
      - memory/shared_reads_candidates/20260527_one_policy_infinite_npcs.md
      - memory/shared_reads_candidates/20260529_one_policy_infinite_npcs.md
      - memory/shared_reads_candidates/20260620_pcsp_persona_traceable_npcs.md
      - memory/shared_reads_candidates/20260628_pcsp_persona_traceable_npcs.md
      - memory/shared_reads_candidates/20260708_persona_traceable_shared_rl_npcs.md
      - memory/shared_reads_candidates/20260709_persona_traceable_shared_rl_npcs.md
    terminal_siblings:
      - memory/shared_reads_candidates/20260526_one_policy_infinite_npcs.md
      - memory/shared_reads_candidates/20260608_pcsp_persona_traceable_npcs.md
      - memory/shared_reads_candidates/20260609_persona_traceable_shared_rl_npcs.md
      - memory/shared_reads_candidates/20260617_persona_traceable_shared_rl_npcs.md
      - memory/shared_reads_candidates/20260618_persona_traceable_shared_policy_npcs.md
    latest_evidence:
      path: memory/shared_reads_candidates/20260529_one_policy_infinite_npcs.md
      stale_after: "2026-06-28"
      reason: >-
        age_days=20; mixed duplicate group present; persona-conditioned shared RL policy の中核と速度・規模の利点は見えるが、候補メモだけでは環境設定、報酬設計、persona traceability の評価手順がまだ薄い。ゲーム制作への適用は life sim / colony 系に寄るため、現行制作サイクルへ無理に一般化す...
stale_review_batch: []
stale_review_note: >-
  stale triage queue 上位50件はすべて duplicate_group_key を持つため、candidate単位の
  handoff は作らなかった。選択した3 groupの representative / open_siblings とも重複なし。
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
