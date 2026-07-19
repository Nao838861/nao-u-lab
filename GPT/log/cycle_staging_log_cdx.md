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

```yaml
cleaned:
  - memory/MEMORY.md を UTF-8 明示読みし、実体パス4件と atom ID参照82件を確認した。broken link / missing atom は0件。
  - memory/MEMORY.md の代表語 probe で「記憶」「ゲーム設計」「敵パターン」を取得した。「評価軸」は現生成物に文字列として含まれないが、本文の文字コード破損や表示経路の mojibake はなかった。
  - memory/atoms.jsonl / per-file .md / index.jsonl は各2700件で一致し、missing・parse error・content conflict は0件。duplicate cluster 45群と overlay 45群は現行 index と一致したため atom 本体は変更していない。
  - memory/raw/ の30日超ファイル93件を確認した。内訳は web_research 系85件、headless_eval 6件、slack_archive 1件、raw 直下1件で、Slack正本や論文一次資料を含むためこの phase では移動していない。
  - shared-reads candidate 1015件の lifecycle を集計した。posted 433 / ready_to_post 10 / postponed 379 / failed 173 / needs_review 20。README の例示 status 1行は集計から除外した。
  - mixed duplicate queue 65行、stale triage queue 50行、group action queue 13行を規定順で再生成した。enqueue 後は pending 3群を抑止した状態で group action queue を再生成し、残り10行に整合させた。
  - cycle ID 2026-07-19 21:28 と budget 3 で group handoff inbox へ3群を冪等 enqueue し、audit errors 0を確認した。
  - slack_directives.jsonl / slack_broadcasts.jsonl は pending 0件だったため status 更新はなかった。
lifecycle_counts:
  posted: 433
  ready_to_post: 10
  postponed: 379
  failed: 173
  needs_review: 20
raw_archive_audit:
  cutoff: "2026-06-19"
  inactive_file_count: 93
  archive_action: none
  reason: raw は再取得困難な Slack 正本と論文一次資料を含む。参照切れを起こす一括移動は mechanical cleanup の範囲を超えるため候補抽出だけに留めた。
atom_audit:
  atoms_jsonl: 2700
  per_file_md: 2700
  index_jsonl: 2700
  normalized_content_duplicate_groups: 40
  recall_visible_normalized_content_duplicate_groups: 3
  mirror_content_conflicts: 0
  duplicate_clusters: 45
  contradiction_check: mirror content conflict は0件。重複は canonical overlay / lifecycle fold の既存経路で折り畳まれており、今回新たな矛盾は検出しなかった。
issues:
  - id: ISS-20260719-UNGROUPED-TITLES
    description: recall-visible atom に未グループ化の repeated title が14種残る。代表例は「■ 概要」20件、「@」3件、「■ メリット・デメリット」3件で、結果一覧だけでは内容を識別しにくい。
    severity: medium
    evidence: tools/memory_health.py --json の ungrouped_repeated_title_groups=14 / recall_visible_repeated_title_groups=15; memory/atoms/title_quality_audit.jsonl 621行
    source_file_status: UTF-8 読みと atom mirror parse は正常。source 破損ではなく、投稿本文の節見出しを atom title として採った content extraction 結果である。
    display_or_tooling_status: mojibake ではない。memory_health が recall-visible label の重複として再現している。
    why_blocks_game_memory: 次のゲーム制作で検索結果を短時間に走査する際、同名ラベルから手法・事例を区別できず、適切な atom を開かないまま見落とす可能性がある。
  - id: ISS-20260719-SOURCE-MOJIBAKE-1
    description: historical shared-reads atom 1件で「AIエージェント」の一部が U+FFFD 2文字に置換されている。memory_health のもう1件の suspect は本文中の意図的な「???」を拾った false positive だった。
    severity: low
    evidence: memory/raw/slack_archive/shared-reads.jsonl ts=1776127289.990919; memory/atoms/2026-04/sr-1776127289-4d9239b255.md; memory/atoms.jsonl id=sr-1776127289-4d9239b255
    source_file_status: UTF-8 明示読みでも raw Slack row と派生 atom の双方に「エ��ジェント」が存在し、source data 自体の文字欠損と確認した。memory/atoms/2026-04/gr-1777083728-44d444ab7a.md は UTF-8 で正常だった。
    display_or_tooling_status: none。PowerShell / rg の UTF-8 表示は source 内容をそのまま再現しており、表示経路だけの mojibake ではない。
    why_blocks_game_memory: 「AIエージェント」の完全一致検索ではこの歴史 atom を拾いにくくなる。ただし atom ID・agent tag・他の語では想起可能で、ゲーム制作記憶全体への影響は限定的。
recommendation:
  needs_design: false
  priority_issues: []
  reason: repeated title は既存の title quality audit / canonical overlay を使う bounded curation、isolated source corruption は機械修復の対象で、いずれも記憶階層の新設計を要しない。overdue backlog も既存の bounded queue と永続 group handoff が前 cycle 3群を正常処理しているため、Phase 4b は起動しない。
stale_backlog:
  overdue_open_total: 216
  stale_triage_queue_rows: 50
  actionable_group_count: 13
  actionable_group_count_after_enqueue: 10
  backlog_high_water: true
  group_handoff_budget: 3
  handed_off_group_count: 3
  handoff_inbox_pending_count: 3
  handoff_inbox_ids:
    - gha-d54ebb46673e6ba4
    - gha-ded7421e263957c1
    - gha-df86ca0b643649dc
  previous_cycle_followup:
    processed_groups: 3
    close_siblings: 3
    keep_distinct: 0
    deferred_or_partial: 0
    group_analysis_time_minutes: 10
    normal_candidate_effect: 通常候補3件も pass 1 / postpone 2 まで完了しており、group処理による未分析候補は残らなかった。
    budget_decision: overdue 216件 > queue 50行かつ actionable 13群の高水位が続くため、今 cycle も budget 3を継続した。
group_action_handoff:
  - group_key: from failed trajectories to reliable llm agents diagnosing and repairing harness flaws
    representative: memory/shared_reads_candidates/20260617_harnessfix_trace_guided_agent_repair.md
    open_siblings:
      - memory/shared_reads_candidates/20260617_harnessfix_trace_guided_agent_repair.md
      - memory/shared_reads_candidates/20260712_harnessfix_failed_trajectory_repair.md
    terminal_siblings:
      - memory/shared_reads_candidates/20260708_harnessfix_failed_trajectories.md
    latest_evidence:
      path: memory/shared_reads_candidates/20260617_harnessfix_trace_guided_agent_repair.md
      stale_after: "2026-07-17"
      reason: age_days=2; mixed duplicate group present; failed trajectory から harness layer の欠陥を局所化する観点は、playtest trace と検証失敗の分解にかなり近い。一方で保存済み抜粋は提案枠組みの入口で止まり、診断手順・修復分類・評価結果が足りない。投稿候補としては最有力だが、Phase 3 に回す前に本文または詳細メモ...
  - group_key: large language models in game development implications for gameplay playability and player experience
    representative: memory/shared_reads_candidates/20260513_llm_gameplay_playability_player_experience.md
    open_siblings:
      - memory/shared_reads_candidates/20260513_llm_gameplay_playability_player_experience.md
      - memory/shared_reads_candidates/20260530_llm_gameplay_playability_player_experience.md
      - memory/shared_reads_candidates/20260601_llm_gameplay_playability_player_experience.md
      - memory/shared_reads_candidates/20260609_llms_gameplay_playability_player_experience.md
      - memory/shared_reads_candidates/20260708_llms_gameplay_playability_px.md
    terminal_siblings:
      - memory/shared_reads_candidates/20260515_llms_game_development_playability.md
      - memory/shared_reads_candidates/20260516_llm_game_development_playability_px.md
      - memory/shared_reads_candidates/20260517_llm_gameplay_playability_player_experience.md
      - memory/shared_reads_candidates/20260527_llm_game_development_playability_px.md
      - memory/shared_reads_candidates/20260621_llm_gameplay_playability_player_experience.md
    latest_evidence:
      path: memory/shared_reads_candidates/20260513_llm_gameplay_playability_player_experience.md
      stale_after: "2026-07-17"
      reason: age_days=2; mixed duplicate group present; LLM を game architecture component として扱い、correctness、difficulty calibration、structural coherence を評価対象に戻す観点は有用。ただし candidate メモだけでは 2 projects の中身と autoethno...
  - group_key: prompting destiny negotiating socialization and growth in an llm mediated speculative gameworld
    representative: memory/shared_reads_candidates/20260617_prompting_destiny_llm_gameworld.md
    open_siblings:
      - memory/shared_reads_candidates/20260517_prompting_destiny_llm_gameworld.md
      - memory/shared_reads_candidates/20260616_prompting_destiny_llm_reflective_gameworld.md
      - memory/shared_reads_candidates/20260617_prompting_destiny_llm_gameworld.md
    terminal_siblings:
      - memory/shared_reads_candidates/20260515_prompting_destiny_llm_gameworld.md
      - memory/shared_reads_candidates/20260515_prompting_destiny_reflective_llm_rpg.md
    latest_evidence:
      path: memory/shared_reads_candidates/20260617_prompting_destiny_llm_gameworld.md
      stale_after: "2026-07-17"
      reason: age_days=2; mixed duplicate group present; LLM NPC を即時採点ではなく stage progression と遅延フィードバックに組み込む点は、物語型プロトタイプに適用しやすい。ただし保存済み情報ではユーザー評価が途中で切れており、結果・限界・実装構成が見えない。教育的ゲームの素材として保持し、投稿前に評価部分を確認する。
stale_review_batch:
  - path: memory/shared_reads_candidates/20260609_bdd_il_game_regression_testing.md
    status: postponed
    stale_after: "2026-07-09"
    priority_reason: BDD・Imitation Learning・RL fine-tuning の接続はゲーム回帰テストに有用だが、評価情報が要約段階で、同題の posted sibling と統合判断が必要。
    recommended_review_action: reevaluate_in_phase2
    duplicate_group_key: enhancing automated video game regression testing through behavior driven development and imitation learning
    status_counts: {posted: 1, postponed: 1}
    terminal_paths: [memory/shared_reads_candidates/20260608_bdd_rl_il_game_regression_testing.md]
    open_paths: [memory/shared_reads_candidates/20260609_bdd_il_game_regression_testing.md]
  - path: memory/shared_reads_candidates/20260609_mortar_evolving_game_mechanics.md
    status: postponed
    stale_after: "2026-07-09"
    priority_reason: Quality-Diversity・LLM・tree search・skill ordering は制作転用価値が高いが、現候補は評価詳細が薄く、posted / failed sibling との統合判断が必要。
    recommended_review_action: reevaluate_in_phase2
    duplicate_group_key: mortar evolving mechanics for automatic game design
    status_counts: {failed: 1, posted: 1, postponed: 1}
    terminal_paths: [memory/shared_reads_candidates/20260604_mortar_evolving_mechanics.md, memory/shared_reads_candidates/20260604_mortar_evolving_mechanics_phase1_refresh.md]
    open_paths: [memory/shared_reads_candidates/20260609_mortar_evolving_game_mechanics.md]
  - path: memory/shared_reads_candidates/20260610_emergence_world_long_horizon_agents.md
    status: postponed
    stale_after: "2026-07-10"
    priority_reason: persistent memory と governance drift は有用だが、15日 study の条件・指標・崩壊例が不足し、failed siblings との group 判定が必要。
    recommended_review_action: reevaluate_in_phase2
    duplicate_group_key: emergence world a platform for evaluating long horizon multi agent autonomy
    status_counts: {failed: 2, postponed: 3}
    terminal_paths: [memory/shared_reads_candidates/20260618_emergence_world_long_horizon_agent_autonomy.md, memory/shared_reads_candidates/20260625_emergence_world_long_horizon_agent_autonomy.md]
    open_paths: [memory/shared_reads_candidates/20260610_emergence_world_long_horizon_agents.md, memory/shared_reads_candidates/20260620_emergence_world_long_horizon_agents.md, memory/shared_reads_candidates/20260622_emergence_world_long_horizon_agents.md]
  - path: memory/shared_reads_candidates/20260611_alem_open_ended_multi_agent_coordination.md
    status: postponed
    stale_after: "2026-07-11"
    priority_reason: 個体能力と協調能力を分離する評価軸は有用だが、モデル比較・return・ablation が不足し、posted siblings と統合判断が必要。
    recommended_review_action: reevaluate_in_phase2
    duplicate_group_key: benchmarking open ended multi agent coordination in language agents
    status_counts: {posted: 2, postponed: 3}
    terminal_paths: [memory/shared_reads_candidates/20260620_alem_multi_agent_coordination.md, memory/shared_reads_candidates/20260622_alem_open_ended_multi_agent_coordination.md]
    open_paths: [memory/shared_reads_candidates/20260611_alem_open_ended_multi_agent_coordination.md, memory/shared_reads_candidates/20260617_alem_open_ended_multi_agent_coordination.md, memory/shared_reads_candidates/20260618_alem_open_ended_multi_agent_coordination.md]
  - path: memory/shared_reads_candidates/20260616_memopilot_memory_rl_game_agents.md
    status: postponed
    stale_after: "2026-07-16"
    priority_reason: memory update を multi-turn RL 対象にする着想は次ゲームのログ選別へ接続できるが、reward・advantage・比較結果が不足し、posted / failed / needs_review siblings を含む group 判定が必要。
    recommended_review_action: reevaluate_in_phase2
    duplicate_group_key: from player to master enhancing test time learning of llm agents via reinforcement learning over memory
    status_counts: {failed: 1, needs_review: 1, posted: 2, postponed: 3}
    terminal_paths: [memory/shared_reads_candidates/20260610_memopilot_test_time_learning_memory.md, memory/shared_reads_candidates/20260619_memopilot_test_time_learning_game_agents.md, memory/shared_reads_candidates/20260625_memopilot_test_time_learning_game_memory.md]
    open_paths: [memory/shared_reads_candidates/20260616_memopilot_memory_rl_game_agents.md, memory/shared_reads_candidates/20260618_memopilot_rl_over_memory.md, memory/shared_reads_candidates/20260627_memopilot_test_time_learning_game_agents.md, memory/shared_reads_candidates/20260711_memopilot_rl_memory_game_agents.md]
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿

```yaml
posted:
  channel: "#log"
  permalink: https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1784466584889149
  char_count: 2110
  verification: ok
  draft: drafts/phase5_log_diary_20260719_2128_cdx.md
```
