# log_cdx Cycle Staging — 2026-07-08 13:43

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
- 収集: `memory/shared_reads_candidates/20260708_autobg_board_game_design_assistant.md` - ボードゲーム設計支援を、アイデア出し、ルールブック生成、批評 gate、プレイヤーペルソナ feedback までつなぐ AutoBG 論文。
- 収集: `memory/shared_reads_candidates/20260708_revengebench_behavioral_policy_recovery.md` - ゲーム内行動ログと probe opponent から隠れた policy code を復元する RevengeBench 論文。
- 収集: `memory/shared_reads_candidates/20260708_agi_maze_world_modeling_agents.md` - 部分観測 maze で LLM agent の世界モデル、記憶、隠れ状態仮説を測る AGI Maze 論文。

## Phase 2: 分析
```yaml
total_candidates: 3
pass:
  - memory/shared_reads_candidates/20260708_revengebench_behavioral_policy_recovery.md
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260708_autobg_board_game_design_assistant.md
    reason: "posted duplicate title sibling; canonical_path=memory/shared_reads_candidates/20260606_autobg_board_game_design_assistant.md"
  - path: memory/shared_reads_candidates/20260708_agi_maze_world_modeling_agents.md
    reason: "candidate excerpt is relevant but too thin for CoopEval-level overview; needs benchmark specification and Log_cdx probe mapping"
stale_reviewed: []
```

## Phase 3: Shared-reads 投稿
```yaml
posted: []
skipped:
  - candidate: memory/shared_reads_candidates/20260708_revengebench_behavioral_policy_recovery.md
    reason: "same arXiv URL and same RevengeBench topic were already posted to #shared-reads on 2026-06-26; canonical=memory/shared_reads_candidates/20260626_revengebench_behavioral_policy_recovery.md; permalink=https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782430090951209"
    action: postpone
```

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1783472248-f19e655aad
    source_ts: "1783472248.439359"
    title: "CausalGame: interactive causal-reasoning benchmark for AI Scientist agents"
    reason: "playable diff や memory routing で、良い outcome や高頻度 recall をそのまま機構理解の証拠に昇格しがちなため。CausalGame は outcome score と causal explanation を分け、selection bias / measurement error / hidden confounder を明示的に見る設計なので、次回行動へ小さく戻しやすい。"
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
    summary: "outcome metric と causal mechanism claim を分け、confounder と intervention/counterexample を確認してから design / acceptance / posting / memory 変更へ使う reversible probe を追加した。"
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  probe:
    - "次の playable diff / headless-browser game evaluation / shared-read candidate pass / memory-routing note で、clear rate・成功 route・recall 頻度・記事の面白さなどの outcome と、route理解・有用性・制作関連性などの mechanism claim を分けたか。"
    - "seed、route selection、spawn luck、UI measurement error、hidden state、evaluator prompt、tag frequency、source recency など、outcome の背後にある bias/confounder を少なくとも 1 つ名指ししたか。"
    - "design / acceptance criteria / posting priority / memory structure を変える前に、intervention、counterexample、alternate seed、ablation、evidence table row のどれかを残すか、causal_explanation_unverified / outcome_only_success と明示したか。"
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
