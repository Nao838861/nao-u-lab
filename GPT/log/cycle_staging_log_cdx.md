# log_cdx Cycle Staging — 2026-05-28 23:28

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
2026-05-28T23:29+09:00 log_cdx Phase 1 実行。

- pending 確認:
  - directive pending: `log-cdx-1779975088-04bf9d4169` / #human-steering / X 投稿への返信可否相談。Phase 1 では対応せず存在確認のみ。
  - broadcast pending: `broadcast-1779790844-85adeffbca` / #nao-u / X 投稿について読む立場の実感確認。Phase 1 では対応せず存在確認のみ。
- 既存候補確認:
  - `memory/shared_reads_candidates/20260528_*.md` に agent 評価、PCG、LLM NPC、AI game design 関連候補が多数あり。
  - `memory/raw/web_research/results.jsonl` には 2026-05-28 収集の LLM/game/evaluation/agent-memory 系 arXiv 候補が追加済み。
- 新規収集:
  - `memory/shared_reads_candidates/20260528_gui_agents_continual_game_generation.md` — GUI agent を PlaytestArena / Play2Code として使い、browser game generation を実プレイ検査ループに入れる論文候補。
  - `memory/shared_reads_candidates/20260528_mazocarta_instrumented_deckbuilder.md` — seeded procedural deckbuilder を shared rules core + deterministic simulation + automated probe の reference artifact として扱う論文候補。

注記: 本フェーズでは品質判定・採否判断・Slack 投稿は行っていない。

## Phase 2: 分析
2026-05-28T23:47+09:00 log_cdx Phase 2 実行。

```yaml
total_candidates: 2
pass:
  - memory/shared_reads_candidates/20260528_gui_agents_continual_game_generation.md
  - memory/shared_reads_candidates/20260528_mazocarta_instrumented_deckbuilder.md
fail: []
postpone: []
```

- `20260528_gui_agents_continual_game_generation.md`: pass。GUI agent を完成判定者ではなく、browser game の interaction-level failure を拾う playtester として使う軸が明確。PlaytestArena / Play2Code / rubric pass-rate まであり、Phase 3 の概要に展開できる。
- `20260528_mazocarta_instrumented_deckbuilder.md`: pass。同一 rules core を browser play、native simulation、E2E、save/load fixture、seeded balance probe に通す設計が具体的。Nao_u_BOT の deterministic 検証へ適用しやすい。

## Phase 3: Shared-reads 投稿
2026-05-29T00:11+09:00 log_cdx Phase 3 実行。
```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260528_gui_agents_continual_game_generation.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779979770780529
    char_count: 3673
  - candidate: memory/shared_reads_candidates/20260528_mazocarta_instrumented_deckbuilder.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779979852965569
    char_count: 3709
skipped: []
```

## Phase 3b: Shared-reads 自己フィードバック
2026-05-28T23:56+09:00 log_cdx Phase 3b 実行。
```yaml
self_feedback:
  selected:
    id: sr-1779979770-debe6e8ae9
    source_ts: "1779979770.780529"
    title: "GUI Agents for Continual Game Generation"
    reason: "直近 Phase 3 投稿のうち未レビューで、browser game 生成を静的コード生成ではなく interaction-level failure 検出として扱う知見が、次回 playable diff 検証に直結するため。"
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
    summary: "次の browser game playable diff / browser verification で、build・screenshot・headless pass だけで playable と扱わず、実入力、状態変化、小さな rubric、残る人間向け feel check を確認する一時 probe を追加。"
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```
- 既存の `fixed-test-vs-dynamic-stress` / `pcg-tool-loop-evidence` probe と隣接するが、今回の追加は browser 上の実入力と rubric 付き状態変化に限定した。恒久 directive や AGENTS.md 変更は行わない。

## Phase 4a: 整理 + 問題抽出
2026-05-29T00:26+09:00 log_cdx Phase 4a 実行。

```yaml
cleaned:
  - "memory/MEMORY.md の markdown/link 参照を確認。実ファイル参照 2 件に broken link なし。コマンド例の backtick はリンク対象から除外。"
  - "memory/atoms.jsonl を確認。1772 rows、JSON error 0、id duplicate 0、exact/normalized content duplicate 0。"
  - "memory/raw/ 配下の 30 日超未更新ファイルを確認。該当なし。"
  - "memory/shared_reads_candidates/ 配下の 30 日超未更新 candidate を確認。該当なし。"
  - "inbox pending を確認。directive 1 件、broadcast 1 件はいずれも needs_human_review の未対応指示であり、handled 化しない。"
issues:
  - id: ISS-001
    description: "memory/MEMORY.md の日本語本文が mojibake しており、High Signal / Recent / Tag Entry Points の人間可読な検索導線として機能しにくい。"
    severity: medium
    evidence: "memory/MEMORY.md:1 および High Signal / Recent 各行。例: 'shared-reads 縺九ｉ...' のように UTF-8 読みでも日本語が崩れている。"
    why_blocks_game_memory: "次のゲーム制作で過去の手法や判断基準を探す入口が壊れる。atom id と tag は残っていても、Use when の自然文が読めないため、ゲーム X の経験をゲーム Y へ引く初動が弱くなる。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-001
```

## Phase 4b: 仕組み検討 (条件起動)
2026-05-29T00:41+09:00 log_cdx Phase 4b 実行。
```yaml
designed:
  - issue_id: ISS-001
    problem_restatement: "memory/MEMORY.md の日本語本文が mojibake しており、atom id や tag は残っていても、人間と LLM が次のゲーム制作で『どの記憶をいつ使うか』を判断する入口として機能しにくい。全量復元を急ぐより、まず入口として必要な High Signal / Recent / Tag Entry Points の可読性と再生成可能性を確保する必要がある。"
    alternatives:
      - name: "案A: MEMORY.md を手作業で全面復元"
        sketch: "壊れている見出しと本文を、人間が読める日本語へ直接書き直す。既存リンク、atom id、tag を目視で残しながら、現行ファイルを正本として修復する。"
        pros:
          - "最短で可読性を戻せる"
          - "追加の仕組みを増やさない"
          - "修復後の読み手負荷が低い"
        cons:
          - "同じ文字化けや生成ミスが再発した時に検知しにくい"
          - "どの atom から復元したかの根拠が薄くなりやすい"
          - "大きな手編集になり、無関係な意味変更を混ぜるリスクがある"
        migration_cost: medium
      - name: "案B: MEMORY.md の入口セクションを per-file/index から再生成する"
        sketch: "MEMORY.md の High Signal / Recent / Tag Entry Points を、既存の per-atom .md と memory/atoms/index.jsonl から再構成する運用に寄せる。Phase 4c ではまず小さい再生成手順と検査観点だけ導入し、全面自動化は後続に分ける。"
        pros:
          - "Phase C の per-file 移行方針と整合する"
          - "修復根拠が atom id / title / tag に残る"
          - "再発時に壊れた本文だけを直すのでなく、入口を作り直せる"
        cons:
          - "初回は生成対象の範囲定義が必要"
          - "既存 MEMORY.md の自由記述と完全一致はしない"
          - "自動化を広げすぎると Phase 4c の実装範囲が膨らむ"
        migration_cost: medium
      - name: "案C: MEMORY.md を入口として退役し、memory_recall.py に集約"
        sketch: "MEMORY.md の人間向け索引を最小化し、検索入口は memory_recall.py と per-file atom に寄せる。壊れた日本語は修復せず、ファイルの役割を縮小する。"
        pros:
          - "手編集される集約ファイルを減らせる"
          - "検索は構造化データへ寄る"
          - "将来の atoms.jsonl retire と方向性は近い"
        cons:
          - "起動時に読む索引としての AGENTS.md 導線と衝突する"
          - "人間が俯瞰する入口を失う"
          - "既存運用の変更幅が大きく、今回の issue に対して過剰"
        migration_cost: high
    recommended: "案B: MEMORY.md の入口セクションを per-file/index から再生成する"
    recommended_reason: "ISS-001 は単なる表記崩れではなく、記憶入口の信頼性低下である。案Aは早いが再発耐性が弱く、案Cは現行運用から遠い。案Bなら既存の per-file/index 移行成果を使い、Phase 4c で小さく導入して失敗時も MEMORY.md の該当入口だけを戻せる。"
    decision: introduce
    decision_reason: "Phase 4a で needs_design: true とされた唯一の priority issue であり、ゲーム制作時の記憶探索入口を直接阻害している。導入範囲を『入口セクションの再生成/検査設計』に限定すれば、実装コストと運用リスクは許容できる。"
    outline_for_4c:
      - "MEMORY.md の壊れている入口範囲を特定し、変更対象を High Signal / Recent / Tag Entry Points に限定する"
      - "memory/atoms/index.jsonl と代表 per-atom .md から、title / tags / source / short note を根拠付きで拾う"
      - "再生成後にリンク先存在、atom id 重複、mojibake 残存の簡易検査を行う"
      - "自動化を恒久 tool にするかは次サイクル判断とし、Phase 4c では最小の修復 diff に留める"
```

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

2026-05-29T00:58+09:00 log_cdx Phase 4c 実行。
```yaml
implemented:
  - issue_id: ISS-001
    files_changed:
      - path: memory/MEMORY.md
        change: modified
      - path: tools/validate_memory_index.py
        change: created
    summary: "MEMORY.md の High Signal / Recent / Tag Entry Points は既存の再生成差分で可読な日本語に戻っていることを確認し、per-file atom index に裏付けられているかを検査する最小ツールを追加した。"
    partial: false
migrations: []
verification:
  - "python tools\\validate_memory_index.py -> OK: memory/MEMORY.md entry sections match per-file atom index."
  - "python tools\\memory_recall.py \"記憶 階層 MEMORY.md mojibake\" --limit 3 -> 関連 atom 3 件を返し、既存 recall が動作することを確認。"
  - "python -m py_compile tools\\validate_memory_index.py tools\\memory_recall.py tools\\atoms_fileformat.py -> 成功。"
notes:
  - "恒久的な再生成方式の変更は次サイクル判断に残し、Phase 4c では入口セクションの根拠検査に留めた。"
```

## Phase 5: 日記投稿
(Phase 5 が書き込む)

2026-05-29T01:15+09:00 log_cdx Phase 5 done.
```yaml
posted:
  channel: "#log"
  permalink: https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1779981007108589
  ts: "1779981007.108589"
  char_count: 2109
  verification: ok
draft:
  path: memory/phase5_diary_20260529_0115.md
summary: "Phase 1-4 diary posted. Main threads: GUI-agent playable-check probe, MazoCarta rules-core verification view, and MEMORY.md entry repair."
```
