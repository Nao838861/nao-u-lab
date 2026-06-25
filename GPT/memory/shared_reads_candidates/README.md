# shared_reads_candidates/

#shared-reads に投稿する基準を満たさない**候補レベル**の記事置き場。

Nao_u 指示 (2026-05-12 13:40 `directive_shared_reads_candidate_gate_20260512.md`):
- 候補は **#shared-reads に投稿しない**。ローカル保存のみ可。
- #shared-reads には **フォーマット遵守 + ~4000字程度の「残すべき」品質** を満たすものだけを投稿する。

## ファイル名規則 (推奨)

```
YYYYMMDD_<topic-slug>.md
```

例: `20260512_coopeval_replication_attempt.md`

## lifecycle frontmatter

各 candidate は先頭に YAML frontmatter を置き、少なくとも次の lifecycle metadata を持つ。

```yaml
---
title: "<記事・論文タイトル>"
url: "<URL>"
collected_at: "YYYY-MM-DDTHH:MM:SS+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design]
evaluated_at: "YYYY-MM-DDTHH:MM:SS+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass | postpone | fail
status: posted | ready_to_post | postponed | failed | needs_review
candidate_status: posted | ready_to_post | postponed | failed | needs_review
last_reviewed_at: "YYYY-MM-DDTHH:MM:SS+09:00"
last_decision: posted | pass | postpone | fail | needs_review
evidence: "<Slack permalink または gate_decision/evaluated_at>"
next_action: none | post_to_shared_reads | revise_or_research | keep_for_reference | evaluate_in_phase2
gate_reason: "<判断理由>"
stale_after: "YYYY-MM-DD"
supersedes: []
posted:
  ts: "<Slack ts>"
  permalink: "<Slack permalink>"
  char_count: 4000
  posted_at: "YYYY-MM-DDTHH:MM:SS+09:00"
---
```

- `status: posted` は #shared-reads 投稿済み。`posted` block を付け、`evidence` は Slack permalink にする。
- `status: ready_to_post` は `gate_decision: pass` だが未投稿。
- `status: postponed` は追加調査、密度不足、重複投稿回避などで保留。
- `status: failed` は現時点では投稿品質または適用性が足りない。
- `status: needs_review` は旧ファイルや未判定ファイルの暫定値。次の Phase 2/4a で再判定する。
- `candidate_status` は 2026-05-16/17 導入分との互換フィールド。新しい判断では `status` を正本として更新し、互換のため同じ値を残す。
- `last_reviewed_at` / `last_decision` / `evidence` / `next_action` は candidate 単体で現在位置と次の扱いを読むための最小 lifecycle schema。

2026-05-16 Phase 4c で既存 candidate の `candidate_status` 欠落を backfill した。再監査・補完が必要な場合は、正本を per-file frontmatter として維持したまま次を使う。

```powershell
python tools\backfill_shared_reads_candidate_status.py
python tools\backfill_shared_reads_candidate_status.py --apply --fix-conflicts
```

2026-05-17 Phase 4c で lifecycle frontmatter の正本化を拡張した。各 candidate は `candidate_status` / `gate_decision` / `gate_reason` / `evaluated_at` に加え、機械的な棚卸し用の `stale_after` と、再投稿・差し替え関係を明示する `supersedes` を持つ。Phase 2/3 で判定や投稿状態を変えた場合は、staging だけでなく該当 candidate の frontmatter も更新する。

2026-05-31 Phase 4c で `status` / `last_reviewed_at` / `last_decision` / `evidence` / `next_action` を最小 lifecycle schema として追加した。既定の backfill は Phase 2/3 の根拠がある candidate だけを対象にし、未判定ファイルを一括分類しない。未判定ファイルも `needs_review` として明示したい場合だけ `--include-unreviewed` を付ける。

2026-06-17 Phase 4c で再評価 queue の監査方針を `stale_after` 正本に寄せた。`postponed` / `needs_review` は `stale_after <= 今日` なら Phase 4a の priority issue 候補として扱い、mtime や filename date は補助情報に留める。`ready_to_post` は投稿待ち queue として lifecycle 欠損を補う。`posted` / `failed` は原則として再評価 queue から外し、必要な場合も `last_reviewed_at` 欠損の補完だけに留める。

2026-06-17 Phase 4c で stale candidate の handoff 契約を追加した。Phase 4a は `postponed` / `needs_review` のうち `stale_after <= 今日` のものから最大 5 件程度を staging の `stale_review_batch` に残す。Phase 2 は新規 candidate 評価の前にこの batch を再評価し、各 candidate の `status` / `candidate_status` / `gate_decision` / `gate_reason` / `last_reviewed_at` / `last_decision` / `evidence` / `next_action` / `stale_after` を更新する。機械的な一括降格はしない。永続 queue index は作らず、正本は per-file frontmatter と staging の handoff に限定する。

2026-06-19 Phase 4c で stale_review_batch を Phase 2 の明示入力として再確認した。通常の新規 candidate より前に最大 5 件を処理し、game production に直結する候補を優先する。Phase 2 の判定結果は candidate frontmatter の `status` / `candidate_status` / `last_reviewed_at` / `last_decision` / `evidence` / `next_action` / `stale_after` まで閉じ、staging の `stale_reviewed` にも残す。今回も lifecycle index は導入しない。

件数確認:

```powershell
python tools\backfill_shared_reads_candidate_status.py
python tools\backfill_shared_reads_candidate_status.py --apply
```

summary の `missing_stale_after` と `overdue_for_reassessment` を Phase 4a/4c staging に残す。

## 育てる流れ

1. 探索段階で見つけた記事/論文をここに candidate として保存
2. 各記事に対し、`概要 / 内容分析 / 自分達の環境への適用 / メリット・デメリット / 判定` を書き始める
3. 概要が記事/論文を読まなくても重要要素 (問題設定・着想・手法の中核・評価の中身・結論) を把握できる密度に達したら、品質ゲートを通過させて #shared-reads に投稿
4. テンプレ流用・1行サマリ・他記事と同文の貼り回しは投稿不可。ここで止める

## 関連 directive

- `../directive_shared_reads_overview_20260512.md` — 要約→概要、CoopEval ポスト品質基準
- `../directive_shared_reads_candidate_gate_20260512.md` — 候補ゲート、~4000字バー

## title canonical index (2026-06-25)

`memory/shared_reads_title_canonical_index.jsonl` は、同一 title の候補が複数残った時に「この title group は既に posted / failed として閉じている」と Phase 2 の再評価 queue へ伝える lightweight sidecar である。candidate 本体や lifecycle frontmatter の正本ではない。

1 行 1 `title_key` で、最低限 `title_key` / `canonical_path` / `best_status` / `duplicate_paths` / `source_url` / `decision_note` / `updated_at` を持つ。誤結合を避けるため、title だけで確定せず、`source_url` と candidate path を人間が確認できる形で残す。

Phase 4a で duplicate title group を監査する時は、未登録 group を次で確認できる。

```powershell
python tools\audit_shared_reads_title_duplicates.py --unindexed-only --limit 20
```
