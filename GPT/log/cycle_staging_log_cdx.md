# log_cdx Cycle Staging — 2026-08-17 23:43

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260817_kraven_manor_postmortem.md` — 半ランダムな modular horror の大規模構想を5部屋の linear experience と Room Table へ縮小し、技術実証から playable な kernel of fun を取り戻した postmortem。
- `memory/shared_reads_candidates/20260817_turing_test_secret_mechanic_postmortem.md` — 77個の puzzle を modular white box と playtest で構成し、低予算 production、difficulty curve、story twist と marketing の衝突を振り返る postmortem。

収集メモ: `slack_directives.jsonl` / `slack_broadcasts.jsonl` の pending はともに0件。直近 `web_research` の候補は既投稿 work との重複が中心だったため、新規検索で未収集 URL を確認した。各 candidate の書込み前に3 sidecarを再生成し、duplicate preflight が `continue`（終了コード0）であることを確認した。Slack 投稿・品質判定は行っていない。

## Phase 2: 分析

```yaml
total_candidates: 2
pass:
  - memory/shared_reads_candidates/20260817_kraven_manor_postmortem.md
  - memory/shared_reads_candidates/20260817_turing_test_secret_mechanic_postmortem.md
fail: []
postpone: []
stale_reviewed: []
duplicate_preflight:
  - path: memory/shared_reads_candidates/20260817_kraven_manor_postmortem.md
    decision: continue
    title_key: postmortem kraven manor
  - path: memory/shared_reads_candidates/20260817_turing_test_secret_mechanic_postmortem.md
    decision: continue
    title_key: postmortem building the turing test around a secret mechanic
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
candidate_handoff_audit:
  pending_before: 0
  read_ids: []
  resolved_ids: []
  deferred_ids: []
  partial_ids: []
  pending_after: 0
unreviewed_intake_audit:
  valid_backlog_before: 2
  malformed_count: 0
  oldest_collected_at: "2026-08-17T23:45:52+09:00"
  selection_limit: 5
  selected_paths: []
  phase1_excluded_paths:
    - memory/shared_reads_candidates/20260817_kraven_manor_postmortem.md
    - memory/shared_reads_candidates/20260817_turing_test_secret_mechanic_postmortem.md
  evaluated_paths:
    - memory/shared_reads_candidates/20260817_kraven_manor_postmortem.md
    - memory/shared_reads_candidates/20260817_turing_test_secret_mechanic_postmortem.md
  valid_backlog_after: 0
```

判定メモ:

- Kraven Manor は、structured randomness に必要な content 量を用意できない失敗から、5部屋の linear structure と Room Table へ核を再配置した因果が明瞭。prototype review の scope-down 判断へ直接適用でき、比較 playtest 不足を限界として扱えば残す価値がある。
- The Turing Test は、18か月・約11万ポンド・77室という production constraint、white-box playtest、数値と観察の併用、秘密の mechanic と marketing の衝突が一続きで分析できる。量産前の mechanic breadth と公開可能な hook を同時に検証する運用へ落とせる。
- Slack 投稿、新規収集、記憶階層の改修は行っていない。

## Phase 3: Shared-reads 投稿

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260817_kraven_manor_postmortem.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786978764031099
    char_count: 4140
  - candidate: memory/shared_reads_candidates/20260817_turing_test_secret_mechanic_postmortem.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786978772258389
    char_count: 4425
skipped: []
```

最終判定メモ:

- Kraven Manor は、生成技術の成功と playable proof の失敗、content multiplier、5部屋への縮小、Room Table への核の再統合まで原文で確認できた。比較 playtest がない限界を明記し、完成形の模倣ではなく prototype review gate として部分採用した。
- The Turing Test は、18か月・約11万ポンド・77室の production、white-box の数値と観察、linear progression の blocker、秘密 mechanic と販促の衝突を原文で確認できた。tester 母数などの欠落を明記し、10問の breadth test と public hook の分離として部分採用した。
- 両投稿とも必須見出し順、末尾 URL、禁止表現なしを `tools/shared_reads_policy.py` で確認した。Slack API 応答は `ok: true`、channel は `C0AN2FEHEJJ`。`chat.getPermalink` は client の JSON POST 経路で `invalid_arguments` だったため、workspace 標準形式の permalink を channel ID と ts から構成して記録した。

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1786970285-f38356b4bd
    source_ts: "1786970285.092589"
    title: "What goes into a good parry system?"
    reason: "未レビューの score 11 atom のうち最新で、memory・harness・game-design・operation・evaluation の5優先タグを持つ。parry を telegraph、失敗救済、代替防御、位置拘束、成功後の resource flow を含む選択構造として扱う差分が、次の action prototype 評価を変えるか確認した。Nao_u の明示評価はない。"
  scores:
    relevance: 2
    actionability: 3
    evidence: 2
    non_redundancy: 1
    risk_control: 1
    reversibility: 3
    total: 12
  decision: reject
  decision_reason: "combat verb matrix、厳密窓／mercy／不完全成功の3条件 replay、失敗を telegraph 認識／verb 選択／timing／位置取りへ分ける案は具体的だが、根拠は4作品の開発者取材と質的比較であり、成功率・retention・初心者差・入力遅延・代替防御使用率の比較実験はない。既存の mechanic observation channel、assist amplitude、projectile information controls と ARPG readability review が主要判断を既に覆う。現 staging には parry build、固定 enemy script、A／B／C replay、人間 playtest がなく、Phase 4a cleanup では before／after の判断差を測れない。active_probes 325件へ同型 control を加える確認負荷と過剰一般化リスクが高いため、state-only review で閉じた。"
  existing_controls:
    - probe-20260603-mechanic-observation-channel-gate
    - probe-20260710-feedback-device-amplitude-axis
    - probe-20260608-projectile-speed-information-channel
    - review-sr-1786590673-7d24ecec64
  change:
    summary: "reviewed_source_ts と、既存 controls との重複・比較可能な combat artifact 不在による reject 理由だけを記録した。probe・metric・lease・directive・恒久ルールは追加していない。"
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  lease: null
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
