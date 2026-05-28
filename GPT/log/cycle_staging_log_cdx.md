# log_cdx Cycle Staging — 2026-05-28 17:28

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
2026-05-28 17:30 JST / log_cdx Phase 1

- inbox 確認: `slack_directives.jsonl` pending なし。`slack_broadcasts.jsonl` は `broadcast-1779790844-85adeffbca` が pending 1 件。Phase 1 では対応せず、後フェーズ入力として扱う。
- 既存候補確認: APEX / RuleSmith / LLM-NPC cognitive load / Goal Playable Patterns / One Policy Infinite NPCs などは既に `memory/shared_reads_candidates/` に候補化済みのため、今回は重複追加しない。
- 追加候補: `memory/shared_reads_candidates/20260528_pedagogy_play_language_mapping.md` - 教育ゲームで pedagogical intent を structured language として編集可能にし、LLM 共創を gameplay mapping に接続する資料。
- 追加候補: `memory/shared_reads_candidates/20260528_codified_fsm_roleplaying.md` - LLM role-playing の latent character state を CFSM/CPFSM として明示し、NPC 一貫性と確率的状態探索を扱う資料。
- 追加候補: `memory/shared_reads_candidates/20260528_wanderstop_discomfort_design.md` - GDC 2026 の Wanderstop discomfort design talk。cozy convention と不快感の tension を mechanics/narrative で設計する資料。

## Phase 2: 分析
2026-05-28 17:32 JST / log_cdx Phase 2

```yaml
total_candidates: 3
pass:
  - memory/shared_reads_candidates/20260528_codified_fsm_roleplaying.md
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260528_pedagogy_play_language_mapping.md
    reason: "着想は有用だが、現候補本文だけでは評価内容と実ツール観察が薄く、4000字級の概要には一次本文補強が必要。"
  - path: memory/shared_reads_candidates/20260528_wanderstop_discomfort_design.md
    reason: "GDC セッション概要としては強いが、mechanics breakdown の具体例が不足し、投稿品質には視聴/詳細メモが必要。"
```

## Phase 3: Shared-reads 投稿
2026-05-28 17:37 JST / log_cdx Phase 3

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260528_codified_fsm_roleplaying.md
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779957463790519"
    char_count: 4500
skipped: []
```

## Phase 3b: Shared-reads 自己フィードバック
2026-05-28 17:50 JST / log_cdx Phase 3b

```yaml
self_feedback:
  selected:
    id: sr-1779938795-a42f39e465
    source_ts: "1779938795.408569"
    title: "GOROman「エビは自分の記憶を逆ベクトル化した補完ポジション」から見る3インスタンス設計"
    reason: "未reviewedのscore 19 atom。memory/harness/agent/operationをまたぎ、Log/Mir/Ashの自然発生的な分業を『意図的な逆方向の補完』と混同しないための次回行動に直結する。"
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
    summary: "次のmulti-agent handoff/phase role splitで、自然な分業と意図的な逆向き補完を分けて確認する一時probeを追加。恒久ルールやdirectiveは増やしていない。"
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```

## Phase 4a: 整理 + 問題抽出
2026-05-28 18:05 JST / log_cdx Phase 4a

```yaml
cleaned:
  - "memory/MEMORY.md の Markdown link を確認: 明示リンク 0 件、broken link 0 件。"
  - "memory/atoms.jsonl を確認: 1759 行、JSON parse error 0、duplicate id 0、normalized/content hash 重複 0。"
  - "memory/atoms/index.jsonl を確認: 1759 行、per-file atom 参照 missing 0。"
  - "memory/raw/ と memory/shared_reads_candidates/ を mtime で確認: 30 日以上動きがないファイル 0 件。archive/downgrade 対象なし。"
  - "inbox 系を確認: slack_directives pending 0、slack_broadcasts pending 1 件。ただし broadcast-1779790844-85adeffbca は triage_status=needs_human_review のため機械 close しない。"
issues:
  - id: ISS-4A-20260528-01
    description: "MEMORY.md の Tag Entry Points が identity/evaluation/operation/game-design/memory などの汎用タグに強く偏っており、ゲーム制作時に具体的な手法やジャンルから入る導線が相対的に埋もれている。"
    severity: medium
    evidence: "memory/MEMORY.md Tag Entry Points: identity 1371, evaluation 1051, operation 1041, game-design 1038, memory 969。atoms.jsonl 実数でも identity 1558 / evaluation 1222 / operation 1203 / game-design 1175 / memory 1146 が上位。"
    why_blocks_game_memory: "次のゲーム制作で『headless harness』『bad-policy』『shmup enemy pattern』のような実装可能な知見を探す時、汎用タグ入口から広すぎる集合へ入るため、過去の具体事例へ短く辿りにくい。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-4A-20260528-01
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

2026-05-28 18:18 JST / log_cdx Phase 4b

```yaml
designs:
  - issue_id: ISS-4A-20260528-01
    problem_restatement: "MEMORY.md の Tag Entry Points は現在の atom 分布を正しく示しているが、identity / evaluation / operation / game-design / memory などが巨大すぎる。ゲーム制作前に具体的な headless 評価、bad-policy、shmup enemy pattern、feedback bridge へ降りるには、上位 tag の代表 atom を順に読むより、既存の task lens に誘導する入口が必要。"
    alternatives:
      - name: "A. MEMORY.md に Broad Tag Descent の短い案内を追加"
        sketch: "MEMORY.md の Tag Entry Points 直前または直後に、巨大 tag は直接掘らず `memory/game_memory_task_lens_index.md` の Broad Tag Descent Map を先に見る、という 5-8 行の導線を置く。実体の対応表は既存 lens index に寄せ、MEMORY.md はポインタに留める。"
        pros:
          - "常時読む MEMORY.md から迷わず task lens へ降りられる。"
          - "既存の game_memory_task_lens_index.md を再利用でき、分類体系を増やさない。"
          - "失敗時は案内文を消すだけで戻せる。"
        cons:
          - "MEMORY.md がさらに入口リンクを持つため、索引の責務が少し増える。"
          - "lens index 側が古くなると、案内だけ残って実効性が落ちる。"
        migration_cost: low
      - name: "B. MEMORY.md の Tag Entry Points を task lens 別に生成し直す"
        sketch: "Tag Entry Points の集計自体を broad tag ではなく Playable / Headless 評価、Balance / Rule Space などの lens 単位に変える。生成ロジックも lens mapping を読み、代表 atom を lens ごとに出す。"
        pros:
          - "MEMORY.md 単体でゲーム制作向けの入口が完結する。"
          - "汎用 tag 偏りを表示上から大きく減らせる。"
          - "将来の自動 recall と統合しやすい。"
        cons:
          - "生成ロジック改修が必要で Phase 4c の範囲が広がる。"
          - "game 以外の作業では broad tag の全体分布が見えにくくなる。"
          - "lens mapping の保守コストが上がる。"
        migration_cost: medium
      - name: "C. 新しい derived index を作る"
        sketch: "MEMORY.md には触らず、`memory/game_memory_task_lens_index.md` とは別に、broad tag から具体 query / representative atom へ降りる専用 index を新設する。Phase 4a はそこへのリンクを report する。"
        pros:
          - "既存ファイルの責務を分離できる。"
          - "実験的に壊しても既存 lens index への影響が小さい。"
          - "将来 per-file atom frontmatter から自動生成しやすい。"
        cons:
          - "入口ファイルが増え、どれを見るべきかが逆に増える。"
          - "既に lens index に近い構造があるため重複しやすい。"
          - "Phase 4b の issue に対しては過剰設計。"
        migration_cost: medium
    recommended: "A. MEMORY.md に Broad Tag Descent の短い案内を追加"
    recommended_reason: "問題は recall データ不足ではなく、最初の降り口が broad tag に寄りすぎること。既に `memory/game_memory_task_lens_index.md` に Broad Tag Descent Map と task lens があるため、新しい分類や生成ロジックを増やすより、常時読む MEMORY.md から既存 lens へ誘導するのが最短で可逆。失敗時のコストも案内文削除だけで低い。"
    decision: introduce
    decision_reason: "Phase 4a の blocker は中程度だが、次のゲーム制作で毎回 broad tag から読み始めるコストが出る。既存 index を使う軽量導線なら設計リスクが低く、Phase 4c で staging 以外の実装に進む価値がある。B は自動生成改修まで含み重く、C は既存 lens index と重複するため今回は採らない。"
    outline_for_4c:
      - "MEMORY.md の Tag Entry Points 付近に、巨大 tag から直接掘らず `memory/game_memory_task_lens_index.md` の Broad Tag Descent Map を先に読む短い案内を追加する。"
      - "案内は 5-8 行程度に抑え、具体対応表は lens index 側を正本にする。"
      - "新しい .py や新規 index は作らない。生成ロジック変更も今回は行わない。"
      - "編集後に `git diff -- log/cycle_staging_log_cdx.md memory/MEMORY.md` で Phase 4b decision と Phase 4c 実変更の範囲だけ確認する。"
```

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
