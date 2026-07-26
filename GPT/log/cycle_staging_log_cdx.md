# log_cdx Cycle Staging — 2026-07-26 09:43

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
- pending: `slack_directives.jsonl` 0件 / `slack_broadcasts.jsonl` 0件。
- `memory/shared_reads_candidates/20260726_tenshis_otome_jam_postmortem.md` — Otome Jam の複数チームで editor・CG・producer・writer・pixel artist を横断し、20人超の制作管理、layer 分離、担当者離脱時の代替制作を記録した postmortem。
- duplicate preflight: `continue`（title / URL とも既存 sidecar に同一 work なし）。

## Phase 2: 分析
```yaml
total_candidates: 6
pass: []
fail:
  - path: memory/shared_reads_candidates/20260529_webgamebench_browser_native_games.md
    reason: benchmark assets・rubric・baseline・定量結果が無く、題名由来の推測から約4000字を支えられない
  - path: memory/shared_reads_candidates/20260530_asymmetric_player_archetype_level_balancing.md
    reason: 適用先は具体的だが archetype・RL・balance 指標の詳細が無く、類似候補との差を立証できない
  - path: memory/shared_reads_candidates/20260530_diverse_behaviour_engagement_levels.md
    reason: tester persona の着想は有用だが、metric・生成法・比較条件・結果値が不足
  - path: memory/shared_reads_candidates/20260530_generalist_game_players_multiverse.md
    reason: 4層分類は索引として有用だが、代表研究の比較と評価結果がない広く浅い survey snapshot
  - path: memory/shared_reads_candidates/20260530_generative_personas_experience_humans.md
    reason: 体験仮説付き bot へ接続できるが、測定法・一致指標・baseline・結果値が不足
  - path: memory/shared_reads_candidates/20260726_tenshis_otome_jam_postmortem.md
    reason: 担当作業の列挙が中心で、管理手法・失敗原因・成果比較・再現可能な結論が薄い
postpone: []
stale_reviewed:
  - handoff_id: cha-3ad50be8d1e2f10e
    path: memory/shared_reads_candidates/20260529_webgamebench_browser_native_games.md
    previous_status: postponed
    decision: fail
    updated_stale_after: "2026-08-25"
  - handoff_id: cha-5372f8af1f9eced3
    path: memory/shared_reads_candidates/20260530_asymmetric_player_archetype_level_balancing.md
    previous_status: postponed
    decision: fail
    updated_stale_after: "2026-08-25"
  - handoff_id: cha-47597c00638ea862
    path: memory/shared_reads_candidates/20260530_diverse_behaviour_engagement_levels.md
    previous_status: needs_review
    decision: fail
    updated_stale_after: "2026-08-25"
  - handoff_id: cha-c7b051e67891d3ed
    path: memory/shared_reads_candidates/20260530_generalist_game_players_multiverse.md
    previous_status: postponed
    decision: fail
    updated_stale_after: "2026-08-25"
  - handoff_id: cha-0f42f7bf1f718f7c
    path: memory/shared_reads_candidates/20260530_generative_personas_experience_humans.md
    previous_status: needs_review
    decision: fail
    updated_stale_after: "2026-08-25"
candidate_handoff_audit:
  pending_before: 5
  read_ids:
    - cha-3ad50be8d1e2f10e
    - cha-5372f8af1f9eced3
    - cha-47597c00638ea862
    - cha-c7b051e67891d3ed
    - cha-0f42f7bf1f718f7c
  resolved_ids:
    - cha-3ad50be8d1e2f10e
    - cha-5372f8af1f9eced3
    - cha-47597c00638ea862
    - cha-c7b051e67891d3ed
    - cha-0f42f7bf1f718f7c
  deferred_ids: []
  partial_ids: []
  pending_after: 0
group_actions:
  - handoff_id: gha-508ee747e655a8f7
    group_key: reflection at design actualization rda a tool and process for research through game design
    representative: memory/shared_reads_candidates/20260611_reflection_design_actualization.md
    action: defer
    target_paths:
      - memory/shared_reads_candidates/20260611_reflection_design_actualization.md
      - memory/shared_reads_candidates/20260722_reflection_at_design_actualization.md
    reason: 同一 canonical URL の同一 work だが terminal sibling がなく、旧 postponed だけを閉じる契約もない。ready_to_post の投稿代表を失わないよう Phase 3 の結果確認まで保留する
    terminal_evidence:
      - path: memory/shared_reads_candidates/20260611_reflection_design_actualization.md
        evidence: status:postponed; source:https://arxiv.org/abs/2602.12887; old thin snapshot
      - path: memory/shared_reads_candidates/20260722_reflection_at_design_actualization.md
        evidence: status:ready_to_post; source:https://arxiv.org/abs/2602.12887; richer posting representative
    representative_decision: postpone
    analysis_time_minutes: 3
group_handoff_audit:
  pending_before: 1
  read_ids:
    - gha-508ee747e655a8f7
  resolved_ids: []
  deferred_ids:
    - gha-508ee747e655a8f7
  partial_ids: []
  apply_counts:
    candidates_updated: 0
    already_terminal: 0
  pending_after: 0
```

## Phase 3: Shared-reads 投稿
```yaml
posted: []
skipped: []
result: no_pass_candidates
reason: Phase 2 の pass が 0 件のため、Phase 3 の投稿対象なし
slack_posted: false
candidate_files_updated: []
```

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1780577715-ed242ccef1
    source_ts: "1780577715.745279"
    title: "MemForest: An Efficient Agent Memory System with Hierarchical Temporal Indexing"
    reason: "source が slack_api/shared-reads、score 11、未レビューという条件を満たす最新候補で、memory・game-design・agent・operation・evaluation の5優先タグを持つ。wrong-time retrieval と全体書き直しを、時系列ツリーと局所更新へ変換する知見が、現在の per-atom file／index 運用に既存 probe と異なる判断差を作るか確認するため選んだ。"
  scores:
    relevance: 3
    actionability: 2
    evidence: 2
    non_redundancy: 0
    risk_control: 2
    reversibility: 3
    total: 12
  decision: reject
  decision_reason: "合計12で採用条件の14に届かない。本文は並列チャンク抽出、MemTree、LongMemEval-S 79.8%、MemoryOS比13.7倍、時系列推論79.7%対52.5%、SoTA比約6倍を示すが、この workspace での追試と異種 artifact への転用根拠がない。同一 work の後続詳細 atom 1780802949.440169 は review 済みで、統合 atom 1780835360.327889 由来の external-state-validation-gate、memory-governance-gate-separation、egostream-episodic-recall-failure-split が validation、temporal／staleness evidence、temporal-window mismatch を既に扱う。現行 per-atom file＋index＋dual-read も局所更新経路を持つため、新規 probe や MemTree 導入は重複と確認負荷を増やす。"
  change:
    summary: "reviewed_source_ts と、同一 MemForest work の review 済み sibling および既存 temporal／validation probes との重複による reject 理由だけを更新した。probe・metric・lease・directive・恒久ルールは追加していない。"
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
  - "memory/MEMORY.md を UTF-8 明示読みし、atom 参照 50 件を memory/atoms.jsonl と照合した。missing 0 件、Markdown link 行 0 件で broken link はなかった。代表語 probe は「記憶」「ゲーム設計」「敵パターン」を取得でき、source file の文字化けは認めなかった。「評価軸」は現行 index 本文に完全一致語がないため、欠損根拠には使っていない。"
  - "memory/atoms.jsonl と per-file md / index.jsonl を監査し、各 2752 件、片側のみ 0、parse error 0、content conflict 0 を確認した。normalized-content duplicate は raw 40 群 80 行、canonical overlay で 40 行 fold 済み、recall-visible duplicate は 3 群 6 行だった。atom 本文は変更していない。"
  - "memory/raw/ の 2026-06-26 より前に更新が止まった原文を監査し、95 files / 62979319 bytes（web_research 87、headless_eval 6、slack_archive 1、その他 1）を確認した。candidate や atom の evidence pointer を壊し得る一次資料なので、この cycle では移動・削除せず保持した。"
  - "shared-reads candidate 1104 件の lifecycle を dry-run 監査し、現在状態 conflict 0、missing status 0 を確認した。title canonical / mixed duplicate / open duplicate / stale triage / group action sidecar を再生成した。"
  - "Slack inbox lifecycle を監査し、slack_directives pending 0、slack_broadcasts pending 0 を確認した。完了根拠のない handled 更新は行っていない。"
  - "group handoff を先に limit 1 で確認したが actionable group 0 のため投入 0。その live lease を反映した stale triage 50 行から candidate handoff 5 件を cycle id 2026-07-26 09:43 で冪等 enqueue し、audit errors 0 を確認した。"
issues:
  - id: ISS-ATOM-TITLE-RETRIEVAL
    description: "exact-content fold 後も recall-visible repeated title group が 15 群あり、そのうち 14 群は duplicate group 未付与である。title quality audit 621 行のうち retitle 推奨 387 行が残り、「■ 概要」など本文見出し由来の title が検索結果で内容を区別しにくくしている。"
    severity: medium
    evidence: "python tools/memory_health.py --json; memory/atoms/title_quality_audit.jsonl; memory/atoms/duplicate_clusters.jsonl"
    source_file_status: "memory/MEMORY.md は UTF-8 明示読みで正常。atoms.jsonl / per-file md / index.jsonl は各 2752 件で content conflict 0。source file 破損ではない。"
    display_or_tooling_status: "normalized-content fold は recall-visible duplicate を 3 群まで抑止するが、意味のない反復 title と未 group title は検索表示に残る。"
    why_blocks_game_memory: "次のゲーム制作で敵パターン、評価、記憶運用などの手法を探す際、同じ見出し型 title が候補の識別を妨げ、開くべき事例と一般化ノウハウを選びにくくする。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-ATOM-TITLE-RETRIEVAL
probe_lifecycle:
  inspected_due_count: 0
  inspected_probe_id: null
  outcome: none
  counts:
    pending: 1
    resolved: 1
    dormant: 1
candidate_lifecycle:
  files: 1104
  counts:
    posted: 485
    ready_to_post: 10
    postponed: 316
    failed: 277
    needs_review: 15
    skipped_unreviewed: 1
  missing_stale_after: 4
  overdue_open_total: 158
stale_backlog:
  overdue_open_total: 158
  stale_triage_queue_rows: 50
  open_duplicate_group_count: 55
  mixed_group_count: 48
  all_open_group_count: 7
  actionable_group_count: 0
  backlog_high_water: false
  group_handoff_budget: 1
  handed_off_group_count: 0
  handoff_inbox_pending_count: 0
  handoff_inbox_ids: []
  candidate_handoff_pending_count: 5
  candidate_handoff_ids:
    - cha-279befd57350fdc8
    - cha-c8bd336640de0417
    - cha-6880ed6ecfc0c363
    - cha-f83577649fd79108
    - cha-14b0d4c79eca16d1
group_action_handoff: []
stale_review_batch:
  - handoff_id: cha-279befd57350fdc8
    path: memory/shared_reads_candidates/20260530_label_free_px_lets_play_videos.md
    status: needs_review
    stale_after: "2026-06-29"
    priority_reason: "age_days=27; no open duplicate group; candidate lifecycle が needs_review のまま期限超過。"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-c8bd336640de0417
    path: memory/shared_reads_candidates/20260530_quest_of_aivengarde_llm_dialogue_player_experience.md
    status: postponed
    stale_after: "2026-06-29"
    priority_reason: "age_days=27; no open duplicate group; 64 participants の mixed-methods 評価は NPC 対話設計へ移せるが、指標・variant 差・失敗例の根拠が不足している。"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-6880ed6ecfc0c363
    path: memory/shared_reads_candidates/20260531_multigen_editable_multiplayer_worlds.md
    status: postponed
    stale_after: "2026-06-30"
    priority_reason: "age_days=26; no open duplicate group; editable multiplayer world の分解は有用だが、現メモは abstract 中心で評価設定と既存手法との差分が薄い。"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-f83577649fd79108
    path: memory/shared_reads_candidates/20260601_stratagem_game_self_play_reasoning.md
    status: postponed
    stale_after: "2026-07-01"
    priority_reason: "age_days=25; no open duplicate group; self-play log を勝敗以外で読む観点は有用だが、ゲーム制作への転用には trajectory 選別方法の再確認が必要。"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-14b0d4c79eca16d1
    path: memory/shared_reads_candidates/20260601_snapdragon_on_device_game_ai.md
    status: needs_review
    stale_after: "2026-07-02"
    priority_reason: "age_days=24; no open duplicate group; lifecycle backfill 後も具体的な Phase 2 品質判定が未完了。"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)
```yaml
designs:
  - issue_id: ISS-ATOM-TITLE-RETRIEVAL
    problem_restatement: "raw atom の title に「■ 概要」などの見出し型文字列が残ること自体と、recall 結果で候補を識別できないことが同じ指標で数えられている。現行 recall は title_cluster_index の semantic_alias と display_disambiguator がある atom を既に非破壊で補助する一方、sidecar が未更新・欠落した atom では generic title のままになり得る。また group_id は title 表示補助専用ではないため、未付与数をそのまま表示未解消数と見なせない。"
    alternatives:
      - name: "案A: recall 時の非破壊 semantic alias fallback"
        sketch: "raw title と per-file atom は変更せず、generic / repeated title に対して既存 title_cluster_index の semantic_alias を優先する。sidecar に該当 atom がない時だけ、既存の決定的 semantic_alias 抽出を recall 時に適用し、alias が得られない場合に限って現在の date / source / domain / keyword 補助へ戻る。監査は raw_title_debt と effective_display_unresolved を分離する。"
        pros:
          - "既存の recall 表示経路と semantic_alias 抽出規則を再利用でき、現状からの距離が小さい。"
          - "sidecar の鮮度に依存せず、新規 atom も次の再生成を待たず識別可能になる。"
          - "raw provenance と dual-write mirror を一括更新しないため、失敗時に表示経路だけ戻せる。"
        cons:
          - "recall 時に少量の決定的抽出処理が増える。"
          - "本文から良い alias を抽出できない atom では secondary key 表示が残る。"
          - "監査側も effective display を評価するよう定義を揃える必要がある。"
        migration_cost: low
      - name: "案B: title sidecar の鮮度ゲートと定時再生成"
        sketch: "title_cluster_index に入力 atom 集合の fingerprint または生成基準時刻を持たせ、recall / health で stale を検出する。stale の場合は定時 phase で sidecar を再生成し、recall は再生成済みの表示情報だけを使う。"
        pros:
          - "表示情報を事前計算へ集約でき、recall の実行時処理を増やさない。"
          - "sidecar の stale 状態を明示的に観測できる。"
          - "同じ入力に対する表示を一括監査しやすい。"
        cons:
          - "再生成までの間、新規 atom の識別性が改善しない。"
          - "scheduler 成否と recall 品質が結合する。"
          - "fingerprint、stale 判定、再生成責務が増え、今回の medium issue に対して仕組みが重い。"
        migration_cost: medium
      - name: "案C: raw atom title の一括 retitle"
        sketch: "title_quality_audit の retitle 推奨行を人手または一括処理で semantic title に置換し、atoms.jsonl、per-file md、index.jsonl の title を同期する。以後の ingest 時にも見出し型 title を拒否する。"
        pros:
          - "すべての reader が補助 sidecar なしで意味のある title を取得できる。"
          - "raw title debt の件数そのものを減らせる。"
          - "Obsidian 上の見出しも直接改善する。"
        cons:
          - "数百 atom の dual-write mirror を変更し、provenance と git diff が大きくなる。"
          - "自動生成 title の誤りを raw 正本へ固定し、復旧や再レビューのコストが高い。"
          - "表示上の問題に対して source data の大量 migration を要求する。"
        migration_cost: high
    recommended: "案A: recall 時の非破壊 semantic alias fallback"
    recommended_reason: "現行の title_cluster_index、semantic_alias、display_disambiguator はすでに問題の大半を非破壊で扱っており、欠けているのは sidecar miss 時の同等 fallback と、raw debt / 表示未解消を区別する観測である。案Aは既存設計を一般化するだけなので移行が小さく、alias 品質が悪い場合も raw atom を汚さず従来の secondary key へ戻せる。案Bは再生成遅延と scheduler 依存を残し、案Cは失敗時の復旧範囲が大きすぎる。"
    decision: introduce
    decision_reason: "表示補助の主要部は既に存在し、追加すべき境界条件と監査定義が明確である。raw atom の一括変更を避けたまま、新規・sidecar 未収録 atom の検索判別性を直ちに改善できるため、Phase 4c に渡せる設計粒度に達している。"
    outline_for_4c:
      - "memory_recall の表示注釈で、title_cluster_index の semantic_alias を最優先し、generic / repeated title かつ sidecar miss の時だけ既存の決定的 semantic_alias 抽出を適用する。"
      - "semantic alias を得られない場合は、現在の display_secondary_key fallback を維持する。raw atom、atoms.jsonl、per-file md の title は変更しない。"
      - "title quality 監査と memory health の集計を raw_title_debt と effective_display_unresolved に分け、group_id 未付与を表示未解消の直接根拠にしない。"
      - "sidecar が current / stale / absent の各条件で同じ atom の表示が識別可能であり、canonical fold と exact-reference recall を壊さないことを固定 fixture で確認する。"
```

## Phase 4c: 導入 (条件起動)
```yaml
implemented:
  - issue_id: ISS-ATOM-TITLE-RETRIEVAL
    files_changed:
      - path: tools/memory_recall.py
        change: modified
      - path: tools/build_atom_title_quality_audit.py
        change: modified
      - path: tools/memory_health.py
        change: modified
      - path: tools/test_memory_recall_title_fallback.py
        change: created
      - path: memory/atoms/title_quality_audit.jsonl
        change: modified
      - path: memory/atoms/README.md
        change: modified
      - path: memory/atoms/title_quality_audit_README.md
        change: modified
      - path: memory/directive_recall_fold_group_metadata_20260529.md
        change: modified
      - path: log/cycle_staging_log_cdx.md
        change: modified
    summary: "title_cluster_index の semantic_alias を優先しつつ、generic / repeated title の sidecar miss 時だけ同じ deterministic 抽出を runtime 適用した。監査と health は raw_title_debt / effective_display_unresolved を分離し、group_id 欠落を表示未解消の根拠から外した。"
    partial: false
migrations:
  - what: "title_quality_audit sidecar の既存行へ raw_title_debt、effective_display_label、effective_display_resolution、effective_display_unresolved を付与して再生成した。"
    affected: "commit 基準の 595 audit rows。raw atom、atoms.jsonl、per-file md の title は変更なし。"
verification:
  - "python -m py_compile: memory_recall / title quality audit / memory_health / fixture test が成功。"
  - "python tools/test_atom_title_clusters.py: 4 tests passed。"
  - "python tools/test_memory_recall_title_fallback.py: current / stale / absent sidecar、secondary key、監査集計、canonical fold、exact-reference の 5 tests passed。"
  - "実データ exact-reference recall: sr-1781671356-862a3d22ed が semantic alias と補助キー付きで取得できた。"
  - "一時 audit 再生成: 676 rows、raw_title_debt=645、effective_display_unresolved=0。"
  - "python tools/memory_health.py --compact: exit 0（warning のみ、title 表示未解消は 0）。"
  - "commit 基準 atoms から再計算した title_quality_audit と committed sidecar の一致を確認。"
  - "git diff --check: whitespace error なし。"
```

## Phase 5: 日記投稿
(Phase 5 が書き込む)
