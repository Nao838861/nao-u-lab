# log_cdx Cycle Staging — 2026-06-25 23:43

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
(Phase 1 が書き込む)

2026-06-25T23:44+09:00 log_cdx:
- Slack pending: directives 0 件、broadcasts 0 件。
- 既存確認: `memory/raw/web_research/` と直近 candidate / atom を確認。`GUI Agents for Continual Game Generation`、`GameCraft-Bench`、`PTCG-Bench`、`OmniGameArena`、`Playtesting Process for Ultra Small Teams`、`Flavors of Challenge`、`Developing Large Procedural Systems`、The Verge の GDC AI 記事は既存 candidate または atom があったため、新規候補化は避けた。
- 追加 candidate: `memory/shared_reads_candidates/20260625_gdc2026_intelliscene_multi_agent_scene_layout.md`。GDC 2026 の Tencent Games AI セッション。multi-agent 3D scene placement を、要求解析、scene graph、geometric solver、visual guidance、asset retrieval へ分ける production tool 候補として収集。

## Phase 2: 分析
(Phase 2 が書き込む)

2026-06-25T23:48+09:00 log_cdx:
```yaml
total_candidates: 1
pass: []
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260625_gdc2026_intelliscene_multi_agent_scene_layout.md
    reason: "production tool としての分解軸は有用だが、現時点では GDC セッション紹介断片が中心で、評価内容と実運用結果が不足しているため Phase 3 投稿には追加資料が必要。"
stale_reviewed: []
```

## Phase 3: Shared-reads 投稿
(Phase 3 が書き込む)

2026-06-25T23:52+09:00 log_cdx:
```yaml
posted: []
skipped:
  - candidate: memory/shared_reads_candidates/20260625_gdc2026_intelliscene_multi_agent_scene_layout.md
    reason: "Phase 2 gate_decision が postpone。pass candidate がないため Phase 3 投稿対象外。"
    action: postpone
```

## Phase 3b: Shared-reads 自己フィードバック
(Phase 3b が書き込む)

2026-06-26T00:01+09:00 log_cdx:
```yaml
self_feedback:
  selected:
    id: sr-1782391911-bb47542f2b
    source_ts: "1782391911.564979"
    title: "lmgame-Bench: How Good are LLMs at Playing Games?"
    reason: "lmgame-Bench is relevant because an LLM/agent playtest result can mix visual input, state representation, memory/reflection, prompt variance, and contamination from design/spec notes. The useful action is to treat the harness as a diagnostic tool: name the input condition and scaffold before reading score, fun, or quality signals."
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
    summary: "Added a reversible probe for the next playable diff / AI playtest harness / headless-browser agent run: name the evaluation input condition first, then separate perception/memory/reasoning scaffold, seed, prompt variance, random baseline, and known-rules contamination from score or fun/quality judgment."
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

2026-06-26T00:18+09:00 log_cdx:
```yaml
cleaned:
  - "memory/MEMORY.md: UTF-8 明示読みで代表語 probe を実施。記憶/ゲーム設計/敵パターンは取得可、評価軸は現index本文に出現なし。source file破損ではない。"
  - "memory/MEMORY.md: markdown link は 0 件。inline command の `python tools/memory_ingest.py` を broken link 扱いしないことを確認。"
  - "memory/atoms.jsonl: 2523 rows、JSON parse error 0、duplicate id 0、exact duplicate content 0。"
  - "memory/raw/: 227 files / 84,167,022 bytes。30日以上 mtime が動いていない raw は 91 files。今回はアーカイブ候補として記録のみ。"
  - "memory/shared_reads_candidates/: status 内訳 posted=347, ready_to_post=7, postponed=290, failed=105, needs_review=13。README.md は candidate ではないため missing status 1 件をissue扱いしない。"
  - "shared-reads title canonical index audit: unindexed duplicate title group 11 件を確認。posted/failedのみのgroupは再評価queueから外す前提で扱う。"
  - "slack inbox: directives pending 0、broadcasts pending 0。handled更新対象なし。"
issues:
  - id: ISS-20260626-STALE-CANDIDATES
    description: "postponed/needs_review のうち stale_after <= 2026-06-25 の candidate が 55 件残っている。mtime や filename date ではなく stale_after 優先で見ると、再評価・明示保持・fail降格の判断待ちが溜まっている。"
    severity: medium
    evidence: "memory/shared_reads_candidates/*.md; lifecycle audit: stale_due_count=55, status_counts posted=347 ready_to_post=7 postponed=290 failed=105 needs_review=13"
    source_file_status: "UTF-8 read ok。frontmatterのstatus/stale_afterは取得可能。"
    display_or_tooling_status: "none"
    why_blocks_game_memory: "期限切れcandidateが多いと、Phase 2が古い候補と新規収集を同じ温度で扱いやすく、次のゲーム制作に効く外部知見の再評価導線が薄まる。"
  - id: ISS-20260626-DUP-TITLE-QUEUE-NOISE
    description: "memory/shared_reads_title_canonical_index.jsonl 未登録の duplicate title group が残っている。多くはpostponedのみだが、ready_to_post/postponed混在のgroupがあり、Phase 2の再評価queueを濁す可能性がある。"
    severity: low
    evidence: "tools/audit_shared_reads_title_duplicates.py --unindexed-only --limit 20: 11 groups; mixed example: 20260529_slm_dynamic_game_content_generation.md + 20260614_slm_dynamic_game_content.md, status_counts postponed=1 ready_to_post=1"
    source_file_status: "UTF-8 read ok。candidate frontmatterとcanonical indexは読み取り可能。"
    display_or_tooling_status: "none"
    why_blocks_game_memory: "同一タイトルの候補が別状態で残ると、posted/failedを除外する判断や、どれをゲーム制作の参照元にするかが手作業依存になる。"
  - id: ISS-20260626-DISPLAY-MOJIBAKE-PROBE
    description: "PowerShell経由の最初の代表語probe出力が文字化けし、UTF-8 source破損のように見える表示経路ノイズが出た。Unicode escapeで再確認するとsource fileは壊れていなかった。"
    severity: low
    evidence: "memory/MEMORY.md representative probe: 記憶=True, ゲーム設計=True, 敵パターン=True, 評価軸=False by UTF-8 read with escaped literals"
    source_file_status: "memory/MEMORY.md source is UTF-8 readable。評価軸は文字化けではなく現indexに語が存在しないだけ。"
    display_or_tooling_status: "PowerShell/tool output path can mojibake Japanese probe strings; audit should prefer escaped literals or UTF-8-aware scripts."
    why_blocks_game_memory: "表示経路の文字化けをsource破損と誤認すると、MEMORY.mdの不要な再生成・手修復に流れ、実際の記憶整理時間を奪う。"
recommendation:
  needs_design: false
  priority_issues: []
stale_review_batch:
  - path: "memory/shared_reads_candidates/20260517_asgardbench_interactive_planning.md"
    status: postponed
    stale_after: "2026-06-16"
    priority_reason: "duplicate title groupで同系candidateがもう1件あり、視覚接地interactive planningはゲームAI評価導線に近い。"
    recommended_review_action: reevaluate_in_phase2
  - path: "memory/shared_reads_candidates/20260515_textquests_llm_text_games.md"
    status: postponed
    stale_after: "2026-06-14"
    priority_reason: "duplicate title groupかつTextQuestsはLLMゲーム評価系で、lmgame-Bench自己フィードバック後の比較材料になる。"
    recommended_review_action: reevaluate_in_phase2
  - path: "memory/shared_reads_candidates/20260525_textquests_llm_video_games.md"
    status: postponed
    stale_after: "2026-06-24"
    priority_reason: "同一TextQuests groupの新しい候補。片方だけで判断すると重複状態が残るため、上記と合わせて統合判断する。"
    recommended_review_action: reevaluate_in_phase2
  - path: "memory/shared_reads_candidates/20260515_game_master_llm_slang_learning_rpg.md"
    status: postponed
    stale_after: "2026-06-14"
    priority_reason: "duplicate title group。RPG/role-play設計に関係するが、後続candidateのstale_afterは未到来なので旧候補のfailまたは明示保持判断を先に行う。"
    recommended_review_action: fail
  - path: "memory/shared_reads_candidates/20260515_ink_splotch_cocreative_game_designer.md"
    status: postponed
    stale_after: "2026-06-14"
    priority_reason: "duplicate title group。co-creative game designer系は制作記憶と近いが、古い候補がqueueに残っているため明示判断が必要。"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
