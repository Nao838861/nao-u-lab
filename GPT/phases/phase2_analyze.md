---
phase: 2
name: 分析
focus: candidate の品質判定 + ゲーム制作への適用性評価
estimated_time: 15-30 min
inputs: [Phase 1 staging, Phase 4a stale_review_batch, shared_reads_candidates/]
outputs: [各 candidate に evaluation frontmatter, staging Phase 2 セクション]
---

## stale_review_batch 再評価契約 (2026-06-19)

Phase 4a が staging に `stale_review_batch` を残している場合、Phase 2 は通常の新規 candidate 評価より先にその batch を処理する。batch は最大 5 件を目安に、game production に直結する候補を優先する。`status: posted` / `status: failed` は再評価対象から外し、`postponed` / `needs_review` だけを扱う。

再評価後は staging の `stale_reviewed` だけでなく、該当 candidate の frontmatter も閉じる。`pass` は `ready_to_post`、`fail` は `failed`、`postpone` は `postponed` に更新し、`last_reviewed_at` / `last_decision` / `evidence` / `next_action` / `stale_after` を合わせて更新する。永続 queue index は作らず、正本は per-file frontmatter と staging handoff に限定する。

# Phase 2: 分析

Phase 1 で集めた candidate を読み、**Phase 3 で #shared-reads に投稿するに値するか** を判定する。

## このフェーズで集中すること

**評価だけ。投稿するな。新規収集するな。記憶を改修するな。**

## やること

1. staging file の Phase 1 セクションを読み、収集された candidate を確認
   - Phase 4a が `stale_review_batch` を残している場合は、通常の新規 candidate 評価の前に少数だけ再評価する。`status` が `posted` / `failed` のものは除外する。candidate 本体の frontmatter は、この Phase 2 の再評価結果が出るまで変更しない。
2. 各 candidate について以下を判定:
   - **手法の重要要素** (問題設定・着想・手法の中核・評価の中身・結論) が抽出できるか
   - **ゲーム制作の具体場面で適用できるか** (抽象すぎず、こじつけすぎず)
   - **CoopEval ポスト水準 ~4000字 の概要が書けるか**
3. 各 candidate ファイルに以下を追記:
   ```yaml
   evaluated_at: <ISO>
   evaluated_by: log_cdx (Phase 2)
   gate_decision: pass | fail | postpone
   status: ready_to_post | postponed | failed
   candidate_status: ready_to_post | postponed | failed
   last_reviewed_at: <ISO>
   last_decision: pass | fail | postpone
   evidence: "gate_decision:<decision>; evaluated_at:<ISO>"
   next_action: post_to_shared_reads | revise_or_research | keep_for_reference
   stale_after: "YYYY-MM-DD"  # evaluated_at から 30 日後
   supersedes: []
   gate_reason: <decision の根拠、2-3 行>
   suggested_post_outline:  # pass のみ
     overview_angle: <概要をどの軸で書くか>
     analysis_axis: <内容分析の軸>
     application_target: <自分達の作品・手法・サイクルのどこに効くか>
     pros_cons: <ざっくり>
     verdict_pre: <採用/部分採用/棄却/保留の予想>
   ```
4. staging file の `## Phase 2: 分析` セクションに判定結果を追記:
   ```yaml
   total_candidates: <数>
   pass: [<path>, ...]
   fail: [{path: <path>, reason: <短く>}, ...]
   postpone: [{path: <path>, reason: <短く>}, ...]
   stale_reviewed:
     - path: <path>
       previous_status: postponed | needs_review
       decision: pass | fail | postpone
       updated_stale_after: "YYYY-MM-DD"
   ```

## やらないこと

- 4000字概要の執筆 (Phase 3 で行う)
- candidate の追加収集
- Slack 投稿
- 記憶階層の改修

## 落としていい

- 「面白そう」レベルは fail で良い
- 5 件中 1 件 pass で 4 件 fail/postpone でも健全
- pass を捻出するために評価を緩めるのは禁止 (記憶汚染の主因)
- 過去 directive: 質の高い記事だけを記憶に残す。ゴミを溜めると指数的に劣化する

## 出力チェック

- 各 candidate に evaluation frontmatter が追加されている
- staging Phase 2 セクションが埋まっている

## title canonical index による再評価除外 (2026-06-25)

Phase 4c で `memory/shared_reads_title_canonical_index.jsonl` を追加した。これは candidate lifecycle の正本ではなく、同一 title group に `best_status: posted` または `best_status: failed` の canonical 判定がある時だけ、stale reevaluation queue から外すための軽量 sidecar である。

Phase 2 で `stale_review_batch` や `memory/shared_reads_review_queue.jsonl` を扱う前に、対象 candidate の `title` を `tools/shared_reads_title_index.py` の `normalize_title_key()` と同じ規則で `title_key` 化し、index に terminal 判定があるものは再評価しない。必要に応じて人間が再オープンする場合は、index 行の `decision_note` / `source_url` / `duplicate_paths` を確認してから個別に扱う。
## stale_review_batch / title canonical 運用確認 (2026-06-26)

Phase 4a が `stale_review_batch` を staging に残している時は、Phase 2 は新規 candidate より先に最大 5 件を処理する。処理後は staging の `stale_reviewed` と、該当 candidate frontmatter の `status` / `candidate_status` / `last_reviewed_at` / `last_decision` / `evidence` / `next_action` / `stale_after` の両方を確認する。片方だけでは完了扱いにしない。

duplicate title group は、group 全体が `posted` / `failed` で閉じている terminal group だけを `memory/shared_reads_title_canonical_index.jsonl` で再評価除外する。`ready_to_post` / `postponed` / `needs_review` を含む mixed group は自動 close せず、Phase 2 の個別評価か Phase 4a の `stale_review_batch` に残す。
