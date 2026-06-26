---
phase: 4a
name: 記憶階層 整理 + 問題抽出
focus: メカニカルな整理 + 構造的問題の発見 (設計するな、実装するな)
estimated_time: 10-20 min
gating_role: 4b/4c の起動可否を決める
inputs: [memory/, log/cycle_staging_log_cdx.md, inbox 系]
outputs: [staging Phase 4a セクション (issues + needs_design 判定)]
---

# Phase 4a: 記憶階層 整理 + 問題抽出

**ゲーム制作の経験を次の制作に活かせる記憶システム** を目指して、今ある記憶を整理し、構造的な問題を抽出する。

## このフェーズで集中すること

**整理と発見だけ。新しい仕組みを設計するな。実装するな。**

## やること (mechanical cleanup)

1. `memory/MEMORY.md` の index 行で broken link 確認
2. `memory/atoms.jsonl` の重複・矛盾の有無を確認
3. `memory/raw/` の古いファイルでアーカイブすべきもの (30 日以上動きがない原文等)
4. `memory/shared_reads_candidates/` で lifecycle frontmatter の内訳を確認する (`status: posted | ready_to_post | postponed | failed | needs_review`)。`postponed` / `needs_review` candidate は mtime や filename date ではなく `stale_after` を優先し、`stale_after <= 今日` のものを fail 降格、明示保持、または次 Phase 2 再評価のどれにするか記録する。`posted` / `failed` は原則として再評価 queue から外す。再評価に送る場合は、最大 5 件程度を `stale_review_batch` として staging に残し、Phase 2 が少数処理できる handoff にする
5. inbox 系 (`slack_directives.jsonl`, `slack_broadcasts.jsonl`) で処理済みのものを `status: handled` に更新

## encoding-safe audit contract

日本語 `.md` の文字化けを issue 化する前に、source file の破損と表示・tooling 経路の mojibake を切り分ける。

- 対象 `.md` は UTF-8 を明示して読む。PowerShell や staging 表示だけの mojibake を source file 破損として扱わない。
- mojibake を見つけた場合、staging には `source_file_status` と `display_or_tooling_status` を分けて書く。
- `memory/MEMORY.md` を疑う場合は、代表語 probe として `記憶`, `ゲーム設計`, `敵パターン`, `評価軸` が UTF-8 読みで取得できるか確認する。
- UTF-8 読みで代表語が取得できる場合、`memory/MEMORY.md` 本文の再生成や手修復を Phase 4a issue にしない。必要なら表示経路の問題として記録する。

## やること (問題抽出)

ゲーム制作の経験を次の制作に活かせるかという観点で issue を列挙:

- **検索性**: ある手法を探そうとして見つけられないケースはあるか?
- **階層**: 同じ抽象度の情報がフラットすぎる/深すぎる箇所はあるか?
- **重複・冗長**: 同じ概念が複数 atom で散在していないか?
- **接続の欠落**: cross-reference が不足する孤児 atom はないか?
- **時系列断絶**: ゲーム X の制作中に学んだことが、ゲーム Y の制作時にアクセスされる導線があるか?
- **抽象化レベル**: 個別事例と一般化ノウハウが混在していないか?

## staging Phase 4a に記録

```yaml
cleaned:
  - <何を整理したか、1行ずつ。0 件なら空配列>
issues:
  - id: <短い識別子、例: ISS-001>
    description: <問題の内容>
    severity: low | medium | high
    evidence: <具体的な file/atom の参照>
    source_file_status: <source file 自体の状態。encoding 問題では UTF-8 明示読みの結果を書く>
    display_or_tooling_status: <表示経路・shell・staging などの状態。該当しなければ none>
    why_blocks_game_memory: <次のゲーム制作にどう影響するか>
recommendation:
  needs_design: true | false  # Phase 4b を起動すべきか
  priority_issues: [<id>, ...]  # 4b で扱うべき issue (多くても 1-3 件)
stale_review_batch:
  - path: <memory/shared_reads_candidates/...md>
    status: postponed | needs_review
    stale_after: "YYYY-MM-DD"
    priority_reason: <Phase 2 に送る理由>
    recommended_review_action: reevaluate_in_phase2 | explicit_keep | fail
```

## やらないこと

- 新しい構造の **設計** (4b の仕事)
- atom や MEMORY.md の **大規模再編** (4c の仕事)
- 「整理」と称した広範な書き換え (cleanup = mechanical only)
- issue を捻出するための重箱の隅つつき (4b/4c の無駄起動を招く)

## issue 抽出の温度感

「これは構造的に直したい」と本当に思った時だけ issue を立てる。**毎サイクル 0 issue でも OK**。`needs_design: false` で正常終了する。

## 出力チェック

- 軽い整理が完了している
- staging Phase 4a セクションが埋まっている (issues は空でも可、needs_design は true/false で明示)

## shared-reads title canonical index audit (2026-06-25)

`memory/shared_reads_candidates/` の duplicate title group を確認する時は、必要に応じて次を使う。

```powershell
python tools\audit_shared_reads_title_duplicates.py --unindexed-only --limit 20
```

`memory/shared_reads_title_canonical_index.jsonl` に未登録の duplicate title group があり、posted / failed / postponed が混在して Phase 2 の再評価を濁す場合は、Phase 4a の `issues` または `stale_review_batch` に出す。index 登録済み group は、`best_status: posted` または `best_status: failed` がある限り再評価 queue から外れる。
## stale_review_batch / duplicate title handoff 記録 (2026-06-26)

`postponed` / `needs_review` の `stale_after <= 今日` を見る時は、残 backlog 件数と今回 `stale_review_batch` に渡す件数を分けて staging に書く。Phase 2 に渡すのは最大 5 件を目安にし、処理契約は Phase 2 の `stale_reviewed` と candidate frontmatter 更新で閉じる。

duplicate title group は、group 全体が `posted` / `failed` で閉じている terminal group と、`ready_to_post` / `postponed` / `needs_review` を含む mixed group に分けて扱う。terminal group だけを `memory/shared_reads_title_canonical_index.jsonl` に `source_url` / `duplicate_paths` / `status_counts` / `decision_note` 付きで登録し、mixed group は自動 close せず `stale_review_batch` または Phase 2 の通常評価に残す。
