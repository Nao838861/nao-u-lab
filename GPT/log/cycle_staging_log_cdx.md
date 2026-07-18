# log_cdx Cycle Staging — 2026-07-18 20:28

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260718_chartgeneval_rhythm_game_chart_evaluation.md` — 生成譜面を単一スコアでなく、corruption 注入で検証した複数の役割別信号として評価する枠組み。
- `memory/shared_reads_candidates/20260718_text_adventure_eval_instrument_effects.md` — text-adventure で LLM player を固定し、verdict 文法・成功条件・budget 表示が評価結果を変える instrument effect を測る研究。
- `memory/shared_reads_candidates/20260718_itgpt_dance_chart_generation.md` — DDR / ITG の chart を生成する transformer architecture と、先行手法比の accuracy / 計算量改善を扱う研究。
- `memory/shared_reads_candidates/20260718_whisperbench_memory_injection.md` — 一通の外部入力から長期記憶を汚染し将来行動へ伝播させる攻撃を、実 email workflow 上で測る benchmark。

## Phase 2: 分析

```yaml
total_candidates: 4
pass:
  - memory/shared_reads_candidates/20260718_chartgeneval_rhythm_game_chart_evaluation.md
  - memory/shared_reads_candidates/20260718_text_adventure_eval_instrument_effects.md
  - memory/shared_reads_candidates/20260718_whisperbench_memory_injection.md
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260718_itgpt_dance_chart_generation.md
    reason: "入力表現、身体的制約、dataset、accuracy 定義、比較値が未確認で、手法と評価を約4000字へ展開できない。"
stale_reviewed: []
group_actions: []
duplicate_preflight:
  - path: memory/shared_reads_candidates/20260718_chartgeneval_rhythm_game_chart_evaluation.md
    decision: continue
  - path: memory/shared_reads_candidates/20260718_text_adventure_eval_instrument_effects.md
    decision: continue
  - path: memory/shared_reads_candidates/20260718_itgpt_dance_chart_generation.md
    decision: continue
  - path: memory/shared_reads_candidates/20260718_whisperbench_memory_injection.md
    decision: continue
```

## Phase 3: Shared-reads 投稿

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260718_chartgeneval_rhythm_game_chart_evaluation.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784375300283269
    char_count: 4037
  - candidate: memory/shared_reads_candidates/20260718_text_adventure_eval_instrument_effects.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784375319927069
    char_count: 4453
  - candidate: memory/shared_reads_candidates/20260718_whisperbench_memory_injection.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784375330114349
    char_count: 4488
skipped: []
```

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1784375319-0bcc8cdfc0
    source_ts: "1784375319.927069"
    title: "評価装置の verdict grammar・成功条件開示・budget 表示が LLM player の判定を動かす instrument effect"
    reason: "未レビューで最新の score 11 atom で、harness・game-design・agent・operation・evaluation の5優先タグを持つ。同一 player の成績をモデル能力やゲーム品質へ誤帰属する最近の評価課題に直結する一方、既存 probe と重複せず次回行動を変える差分があるか確認するため選んだ。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 3
    non_redundancy: 0
    risk_control: 1
    reversibility: 3
    total: 13
  decision: reject
  decision_reason: "risk_control=1、合計13で採用条件に届かない。既存の attribution split・surface variant・LMGameBench diagnostic ablation probes が、fixed/varying factor、同一条件での scaffold contrast、UI wording、prompt wording、seed、retry budget をすでに扱う。319件ある active probe 群へ同義の instrument-effect probe を追加せず、次の該当評価で既存 probe の contrast run の具体例として参照する。"
  change:
    summary: "reviewed/source_ts と reject 理由だけを state に記録した。新規 probe・評価表・directive・恒久ルールは追加していない。"
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
  - "shared_reads の mixed duplicate / stale triage / group action の3派生queueを現行candidate正本から再生成した。3ファイルとも既存内容と一致し、差分はなかった。"
  - "MEMORY.md の索引atom 87件を per-file index と照合し、broken link 0件を確認した。"
  - "slack_directives.jsonl / slack_broadcasts.jsonl の pending がともに0件であることを確認した。handled更新は不要だった。"

memory_index_audit:
  checked_index_atom_ids: 87
  broken_links: 0
  source_file_status: "UTF-8明示読みで本文を取得でき、記憶 / ゲーム設計 / 敵パターンを確認。評価軸という代表語は本文に現れないが、UTF-8破損やbroken linkではない。"
  display_or_tooling_status: none

atom_audit:
  atoms_jsonl: 2690
  per_file_md: 2690
  index_jsonl: 2690
  mirror_missing_or_conflicts: 0
  raw_normalized_content_duplicate_groups: 40
  recall_visible_duplicate_groups_before_fold: 3
  recall_visible_duplicate_extra_rows_after_fold: 0
  source_ts_duplicate_warning: false
  contradiction_or_content_conflict: false
  note: "raw重複は lifecycle/content fold で表示から除外され、三者ミラーにもcontent_conflictsはないため、Phase 4bを要する構造問題とは判定しない。"

encoding_audit:
  source_file_status: "MEMORY.mdはUTF-8として正常。sr-1776127289-4d9239b255 はraw slack_archive段階から『エ��ジェント』を含み、per-file atomへ同じU+FFFDが継承された単発のsource damage。gr-1777083728-44d444ab7a は対象atom内にU+FFFDがなく、health heuristicのsuspectだった。"
  display_or_tooling_status: "none。PowerShell表示だけのmojibakeは検出していない。"
  action: "単発source damageは意味を推測して手修復せず保持。ゲーム制作記憶の導線を塞がないためissue化しない。"

raw_archive_audit:
  inactive_over_30d_files: 93
  inactive_over_30d_bytes: 62759242
  by_area:
    web_research: 85
    headless_eval: 6
    slack_archive: 1
    sync_state: 1
  archived: []
  note: "多くは一次資料・評価traceで、raw保持原則と既存atomのprovenanceに関わる。Phase 4aで安全に移動できる明確な一時物は特定できず、機械的archiveは行わない。"

candidate_lifecycle_audit:
  files: 990
  status_counts:
    posted: 422
    ready_to_post: 10
    postponed: 411
    failed: 125
    needs_review: 22
  missing_stale_after: 3
  missing_stale_after_paths:
    - memory/shared_reads_candidates/20260612_playtest_gamified_test_generator_post.md
    - memory/shared_reads_candidates/20260612_resp_visual_glitch_detection_post.md
    - memory/shared_reads_candidates/20260612_tempglitch_temporal_glitch_detection_post.md
  missing_stale_after_note: "3件ともstatus: postedのterminal candidateで、再評価queue対象外。補完のための更新はしない。"
  overdue_open_total: 239
  unindexed_duplicate_title_groups: 23
  mixed_duplicate_queue_rows: 84

issues: []

recommendation:
  needs_design: false
  priority_issues: []
  reason: "索引欠損・atom mirror競合・検索を塞ぐ新しい構造問題はない。大量のstale/mixed duplicateは既存queueとbounded group handoffで処理できる運用backlogであり、今回さらに仕組みを増やす根拠にはしない。"

stale_backlog:
  overdue_open_total: 239
  stale_triage_queue_rows: 50
  actionable_group_count: 35
  backlog_high_water: true
  high_water_reason: "overdue_open_total 239 > queue rows 50 かつ actionable groups 35 >= 3。"
  group_handoff_budget: 3
  handed_off_group_count: 3
  candidate_batch_count: 0
  candidate_batch_reason: "stale triage上位50件はすべてmixed duplicate。選択3 groupのrepresentative/open siblingsとの重複を避け、group budgetをcandidate laneから迂回しないため、単体candidate handoffは空にした。"

group_action_handoff:
  - group_key: "from world gen to quest line a dependency driven prompt pipeline for coherent rpg generation"
    status_counts:
      failed: 1
      posted: 1
      postponed: 4
    priority_reason: "age_days=22; mixed duplicate group present; 依存関係付きprompt pipelineという着想とゲーム制作への接続は明確だが、候補本文では評価の中身、比較対象、結論の強さが不足している。 4000字概要を書くと一般論で膨らませる危険があるため、Phase 3投稿には回さず、原文またはraw詳細を補って再評価する。"
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
      reason: "age_days=22; mixed duplicate group present; 依存関係付きprompt pipelineという着想とゲーム制作への接続は明確だが、候補本文では評価の中身、比較対象、結論の強さが不足している。 4000字概要を書くと一般論で膨らませる危険があるため、Phase 3投稿には回さず、原文またはraw詳細を補って再評価する。"
    recommended_action: reevaluate_representative
  - group_key: "large language models as pokemon battle agents strategic play and content generation"
    status_counts:
      failed: 2
      postponed: 1
    priority_reason: "age_days=22; mixed duplicate group present; 抽録メモから評価指標と turn-based battle testbed の方向性は読めるが、arXiv ID が 2512 で現在日付から見て時系列確認が必要。 その確認なしに #shared-reads へ出すと出典信頼性が弱く、ゲーム制作への適用も現状は「LLM evaluator に使えそう」に留まる。"
    representative: memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
    open_siblings:
      - memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
    terminal_siblings:
      - memory/shared_reads_candidates/20260515_pokemon_battle_llm_agents.md
      - memory/shared_reads_candidates/20260518_pokemon_battle_llm_agents.md
    latest_evidence:
      path: memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
      stale_after: "2026-06-26"
      reason: "age_days=22; mixed duplicate group present; 抽録メモから評価指標と turn-based battle testbed の方向性は読めるが、arXiv ID が 2512 で現在日付から見て時系列確認が必要。 その確認なしに #shared-reads へ出すと出典信頼性が弱く、ゲーム制作への適用も現状は「LLM evaluator に使えそう」に留まる。"
    recommended_action: reevaluate_representative
  - group_key: "one policy infinite npcs persona traceable shared rl policies for scalable game agents"
    status_counts:
      failed: 3
      needs_review: 1
      posted: 2
      postponed: 5
    priority_reason: "age_days=20; mixed duplicate group present; persona-conditioned shared RL policy の中核と速度・規模の利点は見えるが、候補メモだけでは環境設定、報酬設計、persona traceability の評価手順がまだ薄い。ゲーム制作への適用は life sim / colony 系に寄るため、現行制作サイクルへ無理に一般化す..."
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
      reason: "age_days=20; mixed duplicate group present; persona-conditioned shared RL policy の中核と速度・規模の利点は見えるが、候補メモだけでは環境設定、報酬設計、persona traceability の評価手順がまだ薄い。ゲーム制作への適用は life sim / colony 系に寄るため、現行制作サイクルへ無理に一般化す..."
    recommended_action: review_representative

stale_review_batch: []
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
