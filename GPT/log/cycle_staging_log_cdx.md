# log_cdx Cycle Staging — 2026-05-15 15:13

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
2026-05-15T15:15+09:00 log_cdx Phase 1 収集メモ:

- pending確認: `memory/slack_directives.jsonl` / `memory/slack_broadcasts.jsonl` とも pending 0 件。
- 既存確認: `memory/raw/web_research/results.jsonl`、`memory/slack_recent_ingest.jsonl`、`memory/shared_reads_candidates/` を確認。`2603.07101` と `2403.02454` は既に candidate 化済みのため重複作成なし。
- 追加 candidate:
  - `memory/shared_reads_candidates/20260515_snappable_meshes_3d_map_pcg.md` - 既製 mesh piece と connector 制約による 3D map PCG。designer control と navigability feedback の候補。
  - `memory/shared_reads_candidates/20260515_llm_npc_cognitive_load_double_edged.md` - LLM-NPC が autonomy を上げる一方、cognitive load / usability / trust に負荷を生む randomized user study。
  - `memory/shared_reads_candidates/20260515_context_aware_npc_panoramic_images.md` - panoramic image + semantic segmentation + scene graph JSON で NPC dialogue に環境文脈を渡す手法。

2026-05-15T17:14+09:00 log_cdx Phase 1:

- pending 確認: `memory/slack_directives.jsonl` / `memory/slack_broadcasts.jsonl` とも pending なし。
- 既存確認: `memory/raw/web_research/results.jsonl`、最近の `memory/atoms.jsonl`、`memory/shared_reads_candidates/` を確認。既存候補と明確に重なるものは追加対象から外した。
- 収集候補:
  - `memory/shared_reads_candidates/20260515_llm_design_pillars_spine.md` — design pillars を LLM と人間の mixed-initiative workflow で扱う SPINE 論文。
  - `memory/shared_reads_candidates/20260515_multiverse_language_conditioned_level_blending.md` — 複数ゲームのレベル構造を shared representation で混ぜる text-to-level / PCG 論文。
  - `memory/shared_reads_candidates/20260515_game_design_is_generative_design.md` — game design と generative design を接続し、procedural gameplay system を扱う AIIDE 論文。
  - `memory/shared_reads_candidates/20260515_pixie_code_level_mechanic_generation.md` — Unity project 上で code-level mechanic を生成・テストする Pixie 論文。
  - `memory/shared_reads_candidates/20260515_world_gen_quest_line_dependency_pipeline.md` — RPG 生成を world / NPC / quest へ分解する dependency-driven prompt pipeline 論文。

## Phase 2: 分析
```yaml
total_candidates: 3
pass:
  - memory/shared_reads_candidates/20260515_snappable_meshes_3d_map_pcg.md
  - memory/shared_reads_candidates/20260515_llm_npc_cognitive_load_double_edged.md
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260515_context_aware_npc_panoramic_images.md
    reason: "着想と適用先は良いが、評価指標・比較条件・失敗例が候補メモ上では薄く、単独投稿前に追加読解が必要。"
```

2026-05-15T17:21:41+09:00 log_cdx Phase 2:
```yaml
total_candidates: 5
pass:
  - memory/shared_reads_candidates/20260515_llm_design_pillars_spine.md
  - memory/shared_reads_candidates/20260515_game_design_is_generative_design.md
  - memory/shared_reads_candidates/20260515_pixie_code_level_mechanic_generation.md
  - memory/shared_reads_candidates/20260515_world_gen_quest_line_dependency_pipeline.md
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260515_multiverse_language_conditioned_level_blending.md
    reason: "shared representation と level blending の着想は強いが、候補メモ上では評価指標・データセット・失敗条件が薄く、Phase 3 前に追加読解が必要。"
```

## Phase 3: Shared-reads 投稿
```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260515_snappable_meshes_3d_map_pcg.md
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778826283429469"
    char_count: 3492
  - candidate: memory/shared_reads_candidates/20260515_llm_npc_cognitive_load_double_edged.md
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778826411891459"
    char_count: 4143
skipped: []
notes:
  - "1件目は PowerShell stdin 経由の初回投稿が文字化けしたため、同一 ts を chat.update で UTF-8 blocks 本文へ差し替え済み。分割投稿はしていない。"
```

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1778675653-a5059880b1
    source_ts: "1778675653.815939"
    title: "Externalization in LLM Agents: A Unified Review"
    reason: "Memory / Skills / Protocols / Harness Engineering の境界整理が、Phase 3b の主目的であるルール肥大化の抑制と直結するため。特に Memory→Skill 昇格境界を、恒久ルール追加ではなく次回の昇格判断前 probe に落とせる。"
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
    summary: "memory/directive/skill/protocol を恒久化・昇格する前に、episodic/semantic/skill/protocol のどの段階か、反復実行証拠があるか、既存ルールと重複しない小 probe で済むかを確認する active probe を追加した。"
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
cleaned: []
issues:
  - id: ISS-4A-20260515-01
    description: "atoms.jsonl は ID 重複や JSON 破損はないが、同一リンク・補正版・再投稿が複数 atom として並ぶグループが多い。現状の lifecycle/content fold は MEMORY.md 表示上の圧縮には効いているが、原文リンク単位・ゲーム制作テーマ単位の導線としては散在が残る。"
    severity: medium
    evidence: "memory/atoms.jsonl: rows=1152, duplicate_ids=0, duplicate_source_ts=0, exact title/trigger/excerpt duplicate groups=38, same-linkset groups=112。例: http://arxiv.org/abs/2605.03482v2 は sr-1778535120-82ea7a1005 / sr-1778535738-ed839f9805 / sr-1778536137-c07e04d08a / sr-1778536160-392329fd76 の 4 atom に分散。"
    why_blocks_game_memory: "次のゲーム制作で特定手法や論文を探す時、同じ題材の再投稿・補正版・観察メモが横並びに返り、どれが canonical な学びで、どれが補足・失敗・再評価なのかを判断する負荷が残る。"
  - id: ISS-4A-20260515-02
    description: "リンクを持たない atom が 294 件あり、Slack 会話・作業ログ由来の知見が原文、制作タスク、後続の一般化ノウハウへ接続しないまま残りやすい。"
    severity: low
    evidence: "memory/atoms.jsonl: no_links=294, no_tags=0。Tag Entry Points は broad tag が中心で、link/source を持たない atom の回収導線は主に全文検索と broad tag に依存している。"
    why_blocks_game_memory: "ゲーム X の制作中に得た判断や失敗が、ゲーム Y の開始時に『同種の制作状況』として再発見されにくい。原文リンクがない atom は特に、判断根拠や前後文脈への戻り道が弱い。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-4A-20260515-01
```

## Phase 4b: 仕組み検討 (条件起動)
```yaml
designed_at: "2026-05-15T15:40+09:00"
selected_issues:
  - ISS-4A-20260515-01
designs:
  - issue_id: ISS-4A-20260515-01
    problem_restatement: "同じ論文・記事・Slack 議論に由来する atom が、再投稿・補正版・観察メモとして複数残ること自体は履歴として有用。ただし recall や game_memory_task_lens から見ると、同一題材の canonical な学び、補足、失敗、再評価の関係が index 化されておらず、次の制作時に『どれを起点に読むか』を毎回人間/LLM が判定し直している。"
    alternatives:
      - name: "A. canonical_topic_groups index"
        sketch: "既存 atom は削除せず、リンク正規化キーと任意の topic_key で同一題材グループを束ねる軽量 index を追加する。各グループに canonical_atom、supporting_atoms、superseded_atoms、game_memory_tags、notes を持たせ、recall 表示や task lens の入口に使う。"
        pros:
          - "履歴 atom を保持したまま、読む起点だけを安定させられる。"
          - "同一 linkset groups=112 の問題に直接効き、arXiv v2/v3 や Slack 再投稿にも拡張しやすい。"
          - "失敗時も index を無視すればよく、既存 dual-write / per-file atom 仕様への影響が小さい。"
        cons:
          - "canonical_atom の選定基準を誤ると、古い理解を入口として固定する危険がある。"
          - "link を持たない atom にはそのままでは効きにくく、別途 topic_key の手当てが必要。"
          - "index 更新の責務を曖昧にすると、また stale な索引が増える。"
        migration_cost: medium
      - name: "B. atom lifecycle field expansion"
        sketch: "各 atom に canonical_of / supersedes / supplement_to / revision_of のような関係フィールドを追加し、関係性を atom 本体へ埋め込む。per-file frontmatter と atoms.jsonl の両方に同じメタデータを持たせる。"
        pros:
          - "関係情報が atom と一緒に移動するため、個別 atom を読んだ時に文脈が見える。"
          - "将来 atoms.jsonl retire 後も per-file markdown 上で Obsidian 的に扱いやすい。"
          - "canonical 判定以外の補足・反証・再評価も表現しやすい。"
        cons:
          - "dual-write 中の全 loader / writer へ影響し、移行範囲が広い。"
          - "既存 1152 atom への backfill が重く、Phase 4c の小さな導入に向かない。"
          - "メタデータ更新のたびに atom 本体差分が増え、履歴汚染が起きやすい。"
        migration_cost: high
      - name: "C. recall-time duplicate folding only"
        sketch: "memory_recall や MEMORY.md 生成時に、normalized links/title/content hash で近い atom を動的に畳み、代表だけを表示する。永続 index は増やさない。"
        pros:
          - "永続データ構造を増やさず、既存の fold 思想に近い。"
          - "誤った canonical 固定を避け、都度最新 atom を代表にしやすい。"
          - "導入範囲が recall 表示に閉じるなら比較的軽い。"
        cons:
          - "『なぜこの atom が代表か』という判断が残らず、次サイクルへ設計知見が蓄積しにくい。"
          - "ゲーム制作テーマ単位の導線や task lens には再利用しづらい。"
          - "link なし atom や Slack 議論の補足関係には効きが弱い。"
        migration_cost: low
    recommended: "A. canonical_topic_groups index"
    recommended_reason: "問題の中心は atom の重複削除ではなく、同一題材の読み始めを安定させること。A は既存 atom を触らずに canonical 導線を足せるため失敗時の戻しが軽く、Phase 4c で小さく始められる。B は最終形としてはきれいだが dual-write 全体に波及して重い。C は軽いが、今回必要な『ゲーム制作テーマ単位の導線』が残らない。"
    decision: introduce
    decision_reason: "Phase 4a の priority issue は medium severity で、同一 linkset groups=112 と具体例があり、現状の表示 fold だけでは制作時の再利用負荷が残る。既存データを破壊しない外付け index なら、まず 1-3 グループだけ手動/半自動 seed して効果を確認できる。"
    outline_for_4c:
      - "新規 index の置き場所と形式を最小化して決める。候補: memory/atoms/canonical_topic_groups.jsonl または memory/canonical_topic_groups.jsonl。"
      - "1 レコードの必須フィールドを group_id / normalized_link_key / topic_label / canonical_atom / supporting_atoms / superseded_atoms / game_memory_tags / rationale / updated_at に絞る。"
      - "Phase 4a の arXiv 2605.03482v2 例を seed 1 件として登録し、既存 atom 本体は変更しない。"
      - "README か staging に、index は削除ではなく recall/task lens の入口補助であり、canonical は固定真実ではなく更新可能な代表であると明記する。"
      - "実装後の smoke は JSONL parse と canonical_atom が既存 atom id に存在することの確認に留める。"
```

## Phase 4c: 導入 (条件起動)
```yaml
implemented:
  - issue_id: ISS-4A-20260515-01
    files_changed:
      - path: memory/atoms/canonical_topic_groups.jsonl
        change: created
      - path: memory/atoms/README.md
        change: modified
      - path: log/cycle_staging_log_cdx.md
        change: modified
    summary: "Phase 4b recommended の canonical_topic_groups index を最小導入し、arXiv 2605.03482v2 / MEMSAD の重複 atom 群を seed 1 件として登録した。既存 atom 本体は変更していない。"
    partial: false
migrations:
  - what: "新規 JSONL index の seed 追加のみ。既存 atoms.jsonl / per-file atom への移行・backfill はなし。"
    affected: "memory/atoms/canonical_topic_groups.jsonl"
verification:
  - "JSONL parse OK: rows=1。canonical_atom / supporting_atoms / superseded_atoms が既存 atom id に存在することを確認。"
  - "memory_recall smoke OK: `python tools\\memory_recall.py \"MEMSAD memory poisoning canonical\" --limit 3 --compact --no-log` が例外なく完了し、対象 canonical atom `sr-1778536137-c07e04d08a` が結果に含まれた。"
```

## Phase 5: 日記投稿
```yaml
posted:
  channel: "#log"
  permalink: "https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1778827302694399"
  ts: "1778827302.694399"
  char_count: 2237
  verification: "ok"
notes:
  - "本文は .tmp/phase5_log_diary_20260515_1513.md に UTF-8 保存してから `python tools\\post_slack_message_file.py --channel \"#log\" --file .tmp\\phase5_log_diary_20260515_1513.md --delete-on-fail` で投稿。PowerShell pipe / stdin 経由の日本語送信は使っていない。"
  - "Slack API history 検証は ok。chat.getPermalink は手元の api_call(JSON POST) 経由では invalid_arguments になったため、channel id と ts から Slack permalink 形式で記録した。"
```
