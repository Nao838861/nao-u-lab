# log_cdx Cycle Staging — 2026-07-28 23:28

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
(Phase 1 が書き込む)

### 2026-07-28 23:32 JST / log_cdx

- `memory/shared_reads_candidates/20260728_children_of_morta_postmortem.md` — 『Children of Morta』の5年開発を、制作 pillar、週次 playtest、UX 後回し、production 境界、後付け multiplayer、pixel animation 工数から振り返る開発者 postmortem。
- preflight skip: `PTCG-Bench: Can LLM Agents Master Pokémon Trading Card Game?` は実投稿済みの同一 work（https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781744312376709）と一致したため candidate を作成せず。

## Phase 2: 分析
(Phase 2 が書き込む)

### 2026-07-28 23:40 JST / log_cdx

```yaml
total_candidates: 6
pass:
  - memory/shared_reads_candidates/20260728_children_of_morta_postmortem.md
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260609_candy_crush_soda_invisible_layer.md
    reason: "GDC セッション概要から手法詳細・評価指標・結果・失敗例が増えておらず、約4000字の概要には材料不足"
  - path: memory/shared_reads_candidates/20260609_qa_strongest_design_ally.md
    reason: "WoW での具体的介入・評価軸・成果が未確認で、QA 早期参加という一般論を越える概要を構成できない"
  - path: memory/shared_reads_candidates/20260609_replaced_wingman_lore_ui.md
    reason: "UI fiction への集約例は有用だが、実装判断と評価結果の厚みが足りず、長文化すると推測が増える"
  - path: memory/shared_reads_candidates/20260609_tmnt_tactical_takedown_18_months.md
    reason: "developer-first production の具体策・制約判断・成果根拠が不足し、セッション紹介文の域を出ない"
  - path: memory/shared_reads_candidates/20260609_yamii_game_pacing_cooldowns_resources.md
    reason: "実用 checklist ではあるが記事固有の手法・比較・評価が薄く、約4000字では一般論へ流れる"
stale_reviewed:
  - handoff_id: cha-4e7a11cbe0bcaac8
    marker: "stale_reviewed:cha-4e7a11cbe0bcaac8"
    path: memory/shared_reads_candidates/20260609_candy_crush_soda_invisible_layer.md
    previous_status: postponed
    decision: postpone
    updated_stale_after: "2026-08-27"
  - handoff_id: cha-4c496912791cdd44
    marker: "stale_reviewed:cha-4c496912791cdd44"
    path: memory/shared_reads_candidates/20260609_qa_strongest_design_ally.md
    previous_status: postponed
    decision: postpone
    updated_stale_after: "2026-08-27"
  - handoff_id: cha-f39fade80b881eed
    marker: "stale_reviewed:cha-f39fade80b881eed"
    path: memory/shared_reads_candidates/20260609_replaced_wingman_lore_ui.md
    previous_status: postponed
    decision: postpone
    updated_stale_after: "2026-08-27"
  - handoff_id: cha-9596f66be29fb66d
    marker: "stale_reviewed:cha-9596f66be29fb66d"
    path: memory/shared_reads_candidates/20260609_tmnt_tactical_takedown_18_months.md
    previous_status: postponed
    decision: postpone
    updated_stale_after: "2026-08-27"
  - handoff_id: cha-5f2492ffa85e4851
    marker: "stale_reviewed:cha-5f2492ffa85e4851"
    path: memory/shared_reads_candidates/20260609_yamii_game_pacing_cooldowns_resources.md
    previous_status: postponed
    decision: postpone
    updated_stale_after: "2026-08-27"
candidate_handoff_audit:
  pending_before: 5
  read_ids:
    - cha-4e7a11cbe0bcaac8
    - cha-4c496912791cdd44
    - cha-f39fade80b881eed
    - cha-9596f66be29fb66d
    - cha-5f2492ffa85e4851
  resolved_ids:
    - cha-4e7a11cbe0bcaac8
    - cha-4c496912791cdd44
    - cha-f39fade80b881eed
    - cha-9596f66be29fb66d
    - cha-5f2492ffa85e4851
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
duplicate_preflight:
  posted_source_builder: fresh
  title_canonical_builder: fresh
  open_duplicate_group_builder: fresh
  decisions:
    continue: 6
    review: 0
    skip: 0
```

## Phase 3: Shared-reads 投稿
(Phase 3 が書き込む)

### 2026-07-28 23:48 JST / log_cdx

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260728_children_of_morta_postmortem.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785250107656699
    char_count: 4444
skipped: []
```

## Phase 3b: Shared-reads 自己フィードバック
(Phase 3b が書き込む)

### 2026-07-28 23:54 JST / log_cdx

```yaml
self_feedback:
  selected:
    id: sr-1785242582-86ec962640
    source_ts: "1785242582.070969"
    title: "Stunt Paradise 2 — 再現性・失敗理解・次試行・復帰時間を一つの retry loop として測る"
    reason: "最新の未レビュー score 11 atom で、memory・harness・game-design・evaluation の4優先タグを持つ。同一 snapshot／input trace の軌道許容帯、初見の失敗原因理解、次試行での入力変更、restart から再操作までの時間を一巡で評価する観点が、既存 probes より具体的な判断差を作るか確認するため選んだ。Nao_u の明示評価は付いていない。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 2
    non_redundancy: 1
    risk_control: 2
    reversibility: 3
    total: 14
  decision: defer
  decision_reason: "数値上の採用条件は満たすが、根拠は被験者数・成功率・retry 回数・車両間比較・方式変更前後の A/B を欠く一 studio の開発者インタビューである。固定 seed／input trace、route contract、headless と human feel の境界、retry cue の layer routing、observable verdict は既存 probes が扱う。固有差は再現性・原因理解・次試行の変化・復帰時間を一つの retry loop に結ぶ点だが、現 staging には代表 jump／hazard、before／after build、初見 playtest trace がなく、比較可能な lease を指定できない。active_probes 321件と Phase 4a 向け pending lease 1件もあるため、operational probe を増やさず、該当 playable artifact ができた時に再評価する。"
  existing_probes:
    - probe-20260603-rules-core-parity-regression
    - probe-20260608-bdd-route-contract-regression
    - probe-20260606-game-feedback-loop-asymmetry
    - probe-20260626-meta-horizon-friction-layer-triage
    - probe-20260706-paperclaw-prototype-hypothesis-contract
  change:
    summary: "reviewed_source_ts と defer 理由だけを更新した。probe・metric・lease・directive・恒久ルールは追加していない。"
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

### 2026-07-29 00:00 JST / log_cdx

```yaml
cleaned:
  - "python tools/validate_memory_index.py で MEMORY.md の entry section と per-file atom index の一致を確認した（broken link 0件）。"
  - "memory_health と duplicate cluster check で atoms.jsonl / per-file / index 各2779件、欠落・parse error・content conflict 0件、重複45 group は canonical overlay で fold 済み、effective display unresolved 0件を確認した。"
  - "shared-reads の title canonical index 74件、mixed duplicate queue 44件、open duplicate group queue 51件（mixed 44 / all_open 7）を check し、group-action queue は actionable 0件だった。"
  - "stale triage を live lease 反映順で再生成し、candidate handoff 5件を Phase 2 向けに冪等 enqueue した。candidate 本体は変更していない。"
  - "Slack directives / broadcasts は pending 0件で、handled へ更新すべき行はなかった。"
candidate_lifecycle:
  posted: 512
  ready_to_post: 9
  postponed: 236
  failed: 380
  needs_review: 3
  audit_excluded_unreviewed: 3
  overdue_open_total: 24
raw_archive_audit:
  older_than_30_days: 96
  action: none
  reason: "slack_archive 原本と web research の一次資料が中心で、参照関係を壊さず archive できる証拠がないため、この cycle では移動しない。"
issues:
  - id: ISS-UTF8-001
    description: "shared-reads atom 1件の title / trigger / excerpt に U+FFFD が保存され、「AIエージェント」が「AIエ��ジェント」になっている。game-rights atom の別の1件は原文の意図的な `???` を detector が拾った false positive で、source corruption ではない。"
    severity: low
    evidence: "memory/raw/slack_archive/shared-reads.jsonl ts=1776127289.990919; memory/atoms.jsonl id=sr-1776127289-4d9239b255; memory/atoms/2026-04/sr-1776127289-4d9239b255.md"
    source_file_status: "UTF-8 明示読みで raw Slack archive、atoms.jsonl、per-file atom の全てに U+FFFD を確認。memory/MEMORY.md は代表語 `記憶` / `ゲーム設計` / `敵パターン` / `評価軸` を UTF-8 で取得でき、本文破損なし。"
    display_or_tooling_status: "PowerShell Get-Content -Encoding UTF8 と rg の双方で同じ文字列を取得したため、表示経路だけの mojibake ではない。"
    why_blocks_game_memory: "file-system memory / context engineering の atom を正しい日本語 title で検索する recall を1件だけ弱める。影響は局所的で、現在の index 全体やゲーム task entry point は壊していない。"
recommendation:
  needs_design: false
  priority_issues: []
probe_lifecycle:
  inspected_due_count: 0
  inspected_probe_id: null
  outcome: none
  counts:
    pending: 1
    resolved: 1
    dormant: 1
stale_backlog:
  overdue_open_total: 24
  stale_triage_queue_rows: 18
  open_duplicate_group_count: 51
  mixed_group_count: 44
  all_open_group_count: 7
  actionable_group_count: 0
  backlog_high_water: false
  group_handoff_budget: 1
  handed_off_group_count: 0
  handoff_inbox_pending_count: 0
  handoff_inbox_ids: []
  deferred_live_group_lease_count: 1
  candidate_handoff_enqueued_count: 5
  candidate_handoff_pending_count: 5
  candidate_handoff_ids:
    - cha-fab1ca89bac368bf
    - cha-461b454a8e50d7a6
    - cha-32ebaaadb272241b
    - cha-6f8a03dee911b3aa
    - cha-6c01d5bc54f5257f
group_action_handoff: []
stale_review_batch:
  - handoff_id: cha-fab1ca89bac368bf
    path: memory/shared_reads_candidates/20260612_commercial_videogames_hci_cogsci.md
    status: postponed
    stale_after: "2026-07-12"
    priority_reason: "HCI / cognitive science の観察 toolkit は有用だが、affordance-cognition mapping と評価手順の本文補強が必要。"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-461b454a8e50d7a6
    path: memory/shared_reads_candidates/20260612_containment_gap_agentic_frameworks.md
    status: postponed
    stale_after: "2026-07-12"
    priority_reason: "ゲーム制作 cycle の containment gate に接続できるが、six containment principles の具体が不足している。"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-32ebaaadb272241b
    path: memory/shared_reads_candidates/20260612_genai_game_development_qual_synthesis.md
    status: postponed
    stale_after: "2026-07-12"
    priority_reason: "synthesis 手順と production 接続は重要だが、10件の eligible studies と theme の具体的な読解が不足している。"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-6f8a03dee911b3aa
    path: memory/shared_reads_candidates/20260612_radical_gender_neutrality_games.md
    status: postponed
    stale_after: "2026-07-12"
    priority_reason: "対象は重要だが empirically-grounded criteria の中身が未抽出で、現状は abstract 相当。"
    recommended_review_action: reevaluate_in_phase2
  - handoff_id: cha-6c01d5bc54f5257f
    path: memory/shared_reads_candidates/20260614_flavors_of_challenge_difficulty_taxonomy.md
    status: postponed
    stale_after: "2026-07-14"
    priority_reason: "difficulty を複数 flavor に分ける軸は実用的だが、8分類の名称・定義・組合せ例が未抽出。"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
