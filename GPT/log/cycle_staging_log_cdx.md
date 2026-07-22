# log_cdx Cycle Staging — 2026-07-22 19:58

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260722_from_pixels_to_affect.md` — 45本のsurvival shooter動画と自己注釈から、gameplay pixelだけでarousal高低を分類した研究（8-frame窓、leave-one-video-out、HUD代理変数を採録）。
- preflight skip: `Foveated Haptic Gaze` (`https://arxiv.org/abs/2001.01824`) は posted-source の同一work一致。Slack permalink: `https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778535754740259`。candidateは作成せず。

## Phase 2: 分析
```yaml
total_candidates: 1
pass:
  - memory/shared_reads_candidates/20260722_from_pixels_to_affect.md
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
```

## Phase 3: Shared-reads 投稿
```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260722_from_pixels_to_affect.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784718435577389
    char_count: 4074
skipped: []
```

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1780943233-c17382e3a5
    source_ts: "1780943233.150639"
    title: "HeLa-Mem — Hebbian 強化と連想グラフによる LLM agent 長期記憶"
    reason: "未レビューの score 13 atom で5優先タグを持ち、Phase 4a の link／cluster 整理が同一 ingest batch の共起を独立再利用と誤認しないか確認するため選んだ。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 3
    non_redundancy: 2
    risk_control: 2
    reversibility: 3
    total: 16
  decision: defer
  decision_reason: "一次資料で episodic graph、Hebbian Distillation、spreading activation と公開再現コードを確認した。既存 connection lint／retention gate にない差は distinct downstream reuse と same-batch co-occurrence の分離、および non-neighbor control だけである。しかし active_probes は320件あり、AMV-L retention/utility probe の pending lease が1件残るため、operational active を重ねず state-only review とした。"
  change:
    summary: "reviewed_source_ts、採点、一次資料、既存 probe との重複、pending lease 解消後の再検討条件だけを記録した。probe・metric・directive・恒久ルール・lease は追加していない。"
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
  - "memory/MEMORY.md を UTF-8 明示読みし、validate_memory_index.py で per-file atom index と照合した。欠落参照・不一致は 0 件"
  - "atoms 2,722 件の JSONL / per-file Markdown / index mirror を監査した。parse error・mirror drift・content conflict は 0 件。raw normalized-content 重複 40 群は既存 lifecycle fold により recall-visible 3 群まで抑止されている"
  - "atom title-quality sidecar の一時再生成で現 worktree に対する 646 行を確認した。依存元の新規 atom 群は開始前からの未commit差分のため、sidecar だけを commit せず監査後に開始時状態へ戻した"
  - "shared-reads の open duplicate group / stale triage / group-action sidecar を 2026-07-22 基準で指定順に再生成し、各 --check を通した。live lease 適用後の actionable group は 0 件"
  - "30 日以上更新のない memory/raw 95 ファイル（62,979,319 bytes）を確認した。Slack archive・論文 PDF/text・評価原文など provenance として保持すべきものが中心のため、この cycle での移動は 0 件"
  - "candidate 1,054 件を current-state 優先規則で dry-run 監査した。status / candidate_status の修復対象は 0 件。open candidate の stale_after 欠損は 0 件"
  - "Slack directives 23 行、broadcasts 21 行を確認し、pending は双方 0 件だったため handled 更新は 0 件"
  - "probe lifecycle の due-only lease を limit 1 で確認した。期限到来は 0 件で receipt 追加はなかった"
issues:
  - id: ISS-ENC-001
    description: "atom sr-1776127289-4d9239b255 の『AIエージェント』が『AIエ��ジェント』として raw source から atom mirror まで固定化されている"
    severity: low
    evidence: "memory/raw/slack_archive/shared-reads.jsonl:492; memory/atoms/2026-04/sr-1776127289-4d9239b255.md:3; memory/atoms.jsonl:317"
    source_file_status: "UTF-8 明示読みでも replacement character 2文字を確認した。raw source 自体に存在し、per-file / atoms.jsonl / index へ同じ内容が伝播している"
    display_or_tooling_status: "none。PowerShell や staging 表示だけの mojibake ではない。memory_health のもう1件 gr-1777083728-44d444ab7a は原文のリテラル『???』を検出した false positive で source は正常"
    why_blocks_game_memory: "『AIエージェント 個人OS』の語検索でこの記憶アーキテクチャ事例を落とす可能性がある。ただし tags / URL / 他の語では到達可能で、孤立した1 atom のため構造設計を起動するほどではない"
recommendation:
  needs_design: false
  priority_issues: []
encoding_audit:
  target: memory/MEMORY.md
  source_file_status: "UTF-8 読みは正常。代表語『記憶』『ゲーム設計』『敵パターン』を取得した。『評価軸』の完全一致は現本文になく、代わりに evaluation / px-evaluation entry を取得したため、文字化けではなく現在の index 内容差と判定"
  display_or_tooling_status: none
atom_audit:
  atoms: 2722
  mirror_counts:
    atoms_jsonl: 2722
    per_file_md: 2722
    index_jsonl: 2722
  content_conflicts: 0
  raw_normalized_content_duplicate_groups: 40
  recall_visible_normalized_content_duplicate_groups: 3
  ungrouped_repeated_title_groups: 14
  canonical_overlay_duplicate_groups: 45
  title_quality_audit_regenerated_rows: 646
  note: "canonical overlay / lifecycle fold / semantic alias が機能している。isolated source corruption 1件以外に新たな game-memory blocker は確認しなかった"
candidate_lifecycle:
  files: 1054
  counts:
    posted: 456
    ready_to_post: 9
    postponed: 327
    failed: 243
    needs_review: 18
    skipped_unreviewed: 1
  missing_stale_after: 4
  missing_stale_after_open: 0
  overdue_open_total: 185
  current_state_conflicts: 0
probe_lifecycle:
  inspected_due_count: 0
  inspected_probe_id: null
  outcome: none
  receipt: "due lease がなかったため receipt 追加なし"
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
  high_water_reason: "overdue_open_total > stale_triage_queue_rows は true だが、actionable group >= 3 は false（0 件）"
  group_handoff_budget: 1
  handed_off_group_count: 0
  handoff_inbox_pending_count: 0
  handoff_inbox_ids: []
group_action_handoff: []
stale_review_batch:
  - path: memory/shared_reads_candidates/20260515_zork_llm_reasoning_limits.md
    status: postponed
    stale_after: "2026-06-14"
    priority_reason: "game_transfer_value=high。Zork による探索・計画限界と headless playtest への注意点は具体的だが、評価条件・失敗分類・モデル比較は本文確認が必要"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_countdown_game_planning_benchmark.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "game_transfer_value=high。検証可能な遷移モデルを持つ短い puzzle benchmark は有用だが、実験設計・比較対象・結果の補完が必要"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_inmind_social_deduction_reasoning_styles.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "game_transfer_value=high。social deduction の推論 style 追跡は有用だが、既存 atom / 投稿との重複と本文の評価詳細を確認する必要がある"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_pangea_procedural_artificial_narrative.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "game_transfer_value=high。memory / validation / Unity demo の構成は具体的だが、empirical study・ablation・失敗例の確認が必要"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260517_access_profiles_game_accessibility.md
    status: postponed
    stale_after: "2026-06-16"
    priority_reason: "game_transfer_value=high。accessibility を player / developer / engine / launcher / retailer 間の基盤として扱う着想を、本文の調査条件と併せて再評価する価値がある"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
