---
phase: 4a
name: 記憶階層 整理 + 問題抽出
focus: メカニカルな整理 + 構造的問題の発見 (設計するな、実装するな)
estimated_time: 10-20 min
gating_role: 4b/4c の起動可否を決める
inputs: [memory/, log/cycle_staging_log_cdx.md, inbox 系, memory/shared_reads_probe_lifecycle.jsonl]
outputs: [staging Phase 4a セクション (issues + needs_design 判定 + probe lifecycle 件数), due lease 1件までの receipt]
---

# Phase 4a: 記憶階層 整理 + 問題抽出

**ゲーム制作の経験を次の制作に活かせる記憶システム** を目指して、今ある記憶を整理し、構造的な問題を抽出する。

## このフェーズで集中すること

**整理と発見だけ。新しい仕組みを設計するな。実装するな。**

## やること (mechanical cleanup)

1. `memory/MEMORY.md` の index 行で broken link 確認
2. `memory/atoms.jsonl` の重複・矛盾の有無を確認
3. `memory/raw/` の古いファイルでアーカイブすべきもの (30 日以上動きがない原文等)
4. `memory/shared_reads_candidates/` で lifecycle frontmatter の内訳を確認する (`status: posted | ready_to_post | postponed | failed | needs_review`)。`postponed` / `needs_review` candidate は mtime や filename date ではなく `stale_after` を優先し、`stale_after <= 今日` のものを fail 降格、明示保持、または次 Phase 2 再評価のどれにするか記録する。`posted` / `failed` は原則として再評価 queue から外す。再評価に送る最大 5 件は `memory/shared_reads_candidate_handoff_inbox.jsonl` へ冪等 enqueue し、同じ内容を当該 cycle の `stale_review_batch` に表示する
5. inbox 系 (`slack_directives.jsonl`, `slack_broadcasts.jsonl`) で処理済みのものを `status: handled` に更新
6. `python tools\shared_reads_probe_lifecycle.py pending --due-only --limit 1` で期限到来 probe lease を1件だけ確認し、consumer artifact の判断前後と evidence pointer を receipt に残す

## probe lease の機械的 close (2026-07-21 Phase 4c)

`memory/shared_reads_probe_lifecycle.jsonl` は probe 本文ではなく operational lifecycle の正本である。Phase 4a は1 cycle 1件だけ due lease を扱う。

- consumer artifact を観測できた時は、`before_decision` / `after_decision` / `changed` / `evidence` を指定して `resolve` する。
- 判断差があった時は `status: resolved` とする。次の利用先が具体的に決まった場合だけ、Phase 3b の enqueue と同じ契約で再 lease できる。
- 判断差がなかった時は `changed: false` の receipt を残す。既存 comparison probe が同じ判断を包含し、根拠がある場合だけ `status: merged` と `superseded_by` を指定する。それ以外は `status: resolved` で閉じ、merge / retire 候補として staging に残す。自動削除しない。
- consumer artifact が未作成・未観測・evidence 不足なら `status: dormant` とする。probe 本文は削除しない。
- `retired` は明示的な根拠がある場合だけ使い、期限切れだけで自動退役させない。

```powershell
python tools\shared_reads_probe_lifecycle.py resolve --probe-id "<probe_id>" --status resolved --before-decision "<before>" --after-decision "<after>" --changed --evidence "<path#section>"
python tools\shared_reads_probe_lifecycle.py validate
```

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
probe_lifecycle:
  inspected_due_count: <0 または 1>
  inspected_probe_id: <probe_id または null>
  outcome: pending | resolved | dormant | merged | retired | none
  counts:
    pending: <件数>
    resolved: <件数>
    dormant: <件数>
stale_review_batch:
  - handoff_id: <cha-...>
    path: <memory/shared_reads_candidates/...md>
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

## Slack directive close gate

Slack directive を `handled` にする時は、受領や staging への割り振りだけを完了根拠にしない。指示が既存運用を変える内容なら、次のどちらかを evidence に含める。

- 現行ルール・phase prompt・投稿スクリプト・candidate frontmatter のうち、実際に未来の出力を変える場所を置換した commit / diff。
- 実装しない場合は、実装しない理由と、旧指示を維持する明示判断。

新しい指示が以前の指示を上書きする場合は、旧指示の後ろに追記して併存させない。旧文面を削るか、`superseded_by` / `supersedes` を inbox row に残して、検索や再投稿で旧運用が復活しない状態にしてから close する。

`memory/shared_reads_candidates/` の duplicate title group を確認する時は、必要に応じて次を使う。

```powershell
python tools\build_shared_reads_title_canonical_index.py
python tools\build_shared_reads_mixed_duplicate_queue.py
python tools\audit_shared_reads_title_duplicates.py --unindexed-only --limit 20
```

`memory/shared_reads_title_canonical_index.jsonl` に未登録の duplicate title group があり、posted / failed / postponed が混在して Phase 2 の再評価を濁す場合は、`memory/shared_reads_mixed_duplicate_queue.jsonl` から Phase 4a の `issues` または `stale_review_batch` に出す。canonical index 登録済み group は全 sibling が `posted` / `failed` の closed group なので再評価 queue から外れる。
## stale_review_batch / duplicate title handoff 記録 (2026-06-26)

`postponed` / `needs_review` の `stale_after <= 今日` を見る時は、残 backlog 件数と candidate handoff inbox へ enqueue した件数を分けて staging に書く。Phase 2 に渡すのは最大 5 件を目安にし、跨 cycle の配送状態は `memory/shared_reads_candidate_handoff_inbox.jsonl`、candidate の現在状態は per-file frontmatter を正本とする。staging の `stale_review_batch` は当該 cycle の選定表示であり、未処理 receipt には使わない。

duplicate title group は、group 全体が `posted` / `failed` で閉じている terminal group と、`ready_to_post` / `postponed` / `needs_review` を含む mixed group に分けて扱う。terminal group だけを `memory/shared_reads_title_canonical_index.jsonl` に `source_url` / `duplicate_paths` / `status_counts` / `decision_note` 付きで登録し、mixed group は自動 close せず `stale_review_batch` または Phase 2 の通常評価に残す。

## mixed duplicate queue (2026-06-27)

Phase 4c で `memory/shared_reads_mixed_duplicate_queue.jsonl` を導入した。これは terminal status と open status が混在する duplicate title group を、group 単位で Phase 2 に渡すための再生成可能な sidecar である。candidate frontmatter は正本のまま変更しない。

再生成:

```powershell
python tools\build_shared_reads_mixed_duplicate_queue.py
```

Phase 4a で mixed duplicate を handoff する時は、この queue の上位から最大 5 件を見て、同じ `title_key` の candidate を複数同時に `stale_review_batch` へ入れない。`recommended_representative` を基本に選び、`priority_reason` / `status_counts` / `terminal_paths` / `open_paths` を staging に根拠として残す。terminal group は従来通り `memory/shared_reads_title_canonical_index.jsonl` 側で扱う。
## stale triage queue (2026-07-06)

Phase 4c で `memory/shared_reads_stale_triage_queue.jsonl` を導入した。2026-07-25 Phase 4c 以降、Phase 4a が `stale_review_batch` を作る時は、group handoff を先に確定し、その live lease を反映して stale triage を再生成してから candidate handoff を enqueue する。

```powershell
python tools\build_shared_reads_open_duplicate_group_queue.py
python tools\build_shared_reads_stale_triage_queue.py --today <YYYY-MM-DD>
python tools\build_shared_reads_group_action_queue.py
python tools\shared_reads_group_handoff.py enqueue --source-cycle-id "<staging header cycle id>" --limit <group_handoff_budget>
python tools\build_shared_reads_stale_triage_queue.py --today <YYYY-MM-DD>
python tools\shared_reads_candidate_handoff.py enqueue --source-cycle-id "<staging header cycle id>" --limit 5
python tools\shared_reads_candidate_handoff.py audit
```

`shared_reads_stale_triage_queue.jsonl` は `path` / `title` / `status` / `stale_after` / `age_days` / `duplicate_group_key` / `game_transfer_value` / `recommended_review_action` / `reason` だけを持つ再生成可能 sidecar である。`duplicate_group_key` は mixed / all-open の双方に付け、同じ group は queue 上位選定で1回だけ扱う。candidate handoff inbox の pending、または `retry_after` 前の deferred と同じ `path + status + stale_after` は queue から除外する。candidate の状態または `stale_after` が変われば fail-open で再提示する。

`shared_reads_candidate_handoff.py enqueue` はこの queue の上位 5 件を active な同一 candidate state に対して冪等に enqueue する。出力の `id` と選定内容を staging の `stale_review_batch` に引用するが、candidate 本体は Phase 2 の評価結果が出るまで変更しない。staging 初期化後も未処理判定は inbox から復元する。

stale triage builder は `memory/shared_reads_group_handoff_inbox.jsonl` の live lease も生成時に合成する。pending group と、`retry_after` 前かつ membership fingerprint が一致する deferred group は queue へ再挿入しない。期限到来、open/terminal sibling の構成・状態変化、無関係な group は抑止せず fail-open で再提示する。再現時刻を固定する監査では `--as-of <ISO 8601>` を指定できる。

## candidate lifecycle audit の現在状態優先規則 (2026-07-22 Phase 4c)

`tools/backfill_shared_reads_candidate_status.py` は `gate_decision` を当初の品質判断として保存し、現在状態の巻き戻し根拠に使わない。現在状態は posted block、後続 decision evidence を伴う phase3 skip 後の遷移、整合した `status` / `candidate_status`、片側だけ存在する現在状態、decision evidence、欠損時の gate fallback の順で読む。

`last_decision` は `posted` / `pass` / `ready_to_post` / `postpone` / `postponed` / `fail` / `failed` / `needs_review` の閉じた状態語彙だけを使う。重複や移行の原因は `duplicate_reason` などの専用 reason field、根拠は `evidence` に分離する。たとえば `gate_decision: postpone` から `last_decision: failed` と evidence 付きで進んだ行は正常な lifecycle transition である。真の anomaly は `status` / `candidate_status` の不一致、または historical gate と異なる現在状態に対応する正規 `last_decision` / `evidence` がない場合として報告する。`--fix-conflicts` は posted/phase3 block または decision evidence で一意に決まる時だけ修復し、曖昧な行や整合済み terminal 状態を historical gate へ戻さない。

## bounded group-action handoff (2026-07-16 Phase 4c)

open duplicate group の stale 候補は、open-group sidecar と stale triage を再生成した後に group-action queue を生成する。

```powershell
python tools\build_shared_reads_group_action_queue.py
```

`memory/shared_reads_open_duplicate_group_queue.jsonl` は open sibling を持つ重複 title 群を `mixed` / `all_open` に分類し、`group_key` / `group_kind` / `open_paths` / `terminal_paths` / `status_counts` / `source_url_evidence` / `representative_paths` を持つ再生成可能 sidecar である。`memory/shared_reads_group_action_queue.jsonl` はそこから stale evidence がある group を1群1件へ畳む。Phase 4a から Phase 2 へ渡す budget は通常 1 group とする。ただし、次の両方を満たす時だけ backlog 高水位と判定し、最大 3 group にする。

- `overdue_open_total` が `shared_reads_stale_triage_queue.jsonl` の収載行数を超えている（queue が overdue 全体を収載できていない）。
- `shared_reads_group_action_queue.jsonl` に未処理の actionable group が 3 件以上ある。

高水位判定と実際の budget は、固定閾値ではなくその cycle の queue 全体の状態として staging の `stale_backlog` に記録する。`group_action_handoff` は queue の順序を保って budget 件まで選ぶ。同じ `group_key` は 1 回だけ選び、各 group の `representative`、`open_siblings`、`terminal_siblings`、`latest_evidence` をそのまま根拠として渡す。

2026-07-18 Phase 4c 以降、選定後は staging header の cycle ID と実際の budget を使って永続 inbox へ冪等 upsert する。未処理の同一 group が既にある場合は二重投入せず、既存 pending ID を staging に記録する。

```powershell
python tools\shared_reads_group_handoff.py enqueue --source-cycle-id "<staging header cycle id>" --limit <group_handoff_budget>
python tools\shared_reads_group_handoff.py audit
```

staging の `group_action_handoff` は当該 cycle の選定表示に限定する。監査情報として `handoff_inbox_pending_count` と `handoff_inbox_ids` を `stale_backlog` に追加し、跨 cycle の未処理判定は `memory/shared_reads_group_handoff_inbox.jsonl` を正本とする。

handoff に含めた group の `representative` と `open_siblings` は candidate 単位の `stale_review_batch` に重ねて入れない。この重複排除は複数 group を渡す場合も全 group に適用する。元 candidate、stale triage queue、mixed duplicate queue は変更しない。

staging の `stale_backlog` には最低限 `overdue_open_total` / `stale_triage_queue_rows` / `open_duplicate_group_count` / `mixed_group_count` / `all_open_group_count` / `actionable_group_count` / `backlog_high_water` / `group_handoff_budget` / `handed_off_group_count` / `candidate_handoff_pending_count` / `candidate_handoff_ids` を残す。title 一致だけでは自動 close / skip せず、`source_url_evidence` を読んで既存の `close_siblings` / `keep_distinct` / `defer` へ渡す。1 cycle 後は Phase 2 の `group_actions` を参照し、processed groups、判断できた open siblings、通常 candidate 分析への時間影響を確認して、budget 3 を継続するか判定する。
