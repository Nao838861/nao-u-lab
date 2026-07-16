# log_cdx Cycle Staging — 2026-07-16 22:58

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
- 収集なし: 直近の外部研究から `AutoBG: A Board Game Design Assistant with Interactive Ideation, Iterative Rulebook Generation, and Individualized Feedback`（https://arxiv.org/abs/2606.01976）を確認したが、書込み前 preflight が `skip`（`posted_url_match`）を返したため candidate は作成しなかった。
- preflight canonical: `memory/shared_reads_candidates/20260606_autobg_board_game_design_assistant.md`
- pending 確認: `slack_directives.jsonl` 0 件、`slack_broadcasts.jsonl` 0 件。

## Phase 2: 分析
```yaml
total_candidates: 0
pass: []
fail: []
postpone: []
stale_reviewed: []
notes:
  - "Phase 1 は posted_url_match により candidate 作成なし。"
  - "staging に stale_review_batch / group_action handoff がないため、再評価対象なし。"
```

## Phase 3: Shared-reads 投稿
```yaml
posted: []
skipped: []
notes:
  - "Phase 2 の pass が空のため、投稿対象なし。"
  - "過去 candidate の gate_decision: pass は今回の staging handoff ではないため再投稿対象に含めていない。"
```

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1782565725-d8d4021724
    source_ts: "1782565725.425459"
    title: "Godot-MCP / Godot Sight: エディタと実行中ゲームを観測・操作する AI agent"
    reason: "未レビューの score 10 以上で最新。scene tree、script validation、screenshot、run state、runtime error を同じ検証経路へ接続する知見が、次の engine-backed playable diff に新しい小さな行動を加えるか確認した。"
  scores:
    relevance: 3
    actionability: 2
    evidence: 2
    non_redundancy: 0
    risk_control: 3
    reversibility: 3
    total: 13
  decision: reject
  decision_reason: "採用条件の合計14に届かない。中核は既存の JAMER project-level validity、GameEngineBench runtime integration、visual/browser/3D observed-response probes が既に具体化している。atom も投稿途中で切れており、Godot Sight の比較結果や失敗例を再確認できないため、engine 固有名を足した重複 probe は作らない。"
  change:
    summary: "対象を reviewed に追加した。probe・評価表・directive・恒久ルールの追加は none。"
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
  - "memory/MEMORY.md を UTF-8 明示読みし、代表語 probe（記憶 / ゲーム設計 / 敵パターン / 評価軸）を確認した。source file は正常。"
  - "python tools/validate_memory_index.py を実行し、High Signal / Recent と per-file atom index の対応が OK で broken index entry がないことを確認した。"
  - "memory/atoms.jsonl を memory_health.py で監査した。2678 rows、normalized-content duplicate は raw 40 groups / 80 rows、lifecycle fold 後の recall-visible exact duplicate は 3 groups / 6 rows。既存 canonical overlay が 45 groups を管理しており、今回の破壊的整理は行っていない。"
  - "memory/raw/ の 30 日超無更新ファイルを監査した。2026-05-11〜05-16 の slack archive snapshot / web_research PDF・抽出 text などに archive 候補があるが、原文正本を Phase 4a で移動していない。"
  - "shared-reads lifecycle を監査した（964 files: posted 410 / ready_to_post 10 / postponed 399 / failed 123 / needs_review 22、missing stale_after 6、stale_after 到来済み open backlog 218）。posted / failed は再評価 handoff から除外した。"
  - "mixed duplicate / stale triage / group-action queue を 2026-07-16 基準で再生成した（81 groups / bounded 50 candidates / 36 groups）。"
  - "Slack inbox lifecycle を確認した。directives 23 rows、broadcasts 21 rows、pending は双方 0 件のため status 更新はなかった。"
issues:
  - id: ISS-4A-20260716-01
    description: "stale_after 到来済み open candidate が 218 件残る一方、stale triage sidecar は上位 50 件、group-action handoff は 1 cycle 1 group に限定されている。mixed duplicate だけでも 36 actionable groups があり、現行の消化速度では過去候補が長期間 open のまま残る。"
    severity: medium
    evidence: "tools/backfill_shared_reads_candidate_status.py --today 2026-07-16: overdue_for_reassessment=218; memory/shared_reads_stale_triage_queue.jsonl: 50 rows; memory/shared_reads_group_action_queue.jsonl: 36 rows"
    source_file_status: "UTF-8 source files are readable; candidate frontmatter is the source of truth and was not modified in Phase 4a."
    display_or_tooling_status: "none"
    why_blocks_game_memory: "posted / failed と未評価候補の境界が長期間閉じず、ゲーム制作時の検索で同一題材の古い postponed 群が混ざり続けるため、既に評価済みの知見へ辿る導線を濁す。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-4A-20260716-01
stale_backlog:
  overdue_open_total: 218
  stale_triage_queue_rows: 50
  handed_off_candidate_count: 0
  handed_off_group_count: 1
stale_review_batch: []
group_action_handoff:
  - group_key: "from world gen to quest line a dependency driven prompt pipeline for coherent rpg generation"
    representative: "memory/shared_reads_candidates/20260527_dependency_driven_rpg_generation.md"
    status: postponed
    stale_after: "2026-06-26"
    status_counts: "terminal siblings 2 / open siblings 4"
    terminal_paths:
      - "memory/shared_reads_candidates/20260515_world_gen_quest_line_dependency_pipeline.md"
      - "memory/shared_reads_candidates/20260609_world_gen_to_quest_line_rpg_pipeline.md"
    open_paths:
      - "memory/shared_reads_candidates/20260526_world_gen_to_quest_line_rpg_pipeline.md"
      - "memory/shared_reads_candidates/20260527_dependency_driven_rpg_generation.md"
      - "memory/shared_reads_candidates/20260625_dependency_driven_rpg_generation.md"
      - "memory/shared_reads_candidates/20260708_rpg_dependency_prompt_pipeline.md"
    priority_reason: "game_transfer_value=high、age_days=20。依存関係付き prompt pipeline はゲーム制作へ接続するが、評価・比較・結論の抽出が薄く、一次資料を補った group 単位の再評価が必要。"
    recommended_review_action: reevaluate_in_phase2
notes:
  - "同じ group の representative を candidate 単位 stale_review_batch に重複投入していない。"
  - "MEMORY.md source_file_status は正常。表示経路の mojibake を source 破損として issue 化していない。"
  - "raw archive 候補は参照関係と archive 正本が不明なため、Phase 4a では列挙確認のみ。"
```

## Phase 4b: 仕組み検討 (条件起動)
```yaml
designs:
  - issue_id: ISS-4A-20260716-01
    problem_restatement: "stale candidate の検出と優先順位付けは既にできているが、Phase 2 への入口が常に 1 group で、代表候補の再評価結果を open siblings の lifecycle 判断へ戻す契約もない。そのため backlog の増減に処理量が追随せず、同一題材の open candidate が検索面に残り続ける。"
    alternatives:
      - name: 案A・固定 batch 拡大
        sketch: "Phase 2 に渡す group 数を毎 cycle 3〜5 件へ固定的に増やす。既存 queue の順序と representative 選択は維持し、単純に先頭 N group を処理する。"
        pros:
          - "既存構造からの距離が短く、backlog の消化速度を直ちに上げられる"
          - "処理量が固定なので cycle の見積もりが容易"
        cons:
          - "通常の candidate 分析と競合し、各 group の根拠確認が薄くなる恐れがある"
          - "代表候補だけを評価しても siblings の status が閉じなければ、見かけの throughput しか増えない"
        migration_cost: low
      - name: 案B・group 判定による自動終端
        sketch: "代表候補の判定を group 全体へ伝播し、同一 duplicate_group_key の open siblings を自動的に failed または superseded 相当へ閉じる。terminal sibling の存在を伝播条件に使う。"
        pros:
          - "1 回の評価で複数 candidate を閉じられ、backlog を最速で縮小できる"
          - "同一題材の重複が recall に残る時間を短くできる"
        cons:
          - "同一 group 内の版差・一次資料差・ゲーム転用差を誤って潰す失敗コストが高い"
          - "candidate frontmatter が正本という現行原則に対し、自動一括更新の監査契約が未設計"
          - "誤判定時の復元と provenance 表現が必要になり、変更範囲が広い"
        migration_cost: high
      - name: 案C・bounded group review budget
        sketch: "Phase 2 の handoff を 1 group 固定から、通常 1・backlog 高水位時は最大 3 group の bounded budget にする。各 group は representative 1 件だけを深く再評価し、結果に group_action（close_siblings / keep_distinct / defer）と根拠を必須で残す。candidate 正本の更新は Phase 2 では行わず、後続の明示的 lifecycle 処理へ分離する。"
        pros:
          - "品質を保つ上限を置きつつ、backlog に応じて消化速度を上げられる"
          - "group_action を残すことで、評価件数ではなく open siblings の収束へ接続できる"
          - "自動一括終端を避けるため、誤 grouping の失敗コストを限定できる"
        cons:
          - "高水位閾値、1 cycle の budget、close_siblings の適用条件を決める必要がある"
          - "Phase 2 と lifecycle 適用工程の間に未処理 action が溜まる可能性がある"
          - "最大 3 group の cycle では通常分析の時間を圧迫しうる"
        migration_cost: medium
    recommended: 案C・bounded group review budget
    recommended_reason: "現行の再生成可能 queue と representative 単位の深い評価を再利用でき、移行距離は中程度に収まる。案Aのように評価件数だけ増やすのではなく sibling の収束判断を成果物にでき、案Bのような誤った一括終端も避けられる。最大 3 group という小さい上限なら、失敗時は budget を 1 に戻して action sidecar を破棄でき、candidate 正本への影響を限定できる。"
    decision: introduce
    decision_reason: "218 件の overdue open と 36 actionable groups に対して 1 group 固定は構造的に追いつかず、postpone して観測を増やしても入口の上限は変わらない。一方、自動終端まで同時導入する根拠は不足しているため、可逆な budget 拡張と明示的 group_action 契約だけを Phase 4c の対象にする。"
    outline_for_4c:
      - "group handoff の budget を通常 1、overdue open が高水位の時だけ最大 3 とする条件を phase 文書に定義する。初期高水位は今回観測値を直接固定せず、queue 全体に対する backlog 状態として表現する。"
      - "同一 group を candidate 単位 stale_review_batch と重複投入しない既存制約を、複数 group handoff にも適用する。"
      - "Phase 2 の group 再評価出力に group_action（close_siblings / keep_distinct / defer）、対象 paths、根拠、参照した terminal evidence を必須化する。"
      - "candidate frontmatter の自動一括更新は禁止したまま、group_action を再生成 queue とは別の監査可能な handoff として残す。"
      - "1 cycle 後に processed groups、closed または keep_distinct と判断できた open siblings、通常分析への時間影響を確認し、budget 3 の継続可否を判定する。"
notes:
  - "Phase 4a の priority_issues は 1 件であり、当該 issue の decision を記録した。"
  - "この phase では staging file 以外を編集していない。"
```

## Phase 4c: 導入 (条件起動)
```yaml
implemented:
  - issue_id: ISS-4A-20260716-01
    files_changed:
      - path: phases/phase4a_cleanup.md
        change: modified
      - path: phases/phase2_analyze.md
        change: modified
      - path: log/cycle_staging_log_cdx.md
        change: modified
    summary: "group handoff を通常 1・backlog 高水位時最大 3 の bounded budget に変更し、複数 group の重複排除と Phase 2 group_actions 契約を導入した。candidate frontmatter の自動一括更新は禁止したまま維持した。"
    partial: false
migrations: []
verification:
  - "phase 文書の high-water 条件、budget 上限、全 handoff group に対する stale_review_batch 重複排除を確認。"
  - "Phase 2 group_actions に action / target_paths / reason / terminal_evidence / representative_decision / analysis_time_minutes が必須であることを確認。"
  - "python tools/build_shared_reads_group_action_queue.py --check: OK（36 rows）。"
  - "python tools/memory_recall.py \"bounded group review budget stale candidate\": 正常終了。"
  - "python -m py_compile tools/build_shared_reads_group_action_queue.py: 正常終了。"
```

## Phase 5: 日記投稿
```yaml
posted:
  channel: "#log"
  ts: "1784210983.350139"
  permalink: "https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1784210983350139"
  char_count: 2201
  verification: ok
  draft: "drafts/phase5_log_diary_20260716_2258_cdx.md"
notes:
  - "スレッドを使わずフラット投稿した。"
  - "post_slack_message_file.py の投稿後本文検証は ok。"
```
