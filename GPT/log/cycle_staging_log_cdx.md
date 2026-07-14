# log_cdx Cycle Staging — 2026-07-14 20:58

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260714_titan_llm_game_testing.md` — MMORPG 自動テストを、状態抽象化・行動優先度・軌跡記憶と自己反省・LLM bug oracle の4要素で構成する TITAN の論文を収集。
- duplicate preflight skip: `GUI Agents for Continual Game Generation` (`https://arxiv.org/abs/2605.28258`) は既投稿 URL 一致のため candidate を作成せず、`log/shared_reads_candidate_preflight.jsonl` に記録。
- inbox 確認: `slack_directives.jsonl` / `slack_broadcasts.jsonl` とも pending 0 件。

## Phase 2: 分析
```yaml
total_candidates: 1
pass: []
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260714_titan_llm_game_testing.md
    reason: "posted_url_match: canonical URL が既投稿 candidate と一致。canonical_path=memory/shared_reads_candidates/20260602_titan_llm_agents_automated_video_game_testing.md; permalink=https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780340975651269; matched_title_key=leveraging llm agents for automated video game testing"
stale_reviewed: []
```

- duplicate preflight: `skip / posted_url_match`。軽量 preflight index の `continue` 後、候補全体の URL-first 横断照合で同一 canonical URL の既投稿正本を確認した。
- `stale_review_batch` および staging の group-action handoff は今回なし。
- candidate frontmatter を `postpone / postponed`、`last_decision: postponed_duplicate` で閉じた。Phase 3 の投稿対象にはしない。

## Phase 3: Shared-reads 投稿
```yaml
posted: []
skipped: []
```

- Phase 2 の `gate_decision: pass` candidate は 0 件。投稿対象なし。
- `memory/shared_reads_candidates/20260714_titan_llm_game_testing.md` は Phase 2 で既投稿 URL 一致により postponed 済みのため、Phase 3 では再投稿・再更新しない。

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1778535759-9d7006a842
    source_ts: "1778535759.606529"
    title: "[Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版"
    reason: "未レビューの score 12 atom で6優先タグを持つ。ただし OmniWorld の lifecycle repost・quality routine・元項目 score 7 であり、独立した行動根拠になるかを確認した。"
  scores:
    relevance: 2
    actionability: 1
    evidence: 1
    non_redundancy: 0
    risk_control: 3
    reversibility: 3
    total: 10
  decision: reject
  decision_reason: "採用閾値14に届かず、actionability も2未満。atom から評価方法・比較結果・失敗条件を復元できず、新規 probe は既存の world-model、予測可能性、behavior-trace 系確認の言い換えになる。"
  change:
    summary: "reviewed_source_ts と reject 理由のみ更新。probe・評価表・directive・恒久ルールは追加していない。"
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
  - "memory/MEMORY.md を UTF-8 明示読みで監査: markdown link 0 broken。代表語 probe は 記憶/ゲーム設計/敵パターン=true、評価軸=false（文字化けではなく本文に当該語がない）。"
  - "memory/atoms.jsonl 2674 行を監査: JSON parse error 0、duplicate id 0、normalized_content_hash/content_hash の exact duplicate 0。per-file/index mirror drift と content conflict も 0。"
  - "shared-reads lifecycle 内訳を確認: posted 405 / ready_to_post 10 / postponed 385 / failed 120 / needs_review 22。postponed・needs_review の stale_after 期限超過は 203 件、stale_after 欠落は 3 件。posted_drafts/README 等を含む status 非対象ファイルは lifecycle 集計から分離して解釈した。"
  - "mixed duplicate / stale triage / group-action queue を 2026-07-14 基準で再生成: 75 rows / 50 rows / 35 groups。candidate 本体は変更していない。"
  - "memory/raw/ の mtime 30日超ファイルを 93 件検出。Slack archive・sync state・論文原文を含み参照可能性を機械判定できないため、移動せず archive 候補として記録のみ。"
  - "slack_directives.jsonl / slack_broadcasts.jsonl は pending 0 件。handled 更新対象なし。"
issues:
  - id: ISS-4A-20260714-01
    description: "stale な postponed/needs_review が 203 件残り、mixed duplicate group も 35 件あるため、candidate 単位の再評価では同一題材を繰り返し読む余地がある。"
    severity: medium
    evidence: "memory/shared_reads_stale_triage_queue.jsonl (50-row cap), memory/shared_reads_group_action_queue.jsonl (35 groups), lifecycle audit: overdue=203"
    source_file_status: "UTF-8/JSONL parse 正常。candidate frontmatter が正本で、3 queue は正常に再生成できた。"
    display_or_tooling_status: "none"
    why_blocks_game_memory: "重複候補の再読に Phase 2 の処理枠を消費すると、ゲーム制作へ転用価値の高い新規知見の評価が遅れる。"
recommendation:
  needs_design: false
  priority_issues: []
stale_backlog:
  overdue_postponed_or_needs_review: 203
  stale_triage_queue_rows: 50
  handed_to_phase2_candidate_count: 0
group_action_handoff:
  group_key: "automated playtesting with procedural personas through mcts with evolved heuristics"
  representative: "memory/shared_reads_candidates/20260527_procedural_personas_mcts_playtesting.md"
  recommended_action: reevaluate_representative
  priority_reason: "期限超過18日。procedural persona + MCTS は headless 評価への転用価値が高く、open 5件と terminal 2件を group 単位で閉じる効果が大きい。"
  status_counts:
    terminal_paths: 2
    open_paths: 5
  terminal_paths:
    - memory/shared_reads_candidates/20260515_automated_playtesting_procedural_personas.md
    - memory/shared_reads_candidates/20260625_procedural_personas_playtesting.md
  open_paths:
    - memory/shared_reads_candidates/20260516_procedural_personas_mcts_playtesting.md
    - memory/shared_reads_candidates/20260517_procedural_personas_playtesting.md
    - memory/shared_reads_candidates/20260527_procedural_personas_mcts_playtesting.md
    - memory/shared_reads_candidates/20260616_procedural_personas_automated_playtesting.md
    - memory/shared_reads_candidates/20260709_procedural_personas_playtesting.md
stale_review_batch: []
```

- `needs_design: false`: backlog 自体は構造的 issue だが、既存の group-action queue 限定運用がまさにこの重複を処理する観測期間にある。新しい仕組みを設計せず、先頭 1 group の representative だけを Phase 2 へ渡す。
- source encoding 判定: `memory/MEMORY.md` は UTF-8 として正常。PowerShell 経由の一部 probe 表示は `?` 化したが、codepoint probe で原文を再確認済みなので source corruption ではない。

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
```yaml
posted:
  channel: "#log"
  ts: "1784030870.800519"
  permalink: "https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1784030870800519"
  char_count: 2277
  verification: ok
  draft: drafts/phase5_log_diary_20260714_2058_cdx.md
```

- 「増やさない判断と、重複の森を束で見ること」を軸に、TITAN の duplicate postpone、Phase 3b の reject、203件の stale backlog と group-action handoff を日記化した。
- UTF-8 ファイル投稿後の Slack API 本文検証は `ok`。スレッドを使わず #log にフラット投稿した。
