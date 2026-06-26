# log_cdx Cycle Staging — 2026-06-26 09:43

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
2026-06-26 09:44 JST log_cdx:

- Slack directives / broadcasts: pending なし (`python tools\slack_inbox_lifecycle.py pending` で確認)
- 既存確認: `memory/raw/web_research/` と最近の `memory/atoms.jsonl` では、Mind-Studio / RevengeBench / lmgame-Bench / TriEx / SODE などが直近で候補化・投稿済み。
- 追加 candidate:
  - `memory/shared_reads_candidates/20260626_gamedevbench_agentic_game_development.md` — GameDevBench。ゲーム開発タスクを agent 評価に使い、multimodal feedback と visual asset 操作の失敗を拾う benchmark。
  - `memory/shared_reads_candidates/20260626_opengame_agentic_coding_for_games.md` — OpenGame。browser game 生成を Build Health / Visual Usability / Intent Alignment に分けて評価する agentic coding framework。
  - `memory/shared_reads_candidates/20260626_exploring_gameplay_with_ai_agents.md` — Exploring Gameplay With AI Agents。実クライアントではなく bare-bone mechanics simulator で大量 playtest し、designer question に答える古典的事例。

## Phase 2: 分析
2026-06-26 09:53 JST log_cdx:

```yaml
total_candidates: 3
pass: []
fail:
  - path: memory/shared_reads_candidates/20260626_gamedevbench_agentic_game_development.md
    reason: "同一 title / URL の canonical candidate が posted 済み。内容は有用だが Phase 3 投稿では重複。"
  - path: memory/shared_reads_candidates/20260626_opengame_agentic_coding_for_games.md
    reason: "同一 title / URL の canonical candidate が posted 済み。Build Health / Visual Usability / Intent Alignment の論点は既投稿。"
  - path: memory/shared_reads_candidates/20260626_exploring_gameplay_with_ai_agents.md
    reason: "2026-06-07 に同一 title / URL の candidate が posted 済み。単独品質は高いが再投稿不可。"
postpone: []
stale_reviewed: []
notes:
  - "stale_review_batch は staging に存在しなかったため、新規 candidate のみ評価した。"
  - "GameDevBench と OpenGame は title canonical index の terminal posted 判定を確認。Exploring Gameplay は既存 posted candidate を rg で確認。"
```

## Phase 3: Shared-reads 投稿
2026-06-26 10:00 JST log_cdx:

```yaml
posted: []
skipped:
  - candidate: none
    reason: "Phase 2 で gate_decision: pass の candidate が 0 件だったため、#shared-reads 投稿対象なし。3 件はいずれも既投稿 canonical candidate との重複として fail 判定済み。"
    action: none
notes:
  - "現行投稿ルールに従い、pass していない candidate は投稿本文化しなかった。"
  - "Slack 投稿なし。candidate frontmatter 更新なし。"
```

## Phase 3b: Shared-reads 自己フィードバック
2026-06-26 09:57 JST log_cdx:

```yaml
self_feedback:
  selected:
    id: sr-1778542776-efd5802eca
    source_ts: "1778542776.395559"
    title: "Google Cloud Agent Skills: load strategy axis for progressive disclosure"
    reason: "Codex の phase 作業は AGENTS / MEMORY / Slack directives / atoms / task-specific rules を横断して開始しがちで、起動時 full-load、必要時 recall、恒久 rule 編集が混ざりやすい。Google Agent Skills の「必要時ロード」を、次回行動の小さな load-strategy probe に落とす価値があるため。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 3
    non_redundancy: 2
    risk_control: 2
    reversibility: 3
    total: 16
  decision: adopt_probe
  change:
    summary: "phase/research/memory/game-start 作業で、context load を startup full-load / task-triggered rule load / atom recall / skill invocation / raw-source lookup / defer-no-load に分類し、追加ロードの trigger を明示し、欠けた文脈は恒久ルール化前に probe/state/no-op で受ける一時 probe を追加。"
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```

## Phase 4a: 整理 + 問題抽出
2026-06-26 10:18 JST log_cdx:

```yaml
cleaned: []
issues:
  - id: ISS-4A-001
    description: "memory/shared_reads_candidates の lifecycle で、stale_after 到来済みの postponed / needs_review が 69 件残っている。Phase 2 が毎回 staging に stale_review_batch がないと新規 candidate だけを見るため、stale_after が実質的な queue 制御になっていない。"
    severity: medium
    evidence: "candidate status counts: posted=349, postponed=294, failed=109, ready_to_post=8, needs_review=13, missing=1。stale_after <= 2026-06-26 の postponed/needs_review は 69 件。"
    source_file_status: "UTF-8 明示読みで candidate frontmatter を取得できた。frontmatter 日付 parse error は 0 件。"
    display_or_tooling_status: "none"
    why_blocks_game_memory: "古い候補が探索 queue に残り続けると、ゲーム制作に直結する playtesting / game feel / level design 系候補が、既に鮮度を失った候補と同じ層で埋もれる。次の制作時に『読むべき候補』と『棚卸し対象』の区別がつかなくなる。"
  - id: ISS-4A-002
    description: "shared-reads title canonical index 未登録の duplicate title group が残っている。posted / failed の terminal group は再評価 queue から外せるが、ready_to_post / postponed が混在する group は Phase 2 の重複判定を濁す。"
    severity: medium
    evidence: "python tools\\audit_shared_reads_title_duplicates.py --unindexed-only --limit 20: CoffeeBench postponed x3、AsgardBench postponed x2、High-quality generation of dynamic game content via small language models ready_to_post x1 + postponed x1、Exploring Gameplay posted x1 + failed x1、LMGame-Bench posted x2 など。"
    source_file_status: "UTF-8 明示読みで対象 candidate の status / stale_after / title / url を取得できた。"
    display_or_tooling_status: "none"
    why_blocks_game_memory: "同一論文・同一記事の candidate が canonical 判定なしで複数残ると、ゲーム制作サイクルで既読の外部知見を再び候補化し、Phase 2 の時間を重複確認に使ってしまう。"
  - id: ISS-4A-003
    description: "memory/raw/ に 30 日以上 mtime が動いていない raw ファイルが 99 件ある。archive 判断の対象だが、Phase 4a では削除・移動は実施していない。"
    severity: low
    evidence: "old sample: memory/raw/sync_state.txt 46 days, memory/raw/slack_archive/shared-reads.jsonl 46 days, memory/raw/web_research/phase3_pdfs/*.txt 44 days, memory/raw/web_research/20260515_phase3_* 42 days。"
    source_file_status: "ファイル存在と mtime は取得可能。"
    display_or_tooling_status: "none"
    why_blocks_game_memory: "raw が増え続けると検索結果に古い一次データが混ざり、現在のゲーム制作判断に必要な candidate / atom へ到達しにくくなる。ただし現時点では index と atom が主導線なので低優先。"
  - id: ISS-4A-004
    description: "MEMORY.md の UTF-8 source は正常だが、PowerShell 経由の Python here-string で日本語 probe 名が '?' 化する表示経路があった。source 破損ではない。"
    severity: low
    evidence: "Get-Content -Encoding UTF8 では MEMORY.md の日本語本文を正常表示。unicode escape probe では 記憶=True, ゲーム設計=True, 敵パターン=True, 評価軸=False。通常の Python stdout JSON では key が '?' 化。MEMORY.md の index 行 broken link は 0 件。"
    source_file_status: "MEMORY.md は UTF-8 明示読みで代表語のうち 記憶 / ゲーム設計 / 敵パターン を取得可能。評価軸 は現行本文に文字列として存在しない。source mojibake なし。"
    display_or_tooling_status: "PowerShell here-string / stdout 経路で日本語 literal が '?' 化する場合あり。source file 破損とは切り分け済み。"
    why_blocks_game_memory: "表示経路の mojibake を source 破損と誤判定すると、MEMORY.md の不要な再生成や手修復で記憶導線をかえって壊す可能性がある。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-4A-001
    - ISS-4A-002
stale_review_batch:
  - path: memory/shared_reads_candidates/20260526_designing_game_feel_survey.md
    status: postponed
    stale_after: "2026-06-25"
    priority_reason: "game feel は次の playable diff の体験評価に直結するため、古い候補の中でも Phase 2 で価値判定する優先度が高い。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260527_capcom_ai_playtesting_debug_agents.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "AI playtesting / debug agent は headless 評価と制作検証の導線に直接つながる。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260527_programming_smart_playtesting.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "smart playtesting は game evaluation harness の改善候補として再評価価値がある。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260527_runtime_pcg_autonomous_agents.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "runtime PCG + autonomous agents は playable diff 生成後の自動検証に接続しやすい。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260527_strayspark_ai_level_design_gameslop.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "AI-assisted level design の production quality / gameslop 境界は、ゲーム制作で避けたい品質劣化の教師データになりうる。"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)
2026-06-26 10:37 JST log_cdx:

```yaml
designed_issues:
  - issue_id: ISS-4A-001
    problem_restatement: "stale_after 到来済みの postponed / needs_review が多く残り、Phase 4a が毎回少数 batch を作っても Phase 2 の通常評価へ確実に接続されないため、古い candidate が『再評価待ち』なのか『棚卸し済み保留』なのか判別しづらい。"
    alternatives:
      - name: "案A: staging handoff を強制契約化"
        sketch: "永続 queue index は追加せず、Phase 4a が stale_review_batch を必ず最大 5 件生成し、Phase 2 が新規 candidate より先に処理する契約を明文化する。処理後は candidate frontmatter の last_reviewed_at / last_decision / next_action / stale_after と staging の stale_reviewed で閉じる。"
        pros:
          - "既存の per-file frontmatter 正本方針と衝突しない。"
          - "失敗しても staging と candidate 数件の修正で戻せる。"
          - "game production 直結候補だけを小さく流せるため、Phase 2 の負荷が読める。"
        cons:
          - "69 件全体の backlog 解消には複数サイクルが必要。"
          - "Phase 2 が契約を読み飛ばすと再び滞留する。"
          - "全体 queue の優先順位を俯瞰する用途には弱い。"
        migration_cost: low
      - name: "案B: shared_reads_review_queue.jsonl を正本化"
        sketch: "stale_after 到来済み candidate を永続 queue index に集約し、priority / due_at / handled_at を持たせる。Phase 2 は index から直接取り出して処理する。"
        pros:
          - "backlog 件数と状態を一覧しやすい。"
          - "Phase 間で staging が欠落しても queue を復元しやすい。"
          - "優先度ソートや aging 制御を後から足しやすい。"
        cons:
          - "candidate frontmatter と queue index の二重正本になりやすい。"
          - "既存 README の『永続 queue index は作らない』方針から距離がある。"
          - "同期漏れが起きると Phase 2 の判断がかえって濁る。"
        migration_cost: medium
      - name: "案C: stale_after 超過分を一括 failed 降格"
        sketch: "stale_after <= 今日の postponed / needs_review を機械的に failed へ寄せ、必要な候補だけ後で手動再オープンする。"
        pros:
          - "backlog 数はすぐ減る。"
          - "Phase 2 の再評価負荷は最小。"
          - "queue の見た目は明確になる。"
        cons:
          - "game feel / playtesting など高価値候補を粗く捨てるリスクが高い。"
          - "fail 理由が薄くなり、後で戻す判断材料が残りにくい。"
          - "shared-reads の品質ゲートが『読んで落とす』から『期限で落とす』に寄りすぎる。"
        migration_cost: low
    recommended: "案A: staging handoff を強制契約化"
    recommended_reason: "現状の正本は candidate frontmatter と staging handoff であり、永続 queue index を増やすと同期面の失敗コストが増える。案Aは移行距離が最短で、失敗しても数件単位の再処理で済み、古い候補を捨てずに game production 直結候補から順に流せる。"
    decision: introduce
    decision_reason: "Phase 4a で既に stale_review_batch が生成されており、Phase 2 側にも先行処理の契約がある。新規構造よりも、既存契約を Phase 4c で検査可能な運用仕様として締めるのが妥当。"
    outline_for_4c:
      - "Phase 4a/Phase 2 の docs に、stale_review_batch が存在する時は Phase 2 が先に最大 5 件処理することを再明記する。"
      - "Phase 2 の出力チェックに、stale_reviewed と該当 candidate frontmatter 更新の両方を確認する項目を置く。"
      - "Phase 4a の issue 記録では、残 backlog 件数と今回 handoff 件数を分けて書く形式にそろえる。"
  - issue_id: ISS-4A-002
    problem_restatement: "duplicate title group のうち canonical index 未登録のものが残り、posted / failed で閉じられる group と ready_to_post / postponed が混ざる group が Phase 2 の重複判定に同じように現れるため、既読知見の再候補化を防ぎきれていない。"
    alternatives:
      - name: "案A: terminal group だけ title canonical sidecar に追記"
        sketch: "posted または failed が明確な duplicate title group だけを memory/shared_reads_title_canonical_index.jsonl に追加する。ready_to_post / postponed 混在 group は自動で閉じず、Phase 2/4a の個別評価に残す。"
        pros:
          - "既存の title canonical sidecar の役割に収まる。"
          - "誤結合時も title group 単位の sidecar 修正で戻せる。"
          - "terminal 判定だけなので Phase 2 の再評価除外に使いやすい。"
        cons:
          - "混在 group の整理は別途残る。"
          - "title だけの正規化では同名別記事の誤結合リスクがあるため source_url 確認が必要。"
          - "未登録 group の監査は継続的に必要。"
        migration_cost: low
      - name: "案B: duplicate group ごとに canonical / siblings を candidate frontmatter へ書く"
        sketch: "各 candidate に canonical_path / duplicate_of / duplicate_reason を持たせ、sidecar ではなく per-file frontmatter だけで重複関係を表現する。"
        pros:
          - "candidate 単体を開いた時に関係が分かる。"
          - "sidecar なしでも重複状態を追跡できる。"
          - "将来的な atom 連携に流用しやすい。"
        cons:
          - "同一 group の複数ファイルを同時更新する必要があり同期漏れしやすい。"
          - "既存 candidate の frontmatter churn が大きい。"
          - "posted / failed だけを queue から外す軽量目的には重い。"
        migration_cost: medium
      - name: "案C: Phase 2 で毎回 audit を実行して未登録 group を都度判断"
        sketch: "永続 sidecar を増やさず、Phase 2 開始時に duplicate title audit を読み、候補評価時にその場で posted / failed / mixed を判断する。"
        pros:
          - "追加データ構造が不要。"
          - "最新の candidate 状態を毎回反映できる。"
          - "誤った canonical 行を残すリスクがない。"
        cons:
          - "Phase 2 の認知負荷と実行時間が増える。"
          - "同じ duplicate group を毎回確認し直すことになる。"
          - "判断が staging に散り、次サイクルへ安定して渡りにくい。"
        migration_cost: low
    recommended: "案A: terminal group だけ title canonical sidecar に追記"
    recommended_reason: "title canonical index は既に Phase 2 の再評価除外 sidecar として導入済みで、ISS-4A-002 の問題はその未登録 terminal group が残っていることに近い。混在 group まで自動で閉じると誤判定の失敗コストが高いので、posted / failed が明確な group に限定するのが安全。"
    decision: introduce
    decision_reason: "Phase 4a の evidence には terminal group と mixed group が混ざっている。Phase 4c では terminal group の sidecar 補完だけを導入し、mixed group は Phase 2 の個別評価に残す設計なら、重複判定の濁りを減らしつつ品質ゲートを保てる。"
    outline_for_4c:
      - "未登録 duplicate title group を terminal group と mixed group に分けて扱う手順を Phase 4a/Phase 2 docs に追記する。"
      - "terminal group は title canonical sidecar に source_url / duplicate_paths / status_counts / decision_note 付きで追加する。"
      - "mixed group は自動 close せず、stale_review_batch または Phase 2 の通常評価に送る候補として残す。"
```

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

2026-06-26 10:10 JST log_cdx:

```yaml
implemented:
  - issue_id: ISS-4A-001
    files_changed:
      - path: phases/phase2_analyze.md
        change: modified
      - path: phases/phase4a_cleanup.md
        change: modified
    summary: "stale_review_batch は Phase 2 が新規 candidate より先に最大 5 件処理し、staging stale_reviewed と candidate frontmatter 更新の両方で閉じる契約として明記した。Phase 4a は残 backlog 件数と今回 handoff 件数を分けて記録する。"
    partial: false
  - issue_id: ISS-4A-002
    files_changed:
      - path: phases/phase2_analyze.md
        change: modified
      - path: phases/phase4a_cleanup.md
        change: modified
      - path: tools/build_shared_reads_title_canonical_index.py
        change: modified
      - path: memory/shared_reads_title_canonical_index.jsonl
        change: modified
    summary: "duplicate title group を terminal group と mixed group に分け、terminal group 全体が posted/failed の場合だけ title canonical sidecar に登録する基準へ変更した。mixed group は自動 close せず Phase 2/4a に残す。"
    partial: false
migrations:
  - what: "memory/shared_reads_title_canonical_index.jsonl を terminal-only group 基準で再生成"
    affected: "title duplicate group 21 件を terminal canonical sidecar として保持。mixed group は index から外れ、stale_review_batch または通常評価へ残る。"
verification:
  - "python tools/build_shared_reads_title_canonical_index.py --check -> shared-reads title canonical index ok: rows=21"
  - "python tools/audit_shared_reads_title_duplicates.py --unindexed-only --limit -1 を集計し、unindexed_terminal_groups=0 を確認"
```

## Phase 5: 日記投稿
(Phase 5 が書き込む)
