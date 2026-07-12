# log_cdx Cycle Staging — 2026-07-12 15:28

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260712_revengebench_behavioral_policy_recovery.md` — 5 ゲーム・75 ポリシーを対象に、観察と custom opponent probe から未知のゲーム AI を実行可能コードへ復元する RevengeBench。
- inbox 確認: `slack_directives.jsonl` / `slack_broadcasts.jsonl` ともに pending 0 件。
- 参照元: 2026-07-12 14:51 取得の `memory/raw/web_research/results.jsonl` と arXiv 原文。Phase 1 のため品質判定・採否判断は未実施、Slack 投稿なし。

## Phase 2: 分析

```yaml
total_candidates: 1
pass: []
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260712_revengebench_behavioral_policy_recovery.md
    reason: "posted duplicate title sibling: memory/shared_reads_candidates/20260626_revengebench_behavioral_policy_recovery.md; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782430090951209"
stale_reviewed: []
```

- terminal-title preflight: canonical index には未収録だが、mixed duplicate queue と candidate 群で同一 title / URL の posted sibling を確認したため、本文の品質評価による pass 判定には進まず duplicate として閉じた。
- Slack 投稿・新規収集・記憶階層の改修は行っていない。

## Phase 3: Shared-reads 投稿

```yaml
posted: []
skipped:
  - candidate: memory/shared_reads_candidates/20260712_revengebench_behavioral_policy_recovery.md
    reason: "Phase 2 で gate_decision: pass になっていない。既投稿の同一タイトル・URL sibling（memory/shared_reads_candidates/20260626_revengebench_behavioral_policy_recovery.md、Slack ts=1782430090.951209）があるため重複投稿を回避"
    action: postpone
```

- Phase 2 の `pass` は 0 件。投稿条件を満たす対象がないため、`#shared-reads` への投稿、candidate frontmatter の posted 更新、Slack API 呼び出しは行っていない。

## Phase 3b: Shared-reads 自己フィードバック
(Phase 3b が書き込む)

## Phase 4a: 整理 + 問題抽出

```yaml
cleaned:
  - "memory/MEMORY.md を validate_memory_index.py と UTF-8 明示読みで監査。index section と per-file atom index は一致し、代表語 probe（記憶 / ゲーム設計 / 敵パターン / 評価軸）も取得できた。broken index entry は 0 件。"
  - "memory/atoms.jsonl を memory_health.py と build_atom_duplicate_groups.py --check で監査。2672 atoms、normalized content duplicate は raw 40群、lifecycle fold 後の recall-visible は3群。duplicate cluster index は現行で、明示的 contradicts frontmatter は0件だった。"
  - "memory/raw/ の30日超無更新ファイルを抽出。slack_archive/shared-reads.jsonl、raw/sync_state.txt、web_research 配下の旧 phase3 PDF/TXT 群がarchive候補だが、原文保持と参照関係を壊さないため本Phaseでは移動していない。"
  - "shared-reads lifecycle 内訳を確認: posted 47 / ready_to_post 0 / postponed 77 / failed 6 / needs_review 10。mixed duplicate queueを再生成（72群）、stale triage queueを2026-07-12基準で再生成（上限到達の50件、したがって残backlogは50件以上）。"
  - "slack_directives.jsonl / slack_broadcasts.jsonl は pending 0件。close gateを満たして新たにhandledへ更新すべき行はなかった。"
issues:
  - id: ISS-4A-20260712-01
    description: "同一shared-reads titleがterminal candidateの存在後も新規candidateとして繰り返し流入し、mixed duplicate groupが72群まで残っている。今サイクルもposted済みRevengeBenchの6件目が生成された。"
    severity: high
    evidence: "memory/shared_reads_mixed_duplicate_queue.jsonl（72 rows）; memory/shared_reads_candidates/20260626_revengebench_behavioral_policy_recovery.md（posted）; memory/shared_reads_candidates/20260712_revengebench_behavioral_policy_recovery.md（postponed）; audit_shared_reads_title_duplicates.py の未index同題群"
    source_file_status: "UTF-8 sourceは正常。candidate frontmatterが正本として読め、RevengeBench groupは posted 1 / needs_review 1 / postponed 4。"
    display_or_tooling_status: none
    why_blocks_game_memory: "既読・既投稿のゲームAI知見が新規候補として再提示され、Phase 2の評価枠と検索上位を消費する。過去知見を次ゲームへ転送する前に重複判定へ時間を使い、未読の異質な手法を探索する余地を狭める。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-4A-20260712-01
stale_backlog:
  queue_rows: 50
  queue_limit_reached: true
  minimum_remaining_backlog: 50
  handed_to_phase2: 5
stale_review_batch:
  - path: memory/shared_reads_candidates/20260527_dependency_driven_rpg_generation.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "age_days=16。mixed duplicate groupで、依存関係付きRPG生成pipelineはgame transfer valueがhighだが評価詳細が不足。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260527_pokemon_battle_agents_llm.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "age_days=16。mixed duplicate groupでgame transfer valueはhighだが、出典時系列の確認が必要。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260527_procedural_personas_mcts_playtesting.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "age_days=16。mixed duplicate group。プレイスタイル別headless評価への転用価値が高い。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260527_runtime_pcg_autonomous_agents.md
    status: postponed
    stale_after: "2026-06-26"
    priority_reason: "age_days=16。mixed duplicate group。runtime PCG検証は現行headless評価に近いが実験結果の抽出が薄い。"
    recommended_review_action: reevaluate_in_phase2
  - path: memory/shared_reads_candidates/20260529_agent_island_multiagent_games.md
    status: postponed
    stale_after: "2026-06-28"
    priority_reason: "age_days=14。mixed duplicate group。multi-agent game benchmarkの転用価値が高く、queue上位。"
    recommended_review_action: reevaluate_in_phase2
```

## Phase 4b: 仕組み検討 (条件起動)

```yaml
designs:
  - issue_id: ISS-4A-20260712-01
    problem_restatement: "posted 済み候補が同一 title group に存在しても、open sibling が残る限り canonical index が terminal group として確定しない。そのため生成入口では既知タイトルを拒否できず、Phase 2 まで流入してから重複と判定する後段依存になっている。"
    alternatives:
      - name: "案A: terminal-dominance index と生成前 preflight"
        sketch: "candidate frontmatter を正本のまま保ち、canonical title index は group 全件の閉鎖ではなく posted sibling の存在を terminal evidence として記録する。candidate を保存する各入口で title_key と source URL を照合し、既投稿一致なら新規ファイルを作らず skip evidence を実行ログへ残す。"
        pros:
          - "重複を Phase 2 より前で止め、評価枠と stale queue を消費しない"
          - "既存の title_key 正規化、canonical index、posted permalink を再利用できる"
          - "候補本文や過去 status を一括変更せず、sidecar は再生成可能に保てる"
        cons:
          - "candidate 生成入口を列挙し、全入口に同じ preflight を接続する必要がある"
          - "同題の改訂論文や別内容を誤って止めないよう URL 不一致時の扱いが必要"
          - "既存 mixed group 72 群は別途 backfill 方針が要る"
        migration_cost: medium
      - name: "案B: posted title tombstone registry を別設"
        sketch: "posted 時に title_key、URL、permalink を append-only registry へ書き、生成入口は registry だけを照合する。canonical index と mixed queue は現状の意味を維持する。"
        pros:
          - "入口判定の意味が単純で高速"
          - "既存 canonical index の terminal-group 定義を変更しない"
          - "posted 履歴を append-only に近い形で監査できる"
        cons:
          - "posted 情報の sidecar が二重化し、同期不整合の新しい原因になる"
          - "既存 posted candidate からの backfill と継続更新経路が必要"
          - "title index と registry のどちらを見るべきか利用側が迷う"
        migration_cost: medium
      - name: "案C: mixed group の open sibling を一括 terminal 化"
        sketch: "posted sibling を含む group の postponed / needs_review を failed または duplicate_terminal に更新し、group 全件を閉じて現行 canonical index に載せる。以後は既存 terminal preflight を使う。"
        pros:
          - "現行 index の定義と読み手をほぼ変えずに済む"
          - "既存 mixed queue を短期間で縮小できる"
          - "候補一覧だけで group の閉鎖状態が見える"
        cons:
          - "candidate frontmatter の大量変更となり、元の評価履歴と保留理由を曖昧にする"
          - "同題だが改訂・別内容の候補まで機械的に閉じる危険がある"
          - "新規生成そのものは止めないため、定期的な一括閉鎖が残る"
        migration_cost: high
    recommended: "案A: terminal-dominance index と生成前 preflight"
    recommended_reason: "既存の正規化と sidecar 構造に最も近く、重複を評価前ではなく生成前に止められる。誤判定時も candidate 正本を壊さず index 再生成と入口条件の修正で戻せる。title 一致だけで全面拒否せず、同一 URL または posted evidence が強い場合は自動 skip、URL 不一致は review に送る二段階判定にすれば、改訂版を失うコストも抑えられる。"
    decision: introduce
    decision_reason: "今サイクルにも同題の6件目が生成され、後段 preflight だけでは流入コストを解消できていない。既存部品を流用でき、失敗時の復旧も sidecar 再生成で済むため Phase 4c で小さく導入できる。"
    outline_for_4c:
      - "canonical title index の行仕様を、posted sibling が1件でもある groupについて terminal evidence、canonical path、source URL、permalink、status counts を保持できる形に拡張する"
      - "title_key 一致に加えて URL の canonicalized 一致を返す共通 preflight 契約を定め、posted URL 一致は skip、title のみ一致かつ URL 不一致は review とする"
      - "shared-reads candidate を作成する入口を列挙し、ファイル書込み直前に同一 preflight を通す。skip 時は candidate を作らず実行ログへ根拠を残す"
      - "既存 posted candidate から index を再生成し、RevengeBench を含む mixed group が terminal evidence として取得できることを確認する"
      - "dry-run / fixture で、同一 title・同一 URL は拒否、同一 title・別 URL は review、未登録 title は生成継続となる境界を検証する"
      - "既存 mixed group は履歴保持のため一括 status 変更せず、index で再流入を止めた後に通常の stale lifecycle で漸減させる"
```

## Phase 4c: 導入 (条件起動)

```yaml
implemented:
  - issue_id: ISS-4A-20260712-01
    files_changed:
      - path: tools/shared_reads_title_index.py
        change: modified
      - path: tools/build_shared_reads_title_canonical_index.py
        change: modified
      - path: tools/shared_reads_duplicate_preflight.py
        change: created
      - path: tools/test_shared_reads_duplicate_preflight.py
        change: created
      - path: phases/phase1_collect.md
        change: modified
      - path: memory/shared_reads_candidates/README.md
        change: modified
      - path: memory/shared_reads_title_canonical_index.jsonl
        change: modified
    summary: "posted sibling を mixed group の terminal evidence として index 化し、title と canonicalized URL による生成前 skip/review/continue 契約を追加した。"
    partial: false
migrations:
  - what: "既存 candidate から canonical title index を再生成。candidate lifecycle frontmatter は変更しない。"
    affected: "memory/shared_reads_title_canonical_index.jsonl の派生行のみ"
verification:
  - "境界 unittest: 同一 title・同一 URL=skip、同一 title・別 URL=review、未登録 title=continue"
  - "RevengeBench mixed group が terminal_evidence と posted URL を保持すること"
  - "tools/memory_recall.py の smoke test"
```

## Phase 5: 日記投稿
(Phase 5 が書き込む)

## Phase 3b (2026-07-12 15:00 JST)

```yaml
self_feedback:
  selected:
    id: sr-1782740436-f6507c50b6
    source_ts: "1782740436.215749"
    title: "For Honor: ML automation for production bot development"
    reason: "継続更新されるゲームでのbot制作短縮と、強さ・believability・難易度・production integrationを分ける知見が、現在のゲーム評価運用へ直接つながるため。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 2
    non_redundancy: 0
    risk_control: 2
    reversibility: 3
    total: 13
  decision: reject
  change:
    summary: "既存の固定seed比較、bot役割分類、人間較正境界、非happy-path回帰、hand-coded baseline比較の各probeと重複するため、新規probeは追加せずreview stateだけ更新した。"
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```
