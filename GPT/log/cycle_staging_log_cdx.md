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

```yaml
designs:
  - issue_id: ISS-CROSS-CYCLE-HANDOFF-LOSS
    problem_restatement: "group_action_handoff は次サイクルの Phase 2 が消費する情報なのに、寿命が当該サイクル限りの staging にだけ保存されている。producer と consumer の間で staging が初期化されるため、現契約では正常実行しても handoff が必ず失われ、同じ group が queue 上位に滞留する。"
    alternatives:
      - name: 永続handoff inbox
        sketch: "Phase 4a が選んだ group を、group_key と source_cycle_id を持つ永続 inbox に pending として upsert する。Phase 2 は oldest pending を先に読み、group_actions を記録した時点で handled evidence を残し、staging には当該cycleの入出力だけを鏡写しする。"
        pros:
          - "staging 初期化や途中失敗をまたいで handoff を保持できる"
          - "pending / handled と根拠が残り、未処理と再処理を区別できる"
          - "既存の再生成可能 group action queue と candidate lifecycle を変更せず接続できる"
        cons:
          - "新しい runtime state と lifecycle 管理が1つ増える"
          - "producer の upsert と consumer の acknowledge を冪等にする必要がある"
        migration_cost: medium
      - name: staging carry-forward
        sketch: "cycle runner が staging を初期化する直前に前cycleの group_action_handoff を読み、新stagingの Phase 2 input 節へコピーする。処理済み判定も新staging内の group_actions との照合で行う。"
        pros:
          - "追加する永続ファイルがなく、既存staging形式に近い"
          - "runner と phase prompt の小さい変更で始められる"
        cons:
          - "報告書である staging が runtime queue を兼ね、責務が曖昧になる"
          - "copy と acknowledge の間の失敗で欠落または重複しやすい"
          - "2 cycle 以上未処理の item や監査履歴を表現しにくい"
        migration_cost: low
      - name: Phase 2でqueueから再選択
        sketch: "Phase 4a からの handoff を廃止し、Phase 2 が毎cycle shared_reads_group_action_queue を直接読み、budget と優先順をその場で再計算する。"
        pros:
          - "跨cycleの受け渡しstateを持たずに済む"
          - "queue が再生成可能という既存性質をそのまま利用できる"
        cons:
          - "Phase 4a の高水位判定と選定判断を Phase 2 に重複実装する"
          - "queue 再生成による順位変化で古い group が飢餓化し得る"
          - "producer が何を渡し consumer が何を処理したかの対応が残らない"
        migration_cost: low
    recommended: 永続handoff inbox
    recommended_reason: "失敗原因は選定ロジックではなく寿命の異なるデータを staging に置いたことなので、consumer が acknowledge するまで残る小さな inbox が問題境界に最も直接対応する。carry-forward より変更量は増えるが、失敗時にも pending を失わず、queue 本体や candidate を壊さないため復旧コストが低い。"
    decision: introduce
    decision_reason: "severity high で、直前cycleの3 groupが実際に未処理となり再掲されている。schema、producer、consumer、完了条件を限定でき、現時点で postpone すべき不確定要素はない。"
    outline_for_4c:
      - "group_key + source_cycle_id を一意キーとし、pending / handled、選定根拠、payload、handled evidence を持つ永続handoff inboxを追加する"
      - "Phase 4a の選定後に冪等upsertし、現cycleの3 groupも初期pendingとして移行する"
      - "Phase 2 は新規candidateより先に oldest pending をbudget内で消費し、group_actions記録後に同じitemをhandledへ遷移させる"
      - "staging は当該cycleで読んだitemと処理結果の表示に限定し、inbox未処理件数とIDを監査情報として残す"
      - "staging初期化、再実行、途中失敗、同一group再選定で欠落・二重処理しないことをfixtureで検証する"

  - issue_id: ISS-POSTED-DUPLICATE-INDEX-GAP
    problem_restatement: "現行 posted_source_urls は duplicate title group に入った candidate frontmatter からだけ作られるため、単独の既投稿candidate、legacy投稿、candidateと実投稿の対応が欠けた投稿を被覆しない。実際の投稿有無と派生candidate indexの収載条件が一致せず、preflightが既投稿を continue にしている。"
    alternatives:
      - name: 実投稿source indexを分離
        sketch: "raw Slack の #shared-reads 実投稿履歴を主入力に、posted candidate metadata を補助入力として、正規化source URLから permalink / ts / title evidence / candidate pathへ引ける再生成可能indexを作る。preflightはこのURL indexを先に照合し、既存title canonical indexを第二段に使う。"
        pros:
          - "実際に投稿された事実を正本にでき、legacy投稿やcandidate欠落も拾える"
          - "title groupの整理用indexと投稿済みURL台帳の責務を分離できる"
          - "rawから再生成でき、手修正に依存せずprovenanceを保持できる"
        cons:
          - "Slack本文から対象source URLと投稿permalinkを抽出する規則が必要になる"
          - "raw Slack取り込みが遅延している時のfreshness判定を設ける必要がある"
          - "同一研究のversion違い、PDF/abstract違いをwork単位へ正規化する設計が要る"
        migration_cost: medium
      - name: title canonical indexを全posted candidateへ拡張
        sketch: "duplicate groupだけという収載条件を外し、posted singletonも shared_reads_title_canonical_index に入れる。現行 posted_source_urls と preflight の読み口は維持する。"
        pros:
          - "既存loaderとpreflightをほぼそのまま使える"
          - "candidateが存在するposted singletonのURL gapは小さい変更で埋まる"
        cons:
          - "candidateが存在しないlegacy投稿とmetadata欠落は依然として拾えない"
          - "title duplicate整理用sidecarに投稿台帳の責務が混ざる"
          - "index収載増加がreview queueなど既存consumerの意味を変え得る"
        migration_cost: low
      - name: preflightでraw Slackを毎回横断
        sketch: "独立indexを持たず、candidate作成前に shared-reads raw履歴を全走査してURLとtitleを比較する。Phase 3で今回行った手動確認をpreflightへ直接組み込む。"
        pros:
          - "実投稿履歴を直接参照できる"
          - "新しいmaterialized indexの同期処理が不要"
        cons:
          - "候補ごとに長いrawを走査し、定時cycleのコストが増える"
          - "抽出・正規化結果を監査しにくく、consumerごとに処理が分散する"
          - "rawの増加に伴って性能と再現性が悪化する"
        migration_cost: low
    recommended: 実投稿source indexを分離
    recommended_reason: "今回重複を止めた最終根拠はraw Slackの実投稿履歴であり、candidate lifecycleはその代理にすぎない。専用indexなら現行title canonical indexのgroup意味を壊さず、URL-first判定だけを完全化できる。抽出誤り時もrawと既存Phase 3照合を残せるため、誤skipと重複postの双方を監査・復旧しやすい。"
    decision: introduce
    decision_reason: "OpenLifeの同一URLとCoopEvalの既投稿分析で再現例があり、現状はPhase 3の人手相当横断照合に依存している。入力正本、index責務、preflight順序が定まり、Phase 4cで小さく導入可能である。"
    outline_for_4c:
      - "source URL正規形、work identity、Slack ts/permalink、title evidence、candidate path、provenanceを持つ再生成可能なposted-source indexを追加する"
      - "raw Slack実投稿を主入力、status postedのcandidate metadataを補助入力としてbackfillし、CoopEvalとOpenLifeを回帰fixtureにする"
      - "一般的なtracking除去に加え、同一研究のversion suffixとPDF/abstract差を吸収するdomain限定work identity規則を定義する"
      - "duplicate preflightをposted-source URL/work一致のskip、title canonical一致のreview、新規のcontinueという順序へ接続する"
      - "indexがrawより古い、抽出不能、provenance不足の場合はcontinueではなくreviewへ倒し、Phase 3のraw照合を安全網として維持する"
```

## Phase 4c: 導入 (条件起動)

```yaml
implemented:
  - issue_id: ISS-CROSS-CYCLE-HANDOFF-LOSS
    files_changed:
      - path: tools/shared_reads_group_handoff.py
        change: created
      - path: tools/test_shared_reads_group_handoff.py
        change: created
      - path: memory/shared_reads_group_handoff_inbox.jsonl
        change: created
      - path: phases/phase2_analyze.md
        change: modified
      - path: phases/phase4a_cleanup.md
        change: modified
      - path: phases/README.md
        change: modified
    summary: "Phase 4a の group 選定を composite ID で冪等 upsertし、Phase 2 が group_actions 記録後だけ acknowledge する persistent inbox を導入した。staging は当該cycleの表示に限定した。"
    partial: false
  - issue_id: ISS-POSTED-DUPLICATE-INDEX-GAP
    files_changed:
      - path: tools/shared_reads_posted_source_index.py
        change: created
      - path: tools/build_shared_reads_posted_source_index.py
        change: created
      - path: tools/test_shared_reads_posted_source_index.py
        change: created
      - path: tools/shared_reads_duplicate_preflight.py
        change: modified
      - path: tools/shared_reads_title_index.py
        change: modified
      - path: tools/test_shared_reads_duplicate_preflight.py
        change: modified
      - path: memory/shared_reads_posted_source_index.jsonl
        change: created
      - path: phases/phase1_collect.md
        change: modified
      - path: phases/phase2_analyze.md
        change: modified
      - path: memory/shared_reads_candidates/README.md
        change: modified
      - path: memory/directive_shared_reads_candidate_gate_20260512.md
        change: modified
    summary: "raw Slack 実投稿を主入力、posted candidate metadata を補助入力にした再生成可能 source index を追加し、URL/work skip、title review、新規 continue の順へ preflight を接続した。stale・抽出不能・provenance不足は review に倒す。"
    partial: false
migrations:
  - what: "現cycleの group_action_handoff 3件を source_cycle_id=2026-07-18 22:43 の pending item として永続 inbox へ移行"
    affected: "memory/shared_reads_group_handoff_inbox.jsonl の3件。既存candidate frontmatterと派生queueは変更していない。"
  - what: "raw shared-reads 投稿と status: posted candidate metadata から posted-source index を backfill"
    affected: "source 539行。CoopEval/OpenLifeを含む。URL未抽出109投稿はmetadataに保持し、該当titleのpreflightをreviewへ倒す。"
verification:
  - "python -m unittest discover -s tools -p 'test_shared_reads_*py': 10 tests OK。staging reset、再実行、途中ack、同一group再選定、work identity、CoopEval/OpenLife fixtureを確認。"
  - "python tools/build_shared_reads_posted_source_index.py --check: rows=539、現raw/candidate snapshotと一致。"
  - "python tools/shared_reads_group_handoff.py audit: rows=3、pending_count=3、errors=[]。同cycle再enqueueは3件とも already_enqueued。"
  - "実データpreflight: CoopEval 2604.15267 と OpenLife 2606.31046 はともに posted_source_work_match / skip（期待終了コード3）。"
  - "python tools/memory_recall.py 'group action handoff shared reads' --limit 3 --no-log: 正常に3件recall。"
  - "python tools/codex_phases_cycle.py --dry-run: Phase 1〜5と条件付き4b/4cのplanを正常出力。"
  - "関連Python 5ファイルの py_compile 成功。"
```

## Phase 5: 日記投稿
(Phase 5 が書き込む)
