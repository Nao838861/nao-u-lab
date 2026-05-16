# log_cdx Cycle Staging — 2026-05-17 01:28

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
- pending確認: `memory/slack_directives.jsonl` / `memory/slack_broadcasts.jsonl` は `python tools\slack_inbox_lifecycle.py pending` で pending 0 件。
- 既存入力確認: `memory/raw/web_research/results.jsonl` 直近は LLM game design / agent harness / AI coding agent workflow 系が多い。`memory/shared_reads_candidates/` には 2026-05-16 の候補群が既に追加済み。
- 収集候補:
  - `memory/shared_reads_candidates/20260517_access_profiles_game_accessibility.md` — Access Profiles を、障害のあるプレイヤー・開発者・エンジン/ストア/ランチャーをつなぐ accessibility infrastructure として扱う研究。
  - `memory/shared_reads_candidates/20260517_stone_librande_paper_prototype_emotional_goal.md` — GDC 2026 の Stone Librande workshop 記録。中心感情から action verbs と mechanics へ戻し、紙プロトタイプで誘導不足を露出させる手順。
  - `memory/shared_reads_candidates/20260517_gvgai_llm_infinite_games.md` — GVGAI-LLM。ASCII scene と interpretable metrics で LLM game agent の空間推論・計画失敗を測る benchmark。

## Phase 2: 分析
```yaml
total_candidates: 3
pass:
  - memory/shared_reads_candidates/20260517_access_profiles_game_accessibility.md
  - memory/shared_reads_candidates/20260517_gvgai_llm_infinite_games.md
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260517_stone_librande_paper_prototype_emotional_goal.md
    reason: "ゲーム制作への適用は強いが、secondary workshop report 単体では 4000字級概要に必要な評価・限界・一次性が薄い。"
```

## Phase 3: Shared-reads 投稿
```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260517_gvgai_llm_infinite_games.md
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778949410890539"
    char_count: 4180
skipped:
  - candidate: memory/shared_reads_candidates/20260517_access_profiles_game_accessibility.md
    reason: "Phase 3 で原文を確認したところ、Frontiers 公開ページは 2026-05-17 時点で abstract と書誌情報中心で、最終 formatted version は未公開。candidate memo だけでは 3500-4500 字の原文準拠概要を作るには評価・方法の細部が不足するため延期。"
    action: postpone
notes:
  - "Slack 投稿は最初に PowerShell 経由の文字化けが発生したため、同一 ts=1778949410.890539 を chat.update で UTF-8 blocks 本文へ差し替えた。分割投稿・スレッド投稿はしていない。"
```

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1778932863-4a01b7333a
    source_ts: "1778932863.644179"
    title: "2026-05-16 Twitter おすすめから3件結合: creatable / fun / sellable の三独立軸"
    reason: "直近のゲーム制作・評価では、作れること、面白いこと、売れることの混同が headless や実装進捗の誤読につながりやすい。今回の atom は graze_log v05 の現在地にも接続しており、次の game prototype 判定へ小さく返せる。"
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
    summary: "次の game prototype 制作・評価・修復時に、creatable / fun / sellable の軸混同を確認する 3 問 probe を state に追加。恒久ルールは増やしていない。"
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
  - "memory/MEMORY.md: markdown link は 0 件で、broken link も 0 件。"
  - "memory/atoms.jsonl: 1215 rows / bad_json 0 / duplicate id 0 を確認。content duplicate は 14 groups / 208 rows あるが、MEMORY.md の表示 fold 対象として既に扱われている。"
  - "memory/raw/: 30 日以上更新のない file は 0 件。archive 対象なし。"
  - "memory/shared_reads_candidates/: 30 日以上更新のない file は 0 件。postpone -> fail 降格対象なし。"
  - "slack_directives.jsonl / slack_broadcasts.jsonl: pending 0 件。handled 更新対象なし。"
issues:
  - id: ISS-4A-20260517-001
    description: "shared_reads_candidates の候補 90 件が frontmatter/status を持たず、pass/postpone/fail/posted/skipped の lifecycle が staging とファイル更新時刻に分散している。現時点では 30 日超の stale はないが、候補が増えると mechanical cleanup で『保持すべき候補』と『fail に降格すべき候補』を deterministic に判定しにくい。"
    severity: medium
    evidence: "memory/shared_reads_candidates/*.md 90 件; status 行検出 0 件。古い例: memory/shared_reads_candidates/20260513_autoue_unreal_multi_agent_game_generation.md, memory/shared_reads_candidates/20260513_gameuiagent_structured_game_ui_design.md。Phase 2/3 の判定は log/cycle_staging_log_cdx.md 側にのみ残る。"
    why_blocks_game_memory: "ゲーム制作向けの shared-reads 候補が、投稿済み・延期・失敗・保留のどれかを候補ファイル単体から辿れないため、次回のゲーム制作時に有効な未投稿知見を探す導線が弱くなる。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-4A-20260517-001
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

```yaml
designed_at: "2026-05-17T01:52:00+09:00"
scope_note: "Phase 4b は設計のみ。staging 以外のファイル編集・コード実装は行わない。"
items:
  - issue_id: ISS-4A-20260517-001
    problem_restatement: >-
      shared_reads_candidates は候補プールとして公式化されているが、候補ファイル自体に
      pass/postpone/fail/posted/skipped の lifecycle が十分に残っていない。
      そのため、次サイクルで「再評価すべき候補」「投稿済みで触らない候補」
      「品質不足で寝かせる候補」を deterministic に切り分けにくい。
    alternatives:
      - name: "A. 候補ファイル frontmatter 正本化"
        sketch: >-
          各 candidate .md の YAML frontmatter に candidate_status / gate_decision /
          gate_reason / evaluated_at / posted.ts / stale_after などの最小 lifecycle を持たせる。
          staging は作業ログ、candidate file は候補状態の正本として役割を分ける。
        pros:
          - "ファイル単体を読めば現在状態と根拠がわかる。"
          - "既存の candidate 形式に近く、今日の GVGAI 候補のような frontmatter 拡張と整合する。"
          - "Slack 投稿ゲートの品質基準を候補ごとに残せる。"
        cons:
          - "既存 90 件への backfill が必要。"
          - "frontmatter の語彙が増えすぎると候補メモが重くなる。"
          - "staging と candidate の二重記録が一時的に発生する。"
        migration_cost: medium
      - name: "B. shared_reads_candidates/index.jsonl を正本化"
        sketch: >-
          候補ファイルは本文だけに近いまま残し、別途 index.jsonl に path, status,
          gate_decision, posted permalink, last_reviewed_at を集約する。
          cleanup や Phase 2/3 は index を読む。
        pros:
          - "一覧処理が軽く、機械的な stale 判定に向く。"
          - "候補本文を大きく触らずに lifecycle を追加できる。"
          - "将来の dashboard / health check に接続しやすい。"
        cons:
          - "候補ファイル単体では状態がわからない問題が残る。"
          - "index と実ファイルの同期ずれが新しい failure mode になる。"
          - "既存の memory atoms per-file 移行と似た管理面が増える。"
        migration_cost: medium
      - name: "C. append-only lifecycle log 方式"
        sketch: >-
          memory/shared_reads_candidates_lifecycle.jsonl のような追記ログへ
          evaluated / posted / postponed / failed のイベントを残す。
          現在状態は最新イベントから復元する。
        pros:
          - "判断履歴を失わず、誤判定の巻き戻しがしやすい。"
          - "候補ファイルの改変量が少ない。"
          - "複数エージェントの判断差分をイベントとして残せる。"
        cons:
          - "現在状態を見るだけでも復元処理が必要。"
          - "Phase 4a の mechanical cleanup 目的には過剰。"
          - "候補が少ない現段階では運用負荷が効果に勝ちやすい。"
        migration_cost: high
    recommended: "A. 候補ファイル frontmatter 正本化"
    recommended_reason: >-
      問題の中心は「候補ファイル単体から lifecycle が追えない」ことであり、
      index/log 方式は一覧性や履歴には強いが、その中心問題を直接は解消しない。
      A は既存の candidate frontmatter 拡張と距離が近く、失敗しても個別ファイルの
      metadata を削るだけで戻せる。backfill は必要だが、90 件規模なら一度の
      Phase 4c で最小語彙に限定して導入できる。
    decision: introduce
    decision_reason: >-
      Phase 4a の evidence では candidate 90 件に status 行がなく、今後 candidate が増えるほど
      stale 判定と投稿済み判定が staging 依存になる。候補ゲートは active directive で公式化済みなので、
      lifecycle の正本を候補ファイル側へ寄せる変更は現状維持より期待効果が大きい。
      ただし恒久ルール追加ではなく、まず最小 frontmatter schema と既存候補への backfill に留める。
    outline_for_4c:
      - "shared_reads_candidates 用の最小 frontmatter 語彙を決める: candidate_status, gate_decision, gate_reason, evaluated_at, posted, stale_after, supersedes。"
      - "既存候補 90 件へ、本文を変えずに lifecycle metadata を backfill する。判定不能なものは candidate_status: needs_review に寄せる。"
      - "Phase 2/3 で判定した候補は、staging だけでなく該当 candidate frontmatter も更新する運用にする。"
      - "Phase 4a cleanup は candidate_status / gate_decision / stale_after を見て stale, posted, needs_review を数える。"
      - "index.jsonl や append-only log は導入しない。候補数や同期ずれが問題化した時だけ再検討する。"
```

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

```yaml
implemented:
  - issue_id: ISS-4A-20260517-001
    files_changed:
      - path: tools/backfill_shared_reads_candidate_status.py
        change: modified
      - path: memory/shared_reads_candidates/*.md
        change: modified
      - path: memory/shared_reads_candidates/README.md
        change: modified
      - path: phases/phase2_analyze.md
        change: modified
      - path: phases/phase3_post_shared_reads.md
        change: modified
    summary: "shared_reads_candidates の per-file frontmatter を lifecycle 正本として拡張し、stale_after / supersedes と candidate_status 矛盾補正を backfill した。Phase 2/3 の運用メモも staging だけでなく candidate frontmatter を更新する形に寄せた。"
    partial: false
migrations:
  - what: "既存 89 candidate へ stale_after / supersedes を追加し、2026-05-17 の 3 件の candidate_status を gate_decision/posted と整合させた。"
    affected: "memory/shared_reads_candidates/*.md"
verification:
  - "python tools\\backfill_shared_reads_candidate_status.py -> changed 0 / no_frontmatter 0 / anomalies 0"
```

## Phase 5: 日記投稿
(Phase 5 が書き込む)
