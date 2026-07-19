# log_cdx Cycle Staging — 2026-07-19 21:28

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `slack_directives.jsonl`: pending 0 件
- `slack_broadcasts.jsonl`: pending 0 件
- 確認範囲: `memory/raw/web_research/results.jsonl` の直近分、`memory/atoms.jsonl` の直近分、ローカル Slack 取込の `#shared-reads` / `#all-nao-u-lab` / `#human-steering`
- posted-source index: 実 Slack 投稿から再生成（554 records、unresolved 109）
- duplicate preflight: 既投稿との URL/work 一致 11 件を `skip` として candidate 化せず、根拠と permalink を `log/shared_reads_candidate_preflight.jsonl` に記録
- `memory/shared_reads_candidates/20260719_open_dialogue_llm_npcs.md` — 自由入力の LLM NPC 会話を脚本、ゲーム状態変更、意味データ保存へ接続する DiGRA 2026 論文
- `memory/shared_reads_candidates/20260719_memory_driven_ambient_npc_behavior.md` — action graph と bounded memory で多数の ambient NPC に低コストな行動変化を作る CoG 2026 採択予定研究
- `memory/shared_reads_candidates/20260719_ai_npc_social_presence_open_world.md` — open-world player 541 名を対象に AI NPC と social presence の関係を調べたユーザー研究
- Slack 投稿: なし

## Phase 2: 分析

```yaml
total_candidates: 3
pass:
  - memory/shared_reads_candidates/20260719_memory_driven_ambient_npc_behavior.md
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260719_open_dialogue_llm_npcs.md
    reason: 形式化・実装・評価結果が候補本文に不足し、4000字級では概念紹介に寄る
  - path: memory/shared_reads_candidates/20260719_ai_npc_social_presence_open_world.md
    reason: 尺度・統計手法・効果量・限界が不足し、調査結果の妥当性を深掘りできない
stale_reviewed: []
group_actions:
  - group_key: ai gamestore scalable open ended evaluation of machine general intelligence with human games
    representative: memory/shared_reads_candidates/20260616_ai_gamestore_human_games.md
    action: close_siblings
    target_paths:
      - memory/shared_reads_candidates/20260616_ai_gamestore_human_games.md
      - memory/shared_reads_candidates/20260620_ai_gamestore_human_games.md
      - memory/shared_reads_candidates/20260711_ai_gamestore_open_ended_game_evaluation.md
    reason: posted-source index で arXiv 2602.17594 の canonical URL/work 一致を確認したため再投稿対象外
    terminal_evidence:
      - path: memory/shared_reads_candidates/20260526_ai_gamestore_open_ended_human_games_eval.md
        evidence: "posted: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779793589433579"
    representative_decision: postpone
    analysis_time_minutes: 3
  - group_key: algorithmic collusion at test time a meta game design and evaluation
    representative: memory/shared_reads_candidates/20260616_algorithmic_collusion_metagame_eval.md
    action: close_siblings
    target_paths:
      - memory/shared_reads_candidates/20260616_algorithmic_collusion_metagame_eval.md
    reason: posted-source index で arXiv 2602.17203 の canonical work 一致を確認したため再投稿対象外
    terminal_evidence:
      - path: memory/shared_reads_posted_source_index.jsonl
        evidence: "posted: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783406218664919"
      - path: memory/shared_reads_candidates/20260516_algorithmic_collusion_test_time_metagame.md
        evidence: failed
    representative_decision: postpone
    analysis_time_minutes: 3
  - group_key: automated playtesting with procedural personas through mcts with evolved heuristics
    representative: memory/shared_reads_candidates/20260616_procedural_personas_automated_playtesting.md
    action: close_siblings
    target_paths:
      - memory/shared_reads_candidates/20260516_procedural_personas_mcts_playtesting.md
      - memory/shared_reads_candidates/20260517_procedural_personas_playtesting.md
      - memory/shared_reads_candidates/20260527_procedural_personas_mcts_playtesting.md
      - memory/shared_reads_candidates/20260616_procedural_personas_automated_playtesting.md
      - memory/shared_reads_candidates/20260709_procedural_personas_playtesting.md
    reason: posted-source index で arXiv 1802.06881 の canonical URL/work 一致を確認したため再投稿対象外
    terminal_evidence:
      - path: memory/shared_reads_candidates/20260515_automated_playtesting_procedural_personas.md
        evidence: "posted: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789339493129"
      - path: memory/shared_reads_candidates/20260625_procedural_personas_playtesting.md
        evidence: "posted: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782341107329629"
    representative_decision: postpone
    analysis_time_minutes: 4
group_handoff_audit:
  pending_before: 3
  read_ids:
    - gha-6c97712be1a4f523
    - gha-eee43275a9c927cf
    - gha-d873a0836c14b486
  resolved_ids:
    - gha-6c97712be1a4f523
    - gha-eee43275a9c927cf
    - gha-d873a0836c14b486
  deferred_ids: []
  partial_ids: []
  apply_counts:
    candidates_updated: 9
    already_terminal: 0
  pending_after: 0
```

## Phase 3: Shared-reads 投稿

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260719_memory_driven_ambient_npc_behavior.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784465316969869
    char_count: 4178
skipped: []
```

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1784465316-d67e0aa9ab
    source_ts: "1784465316.969869"
    title: A Memory-Driven Action Selection Framework for Scalable Ambient NPC Behavior — 反復抑制を多様性・文脈・予算の三軸で判定する
    reason: 最新の未レビュー score 11 atom で、memory・harness・game-design・operation・evaluation を含む7タグを持つ。直前の投稿を、背景 NPC の賢さ一般ではなく、次の ambient action-selection 作業に限定した比較評価へ変換できるため選んだ。
  scores:
    relevance: 3
    actionability: 3
    evidence: 2
    non_redundancy: 2
    risk_control: 3
    reversibility: 3
    total: 16
  decision: adopt_metric
  decision_reason: >-
    50〜200 NPC×各5 run、平均・P99・処理別 cost まで根拠がある一方、多様性、人間の知覚、baseline比較、同期 interruption の最大 hitch は未測定なので evidence=2。
    既存の style/task 分離、bounded-memory 契約、runtime integration probes と重なるが、同一 graph/seed で fixed-order・uniform-random・least-recently-used を比較し、反復低下が文脈違反・fallback・P99悪化との交換になっていないかを同じ表で見る境界は新しい。
    active probe を増やさず、次の該当1件だけで使う metric に限定した。
  metric:
    name: ambient_recency_memory_three_axis
    scope: next ambient or background NPC action-selection implementation or evaluation only
    check: 同じ action graph・seed 群・decision 数で3方式を比較し、反復軸、文脈軸、予算軸を別列にする。least-recently-used が反復だけを改善して他二軸を悪化させる場合は採用せず、personality・goal・社会記憶・知覚上の生命感の証明へ拡張しない。
    withdrawal_condition: 次の該当1件で既存3 probes だけで同じ採否が残る、比較が実装判断を変えない、または計測負荷が便益を上回る場合は再利用しない。
  change:
    summary: 次の ambient NPC action-selection 作業1件用に、fixed-order・uniform-random・least-recently-used の反復・文脈・P99予算を比較する可逆 metric を state に追加した。
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```

## Phase 4a: 整理 + 問題抽出
(Phase 4a が書き込む)

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
