# log_cdx Cycle Staging — 2026-07-20 22:13

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260720_crossfire_adaptive_cover.md` — 有機的な地形と姿勢適応を組み合わせ、固定カバーポイントから離れる adaptive cover の制作事例。
- `memory/shared_reads_candidates/20260720_control_resonant_vision_propagation.md` — 奇抜な世界観と新mechanicの設計意図を、職種横断leadから各teamの局所判断へ伝播させる制作手法。
- inbox確認: `slack_directives.jsonl` / `slack_broadcasts.jsonl` の pending は0件。
- 重複照合: raw最新バッチの AutoBG / RevengeBench は posted-source の同一workを確認したため新規candidate化せず、新規2件はいずれもpreflight `continue`。

## Phase 2: 分析

```yaml
total_candidates: 2
pass:
  - memory/shared_reads_candidates/20260720_control_resonant_vision_propagation.md
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260720_crossfire_adaptive_cover.md
    reason: "設計着想と技術条件は明確だが、プレイテスト等の評価根拠が薄く、約4000字では推測による水増しになる"
stale_reviewed: []
group_actions: []
group_handoff_audit:
  pending_before: 0
  read_ids: []
  resolved_ids: []
  deferred_ids: []
  partial_ids: []
  apply_counts:
    candidates_updated: 0
    already_terminal: 0
  pending_after: 0
duplicate_preflight:
  sidecars_rebuilt: [posted_source, title_canonical, mixed_duplicate]
  sidecars_fresh: true
  continue:
    - memory/shared_reads_candidates/20260720_crossfire_adaptive_cover.md
    - memory/shared_reads_candidates/20260720_control_resonant_vision_propagation.md
```

## Phase 3: Shared-reads 投稿
```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260720_control_resonant_vision_propagation.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784554115343959
    char_count: 4146
skipped: []
```

## Phase 3b: Shared-reads 自己フィードバック
```yaml
self_feedback:
  selected:
    id: sr-1784545923-1e17b5f634
    source_ts: "1784545923.720719"
    title: "Space Rescue Squad — 高速な制作 loop と player-policy coverage を分ける"
    reason: "未レビューの score 10 atom のうち最新で、優先タグを5つ持つ。通常経路や複数実行環境の成功を十分な検証とみなす失敗に対し、制作状態への再入摩擦と player-policy coverage を別々に測れるか確認するため選んだ。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 2
    non_redundancy: 2
    risk_control: 2
    reversibility: 3
    total: 15
  decision: adopt_metric
  decision_reason: "単一jam作品の回顧なので evidence は限定されるが、code bank の実測、3秒未満の debug loop、複数環境、公開後softlockの行動列がある。既存 probes は中間状態回復・固定personaの限界・手動runのfixtureを扱う一方、edit後の同一checkpoint再入時間と environment／player-policy coverage の分離は直接測っていない。"
  change:
    summary: "次の該当する短期 prototype 1件だけで、editから同一checkpointへ戻る時間を3回測った中央値と、通常経路とは異なる3 policy 以下の到達／停止結果を別列で記録する metric を追加した。active probe は増やしていない。"
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

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
