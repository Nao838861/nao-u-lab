# log_cdx Cycle Staging — 2026-07-14 09:43

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260714_playtesting_beyond_personas.md` — 固定 persona に加え、習熟に伴う goal 遷移と既試行 path を避ける APF で自動 playtest の行動・経路 coverage を広げる研究。
- `memory/shared_reads_candidates/20260714_lets_revolution_prototyping_postmortem.md` — Minesweeper の path 化から pawn、ability、turn-based combat へ反復し、blind guess と単調な最適行動を解消した二か月の prototype 記録。
- preflight 除外: AutoBG は `review`（同題・別 URL、既投稿あり）、RevengeBench は `skip`（既投稿 URL 一致）のため candidate を作成せず。
- pending inbox: `slack_directives.jsonl` 0 件、`slack_broadcasts.jsonl` 0 件。

## Phase 2: 分析

```yaml
total_candidates: 2
pass:
  - memory/shared_reads_candidates/20260714_playtesting_beyond_personas.md
  - memory/shared_reads_candidates/20260714_lets_revolution_prototyping_postmortem.md
fail: []
postpone: []
stale_reviewed: []
```

- terminal-title preflight: 2 件とも `continue`。posted sibling / terminal canonical による除外なし。
- `Playtesting: What is Beyond Personas`: developing persona と APF の役割分離、GVGAI / VizDoom での比較、route coverage への適用が揃うため pass。
- `Let's! Revolution!` postmortem: prototype ごとの問題発見と mechanic 変更の因果、PCG・scope 判断まで具体的で、制作サイクルへ直接適用できるため pass。

## Phase 3: Shared-reads 投稿

```yaml
posted: []
skipped:
  - candidate: memory/shared_reads_candidates/20260714_playtesting_beyond_personas.md
    reason: "同一 URL・同一論文が 2026-06-12 に投稿済み（https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781224652357689）。今回候補に再投稿に値する新規分析差分がない。"
    action: postpone
  - candidate: memory/shared_reads_candidates/20260714_lets_revolution_prototyping_postmortem.md
    reason: "同一 URL・同一記事が 2026-05-26 に投稿済み（https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779769858830679）。今回候補に再投稿に値する新規分析差分がない。"
    action: postpone
```

- 最終判定: 投稿 0 件、duplicate により postponed 2 件。
- Phase 2 の terminal-title preflight は両既投稿を検出できていなかった。Phase 3 で candidate 履歴、`memory/raw/slack_api/shared-reads.jsonl`、`memory/atoms.jsonl` の URL 一致を照合して停止した。

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1783373155-ebd744036a
    source_ts: "1783373155.164129"
    title: "Safety in Self-Evolving LLM Agent Systems: 更新後に永続・増幅・伝播する危険"
    reason: "memory・skill・tool registry・workflow の更新が、危険を更新後へ永続・増幅・伝播させるという観点が、現在の Codex 定時サイクルと自己フィードバックに直結するため。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 3
    non_redundancy: 0
    risk_control: 1
    reversibility: 3
    total: 13
  decision: reject
  change:
    summary: "none。reviewed_source_ts と reject 理由だけを state に記録し、新規 probe は追加しなかった。"
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```

- 採用条件未達: relevance/actionability は満たすが、既存の authority-boundary、trajectory-safety、writeback-drift probes と重複し、`risk_control < 2` かつ合計 14 未満。
- 次回該当作業では既存 probes を再利用し、恒久ルール・評価表・directive は増やさない。

## Phase 4a: 整理 + 問題抽出

```yaml
cleaned:
  - "memory/MEMORY.md を UTF-8 明示読みし、代表語 probe（記憶 / ゲーム設計 / 敵パターン / 評価軸）と validate_memory_index.py を確認。index entry の不整合・broken link は 0 件。"
  - "memory/atoms.jsonl / per-file atom / index.jsonl を audit_atom_mirror_drift.py で照合。各 2674 件、id 欠落・parse error・content conflict は 0 件。normalized content duplicate は 40 group / 80 rows だが recall fold 済み。"
  - "memory/raw/ の 30 日超未更新 file は 93 件。raw provenance として保持されており、この phase では archive 移動なし。"
  - "shared-reads lifecycle を dry-run 監査。posted 406 / ready_to_post 10 / postponed 381 / failed 120 / needs_review 22、stale_after 超過 backlog 203 件。candidate 本体は変更せず、3 queue のみ再生成。"
  - "slack_directives.jsonl / slack_broadcasts.jsonl の pending は各 0 件。handled 更新なし。"
issues:
  - id: ISS-20260714-01
    description: "Phase 2 の terminal-title preflight が、同一 URL の posted sibling を持つ当日 candidate 2 件を continue と判定し、Phase 3 まで重複候補を通した。"
    severity: medium
    evidence: "log/cycle_staging_log_cdx.md Phase 2 / Phase 3、memory/shared_reads_candidates/20260612_playtesting_beyond_personas.md + 20260714_playtesting_beyond_personas.md、memory/shared_reads_candidates/20260526_lets_revolution_minesweeper_prototyping.md + 20260714_lets_revolution_prototyping_postmortem.md、memory/shared_reads_mixed_duplicate_queue.jsonl"
    source_file_status: "UTF-8 source は正常。posted / postponed の sibling と同一 source_url が確認できる。"
    display_or_tooling_status: none
    why_blocks_game_memory: "既投稿の再収集・再分析が Phase 2 の処理枠を消費し、新しいゲーム制作知見の選別と想起入口の更新を遅らせる。"
recommendation:
  needs_design: true
  priority_issues: [ISS-20260714-01]
stale_backlog:
  overdue_total: 203
  stale_triage_queue_rows: 50
  group_action_queue_rows: 35
  handed_off_this_cycle: 1
stale_review_batch:
  - path: memory/shared_reads_candidates/20260527_procedural_personas_mcts_playtesting.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "group-action queue 先頭。game transfer value=high。status_counts は posted 2 / postponed 5 で、terminal_paths 2 件・open_paths 5 件を持つ mixed duplicate。今回の representative のみを Phase 2 へ渡す。"
    recommended_review_action: reevaluate_in_phase2
    duplicate_group_key: automated playtesting with procedural personas through mcts with evolved heuristics
    terminal_paths:
      - memory/shared_reads_candidates/20260515_automated_playtesting_procedural_personas.md
      - memory/shared_reads_candidates/20260625_procedural_personas_playtesting.md
    open_paths:
      - memory/shared_reads_candidates/20260516_procedural_personas_mcts_playtesting.md
      - memory/shared_reads_candidates/20260517_procedural_personas_playtesting.md
      - memory/shared_reads_candidates/20260527_procedural_personas_mcts_playtesting.md
      - memory/shared_reads_candidates/20260616_procedural_personas_automated_playtesting.md
      - memory/shared_reads_candidates/20260709_procedural_personas_playtesting.md
```

- encoding-safe audit: `memory/MEMORY.md` の source file は UTF-8 で正常。表示・tooling 経路の mojibake は今回観測せず。
- stale handoff は group-action queue の先頭 1 group の representative のみ。candidate 単位 queue との重複投入はしていない。
- Phase 4a では設計・実装・candidate lifecycle 変更・raw archive 移動を行っていない。

## Phase 4b: 仕組み検討 (条件起動)

```yaml
designs:
  - issue_id: ISS-20260714-01
    problem_restatement: "現行 preflight は title_key が canonical index に一致した場合だけ posted_source_urls を照合するため、同一 source_url でも候補側の題名表記が異なると既投稿を Phase 2 の本文評価前に止められない。Phase 3 の横断照合が安全網になっているが、重複候補の読解と評価コストは既に発生している。"
    alternatives:
      - name: "案A: 既存 canonical index の URL 逆引きを preflight に追加"
        sketch: "既存 posted_source_urls から canonical URL 単位の逆引きを組み立てる。preflight は URL 完全一致を第1ゲートとして skip し、一致しない場合だけ従来の title_key 判定へ進む。"
        pros:
          - "既存 index と posted_source_urls を再利用でき、新しい正本や常設 sidecar を増やさない"
          - "題名揺れがあっても同一 source_url の既投稿を本文読解前に停止できる"
          - "Phase 3 の URL 横断照合を最終安全網として残せる"
        cons:
          - "canonical index の再生成が古い場合は検出も古くなる"
          - "改訂版・ミラー・別 landing page は title 判定または Phase 3 照合が引き続き必要"
          - "URL canonicalization の規則を index 生成側と preflight 側で共有する必要がある"
        migration_cost: low
      - name: "案B: source URL 専用 canonical index を新設"
        sketch: "posted candidate、Slack raw、atom から source URL と permalink を集約した URL 専用 sidecar を生成し、Phase 2 preflight はその index を参照する。title canonical index とは独立更新する。"
        pros:
          - "URL 重複検出の責務と鮮度を独立して監査できる"
          - "title group 外の既投稿証拠も一つの形式へ集約できる"
          - "将来 URL alias を明示管理しやすい"
        cons:
          - "再生成対象・更新順・監査項目が増える"
          - "title index と URL index の不一致時に優先順位を定義する必要がある"
          - "今回の不足に対して構造追加が大きく、二重管理を招く"
        migration_cost: medium
      - name: "案C: Phase 2 ごとに候補履歴と Slack raw を直接横断検索"
        sketch: "preflight 時に candidate 全体、shared-reads raw、atom を source_url で検索し、既投稿 permalink があれば skip する。常設 index は追加しない。"
        pros:
          - "index の鮮度に依存しない"
          - "Phase 3 で成功した照合範囲をそのまま前倒しできる"
          - "追加データ構造が不要"
        cons:
          - "候補ごとの I/O と処理時間が大きい"
          - "raw・atom・candidate の証拠優先順位が preflight に流入する"
          - "Phase 2 と Phase 3 の照合ロジックが重複しやすい"
        migration_cost: medium
    recommended: "案A: 既存 canonical index の URL 逆引きを preflight に追加"
    recommended_reason: "失敗原因は index に URL 証拠がないことではなく、title_key 一致を URL 照合の前提にしている検索順にある。案Aは既存 posted_source_urls と canonicalize_url を使うため現状からの距離が最短で、失敗時も Phase 3 の既存安全網が再投稿を止める。案Bの二重管理と案Cの毎回横断検索を導入する前に、まず可逆かつ低移行コストの検索順変更で再発例を閉じるのが妥当。"
    decision: introduce
    decision_reason: "同一 URL・異題名という今回の2例を直接覆い、既存データ構造の責務を広げずに Phase 2 の無駄な本文評価を削減できる。検証対象とロールバック範囲も preflight 周辺に限定でき、Phase 4c に渡せる粒度まで設計が固まっている。"
    outline_for_4c:
      - "shared_reads_title_index の読み込み結果から canonicalized posted_source_urls の URL 逆引きを作り、title_key 判定より先に参照する"
      - "URL 一致は skip / posted_url_match とし、canonical_path・permalink・一致元 title_key を証拠として返す"
      - "URL 不一致時は既存の title_key 判定を維持し、同題異URLを review、新規 title を continue とする"
      - "同一URL・異題名、同題同URL、同題異URL、新規候補の回帰テストを追加する"
      - "Phase 2 の手順文を URL-first / title-second の判定順へ更新し、Phase 3 の横断照合は最終安全網として残す"
```

## Phase 4c: 導入 (条件起動)

```yaml
implemented:
  - issue_id: ISS-20260714-01
    files_changed:
      - path: tools/shared_reads_title_index.py
        change: modified
      - path: tools/test_shared_reads_duplicate_preflight.py
        change: modified
      - path: phases/phase2_analyze.md
        change: modified
      - path: memory/shared_reads_candidates/README.md
        change: modified
      - path: log/cycle_staging_log_cdx.md
        change: modified
    summary: "duplicate preflight を URL-first / title-second に変更し、異題同 URL を本文評価前に posted duplicate として停止する。判定証拠として canonical_path・permalink・matched_title_key を返す。"
    partial: false
migrations: []
verification:
  - "python -m unittest tools.test_shared_reads_duplicate_preflight: 4 tests passed"
  - "同一 URL・異題名、同題同 URL、同題異 URL、新規候補の4ケースを回帰テストで確認"
  - "python tools\\shared_reads_duplicate_preflight.py --title Alternate-title-probe --url https://example.com/phase4c-new-probe: 実 index で continue を返して正常終了"
  - "python tools\\memory_recall.py duplicate-preflight-URL-title --limit 1: per-file/legacy 読み出し経路が正常終了"
  - "git diff --check: 今回の5ファイルに新規 whitespace error なし。既存の未 stage log/codex_log_cycle.log にのみ過去由来の trailing whitespace を検出"
```

## Phase 5: 日記投稿

```yaml
posted:
  channel: "#log"
  ts: "1783990696.341179"
  permalink: "https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1783990696341179"
  char_count: 2136
  verification: ok
  draft: drafts/phase5_log_diary_20260714_0943_cdx.md
```

- UTF-8 draft file から thread_ts なしのフラット投稿を実施。
- Slack API 側の本文検証は `ok`。`?` 化・mojibake は検出されなかった。
