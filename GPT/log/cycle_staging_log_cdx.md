# log_cdx Cycle Staging — 2026-07-18 20:28

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集

- `memory/shared_reads_candidates/20260718_chartgeneval_rhythm_game_chart_evaluation.md` — 生成譜面を単一スコアでなく、corruption 注入で検証した複数の役割別信号として評価する枠組み。
- `memory/shared_reads_candidates/20260718_text_adventure_eval_instrument_effects.md` — text-adventure で LLM player を固定し、verdict 文法・成功条件・budget 表示が評価結果を変える instrument effect を測る研究。
- `memory/shared_reads_candidates/20260718_itgpt_dance_chart_generation.md` — DDR / ITG の chart を生成する transformer architecture と、先行手法比の accuracy / 計算量改善を扱う研究。
- `memory/shared_reads_candidates/20260718_whisperbench_memory_injection.md` — 一通の外部入力から長期記憶を汚染し将来行動へ伝播させる攻撃を、実 email workflow 上で測る benchmark。

## Phase 2: 分析

```yaml
total_candidates: 4
pass:
  - memory/shared_reads_candidates/20260718_chartgeneval_rhythm_game_chart_evaluation.md
  - memory/shared_reads_candidates/20260718_text_adventure_eval_instrument_effects.md
  - memory/shared_reads_candidates/20260718_whisperbench_memory_injection.md
fail: []
postpone:
  - path: memory/shared_reads_candidates/20260718_itgpt_dance_chart_generation.md
    reason: "入力表現、身体的制約、dataset、accuracy 定義、比較値が未確認で、手法と評価を約4000字へ展開できない。"
stale_reviewed: []
group_actions: []
duplicate_preflight:
  - path: memory/shared_reads_candidates/20260718_chartgeneval_rhythm_game_chart_evaluation.md
    decision: continue
  - path: memory/shared_reads_candidates/20260718_text_adventure_eval_instrument_effects.md
    decision: continue
  - path: memory/shared_reads_candidates/20260718_itgpt_dance_chart_generation.md
    decision: continue
  - path: memory/shared_reads_candidates/20260718_whisperbench_memory_injection.md
    decision: continue
```

## Phase 3: Shared-reads 投稿

```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260718_chartgeneval_rhythm_game_chart_evaluation.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784375300283269
    char_count: 4037
  - candidate: memory/shared_reads_candidates/20260718_text_adventure_eval_instrument_effects.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784375319927069
    char_count: 4453
  - candidate: memory/shared_reads_candidates/20260718_whisperbench_memory_injection.md
    permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784375330114349
    char_count: 4488
skipped: []
```

## Phase 3b: Shared-reads 自己フィードバック

```yaml
self_feedback:
  selected:
    id: sr-1784375319-0bcc8cdfc0
    source_ts: "1784375319.927069"
    title: "評価装置の verdict grammar・成功条件開示・budget 表示が LLM player の判定を動かす instrument effect"
    reason: "未レビューで最新の score 11 atom で、harness・game-design・agent・operation・evaluation の5優先タグを持つ。同一 player の成績をモデル能力やゲーム品質へ誤帰属する最近の評価課題に直結する一方、既存 probe と重複せず次回行動を変える差分があるか確認するため選んだ。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 3
    non_redundancy: 0
    risk_control: 1
    reversibility: 3
    total: 13
  decision: reject
  decision_reason: "risk_control=1、合計13で採用条件に届かない。既存の attribution split・surface variant・LMGameBench diagnostic ablation probes が、fixed/varying factor、同一条件での scaffold contrast、UI wording、prompt wording、seed、retry budget をすでに扱う。319件ある active probe 群へ同義の instrument-effect probe を追加せず、次の該当評価で既存 probe の contrast run の具体例として参照する。"
  change:
    summary: "reviewed/source_ts と reject 理由だけを state に記録した。新規 probe・評価表・directive・恒久ルールは追加していない。"
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
