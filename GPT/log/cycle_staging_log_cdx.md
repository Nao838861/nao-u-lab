# log_cdx Cycle Staging — 2026-07-22 00:28

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- inbox: `slack_directives.jsonl` / `slack_broadcasts.jsonl` とも pending 0 件。
- `memory/shared_reads_candidates/20260722_letters_for_letters_ai_assisted_game_dev_postmortem.md` — AI 支援で実装速度が上がった puzzle game 制作と、公開展示で露出した操作規則・進捗・目的の誤読を記録した postmortem。
- `memory/shared_reads_candidates/20260722_death_thief_stars_game_jam_postmortem.md` — visual novel の overscope、相反する narrative feedback の共通問題、選択を ending が尊重する条件、script と asset の制作依存を扱う game jam 回顧。
- duplicate preflight: 2 件とも `continue`。各書込み前に posted-source / closed canonical title / open duplicate group の3 sidecarを再生成済み。
- Slack 投稿・品質判定・記憶階層の整理は未実施（後続 phase へ委譲）。

## Phase 2: 分析

```yaml
total_candidates: 2
pass: []
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260722_letters_for_letters_ai_assisted_game_dev_postmortem.md
    reason: "出典 URL が HTTP 404 で原文を再確認できず、約4000字を根拠付きで構成できない"
  - path: memory/shared_reads_candidates/20260722_death_thief_stars_game_jam_postmortem.md
    reason: "出典 URL が HTTP 404 で原文を再確認できず、評価内容と限界の provenance が不足"
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
  builders_refreshed_at_start: true
  decisions:
    - path: memory/shared_reads_candidates/20260722_letters_for_letters_ai_assisted_game_dev_postmortem.md
      decision: continue
    - path: memory/shared_reads_candidates/20260722_death_thief_stars_game_jam_postmortem.md
      decision: continue
source_validation:
  - path: memory/shared_reads_candidates/20260722_letters_for_letters_ai_assisted_game_dev_postmortem.md
    result: "HTTP 404; canonical URL unresolved"
  - path: memory/shared_reads_candidates/20260722_death_thief_stars_game_jam_postmortem.md
    result: "HTTP 404; canonical URL unresolved"
```

## Phase 3: Shared-reads 投稿

```yaml
posted: []
skipped: []
result: no_pass_candidates
reason: "Phase 2 の pass が 0 件のため、#shared-reads への投稿対象なし"
```

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1784641228-e4500934d0
    source_ts: "1784641228.892699"
    title: "ELI Release 2026-06-15 postmortem — transition seam QA"
    reason: "最新の未レビュー score 10 atom で、memory・harness・game-design・operation・evaluation の優先タグを持つ。機能単体の green では見落とす transition seam を、次の prototype 検証へ小さく反映できるか確認するため選んだ。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 3
    non_redundancy: 2
    risk_control: 3
    reversibility: 3
    total: 17
  decision: defer
  decision_reason: "閾値は満たすが、現在の ledger には Phase 4a 向け pending lease が既に1件あり、次の prototype の具体的な trigger artifact もまだ指定できない。lease contract を満たさない active probe は作らず、state-only review に留めた。"
  change:
    summary: "reviewed_source_ts と採点・defer 理由のみ更新。probe、評価表、directive、恒久ルール、lease は追加していない。"
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
  - "memory/MEMORY.md を UTF-8 明示読みし、per-file atom index との対応を検証した。broken index entry は 0 件。代表語は 記憶=22、ゲーム設計=8、敵パターン=1、評価軸=0 で、最後は文字化けではなく現行 index にその完全一致語がない状態。"
  - "memory/atoms.jsonl と per-file/index mirror を監査した。content_conflicts=0、raw normalized-content duplicate=40群、recall-visible duplicate=3群で、既存 lifecycle/content fold と canonical overlay は最新。"
  - "memory/raw/ の 30 日超ファイル 95 件を確認した。Slack 原文・論文 PDF/TXT・headless 評価原文という provenance 入力であり、削除・移動による参照切れを避けるため archive_candidates は 0 件とした。"
  - "candidate 派生 index を再生成した。title canonical=65群、mixed duplicate=49群、open duplicate=56群、stale triage=50行、group action=0群。candidate 本体は変更していない。"
  - "slack_directives.jsonl 23行 / slack_broadcasts.jsonl 21行を監査し、pending は双方 0 件。close 対象はなかった。"
  - "probe lifecycle を validate し、期限到来 lease は 0 件だったため receipt 更新は行っていない。"
candidate_lifecycle:
  files: 1044
  counts:
    posted: 449
    ready_to_post: 9
    postponed: 327
    failed: 240
    needs_review: 18
    skipped_unreviewed: 1
  missing_stale_after: 4
  missing_stale_after_note: "posted 3件と lifecycle 未評価 1件で、postponed / needs_review の open candidate 欠落ではない。"
issues:
  - id: ISS-4A-20260722-01
    description: "group-action inbox で retry_after まで defer 済みの open duplicate group が stale triage 先頭へ再登場し、candidate 単位の stale_review_batch が group defer を迂回できる。"
    severity: high
    evidence: "memory/shared_reads_stale_triage_queue.jsonl:1; memory/shared_reads_group_handoff_inbox.jsonl:55; group_key=joint agent memory and exploration learning via novelty signals; retry_after=2026-08-20T13:19:04+09:00; memory/shared_reads_group_action_queue.jsonl は 0 行"
    source_file_status: "各 JSONL は UTF-8 として parse 可能。stale row と deferred inbox row が同一 group_key / 同一 arXiv work を指す。"
    display_or_tooling_status: "none"
    why_blocks_game_memory: "同じゲーム AI 記憶候補を defer 期間中にも再読解させ、限られた Phase 2 budget を消費する。group 判断と candidate 判断の時系列が分断される。"
  - id: ISS-4A-20260722-02
    description: "candidate lifecycle audit が現在の last_decision より過去の gate_decision を強く推論根拠にし、terminal duplicate closure を conflict として大量検出する。"
    severity: medium
    evidence: "tools/backfill_shared_reads_candidate_status.py; dry-run anomalies=122、うち failed!=postponed が93件。例: memory/shared_reads_candidates/20260513_llm_gameplay_playability_player_experience.md は last_decision=failed_duplicate_of_terminal_sibling だが gate_decision=postpone。"
    source_file_status: "candidate frontmatter は UTF-8 で読め、status/candidate_status と last_decision は terminal closure と整合する。"
    display_or_tooling_status: "audit inference の false-positive。--fix-conflicts を機械適用すると現 lifecycle を旧 gate 判定へ戻す危険がある。"
    why_blocks_game_memory: "posted/failed を再評価 queue から外す判定の信頼性が落ち、次のゲーム制作に使う候補の選別で terminal/open を誤認しうる。"
  - id: ISS-4A-20260722-03
    description: "active atom 1件の原文と派生 atom に Unicode replacement character が残り、AIエージェントの語が壊れている。"
    severity: low
    evidence: "memory/raw/slack_archive/shared-reads.jsonl:492; memory/atoms/2026-04/sr-1776127289-4d9239b255.md:3; source_ts=1776127289.990919"
    source_file_status: "UTF-8 明示読みでも原文 raw 自体に『AIエ��ジェント』があり、atom mirror も同じ値を保持する。"
    display_or_tooling_status: "PowerShell UTF-8 表示は source の replacement character を忠実に表示しており、console mojibake ではない。memory_health のもう1件 gr-1777083728-44d444ab7a は raw/per-file とも日本語が正常で heuristic suspect。"
    why_blocks_game_memory: "完全一致の『AIエージェント』検索から高 score atom 1件が漏れるが、影響は局所的。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-4A-20260722-01
    - ISS-4A-20260722-02
probe_lifecycle:
  inspected_due_count: 0
  inspected_probe_id: null
  outcome: none
  receipt: null
  next_pending_probe_id: probe-20260625-amvl-retention-utility-lifecycle
  next_lease_due: "2026-07-22T23:00:00+09:00"
  counts:
    pending: 1
    resolved: 0
    dormant: 1
stale_backlog:
  overdue_open_total: 185
  stale_triage_queue_rows: 50
  open_duplicate_group_count: 56
  mixed_group_count: 49
  all_open_group_count: 7
  actionable_group_count: 0
  backlog_high_water: false
  high_water_reason: "overdue_open_total > queue rows は真だが、actionable group >= 3 が偽。"
  group_handoff_budget: 1
  handed_off_group_count: 0
  handoff_inbox_pending_count: 0
  handoff_inbox_ids: []
group_action_handoff: []
stale_review_batch:
  - path: memory/shared_reads_candidates/20260616_jamel_memory_exploration_novelty.md
    status: postponed
    stale_after: "2026-07-16"
    priority_reason: "stale triage 先頭だが、同一 group は 2026-08-20 まで defer 済み。ISS-4A-20260722-01 の evidence として保持し、Phase 2 再評価は行わない。"
    recommended_review_action: explicit_keep
  - path: memory/shared_reads_candidates/20260515_zork_llm_reasoning_limits.md
    status: postponed
    stale_after: "2026-06-14"
    priority_reason: "headless playtest に直結する探索・計画限界だが、評価条件と失敗分類の本文確認が必要。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_countdown_game_planning_benchmark.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "検証可能な短い planning benchmark として転用価値が高く、実験設計・比較・結果の補強が必要。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_inmind_social_deduction_reasoning_styles.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "個別推論スタイル追跡はゲーム AI に有用だが、既存 atom との重複と本文評価詳細の確認が必要。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_pangea_procedural_artificial_narrative.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "LLM NPC の validation 構成は具体的だが、empirical study / ablation / 失敗例の精読が必要。"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)

```yaml
designs:
  - issue_id: ISS-4A-20260722-01
    problem_restatement: "candidate の stale 時刻と group 単位の defer lease が別経路で評価されるため、group を retry_after まで保留しても stale triage が同じ group を即座に再提示する。永続 inbox を判断の正本にした契約が、再生成 queue の入口まで貫通していない。"
    alternatives:
      - name: "案A: stale triage 生成時に live group lease を合成する"
        sketch: "stale triage builder が open-group sidecar と group handoff inbox を読み、同一 group の pending または期限前 deferred lease を候補選定前に除外する。defer は retry_after が到来した時、または記録時から group membership が変化した時に自動で再登場させる。"
        pros:
          - "Phase 4a が読む queue 自体から defer 中の group が消え、candidate 単位 handoff による迂回を入口で止められる。"
          - "既存の inbox を正本として再利用し、新しい永続状態を増やさない。"
          - "期限到来と membership 変化では再提示されるため、永久 suppression を避けられる。"
        cons:
          - "再生成可能 sidecar が inbox の operational state と as_of 時刻に依存する。"
          - "group membership fingerprint の比較を stale triage 側でも共有する必要がある。"
        migration_cost: medium
      - name: "案B: Phase 4a の staging 選定時だけ除外する"
        sketch: "stale triage queue は現状のまま残し、Phase 4a が上位5件を引用する直前に inbox の pending/deferred group を手動または prompt 契約で飛ばす。"
        pros:
          - "既存 builder と sidecar schema を変更しない。"
          - "導入範囲が小さい。"
        cons:
          - "queue 先頭が実質 non-actionable のままで、各 consumer が同じ除外規則を再実装する。"
          - "今回の explicit_keep のような手作業が繰り返され、経路追加時に再発しやすい。"
        migration_cost: low
      - name: "案C: defer 時に sibling の stale_after を retry_after へ書き換える"
        sketch: "group defer を解決する際、全 open sibling の candidate frontmatter にある stale_after を retry_after 相当へ更新し、candidate 単位 queue から自然に外す。"
        pros:
          - "既存 stale triage builder を変更せず抑止できる。"
          - "candidate 単体を見ても次回確認時刻が分かる。"
        cons:
          - "group 判断が複数 candidate 本体へ複製され、lease 変更や sibling 増減で不整合になる。"
          - "stale_after の意味が candidate review 時刻と group defer 時刻で混在する。"
        migration_cost: medium
    recommended: "案A: stale triage 生成時に live group lease を合成する"
    recommended_reason: "問題はデータ不足ではなく、既にある inbox の lease が stale triage 入力へ届かないことにある。案Aは正本を増やさず最も上流で迂回を閉じる。誤 suppression の失敗コストを抑えるため、group_key 一致だけでなく membership fingerprint 一致を条件にし、期限到来・構成変化では fail-open で再提示する。案Bは運用負債を残し、案Cは派生判断を candidate 正本へ複製する距離が大きい。"
    decision: introduce
    decision_reason: "再現条件と正本が特定でき、既存 lease contract の局所的な延長で解決できる。Phase 2 budget の反復消費を直ちに止める価値が高く、4c の境界テストも明確である。"
    outline_for_4c:
      - "stale triage builder に handoff inbox と as_of を入力する lease-aware filtering を追加し、非 group candidate は従来通り扱う。"
      - "pending、期限前 deferred、retry 到来、membership 変化、無関係 group の各境界をテストする。"
      - "Phase 4a の契約を、stale triage queue は live lease 適用済みであり group defer を candidate 単位で再投入しない、という記述へ更新する。"
      - "sidecar を再生成し、今回の JAMEL group が retry_after 前は消え、他の actionable candidate の順序が繰り上がることを検証する。"

  - issue_id: ISS-4A-20260722-02
    problem_restatement: "backfill 用に過去の gate_decision から状態を補う推論と、既に後続判断を持つ candidate の現在状態を監査する推論が共用されている。そのため正常な postpone から failed/posted への lifecycle 遷移が conflict と誤認され、fix 操作は古い gate 状態への巻き戻しになりうる。"
    alternatives:
      - name: "案A: missing-field backfill と current-state audit の優先規則を分離する"
        sketch: "gate_decision は lifecycle 項目が欠ける時だけ初期値推論に使う。既存項目の監査は status と candidate_status の一致、現在の last_decision/evidence/next_action、posted/phase3 block など現状態の証拠を基準にし、gate との差は履歴上の transition として非 conflict にする。"
        pros:
          - "terminal closure を旧 gate へ戻さず、既存 frontmatter の意味を保てる。"
          - "新 schema や全 candidate migration を要求せず、監査の false-positive を直接減らせる。"
          - "status と candidate_status の不一致など、本当に修復すべき矛盾は引き続き検出できる。"
        cons:
          - "last_decision と evidence の妥当性を判定する明示的な優先表が必要になる。"
          - "古い candidate で現在状態の証拠が部分的な場合は needs_review へ fail-closed する設計が要る。"
        migration_cost: medium
      - name: "案B: 後続判断のたび gate_decision も現在状態へ同期する"
        sketch: "duplicate closure や投稿時に gate_decision を fail/pass へ上書きし、既存 audit の単一推論規則と一致させる。"
        pros:
          - "audit 実装の変更が小さい。"
          - "表面上の status/gate 不一致がなくなる。"
        cons:
          - "gate_decision が当初の品質判定という履歴を失い、後続 lifecycle action と意味が混ざる。"
          - "過去ファイルの一括 migration が必要で、誤更新時の追跡が難しい。"
        migration_cost: high
      - name: "案C: append-only lifecycle event ledger から状態を再構成する"
        sketch: "各 candidate の gate、postpone、duplicate closure、posted を event として別 ledger に追記し、監査時に最新 event を reduce して current state を得る。"
        pros:
          - "履歴と現在状態を最も明確に分離できる。"
          - "将来の遷移監査や復元性が高い。"
        cons:
          - "1044 candidate の既存 frontmatter と二重管理になり、移行・整合確認の範囲が大きい。"
          - "今回の false-positive に対して過剰設計で、新たな正本競合を生む。"
        migration_cost: high
    recommended: "案A: missing-field backfill と current-state audit の優先規則を分離する"
    recommended_reason: "現状の frontmatter には current state、last_decision、evidence が既にあり、欠けているのは event ledger ではなく推論の時系列である。案Aなら backfill の利便性を残しつつ、既存 lifecycle を優先する局所変更で済む。証拠が曖昧な既存行は自動修復せず needs_review として報告すれば、失敗時も状態破壊ではなく未解決監査に留まる。"
    decision: introduce
    decision_reason: "122件の anomaly の大半が同一の優先順位誤りで説明でき、危険な --fix-conflicts 経路も同じ設計で封じられる。期待する遷移と実矛盾のテスト例が具体化できており、追加 ledger なしで導入可能である。"
    outline_for_4c:
      - "lifecycle 推論を missing-field backfill と existing-state audit に分け、gate_decision は欠損補完時のみ authoritative とする。"
      - "既存状態の優先表を posted/phase3 の明示 block、整合した status/candidate_status と後続 decision evidence、欠損時 gate fallback の順で定義する。"
      - "postpone gate から terminal failed へ進んだ例を正常 transition とし、status/candidate_status 不一致や evidence 不足を真の anomaly とするテストを追加する。"
      - "--fix-conflicts が historical gate を根拠に terminal 状態を巻き戻さず、曖昧な行は自動変更しないことを検証する。"
      - "dry-run anomaly 内訳を再取得し、false-positive 減少と残存 anomaly の根拠を Phase 4c staging に記録する。"
```

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
