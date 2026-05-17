# log_cdx Cycle Staging — 2026-05-17 18:13

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
2026-05-17T18:14+09:00 log_cdx Phase 1

- pending 確認: `tools/slack_inbox_lifecycle.py pending` で directives / broadcasts とも pending なし。
- 最近の材料確認: `memory/raw/web_research/`, `memory/shared_reads_candidates/`, `memory/atoms.jsonl` tail を確認。既存 candidate は LLM×PCG / evaluation / player experience が多い。
- 追加 candidate:
  - `memory/shared_reads_candidates/20260517_creativegame_mechanic_aware_generation.md` — LLM game generation を mechanic plan / lineage memory / runtime validation / proxy reward で version evolution として扱う arXiv:2604.19926。
  - `memory/shared_reads_candidates/20260517_lap_llm_automatic_playtest.md` — match-3 の snapshot を numeric matrix に変換し、LLM の手選択で automatic playtest する arXiv:2507.09490。
- Slack 投稿: なし。品質判定・採否判断: Phase 1 では未実施。

## Phase 2: 分析
2026-05-17T18:28+09:00 log_cdx Phase 2

```yaml
total_candidates: 2
pass:
  - memory/shared_reads_candidates/20260517_creativegame_mechanic_aware_generation.md
  - memory/shared_reads_candidates/20260517_lap_llm_automatic_playtest.md
fail: []
postpone: []
```

- `20260517_creativegame_mechanic_aware_generation.md`: pass。LLM game generation を mechanic plan / lineage memory / runtime validation / proxy reward に分解でき、v01/v02/v03 の playable diff を機構差分として扱う評価サイクルに接続できる。
- `20260517_lap_llm_automatic_playtest.md`: pass。match-3 に狭いが、snapshot → numeric matrix → LLM move → execution の loop が明確で、grid / puzzle 系の headless playtest に転用できる。

## Phase 3: Shared-reads 投稿
2026-05-17T18:23+09:00 log_cdx Phase 3

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260517_creativegame_mechanic_aware_generation.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779009798720239
    char_count: 4336
  - candidate: memory/shared_reads_candidates/20260517_lap_llm_automatic_playtest.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779009799499429
    char_count: 4195
skipped: []
```

- CreativeGame: 初回投稿で PowerShell stdin 起因の文字化けを検出したため、該当 2 投稿を削除し、UTF-8 script 経由で再投稿。Slack API の conversations.history で本文に日本語が残っていることを確認済み。
- Lap: 同上。1 candidate = 1 message、スレッドなし、分割なし。

## Phase 3b: Shared-reads self feedback
2026-05-17T18:26+09:00 log_cdx Phase 3b

```yaml
self_feedback:
  selected:
    id: sr-1777795540-ff54caa26c
    source_ts: "1777795540.020089"
    title: "karaage0703 houboku engineering and the backup auto-commit incident"
    reason: "Git sync is mandatory after work. If autonomous/scheduled diffs are mixed with the intentional diff, the evidence trail becomes noisy and future recall or rollback gets worse. The current dirty worktree makes this directly relevant, so I selected exactly one atom."
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
    summary: "Added a short probe for the next git sync: separate intentional diffs from scheduler/ingest/backup noise and stage only files touched for the task."
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```

- No permanent rule was added. AGENTS.md already says to stage only files touched by the current work and avoid unrelated changes.
- State now records `reviewed_source_ts: 1777795540.020089` and active probe `probe-20260517-intent-diff-vs-automation-noise`.

## Phase 4a: 整理 + 問題抽出
2026-05-17T18:38+09:00 log_cdx Phase 4a

```yaml
cleaned:
  - "memory/MEMORY.md の index/link を機械確認: 検出リンク 1 件、broken link 0 件。"
  - "memory/atoms.jsonl を検査: rows 1268、JSON 破損 0、id 重複 0、normalized_content_hash 重複 0。"
  - "memory/raw/ を検査: files 70、30日超で動きがない raw 0 件。"
  - "memory/shared_reads_candidates/ を検査: files 121、30日超で動きがない candidate 0 件。"
  - "inbox 系を確認: slack_broadcasts pending 0、slack_directives pending 1。pending の log-cdx-1779008812-261301adff はゲーム制作指示であり、この整理フェーズでは close せず phase_game_start 対象として保持。"
issues:
  - id: ISS-001
    description: "atoms.jsonl に exact content が同一の atom グループが 46 件ある。id 重複ではなく source_ts 違いの再投稿・補正版由来で、normalized_content_hash では fold されていない。"
    severity: medium
    evidence: "memory/atoms.jsonl: sr-1778535120-82ea7a1005 と sr-1778535738-ed839f9805 など、同一 link/content のペアが複数。集計では exact-content duplicate groups=46。"
    why_blocks_game_memory: "次のゲーム制作で recall した時、同じ shared-reads 由来の知見が複数 atom として返り、どれが正本・補正版かの判断が遅れる。game-design タグを含む重複もあり、手法探索のノイズになる。"
recommendation:
  needs_design: true
  priority_issues: [ISS-001]
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

2026-05-17T18:50+09:00 log_cdx Phase 4b

```yaml
designs:
  - issue_id: ISS-001
    problem_restatement: "atoms.jsonl に id は異なるが exact content が同一の atom 群が残っており、recall 時に同じ知見が複数件として見える。現状の normalized_content_hash fold は表示側の救済に近く、重複の存在理由、正本候補、補正版との関係が index として追跡できない。"
    alternatives:
      - name: "recall-only fold 強化"
        sketch: "memory_recall.py の ranking / display だけで exact content group を必ず 1 件に畳む。raw atom はそのまま保持し、表示に duplicates_count と代表 id を出す。"
        pros:
          - "既存データを移動せずに済み、失敗時の影響が recall 表示に限定される。"
          - "Phase C の per-file 移行方針と衝突しにくい。"
          - "短時間でノイズ低減を検証できる。"
        cons:
          - "重複の正本判定や補正履歴は記録されない。"
          - "memory_recall.py 以外の atoms.jsonl 直読スクリプトでは同じ問題が残る。"
          - "なぜ同一内容が増えたかの調査材料が薄い。"
        migration_cost: low
      - name: "duplicate_groups index 追加"
        sketch: "memory/atoms/duplicate_groups.jsonl のような派生 index を作り、content_hash ごとに canonical_id、duplicate_ids、source_ts 範囲、初回検出時刻を記録する。atom 本体は削除せず、recall や health 系が任意参照できる。"
        pros:
          - "raw atom を保持したまま、正本候補と重複群を deterministic に共有できる。"
          - "recall 以外の health / router / post 系にも段階的に接続しやすい。"
          - "将来の atoms.jsonl retire 前に per-file index 側へ移しやすい。"
        cons:
          - "派生 index の更新タイミングと古さ検出ルールが必要になる。"
          - "canonical 判定基準を誤ると補正版より古い投稿を代表にする可能性がある。"
          - "小さいが新しい運用ファイルが増える。"
        migration_cost: medium
      - name: "ingest 時 canonical 化"
        sketch: "memory_ingest.py の dual-write 時点で exact content duplicate を検出し、新規 atom を作らず既存 atom に source_aliases / duplicate_sources を追記する。"
        pros:
          - "将来の重複増加を入口で止められる。"
          - "recall 以外の全利用者が自然に重複削減の恩恵を受ける。"
          - "canonical と由来を atom 本体に持てる。"
        cons:
          - "既存 atom schema への変更が必要で、dual-write 期間の互換性リスクが高い。"
          - "過去データの backfill と ingest の idempotency 検証が必要になる。"
          - "Slack 再投稿・補正版を意図的に別 atom として残したいケースの扱いが難しい。"
        migration_cost: high
    recommended: "duplicate_groups index 追加"
    recommended_reason: "現状の問題は recall ノイズだけでなく、どれが正本または補正版なのかを後から判断できない点にある。raw atom を削除しない派生 index なら失敗時は参照を外すだけで戻せ、Phase C の per-file 移行とも距離が近い。入口 canonical 化は魅力があるが、schema と idempotency への影響が大きく、いまの 46 group への対処としては重い。"
    decision: introduce
    decision_reason: "medium severity だが game-design tag を含む重複が recall の判断材料を曇らせている。Phase 4c では atom 本体を変更せず、まず派生 index と利用規約を導入するのが可逆で妥当。"
    outline_for_4c:
      - "exact content hash または normalized_content_hash ごとの duplicate group を抽出する派生 index の仕様を staging または短い directive に明記する。"
      - "canonical_id は原則として earliest source_ts、ただし title/link/content が同じ補正版候補は latest を preferred_id として併記できる形にする。"
      - "index には content_hash、canonical_id、preferred_id、duplicate_ids、count、source_ts_min、source_ts_max、sample_title、generated_at を持たせる。"
      - "Phase 4c の実装範囲は index 生成と smoke check までに絞り、atom 削除や ingest schema 変更は行わない。"
```

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

2026-05-17T18:38+09:00 log_cdx Phase 4c

```yaml
implemented:
  - issue_id: ISS-001
    files_changed:
      - path: tools/build_atom_duplicate_groups.py
        change: created
      - path: memory/atoms/duplicate_groups.jsonl
        change: created
      - path: memory/atoms/README.md
        change: modified
      - path: log/cycle_staging_log_cdx.md
        change: modified
    summary: "Phase 4b outline 通り、atom 本体を変更せずに normalized_content_hash 単位の duplicate_groups 派生 index を導入。canonical_id は最古 source_ts、preferred_id は最新 source_ts として記録する。"
    partial: false
migrations:
  - what: "memory/atoms/duplicate_groups.jsonl を現行 atoms.jsonl から初回生成"
    affected: "duplicate content groups 38 件。atom 削除・ingest schema 変更・既存 index.jsonl 変更はなし。"
verification:
  - "python tools/build_atom_duplicate_groups.py: wrote memory/atoms/duplicate_groups.jsonl groups=38"
  - "python tools/build_atom_duplicate_groups.py --check: duplicate group index ok: groups=38"
  - "python -m py_compile tools/build_atom_duplicate_groups.py: ok"
  - "python tools/memory_recall.py \"記憶 システム shared-reads\" --limit 3 --compact --no-log: 3 hits"
  - "python tools/memory_health.py --compact: memory_health=warning。既存 warning は repeated title group 未付与と mojibake suspect で、今回の変更起因ではない。"
```

## Phase 5: 日記投稿
2026-05-17T18:39+09:00 log_cdx Phase 5

```yaml
posted:
  channel: "#log"
  permalink: https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1779010794464849
  ts: "1779010794.464849"
  char_count: 2298
  verification: ok
draft_file: .tmp/phase5_log_20260517_1813.md
notes:
  - "本文は UTF-8 draft file 経由で投稿し、Slack API 側の本文検証が ok。"
  - "文字数調整中の over-limit 投稿は削除済み。最終投稿のみ残した。"
```
