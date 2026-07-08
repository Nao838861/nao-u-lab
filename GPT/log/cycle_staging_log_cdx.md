# log_cdx Cycle Staging — 2026-07-08 11:43

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
- 2026-07-08 Phase 1 収集。`slack_directives.jsonl` / `slack_broadcasts.jsonl` の pending は `rg` 検索でヒットなし。既存差分が多いため、今回の追加 candidate と staging 追記のみを対象にする。
- `memory/shared_reads_candidates/20260708_ptcg_bench_llm_tcg_agents.md` — Pokemon TCG を使い、LLM agent の単発意思決定と経験蓄積による self-evolution を分けて見る benchmark。
- `memory/shared_reads_candidates/20260708_persona_traceable_shared_rl_npcs.md` — 自然言語 persona を条件にした shared RL policy で、多数 NPC の一貫性、制御性、実時間性を扱う論文。
- `memory/shared_reads_candidates/20260708_rpg_dependency_prompt_pipeline.md` — RPG 生成を world / NPC / PC / campaign / quest expansion に分け、JSON 中間表現で依存関係を維持する prompt pipeline。

## Phase 2: 分析
```yaml
total_candidates: 3
pass: []
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260708_ptcg_bench_llm_tcg_agents.md
    reason: "posted duplicate title sibling: memory/shared_reads_candidates/20260530_ptcg_bench_self_evolving_game_agents.md; memory/shared_reads_candidates/20260618_ptcg_bench_self_evolving_card_game_agents.md"
  - path: memory/shared_reads_candidates/20260708_persona_traceable_shared_rl_npcs.md
    reason: "posted duplicate title sibling: memory/shared_reads_candidates/20260609_persona_traceable_shared_rl_npcs.md; memory/shared_reads_candidates/20260617_persona_traceable_shared_rl_npcs.md"
  - path: memory/shared_reads_candidates/20260708_rpg_dependency_prompt_pipeline.md
    reason: "posted duplicate title sibling: memory/shared_reads_candidates/20260609_world_gen_to_quest_line_rpg_pipeline.md"
stale_reviewed: []
```

## Phase 3: Shared-reads 投稿
```yaml
posted: []
skipped:
  - candidate: memory/shared_reads_candidates/20260708_ptcg_bench_llm_tcg_agents.md
    reason: "Phase 2 gate_decision が postpone。既存 posted duplicate title sibling があるため #shared-reads 投稿なし。"
    action: postpone
  - candidate: memory/shared_reads_candidates/20260708_persona_traceable_shared_rl_npcs.md
    reason: "Phase 2 gate_decision が postpone。既存 posted duplicate title sibling があるため #shared-reads 投稿なし。"
    action: postpone
  - candidate: memory/shared_reads_candidates/20260708_rpg_dependency_prompt_pipeline.md
    reason: "Phase 2 gate_decision が postpone。既存 posted duplicate title sibling があるため #shared-reads 投稿なし。"
    action: postpone
note: "Phase 2 の pass candidate が 0 件のため、投稿本文作成・Slack 投稿・candidate frontmatter 更新は実施しない。"
```

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1783472249-408c93e120
    source_ts: "1783472249.093829"
    title: "CommonRoad-Game: human operation logs as reproducible scenario and regression assets"
    reason: "手動プレイ・人間の feel check・ブラウザ操作を一回限りの印象で終わらせず、次回の playable diff や回帰確認へ接続する観点が今のゲーム制作サイクルに直結するため。既存 probe は event stream、harness、品質 routing を扱うが、人間操作ログを scenario fixture + oracle にする点はまだ薄い。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 2
    non_redundancy: 2
    risk_control: 3
    reversibility: 3
    total: 16
  decision: adopt_probe
  change:
    summary: "CommonRoad-Game から、人間操作・手動確認の有用な run を最小 scenario fixture と regression oracle に変換する可逆 probe を追加。再現不能な場合は manual_only_evidence 等として明示する。"
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
  - "git branch/status を確認。開始時点で既存差分多数のため、今回の作業対象は Phase 4a staging 追記と再生成 sidecar に限定。"
  - "memory/MEMORY.md を UTF-8 明示読みで確認。decode OK、atom index 参照 50 件は atoms.jsonl に全て存在、Markdown link は 0 件。"
  - "memory/atoms.jsonl を確認。rows=2636、bad_json=0、duplicate_id=0、duplicate_normalized_content_hash=0。"
  - "memory/raw/ を mtime 基準で確認。30 日以上未更新は 87 件 (web_research 79、headless_eval 6、sync_state.txt 1、slack_archive 1)。今回は移動せず候補把握のみ。"
  - "memory/shared_reads_candidates/ lifecycle を確認。posted=368、ready_to_post=10、postponed=312、failed=113、needs_review=13、status 空=62。postponed/needs_review で stale_after <= 2026-07-08 は 171 件。"
  - "python tools/build_shared_reads_mixed_duplicate_queue.py を再実行。memory/shared_reads_mixed_duplicate_queue.jsonl rows=61。"
  - "python tools/build_shared_reads_stale_triage_queue.py --today 2026-07-08 を再実行。memory/shared_reads_stale_triage_queue.jsonl rows=50。"
  - "python tools/slack_inbox_lifecycle.py pending を確認。slack_directives.jsonl / slack_broadcasts.jsonl とも pending 0 件のため handled 更新なし。"
issues:
  - id: ISS-001
    description: "shared-reads candidate の mixed duplicate backlog がまだ大きく、posted/failed 済み sibling と postponed/ready_to_post/needs_review が同じ title group 内に併存している。今回の Phase 2 でも新規 3 candidate が posted sibling により postpone されており、未登録 duplicate group が再評価 queue を濁す状態が続いている。"
    severity: medium
    evidence: "memory/shared_reads_mixed_duplicate_queue.jsonl rows=61; memory/shared_reads_stale_triage_queue.jsonl rows=50; audit_shared_reads_title_duplicates.py --unindexed-only --limit 20 で Large Language Models in Game Development / One Policy Infinite NPCs / RPG dependency pipeline など mixed group を確認。"
    source_file_status: "source files are readable as UTF-8; candidate frontmatter and sidecar JSONL are parseable. MEMORY.md source is not mojibake; UTF-8 probe found 記憶・ゲーム設計・敵パターン, and 評価軸 is simply absent from current index text."
    display_or_tooling_status: "PowerShell here-string 経由で日本語 literal probe を渡すと console 表示が mojibake し、probe false になる経路を確認。UTF-8 byte decode with escaped probes では source decode OK。"
    why_blocks_game_memory: "既読・投稿済みの game-design 論文が open candidate と混在すると、次のゲーム制作で使うべき既存知見を『新規候補』として再処理しやすく、Phase 2 の評価時間が duplicate triage に吸われる。"
recommendation:
  needs_design: false
  priority_issues: []
stale_review_backlog:
  due_count: 171
  sidecar_queue_rows: 50
  mixed_duplicate_rows: 61
  note: "Phase 2 に渡すのは下記 5 件のみ。candidate 本体の frontmatter は Phase 2 評価結果が出るまで変更しない。"
stale_review_batch:
  - path: "memory/shared_reads_candidates/20260515_liecraft_deception_hidden_role.md"
    status: postponed
    stale_after: "2026-06-14"
    priority_reason: "stale queue 上位。duplicate_group_key=liecraft a multi agent framework for evaluating deceptive capabilities in language models。hidden role / deception / degenerate strategy 排除がゲーム設計素材として高価値だが、posted/failed/open 混在 group の解消が先。"
    recommended_review_action: reevaluate_in_phase2
  - path: "memory/shared_reads_candidates/20260516_procedural_personas_mcts_playtesting.md"
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "stale queue 上位。duplicate_group_key=automated playtesting with procedural personas through mcts with evolved heuristics。headless 評価を複数プレイヤー傾向に拡張する直接価値がある。"
    recommended_review_action: reevaluate_in_phase2
  - path: "memory/shared_reads_candidates/20260516_symbolically_scaffolded_play.md"
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "stale queue 上位。duplicate_group_key=symbolically scaffolded play designing role sensitive prompts for generative npc dialogue。NPC 制作への適用は見えるが、scaffold 構造と評価粒度の本文確認が必要。"
    recommended_review_action: reevaluate_in_phase2
  - path: "memory/shared_reads_candidates/20260517_orak_diverse_video_game_agents.md"
    status: postponed
    stale_after: "2026-06-16"
    priority_reason: "stale queue 上位。duplicate_group_key=orak a foundational benchmark for training and evaluating llm agents on diverse video games。benchmark 構成は有用だが、評価結果・失敗様式の密度確認が必要。"
    recommended_review_action: reevaluate_in_phase2
  - path: "memory/shared_reads_candidates/20260517_stone_librande_paper_prototype_emotional_goal.md"
    status: postponed
    stale_after: "2026-06-16"
    priority_reason: "stale queue 上位。duplicate_group_key=gdc 2026 riot games stone librande on game design。emotional north star から paper prototype へ戻す制作知見は有用だが、一次資料密度と投稿水準を再判定する。"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
