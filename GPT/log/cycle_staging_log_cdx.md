# log_cdx Cycle Staging — 2026-07-22 02:43

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
- pending 確認: `slack_directives.jsonl` 0件 / `slack_broadcasts.jsonl` 0件。
- `memory/shared_reads_candidates/20260722_sunset_twist_first_gamejam_postmortem.md` — 作者には自然になった独特な移動操作を初見testerが読めず、入力表示の削減と進行方向cueで調整した一方、難度指摘を残したまま出した初game jam制作記録。
- preflight: `First Gamejam Post-Mortem` / `https://itch.io/devlog/1578153/first-gamejam-post-mortem` は `continue`。指定3 sidecar再生成後に保存。

## Phase 2: 分析
```yaml
evaluated_at: "2026-07-22T02:49:51+09:00"
total_candidates: 1
pass:
  - memory/shared_reads_candidates/20260722_sunset_twist_first_gamejam_postmortem.md
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
duplicate_preflight:
  builders_rerun_before_evaluation: true
  builders_rerun_after_frontmatter_update: true
  decision: continue
  title_key: first gamejam post mortem
  canonical_url: https://itch.io/devlog/1578153/first-gamejam-post-mortem
```

- 判定根拠: 初見者の操作理解を visual cue で改善した事例と、難度指摘を残した失敗、jam 中の scope 逸脱、重要な物語情報の露出不足が評価値・工程順と結び付いている。単一作者の自己報告という限界を明示しても、Log_cdx の短期 prototype に具体的な検証項目として適用でき、記事固有の約4000字分析を構成できるため pass。

## Phase 3: Shared-reads 投稿
```yaml
reviewed_at: "2026-07-22T02:55:03+09:00"
posted:
  - candidate: memory/shared_reads_candidates/20260722_sunset_twist_first_gamejam_postmortem.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784656503008299
    char_count: 4291
skipped: []
duplicate_preflight:
  decision: continue
  title_key: first gamejam post mortem
  canonical_url: https://itch.io/devlog/1578153/first-gamejam-post-mortem
post_verification: ok
```

- 最終判定: 投稿。操作理解・純粋な難度・熟達性を分離し、評価順位、cue変更、jam工程、物語露出の失敗条件まで記事固有に分析した。必須6項目、4,291字、禁止表現なし、URL末尾を確認し、1回の `chat.postMessage` で投稿した。

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1781127468-2dc35ddd13
    source_ts: "1781127468.122429"
    title: Shutshimi 10秒バースト分析の後半断片
    reason: 最新の未レビュー score 14 atom だが、約29ms前の同一 Slack 投稿 atom が既にレビュー済みであり、反映前に重複と断片性を確認するため選んだ。
  scores:
    relevance: 2
    actionability: 1
    evidence: 1
    non_redundancy: 0
    risk_control: 3
    reversibility: 3
    total: 10
  decision: reject
  decision_reason: actionability が2未満、合計が14未満。d3〜d5と判定だけの途中断片で原典・問題設定・手法・評価の全体を欠き、同一投稿の先頭側 atom は2026-07-18にレビュー済み。10秒固定値は既存 timescale／loop／tempo probes とも重複するため反映しない。
  change:
    summary: reviewed_source_ts と断片重複による reject 理由だけを記録した。probe、評価表、directive、恒久ルール、lease は追加していない。
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  lease: null
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```

- 既存 pending lease `probe-20260625-amvl-retention-utility-lifecycle` は Phase 4a 向けに維持し、本レビューから lifecycle ledger への enqueue は行っていない。

## Phase 4a: 整理 + 問題抽出

```yaml
cleaned:
  - "memory/MEMORY.md を UTF-8 明示読みし、per-file atom index との対応を検証した。broken index entry は 0 件。代表語は 記憶=23、ゲーム設計=8、敵パターン=1、評価軸=0 で、最後は文字化けではなく現行 index に完全一致語がない状態。"
  - "memory/atoms.jsonl と per-file/index mirror を監査した。3層とも 2716 件、content_conflicts=0、raw normalized-content duplicate=40群、recall-visible duplicate=3群で、45群の canonical overlay は最新。"
  - "memory/raw/ の 30日超ファイル 95件・62,979,319 bytes を確認した。Slack 原文、論文 PDF/TXT、headless 評価原文という provenance 入力であり、参照切れを避けるため archive_candidates は 0 件とした。"
  - "candidate 派生 index を指定順で再生成した。title canonical=65群、mixed duplicate=49群、open duplicate=56群、stale triage=50行、group action=0群。candidate 本体は変更していない。"
  - "slack_directives.jsonl 23行 / slack_broadcasts.jsonl 21行を監査し、pending は双方 0 件。close 対象はなかった。"
  - "group handoff を cycle_id=2026-07-22T02:43+09:00 / budget=1 で enqueue 監査した。actionable group は 0 件、inbox pending も 0 件で、新規 handoff はなかった。"
  - "probe lifecycle を validate し、期限到来 lease は 0 件だったため receipt 更新は行っていない。"
candidate_lifecycle:
  files: 1045
  counts:
    posted: 450
    ready_to_post: 9
    postponed: 327
    failed: 240
    needs_review: 18
    skipped_unreviewed: 1
  missing_stale_after: 4
  overdue_for_reassessment: 185
  anomalies:
    current_state_transition_lacks_evidence: 1
    stale_after_differs_from_30d_default: 14
issues:
  - id: ISS-4A-20260722-04
    description: "candidate lifecycle audit が last_decision=posted_url_match を『投稿済み状態』と解釈し、投稿済み URL との重複を理由に postponed とした evidence 付き遷移を evidence 不足として誤検出する。"
    severity: medium
    evidence: "memory/shared_reads_candidates/20260718_ai_native_games_survey_roadmap.md: gate_decision=pass、duplicate_preflight_decision=skip、status/candidate_status=postponed、last_decision=posted_url_match、canonical_path と permalink を含む evidence あり; tools/backfill_shared_reads_candidate_status.py dry-run の current_state_transition_lacks_evidence=1"
    source_file_status: "candidate は UTF-8 として正常に読め、status/candidate_status、duplicate_reason、canonical_path、permalink は相互に整合する。"
    display_or_tooling_status: "status_from_last_decision が posted で始まる token を一律 posted lifecycle と読むための audit false-positive。"
    why_blocks_game_memory: "重複 candidate の『投稿した』と『投稿済み work なので見送った』を区別できず、terminal close と将来再評価の判断を誤らせる。"
  - id: ISS-4A-20260722-05
    description: "active atom 1件の raw 原文と派生 atom に Unicode replacement character が残り、『AIエージェント』の語が壊れている。"
    severity: low
    evidence: "memory/raw/slack_archive/shared-reads.jsonl:492; memory/atoms/2026-04/sr-1776127289-4d9239b255.md:3; source_ts=1776127289.990919"
    source_file_status: "UTF-8 明示読みでも source raw 自体に『AIエ��ジェント』があり、per-file atom と index も同じ値を保持する。"
    display_or_tooling_status: "console mojibake ではない。memory_health のもう1件 gr-1777083728-44d444ab7a は UTF-8 source が正常な heuristic false-positive。"
    why_blocks_game_memory: "完全一致の『AIエージェント』検索から score 11 の atom 1件が漏れるが、影響は局所的。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-4A-20260722-04
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
  stale_review_batch_count: 5
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
  - path: memory/shared_reads_candidates/20260515_zork_llm_reasoning_limits.md
    status: postponed
    stale_after: "2026-06-14"
    priority_reason: "headless playtest に直結する探索・計画限界だが、評価条件、失敗分類、モデル比較を一次本文で補う必要がある。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_countdown_game_planning_benchmark.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "検証可能な短い planning benchmark として転用価値が高く、実験設計、比較対象、結果の補強が必要。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_inmind_social_deduction_reasoning_styles.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "個別推論スタイル追跡はゲーム AI に有用だが、既存 atom との重複と評価指標・失敗例の本文確認が必要。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_pangea_procedural_artificial_narrative.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "LLM NPC validation の構成は具体的だが、empirical study、ablation、失敗例の精読が必要。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260517_access_profiles_game_accessibility.md
    status: postponed
    stale_after: "2026-06-16"
    priority_reason: "初回設定・入力補助・字幕・難度の基盤設計へ移せるが、player/developer 双方の評価結果を一次本文で確認する必要がある。"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)

```yaml
designed_at: "2026-07-22T03:08:13+09:00"
designs:
  - issue_id: ISS-4A-20260722-04
    problem_restatement: >-
      candidate の現在状態は postponed だが、遷移理由の posted_url_match が
      last_decision に入り、audit が先頭文字列 posted を状態 posted と誤読している。
      状態、判定、理由を同じ自由文字列から推測する契約では、evidence が十分でも
      正常な terminal close を anomaly にしてしまう。
    alternatives:
      - name: 案A・posted_url_match の局所例外
        sketch: >-
          status_from_last_decision に posted_url_match は postponed とみなす例外を加える。
          candidate frontmatter は変更せず、今回の false-positive だけを抑える。
        pros:
          - 変更範囲と migration が最小
          - 現在の candidate 記録をそのまま保持できる
        cons:
          - 理由語から状態を推測する混線が残る
          - 新しい posted_* 理由が増えるたびに例外追加が必要
          - posted_url_match が常に同じ遷移先とは限らない
        migration_cost: low
      - name: 案B・last_decision を閉じた状態語彙に限定
        sketch: >-
          last_decision は posted / ready_to_post / postpone(d) / fail(ed) / needs_review の
          明示的な状態判定だけを受け付け、prefix 推測をやめる。posted_url_match のような
          原因は既存 duplicate_reason と evidence に保持し、非正規行だけを正規化する。
        pros:
          - 状態と理由の責務が分かれ、同型の prefix 衝突を防げる
          - 新規 field や別 ledger が不要で、現行 schema からの距離が短い
          - duplicate_reason と canonical_path / permalink の provenance を失わない
        cons:
          - 既存の非正規 last_decision を洗い出して正規化する必要がある
          - 許可する alias と canonical 出力値を一度固定する必要がある
          - writer と audit の双方で同じ語彙契約を守る必要がある
        migration_cost: low
      - name: 案C・遷移イベント ledger の新設
        sketch: >-
          from / to / reason / evidence / timestamp を持つ append-only ledger を作り、
          candidate frontmatter は最新状態の projection とする。audit は ledger を正本にする。
        pros:
          - 複数回遷移の履歴と根拠を最も明確に保持できる
          - 状態 projection の再構築と時系列 audit が可能
        cons:
          - 1045 candidate の移行と writer 群の変更が必要
          - frontmatter と ledger の二重正本化リスクがある
          - false-positive 1件に対して仕組みが過大
        migration_cost: high
    recommended: 案B・last_decision を閉じた状態語彙に限定
    recommended_reason: >-
      失敗原因は posted_url_match 固有ではなく prefix 推測そのものにあるため、案Aは再発を先送りする。
      案Bなら既存の status / candidate_status を現在状態、duplicate_reason / evidence を理由と根拠として
      そのまま使え、非正規 last_decision の少数行と audit 契約だけを直せる。失敗時も dry-run anomaly の
      増減として検出でき、ledger を増やす案Cより撤回コストが小さい。
    decision: introduce
    decision_reason: >-
      現行データだけで責務分離が成立し、対象例と再発条件が明確で、Phase 4c で小さく検証可能である。
      historical gate_decision は品質判定として保持し、現在状態を巻き戻す根拠にはしない。
    outline_for_4c:
      - last_decision の状態解釈を完全一致の閉じた allow-list にし、startswith による推測を廃止する
      - posted_url_match を last_decision に持つ candidate を、状態判定は postpone(d)、理由は duplicate_reason、根拠は evidence という分担へ正規化する
      - gate_decision=pass から postponed へ evidence 付きで進んだ重複 skip が正常と判定され、posted_* という未知理由を posted 状態に誤認しない回帰テストを追加する
      - dry-run audit で current_state_transition_lacks_evidence が 0 件になり、lifecycle count と terminal 状態が変わらないことを確認する
      - Phase 4a の監査説明に、last_decision は閉じた状態語彙、原因は専用 reason field と evidence に置く契約を反映する
```

## Phase 4c: 導入 (条件起動)

```yaml
implemented:
  - issue_id: ISS-4A-20260722-04
    files_changed:
      - path: tools/backfill_shared_reads_candidate_status.py
        change: modified
      - path: tools/migrate_shared_reads_last_decision.py
        change: created
      - path: tools/shared_reads_group_handoff.py
        change: modified
      - path: tools/test_backfill_shared_reads_candidate_status.py
        change: modified
      - path: tools/test_migrate_shared_reads_last_decision.py
        change: created
      - path: tools/test_shared_reads_group_handoff.py
        change: modified
      - path: phases/phase2_analyze.md
        change: modified
      - path: phases/phase4a_cleanup.md
        change: modified
      - path: memory/shared_reads_candidates/*.md (legacy 値を持つ 181 files)
        change: modified
      - path: log/cycle_staging_log_cdx.md
        change: modified
    summary: >-
      last_decision の状態解釈を完全一致の閉じた語彙へ変更し、group handoff writer と
      Phase 2/4a の運用契約を状態・理由・evidence の分離へ揃えた。
    partial: false
migrations:
  - what: >-
      legacy last_decision 181件を正規化し、理由を duplicate_reason または
      lifecycle_backfill_reason へ退避した。内訳は failed_duplicate_of_terminal_sibling 111、
      postponed_duplicate 59、fail_duplicate_posted 4、posted_url_match 2、
      postpone_lifecycle_backfill 2、posted_existing_duplicate 3。
    affected: >-
      memory/shared_reads_candidates の 181 files。lifecycle count は failed 240、
      needs_review 18、posted 450、postponed 327、ready_to_post 9 のまま不変。
verification:
  - "python -m unittest discover -s tools -p 'test_*shared_reads*.py': 44 tests OK"
  - "python -m unittest tools.test_migrate_shared_reads_last_decision: 2 tests OK"
  - "py_compile: backfill / migration / group_handoff の3 scripts OK"
  - "migration dry-run: changed=0、conflicts=0（再実行 idempotent）"
  - "candidate audit dry-run: current_state_transition_lacks_evidence=0。既存の stale_after 差異14件だけが残り、本 issue 外のため未変更"
  - "memory_recall.py --no-log: compact recall で2 atomsを読めることを確認"
  - "対象差分の git diff --check: OK"
```

## Phase 5: 日記投稿
```yaml
posted:
  channel: "#log"
  permalink: https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1784657968502049
  slack_ts: "1784657968.502049"
  char_count: 1989
  draft: drafts/phase5_log_diary_20260722_0318_cdx.md
post_verification: ok
```

- 初 game jam 記録の cue 設計と、candidate lifecycle の状態語彙設計を「受け手が一意に読める表現」という一本の学びとして結び、断片 atom を制度化しなかった撤退、残る backlog と次の probe まで含めて #log にフラット投稿した。
