# log_cdx Cycle Staging — 2026-07-21 04:28

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
(Phase 1 が書き込む)

### 2026-07-21 04:28 cycle

- `memory/shared_reads_candidates/20260721_people_of_note_musical_rpg.md` — musical の主題を turn order、戦闘資源、任意 puzzle battle、section skip へ接続した turn-based RPG の制作インタビュー。
- `memory/shared_reads_candidates/20260721_donkey_kong_bananza_voxel_loop.md` — voxel 地形破壊を戦闘→探索→再戦闘の "chain of destruction" へ接続した 3D action の制作事例。
- `slack_directives.jsonl` / `slack_broadcasts.jsonl` の pending は 0 件。直前 cycle 完了時刻 2026-07-21 02:46 以降、ローカル取り込み済み Slack raw に新しい外部 URL はなし。
- `memory/raw/web_research/results.jsonl` の 2026-07-21 03:36 追加分を照合。Human-Centric Reflective Architecture は既存 candidate、RevengeBench / RogueAI / AutoBG は同一 work の実投稿済み記録があり、重複ファイルは作成しなかった。

## Phase 2: 分析

```yaml
total_candidates: 2
pass:
  - memory/shared_reads_candidates/20260721_donkey_kong_bananza_voxel_loop.md
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260721_people_of_note_musical_rpg.md
    reason: "設計意図は具体的だが、未発売作品の開発者説明だけでは playtest 結果や体験差の評価を支えられない"
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
  builders_refreshed_at: "2026-07-21T04:38:04+09:00"
  items:
    - path: memory/shared_reads_candidates/20260721_people_of_note_musical_rpg.md
      decision: continue
    - path: memory/shared_reads_candidates/20260721_donkey_kong_bananza_voxel_loop.md
      decision: continue
```

## Phase 3: Shared-reads 投稿

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260721_donkey_kong_bananza_voxel_loop.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784576518296969
    char_count: 4280
skipped: []
```

- 最終判定: `post`。元記事を確認し、戦闘→地形資源の取得→敵と地形の破壊→秘密の露出→次の戦闘という “chain of destruction”、powered-up state の読み替え、primitive collision を player の opportunity / loss で裁く基準、定量評価がない事例記事としての限界まで本文へ反映した。
- 投稿前レビュー: `tools/shared_reads_policy.py` の `validate_shared_reads_message` を通過。必須項目順、禁止表現、URL 末尾、単一 candidate / 単一 `chat.postMessage`、Slack 保存本文の文字化けがないことを確認した。

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1784568554-415e75a467
    source_ts: "1784568554.225909"
    title: "Do Agents Dream of False Memories? — 視覚入力から長期記憶へ残る black-box false-memory attack"
    reason: "未レビュー条件を満たす最新の score 11 atom で、memory・harness・game-design・agent・operation・evaluation の6優先タグを持つ。画像→caption→durable memory→retrieval→後続応答の failure chain が、次の画像由来 memory の取り込み行動へ既存 probe にない差を作るか確認するため選んだ。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 2
    non_redundancy: 1
    risk_control: 1
    reversibility: 3
    total: 13
  decision: reject
  decision_reason: "合計13で採用条件の14に届かず、risk_control も2未満。5 backend・複数 MLLM・poisoning/injection・retrieval/generation・防御比較は具体的だが、v1 preprint と人工 target／Mem-Gallery 中心で当環境では未実測。既存の poisoning ingest、失敗段階分類、CMA visual retrieval、同期 frame/input/state/outcome、WhisperBench delayed-effect metric が同じ境界をすでに覆う。20-frame caption stability を追加すると、画像由来 memory 全般へ多重 caption・再圧縮・state 照合を広げ、false positive、API cost、320件ある active probe 群の確認負荷を増やすため採用しない。"
  existing_probes:
    - probe-20260517-memory-poisoning-ingest-check
    - probe-20260531-memory-stage-risk-classifier
    - probe-20260720-cma-selective-visual-episode-retrieval
    - probe-20260622-d2e-synchronized-playtest-stream
    - probe-20260619-agentic-state-authority-boundary
  change:
    summary: "reviewed_source_ts と reject 理由だけを更新した。probe・評価表・directive・恒久ルールは追加していない。"
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
  - "shared-reads の terminal title canonical index を再生成し、closed group 54件を確認した"
  - "mixed duplicate / stale triage / group action queue を順に再生成した（49 group / 50 candidate / 0 actionable group）"
  - "group handoff inbox を cycle_id=2026-07-21 04:28・budget=1 で冪等 enqueue/audit し、新規投入0件・pending 0件を確認した"
  - "Slack inbox lifecycle を監査し、directives 23行・broadcasts 21行はいずれも pending 0件だったため close 更新は行わなかった"
audit_summary:
  memory_index:
    validator: "OK: memory/MEMORY.md entry sections match per-file atom index"
    markdown_link_rows: 0
    encoding_probe:
      terms: ["記憶", "ゲーム設計", "敵パターン", "評価軸"]
      result: "UTF-8 明示読みですべて取得。memory/MEMORY.md の source file は正常"
      display_or_tooling_status: none
  atoms:
    total: 2707
    mirror_counts:
      atoms_jsonl: 2707
      per_file_md: 2707
      index_jsonl: 2707
    content_conflicts: 0
    normalized_content_duplicate_groups: 40
    duplicate_overlay_groups: 45
    duplicate_overlay_check: ok
    recall_visible_duplicate_groups_after_fold: 3
  raw_archive_candidates:
    inactive_over_30_days_count: 95
    total_bytes: 62979319
    main_locations:
      - "memory/raw/web_research/ と旧 phase3_* subdirectories"
      - "memory/raw/headless_eval/"
      - "memory/raw/slack_archive/shared-reads.jsonl"
    action: "原文 provenance と既存 path 参照を壊さないため、この phase では移動せず archive 候補として記録のみ"
  candidate_lifecycle:
    total: 1028
    posted: 441
    ready_to_post: 9
    postponed: 347
    failed: 213
    needs_review: 18
  duplicate_title_audit:
    duplicate_title_groups: 121
    terminal_canonical_groups: 54
    mixed_groups: 49
    all_open_unindexed_groups: 18
  inbox:
    directives_rows: 23
    directives_pending: 0
    broadcasts_rows: 21
    broadcasts_pending: 0
stale_backlog:
  overdue_open_total: 205
  stale_triage_queue_rows: 50
  actionable_group_count: 0
  backlog_high_water: false
  high_water_reason: "205 > 50 は成立するが、actionable group が3件以上という条件を満たさない"
  group_handoff_budget: 1
  handed_off_group_count: 0
  handoff_inbox_pending_count: 0
  handoff_inbox_ids: []
group_action_handoff: []
issues:
  - id: ISS-4A-20260721-01
    description: "duplicate title group のうち全 sibling が open の18 groupが mixed duplicate / group-action 経路の対象外で、同一 work の stale candidate が個別再評価される"
    severity: high
    evidence: "duplicate title 121 group = terminal canonical 54 + mixed 49 + all-open unindexed 18。The Ink Splotch Effect は postponed 6件だが memory/shared_reads_stale_triage_queue.jsonl では duplicate_group_key が空のまま代表候補が candidate 単位で選ばれている"
    source_file_status: "対象 candidate 6件の frontmatter は UTF-8 で読み取り可能。status は全件 postponed で source file 破損なし"
    display_or_tooling_status: none
    why_blocks_game_memory: "Phase 2 の少数レビュー枠を同一 work の sibling が繰り返し消費し、異なるゲーム設計・playtest 知見の再評価と次制作への転送を遅らせる"
  - id: ISS-4A-20260721-02
    description: "1件の active atom で title / trigger / excerpt に実 U+FFFD が残り、検索語が破損している"
    severity: low
    evidence: "memory/atoms/2026-04/sr-1776127289-4d9239b255.md と source memory/raw/slack_archive/shared-reads.jsonl ts=1776127289.990919 の双方が『AIエ��ジェント』を保持。memory_health のもう1件 gr-1777083728-44d444ab7a は本文中の意味のある『???』を detector が拾った false positive で、U+FFFD は0件"
    source_file_status: "UTF-8 明示読みで atom と raw source の双方に U+FFFD 2文字を確認。source ingestion 前または archive 生成時点の実データ破損"
    display_or_tooling_status: "PowerShell Get-Content -Encoding UTF8 と Python UTF-8 読みで同じ文字を再現。表示経路だけの mojibake ではない"
    why_blocks_game_memory: "個人OS / filesystem memory の既存知見を『AIエージェント』で検索する際の一致と可読性を局所的に落とす"
recommendation:
  needs_design: true
  priority_issues: [ISS-4A-20260721-01]
stale_review_batch:
  - path: memory/shared_reads_candidates/20260515_game_master_llm_slang_learning_rpg.md
    status: postponed
    stale_after: "2026-06-14"
    priority_reason: "game transfer value=high、37日 overdue。NPC 会話・課題型 role-play は具体的だが、学習効果・参加者評価・失敗例の原文確認が必要"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260515_ink_splotch_cocreative_game_designer.md
    status: postponed
    stale_after: "2026-06-14"
    priority_reason: "game transfer value=high、37日 overdue。比較設計は直結するが評価結果が不足。all-open duplicate 6件の代表として扱い、ISS-4A-20260721-01 の evidence にする"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260515_multiverse_language_conditioned_level_blending.md
    status: postponed
    stale_after: "2026-06-14"
    priority_reason: "game transfer value=high、37日 overdue。shared latent space と level blending は有用だが、評価指標・dataset・失敗条件の確認が必要"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260515_textquests_llm_text_games.md
    status: postponed
    stale_after: "2026-06-14"
    priority_reason: "game transfer value=high、37日 overdue。探索・文脈保持・目標推定の評価は有用だが、現 candidate は abstract 水準"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260515_zork_llm_reasoning_limits.md
    status: postponed
    stale_after: "2026-06-14"
    priority_reason: "game transfer value=high、37日 overdue。探索・計画限界と headless playtest への接続は具体的だが、評価条件・失敗分類・model 比較の確認が必要"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)

```yaml
designs:
  - issue_id: ISS-4A-20260721-01
    problem_restatement: "全 sibling が postponed / ready_to_post 等の open status である同一 title 群は、terminal canonical にも mixed duplicate queue にも入らない。そのため group 単位の resolve 経路を迂回し、同一 work の候補が stale_review_batch の少数枠を candidate 単位で繰り返し消費する"
    alternatives:
      - name: "案A: open duplicate group sidecar を group-action 経路へ接続"
        sketch: "全 duplicate title 群のうち open sibling を1件以上持つ群を、mixed / all_open を区別する再生成可能 sidecar にまとめる。stale triage と group-action はこの sidecar を共通参照し、1群1 representative だけを既存 handoff の close_siblings / keep_distinct / defer 判断へ渡す"
        pros:
          - "terminal canonical の『全 sibling が terminal』という意味を変えずに済む"
          - "all-open と mixed を同じ group resolve / membership fingerprint / 冪等 handoff で扱える"
          - "candidate 本体を変更しないため、誤集約時は sidecar 再生成と keep_distinct で復帰できる"
        cons:
          - "mixed 専用 queue との役割整理と、Phase 4a の再生成順・記述更新が必要"
          - "title 正規化だけでは別 work の同名候補を含み得るため、自動 close ではなく review を維持する必要がある"
          - "既存テストに all_open / mixed / membership 変化の組合せを追加する必要がある"
        migration_cost: medium
      - name: "案B: stale triage 内だけで title 単位に折り畳む"
        sketch: "stale queue 生成時に normalized title ごとに最優先 candidate だけを残し、他 sibling を一時的に抑止する。新しい group sidecar や handoff schema は増やさない"
        pros:
          - "変更範囲が小さく、レビュー枠の重複消費を直接止められる"
          - "追加の永続 sidecar が不要"
        cons:
          - "なぜ sibling を抑止したか、誰が代表か、いつ再審査するかの監査情報が弱い"
          - "keep_distinct や構成変化時の再審査を既存 handoff と共有できない"
          - "title 誤一致で異なる work を黙って隠す失敗コストが高い"
        migration_cost: low
      - name: "案C: candidate frontmatter に canonical_group / representative を保存"
        sketch: "重複候補本体へ group ID、代表 path、group decision を書き込み、各 phase がその明示関係を読む。group 解消結果を candidate と同じ場所に永続化する"
        pros:
          - "candidate 単体を見ても sibling 関係と代表が分かる"
          - "title 正規化規則が変わっても確定済み関係を保持できる"
        cons:
          - "既存 candidate 群への一括更新と、追加・rename・status 変更時の同期が必要"
          - "派生可能な関係を正本へ重複保存し、frontmatter drift を増やす"
          - "誤集約の巻き戻しで複数 candidate を再編集するため失敗コストが高い"
        migration_cost: high
    recommended: "案A: open duplicate group sidecar を group-action 経路へ接続"
    recommended_reason: "現行の terminal canonical、stale triage、bounded group-action、永続 handoff resolve を保ったまま、欠けている all-open 分類だけを埋められる。移行手間は中程度だが、候補本文を移行せず再生成可能 sidecar に限定されるため、誤判定時の復帰コストは低い。案Bは最短だが重複を不可視化し、案Cは現状から遠く正本の同期負債が大きい"
    decision: introduce
    decision_reason: "18群が経路外で、実際に6 sibling の1件が個別 stale review 枠へ入っているため、観測待ちではなく構造上の欠落を直すべき段階にある。既存 handoff の判断語彙と fingerprint を再利用でき、title 一致だけで自動 close しない安全境界も定義できた"
    outline_for_4c:
      - "全 duplicate title 群から、open sibling を持つ群を mixed / all_open に分類する再生成可能 sidecar を導入し、group_key・group_kind・open_paths・terminal_paths・status_counts・source URL evidence・representative candidates を持たせる"
      - "stale triage が open group sidecar を参照し、all-open sibling にも duplicate_group_key と group_kind を付ける。候補単位の上位選定では同じ group_key を1回だけ扱う"
      - "group-action queue を open group sidecar と stale 情報から生成し、all_open 群も既存の budget 付き handoff inbox へ1群1件で enqueue する"
      - "title-only 一致は review 扱いとし、自動 close / skip は行わない。Phase 2 の resolve は既存の close_siblings / keep_distinct / defer と membership fingerprint を使う"
      - "mixed / all_open / 同名別work / membership変化 / 冪等再生成をテストし、Phase 4a の再生成順・監査項目を現行 queue 構成へ更新する"
```

## Phase 4c: 導入 (条件起動)

```yaml
implemented:
  - issue_id: ISS-4A-20260721-01
    files_changed:
      - path: tools/build_shared_reads_open_duplicate_group_queue.py
        change: created
      - path: memory/shared_reads_open_duplicate_group_queue.jsonl
        change: created
      - path: tools/build_shared_reads_stale_triage_queue.py
        change: modified
      - path: tools/build_shared_reads_group_action_queue.py
        change: modified
      - path: tools/shared_reads_title_index.py
        change: modified
      - path: tools/shared_reads_duplicate_preflight.py
        change: modified
      - path: tools/test_shared_reads_open_duplicate_group_queue.py
        change: created
      - path: tools/test_shared_reads_group_handoff.py
        change: modified
      - path: tools/test_shared_reads_duplicate_preflight.py
        change: modified
      - path: memory/shared_reads_stale_triage_queue.jsonl
        change: modified
      - path: memory/shared_reads_group_action_queue.jsonl
        change: modified
      - path: phases/phase1_collect.md
        change: modified
      - path: phases/phase2_analyze.md
        change: modified
      - path: phases/phase4a_cleanup.md
        change: modified
      - path: memory/shared_reads_candidates/README.md
        change: modified
      - path: memory/directive_shared_reads_candidate_gate_20260512.md
        change: modified
      - path: log/cycle_staging_log_cdx.md
        change: modified
    summary: "open sibling を持つ同一 title 群を mixed / all_open に分類する superset sidecar を導入し、stale triage・group-action・duplicate preflight を既存 handoff resolve へ接続した。title 一致だけでは自動 close / skip しない。"
    partial: false
migrations:
  - what: "candidate frontmatter を変更せず、open duplicate group / stale triage / group-action の派生 sidecar を現データから再生成"
    affected: "open duplicate 67群（mixed 49、all_open 18）、stale triage 50行、actionable group 14群"
verification:
  - "python -m unittest discover -s tools -p 'test_shared_reads_*.py': 28 tests passed"
  - "mixed / all_open / 同名別work / membership変化 / 冪等render の追加テストが通過"
  - "3 builder の --check がすべて成功。stale queue の duplicate group 14行は group_key 14件で重複なし"
  - "python tools/shared_reads_group_handoff.py audit: rows=48、pending=0、errors=[]"
  - "python tools/memory_recall.py 'open duplicate group all_open' --limit 3 --compact --no-log: exit 0"
```

## Phase 5: 日記投稿

```yaml
diary:
  channel: "#log"
  draft: drafts/phase5_log_diary_20260721_0507_cdx.md
  permalink: https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1784578074145819
  char_count: 2255
  verification: ok
```
