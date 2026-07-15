# log_cdx Cycle Staging — 2026-07-15 18:13

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- pending 確認: `memory/slack_directives.jsonl` 0 件、`memory/slack_broadcasts.jsonl` 0 件。
- `memory/shared_reads_candidates/20260715_vr_sports_physical_interactions.md` — 現実のスポーツ動作と仮想操作を物理コントローラで対応づけ、インタラクティビティ・現実感・空間的存在感・楽しさを比較評価する VR スケート研究。
- duplicate preflight: AutoBG=`skip`（posted URL match）、RevengeBench=`review`（同題・別 URL、既存 canonical あり）、LLM-MARL stabilisation=`review`（同題・別 URL、既存 canonical あり）、RogueAI=`skip`（posted URL match）。これらは新規 candidate を作成せず、preflight log のみに記録。

## Phase 2: 分析

```yaml
total_candidates: 1
pass: []
fail:
  - path: memory/shared_reads_candidates/20260715_vr_sports_physical_interactions.md
    reason: "比較結果・効果量・参加者条件・最終結論が不足し、CoopEval 水準の概要を支えられない"
postpone: []
stale_reviewed: []
```

- duplicate preflight: URL-first では posted URL 一致なし。title-second では同一 URL・同一 title の既存 mixed group（`failed` 1 件、`postponed` 1 件）を確認したが terminal posted sibling はなく、本文評価を継続した。
- ゲーム制作への適用性: 身体動作と入力装置の対応を `interactivity / reality`、`spatial presence`、`enjoyment` に分解して比較する評価設計は、専用入力デバイスの試作に適用可能。ただし本 candidate は実験結果を欠くため、設計知見として採用する根拠が不足する。

## Phase 3: Shared-reads 投稿

```yaml
posted: []
skipped: []
```

- Phase 2 の `pass` は 0 件。投稿対象がないため、#shared-reads への投稿と candidate frontmatter の更新は行わなかった。
- `memory/shared_reads_candidates/20260715_vr_sports_physical_interactions.md` は Phase 2 で `fail` 判定済み。比較結果、効果量、参加者条件、最終結論が不足し、記事を読まずに中核を把握できる概要と記事固有の深い分析を支えられないため、Phase 3 へ昇格させない。

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1782675599-74ceadabb3
    source_ts: "1782675599.868889"
    title: "SMAC-Talk: 局所観測・遅延通信・欺瞞下の協力 LLM agent 評価"
    reason: "未レビューの score 10 atom のうち最新で、memory・harness・game-design・agent・evaluation を横断し、会話付き NPC の通信を実行 action と結果へ接続して検証できるため"
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
    summary: "次の協力 NPC・複数 agent・memory-source 評価で、通信なし/ありを同一条件で比較し、発話品質ではなく実行 action と結果への寄与を確認する3問の一時 probe を state に追加した"
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```

一時 probe（次の該当評価1回で確認）:

1. 通信なし/ありを同じ build・seed または scenario・観測範囲・action schema で比較したか。
2. 発話の自然さではなく、invalid action、共同目標への寄与、味方危険への反応遅延の少なくとも1つで、通信が助けたか壊したかを記録したか。
3. 疑わしい情報源が自然に存在する場合だけ known / unknown source を分け、観測 grounding の差を確認したか。専用の欺瞞環境は新設しない。

採用理由: shared-reads 本文には 8 scenario・各100 episode・win rate / reward / invalid action rate の比較根拠があり、行動へ変換しやすい。既存 probe の route comparability や trace 保存とは重なる部分があるが、「通信そのものの限界寄与を no_comm 対照で測る」観点は独立している。対象を次の該当評価1回に限定し、恒久 directive・phase prompt・AGENTS.md は変更しない。

## Phase 4a: 整理 + 問題抽出

```yaml
cleaned:
  - "memory/MEMORY.md を UTF-8 明示読みで監査。validate_memory_index.py は OK、代表語（記憶 / ゲーム設計 / 敵パターン / 評価軸）も取得でき、broken index entry は 0 件"
  - "memory/atoms.jsonl を memory_health.py で監査。2675 atom、normalized content duplicate は raw 40 group / recall-visible 3 group だが lifecycle fold が有効。矛盾を示す新規 evidence はなし"
  - "shared-reads の mixed duplicate / stale triage / group-action queue を 2026-07-15 基準で再生成（80 rows / 50 rows / 35 groups）"
  - "candidate lifecycle を集計。posted 407 / ready_to_post 10 / postponed 393 / failed 122 / needs_review 22。stale_after 到来済みは 208 件（postponed 199 / needs_review 9）、今回 handoff は group-action queue 先頭 1 group のみ"
  - "memory/raw/ の 30日超無更新 file を 93件識別。原文・Slack archive を含むため、この phase では移動せず archive 候補として記録のみ"
  - "slack_directives.jsonl / slack_broadcasts.jsonl は pending 0 件。handled 更新対象なし"
issues: []
recommendation:
  needs_design: false
  priority_issues: []
stale_backlog:
  due_total: 208
  stale_triage_queue_rows: 50
  mixed_duplicate_queue_rows: 80
  group_action_queue_rows: 35
stale_review_batch:
  - path: memory/shared_reads_candidates/20260527_procedural_personas_mcts_playtesting.md
    status: postponed
    stale_after: "2026-06-26"
    duplicate_group_key: automated playtesting with procedural personas through mcts with evolved heuristics
    priority_reason: "group-action queue 先頭。procedural persona と evolved MCTS heuristic は headless 評価を平均スコアからプレイスタイル別の破綻検出へ移す材料になり、terminal sibling 2件と open sibling 5件の group 判定を一度で閉じられる"
    status_counts:
      terminal_siblings: 2
      open_siblings: 5
    terminal_paths:
      - memory/shared_reads_candidates/20260515_automated_playtesting_procedural_personas.md
      - memory/shared_reads_candidates/20260625_procedural_personas_playtesting.md
    open_paths:
      - memory/shared_reads_candidates/20260516_procedural_personas_mcts_playtesting.md
      - memory/shared_reads_candidates/20260517_procedural_personas_playtesting.md
      - memory/shared_reads_candidates/20260527_procedural_personas_mcts_playtesting.md
      - memory/shared_reads_candidates/20260616_procedural_personas_automated_playtesting.md
      - memory/shared_reads_candidates/20260709_procedural_personas_playtesting.md
    recommended_review_action: reevaluate_in_phase2
encoding_audit:
  source_file_status: "memory/MEMORY.md は UTF-8 として正常。代表語4件を取得でき、source file 破損なし"
  display_or_tooling_status: none
```

- `memory_health.py` の warning（未 group 化 repeated title 14種、mojibake suspect atom 2件）は既存 audit で可視化済みで、recall smoke も成功した。今回の証拠だけでは次のゲーム制作を塞ぐ構造問題とは判定しない。
- stale backlog は大きいが、Phase 2 へ大量投入せず group-action 限定運用を継続する。同一 group の candidate を candidate 単位 batch に重ねていない。

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
