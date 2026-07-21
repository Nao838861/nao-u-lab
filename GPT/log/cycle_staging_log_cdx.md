# log_cdx Cycle Staging — 2026-07-21 17:28

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- inbox 確認: `slack_directives.jsonl` / `slack_broadcasts.jsonl` ともに pending 0 件。
- 直前サイクル（2026-07-21 15:13）以降を確認。local Slack archive には新しい外部 URL なし。`memory/raw/web_research/results.jsonl` の 15:22 取得分と最近の `memory/atoms.jsonl` を確認した。
- `memory/shared_reads_candidates/20260721_harness_design_post_training_llm_agents.md` — tool・説明・step 観測を構成する harness と post-training の相互作用を、ALFWorld の task / tool environment shift で調べた論文。
- duplicate preflight: 3 sidecar 再生成後に実行し `continue`。品質判定・Slack 投稿・記憶整理は未実施。

## Phase 2: 分析

```yaml
total_candidates: 1
pass: []
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260721_harness_design_post_training_llm_agents.md
    reason: abstract のみで harness 条件・OOD shift 構成・比較手法・定量結果が不足し、約 4000 字概要を根拠付きで書けない
stale_reviewed: []
group_actions:
  - group_key: d2c co development and volume over viability gdc 2026 trends revealed
    representative: memory/shared_reads_candidates/20260606_gdc2026_trends_mechanics_over_metagaming.md
    action: close_siblings
    target_paths:
      - memory/shared_reads_candidates/20260606_gdc2026_trends_mechanics_over_metagaming.md
      - memory/shared_reads_candidates/20260606_gdc2026_trends_volume_over_viability.md
    reason: 同一 PocketGamer 記事の同一 URL を別時刻に採取した重複であり、両 candidate とも紹介記事の要点メモに留まり手法と評価の材料が不足するため閉じた
    terminal_evidence:
      - path: memory/shared_reads_candidates/20260606_gdc2026_trends_mechanics_over_metagaming.md
        evidence: same source URL https://www.pocketgamer.biz/d2c-co-development-and-volume-over-viability-gdc-2026-trends-revealed/
      - path: memory/shared_reads_candidates/20260606_gdc2026_trends_volume_over_viability.md
        evidence: same source URL https://www.pocketgamer.biz/d2c-co-development-and-volume-over-viability-gdc-2026-trends-revealed/
    representative_decision: fail
    analysis_time_minutes: 5
group_handoff_audit:
  pending_before: 1
  read_ids: [gha-2d425c13d80e1db3]
  resolved_ids: [gha-2d425c13d80e1db3]
  deferred_ids: []
  partial_ids: []
  apply_counts:
    candidates_updated: 2
    already_terminal: 0
  pending_after: 0
duplicate_preflight:
  candidate: memory/shared_reads_candidates/20260721_harness_design_post_training_llm_agents.md
  decision: continue
  canonical_url: https://arxiv.org/abs/2606.25447
sidecar_audit:
  posted_source_rows: 574
  title_canonical_rows_after_group_resolution: 64
  open_duplicate_group_rows_after_group_resolution: 57
  freshness_check: passed
```

## Phase 3: Shared-reads 投稿

```yaml
posted: []
skipped:
  - candidate: memory/shared_reads_candidates/20260721_harness_design_post_training_llm_agents.md
    reason: Phase 2 の gate_decision が postpone で pass 対象が 0 件のため。abstract のみでは harness 条件・OOD shift 構成・比較手法・定量結果を根拠付きで説明できず、約 4000 字の投稿品質を満たさない
    action: candidate_revise
result: no_post
```

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1780427580-967d3f2c17
    source_ts: "1780427580.664779"
    title: "Mem0 の self-editing と append-only contamination 問題"
    reason: "未レビューの score 13 atom で、memory・agent・operation・evaluation の4優先タグを持つ。shared pool の重複・superseded atom の再ヒット・異なる instance 由来の矛盾を汚染観察へ変える提案が、現在320件ある active probe と append-only の per-atom 記憶をさらに増やすべきかという直近課題へ直接つながるため選んだ。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 2
    non_redundancy: 0
    risk_control: 1
    reversibility: 3
    total: 12
  decision: reject
  decision_reason: "risk_control=1、合計12で採用条件の14に届かない。観察条件は具体的だが、per-atom migration の status／supersedes 方針、discard／usage-signal／poisoning／retention probes、本サイクル採用済みの FAMA keep／merge／retire metric と重複する。別名の probe を増やすと320件ある active probe と review state 自体を append-only に膨らませるため、新規反映は行わず、次の Phase 4a では FAMA metric が指定した既存 probe 1件の利用差判定を優先する。"
  change:
    summary: "reviewed_source_ts と重複による reject 理由だけを更新。新規 probe・評価表・directive・恒久ルールは追加していない。"
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
  - "memory/MEMORY.md を UTF-8 明示読みし、index entry と per-file atom index の対応を検証した。validate_memory_index.py は OK、atom mirror は atoms.jsonl / per-file / index 各 2714 件で missing・parse error・content conflict 0 件。"
  - "memory/atoms.jsonl の重複を監査した。normalized content duplicate は 40 group / 80 rows、canonical overlay は 45 group で既存 fold 対象に収まり、duplicate cluster index は current、矛盾は検出されなかった。"
  - "memory/raw/ で 2026-06-21T17:48:07+09:00 より前に更新が止まった原文を棚卸しした。archive 候補は 95 files / 62,979,319 bytes（web_research 87、headless_eval 6、slack_archive 1、raw 直下 1）。原文保持と参照切れ回避のため、この phase では移動していない。"
  - "shared-reads candidate 1038 件の lifecycle を監査した。failed 238 / needs_review 18 / posted 447 / postponed 326 / ready_to_post 9、overdue open 183。stale_after 欠損 3 件はすべて posted で、再評価 queue 対象外。"
  - "title canonical index 64 rows と mixed duplicate queue 49 rows が current であることを確認し、open duplicate group queue / stale triage queue / group action queue を指定順で再生成した。"
  - "Slack directives 23 rows / broadcasts 21 rows は pending 0 件。close gate を満たして新たに handled へ変える対象はなかった。"
  - "Phase 3b の一回限り FAMA metric に従い、probe-20260604-memory-discard-operation-gate の利用差を comparison probe と照合した。state と実行ログ以外に判断・action・retirement を変えた証拠がなく、verdict は usage_evidence_missing。metric は恒久化せず終了した。"
  - "group-action budget 1 に基づき、gha-60ad688d6ffcaf25 を source_cycle_id=2026-07-21 17:28 で永続 handoff inbox へ enqueue した。"
issues:
  - id: ISS-PROBE-001
    description: "shared_reads_self_feedback_state.json に active probe が 320 件ある一方、今回指定された probe-20260604-memory-discard-operation-gate は作成・重複照合の記録しかなく、後続の staging / game action / retirement 判断を変えた利用証拠へ接続できない。比較対象 probe-20260625-amvl-retention-utility-lifecycle との差分も実利用から判定不能。"
    severity: high
    evidence: "memory/shared_reads_self_feedback_state.json の active_probes=320、review title='Memora + FAMA — Forget phase の評価装置'、target_probe=probe-20260604-memory-discard-operation-gate、comparison_probe=probe-20260625-amvl-retention-utility-lifecycle。state / codex_phase_phase3b_self_feedback_last.stderr.txt を除く repository 検索で target/comparison の利用箇所 0 件。"
    source_file_status: "UTF-8 explicit read succeeded。target と comparison の両 probe 本体は存在し、FAMA metric の scope / fields / decision_rule も破損なく取得できた。"
    display_or_tooling_status: "none"
    why_blocks_game_memory: "制作経験から作った probe が次のゲーム設計・playtest・受入判断で選ばれたかを追えないため、320 件を保持しても行動差を検証できず、経験が次作へ転移したか判定できない。"
  - id: ISS-ENC-001
    description: "active atom sr-1776127289-4d9239b255 の『AIエージェント』部分が『AIエ��ジェント』として source から破損しており、title / trigger / excerpt に replacement character が残っている。"
    severity: low
    evidence: "memory/atoms/2026-04/sr-1776127289-4d9239b255.md:3,16,20,24; memory/atoms.jsonl id=sr-1776127289-4d9239b255。memory_health.py のもう1件の suspect gr-1777083728-44d444ab7a は UTF-8 明示読みで replacement character なし。"
    source_file_status: "UTF-8 explicit read reproduces U+FFFD twice in the atom source and both mirrors; source content is damaged. MEMORY.md itself decodes normally, and probes for 記憶 / ゲーム設計 / 敵パターン succeed; 評価軸 is not present as a lexical item."
    display_or_tooling_status: "none; PowerShell の表示経路だけの mojibake ではない。"
    why_blocks_game_memory: "『エージェント』での title / trigger 検索からこの active atom が漏れる可能性がある。ただし単発の data repair 対象で、記憶階層の再設計を要する規模ではない。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-PROBE-001
probe_reuse_audit:
  metric: fama_active_probe_reuse_penalty
  target_probe: probe-20260604-memory-discard-operation-gate
  comparison_probe: probe-20260625-amvl-retention-utility-lifecycle
  reuse_evidence: "作成・重複参照のみ。後続判断を変えた evidence は見つからない。"
  unique_delta: "実利用証拠がないため比較不能。"
  verdict: usage_evidence_missing
  metric_lifecycle: expired_after_this_phase
stale_backlog:
  overdue_open_total: 183
  stale_triage_queue_rows: 50
  open_duplicate_group_count: 57
  mixed_group_count: 49
  all_open_group_count: 8
  actionable_group_count: 1
  backlog_high_water: false
  high_water_basis: "overdue_open_total > stale_triage_queue_rows は true だが、actionable_group_count >= 3 は false。"
  group_handoff_budget: 1
  handed_off_group_count: 1
  handoff_inbox_pending_count: 1
  handoff_inbox_ids:
    - gha-60ad688d6ffcaf25
group_action_handoff:
  - group_key: "zenith diffusion model driven map generation"
    group_kind: all_open
    representative: memory/shared_reads_candidates/20260609_zenith_diffusion_map_generation.md
    open_siblings:
      - memory/shared_reads_candidates/20260609_zenith_diffusion_map_generation.md
      - memory/shared_reads_candidates/20260626_zenith_diffusion_map_generation.md
    terminal_siblings: []
    status_counts:
      postponed: 2
    source_url_evidence:
      - "https://schedule.gdconf.com/session/zenith-diffusion-model-driven-map-generation/914450"
    latest_evidence:
      path: memory/shared_reads_candidates/20260609_zenith_diffusion_map_generation.md
      stale_after: "2026-07-09"
      reason: "age_days=12。同一 URL の2候補が all-open のまま残る。geometry extraction と multi-encoder ControlNet による map generation は転用性があるが、GDC セッション概要だけではモデル構成・失敗例・評価が不足する。"
    inbox_id: gha-60ad688d6ffcaf25
stale_review_batch:
  - path: memory/shared_reads_candidates/20260616_jamel_memory_exploration_novelty.md
    status: postponed
    stale_after: "2026-07-16"
    priority_reason: "game_transfer_value=high。novelty signal で memory と exploration を同時に学ぶ着想は game AI 評価へ転用できるが、signal 定義・memory 表現・学習手順の本文確認が必要。同じ duplicate group は candidate 単位で1件だけ渡す。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260515_zork_llm_reasoning_limits.md
    status: postponed
    stale_after: "2026-06-14"
    priority_reason: "game_transfer_value=high。Zork における探索・計画限界は headless playtest に有用だが、position paper の評価条件・失敗分類・model 比較を本文で補う必要がある。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_countdown_game_planning_benchmark.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "game_transfer_value=high。検証可能な遷移を持つ短い planning benchmark として使いやすいが、実験設計・比較対象・結果の具体が不足する。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_inmind_social_deduction_reasoning_styles.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "game_transfer_value=high。個別 reasoning style の追跡は social deduction 設計へ接続できるが、既存 Slack atom との重複と本文の評価指標・失敗例を確認する必要がある。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260516_pangea_procedural_artificial_narrative.md
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "game_transfer_value=high。memory・validation・REST interface・Unity demo の接続は LLM NPC の破綻抑制に使えるが、empirical study / ablation の評価指標と失敗例を本文で確認する必要がある。"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)
```yaml
designs:
  - issue_id: ISS-PROBE-001
    problem_restatement: "probe 本体は320件保存されているが、どの後続 phase がいつ使うか、使用前後で判断がどう変わったか、期限後に何を keep / merge / retire するかを結ぶ運用状態がない。現状の repository 内 ID 検索は作成・重複参照と実利用を区別できず、active という名前だけが増え続けている。"
    alternatives:
      - name: "案A: 既存 state 内 lifecycle overlay"
        sketch: "memory/shared_reads_self_feedback_state.json に probe_id をキーとする lifecycle map を追加し、leased / dormant / merged / retired、consumer、due_after、usage receipt を保持する。既存 active_probes は本文の正本として残し、overlay にない legacy probe は dormant とみなす。"
        pros:
          - "新しい保存先や helper tool を増やさず、Phase 3b が既に更新する state の中で完結する。"
          - "probe 本文と lifecycle を probe_id で直接照合できる。"
          - "legacy probe を一括書換えせず、触れたものから段階移行できる。"
        cons:
          - "既に約1.5万行ある単一 JSON に mutable な運用状態を重ね、差分競合と全体再書込みを増やす。"
          - "review 履歴・probe 本文・現在状態・receipt が同居し、正本の境界がさらに曖昧になる。"
          - "手編集で lease / receipt の整合性を維持する必要がある。"
        migration_cost: medium
      - name: "案B: 期限付き probe lease / receipt ledger"
        sketch: "probe 本文は既存 state に保持したまま、別の lifecycle ledger に probe_id、consumer_phase、expected_delta、lease_due、status、before / after decision、evidence pointer を記録する。operational active は未完了 lease のみとし、consumer が receipt を返さないまま期限切れなら削除せず dormant に戻す。"
        pros:
          - "作成記録と判断差の証拠を分離し、active を『利用先と期限がある状態』として機械判定できる。"
          - "320件の legacy probe を破壊的に移行せず dormant な履歴として残し、必要な1件だけ再 lease できる。"
          - "1 cycle 1件の enqueue / resolve budget にでき、利用証拠がない probe をさらに増やしにくい。"
        cons:
          - "新しい ledger、validator / enqueue / resolve helper、Phase 3b と Phase 4a の契約更新が必要になる。"
          - "consumer_phase と expected_delta が曖昧だと receipt が自己申告だけになり、形だけの利用記録になる。"
          - "既存 state と ledger の probe_id 整合性、重複 lease、期限判定を検証する必要がある。"
        migration_cost: medium
      - name: "案C: repository 参照回数 + TTL"
        sketch: "定期的に probe_id の repository 出現箇所を数え、created_at / expires_after と参照回数だけで keep / retire 候補を生成する。既存320件を一括監査できるが、明示的な consumer handoff は作らない。"
        pros:
          - "既存データだけで全 probe を機械的に棚卸しできる。"
          - "後続 phase の記録様式を大きく変えずに導入できる。"
          - "孤立 ID と期限超過を安価に発見できる。"
        cons:
          - "作成・重複照合・ログ出力も利用として数えるため、今回の false positive を解消できない。"
          - "ID を明記せず内容だけ使った場合は false negative になる。"
          - "参照数だけでは comparison probe との unique delta や判断への因果を示せない。"
        migration_cost: low
    recommended: "案B: 期限付き probe lease / receipt ledger"
    recommended_reason: "issue の中心は検索不足ではなく、producer である Phase 3b と consumer である後続 phase の間に因果を記録する handoff がないことなので、案Cでは解消しない。案Aは保存面を増やさない反面、既に大きい state の責務と書込み競合を増やす。案Bなら既存 probe 本文を無変更で保持し、operational active だけを小さな ledger へ分離できる。ledger や helper が失敗しても probe は消えず dormant に戻るだけで、再 lease 可能なため失敗コストが低い。legacy 320件の一括判定は避け、まず ISS-PROBE-001 の target / comparison だけで契約を検証する距離に限定する。"
    decision: introduce
    decision_reason: "Phase 4a で active_probes=320、target / comparison の repository 実利用箇所0件、verdict=usage_evidence_missing という具体的証拠が揃っている。既存の expires_after は自然言語で、consumer、期限到来、判断差、解決状態を機械的に閉じられないため現状維持では同じ欠測が続く。削除や一括 migration を伴わない lease / receipt の最小導入なら可逆であり、次の Phase 4c に送れる粒度まで設計が固まった。"
    outline_for_4c:
      - "probe 本文の正本は memory/shared_reads_self_feedback_state.json の active_probes のまま変更せず、operational lifecycle の正本として memory/shared_reads_probe_lifecycle.jsonl を追加する。"
      - "ledger row を probe_id / source_review_ts / consumer_phase / trigger_artifact / expected_delta / leased_at / lease_due / status(pending|resolved|dormant|merged|retired) / receipt(before_decision, after_decision, changed, evidence) / superseded_by の契約にする。"
      - "enqueue / resolve / pending / validate を行う単一 helper を用意し、存在しない probe_id、同一 probe の重複 pending lease、evidence なしの resolved、循環 superseded_by を拒否する。"
      - "Phase 3b の adopt_probe / adopt_metric は consumer_phase、trigger_artifact、expected_delta、lease_due を指定して1件だけ enqueue し、指定できない知見は active 扱いにせず state-only review に留める。"
      - "Phase 4a は1 cycle 1件だけ due lease を確認し、consumer artifact の before / after decision と evidence pointer を receipt に残す。判断差なしは merge / retire 候補、未観測は dormant とし、自動削除しない。"
      - "初期 migration は probe-20260604-memory-discard-operation-gate と probe-20260625-amvl-retention-utility-lifecycle の2件だけを fixture とし、残り legacy probe は ledger 不在=dormant として本文を保持する。"
      - "target が usage_evidence_missing のまま期限切れになる経路、comparison へ merge する経路、判断差ありで再 lease する経路をテストし、Phase 4a staging に pending / resolved / dormant 件数を出す。"
```

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
