# log_cdx Cycle Staging — 2026-05-15 06:58

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
2026-05-15T06:59:16+09:00 log_cdx Phase 1 追記:

- `memory/shared_reads_candidates/20260515_fly_fail_fix_iterative_game_repair.md` - RL agent のプレイログを LMM designer に渡し、Flappy Bird 系の mechanics parameter を反復修正する自動 game repair 候補。
- `memory/shared_reads_candidates/20260515_klpeg_incremental_game_playtesting.md` - update log と Knowledge Graph から、ゲーム差分に合わせた test case を作る incremental playtesting 候補。
- `memory/shared_reads_candidates/20260515_smart_coverage_aware_game_playtesting.md` - AST 差分由来の code coverage と gameplay intent を hybrid reward にして RL agent を誘導する coverage-aware playtesting 候補。

Slack/directive 確認メモ:
- `memory/slack_directives.jsonl` には pending が残っているが、Phase 1 指示に従い対応判断は後フェーズへ送る。
- `memory/slack_broadcasts.jsonl` には pending broadcast が複数残っているが、Phase 1 では確認のみ。

## Phase 2: 分析
```yaml
total_candidates: 3
pass:
  - memory/shared_reads_candidates/20260515_fly_fail_fix_iterative_game_repair.md
  - memory/shared_reads_candidates/20260515_smart_coverage_aware_game_playtesting.md
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260515_klpeg_incremental_game_playtesting.md
    reason: "KG/playtesting の骨格は良いが、候補内情報だけでは schema・評価詳細が薄く、4000字概要が抽象論に寄りやすい"
```

## Phase 3: Shared-reads 投稿
```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260515_fly_fail_fix_iterative_game_repair.md
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778796436646579"
    char_count: 3565
  - candidate: memory/shared_reads_candidates/20260515_smart_coverage_aware_game_playtesting.md
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778796437903149"
    char_count: 3958
skipped: []
```

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1778782280-cadfbbc95a
    source_ts: "1778782280.911589"
    title: "[Codex shared-reads] VeRO: An Evaluation Harness for Agents to Optimize Agents"
    reason: "Nao_u が直近で VeRO 投稿を評価し、必要なら行動に適用してほしいと broadcast した。agent-as-code の改善を内面評価ではなく外部 harness に寄せる視点が、今の定時サイクルの失敗型に直結するため。"
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
    summary: "次回 game-dev / agent-improvement サイクルで、成果を外から再実行できる diff・smoke・測定ログに接続しているか確認する 3 問 probe を state に追加した。恒久 directive は増やしていない。"
    files:
      - memory/shared_reads_self_feedback_state.json
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```

## Phase 4a: 整理 + 問題抽出
```yaml
cleaned:
  - "memory/slack_broadcasts.jsonl の先頭 UTF-8 BOM を除去し、JSONL として全行 parse 可能にした。"
  - "memory/MEMORY.md の index 行にあるローカル参照を確認し、broken link は 0 件だった。"
  - "memory/raw/ と memory/shared_reads_candidates/ に 30 日以上未更新の対象はなかった。"
issues:
  - id: ISS-001
    description: "atoms.jsonl に正規化本文が同一の atom 群が 38 組残っている。id/source_ts の重複はないが、再投稿・補正版や同一内容の複数投稿が raw atom として並存している。"
    severity: medium
    evidence: "memory/atoms.jsonl: sr-1778535120-82ea7a1005 と sr-1778535738-ed839f9805 など。検査結果: duplicate normalized contents count=38, duplicate ids=0, duplicate source_ts/channel=0。"
    why_blocks_game_memory: "検索時に同じ知見が複数 atom として出て、どれが最新版・採用版か判断する負荷が増える。ゲーム制作中に手法や評価軸を引く時、重複がノイズになって次の一手への接続が遅くなる。"
  - id: ISS-002
    description: "inbox 系に pending が残っており、記憶システム改善・ゲーム制作フィードバック・broadcast が同じ pending キューに混在している。受領 atom は存在するが、処理完了と判断できないものが多い。"
    severity: medium
    evidence: "memory/slack_directives.jsonl: pending 2 件。memory/slack_broadcasts.jsonl: pending 8 件。例: broadcast-1778778369-9d4ef2d700, broadcast-1778787090-64f705c94c。"
    why_blocks_game_memory: "Nao_u の steering が、次のゲーム制作で読むべき導線・構造問題・単発返信待ちのどれなのか分かれない。結果として重要な指摘が pending に沈み、制作サイクルへ接続されない。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-001
    - ISS-002
```

## Phase 4b: 仕組み検討 (条件起動)
```yaml
designed_at: "2026-05-15T07:23:00+09:00"
scope:
  selected_priority_issues:
    - ISS-001
    - ISS-002
  note: "Phase 4b は設計のみ。staging 以外のファイル編集・コード実装は行わない。"
designs:
  - issue_id: ISS-001
    problem_restatement: "同じ正規化本文を持つ atom が別 id として残り、検索・recall 時に同一知見が複数候補として出る。削除を急ぐより、最新版・採用版・補正版の関係を表示側で畳める lifecycle 情報が不足していることが問題。"
    alternatives:
      - name: "recall 時の正規化本文 fold"
        sketch: "memory_recall / index 生成時に normalized_content_hash を計算し、同一 hash の atom は代表 1 件だけ表示する。代表は lifecycle metadata、source_ts の新しさ、shared-reads 投稿かどうかで決める。raw atom は残す。"
        pros:
          - "既存データを消さずに検索ノイズを減らせる"
          - "Phase D の per-file 移行とも相性がよく、index.jsonl に hash を足すだけで拡張できる"
          - "失敗しても表示側の fold を外せば戻せる"
        cons:
          - "正規化が強すぎると、似ているが別文脈の atom を畳む恐れがある"
          - "代表選定ルールを誤ると、古い補正版が前面に出る"
          - "原因データ自体は残るため、保守対象は減らない"
        migration_cost: medium
      - name: "重複 atom への supersedes metadata 追記"
        sketch: "重複検出結果を見て、古い atom に superseded_by、代表 atom に supersedes を付ける。recall は lifecycle metadata を見て既存の display fold に乗せる。"
        pros:
          - "人間が意味関係を確認するため誤 fold が少ない"
          - "既存の lifecycle fold の考え方に沿う"
          - "どの投稿が補正版かを後から追跡できる"
        cons:
          - "38 組を人手確認する必要があり、定時サイクルでは重い"
          - "今後の重複発生を自動で防げない"
          - "metadata 付与漏れがあると同じ問題が再発する"
        migration_cost: medium
      - name: "atoms.jsonl の物理 dedupe"
        sketch: "同一正規化本文の古い atom を削除し、代表 atom だけを残す。per-file 側も同時に削除する。"
        pros:
          - "データ量と検索ノイズが直接減る"
          - "recall 側の実装変更が少ない"
        cons:
          - "raw 記録の監査性を壊す可能性がある"
          - "再投稿・補正版の時系列文脈が失われる"
          - "per-file 移行中の現状では破壊的で戻しにくい"
        migration_cost: high
    recommended: "recall 時の正規化本文 fold"
    recommended_reason: "問題は raw 記録の存在ではなく、検索面で同一知見が複数表示されること。表示・index 層の fold なら失敗時の戻しが軽く、Phase D の per-file 移行を邪魔しない。物理削除は監査性を失うため今は避ける。"
    decision: introduce
    decision_reason: "38 組という規模は放置すると recall 品質に継続的に効くが、削除まで踏み込む必要はない。まず reversible な表示 fold を導入する価値がある。"
    outline_for_4c:
      - "normalized_content_hash の扱いを index/recall 層に置くか、既存 atoms_fileformat helper に置くか確認する"
      - "同一 hash グループの代表選定ルールを source_ts 新しさ + lifecycle metadata 優先で定義する"
      - "recall / MEMORY index 表示で fold 済み件数と代表 id が分かるようにする"
      - "既存 38 組で smoke test し、fold 前後の recall 件数と代表 id を staging に記録する"
  - issue_id: ISS-002
    problem_restatement: "Slack directive と broadcast の pending が、作業指示・議論依頼・ゲーム制作フィードバック・単なる受領待ちを同じ status で抱えている。pending が多いこと自体より、次に何を実行すべきか判断できる分類と完了条件がないことが問題。"
    alternatives:
      - name: "pending triage fields の追加"
        sketch: "既存 JSONL に action_type、domain、next_step、done_condition、owner_hint を追加する。status は pending/handled のまま維持し、処理時に分類フィールドを見て phase に割り振る。"
        pros:
          - "既存ファイル形式を壊さず段階導入できる"
          - "pending の意味が可視化され、Phase 4a の問題抽出にも使える"
          - "Slack 投稿本文を再解釈する頻度を減らせる"
        cons:
          - "過去 pending への backfill が必要"
          - "分類ミスがあると誤った phase に流れる"
          - "status 遷移の運用が曖昧なままだと効果が半減する"
        migration_cost: medium
      - name: "separate queue files"
        sketch: "directive、broadcast、game-feedback、memory-improvement などの用途別 JSONL に分ける。各 phase は自分の queue だけを見る。"
        pros:
          - "用途ごとの責務が明確になる"
          - "Phase ごとの入力が単純になる"
          - "件数監視がしやすい"
        cons:
          - "検出・受領・ingest スクリプトの変更範囲が広い"
          - "同じ投稿が複数用途を持つ場合に分裂しやすい"
          - "移行中に二重処理や見落としが起きやすい"
        migration_cost: high
      - name: "pending digest markdown のみ追加"
        sketch: "JSONL は触らず、定時サイクルの最初に pending を人間向け markdown digest にまとめる。Codex は digest を読んで手動判断する。"
        pros:
          - "実装が軽く、既存処理への副作用が小さい"
          - "人間が pending の全体像を把握しやすい"
        cons:
          - "機械的な phase 割り振りや完了判定には使いにくい"
          - "digest が増えるだけで、根本の status 混在は残る"
          - "読まれない digest になるとノイズが増える"
        migration_cost: low
    recommended: "pending triage fields の追加"
    recommended_reason: "現状の JSONL と status を保ったまま意味分類を足せるため、失敗時のコストが低い。separate queue は最終形としては明快だが、今の pending 10 件前後に対して変更範囲が大きすぎる。digest だけでは完了条件が残らない。"
    decision: introduce
    decision_reason: "pending が制作サイクルへ接続されない問題は、次回以降も繰り返す可能性が高い。まず分類フィールドと完了条件を持たせ、Phase 4a が同じ issue を再検出した時に具体的な処理単位へ落とせるようにする。"
    outline_for_4c:
      - "pending レコードに追加する triage schema を最小定義する: action_type, domain, next_step, done_condition, triage_status"
      - "既存 pending 10 件前後を read-only に一覧化し、分類案を staging に出す"
      - "自動 backfill する範囲と、人手確認に残す範囲を分ける"
      - "handled 判定時に handling_note へ done_condition の達成理由を書く運用を追加する"
decision_summary:
  introduce:
    - ISS-001
    - ISS-002
  postpone: []
  no_change: []
```

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
