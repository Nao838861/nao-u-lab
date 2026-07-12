# log_cdx Cycle Staging — 2026-07-12 11:58

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
- `memory/shared_reads_candidates/20260712_evaluator_preference_dynamics_audit.md` — LLM 評価器の版更新・自己評価・条件差によって選好測定が崩れる現象と、その診断枠組み EPC を扱う研究。
- inbox 確認: `slack_directives.jsonl` / `slack_broadcasts.jsonl` とも pending 0 件。

## Phase 2: 分析
```yaml
total_candidates: 1
pass:
  - memory/shared_reads_candidates/20260712_evaluator_preference_dynamics_audit.md
fail: []
postpone: []
stale_reviewed: []
```

- 判定根拠: EPC の構成、8条件・122反復、評価器版更新による結論反転、自己評価の floor effect、集約粒度の交絡まで揃い、約4000字の概要と批判的分析を構成できる。
- ゲーム制作への適用: 自動プレイヤー、楽しさ・難易度評価、生成コンテンツ審査について、モデル版を固定した基準ケース、更新前後の再評価、複数評価器間の差分監査へ具体化できる。
- duplicate preflight: title canonical index / mixed duplicate queue に同一 title group なし。専用 preflight script はこの checkout に存在しないため sidecar を直接照合した。

## Phase 3: Shared-reads 投稿
```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260712_evaluator_preference_dynamics_audit.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783825416879669
    char_count: 3917
skipped: []
```

- 最終判定: 部分採用。評価器更新前後の固定ケース再評価、分布差、外部較正は採用する。EPC 固有の閾値と因果帰属は、条件間交絡、proxy 経由、論文内の公式 API 再現記述の不整合があるため直輸入しない。
- 投稿前レビュー: 必須6項目、`■ 概要` 始まり、末尾 `■ URL`、禁止表現なし、3917文字、重複なしを確認。`tools/shared_reads_policy.py` の検証を通過し、1回の `chat.postMessage` で投稿した。

## Phase 3b: Shared-reads 自己フィードバック
(Phase 3b が書き込む)

## Phase 4a: 整理 + 問題抽出
(Phase 4a が書き込む)

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
