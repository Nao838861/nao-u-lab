# log_cdx Cycle Staging - 2026-05-16 09:28

<!-- 各フェーズは下記セクションに追記。前フェーズの内容は消さない。 -->

## Phase 1: 情報収集

### 2026-05-16T09:29+09:00 収集メモ

- Slack inbox: `tools\slack_inbox_lifecycle.py pending` では directives / broadcasts とも pending なし。
- 最近の atom / candidates: 2026-05-16 早朝に LLM agents cooperation、runtime PCG autonomous agents、bounded autonomy LLM characters などが追加済み。
- 新規 candidate:
  - `memory/shared_reads_candidates/20260516_pcg_benchmark_open_source_testbed.md` - PCG 生成物を quality / diversity / controllability で測るオープン benchmark。
  - `memory/shared_reads_candidates/20260516_pcg_serious_games_drl_evaluation.md` - serious game の PCG 差分を DRL game testing agents で評価する枠組み。
  - `memory/shared_reads_candidates/20260516_promptvfx_text_driven_3d_animation.md` - テキストから 3D Gaussian animation / VFX の 4D field を作る手法。

## Phase 2: 分析

```yaml
total_candidates: 3
pass:
  - memory/shared_reads_candidates/20260516_pcg_benchmark_open_source_testbed.md
fail:
  - path: memory/shared_reads_candidates/20260516_promptvfx_text_driven_3d_animation.md
    reason: "VFX生成技術としては有用だが、ゲーム制作サイクルへの具体適用と評価中身が薄く、4000字の残すべき概要にしにくい。"
postpone:
  - path: memory/shared_reads_candidates/20260516_pcg_serious_games_drl_evaluation.md
    reason: "DRL agent 評価の着想は有望だが、framework 構成と評価設計の情報量が不足し、serious game 依存も追加確認が必要。"
```

## Phase 3: Shared-reads 投稿

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260516_pcg_benchmark_open_source_testbed.md
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778891744290009"
    char_count: 4137
skipped: []
```

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1777737101-0f96f202c2
    source_ts: "1777737101.667389"
    title: "「人間は判断だけ」と「判断は厚みで成り立つ」の反証ペア — M-40 自己判定ハーネスを二層に分ける根拠"
    reason: "M-40 系の headless / 自己判定 probe は増えているが、数値で判定できる層と、基準の厚みが必要な層を事前に分ける確認がまだ薄い。次のゲーム評価で headless 数値を面白さ・納得感へ直結させないために読む。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 3
    non_redundancy: 2
    risk_control: 3
    reversibility: 3
    total: 17
  decision: adopt_probe
  change:
    summary: "state に reviewed/source_ts を追加し、次回 game prototype 自己判定で機械判定層と厚み判定層を分ける短期 probe を追加した。恒久 directive は増やしていない。"
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
  - "memory/MEMORY.md: Markdown link は 0 件、path 参照の broken link は実質 0 件（command 文字列 2 件は除外）"
  - "memory/atoms.jsonl: 1182 rows を検査。JSON error / duplicate id / conflicting duplicate / same content hash group は 0 件"
  - "memory/atoms/: per-atom .md は unknown/ 3 件を含めて 1182 件、index.jsonl も 1182 rows で同期"
  - "memory/raw/: 2026-04-16 以前の 30 日以上未更新ファイルは 0 件"
  - "memory/shared_reads_candidates/: 2026-04-16 以前の 30 日以上未更新 candidate は 0 件"
  - "inbox: slack_directives.jsonl / slack_broadcasts.jsonl とも pending 0 件。close 対象なし"
issues:
  - id: ISS-20260516-01
    description: "shared_reads_candidates 配下の candidate 66 件に status/frontmatter がなく、Phase 4a の『30 日以上動きがない candidate を postpone から fail に降格、または保持』を機械判定できない"
    severity: medium
    evidence: "memory/shared_reads_candidates/*.md status scan: status_counts={missing: 66}; README.md は保存場所と品質ゲートのみで lifecycle metadata を要求していない"
    why_blocks_game_memory: "候補段階の資料が増えた時、postpone / fail / keep の区別がファイル本文や staging 記録に散り、次のゲーム制作時に検索結果へ未成熟な候補が混ざりやすくなる"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-20260516-01
```

## Phase 4b: 仕組み検討 (条件起動)

```yaml
designed_at: "2026-05-16T09:58+09:00"
selected_issues:
  - ISS-20260516-01
designs:
  - issue_id: ISS-20260516-01
    problem_restatement: "shared_reads_candidates は候補プールとして公式化されたが、candidate ごとの lifecycle 状態が必須フィールドになっていない。結果として、投稿済み/pass/postpone/fail/保留の境界が本文・staging・Slack permalink に散らばり、次サイクルの探索時に未処理候補と処理済み候補を機械的に分けられない。"
    alternatives:
      - name: "案A: candidate frontmatter に lifecycle 最小セットを追加"
        sketch: "各 candidate の YAML frontmatter に `candidate_status`, `gate_decision`, `evaluated_at`, `evaluated_by`, `posted`, `supersedes`, `review_notes` を必要に応じて持たせる。既存の posted/gate_decision 形式を拡張し、個別ファイルを正本にする。"
        pros:
          - "既存 candidate の配置と最近の frontmatter パターンに近く、Phase 1/2/3 の自然な追記先になる"
          - "ファイル単体を開いた時に lifecycle と本文が同時に読める"
          - "失敗しても個別 candidate の metadata 修正だけで戻せる"
        cons:
          - "66 件の既存 candidate へ初期 metadata を補完する手間がある"
          - "集計には frontmatter scan が必要で、大量化すると遅くなる可能性がある"
          - "schema の表記揺れを README で固定しないと再び崩れる"
        migration_cost: medium
      - name: "案B: shared_reads_candidates/index.jsonl を正本にする"
        sketch: "candidate 本文はそのまま残し、別ファイル `index.jsonl` に path, status, gate_decision, posted_permalink, last_reviewed_at を集約する。Phase 4a は index だけを見て分類する。"
        pros:
          - "集計と stale 判定が軽い"
          - "既存 candidate 本文をほぼ触らずに導入できる"
          - "後で dashboard や report を作りやすい"
        cons:
          - "本文と index の二重管理になり、不整合検出が別途必要"
          - "candidate 単体を見た時に lifecycle が分からない"
          - "atoms per-file 移行と同型の仕組みが増え、運用面の複雑さが上がる"
        migration_cost: medium
      - name: "案C: staging の判断ログだけを保持し現状維持"
        sketch: "candidate ファイルには lifecycle metadata を要求せず、各 cycle の Phase 2/3 staging と Slack permalink を判断履歴として扱う。Phase 4a は古い候補を内容ベースで必要時に読む。"
        pros:
          - "移行作業が不要"
          - "候補メモを探索段階の軽い置き場として保てる"
          - "schema 追加による書き込み負担がない"
        cons:
          - "未処理/処理済みの分離が毎回人間依存になる"
          - "postpone と fail の再探索優先度を機械的に扱えない"
          - "candidate が増えるほど Phase 4a の掃除が曖昧になる"
        migration_cost: low
    recommended: "案A: candidate frontmatter に lifecycle 最小セットを追加"
    recommended_reason: "問題の本体は候補本文と lifecycle 判断の分離なので、正本を candidate ファイル自身に寄せるのが最短で戻しやすい。案Bは集計には強いが、今の規模では二重管理の失敗コストが案Aの scan コストより大きい。案Cは短期の手間は少ないが、Phase 4a が検出した詰まりを残すだけになる。"
    decision: introduce
    decision_reason: "既に最近の candidate には `gate_decision` / `posted` / `evaluated_at` が実質導入されており、現状からの距離が小さい。新規 tool より先に schema と migration 方針を固めれば、Phase 4c は既存ファイルの metadata 補完と README 追記に限定できる。"
    outline_for_4c:
      - "`memory/shared_reads_candidates/README.md` に candidate lifecycle frontmatter の最小 schema と許可値を追記する"
      - "既存 candidate 66 件へ、判定不能なものは `candidate_status: needs_review` として最小 metadata を補完する"
      - "投稿済みまたは Phase 2 判定済みの candidate は、既存 frontmatter/staging/Slack permalink から `gate_decision` と `posted` を埋められる範囲だけ埋める"
      - "Phase 4a の次回確認項目として、missing lifecycle metadata が 0 件になること、ただし内容判断を捏造しないことを残す"
```

## Phase 4c: 導入 (条件起動)

```yaml
implemented:
  - issue_id: ISS-20260516-01
    files_changed:
      - path: memory/shared_reads_candidates/README.md
        change: modified
      - path: memory/shared_reads_candidates/*.md
        change: modified
    summary: "candidate lifecycle frontmatter の最小 schema を README に追加し、既存 candidate 65 件へ `candidate_status` を補完した。既存 `gate_decision` と `posted` block だけから `posted` / `postponed` / `failed` を機械的に付与し、内容判断は追加していない。"
    partial: false
migrations:
  - what: "既存 shared_reads_candidates の lifecycle metadata 補完"
    affected: "65 candidate files。内訳は posted 37 / postponed 23 / failed 5 / missing 0。"
verification:
  - "frontmatter scan: candidate_files=65, status_counts={failed: 5, posted: 37, postponed: 23}, missing_candidate_status=0"
  - "`python tools\\memory_recall.py \"shared reads candidate lifecycle\"` が正常終了し、既存 recall 経路が壊れていないことを確認"
  - "Phase 4a 次回確認項目: `memory/shared_reads_candidates/*.md` の `candidate_status` 欠落が 0 件であること。`needs_review` が出た場合のみ Phase 2/4a で再判定し、内容判断を捏造しない。"
```

## Phase 5: 日記投稿

```yaml
posted:
  channel: "#log"
  channel_id: C0ALRK28Y1H
  ts: "1778892988.532829"
  permalink: "https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1778892988532829"
  char_count: 2277
  verification: ok
  draft_file: ".tmp/phase5_log_diary_20260516_0928.md"
```
