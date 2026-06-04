# log_cdx Cycle Staging — 2026-06-04 22:58

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
(Phase 1 が書き込む)

### 2026-06-04T23:18+09:00 log_cdx Phase 1
- Slack lifecycle: `slack_directives.jsonl` / `slack_broadcasts.jsonl` に pending なし。
- 最近 atom / 既存 candidate 確認: GameDevBench、GameUIAgent、LLM playability、Lap、MIMIC-Py、GenAI persona、Agentic PCG、Runtime PCG、HDPCG、WCRL は既存候補または投稿済み重複として確認。
- 収集 candidate: `memory/shared_reads_candidates/20260604_reward_shaping_semantically_correct_levels.md` — PCGRL で designer constraints を reward shaping として入れ、Zelda Gym level の semantic correctness を狙う RLC 2025 Workshop 論文。

## Phase 2: 分析
(Phase 2 が書き込む)

### 2026-06-04T23:20+09:00 log_cdx Phase 2
```yaml
total_candidates: 1
pass: []
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260604_reward_shaping_semantically_correct_levels.md
    reason: "PCGRL/reward shaping の適用軸は明確だが、現メモだけでは shaping function、比較条件、評価結果の具体性が不足し、4000字級の残すべき概要に直行できない。"
```

## Phase 3: Shared-reads 投稿
(Phase 3 が書き込む)

### 2026-06-04T23:31+09:00 log_cdx Phase 3
```yaml
posted: []
skipped: []
notes:
  - "Phase 2 staging の pass は 0 件。postpone 判定の candidate は品質ゲートを尊重し、#shared-reads へ投稿しない。"
```

### 2026-06-05T03:37+09:00 log_cdx Phase 3
```yaml
posted:
  - candidate: GPT/memory/shared_reads_candidates/20260605_hieravisvr_motion_centric_vr_playtesting.md
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780598219435869"
    char_count: 4255
skipped: []
```

## Phase 3b: Shared-reads 自己フィードバック
(Phase 3b が書き込む)

### 2026-06-04T23:48+09:00 log_cdx Phase 3b
```yaml
self_feedback:
  selected:
    id: sr-1780578127-b13e1414fd
    source_ts: "1780578127.649089"
    title: "SkillOpt: Executive Strategy for Self-Evolving Agent Skills (Microsoft Research, 2026-05)"
    reason: "Nao_u 共有由来で、skill.md を trainable external state として扱う視点は Codex の skills / rules / memory 運用に直結する。ただし直近で MUSE-Autoskill 由来の lifecycle probe と selection shadowing metric がすでに入り、同じ領域の probe が増えすぎる危険があるため、重複確認を優先した。"
  scores:
    relevance: 3
    actionability: 2
    evidence: 3
    non_redundancy: 1
    risk_control: 2
    reversibility: 3
    total: 13
  decision: defer
  change:
    summary: "none; reviewed state のみ更新。SkillOpt の text learning rate / validation gate / rejected-edit buffer は既存の probe-20260604-skill-lifecycle-promotion-gate と probe-20260527-selection-shadowing-metric に吸収できるため、新規 probe や恒久ルールは追加しない。"
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

### 2026-06-04T23:59+09:00 log_cdx Phase 4a
```yaml
cleaned:
  - "memory/MEMORY.md: UTF-8 明示読みで index 参照を確認。Markdown link は 0 件で broken link なし。代表語 probe は 記憶=True / ゲーム設計=True / 敵パターン=False / 評価軸=False。後者 2 件は exact phrase 不在で、source 文字化けではない。"
  - "memory/atoms.jsonl: 2118 rows。JSON parse error 0、duplicate id 0。処理系での lifecycle/content fold は MEMORY.md 上 191 件。"
  - "memory/raw/: mtime 30 日超の raw file は 0 件。今回 archive 対象なし。"
  - "memory/shared_reads_candidates/: status 内訳 posted=179 / ready_to_post=4 / postponed=148 / failed=55 / needs_review=15 / missing=11。30 日超の postponed / needs_review は 0 件。"
  - "inbox lifecycle: slack_directives.jsonl / slack_broadcasts.jsonl は pending 0。handled 化が必要な pending はなし。"
issues:
  - id: ISS-20260604-4A-001
    description: "atoms.jsonl に exact title+excerpt 重複が 45 群、link+title 重複が 61 群ある。特に 2026-05-12 前後の shared-reads 補正版や external research 候補が複数 atom として残っており、raw atom 層では同一内容 fold がまだ正規化されていない。"
    severity: medium
    evidence: "memory/atoms.jsonl rows 831-875 付近の '[Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版' 重複群、rows 916-946 付近の '[Codex external research] 日記前検索...' 系重複群。MEMORY.md は folded by lifecycle/content metadata: 191 と表示。"
    source_file_status: "UTF-8 JSONL として parse error 0。ID 重複は 0。source 破損ではなく、同一内容 atom が複数 ID で残る lifecycle/正規化上の問題。"
    display_or_tooling_status: "memory_recall.py と MEMORY.md 生成側には一部 fold 表示があるが、atoms.jsonl raw 直読スクリプト群では重複露出の余地がある。PowerShell 経路の日本語 literal は一度 '?' 化したが、Unicode escape probe で source UTF-8 は確認済み。"
    why_blocks_game_memory: "過去のゲーム制作・shared-reads の同一内容が複数候補として出ると、次の制作時に『前に何を学んだか』より『どの重複を読むか』へ認知コストが流れ、重要な教師データや評価軸への到達が遅くなる。"
  - id: ISS-20260604-4A-002
    description: "MEMORY.md の Game Task Entry Points は英語 tag 主体で、ユーザー/作業者が日本語の exact phrase で探す導線が弱い。今回の代表語 probe では '敵パターン' と '評価軸' が MEMORY.md から直接取得できなかった。"
    severity: low
    evidence: "memory/MEMORY.md Game Task Entry Points: enemy-pattern / px-evaluation / impact-feel / headless-eval など。UTF-8 probe: 記憶=True、ゲーム設計=True、敵パターン=False、評価軸=False。"
    source_file_status: "UTF-8 明示読みで日本語本文は取得可能。source 破損なし。exact phrase が index に未収録。"
    display_or_tooling_status: "none"
    why_blocks_game_memory: "次のゲーム制作で日本語の課題語から記憶を探す時、enemy-pattern や px-evaluation という tag を知らないと該当 atom に届きにくい。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-20260604-4A-001
```

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

### 2026-06-05T00:18+09:00 log_cdx Phase 4b
```yaml
designs:
  - issue_id: ISS-20260604-4A-001
    problem_restatement: "atoms.jsonl / per-file atoms に同一内容の atom が複数 ID で残っており、recall や MEMORY.md 生成では一部 fold できても、raw 直読スクリプト群では重複が露出し続ける。削除ではなく canonical 関係を明示して、ゲーム制作時の記憶探索で『同じ内容を何度も読む』コストを下げる必要がある。"
    alternatives:
      - name: "canonical overlay index"
        sketch: "重複群を削除せず、canonical_id / duplicate_ids / reason / evidence_hash を持つ軽量 overlay index として管理する。共通 loader は overlay を読んで canonical view を返し、raw atom は監査用に残す。"
        pros:
          - "append-only 原則と per-file .md 移行方針に合う"
          - "raw atom を消さないので誤 fold 時の復旧が容易"
          - "既存スクリプトを段階的に共通 loader へ寄せられる"
        cons:
          - "overlay と frontmatter / atoms.jsonl の同期規約が増える"
          - "最初は raw 直読スクリプトが残り、効果が部分的になる"
          - "canonical 判定の根拠を雑にすると別内容まで fold する危険がある"
        migration_cost: medium
      - name: "frontmatter lifecycle 正本化"
        sketch: "per-file .md の group_id / canonical_id / superseded_by を正本にし、atoms.jsonl は legacy として読まない方向へ寄せる。重複判定は各 atom frontmatter に直接書き込む。"
        pros:
          - "既に決定済みの per-file 移行と最終形が一致する"
          - "Obsidian でも canonical 関係が見えやすい"
          - "Phase D の atoms.jsonl retire に近づく"
        cons:
          - "Phase D 前の直読スクリプト群が残る現状では移行範囲が広い"
          - "多数ファイル更新になり、誤編集時の差分確認が重い"
          - "atoms.jsonl dual-write 期間の同期ずれを起こしやすい"
        migration_cost: high
      - name: "display-only fold 継続"
        sketch: "memory_recall.py と MEMORY.md 生成側の fold 表示だけを維持し、raw atom 層や直読スクリプトの重複には触れない。"
        pros:
          - "実装変更が最小"
          - "誤 fold による情報欠落が起きない"
          - "現状の recall 体験は大きく壊れない"
        cons:
          - "Phase 4a の問題である raw 直読スクリプト群の重複露出が残る"
          - "重複が増えるほど MEMORY.md 以外の調査コストが増える"
          - "per-file 移行の canonical_id / group_id を活かせない"
        migration_cost: low
    recommended: "canonical overlay index"
    recommended_reason: "raw atom を削らずに canonical view を足すだけなら、失敗時は overlay を無効化して戻せる。frontmatter 正本化は最終形として自然だが、現時点では atoms.jsonl 直読スクリプトがまだ多く、いきなり多数ファイルへ canonical 情報を書き込むより、overlay で判定根拠を蓄積してから Phase D へ寄せる方が移行距離と失敗コストの釣り合いがよい。"
    decision: introduce
    decision_reason: "Phase 4a の priority_issue は medium severity で、既に MEMORY.md 上に 191 件の fold 対象が見えている。放置するとゲーム制作時の記憶探索で同一内容の再読が増える一方、overlay 方式なら可逆で小さく導入できるため、次の Phase 4c で最小導入する価値がある。"
    outline_for_4c:
      - "canonical overlay の保存場所と schema を 1 つ決める"
      - "既存の lifecycle/content fold 結果から初期 overlay を生成する手順を用意する"
      - "共通 atom loader が canonical view と raw view を選べるようにする"
      - "atoms.jsonl 直読スクリプトのうち Phase D 前提で重要なものから 1-2 本だけ canonical view へ寄せる"
      - "検証として raw 件数、canonical 件数、fold 件数、代表的な重複群の canonical_id を staging に記録する"
```

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
