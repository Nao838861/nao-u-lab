# log_cdx Cycle Staging — 2026-06-26 07:43

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
(Phase 1 が書き込む)

2026-06-26T07:45:27+09:00 Phase 1 収集メモ:
- `memory/shared_reads_candidates/20260626_mind_studio_executable_world_models.md` — Atari 系の replay から executable world model を合成し、lookahead preview と実環境 rollout を比較する候補。
- `memory/shared_reads_candidates/20260626_promptmn_game_spec_directives.md` — ゲーム制作 prompt を機能要求・非機能要求・検証・trace に分ける pseudo prompting DSL の候補。
- `memory/shared_reads_candidates/20260626_select_to_act_language_guided_rl.md` — 状態に応じて relevant な自然言語 instruction を選ぶ hierarchical RL。bot policy / tutorial hint 分解の候補。

## Phase 2: 分析
(Phase 2 が書き込む)

```yaml
evaluated_at: "2026-06-26T07:50:09+09:00"
total_candidates: 3
pass:
  - "memory/shared_reads_candidates/20260626_mind_studio_executable_world_models.md"
fail: []
postpone:
  - path: "memory/shared_reads_candidates/20260626_promptmn_game_spec_directives.md"
    reason: "仕様分解の用途はあるが、手法の独自性と評価の中身が候補メモだけでは薄い。"
  - path: "memory/shared_reads_candidates/20260626_select_to_act_language_guided_rl.md"
    reason: "instruction selector は有用だが、RL 実験から制作 harness への翻訳が未整理。"
stale_reviewed: []
```

## Phase 3: Shared-reads 投稿
(Phase 3 が書き込む)

```yaml
posted:
  - candidate: "memory/shared_reads_candidates/20260626_mind_studio_executable_world_models.md"
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782428089831069"
    char_count: 4224
skipped: []
```

## Phase 3b: Shared-reads 自己フィードバック
(Phase 3b が書き込む)

```yaml
self_feedback:
  selected:
    id: "sr-1779972076-23523acc99"
    source_ts: "1779972076.823599"
    title: "Boghog bullet identity channels: size/color/motion ladder for shmup readability"
    reason: "既存 probe は projectile speed が何を伝えるかを扱うが、この atom は弾の identity を size/color/motion の複数チャネルで階段化する点に焦点がある。次の shmup/projectile 調整で、難度や polish を単一パラメータへ押し込む癖を小さく抑えるため読む。"
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
    summary: "次回 shmup/projectile/readability 作業用に、弾 identity、size/color/motion channel、identity collision を確認する可逆 probe を state に追加した。恒久ルールや phase prompt は変更していない。"
    files:
      - "memory/shared_reads_self_feedback_state.json"
      - "log/cycle_staging_log_cdx.md"
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```

## Phase 4a: 整理 + 問題抽出
(Phase 4a が書き込む)

```yaml
cleaned:
  - "memory/MEMORY.md を UTF-8 明示読みで確認。代表語 probe: 記憶 / ゲーム設計 / 敵パターン / 評価軸 は取得可能。index 内 atom 参照 50 件は missing 0 件。markdown link は 0 件。"
  - "memory/atoms.jsonl を確認。2527 行、invalid JSON 0、duplicate id 0、duplicate normalized/content hash group 0。title/status の active/superseded 混在は定時系ログ由来の既存パターンとして記録のみ。"
  - "memory/raw/ を確認。mtime 30 日超の raw file は 99 件。今回は archive 移動なし。"
  - "memory/shared_reads_candidates/ lifecycle 内訳: posted 348、ready_to_post 8、postponed 294、failed 106、needs_review 13、status missing 2。postponed/needs_review の stale_after <= 2026-06-26 は 69 件。"
  - "shared-reads title canonical index audit を実行。unindexed duplicate title group は 12 件。posted/failed 混在で再評価 queue を濁す group は今回の上位出力にはなし。"
  - "slack_directives.jsonl / slack_broadcasts.jsonl の pending は 0 件。handled 更新なし。"
issues:
  - id: "ISS-001"
    description: "shared_reads_candidates の stale_after 到来済み postponed/needs_review が 69 件あり、さらに unindexed duplicate title group が 12 件残っている。既存の lifecycle と stale_review_batch で捌ける範囲だが、Phase 2 の再評価対象が古い重複候補で濁る余地がある。"
    severity: "low"
    evidence: "memory/shared_reads_candidates/: status_counts posted=348 ready_to_post=8 postponed=294 failed=106 needs_review=13; stale_after <= 2026-06-26 が 69 件。tools/audit_shared_reads_title_duplicates.py --unindexed-only --limit 20 で duplicate title group 12 件。"
    source_file_status: "source files は UTF-8 読みで監査可能。frontmatter status/stale_after は取得可能。MEMORY.md も UTF-8 probe 成功。"
    display_or_tooling_status: "none"
    why_blocks_game_memory: "Phase 2 が古い重複候補を再読し続けると、直近のゲーム制作に効く候補や playable diff に接続しやすい知見の発見が遅れる。"
recommendation:
  needs_design: false
  priority_issues: []
stale_review_batch:
  - path: "memory/shared_reads_candidates/20260515_textquests_llm_text_games.md"
    status: "postponed"
    stale_after: "2026-06-14"
    priority_reason: "同一 title の 20260525 版も stale_after 到来済み。LLM の text/video game 評価で game-memory との接続可能性が高く、重複統合込みで少数再評価に向く。"
    recommended_review_action: "reevaluate_in_phase2"
  - path: "memory/shared_reads_candidates/20260517_asgardbench_interactive_planning.md"
    status: "postponed"
    stale_after: "2026-06-16"
    priority_reason: "同一系 title の 20260529 版が存在。minimal feedback 下の visual planning は headless/browser evaluation 導線に接続しうるため、片方を残すか fail するかを Phase 2 で判定する価値がある。"
    recommended_review_action: "reevaluate_in_phase2"
  - path: "memory/shared_reads_candidates/20260518_spring_cleaning_gamejam_postmortem.md"
    status: "postponed"
    stale_after: "2026-06-17"
    priority_reason: "同一 URL/title の 20260601 版が存在。gamejam postmortem は制作サイクル改善に接続しうるが、候補として残すなら重複統合が必要。"
    recommended_review_action: "reevaluate_in_phase2"
  - path: "memory/shared_reads_candidates/20260515_multiverse_language_conditioned_level_blending.md"
    status: "postponed"
    stale_after: "2026-06-14"
    priority_reason: "level blending はゲーム制作に近いが古い postponed。候補品質が足りなければ fail、使えるなら現行 game-design 観点で再評価する。"
    recommended_review_action: "reevaluate_in_phase2"
  - path: "memory/shared_reads_candidates/20260515_game_master_llm_slang_learning_rpg.md"
    status: "postponed"
    stale_after: "2026-06-14"
    priority_reason: "RPG 題材だが主目的は slang learning で、現在の game-memory 目的からは遠い可能性が高い。古い postponed の整理候補。"
    recommended_review_action: "fail"
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
