# log_cdx Cycle Staging — 2026-07-18 22:43

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260718_coopeval_v2_social_dilemmas.md` — 社会的ジレンマで協力を均衡として維持する mechanism と LLM agent を比較する benchmark。
- `memory/shared_reads_candidates/20260718_openlife_open_world_agents.md` — 記憶・知覚・評価・予算 process に囲まれた長期稼働 LLM agent の open-world ALIFE 実験。
- `memory/shared_reads_candidates/20260718_bayesevolve_belief_guided_experimentation.md` — 実験履歴を uncertainty-aware belief state に変えて次試行を選ぶ discovery framework。
- `memory/shared_reads_candidates/20260718_llm_vulnerability_lifecycle_stack_survey.md` — LLM system の攻撃面を data から deployment まで8段階で整理する lifecycle survey。
- `memory/shared_reads_candidates/20260718_decisionperceiver_interaction_aware_driving.md` — 可変数 agent の相互作用を固定長 latent へ集約する DecisionPerceiver。
- 収集元: `memory/raw/web_research/results.jsonl` の 2026-07-18T22:21:03 batch。duplicate preflight は5件とも `continue`。
- Slack inbox: directives pending 0件 / broadcasts pending 0件。品質判定・Slack投稿・記憶整理は未実施。

## Phase 2: 分析

```yaml
total_candidates: 5
pass:
  - memory/shared_reads_candidates/20260718_coopeval_v2_social_dilemmas.md
  - memory/shared_reads_candidates/20260718_openlife_open_world_agents.md
fail:
  - path: memory/shared_reads_candidates/20260718_llm_vulnerability_lifecycle_stack_survey.md
    reason: "8段階 taxonomy は有用だが、比較評価とゲーム固有の適用 probe が不足"
  - path: memory/shared_reads_candidates/20260718_decisionperceiver_interaction_aware_driving.md
    reason: "自動運転固有の実証からゲーム NPC への転用距離が大きく、結果詳細も不足"
postpone:
  - path: memory/shared_reads_candidates/20260718_bayesevolve_belief_guided_experimentation.md
    reason: "belief 更新法・baseline・数値結果を補えば parameter tuning への適用を再評価可能"
stale_reviewed: []
group_actions: []
```

## Phase 3: Shared-reads 投稿

```yaml
posted: []
skipped:
  - candidate: memory/shared_reads_candidates/20260718_coopeval_v2_social_dilemmas.md
    reason: "同一論文 v1 の詳細分析が既に #shared-reads にあり、v2 の中核結論も既存投稿と重複する"
    action: postpone
    evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778536700085879"
  - candidate: memory/shared_reads_candidates/20260718_openlife_open_world_agents.md
    reason: "同一 URL の分析が既に #shared-reads にある。既存本文は英語のため、日本語版へ置換する場合は重複投稿ではなく既存メッセージの扱いを別途決める"
    action: candidate_revise
    evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783304602130549"
duplicate_preflight_note: "tools/shared_reads_duplicate_preflight.py は両件を continue と返したが、memory/raw/slack_api/shared-reads.jsonl の実投稿履歴で重複を確認した"
```

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1784375330-b722b58ff8
    source_ts: "1784375330.114349"
    title: "WhisperBench — 外部文書から durable memory を介して後続行動を変える stealth memory injection"
    reason: "未レビューで最新の score 10 atom。memory・agent・operation・evaluation の4優先タグを持ち、外部入力を atom・長期記憶へ取り込む現在の運用で、時間差の行動変化を既存 probe の重複なしに測れるか確認するため選んだ。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 3
    non_redundancy: 1
    risk_control: 2
    reversibility: 3
    total: 15
  decision: adopt_metric
  decision_reason: "採用条件を満たす。既存 probe は provenance、memory の失敗段階、ingest と execution の authority boundary をすでに扱うため、新規 active probe は追加しない。差分は、次の該当1件で durable adoption、write visibility、delayed action effect、正当 control memory の recall 維持を一つの isolated synthetic case で分離測定する点に限定する。攻撃 payload 生成や本番環境での試験は行わない。"
  metric:
    name: memory_adoption_to_delayed_effect_split
    scope: "次の memory-ingest / recall / summarization / promotion 変更のうち、隔離した synthetic case で確認できる1件だけ"
    check: "benign control と実害のない偽 fact/preference を隔離入力に混ぜ、untrusted 内容の durable adoption、write/diff の可視化、別 session 相当の後続判断変化、正当 control memory の recall 維持を別々に記録する。"
    withdrawal_condition: "既存3 probes だけで同じ四分割と停止判断が残る、隔離 fixture を安全に作れない、または記録が判断を変えなければ再利用しない。"
  change:
    summary: "次の該当 memory lifecycle 変更1件だけに使う可逆 metric を state に追加。新規 active probe、directive、schema、恒久ルールは追加していない。"
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
  - "shared_reads の mixed duplicate / stale triage / group action の3派生queueを現行candidate正本から再生成した。3ファイルとも既存内容と一致し、差分はなかった。"
  - "MEMORY.md の索引を per-file atom index と照合し、broken link 0件を確認した。"
  - "slack_directives.jsonl / slack_broadcasts.jsonl の pending がともに0件であることを確認した。handled更新は不要だった。"

memory_index_audit:
  broken_links: 0
  source_file_status: "UTF-8明示読みで本文を取得でき、記憶 / ゲーム設計 / 敵パターンを確認。評価軸という代表語は本文に現れないが、UTF-8破損やbroken linkではない。"
  display_or_tooling_status: none

atom_audit:
  atoms_jsonl: 2690
  per_file_md: 2690
  index_jsonl: 2690
  mirror_missing_or_conflicts: 0
  raw_normalized_content_duplicate_groups: 40
  recall_visible_normalized_content_duplicate_groups: 3
  recall_visible_content_folded_extra_rows: 3
  contradiction_or_content_conflict: false
  note: "raw重複は lifecycle/content fold で想起表示から畳み込まれ、三者ミラーにもcontent_conflictsはない。既存title quality auditは603行を収載している。"

encoding_audit:
  source_file_status: "MEMORY.mdはUTF-8として正常。memory_healthのmojibake suspectは2 atomで、前回監査済みの単発source damage 1件とheuristic false positive 1件から増えていない。"
  display_or_tooling_status: none
  action: "表示経路のmojibakeやMEMORY.md破損ではないため、本文の再生成・手修復は行わない。"

raw_archive_audit:
  inactive_over_30d_files: 93
  inactive_over_30d_bytes: 62759242
  by_area:
    web_research: 85
    headless_eval: 6
    slack_archive: 1
    sync_state: 1
  archived: []
  note: "多くは一次資料・評価traceで、raw保持原則と既存atomのprovenanceに関わる。安全に移動できる明確な一時物は特定できず、機械的archiveは行わない。"

candidate_lifecycle_audit:
  files: 995
  status_counts:
    posted: 422
    ready_to_post: 10
    postponed: 414
    failed: 127
    needs_review: 22
  missing_stale_after: 3
  missing_stale_after_note: "3件ともstatus: postedのterminal candidateで、再評価queue対象外。補完更新はしない。"
  overdue_open_total: 239
  unindexed_duplicate_title_groups: 25
  mixed_duplicate_queue_rows: 84

previous_cycle_handoff_audit:
  previous_phase4a_commit: 1fdb75261
  previous_handed_off_group_count: 3
  current_phase2_group_actions: 0
  current_phase2_stale_reviewed: 0
  same_top_groups_remain_actionable: true
  staging_reset_evidence:
    - phases/README.md:41
    - tools/codex_phases_cycle.py:172
    - tools/codex_phases_cycle.py:202
    - tools/codex_phases_cycle.py:453

issues:
  - id: ISS-CROSS-CYCLE-HANDOFF-LOSS
    description: "Phase 4aのgroup_action_handoffがサイクル末尾のstagingだけに残り、次サイクル開始時のstaging初期化でPhase 2が読む前に失われる。直前サイクルで渡した3 groupは現Phase 2でgroup_actions 0件のまま、同じqueue上位に残った。"
    severity: high
    evidence: "commit 1fdb75261 の log/cycle_staging_log_cdx.md group_action_handoff 3件; 現 staging Phase 2 group_actions: []; phases/README.md:41; tools/codex_phases_cycle.py:172-202,453"
    source_file_status: "UTF-8 sourceは正常。handoff内容と初期化契約を双方から読める。"
    display_or_tooling_status: none
    why_blocks_game_memory: "前サイクルで見つけた重複・stale knowledgeの整理判断が次の評価phaseへ届かず、同じ候補群が再提示され続ける。ゲーム制作時にcanonicalな知見へ収束せず、再評価時間と検索ノイズが減らない。"
  - id: ISS-POSTED-DUPLICATE-INDEX-GAP
    description: "URL-first duplicate preflightのposted_source_urlsが実Slack投稿履歴を十分に被覆せず、既投稿のCoopEval v2/OpenLife候補をcontinue判定した。Phase 3のraw Slack横断照合が最終安全網として重複投稿を止めた。"
    severity: medium
    evidence: "現 staging Phase 3 duplicate_preflight_note; memory/raw/slack_api/shared-reads.jsonl ts=1778536700.085879 / 1783304602.130549; memory/shared_reads_title_canonical_index.jsonl に対応URL行なし"
    source_file_status: "UTF-8 sourceは正常。raw Slackにはpermalink相当のtsと本文URLが存在し、canonical index側には対応行がない。"
    display_or_tooling_status: none
    why_blocks_game_memory: "既投稿の高品質分析がcanonical参照に結び付かず、同じ外部知見が新規candidateとして再流入する。ゲーム制作で過去分析を再利用する代わりに重複評価が発生し、どの解釈を正本として開くべきか曖昧になる。"

recommendation:
  needs_design: true
  priority_issues:
    - ISS-CROSS-CYCLE-HANDOFF-LOSS
    - ISS-POSTED-DUPLICATE-INDEX-GAP
  reason: "いずれも個別candidateの手修正では閉じず、既存phase間handoffとcanonical duplicate参照の接続契約に関わる。Phase 4aでは設計・実装せずPhase 4bへ渡す。"

stale_backlog:
  overdue_open_total: 239
  stale_triage_queue_rows: 50
  actionable_group_count: 35
  backlog_high_water: true
  high_water_reason: "overdue_open_total 239 > queue rows 50 かつ actionable groups 35 >= 3。前cycle handoffが未処理なのでbudget 3の効果はまだ確認できないが、現行契約どおりqueue順を保って再掲する。"
  group_handoff_budget: 3
  handed_off_group_count: 3
  candidate_batch_count: 0
  candidate_batch_reason: "stale triage上位50件はすべてmixed duplicate。group handoffとの二重投入を避けるためcandidate単位batchは空にした。"

group_action_handoff:
  - group_key: "from world gen to quest line a dependency driven prompt pipeline for coherent rpg generation"
    status_counts:
      failed: 1
      posted: 1
      postponed: 4
    priority_reason: "age_days=22; mixed duplicate group present; 依存関係付きprompt pipelineという着想とゲーム制作への接続は明確だが、候補本文では評価の中身、比較対象、結論の強さが不足している。"
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
      reason: "age_days=22; mixed duplicate group present; 評価の中身、比較対象、結論の強さを補って再評価する必要がある。"
    recommended_action: reevaluate_representative
  - group_key: "large language models as pokemon battle agents strategic play and content generation"
    status_counts:
      failed: 2
      postponed: 1
    priority_reason: "age_days=22; mixed duplicate group present; arXiv IDの時系列確認なしでは出典信頼性が弱く、ゲーム制作への適用もLLM evaluator候補に留まる。"
    representative: memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
    open_siblings:
      - memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
    terminal_siblings:
      - memory/shared_reads_candidates/20260515_pokemon_battle_llm_agents.md
      - memory/shared_reads_candidates/20260518_pokemon_battle_llm_agents.md
    latest_evidence:
      path: memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
      stale_after: "2026-06-26"
      reason: "age_days=22; mixed duplicate group present; 出典の時系列と評価指標を確認してから再評価する必要がある。"
    recommended_action: reevaluate_representative
  - group_key: "one policy infinite npcs persona traceable shared rl policies for scalable game agents"
    status_counts:
      failed: 3
      needs_review: 1
      posted: 2
      postponed: 5
    priority_reason: "age_days=20; mixed duplicate group present; 環境設定、報酬設計、persona traceabilityの評価手順が薄く、現行制作サイクルへ無理に一般化すべきでない。"
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
      - memory/shared_reads_candidates/20260608_pcsp_persona_traceable_shared_rl_npcs.md
      - memory/shared_reads_candidates/20260609_persona_traceable_shared_rl_npcs.md
      - memory/shared_reads_candidates/20260617_persona_traceable_shared_rl_npcs.md
      - memory/shared_reads_candidates/20260618_persona_traceable_shared_policy_npcs.md
    latest_evidence:
      path: memory/shared_reads_candidates/20260529_one_policy_infinite_npcs.md
      stale_after: "2026-06-28"
      reason: "age_days=20; mixed duplicate group present; 実験設定と評価手順を補って代表candidateを再評価する必要がある。"
    recommended_action: review_representative

stale_review_batch: []
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
