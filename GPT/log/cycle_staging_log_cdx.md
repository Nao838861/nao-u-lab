# log_cdx Cycle Staging — 2026-05-31 08:58

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
2026-05-31T09:00+09:00 log_cdx Phase 1:

- pending 確認: `python tools\slack_inbox_lifecycle.py pending` で directives / broadcasts とも 0 件。
- 既存入力確認: 最近の `memory/atoms.jsonl` には Design Skeleton、Intentional Computational Level Design、Open Player Modeling、GUI Agents、headless 評価系が入っていた。候補重複確認では Runtime PCG / GUI Agents / OpenGame / Pixie / PCG Benchmark / Multi-task PCGRL / GameUIAgent は既存候補または投稿済み。
- 収集 candidate:
  - `memory/shared_reads_candidates/20260531_biped_playtesting_game_sketches.md` — BIPED による game sketch から human-playable prototype と machine-analyzable rule system を同時に作る古典的 playtesting 支援。
  - `memory/shared_reads_candidates/20260531_player_experience_design_engineering_process.md` — CoG 2025 の player experience centered game design engineering process。system as-is / as-should-be 差分で PX を計画・検証・改良する候補。
## Phase 2: 分析
2026-05-31T09:02:48+09:00 log_cdx Phase 2:

```yaml
total_candidates: 2
pass:
  - memory/shared_reads_candidates/20260531_biped_playtesting_game_sketches.md
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260531_player_experience_design_engineering_process.md
    reason: "PX 中心の設計工程として適用軸は強いが、候補本文だけでは手法詳細と評価内容が薄く、4000 字概要の材料が足りない。"
```

## Phase 3: Shared-reads 投稿
2026-05-31T09:14:47+09:00 log_cdx Phase 3:

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260531_biped_playtesting_game_sketches.md
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780186465015129"
    char_count: 4497
skipped: []
notes:
  - "chat.postMessage ok; Slack permalink API returned invalid_arguments, so permalink was constructed from channel C0AN2FEHEJJ and ts 1780186465.015129."
```

## Phase 3b: Shared-reads 自己フィードバック
2026-05-31T09:17:57+09:00 log_cdx Phase 3b:

```yaml
self_feedback:
  selected:
    id: sr-1778577943-d2ac83aaed
    source_ts: "1778577943.978429"
    title: "OpenGame / GamED.AI / Agent Skills 3論文 - game_templates_design.mdへの素材"
    reason: "score 18、skills/harness/game-design/agent/operation/evaluation をまたぐ未review atom。外部ベンチや agent-skill framework を Pot/Codex の評価設計へ直輸入する前に、測っている変数が同じかを確認する必要があるため。"
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
    summary: "外部 benchmark / skill framework / harness を採用する前に、外部側の measured variable とローカル側の target variable を照合する一時 probe を state に追加した。"
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
    nearest_existing:
      - probe-20260530-game-agent-attribution-boundary
      - probe-20260530-scaffold-module-delta
      - probe-20260531-template-unit-mapping
    differentiator: "既存 probe は改善原因・scaffold差分・template unit の照合を見る。今回の probe は外部 framework の評価対象変数と Codex/Pot 側の目的変数が一致するかを、採用前に見る。"
```

## Phase 4a: 整理 + 問題抽出
2026-05-31T09:34+09:00 log_cdx Phase 4a:

```yaml
cleaned:
  - "memory/MEMORY.md の Markdown link を確認: links 0 / broken 0。破損リンク修正は不要。"
  - "memory/atoms.jsonl を確認: rows 1916 / duplicate id 0 / duplicate source_ts 0。id レベルの重複整理は不要。"
  - "memory/atoms/index.jsonl を確認: rows 1916 / duplicate id 0 / missing md path 0。per-file atom との参照欠落はなし。"
  - "memory/raw/ を確認: files 135 / 2026-05-01 より古い file 0。30 日超アーカイブ対象はなし。"
  - "memory/shared_reads_candidates/ を確認: files 326 / 2026-05-01 より古い file 0。30 日超の降格対象はなし。"
  - "slack inbox を確認: directives pending 0 / broadcasts pending 0。handled 更新対象はなし。"
issues:
  - id: ISS-4A-20260531-001
    description: "shared_reads_candidates の .md 318 件が status frontmatter を持たず、Phase 2 staging 上の pass/postpone/fail 判定と候補ファイル本体が接続していない。現時点では 30 日超候補は 0 件だが、今後 stale candidate を機械的に fail 降格または明示保持する時に、対象判定が file mtime と記憶頼みになる。"
    severity: medium
    evidence: "memory/shared_reads_candidates/*.md: 326 files; status frontmatter counts: none 318. log/cycle_staging_log_cdx.md Phase 2 は pass/postpone を持つが candidate file に lifecycle が反映されていない。"
    why_blocks_game_memory: "ゲーム制作に使える candidate と、探索段階で残しただけの candidate が同じ平面に残るため、次サイクルの recall や shared-reads 選別で未熟な材料が高品質な導線を押し流す。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-4A-20260531-001
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)
2026-05-31T09:48+09:00 log_cdx Phase 4b:

```yaml
designs:
  - issue_id: ISS-4A-20260531-001
    problem_restatement: "shared_reads_candidates の候補 .md は本文としては残っているが、pass / postpone / fail / posted / stale などの lifecycle が候補本体にない。現在は Phase 2 staging や mtime を読むしかなく、次サイクルの候補選別で「育てる候補」と「探索段階で止める候補」を機械的に分けにくい。"
    alternatives:
      - name: "candidate frontmatter lifecycle"
        sketch: "各 candidate .md の YAML frontmatter に status / last_reviewed_at / last_decision / evidence / next_action を持たせる。Phase 2 と Phase 3 は判定結果を候補本体へ反映し、候補ファイル単体で現在位置を読めるようにする。"
        pros:
          - "Obsidian や rg で候補単体を見た時に状態が即座に分かる。"
          - "candidate の本文・URL・判定履歴が同じ場所に残るため、staging 依存が減る。"
          - "既存の per-file atom 方針と近く、記憶階層の見通しが揃う。"
        cons:
          - "既存 300 件超への backfill が必要。"
          - "Phase 2 / Phase 3 側の write path を触るため、雑に実装すると本文差分が増えやすい。"
          - "複数サイクルが同じ候補を扱う場合、frontmatter 更新競合に注意が必要。"
        migration_cost: medium
      - name: "candidate lifecycle sidecar index"
        sketch: "memory/shared_reads_candidates/index.jsonl のような sidecar に path 単位の status と判定履歴を集約する。candidate .md は本文のまま保ち、Phase 2 は index を読んで selection / stale 判定を行う。"
        pros:
          - "既存 candidate 本文をほぼ変更せず導入できる。"
          - "集計や stale 判定は 1 ファイルを読むだけで速い。"
          - "履歴を追記型にすれば更新競合時の復旧が比較的容易。"
        cons:
          - "候補ファイル単体を開いた時に状態が見えない。"
          - "path rename や削除時に sidecar との不整合が起きる。"
          - "atoms.jsonl 退役方針と同じく、単一 index が新たな source of truth になりやすい。"
        migration_cost: low
      - name: "staging-only lifecycle"
        sketch: "Phase 2 / Phase 3 の staging 記録を正本とし、必要な時だけ直近 staging から候補状態を推定する。candidate .md には手を入れない。"
        pros:
          - "実装変更がほぼ不要。"
          - "現行運用を壊すリスクが低い。"
          - "短期の一回限り判定なら十分。"
        cons:
          - "サイクルを跨いだ候補育成には弱い。"
          - "staging が流れると状態を再構成しづらい。"
          - "Phase 4a が検出した問題を根本的には解かない。"
        migration_cost: low
    recommended: "candidate frontmatter lifecycle"
    recommended_reason: "候補ファイル自体が shared-reads の育成単位なので、状態も同じ単位に置くのが一番読み戻しやすい。sidecar は低コストだが、atoms.jsonl 退役で避けようとしている単一バルク正本を候補側に再導入する形になる。frontmatter 案は backfill と write path の手間があるものの、失敗しても candidate .md の metadata 追加に閉じ、本文や atom 正本を壊さず rollback できる。"
    decision: introduce
    decision_reason: "Phase 4a の issue は候補 lifecycle の正本がないことなので、現状維持や staging-only では次サイクルでも同じ検出になる。candidate frontmatter は既存の per-file 記憶方針と整合し、Phase 4c で小さく導入できる。"
    outline_for_4c:
      - "candidate frontmatter の最小 schema を決める: status / last_reviewed_at / last_decision / evidence / next_action。"
      - "既存 candidate のうち Phase 2 / Phase 3 staging で判定済みのファイルだけを backfill 対象にする。全件一括分類は避ける。"
      - "Phase 2 が pass / postpone / fail を出した時に candidate frontmatter を更新する導線を追加する。"
      - "Phase 3 投稿済み candidate は status: posted と evidence: Slack permalink を残す。"
      - "Phase 4a の cleanup check は status なし件数だけでなく stale / pending / posted の内訳を見る形に変える。"
```

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
