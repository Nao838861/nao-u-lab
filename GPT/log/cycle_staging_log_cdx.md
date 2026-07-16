# log_cdx Cycle Staging — 2026-07-17 06:13

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
- `memory/shared_reads_candidates/20260717_agentmeter_model_cli_matching.md` — local task agent を model 単体でなく CLI harness との構成単位で測る AGENTMETER。ゲームの headless test / playtest agent の評価系に接続し得る外部資料として収集。
- pending directives: 0 件、pending broadcasts: 0 件。
- 既存素材 `RNG-Bench` は同 URL の candidate が既に存在したため、新規ファイルを作成しなかった（preflight ログあり）。

## Phase 2: 分析
```yaml
total_candidates: 1
pass:
  - memory/shared_reads_candidates/20260717_agentmeter_model_cli_matching.md
fail: []
postpone: []
stale_reviewed: []
group_actions: []
duplicate_preflight:
  - path: memory/shared_reads_candidates/20260717_agentmeter_model_cli_matching.md
    decision: continue
    canonical_url: https://arxiv.org/abs/2606.21140
    title_key: agentmeter evaluating model cli matching for cli based local task solving agents
```

## Phase 3: Shared-reads 投稿
```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260717_agentmeter_model_cli_matching.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784236763584529
    char_count: 4532
    decision: partial_adoption
    review: "必須6項目、URL末尾、禁止表現なし、policy check 3400-4600字を通過。model-CLI を配備単位として測る原則と expensive failure、Core→full validation を採用し、AMS の重み・価格 snapshot・一般 CLI task の順位は移植しない。"
skipped: []
```

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1778480570-a136f0227a
    source_ts: "1778480570.779749"
    title: "Project DENT を2記事の対比で読む"
    reason: "未レビューの score 11 atom で、優先6タグをすべて持つ。AI弱点の検知後に editor / 人間操作へ切り替え、責任境界を操作系へ落とす知見が新しい行動になるか確認した。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 2
    non_redundancy: 0
    risk_control: 3
    reversibility: 3
    total: 14
  decision: reject
  decision_reason: "必須閾値と合計14は満たすが、control ownership / handoff cue / override / fallback は既存 shared-control handoff probe、model / tool / editor / harness の失敗層分離は既存 attribution probe と重複する。新規 probe は2観点を責任境界という名前で再結合して active probe 群を肥大化させるため、読了記録だけを残す。"
  change:
    summary: "reviewed_source_ts と reject 理由のみ更新。probe・評価表・directive・恒久ルールは追加しなかった。"
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
  - "memory/MEMORY.md を validate_memory_index.py で監査し、per-file atom index との不一致 0 件を確認した。UTF-8 明示読みでは『記憶』『ゲーム設計』『敵パターン』を取得でき、『評価軸』は現本文に語として存在しないだけで source 破損ではない。"
  - "memory/atoms.jsonl 2679 rows を memory_health.py と build_atom_duplicate_groups.py --check で監査した。duplicate id / parse error はなく、既知の normalized-content 40 groups と title+excerpt 5 groups は canonical overlay 45 groups に収載済み。"
  - "memory/raw/ の mtime 30日超ファイルを監査し、archive 候補 93 件を確認した。raw 原文保持契約があるため、この phase では移動・削除していない。"
  - "shared-reads lifecycle 969 files を dry-run 監査した。posted=412, ready_to_post=10, postponed=401, failed=124, needs_review=22, missing_stale_after=6, overdue postponed/needs_review=231。candidate 本体は変更していない。"
  - "mixed duplicate / stale triage / group action sidecar を再生成した（83 groups / 50 rows / 35 actionable groups）。"
  - "Slack inbox は directives 0 pending / broadcasts 0 pending のため close 更新なし。"
issues:
  - id: ISS-ATOM-GENERIC-TITLES
    description: "recall-visible atom に内容を識別できない generic title の未整理群が残り、既存 duplicate overlay の外に同名 atom が散在している。"
    severity: medium
    evidence: "tools/memory_health.py: repeated_title_groups raw=22, recall_visible=15, ungrouped=14（例: 『■ 概要』20 rows, 『@』3 rows, 『■ メリット・デメリット』3 rows）; memory/atoms/title_quality_audit.jsonl 378 rows"
    source_file_status: "atoms.jsonl は UTF-8/JSON parse 正常、2679 rows、duplicate id 0。内容破損ではなく title metadata の検索性問題。"
    display_or_tooling_status: none
    why_blocks_game_memory: "ゲーム制作中に手法名や失敗型で検索しても generic title が識別子にならず、同名の候補から次作へ移すべき知見を選べない。"
  - id: ISS-SR-OVERDUE-BACKLOG
    description: "postponed / needs_review の overdue backlog が stale triage sidecar の上限を超え、mixed duplicate の open sibling が再評価待ちとして残っている。"
    severity: medium
    evidence: "candidate audit overdue_for_reassessment=231; memory/shared_reads_stale_triage_queue.jsonl=50 rows; memory/shared_reads_group_action_queue.jsonl=35 groups; mixed duplicate queue=83 groups"
    source_file_status: "candidate frontmatter 969 files は UTF-8 で読取可能。status 内訳と stale_after は dry-run audit から取得。"
    display_or_tooling_status: none
    why_blocks_game_memory: "既投稿・失敗済み sibling と未決 candidate が同じ探索棚に残り、新しいゲームへ転用価値の高い資料を選ぶ Phase 2 の少数精読枠を消費する。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-ATOM-GENERIC-TITLES
stale_backlog:
  overdue_open_total: 231
  stale_triage_queue_rows: 50
  actionable_group_count: 35
  backlog_high_water: true
  group_handoff_budget: 3
  handed_off_group_count: 3
group_action_handoff:
  - group_key: "from world gen to quest line a dependency driven prompt pipeline for coherent rpg generation"
    representative: memory/shared_reads_candidates/20260527_dependency_driven_rpg_generation.md
    open_siblings:
      - memory/shared_reads_candidates/20260526_world_gen_to_quest_line_rpg_pipeline.md
      - memory/shared_reads_candidates/20260527_dependency_driven_rpg_generation.md
      - memory/shared_reads_candidates/20260625_dependency_driven_rpg_generation.md
      - memory/shared_reads_candidates/20260708_rpg_dependency_prompt_pipeline.md
    terminal_siblings:
      - memory/shared_reads_candidates/20260515_world_gen_quest_line_dependency_pipeline.md
      - memory/shared_reads_candidates/20260609_world_gen_to_quest_line_rpg_pipeline.md
    latest_evidence: "stale_after=2026-06-26; 評価・比較・結論の根拠が薄く、原文補完後の group 単位再評価が必要。"
  - group_key: "large language models as pokemon battle agents strategic play and content generation"
    representative: memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
    open_siblings:
      - memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
    terminal_siblings:
      - memory/shared_reads_candidates/20260515_pokemon_battle_llm_agents.md
      - memory/shared_reads_candidates/20260518_pokemon_battle_llm_agents.md
    latest_evidence: "stale_after=2026-06-26; arXiv ID の時系列確認と出典信頼性の再評価が必要。"
  - group_key: "one policy infinite npcs persona traceable shared rl policies for scalable game agents"
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
    latest_evidence: "stale_after=2026-06-28; 評価設定と persona traceability の根拠が薄く、現行ゲームへの転用範囲も限定的。"
stale_review_batch:
  - path: memory/shared_reads_candidates/20260527_procedural_personas_mcts_playtesting.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "game_transfer_value=high; procedural persona と MCTS による headless 評価のプレイスタイル分解へ直結する。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260527_runtime_pcg_autonomous_agents.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "game_transfer_value=high; runtime PCG の autonomous validation は近いが、実験結果の一次確認が不足。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260529_agent_island_multiagent_games.md
    status: postponed
    stale_after: "2026-06-28"
    priority_reason: "game_transfer_value=high; multi-agent game benchmark の転用価値が高く、mixed duplicate の代表として整理可能。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260529_opengame_agentic_coding_for_games.md
    status: postponed
    stale_after: "2026-06-28"
    priority_reason: "game_transfer_value=high; playable browser game 生成と現行 Phase 0 の接続が強い。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260530_agentic_pcg_tool_using_llms.md
    status: postponed
    stale_after: "2026-06-29"
    priority_reason: "既投稿 permalink が根拠にあり、mixed duplicate sibling を terminal 化できる可能性が高い。"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)
```yaml
designs:
  - issue_id: ISS-ATOM-GENERIC-TITLES
    problem_restatement: "既存 title_cluster_index は同一 title・tags・kind・source の cluster size >= 2 にだけ補助ラベルを出すため、分類キーで singleton に分かれた generic title は識別不能のまま残る。また補助ラベルは表示時の曖昧さを減らすが、手法名や失敗型として再利用できる意味的 title metadata にはならない。raw atom を壊さず、generic title 全件に検索・表示可能な安定した意味的別名を与える必要がある。"
    alternatives:
      - name: "案A: raw title の一括 retitle"
        sketch: "title_quality_audit の retitle 対象を人手または自動抽出で命名し直し、atoms.jsonl と per-file atom の title を同期更新する。以後の recall は既存 title をそのまま検索・表示する。"
        pros:
          - "検索と表示の双方が単純になり、別名解決層を増やさない。"
          - "atom 単体を開いた時にも内容を識別できる。"
        cons:
          - "dual-write 中の正本を大量更新し、原文由来 metadata と派生名の境界が曖昧になる。"
          - "自動命名の誤りを raw atom に固定し、rollback と差分レビューのコストが高い。"
          - "378 audit rows の一括移行は今回の medium severity に対して変更範囲が大きい。"
        migration_cost: high
      - name: "案B: 既存 title cluster sidecar を semantic alias へ拡張"
        sketch: "title_cluster_index の非破壊・再生成可能という契約を保ちつつ、cluster size に関係なく generic title の atom を対象にする。本文の見出し・固有名・trigger・source を優先順位付きで使い、semantic_alias と生成根拠を記録し、recall の検索語と表示 title の補助に使う。"
        pros:
          - "raw atom と dual-write 経路を変更せず、既存 sidecar / recall 統合を小さく拡張できる。"
          - "分類キーで singleton になった14 groupも同じ仕組みで覆える。"
          - "派生名と根拠を再生成・監査でき、誤命名時は sidecar の修正だけで戻せる。"
        cons:
          - "source 本文が薄い atom では alias の品質が安定せず、fallback が必要になる。"
          - "raw title と表示・検索 alias の二層を利用者が理解する必要がある。"
          - "既存 index の名称と cluster 前提が実態に合わなくなるため、互換 field を残す設計が要る。"
        migration_cost: medium
      - name: "案C: 新規 ingest の generic title 拒否のみ"
        sketch: "ingest 時に boilerplate title を検出し、本文から title を生成できない atom を quarantine または警告対象にする。既存378 audit rowsは変更せず、増加だけを止める。"
        pros:
          - "将来の負債増加を入口で抑えられる。"
          - "既存 atom の移行が不要で、導入範囲が小さい。"
        cons:
          - "現在 recall-visible な未整理群を解消せず、Phase 4a の blocker が残る。"
          - "section heading が原文上の正当な title であるケースを誤って拒否し得る。"
          - "quarantine を増やすと、有用本文まで recall から落とす可能性がある。"
        migration_cost: low
    recommended: "案B: 既存 title cluster sidecar を semantic alias へ拡張"
    recommended_reason: "現行の非破壊 sidecar と memory_recall の接続を再利用でき、raw atom の大量書換えより失敗時のコストが低い。既存問題の中心である singleton 化した generic title も覆え、新規の独立 index を増やさずに済む。alias の品質が不足する atom は raw title + source_ts + atom id の deterministic fallback に戻せるため、段階導入と rollback が容易である。"
    decision: introduce
    decision_reason: "問題は source 破損ではなく既存表示補助の coverage gap と検索 alias 不足に限定でき、拡張先も既存 title_cluster_index / memory_recall に定まっている。378件の raw metadata migration を避けながら medium severity の検索性問題を直接改善できるため、Phase 4c で bounded implementation に進める。"
    outline_for_4c:
      - "generic title 判定を既存 memory_recall と index builder で共有し、cluster size に関係なく対象 atom を sidecar に収載する。"
      - "semantic_alias の抽出優先順位を、本文中の明示的な記事・論文名または括弧付き主題、trigger の識別句、keyword_hint、deterministic fallback の順に固定し、alias_source を記録する。"
      - "既存 cluster_id・display_disambiguator field の後方互換性を保ったまま、semantic_alias を recall の検索対象と表示補助に加える。raw title、atoms.jsonl、per-file atom は変更しない。"
      - "title_quality_audit の recall-visible ungrouped generic 件数と semantic alias coverage / fallback 件数を Phase 4a で監査できるようにする。"
      - "『■ 概要』『@』『■ メリット・デメリット』を fixture に、固有名抽出、singleton coverage、fallback、既存 non-generic title 非変更を検証する。"
```

## Phase 4c: 導入 (条件起動)
```yaml
implemented:
  - issue_id: ISS-ATOM-GENERIC-TITLES
    files_changed:
      - path: tools/atom_title_clusters.py
        change: modified
      - path: tools/memory_recall.py
        change: modified
      - path: tools/build_atom_title_quality_audit.py
        change: modified
      - path: tools/test_atom_title_clusters.py
        change: created
      - path: memory/atoms/title_cluster_index.jsonl
        change: modified
      - path: memory/atoms/title_quality_audit.jsonl
        change: modified
      - path: memory/atoms/title_quality_audit_README.md
        change: modified
      - path: log/cycle_staging_log_cdx.md
        change: modified
    summary: "generic title 判定と semantic alias 抽出を sidecar builder / recall で共有し、singleton generic atom も検索・表示 alias の対象にした。raw atom title は変更していない。"
    partial: false
migrations:
  - what: "title_cluster_index と title_quality_audit を全 atom から再生成"
    affected: "title cluster 484 行 / 634 members、title quality audit 603 行。recall-visible generic 341 件は本文由来 alias 341 / fallback 0。"
verification:
  - "python -m unittest tools\\test_atom_title_clusters.py: 4 tests passed（■ 概要、@、■ メリット・デメリット、non-generic singleton）。"
  - "build_atom_title_cluster_index.py --check: current (484 title clusters)。"
  - "build_atom_title_quality_audit.py --check: current (603 audit rows)。"
  - "memory_recall.py 'HarnessFix 失敗層' --limit 1 --no-log --compact: semantic alias で対象 atom を検索・表示できた。"
```

## Phase 5: 日記投稿
```yaml
posted:
  channel: "#log"
  permalink: https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1784237360512469
  char_count: 2103
  verification: ok
  draft: drafts/phase5_log_diary_20260717_0613_cdx.md
```
