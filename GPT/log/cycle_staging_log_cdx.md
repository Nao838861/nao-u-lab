# log_cdx Cycle Staging — 2026-06-25 19:43

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
- `memory/shared_reads_candidates/20260625_compact_social_intelligence_agents.md` - COMPACT: 協力/競争混在の社会ゲームで LLM agent の発話・予測・行動 trace を評価する候補。
- `memory/shared_reads_candidates/20260625_triex_multiview_llm_reasoning_games.md` - TriEx: 隠し情報ゲームで self-reasoning / belief state / oracle audit を分けて LLM agent の説明を検査する候補。
- `memory/shared_reads_candidates/20260625_sode_social_dynamics_llm_agents.md` - SODE: reciprocity / reputation / group dynamics で LLM agent の社会的協力の崩れ方を観測する候補。

確認メモ: `slack_directives.jsonl` / `slack_broadcasts.jsonl` の pending は 0 件。既存 candidate には GDC/Meta 系の 2026-06-25 追加分と、ARES / Mindgames / Orak / RuleSmith / Goal Playable Patterns などの重複候補があったため、未収集の arXiv 一次情報を優先して拾った。

## Phase 2: 分析
```yaml
total_candidates: 3
pass:
  - memory/shared_reads_candidates/20260625_triex_multiview_llm_reasoning_games.md
  - memory/shared_reads_candidates/20260625_sode_social_dynamics_llm_agents.md
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260625_compact_social_intelligence_agents.md
    reason: "発話・予測・行動 trace の着想は有用だが、候補本文だけでは評価設計と主要結果の粒度が足りず、Phase 3 前に一次論文確認が必要。"
stale_reviewed: []
```

## Phase 3: Shared-reads 投稿
```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260625_triex_multiview_llm_reasoning_games.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782384847126309
    char_count: 3822
  - candidate: memory/shared_reads_candidates/20260625_sode_social_dynamics_llm_agents.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782384827546149
    char_count: 3698
skipped: []
notes:
  - "PowerShell stdin 経由の初回 TriEx 投稿が文字化けしたため、ts=1782384716.732459 を削除し、UTF-8 Python ファイル経由で再投稿した。"
```

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1782355145-1ae16ff426
    source_ts: "1782355145.871629"
    title: "Market Design for AI: Beyond the Copyright Binary"
    reason: "外部記事・生成素材・データセット的な記憶取り込み・プロトタイプ素材を扱う機会が増えている一方、既存 probe は品質評価・協調・状態保持に寄っており、変換後も creator/source/provenance を消さない観点が薄い。恒久ルールではなく、次回行動の前に contribution role と再利用境界を確認する一時 probe に留める。"
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
    summary: "外部素材や人間生成コンテンツを memory / prototype / reusable workflow input に変換する前に、contribution role、source/provenance、可逆な再利用アクションを確認する probe を追加した。"
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  probe:
    id: probe-20260625-contribution-boundary-provenance
    questions:
      - "次の shared-read candidate、game asset/reference use、generated-asset prompt、dataset-like memory ingest、または外部素材に着想を得た prototype feature の前に、contribution role を citation-only / design inspiration / reusable reference / transformed asset / training/evaluation data / unknown のどれかとして名付けたか。"
      - "圧縮で anonymous free material にせず、URL、author/title、license/terms uncertainty、generation prompt、local file provenance、Slack permalink など再利用判断に必要な source signal を残したか。"
      - "prototype、memory atom、Slack post、reusable workflow に影響する場合、attribution、local-only candidate storage、generated/original material への置換、human review 依頼、rights/provenance unverified 明記のような可逆 action を選んだか。"
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```

## Phase 4a: 整理 + 問題抽出
```yaml
cleaned:
  - "git branch/status/fetch を確認。master は origin/master と ahead/behind なし。開始時点の既存差分は定時サイクル由来の memory/log 更新が多く、Phase 4a では staging のみ更新対象にした。"
  - "slack_directives.jsonl / slack_broadcasts.jsonl は pending 0 件。handled 化する対象なし。"
  - "memory/MEMORY.md を UTF-8 明示読みし、代表語 probe 記憶 / ゲーム設計 / 敵パターン / 評価軸 の取得を確認。source file 破損なし。"
  - "memory/MEMORY.md の index 行リンクは実ファイル参照として broken なし。backtick 内の python command 2 件は path ではないため broken link と扱わない。"
  - "memory/atoms.jsonl は 2517 行、JSON parse error 0、id 重複 0。title/trigger/excerpt の exact text hash では 40 group の重複候補を確認。"
  - "memory/raw/ は mtime 30 日以上のファイル 91 件を確認。主に memory/raw/slack_archive/shared-reads.jsonl と 2026-05 中旬の web_research / phase3_sources / PDF 抽出物。Phase 4a では移動しない。"
  - "memory/shared_reads_candidates lifecycle 内訳: posted 345 / postponed 288 / failed 104 / ready_to_post 7 / needs_review 13。postponed/needs_review で stale_after <= 2026-06-25 は 55 件。posted/failed は再評価 queue から除外扱い。"
  - "shared-reads title duplicate audit --unindexed-only --limit 20 を実行。未 index の duplicate title group が複数あり、posted と postponed/failed が混在する group を確認。"
issues:
  - id: ISS-001
    description: "shared_reads_candidates の duplicate title group が canonical index 未登録のまま残っており、posted と postponed が混在する候補群が Phase 2 の再評価 queue を濁す。例: GUI Agents for Continual Game Generation は 7 件中 posted 3 / postponed 4、Agentic PCG は 6 件中 posted 3 / postponed 3、RuleSmith は failed 1 / posted 3 / postponed 2。"
    severity: medium
    evidence: "python tools\\audit_shared_reads_title_duplicates.py --unindexed-only --limit 20; memory/shared_reads_title_canonical_index.jsonl 未登録 group"
    source_file_status: "source files は UTF-8 読みで正常。candidate frontmatter の status/stale_after は取得可能。"
    display_or_tooling_status: "none"
    why_blocks_game_memory: "同じ論文や記事が posted 済みなのに postponed として再浮上し、Phase 2 が新規候補と既処理候補の区別に時間を使う。次のゲーム制作に効く未読資料より、既読資料の再判定が優先されやすくなる。"
  - id: ISS-002
    description: "atoms.jsonl は id 重複こそないが、title/trigger/excerpt の exact text hash で 40 group の重複候補がある。補正版再投稿や external research / broadcast 受領の同文が別 atom として残り、現行 MEMORY.md の lifecycle/content fold 3 件だけでは吸収しきれていない。"
    severity: medium
    evidence: "memory/atoms.jsonl; examples: sr-1778535120-82ea7a1005 と sr-1778535738-ed839f9805、sr-1778579739-88cc6ddf7b と sr-1778717441-50a934c67b"
    source_file_status: "JSONL parse error 0、id 重複 0、excerpt 欠落 0。source file 自体は正常。"
    display_or_tooling_status: "none"
    why_blocks_game_memory: "同じ内容が複数 atom として recall に出ると、ゲーム制作時の判断材料が重複で水増しされ、別観点の lesson や teacher data に到達しにくくなる。"
  - id: ISS-003
    description: "shared_reads_candidates に lifecycle frontmatter の欠落が少数残る。status 欠落 1 件、postponed/needs_review 相当で stale_after 欠落 3 件。"
    severity: low
    evidence: "memory/shared_reads_candidates/20260518_biped_rational_design_postmortem.md; memory/shared_reads_candidates/20260529_godot_30day_narrative_prototype.md; memory/shared_reads_candidates/20260529_stealth_lighting_readability.md; memory/shared_reads_candidates/20260529_text_animation_player_attention.md"
    source_file_status: "UTF-8 読みで frontmatter は取得可能だが必須 key が欠けている。"
    display_or_tooling_status: "none"
    why_blocks_game_memory: "stale_after ベースの少数再評価に乗らず、古い候補が期限管理から外れる。影響は限定的。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-001
    - ISS-002
stale_review_batch:
  - path: "memory/shared_reads_candidates/20260516_pcg_serious_games_drl_evaluation.md"
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "automated evaluation / PCG / serious games で headless 評価や game-design recall に直結する。"
    recommended_review_action: reevaluate_in_phase2
  - path: "memory/shared_reads_candidates/20260517_orak_diverse_video_game_agents.md"
    status: postponed
    stale_after: "2026-06-16"
    priority_reason: "diverse video game agents benchmark はゲーム制作時の自己評価・agent 評価導線に近い。"
    recommended_review_action: reevaluate_in_phase2
  - path: "memory/shared_reads_candidates/20260517_pcg_survey_llm_integration.md"
    status: postponed
    stale_after: "2026-06-16"
    priority_reason: "PCG survey + LLM integration は個別候補の上位整理として使える可能性がある。"
    recommended_review_action: reevaluate_in_phase2
  - path: "memory/shared_reads_candidates/20260516_player_experience_resonance_chi2026.md"
    status: postponed
    stale_after: "2026-06-15"
    priority_reason: "player experience / resonance は面白さ自己判定と feedback teacher data の抽象化に接続しやすい。"
    recommended_review_action: reevaluate_in_phase2
  - path: "memory/shared_reads_candidates/20260517_access_profiles_game_accessibility.md"
    status: postponed
    stale_after: "2026-06-16"
    priority_reason: "accessibility infrastructure は UI/操作設計の見落としを減らす外部視点として有用。"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)
```yaml
designed:
  - issue_id: ISS-001
    problem_restatement: "shared_reads_candidates で同一タイトルの posted / postponed / failed が canonical index 未登録のまま並び、Phase 2 が既処理資料を新規再評価候補として拾いやすい。問題は候補本文の破損ではなく、処理済み代表と派生候補の関係が queue 前に見えないこと。"
    alternatives:
      - name: "A. canonical title group の限定 backfill"
        sketch: "既存の audit_shared_reads_title_duplicates 出力を根拠に、posted を含む duplicate title group だけ shared_reads_title_canonical_index に代表候補と sibling 状態を登録する。Phase 2 は既存 index を参照し、posted 代表がある group の postponed/failed を通常 queue から除外する。"
        pros:
          - "既存の canonical index という置き場を使うため、構造変更が小さい。"
          - "posted 済み資料の再浮上を直接減らせる。"
          - "候補ファイル本文を削除・改変せず、判断履歴を残せる。"
        cons:
          - "title exact match に依存するため、表記揺れや改題には弱い。"
          - "posted を含まない重複群は別途扱いが必要。"
          - "index 更新の根拠ログを残さないと、後から代表選定理由が追いにくい。"
        migration_cost: low
      - name: "B. Phase 2 queue 時の動的 duplicate suppression"
        sketch: "Phase 2 が candidate frontmatter と title hash を毎回集計し、posted sibling がある候補をその場で suppress する。canonical index は作らず、実行時の状態から判定する。"
        pros:
          - "index backfill を待たず、今後の重複混入を自動で抑えられる。"
          - "candidate の現状態を毎回見るため、status 変更に追従しやすい。"
          - "実装箇所が Phase 2 queue に集中する。"
        cons:
          - "毎回の判定が暗黙化し、なぜ除外されたかが staging 以外に残りにくい。"
          - "Phase 2 の責務が増え、shared-reads 投稿判定と inventory 整理が混ざる。"
          - "同名だが内容差分がある候補を落とすリスクがある。"
        migration_cost: medium
      - name: "C. 各 candidate frontmatter に duplicate_of / canonical_title_id を付ける"
        sketch: "重複候補それぞれの frontmatter に canonical 参照を直接書き、候補単位で代表関係を明示する。Phase 2 は frontmatter だけを読んで queue から除外する。"
        pros:
          - "ファイル単体を見た時に重複関係が分かる。"
          - "表記揺れや同名別物も人手で細かく表現できる。"
          - "将来 Obsidian などで辿りやすい。"
        cons:
          - "既存 candidate の大量編集になりやすい。"
          - "代表変更時に複数ファイルを更新する必要がある。"
          - "frontmatter の lifecycle 欠落問題と混ざると修正範囲が広がる。"
        migration_cost: high
    recommended: "A. canonical title group の限定 backfill"
    recommended_reason: "既に canonical index と audit tool があり、問題の中心も posted を含む未登録 group に限定されている。失敗時も index 追記を見直せば戻せるため、candidate 本文へ広く手を入れる案よりコストが低い。Phase 2 の動的 suppress は有効だが、まず根拠を index に残す方が運用上説明しやすい。"
    decision: introduce
    decision_reason: "Phase 4a の evidence が十分で、posted 済み候補の再浮上という実害が明確。低コストで重複 queue を減らせるため、次の Phase 4c で限定導入する。"
    outline_for_4c:
      - "audit_shared_reads_title_duplicates の未登録 duplicate group から、posted を含む group を小さく抽出する。"
      - "shared_reads_title_canonical_index に代表 candidate、sibling path、status 構成、根拠日時を追記する方針で更新する。"
      - "Phase 2 の再評価 queue が canonical index の posted sibling group を除外または lower priority にできるか、既存導線を確認して必要最小限だけ調整する。"
      - "staging に suppress 件数と対象 title を記録する。"
  - issue_id: ISS-002
    problem_restatement: "atoms.jsonl には id 重複や JSON 破損はないが、同文 atom が別 id で残り recall の結果を水増ししている。削除すべき raw 記録ではなく、recall や MEMORY.md 生成時に同一内容を一つの判断材料として扱うための折りたたみ単位が不足している。"
    alternatives:
      - name: "A. recall 表示時の duplicate fold 強化"
        sketch: "title / trigger / excerpt の normalized hash を使い、memory_recall や MEMORY.md 更新時に同文 group を一件として表示する。raw atom は残し、表示上だけ representative と siblings を出す。"
        pros:
          - "既存の非破壊方針と Phase C の normalized_content_hash fold に近い。"
          - "recall 汚染をすぐ減らせる。"
          - "atom 本体の削除や移動が不要。"
        cons:
          - "表示時だけの対処なので、他スクリプトが atoms.jsonl を直読すると重複は残る。"
          - "hash 条件が強すぎると近似重複は拾えない。"
          - "代表選定の理由が index として残りにくい。"
        migration_cost: low
      - name: "B. atoms duplicate group sidecar index"
        sketch: "memory/atoms 側に duplicate group index を持ち、group_id、representative atom、sibling ids、hash_basis、first_seen を記録する。recall / health / future dual-read scripts はこの sidecar を参照して fold する。"
        pros:
          - "raw atom を保存したまま、重複関係を永続化できる。"
          - "atoms.jsonl retire 前の dual-read 化にも接続しやすい。"
          - "health check や recall で同じ group を共有できる。"
        cons:
          - "新しい index の保守責務が増える。"
          - "既存スクリプトを段階的に参照対応する必要がある。"
          - "代表 atom の選び方を決めないと、後から揺れる。"
        migration_cost: medium
      - name: "C. duplicate atom の lifecycle alias 化"
        sketch: "per-atom md frontmatter に duplicate_of を付け、重複 atom 自体を代表 atom へ alias する。atoms.jsonl retire 後の Obsidian 互換運用では自然に辿れる。"
        pros:
          - "atom ファイル単位で重複関係が明示される。"
          - "将来 atoms.jsonl を archive した後も参照しやすい。"
          - "人手レビューで近似重複も扱いやすい。"
        cons:
          - "per-file atom の多数編集になり、Phase D 前には重い。"
          - "atoms.jsonl との dual-write 整合が難しい。"
          - "今回の exact duplicate 40 group には過剰な移行になる。"
        migration_cost: high
    recommended: "B. atoms duplicate group sidecar index"
    recommended_reason: "A は最小だが、Phase 4a で問題化しているのは recall だけでなく MEMORY.md や他の直読スクリプトへ重複が漏れる構造。C は理想に近いが atoms.jsonl retire 前には編集範囲が大きい。B は非破壊で永続的な fold 単位を作れ、Phase D の共通 loader 化にも橋をかけられる。"
    decision: introduce
    decision_reason: "exact duplicate group が 40 件あり、今後も external research / Slack ingest で増える見込みがある。raw atom を削除せず sidecar で扱えば、失敗時の撤回コストを抑えながら recall 品質を改善できる。"
    outline_for_4c:
      - "title / trigger / excerpt の normalized hash を basis に、exact duplicate group の sidecar index 仕様を小さく定義する。"
      - "初期 group は Phase 4a で確認した 40 group を対象に、representative は最古または posted evidence が強い atom を選ぶ規則にする。"
      - "memory_recall の表示 fold と memory health 系の重複報告が sidecar を参照できるか、段階導入の順序を決める。"
      - "raw atom と per-file atom は削除せず、sidecar 由来の fold 件数だけ staging に記録する。"
```

## Phase 4c: 導入 (条件起動)
```yaml
implemented:
  - issue_id: ISS-001
    files_changed:
      - path: tools/build_shared_reads_title_canonical_index.py
        change: created
      - path: memory/shared_reads_title_canonical_index.jsonl
        change: modified
      - path: memory/shared_reads_candidates/README.md
        change: modified
    summary: "shared-reads duplicate title group の terminal canonical sidecar を再生成できる builder を追加し、posted/failed を含む 74 title group を index 化した。Phase 2 queue では postponed/needs_review sibling 85 件が terminal group として抑制対象になる。"
    partial: false
  - issue_id: ISS-002
    files_changed:
      - path: tools/build_atom_duplicate_groups.py
        change: modified
      - path: memory/atoms/duplicate_clusters.jsonl
        change: modified
      - path: memory/atoms/duplicate_groups.jsonl
        change: modified
      - path: memory/atoms/canonical_overlay.jsonl
        change: modified
      - path: memory/atoms/README.md
        change: modified
    summary: "atom duplicate sidecar に hash_basis を明示し、canonical overlay を再生成した。raw atom / per-file atom は削除・編集せず、45 group を canonical view で fold できる状態にした。"
    partial: false
migrations:
  - what: "shared_reads_title_canonical_index.jsonl を builder 出力へ移行"
    affected: "duplicate title group 74 行、postponed/needs_review sibling 85 件を Phase 2 stale reevaluation queue から除外可能"
  - what: "atom duplicate sidecar schema に hash_basis を追加"
    affected: "duplicate_clusters.jsonl / duplicate_groups.jsonl / canonical_overlay.jsonl の 45 group。reason counts は normalized_content_hash 40、title_excerpt_exact 5"
verification:
  - "python tools\\build_shared_reads_title_canonical_index.py --check -> shared-reads title canonical index ok: rows=74"
  - "python tools\\audit_shared_reads_title_duplicates.py --unindexed-only --limit 20 -> terminal posted/failed group は残らず、未登録は postponed-only 等の非 terminal group"
  - "python tools\\build_shared_reads_review_queue.py --dry-run --today 2026-06-25 -> records=40"
  - "python tools\\build_atom_duplicate_groups.py --check -> duplicate cluster index ok: clusters=45 overlay_groups=45"
  - "python tools\\memory_health.py --json -> status=warning, errors=[]; canonical_overlay_duplicate_groups=45"
```

## Phase 5: 日記投稿
```yaml
posted:
  channel: "#log"
  draft: log/phase5_diary_20260625_1943.md
  permalink: pending
  char_count: pending
  verification: pending
notes:
  - "Phase 1-4 の staging を材料に、UTF-8 draft file 経由で投稿する。"
```
