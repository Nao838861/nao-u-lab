# log_cdx Cycle Staging — 2026-07-12 17:13

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
(Phase 1 が書き込む)

- `memory/shared_reads_candidates/20260712_ptcg_bench.md` — PTCG を用い、LLM agent のゲーム内意思決定・経験による自己進化・harness 依存性を分けて扱う benchmark。
- inbox 確認: `slack_directives.jsonl` / `slack_broadcasts.jsonl` とも pending 0 件。

## Phase 2: 分析

```yaml
total_candidates: 1
pass: []
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260712_ptcg_bench.md
    reason: "posted duplicate title sibling: memory/shared_reads_candidates/20260530_ptcg_bench_self_evolving_game_agents.md (https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780075916989739); same source arXiv:2605.29653"
stale_reviewed: []
```

## Phase 3: Shared-reads 投稿

```yaml
eligible_pass_candidates: 0
posted: []
skipped:
  - candidate: memory/shared_reads_candidates/20260712_ptcg_bench.md
    reason: "Phase 2 で pass されていない。同一 source (arXiv:2605.29653) の sibling が既投稿済みのため重複投稿を避ける"
    action: postpone
evidence:
  existing_post: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780075916989739
```

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1782609581-aeda37fd3f
    source_ts: "1782609581.756829"
    title: "PCSP: 共有 policy における NPC persona traceability"
    reason: "未レビューの正式な長文投稿で、memory / harness / evaluation / agent / operation / game-design の6優先タグを持つ。task success が高くても NPC 個性が平均化・engine 制約で消える問題を、現在の headless/NPC 評価へ直接照合できるため。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 3
    non_redundancy: 0
    risk_control: 1
    reversibility: 3
    total: 13
  decision: reject
  reason: "persona recovery、task success との分離、engine 制約による意図消失は有用だが、active な procedural-persona-divergence、runtime-style-adherence、utility/influence-map trace probes の組み合わせで既に確認できる。採用閾値14未満であり、新規 probe は追加しない。"
  change:
    summary: "state に reviewed/source_ts と reject 理由を追加。行動変更・恒久ルール追加は none。"
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
  - "memory/shared_reads_mixed_duplicate_queue.jsonl を再生成（72 group）"
  - "memory/shared_reads_stale_triage_queue.jsonl を 2026-07-12 基準で再生成（上限50件）"
  - "inbox lifecycle を監査し、slack_directives.jsonl / slack_broadcasts.jsonl とも pending 0 件を確認（close 対象なし）"
audits:
  memory_index: "tools/validate_memory_index.py OK。MEMORY.md の entry は per-file atom index と一致し、Markdown link の broken 0 件"
  encoding: "UTF-8 明示読みで本文を取得でき、代表語 記憶 / ゲーム設計 / 敵パターン / 評価軸を確認。source file の破損なし"
  atoms: "2672 rows、atom id 重複 error なし。normalized-content duplicate は raw 40 group / 80 rows だが canonical overlay 40 group と recall fold が適用済み。矛盾を示す error なし"
  candidates: "posted 403 / ready_to_post 10 / postponed 374 / failed 118 / needs_review 22。stale_after 期限超過 backlog 184 件、今回 handoff 5 件"
  raw_archive: "memory/raw 配下に mtime 30日超の file 87 件。Slack archive、論文原文、web research一次資料で参照根拠のため、この phase では移動せず archive 候補として確認のみ"
issues:
  - id: ISS-STALE-DUP-BACKLOG
    description: "stale candidate 184件と mixed duplicate 72 group が併存し、同一題材の open/terminal sibling が Phase 2 の再評価対象を濁している"
    severity: high
    evidence: "memory/shared_reads_stale_triage_queue.jsonl; memory/shared_reads_mixed_duplicate_queue.jsonl; tools/backfill_shared_reads_candidate_status.py dry-run"
    source_file_status: "candidate frontmatter は UTF-8 で読取可能。正本は未変更。status 集計可能だが、期限超過と重複 group の backlog が残る"
    display_or_tooling_status: none
    why_blocks_game_memory: "同じゲーム制作手法が複数 candidate に分散し、既投稿・失敗済み sibling を再評価して時間を消費するため、次の制作で有効な知見への到達が遅れる"
recommendation:
  needs_design: true
  priority_issues: [ISS-STALE-DUP-BACKLOG]
stale_backlog_count: 184
stale_review_batch_count: 5
stale_review_batch:
  - path: memory/shared_reads_candidates/20260527_dependency_driven_rpg_generation.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "age_days=16; mixed duplicate group。依存関係付き quest pipeline は game transfer value high だが評価根拠が不足"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "age_days=16; mixed duplicate group。turn-based battle testbed は有用だが出典時系列の確認が必要"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260527_procedural_personas_mcts_playtesting.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "age_days=16; mixed duplicate group。persona別 headless 評価へ直接転用可能"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260527_runtime_pcg_autonomous_agents.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "age_days=16; mixed duplicate group。runtime PCG validation は有望だが実験結果の抽出が薄い"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260529_agent_island_multiagent_games.md
    status: postponed
    stale_after: "2026-06-28"
    priority_reason: "age_days=14; mixed duplicate group。multi-agent game benchmark とログ分析が game transfer value high"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)

```yaml
designs:
  - issue_id: ISS-STALE-DUP-BACKLOG
    problem_restatement: "stale 184件と mixed duplicate 72 group は別々に観測できるが、レビュー入口が candidate 単位のため、同一題材の terminal sibling を調べ直すか、どの open sibling を正本候補として育てるかを毎回人が再判断している。必要なのは候補数を減らすこと自体ではなく、重複グループごとに一度だけ次アクションを決められる入口である"
    alternatives:
      - name: "案A: group-action queue を既存監査キューから導出"
        sketch: "mixed duplicate group を作業単位にし、group ごとに representative、terminal sibling、open sibling、latest evidence、推奨 action を1行へ束ねる。stale queue と mixed duplicate queue は根拠データとして維持し、Phase 2 は group-action queue の上位だけを読む"
        pros:
          - "既存の status と2監査キューを正本のまま再利用でき、candidate frontmatter の一括移行が不要"
          - "同一題材の再読を group ごとに1回へ寄せ、terminal sibling の再評価を抑えられる"
          - "導出物なので失敗時は利用を止めるだけで戻せる"
        cons:
          - "representative と action の選定規則が粗いと、有望な sibling を隠す可能性がある"
          - "新しい queue と既存2 queue の役割を明示しないと、入口が一つ増えただけになる"
          - "自動生成のたびに action が揺れない安定した tie-break が必要"
        migration_cost: low
      - name: "案B: candidate frontmatter に duplicate lifecycle を持たせる"
        sketch: "各 candidate に duplicate_group_id、canonical_candidate、superseded_by、review_disposition を記録し、open/terminal sibling の関係を正本へ固定する。Phase 2 は canonical_candidate だけを通常対象にする"
        pros:
          - "関係が候補ファイル自身に残り、どの tool からも同じ判断を参照できる"
          - "一度確定した canonical を安定して追跡できる"
          - "長期的には派生 queue への依存を減らせる"
        cons:
          - "既存候補への backfill と競合解消が必要で、誤判定が正本へ広く残る"
          - "canonical の交代や一部だけ異なる記事を表現する lifecycle が複雑になる"
          - "184件の stale 解消より先に schema 運用の負担が増える"
        migration_cost: high
      - name: "案C: stale oldest-first の固定バッチだけを継続"
        sketch: "現状の stale review batch を age と game transfer value で並べ、毎サイクル一定件数を Phase 2 へ渡す。duplicate 情報は参考表示に留め、構造は変えない"
        pros:
          - "新しい概念や移行が不要"
          - "backlog を確実に少しずつ消化できる"
          - "個々の候補を見落としにくい"
        cons:
          - "同一題材の sibling を別サイクルで再読する重複コストが残る"
          - "件数消化が目的化し、terminal sibling の確認に時間を使いやすい"
          - "72 group という今回の主要 evidence を作業単位へ反映できない"
        migration_cost: low
    recommended: "案A: group-action queue を既存監査キューから導出"
    recommended_reason: "現状の監査結果を壊さず、重複再読という直接の無駄だけを作業入口で除けるため。案Bより正本からの距離があり可逆で、誤った representative 選択の影響も派生 queue 内に限定できる。案Cと同程度の移行負担で、stale と duplicate を別々に扱う原因へ踏み込める"
    decision: introduce
    decision_reason: "Phase 4a の2 queue と status 集計だけで必要情報が揃っており、追加調査なしに小さな派生 index として試せる。まず1サイクル1 group の限定運用にすれば、選定規則の誤りを観測してから拡張できる"
    outline_for_4c:
      - "既存の stale triage queue と mixed duplicate queue を入力に、group 単位の派生 queue を生成する"
      - "各行に group_key、representative、open_siblings、terminal_siblings、latest_evidence、recommended_action、priority_reason を持たせる"
      - "representative は open を優先し、同条件では更新日時、game transfer value、path の順で決める deterministic な tie-break にする"
      - "Phase 2 の handoff は上位1 group に限定し、候補単位の stale batch と二重投入しない"
      - "元 candidate と既存2 queue は変更せず、1サイクル後に再読件数と action の妥当性を確認して継続可否を判定する"
```

## Phase 4c: 導入 (条件起動)

```yaml
implemented:
  - issue_id: ISS-STALE-DUP-BACKLOG
    files_changed:
      - path: tools/build_shared_reads_group_action_queue.py
        change: created
      - path: memory/shared_reads_group_action_queue.jsonl
        change: created
      - path: phases/phase4a_cleanup.md
        change: modified
      - path: phases/phase2_analyze.md
        change: modified
    summary: "既存の stale triage queue と mixed duplicate queue から group 単位の派生 queue を deterministic に生成し、Phase 2 handoff を先頭 1 group の representative に限定した"
    partial: false
migrations:
  - what: "既存 2 queue から group-action queue 35 group を初回生成"
    affected: "派生 sidecar の新設のみ。candidate 正本、stale triage queue、mixed duplicate queue は未変更"
verification:
  - "python -m py_compile tools/build_shared_reads_group_action_queue.py: 成功"
  - "build_shared_reads_group_action_queue.py 実行後の --check: rows=35、成功"
  - "build_shared_reads_mixed_duplicate_queue.py --check: rows=72、成功"
  - "build_shared_reads_stale_triage_queue.py --today 2026-07-12 --check: rows=50、成功"
  - "python tools/memory_recall.py duplicate candidate group action: 正常終了"
  - "今回対象差分の whitespace error なし。全体 git diff --check は開始時から存在する log/codex_log_cycle.log の trailing whitespace のみを報告"
```

## Phase 5: 日記投稿

```yaml
posted:
  channel: "#log"
  ts: "1783844670.119769"
  permalink: "https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1783844670119769"
  draft: "drafts/phase5_log_diary_20260712_1713_cdx.md"
  char_count: 2180
  verification: ok
  thread: false
```
