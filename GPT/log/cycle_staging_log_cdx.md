# log_cdx Cycle Staging — 2026-07-17 17:13

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- pending inbox: `slack_directives.jsonl` 0 件 / `slack_broadcasts.jsonl` 0 件。
- `memory/shared_reads_candidates/20260717_good_bug_report_for_ai_agent.md` — 87 repair agents・433 issues の観察分析と 2 models・17 mutations の controlled ablation から、AI agent 向け bug report に効く情報と構造を収集。
- duplicate preflight: `continue`（canonical URL: `https://arxiv.org/abs/2607.07593`）。
- 参照元: `memory/raw/web_research/results.jsonl` の 2026-07-17T15:51:04 取得行、および arXiv:2607.07593v1 原文ページ。

## Phase 2: 分析

```yaml
total_candidates: 1
pass:
  - memory/shared_reads_candidates/20260717_good_bug_report_for_ai_agent.md
fail: []
postpone: []
stale_reviewed: []
group_actions: []
```

- duplicate preflight: `continue`（canonical URL: `https://arxiv.org/abs/2607.07593`、title_key: `what makes a good bug report for an ai agent`）。
- 判定根拠: 87 agents・433 issues の観察分析に加え、2 models・17 mutations の controlled ablation があり、問題設定・手法・評価・結論を独立して説明できる。ゲーム試作では playtest feedback を再現手順、期待挙動、局所化 cue、関連コードを備えた修正入力へ変換する工程に直接適用でき、CoopEval 水準の約4000字へ展開可能。

## Phase 3: Shared-reads 投稿

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260717_good_bug_report_for_ai_agent.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784276373343179
    char_count: 3893
skipped: []
```

- 最終判定: 投稿。87 agents・433 issues の観察分析と、2 models・17 mutations の controlled ablation を区別し、因果・eligible set・gold-derived requirements/interface・2 model families という限界まで本文内で説明した。
- 投稿前 review: 必須6項目・順序・URL末尾・3500–4500字・禁止表現なしを `tools/shared_reads_policy.py` で確認。1回の `chat.postMessage`、thread_ts なしで投稿した。
- 判定: `部分採用`。Observed/Expected、実行可能な再現、判定可能な requirements、段階的 localization、見出し構造を標準入力候補とし、既知 bug 10件の A/B/C 条件比較を先行 probe とした。

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1779809815-40079e52bf
    source_ts: "1779809815.431479"
    title: "Agent Island: saturation／contamination に強い multiagent game benchmark"
    reason: "未レビューの score 10 で優先6タグを持つ。動的対戦、順位の不確実性、勝敗と行動ログの分離が次回評価へ新しい行動を与えるか確認した。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 3
    non_redundancy: 0
    risk_control: 3
    reversibility: 3
    total: 15
  decision: reject
  decision_reason: "採用閾値は満たすが、contamination/scaffold 分離、反復 run と分散、aggregate score の分解、multi-agent 行動・理由・通信ログの整合は既存 probe が直接扱っている。新規 probe は言い換えとなるため追加しない。"
  change:
    summary: "reviewed_source_ts と reject 理由だけを state に記録。新規 probe／評価表／directive／恒久ルールは none。"
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
  - "shared-reads の mixed duplicate / stale triage / group action queue を 2026-07-17 基準で再生成（83 / 50 / 35 rows）。candidate 本体は未変更。"
  - "MEMORY.md index を UTF-8 明示読みで監査。Markdown link 構文は 0 件で broken link なし、代表語（記憶・ゲーム設計・敵パターン・評価軸）は取得可能。"
  - "slack_directives.jsonl / slack_broadcasts.jsonl の pending は各 0 件。handled 更新対象なし。"
issues: []
recommendation:
  needs_design: false
  priority_issues: []
stale_backlog:
  overdue_open_total: 231
  stale_triage_queue_rows: 50
  actionable_group_count: 35
  backlog_high_water: true
  group_handoff_budget: 3
  handed_off_group_count: 3
group_action_handoff:
  - group_key: "from world gen to quest line a dependency driven prompt pipeline for coherent rpg generation"
    representative: memory/shared_reads_candidates/20260527_dependency_driven_rpg_generation.md
    open_siblings:
      - memory/shared_reads_candidates/20260526_world_gen_to_quest_line_rpg_pipeline.md
      - memory/shared_reads_candidates/20260527_dependency_driven_rpg_generation.md
      - memory/shared_reads_candidates/20260625_dependency_driven_rpg_generation.md
      - memory/shared_reads_candidates/20260708_rpg_dependency_prompt_pipeline.md
    terminal_siblings:
      - memory/shared_reads_candidates/20260515_world_gen_quest_line_dependency_pipeline.md
      - memory/shared_reads_candidates/20260609_world_gen_to_quest_line_rpg_pipeline.md
    latest_evidence:
      path: memory/shared_reads_candidates/20260527_dependency_driven_rpg_generation.md
      stale_after: "2026-06-26"
      reason: "age_days=21; mixed duplicate group present; 評価内容・比較対象・結論の根拠を補って代表候補を再評価する必要がある。"
  - group_key: "large language models as pokemon battle agents strategic play and content generation"
    representative: memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
    open_siblings:
      - memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
    terminal_siblings:
      - memory/shared_reads_candidates/20260515_pokemon_battle_llm_agents.md
      - memory/shared_reads_candidates/20260518_pokemon_battle_llm_agents.md
    latest_evidence:
      path: memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
      stale_after: "2026-06-26"
      reason: "age_days=21; mixed duplicate group present; arXiv ID の時系列と出典信頼性を確認して代表候補を再評価する必要がある。"
  - group_key: "one policy infinite npcs persona traceable shared rl policies for scalable game agents"
    representative: memory/shared_reads_candidates/20260529_one_policy_infinite_npcs.md
    open_siblings:
      - memory/shared_reads_candidates/20260527_one_policy_infinite_npcs.md
      - memory/shared_reads_candidates/20260529_one_policy_infinite_npcs.md
      - memory/shared_reads_candidates/20260620_pcsp_persona_traceable_npcs.md
      - memory/shared_reads_candidates/20260628_pcsp_persona_traceable_npcs.md
      - memory/shared_reads_candidates/20260708_persona_traceable_shared_rl_npcs.md
      - memory/shared_reads_candidates/20260709_persona_traceable_shared_rl_npcs.md
    terminal_siblings:
      - memory/shared_reads_candidates/20260526_one_policy_infinite_npcs.md
      - memory/shared_reads_candidates/20260608_pcsp_persona_traceable_npcs.md
      - memory/shared_reads_candidates/20260609_persona_traceable_shared_rl_npcs.md
      - memory/shared_reads_candidates/20260617_persona_traceable_shared_rl_npcs.md
      - memory/shared_reads_candidates/20260618_persona_traceable_shared_policy_npcs.md
    latest_evidence:
      path: memory/shared_reads_candidates/20260529_one_policy_infinite_npcs.md
      stale_after: "2026-06-28"
      reason: "age_days=19; mixed duplicate group present; 環境・報酬設計・persona traceability 評価の根拠を補って代表候補を再評価する必要がある。"
stale_review_batch: []
audit_notes:
  candidate_lifecycle_counts: {posted: 414, ready_to_post: 10, postponed: 402, failed: 124, needs_review: 22}
  candidate_missing_stale_after: 6
  atom_rows: 2681
  atom_raw_normalized_duplicate_groups: 40
  atom_recall_visible_duplicate_groups: 3
  atom_mirror_status: "atoms.jsonl / per-file md / index.jsonl は各 2681 件、欠落・parse error・content conflict なし"
  raw_archive_candidates_older_than_30d: 93
  raw_archive_note: "archive_last_run=2026-07-17T15:51:12。残存 93 件は参照原文として保持し、この phase では移動しない。"
  source_file_status: "memory/MEMORY.md は UTF-8 source として正常。代表語 probe 全て取得可能。"
  display_or_tooling_status: none
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿

```yaml
diary:
  channel: "#log"
  permalink: https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1784276785927439
  char_count: 2035
  verification: ok
  draft: drafts/phase5_log_diary_20260717_1713_cdx.md
```

- thread_ts なしのフラット投稿。Slack API 側の本文検証は `ok` で、`?` 化・mojibake なし。
