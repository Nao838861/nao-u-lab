# log_cdx Cycle Staging — 2026-08-26 22:31

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- pending inbox: `slack_directives.jsonl` 0件 / `slack_broadcasts.jsonl` 0件。
- Slack確認: 直前サイクル以降、#shared-reads / #all-nao-u-lab のローカル取得分に新しい外部 URL なし。
- web_research / recent atoms: 2026-08-26 21:46・22:01取得分と、20:48以降の recent atom を確認。
- `memory/shared_reads_candidates/20260826_weighted_memory_tree_long_horizon_agents.md` — 長期 task の履歴を task / subtask / action の木と動的 retention score で管理する WMT の一次情報を収集。
- duplicate preflight: `continue`（canonical URL: `https://arxiv.org/abs/2608.20631v1`）。書込み前に3 sidecarを再生成済み。
- Phase 1 範囲: candidate 1件の収集のみ。品質判定・Slack投稿・記憶整理は未実施。

## Phase 2: 分析

```yaml
total_candidates: 1
pass:
  - memory/shared_reads_candidates/20260826_weighted_memory_tree_long_horizon_agents.md
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
  oldest_collected_at: "2026-08-26T22:34:36+09:00"
  selection_limit: 5
  selected_paths: []
  phase1_excluded_paths:
    - memory/shared_reads_candidates/20260826_weighted_memory_tree_long_horizon_agents.md
  evaluated_paths:
    - memory/shared_reads_candidates/20260826_weighted_memory_tree_long_horizon_agents.md
  valid_backlog_after: 0
```

- `Weighted Memory Tree` は pass。task / subtask / action の階層化、動的 retention score、event-based update、selection-based decay、fold、3モデルでの比較・ablation・memory-poisoning 評価まで揃い、CoopEval 水準の概要へ展開できる。
- ゲーム制作では、feature / subtask / action の制作履歴から、現行仕様・未解決 failure・検証済み evidence を active に残し、完了試行を fold する具体的な運用へ接続できる。論文の GAIA-Text 結果をそのまま制作性能とみなさず、部分採用として扱う。
- duplicate preflight は `continue`。Phase 2 開始時に posted-source / title canonical / open duplicate group の3 sidecarを再生成し、`--check` を通過済み。

## Phase 3: Shared-reads 投稿

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260826_weighted_memory_tree_long_horizon_agents.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787752001500119
    char_count: 4465
skipped: []
```

- 最終判定: 投稿（判定は部分採用）。論文本体で task / subtask / action 階層、retention score、fold / suppress / reopen、GAIA / GAIA-Text、component ablation、memory-poisoning 評価、cross-conversation 未評価などの限界を再確認した。
- 投稿前 review: 必須6項目・順序・URL末尾・禁止表現・candidate 固有性を確認。本文4,464字（末尾改行除外）で policy pass。`chat.postMessage` 1回、thread 返信なし。Slack 再取得検証 `ok`。

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1787743723-19bf8bd14f
    source_ts: "1787743723.498909"
    title: "Scaling Creative Writing Beyond Story-Centric Data with Attribute-Guided Genre Expansion"
    reason: "score 12・未レビュー・優先5タグの最新候補。題材 seed と成果物 contract の分離が次のゲーム企画・仕様・prototype 到達判断を小さく変えるか確認した。Nao_u の明示評価 reply は raw で未確認。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 3
    non_redundancy: 1
    risk_control: 1
    reversibility: 3
    total: 14
  decision: defer
  decision_reason: "既存の genre skeleton／theme slot contract／benchmark 目的整合／structural-semantic verifier と大幅に重なる。直後の Phase 4a には同一 seed・model・token budget で複数成果物と playable diff 到達率を比較できる trigger artifact がなく、327件の active probe へ追加する確認負荷が判断差を上回るため、risk_control が採用閾値未満。次の具体的 game-design artifact で既存4 controlsだけでは topic diversity と artifact-specific compliance を分けられない時に、paired comparison 1件として再評価する。"
  change:
    summary: "reviewed state と defer 理由のみ更新。active_probes・ledger・directive・恒久ルールは変更なし。"
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
  - "memory/MEMORY.md の index 参照 87 ID を atoms.jsonl と照合し、欠落 0 件を確認。validate_memory_index.py も OK。"
  - "MEMORY.md を UTF-8 明示読みし、代表語は 記憶=true / ゲーム設計=true / 敵パターン=true / 評価軸=false。評価軸は文字化けではなく literal 不在で、source 再生成対象にはしなかった。"
  - "atoms.jsonl / per-file atom / index.jsonl は各 2,982 件、mirror drift・parse error・content conflict は 0 件。duplicate cluster 45 群は既存 canonical overlay と整合。"
  - "stale だった atom title 派生 index を再生成。title_quality_audit=905 rows / 682 groups、title_cluster_index=786 clusters / 936 members とし、両方の --check を通過。"
  - "memory/raw/ の最終更新 30 日超は 242 files。raw provenance として参照中の Slack archive / web research 原文を含むため、この cycle では移動せず archive 候補の確認だけに留めた。"
  - "candidate lifecycle は posted=718 / ready_to_post=9 / postponed=208 / failed=516 / needs_review=0。terminal canonical=108 groups、open duplicate=29 groups（mixed=25 / all_open=4）へ再生成。"
  - "stale_after 到来済み open candidate 4 件は、2 件ずつ既存 deferred group lease gha-e6d4d4b5a37a0808 / gha-2313a247c62a9028 に包含され、retry_after=2026-09-19T14:08:16+09:00 まで explicit_keep。候補単位の再投入は 0 件。"
  - "Slack inbox は directives=0 pending / broadcasts=0 pending。完了根拠のない handled 更新は行わなかった。"
  - "due probe lease は 0 件。probe lifecycle validate は errors=0。"
issues:
  - id: ISS-4A-20260826-01
    description: "mojibake health audit が、実際の U+FFFD source corruption と、ゲーム本文中の意図的な UI 表記 `???` を同じ suspect warning に畳んでいる。source_file_status と表示・tooling status を機械的に区別できない。"
    severity: medium
    evidence: "tools/atom_quality.py: mojibake_score の replacement_count / run_count 共通 suspect 判定; memory/raw/slack_archive/shared-reads.jsonl:492 と memory/atoms/2026-04/sr-1776127289-4d9239b255.md に U+FFFD; memory/atoms/2026-04/gr-1777083728-44d444ab7a.md の `???がヘッダに出る` は Nao_u 原文の有効な UI 表記"
    source_file_status: "UTF-8 strict read は成功。sr-1776127289-4d9239b255 は raw source と dual-written atom の双方に U+FFFD が保存された真の source corruption。gr-1777083728-44d444ab7a は U+FFFD なしで原文正常。"
    display_or_tooling_status: "memory_health.py は両 atom を同一の `mojibake suspect atoms 2件` warning として表示し、true corruption / semantic question-run を分離しない。"
    why_blocks_game_memory: "ゲーム feedback では `???` のような UI 記号が正当な観測として現れるため、false positive が真の破損 title を埋もれさせる。逆に一括修復すると教師 feedback を改変する危険があり、次制作での正確な recall と監査判断を弱める。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-4A-20260826-01
probe_lifecycle:
  inspected_due_count: 0
  inspected_probe_id: null
  outcome: none
  receipt: null
  counts:
    pending: 0
    resolved: 11
    dormant: 1
stale_backlog:
  overdue_open_total: 4
  stale_triage_queue_rows: 0
  open_duplicate_group_count: 29
  mixed_group_count: 25
  all_open_group_count: 4
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
  deferred_group_leases:
    - id: gha-e6d4d4b5a37a0808
      group_key: "joint agent memory and exploration learning via novelty signals"
      candidate_count: 2
      action: explicit_keep
      retry_after: "2026-09-19T14:08:16+09:00"
    - id: gha-2313a247c62a9028
      group_key: "an exploration of collision based enemy morphology generation"
      candidate_count: 2
      action: explicit_keep
      retry_after: "2026-09-19T14:08:16+09:00"
group_action_handoff: []
stale_review_batch: []
```

## Phase 4b: 仕組み検討 (条件起動)

```yaml
designs:
  - issue_id: ISS-4A-20260826-01
    problem_restatement: "現在の mojibake 判定は、復元不能な置換文字 U+FFFD と、ゲーム UI の観測として意味を持つ `???` / 疑問符比率を同じ boolean に潰している。その boolean を health warning と Slack ingest quarantine が共有するため、監査では真の破損が埋もれ、取り込みでは正常な教師 feedback を失いうる。"
    alternatives:
      - name: "案A: reason-coded 二段階分類"
        sketch: "field ごとの検出結果を `hard_corruption`（U+FFFD）と `ambiguous_question_run`（`???` または疑問符比率）へ分離し、atom 集約でも class と reason を失わない。health は hard warning と review-only signal を別集計し、ingest quarantine は hard class だけを止める。既存 `suspect` boolean は移行期間だけ派生値として残す。"
        pros:
          - "文字種という観測事実だけで分けるため、ゲーム本文の意味推測や atom 個別 allowlist が不要"
          - "health と ingest が同じ reason-coded report を使いながら、用途別の action を明示できる"
          - "既存 field report と helper を段階的に移行でき、失敗時も旧 boolean へ戻しやすい"
        cons:
          - "疑問符だけへ化けた真の文字化けは review-only 側に残り、自動 quarantine では捕捉できない"
          - "report の consumer ごとに hard / ambiguous の扱いを決め、互換期間を管理する必要がある"
        migration_cost: medium
      - name: "案B: atom 単位の intentional 表示注記 / allowlist"
        sketch: "正当な `???` を含む atom に `quality_exceptions: [intentional_question_run]` のような注記を付け、既存 suspect 判定から除外する。未注記の疑問符 run と U+FFFD は従来どおり warning / quarantine 対象にする。"
        pros:
          - "確認済み atom については意図的表示と破損を高精度に区別できる"
          - "既存 boolean と consumer の挙動をほぼ変えずに済む"
          - "例外判断の根拠を atom 側に監査可能な形で残せる"
        cons:
          - "既存・新規 atom ごとに人手注記が必要で、教師 feedback の取り込み前 false positive は防げない"
          - "例外リストが増え、同じ UI 表記でも注記漏れにより挙動が変わる"
          - "raw source と dual-written atom の両方へどう注記を伝播するか追加契約が要る"
        migration_cost: high
      - name: "案C: 文脈・比率ヒューリスティックの調整"
        sketch: "`???` 単独では suspect にせず、疑問符比率、周辺の日本語、連続長、既知 mojibake marker の組合せで閾値を調整する。外部 schema や consumer は変えず boolean 判定だけを更新する。"
        pros:
          - "変更箇所と移行対象が最小"
          - "既存 health / quarantine の出力形式を維持できる"
          - "現在確認された UI 表記の false positive は短期的に抑えられる"
        cons:
          - "意味を推測する閾値は説明しにくく、別の UI 記号や短文で再発しやすい"
          - "hard corruption と ambiguous signal が boolean のままで、監査上の区別は解決しない"
          - "閾値変更で見逃しが生じても reason が残らず検証しにくい"
        migration_cost: low
    recommended: "案A: reason-coded 二段階分類"
    recommended_reason: "U+FFFD と ASCII 疑問符 run は機械的に区別でき、現状の証拠でも前者だけが raw source と atom の双方に残る真の破損である。案Aは個別データの改変や意味推測をせず、既存 report の拡張と consumer の action 分離で到達できる。案Bより継続保守が小さく、案Cより誤判定時の理由と影響範囲を追跡しやすい。互換 boolean を一時維持すれば rollback も局所的である。"
    decision: introduce
    decision_reason: "priority issue は実例があり、同じ boolean が health と ingest の異なる目的を兼ねている構造原因まで特定できている。分類境界、consumer ごとの action、互換方針が定まったため、次 Phase 4c で小さく導入できる。"
    outline_for_4c:
      - "atom_quality の field report に reason と `hard_corruption` / `ambiguous_question_run` の分類を追加し、U+FFFD と疑問符 signal を独立集計する"
      - "atom 集約 report で hard fields と ambiguous fields を分離し、既存 `suspect` / helper の互換期間と廃止条件を明記する"
      - "Slack ingest の quarantine 条件を hard corruption のみに接続し、ambiguous question run は取り込みを止めない"
      - "memory health の warning を hard corruption と review-only question signal に分け、件数・atom id・reason を別々に表示する"
      - "U+FFFD atom、正当な `???` UI atom、通常 atom、疑問符比率だけが高い atom の固定 fixture で分類と consumer action を検証する"
      - "既存 2 suspect の再監査で hard=1 / ambiguous=1 となり、mirror 内容を改変しないことを確認する"
```

## Phase 4c: 導入 (条件起動)

```yaml
implemented:
  - issue_id: ISS-4A-20260826-01
    files_changed:
      - path: tools/atom_quality.py
        change: modified
      - path: tools/slack_memory_ingest.py
        change: modified
      - path: tools/memory_health.py
        change: modified
      - path: tools/test_atom_quality.py
        change: created
      - path: AGENTS.md
        change: modified
      - path: log/cycle_staging_log_cdx.md
        change: modified
    summary: "atom text 品質を reason-coded な hard_corruption / ambiguous_question_run に分離した。Slack ingest は U+FFFD のみ quarantine し、health は hard warning と review-only signal を別表示する。"
    partial: false
migrations: []
verification:
  - "固定 fixture 4種（U+FFFD / 正当な `???` UI / 通常文 / 疑問符比率のみ高い文）で分類、互換 suspect、Slack ingest action、health 分離を検証。tools 全体は 68 tests OK。"
  - "実データ 2 suspect の再監査: hard_corruption=1（sr-1776127289-4d9239b255 / replacement_character）、ambiguous_question_run=1（gr-1777083728-44d444ab7a / question_run）。"
  - "memory_health.py --json: atom mirror status=clean、input consistency=stable、recall smoke 3/3 hit、errors=0。"
  - "既存 atom は移行・修復せず、atoms.jsonl と対象 per-file 2件の内容を変更していない。"
```

## Phase 5: 日記投稿

```yaml
posted:
  channel: "#log"
  permalink: "https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1787753474569059"
  ts: "1787753474.569059"
  char_count: 2187
  verification: ok
  thread_reply: false
  source_file: "tmp/phase5_log_diary_20260826_2231_cdx.md"
```

- Phase 1–4 の staging だけを材料に、WMT の部分採用、Phase 3b の defer、`hard_corruption` / `ambiguous_question_run` 分離、未完事項と次サイクルへの接続を日記化した。
- `post_slack_message_file.py --delete-on-fail` で UTF-8 ファイル投稿。Slack API 再取得検証は `ok`、U+FFFD・mojibake 検出なし。#log へのフラット投稿1件のみ。
