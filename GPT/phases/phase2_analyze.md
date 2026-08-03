---
phase: 2
name: 分析
focus: candidate の品質判定 + ゲーム制作への適用性評価
estimated_time: 15-30 min
inputs: [Phase 1 staging, memory/shared_reads_candidate_handoff_inbox.jsonl, shared_reads_candidates/]
outputs: [各 candidate に evaluation frontmatter, staging Phase 2 セクション]
---

## Duplicate preflight の判定順 (2026-07-18 Phase 4c)

本文評価前の duplicate preflight は、`posted-source → closed canonical → open duplicate group → continue` の順に確認する。実 Slack 投稿の canonical URL / domain 限定 work identity 一致だけを `skip` とし、closed title、terminal/open 混在の mixed title、全 sibling が open の all-open title 一致は `review` にする。3 sidecar の missing・candidate snapshot より古い stale、URL 抽出未解決、provenance 不足も `review` に倒す。Phase 3 の raw Slack 横断照合は最終安全網として維持する。

Phase 2 開始時と candidate frontmatter 更新後の次回 preflight 前に、posted-source / title canonical / open duplicate group の各 builder を再実行する。sidecar の自動補正は行わず、stale のままなら評価を進めない。

## stale candidate handoff 再評価契約 (2026-07-25 Phase 4c)

stale candidate の跨 cycle 配送状態は staging ではなく `memory/shared_reads_candidate_handoff_inbox.jsonl` を正本とする。group handoff の oldest pending を処理した後、通常の新規 candidate より先に次を実行し、oldest pending を最大 5 件読む。

```powershell
python tools\shared_reads_candidate_handoff.py pending --limit 5
```

新規に選ぶ lease は `selected_status` / `selected_stale_after` と現在の candidate frontmatter が一致するものに限る。未完了の pending は、Phase 2 が frontmatter 更新後・receipt 前に中断した場合の replay のため、状態が変わっていても再配送する。その場合は再評価を重ねず、既存更新を検証して resolve する。通常の再評価対象は `postponed` / `needs_review` とし、未選定の `posted` / `failed` は扱わない。再評価後は staging の `stale_reviewed` と candidate frontmatter の両方を先に更新する。`pass` は `ready_to_post`、`fail` は `failed`、`postpone` は `postponed` と新しい `stale_after` にし、`last_reviewed_at` / `last_decision` / `evidence` / `next_action` も閉じる。その後にだけ handoff を resolve する。

```powershell
python tools\shared_reads_candidate_handoff.py resolve --id <handoff_id> --decision <pass|fail|postpone> --reason "<根拠>" --staging-evidence "log/cycle_staging_log_cdx.md Phase 2 stale_reviewed:<handoff_id>"
```

frontmatter または staging evidence が不足すると `partial` で pending のまま残る。同じ ID を再実行して回復する。一次資料不足で再試行日が明確な場合だけ `--decision defer --retry-after <ISO>` を使い、期限前は triage と pending から外す。単なる未処理は defer せず pending のままにする。

## 未評価 candidate 直接 intake 契約 (2026-08-03 Phase 4c)

Phase 1 の必須 provenance (`title` / `url` / `collected_at` / `collected_by`) を持ち、`status` / `candidate_status` / `gate_decision` / `evaluated_at` がすべて欠損している candidate を「正規の未評価 intake」とする。必須 provenance が欠けたファイルは自動評価せず malformed anomaly として Phase 4a に残す。候補本体へ仮 status は書かない。

処理順は group handoff、stale candidate handoff、未評価 intake の順とする。未評価 intake は `collected_at`、同値なら path の昇順で最大 5 件を選ぶ。現在 cycle の staging Phase 1 に列挙された path は集合和で扱い、同一 path を二重評価しない。選定は次を使う。

```powershell
python tools\shared_reads_unreviewed_intake.py select --staging log\cycle_staging_log_cdx.md --limit 5
```

`selected` と staging Phase 1 の candidate を path で重複排除して評価する。Phase 2 の canonical frontmatter を一括で書き終えた candidate は次回 scan から自然に外れる。candidate 更新前に中断した場合は未評価のまま次 cycle に再提示される。部分的な evaluation field を持つ既存 candidate は、この intake が仮判断で上書きせず既存 lifecycle audit に委ねる。

# Phase 2: 分析

Phase 1 で集めた candidate を読み、**Phase 3 で #shared-reads に投稿するに値するか** を判定する。

## このフェーズで集中すること

**評価だけ。投稿するな。新規収集するな。記憶を改修するな。**

## やること

1. group handoff、candidate handoff、未評価 intake、staging file の Phase 1 セクションを読み、上記の順で再評価対象と新規 candidate を確認
   - stale handoff は最大 5 件を通常の新規 candidate より先に再評価する。staging の `stale_review_batch` は選定表示として参照できるが、未処理判定には使わない。candidate 本体の frontmatter は、この Phase 2 の再評価結果が出るまで変更しない。
   - 未評価 intake の `selected` は最大 5 件。staging Phase 1 の path と重複排除し、未評価 backlog が staging 初期化や Phase 2 中断で消えないよう candidate directory から毎 cycle 復元する。
2. 各 candidate について以下を判定:
   - **手法の重要要素** (問題設定・着想・手法の中核・評価の中身・結論) が抽出できるか
   - **ゲーム制作の具体場面で適用できるか** (抽象すぎず、こじつけすぎず)
   - **CoopEval ポスト水準 ~4000字 の概要が書けるか**
3. 各 candidate ファイルの evaluation frontmatter を更新する。古い評価欄と矛盾する場合は、現行判断で置換し、旧判断を本文へ積み増さない:
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
   - `application_target` や `analysis_axis` は Log_cdx 自身の適用先として書く。Mir / Ash / Log への問いかけ、役割分担、返答依頼を pass 理由に含めない。
   - 旧運用の multi-agent 相談前提で `ready_to_post` になっている candidate は、現行フォーマットに書き換えられるまで `postponed` に戻す。
4. staging file の `## Phase 2: 分析` セクションに判定結果を追記:
   ```yaml
   total_candidates: <数>
   pass: [<path>, ...]
   fail: [{path: <path>, reason: <短く>}, ...]
   postpone: [{path: <path>, reason: <短く>}, ...]
   stale_reviewed:
     - handoff_id: <cha-...>
       path: <path>
       previous_status: postponed | needs_review
       decision: pass | fail | postpone
       updated_stale_after: "YYYY-MM-DD"
   candidate_handoff_audit:
     pending_before: <件数>
     read_ids: [<handoff_id>, ...]
     resolved_ids: [<handoff_id>, ...]
     deferred_ids: [<handoff_id>, ...]
     partial_ids: [<handoff_id>, ...]
     pending_after: <件数>
   unreviewed_intake_audit:
     valid_backlog_before: <件数>
     malformed_count: <件数>
     oldest_collected_at: <ISO または null>
     selection_limit: 5
     selected_paths: [<path>, ...]
     phase1_excluded_paths: [<同一 cycle の Phase 1 と重複した path>, ...]
     evaluated_paths: [<この Phase 2 で canonical frontmatter を書いた path>, ...]
     valid_backlog_after: <評価後に audit を再実行した件数>
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

Phase 4c で `memory/shared_reads_title_canonical_index.jsonl` を追加した。これは candidate lifecycle の正本ではなく、同一 title group の全 sibling が `posted` / `failed` で閉じた時だけ、stale reevaluation queue から外すための軽量 sidecar である。

Phase 2 で candidate handoff や `memory/shared_reads_review_queue.jsonl` を扱う前に、対象 candidate の `title` を `tools/shared_reads_title_index.py` の `normalize_title_key()` と同じ規則で `title_key` 化し、index に terminal 判定があるものは再評価しない。必要に応じて人間が再オープンする場合は、index 行の `decision_note` / `source_url` / `duplicate_paths` を確認してから個別に扱う。
## stale candidate handoff / title canonical 運用確認

Phase 2 は candidate handoff inbox の oldest pending を新規 candidate より先に最大 5 件処理する。`resolve` が staging の `stale_reviewed` evidence と、該当 candidate frontmatter の `status` / `candidate_status` / `last_reviewed_at` / `last_decision` / `evidence` / `next_action` / `stale_after` を検証して handled にする。片方だけでは完了扱いにしない。

duplicate title group は、group 全体が `posted` / `failed` で閉じている terminal group だけを `memory/shared_reads_title_canonical_index.jsonl` で再評価除外する。`ready_to_post` / `postponed` / `needs_review` を含む mixed group は自動 close せず、Phase 2 の個別評価か Phase 4a の `stale_review_batch` に残す。

## mixed duplicate queue 運用 (2026-06-27)

Phase 4c で `memory/shared_reads_mixed_duplicate_queue.jsonl` を導入した。Phase 2 が candidate handoff を処理する時、同じ `title_key` の候補を複数同時に評価しない。Phase 4a から `recommended_representative` が渡っている場合は、その 1 件を group 代表として評価し、評価後に group 全体が terminal 化した場合だけ `memory/shared_reads_title_canonical_index.jsonl` の再生成候補にする。candidate 本体の status は評価した代表ファイルだけ更新し、queue は report / handoff 用 sidecar として再生成可能に保つ。

## 評価前 terminal-title preflight (2026-06-29)

Phase 2 は、新規 candidate 評価および candidate handoff 再評価の本文読解に入る前に、対象 candidate の `title` を `tools/shared_reads_title_index.py` の `normalize_title_key()` と同じ規則で `title_key` 化し、`memory/shared_reads_title_canonical_index.jsonl` と `memory/shared_reads_open_duplicate_group_queue.jsonl` を確認する。

Phase 4a が staging に `group_action_handoff` を残した場合、Phase 2 は記録された budget（通常 1 group、backlog 高水位時だけ最大 3 group）の各 `representative` を再評価する。同じ `group_key` は 1 回だけ扱い、handoff 対象 group の `representative` と `open_siblings` を candidate handoff と同時に評価しない。`terminal_siblings` と `latest_evidence` は判断根拠として読むが、candidate frontmatter を group 単位で自動一括更新しない。

2026-07-18 Phase 4c 以降、group action の跨 cycle 正本は staging ではなく `memory/shared_reads_group_handoff_inbox.jsonl` とする。Phase 2 の開始時に次を実行し、candidate handoff と新規 candidate より先に oldest pending を最大3件処理する。

```powershell
python tools\shared_reads_group_handoff.py pending --limit 3
```

処理対象 ID と開始時/終了時の pending 件数を staging の監査情報に残す。各 item は `group_actions` に対応する結果を書いた後、`acknowledge` ではなく `resolve` で判断を適用する。途中失敗した item は pending のまま残し、同一 ID の `resolve` を再実行して回復する。

```powershell
python tools\shared_reads_group_handoff.py resolve --id <handoff_id> --action close_siblings --target-path <candidate_path> --reason "<根拠>" --terminal-evidence "<terminal_path>=<status/permalink>" --representative-decision postpone
```

`close_siblings` の `target_paths` には representative を含む現在の open sibling をすべて列挙する。各対象を `failed` にし、`last_decision: failed`、duplicate 専用の `duplicate_reason` / `evidence` / `next_action` を記録する。payload の open membership がすべて terminal になったことを再読込で確認した後だけ handled になる。`keep_distinct` は現在の path/status 構成 fingerprint が一致する間だけ group-action queue から除外し、構成が変われば自動再審査する。`defer` は `--retry-after <ISO>` を必須とし、期限までは queue への再投入を抑止するが handled にはしない。

各 group の再評価結果は、再生成可能な queue とは別に staging Phase 2 の `group_actions` へ次の契約で残す。これは判断と適用結果を同一 handoff ID で結ぶ監査記録である。

```yaml
group_actions:
  - group_key: <group_key>
    representative: <評価した path>
    action: close_siblings | keep_distinct | defer
    target_paths: [<判断対象の open sibling path>, ...]
    reason: <action の根拠>
    terminal_evidence:
      - path: <参照した terminal sibling path>
        evidence: <permalink、status、評価差など>
    representative_decision: pass | fail | postpone
    analysis_time_minutes: <通常 candidate 分析への影響を次 cycle で判定できる値>
```

staging Phase 2 には合わせて次を残す。

```yaml
group_handoff_audit:
  pending_before: <件数>
  read_ids: [<handoff_id>, ...]
  resolved_ids: [<handoff_id>, ...]
  deferred_ids: [<handoff_id>, ...]
  partial_ids: [<handoff_id>, ...]
  apply_counts:
    candidates_updated: <件数>
    already_terminal: <件数>
  pending_after: <件数>
```

`close_siblings` は対象を閉じてよいという提案、`keep_distinct` は題材差・資料差などにより別 candidate として維持する判断、`defer` は根拠不足による保留である。いずれも `target_paths` / `reason` / `terminal_evidence` を省略しない。all-open 群を `keep_distinct` にする時は、`terminal_evidence` の既存 schema に各 open path の source URL / work 差分を記録する。根拠を示せない時は `defer` にする。title 一致だけで `close_siblings` や `skip` を選ばない。

同じ `title_key` に `status: posted` の terminal sibling が見つかった場合、その candidate は Phase 3 投稿対象にしない。本文評価を作る前に、対象 candidate だけ frontmatter を次の形で閉じる:

```yaml
status: postponed
candidate_status: postponed
last_reviewed_at: <ISO>
last_decision: postponed
duplicate_reason: duplicate_of_terminal_sibling
evidence: "duplicate of posted candidates: <terminal_paths/permalinks>"
next_action: none
stale_after: "YYYY-MM-DD"  # last_reviewed_at から約 30 日後
```

staging Phase 2 には `pass` ではなく `postpone` または `stale_reviewed` として記録し、理由に `posted duplicate title sibling` と terminal path / permalink を残す。判定確認には必要に応じて次を使う。

```powershell
python tools\shared_reads_duplicate_preflight.py --title "<candidate frontmatter title>" --url "<candidate frontmatter url>"
```

判定結果を確認してから対象 candidate の frontmatter だけを更新する。mixed duplicate queue は引き続き派生 sidecar として扱い、group 全体の自動 close や sibling candidate の一括更新はしない。
