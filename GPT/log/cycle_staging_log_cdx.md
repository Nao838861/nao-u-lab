# log_cdx Cycle Staging — 2026-08-11 13:43

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- inbox 確認: `slack_directives.jsonl` / `slack_broadcasts.jsonl` の `status: pending` は 0 件。
- Slack 確認: #shared-reads の直近新着は PsychoAgent（2026-08-11 11:48）だが、すでに実投稿済みのため candidate 化なし。#all-nao-u-lab のローカル raw には直前サイクル以降の外部 URL 新着なし。
- `memory/shared_reads_candidates/20260811_horizon_gap_long_horizon_agents.md` — 長時間 agent task で単発能力と完遂信頼性が乖離する horizon gap を、計画・記憶・実行・訓練・評価・安全の全工程から整理した survey。

## Phase 2: 分析

```yaml
total_candidates: 1
pass:
  - memory/shared_reads_candidates/20260811_horizon_gap_long_horizon_agents.md
fail: []
postpone: []
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
candidate_handoff_audit:
  pending_before: 0
  read_ids: []
  resolved_ids: []
  deferred_ids: []
  partial_ids: []
  pending_after: 0
unreviewed_intake_audit:
  valid_backlog_before: 1
  malformed_count: 0
  oldest_collected_at: "2026-08-11T13:45:34+09:00"
  selection_limit: 5
  selected_paths: []
  phase1_excluded_paths:
    - memory/shared_reads_candidates/20260811_horizon_gap_long_horizon_agents.md
  evaluated_paths:
    - memory/shared_reads_candidates/20260811_horizon_gap_long_horizon_agents.md
  valid_backlog_after: 0
duplicate_preflight:
  - path: memory/shared_reads_candidates/20260811_horizon_gap_long_horizon_agents.md
    decision: continue
    title_key: the horizon gap planning memory execution training and evaluation for long horizon llm agents
```

- 判定根拠: horizon gap の問題設定、long-horizon / long-context / long-term memory の分離、6領域と horizon 位置の分類、trajectory-level diagnostics の必要性まで抽出できる。複数時間・複数 session のゲーム実装と自動 playtest における仕様保持、途中検証、回復、完了判定へ具体化でき、CoopEval 水準の概要に展開可能と判断した。

## Phase 3: Shared-reads 投稿

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260811_horizon_gap_long_horizon_agents.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786424121003489
    char_count: 4481
skipped: []
```

- 最終判定: 投稿。arXiv 本文を再確認し、問題設定、3概念の分離、6領域×horizon 位置の分類、corpus 構築、trajectory-level diagnostics、harness / model の帰属問題、単一 annotator と sampling bias の限界まで本文へ反映した。
- 投稿前レビュー: `■ 概要` 始まり、`■ URL` 末尾、必須6項目、禁止表現なし、URL 1件、4,481文字。1回の `chat.postMessage` で投稿し、Slack 保存本文の文字化け検証は `ok`。

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1786416498-2bda332f21
    source_ts: "1786416498.654479"
    title: "PsychoAgent: factual / affective memory と relevance-gated salience reranking"
    reason: "未レビューかつ score 12、memory・harness・game-design・agent・identity・knowledge・evaluation の7優先タグを持つ最新候補。事実の正しさと再浮上優先度を分け、関連性 gate の内側だけで salience を使う差分が継続NPCと記憶運用に直結するため。Nao_uの明示評価はなし。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 3
    non_redundancy: 2
    risk_control: 2
    reversibility: 3
    total: 16
  decision: defer
  decision_reason: "知見は採用閾値を満たすが、現 cycle には同一eventのfactual／affective sidecar、単一意味検索／二系統意味順／関連性→salience再ランキングのNPC比較trace、誤設定salienceのnegative controlがない。Phase 4aも会話生成・想起順位変更のconsumerではないため、具体的なbefore／after artifactと判断差を置けず、形だけのleaseを作らない。次に5〜10 turnの未解決対立traceまたはcanonical contentとresurfacing priorityを分ける具体的memory変更が置かれた時だけ、一時metricとして再評価する。"
  change:
    summary: "reviewed_source_tsとdefer理由だけをstateへ記録。active_probes・ledger・directive・恒久ルールは変更なし。"
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
  - "memory/MEMORY.md を UTF-8 明示読みで監査。atom ID 参照 87 件は atoms.jsonl / atoms/index.jsonl の双方で missing 0、Markdown link 0、U+FFFD 0。代表語は 記憶 / ゲーム設計 / 敵パターン を取得でき、評価軸は現行本文に語として存在しないだけで source file 破損ではない。"
  - "memory/atoms.jsonl と per-file / index mirror 2854 件を監査。parse error / index error / content conflict は各 0。raw normalized-content duplicate 40 群と title+excerpt exact 5 群は canonical overlay 45 群で全て fold 済み、effective display unresolved は 0。"
  - "memory/raw/ の 30 日超ファイル 240 件を確認。215 件は web_research、16 件は headless_eval、残りは Slack / game-eval 等の原文で、raw 原文保持ルール上 age だけでは archive せず、今回の移動対象は 0 件。"
  - "shared-reads 派生 queue を現 candidate state から再生成して監査。candidate 本体は変更せず、group / candidate handoff の二重投入も 0 件。"
  - "slack_directives.jsonl 23 行 / slack_broadcasts.jsonl 21 行を監査し、pending は双方 0 件。handled 更新対象なし。"
issues:
  - id: ISS-ENC-001
    description: "atom sr-1776127289-4d9239b255 の title / trigger / excerpt に、原文 Slack archive から継承した U+FFFD があり、『AIエージェント』が『AIエ��ジェント』になっている。"
    severity: low
    evidence: "memory/atoms/2026-04/sr-1776127289-4d9239b255.md; memory/atoms.jsonl#id=sr-1776127289-4d9239b255; memory/raw/slack_archive/shared-reads.jsonl#ts=1776127289.990919"
    source_file_status: "UTF-8 明示読みでも raw / atoms.jsonl / per-file atom の全てに U+FFFD が存在するため、表示だけでなく source data に局所破損あり。memory/MEMORY.md 自体は UTF-8 正常。"
    display_or_tooling_status: "表示経路の mojibake ではない。memory_health のもう1件の suspect gr-1777083728-44d444ab7a は原文中の意図された『???』で、UTF-8 source は正常な false positive。"
    why_blocks_game_memory: "『AIエージェント』の完全一致検索でこの旧atomを落とし得るが、memory / agent tags とURLは残り、単一atomに限定されるため次のゲーム制作を構造的には阻害しない。"
recommendation:
  needs_design: false
  priority_issues: []
atom_audit:
  atoms: 2854
  mirror_status: clean
  repeated_title_groups: 22
  effective_display_unresolved_groups: 0
  canonical_overlay_groups: 45
candidate_lifecycle:
  total: 1263
  status_counts:
    posted: 590
    ready_to_post: 9
    postponed: 217
    failed: 445
    needs_review: 2
  missing_stale_after: 3
  overdue_for_reassessment: 2
  overdue_paths:
    - memory/shared_reads_candidates/20260616_jamel_memory_exploration_novelty.md
    - memory/shared_reads_candidates/20260706_collision_enemy_morphology_generation.md
probe_lifecycle:
  inspected_due_count: 0
  inspected_probe_id: null
  outcome: none
  counts:
    pending: 0
    resolved: 4
    dormant: 1
stale_backlog:
  overdue_open_total: 2
  stale_triage_queue_rows: 0
  open_duplicate_group_count: 43
  mixed_group_count: 38
  all_open_group_count: 5
  actionable_group_count: 0
  backlog_high_water: false
  group_handoff_budget: 1
  handed_off_group_count: 0
  handoff_inbox_pending_count: 0
  handoff_inbox_ids: []
  candidate_handoff_pending_count: 0
  candidate_handoff_ids: []
  valid_unreviewed_count: 0
  oldest_unreviewed_collected_at: null
  malformed_candidate_count: 0
  phase2_unreviewed_limit: 5
  suppressed_by_live_deferred_group_lease:
    count: 2
    retry_after: "2026-08-20T13:19:04+09:00"
    group_handoff_ids:
      - gha-e6d4d4b5a37a0808
      - gha-2313a247c62a9028
group_action_handoff: []
stale_review_batch: []
```

- 判定: 新しい構造問題は見つからず、isolatedなsource文字化け1件は既存health auditで検出可能な局所データ品質問題である。Phase 4b / 4c は起動しない。

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
