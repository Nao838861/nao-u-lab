---
phase: 3
name: Shared-reads 投稿
focus: pass した candidate を #shared-reads に投稿するか最終判定し、投稿する場合は Log_cdx 自身の深い分析として 1 件ずつ出す
estimated_time: 20-40 min per post
inputs: [Phase 2 staging, memory/shared_reads_phase3_queue.jsonl, memory/shared_reads_phase3_handoff_inbox.jsonl, pass 判定 candidate ファイル]
outputs: [Slack #shared-reads メッセージ, candidate ファイル posted/postponed 情報, staging Phase 3 セクション]
---

# Phase 3: Shared-reads 投稿

`status` / `candidate_status` がともに `ready_to_post` の candidate だけを扱う。同一 cycle の Phase 2 pass に限定せず、永続 handoff ledger の oldest pending を復元する。ここでは「投稿すること」ではなく、#shared-reads に残す価値がある分析として完成しているかを最終判定する。

## 跨 cycle 配送と処理 budget

Phase 3 の開始時に候補 frontmatter から queue を再生成し、staging header の cycle ID で ledger へ冪等 enqueue する。その後、oldest pending を1件だけ取得する。current-cycle pass も同じ queue に入り、1 cycle の投稿・postpone・defer・invalidate の合計 budget は1件とする。

```powershell
python tools\build_shared_reads_phase3_queue.py
python tools\shared_reads_phase3_handoff.py enqueue --source-cycle-id "<staging header cycle id>"
python tools\shared_reads_phase3_handoff.py pending --limit 1
```

`memory/shared_reads_phase3_queue.jsonl` は再生成可能な表示で、跨 cycle の正本は `memory/shared_reads_phase3_handoff_inbox.jsonl` である。queue / handoff の `action` は `normal_post` または `recover_existing_post`。healthy な posted-source index で URL/work 一致と permalink が揃う candidate は除外せず、後者として enqueue する。index が stale、permalink 欠落、title-only 一致の場合は recovery にしない。同一 state fingerprint の既存 handoff は除外し、`evaluated_at` が古い順に並ぶ。candidate frontmatter は enqueue 時に変更しない。

pending item の `delivery_action` が `invalidate` の場合は、candidate 状態が選定時から変わっている。投稿せず、現在 frontmatter と staging evidence を付けて `invalidated` で閉じる。`complete_receipt` の場合は、Slack permalink または途中 decision が既に ledger にあるため再投稿せず、candidate / staging の不足だけを補完して resolve する。

`action: recover_existing_post` は新規投稿ではない。candidate fingerprint を再確認し、duplicate preflight が `skip`、posted-source index が healthy、URL/work が exact verified match、permalink と provenance が揃う時だけ、既存 Slack 投稿を candidate lifecycle へ回収する。Slack API の投稿処理は呼ばない。条件が欠けた場合は candidate を変更せず pending のまま残す。

## 現行投稿ルール

#shared-reads は Log_cdx 自身の分析を残す場所である。Mir / Ash / Log への問いかけ、作業依頼、役割分担、議論の呼びかけを書かない。過去の候補やドラフトに旧運用の文面が残っている場合は、追記で補足せず、現行ルールに合わせて本文を置換する。

禁止例:
- 「Mir には...」
- 「Ash には...」
- 「Log には...」
- 「みんなで検討して」
- 「他 AI に聞きたい」
- 「この観点で誰かに返してほしい」

投稿本文は、Log_cdx が元記事を読んだ立場で、記事固有の内容を深く分析し切る。最後に問いを投げて終えず、Log_cdx の判断として「何が使えるか」「何が危ないか」「どう検証するか」まで書く。

## 投稿してよい条件

以下をすべて満たす場合だけ投稿する。

- 記事/論文の中身を読まなくても、問題設定、着想、手法の中核、評価の中身、結論が分かる。
- テンプレート文ではなく、その記事固有の手法、実験、失敗条件、限界を書いている。
- 我々のゲーム制作、headless 評価、記憶システム、制作サイクルのどこに使えるかが具体化されている。
- 採用できる要素と危ない要素を分けている。
- 3500-4500 字程度の密度がある。短い紹介、候補メモ、1 行サマリは投稿しない。
- 1 candidate を 1 回の `chat.postMessage` に収める。分割投稿しない。

満たせない場合は投稿せず、candidate を `postponed` に戻し、staging に理由を書く。撤退は失敗ではなく品質維持である。

## 必須フォーマット

本文は必ず `■ 概要` から始め、URL は最後の `■ URL` にまとめる。項目名と順序は固定する。

```text
■ 概要
<記事/論文を読まなくても中核が分かる密度で書く。問題設定、着想、手法、評価、結論を含める。>

■ 内容分析
<Log_cdx 自身の分析。記事固有の手法、評価指標、前提、失敗条件、限界を書く。>

■ 自分達の環境への適用
<我々のゲーム制作、headless 評価、記憶システム、制作サイクルへどう落とすかを書く。必要なら小さな検証案まで書く。>

■ メリット・デメリット
<採用できる要素と、移植すると危ない要素を分けて書く。>

■ 判定
<採用 / 部分採用 / 保留 / 不採用を、根拠付きで短く書く。問いかけで終えない。>

■ URL
<参照 URL。複数ある場合もここにまとめる。>
```

## 投稿前レビュー

投稿直前に本文を自己レビューする。次の文字列や同等表現が含まれていたら投稿禁止とし、Log_cdx 自身の分析文へ書き換える。

- `Mir`
- `Ash`
- `Log には`
- `みんな`
- `問いかけ`
- `検討してほしい`
- `返してほしい`

さらに次を確認する。

- `■ 概要` から始まっている。
- `■ URL` が末尾にある。
- URL が本文冒頭やタイトル行に散っていない。
- candidate ごとの固有内容になっている。
- 他 candidate や過去投稿のテンプレートを貼り回していない。

## 手順

1. Phase 3 queue を再生成して ledger へ enqueue し、oldest pending を1件だけ取得する。0件なら no-op とする。
2. `delivery_action` が `invalidate` なら投稿せず `invalidated` receipt を記録して終了する。`complete_receipt` なら Slack へ再投稿せず、既存 permalink を使って手順8の完了条件だけを回復する。
3. candidate ファイルと参照 URL の本文を読む。web_research キャッシュがあれば使い、足りなければ元 URL を確認する。
4. 投稿直前に candidate の state fingerprint と duplicate preflight を再確認し、結果を staging に残す。

```powershell
python tools\shared_reads_duplicate_preflight.py --title "<candidate title>" --url "<candidate url>"
```

5. state fingerprint が変わっていれば `invalidated` で閉じる。`normal_post` で preflight が `skip` / `review`、または投稿条件を満たさない場合は投稿せず candidate を `postponed` に戻し、frontmatter と staging を更新して `postponed` receipt を閉じる。`recover_existing_post` では preflight `skip` が成功条件であり、`continue` / `review` は回収せず pending に残す。
6. 投稿する場合は必須フォーマットで本文を書き、投稿前レビューを通す。旧フォーマットの「要約」「メリット」「デメリット／注意点」は使わず、「概要」「メリット・デメリット」へ置換する。
7. `normal_post` は `tools/slack_client.py` の `post_message` を使い、#shared-reads に 1 candidate だけ投稿する。スレッド返信は禁止。Slack の一時失敗時は candidate を `ready_to_post` のまま保ち、`retry_after` を付けて `defer` する。`recover_existing_post` は投稿処理を呼ばず、handoff の `posted_source_permalink` を使う。
8. 新規投稿成功時は candidate frontmatter と staging を先に更新する。既投稿回収時は staging evidence を用意してから `recover-existing` を実行する。この command が fingerprint と healthy index を再検証し、raw Slack receipt から `ts` / `permalink` / `char_count` / `posted_at` を復元して candidate と terminal receipt を更新する。推測値を入れない。

```yaml
posted:
  ts: <slack ts>
  permalink: <url>
  char_count: <int>
  posted_at: <ISO>
status: posted
candidate_status: posted
last_reviewed_at: <ISO>
last_decision: posted
evidence: <Slack permalink>
next_action: none
```

9. candidate / staging の両 evidence が揃った後に handoff を resolve する。投稿成功は preflight `continue` と Slack permalink も必須である。resolve が `partial` の場合、ledger は pending のままなので再投稿せず不足 evidence を補う。

```powershell
python tools\shared_reads_phase3_handoff.py resolve --id <p3h-id> --decision posted --reason "<根拠>" --preflight-decision continue --preflight-evidence "<staging preflight evidence>" --permalink "<Slack permalink>" --candidate-evidence "<candidate posted block>" --staging-evidence "<Phase 3 posted entry>"
python tools\shared_reads_phase3_handoff.py recover-existing --id <p3h-id> --staging-evidence "<Phase 3 recovered entry>"
python tools\shared_reads_phase3_handoff.py resolve --id <p3h-id> --decision postponed --reason "<根拠>" --preflight-decision <continue|review|skip> --preflight-evidence "<staging preflight evidence>" --candidate-evidence "<candidate lifecycle fields>" --staging-evidence "<Phase 3 skipped entry>"
python tools\shared_reads_phase3_handoff.py resolve --id <p3h-id> --decision defer --reason "<Slack 一時失敗>" --preflight-decision continue --preflight-evidence "<staging preflight evidence>" --staging-evidence "<Phase 3 deferred entry>" --retry-after "<ISO 8601>"
python tools\shared_reads_phase3_handoff.py resolve --id <p3h-id> --decision invalidated --reason "<状態変更>" --candidate-evidence "<current frontmatter>" --staging-evidence "<Phase 3 invalidated entry>"
```

10. staging Phase 3 セクションに投稿結果、撤退理由、defer、invalidate のいずれかを書く。

```yaml
posted:
  - candidate: <path>
    permalink: <url>
    char_count: <int>
skipped:
  - candidate: <path>
    reason: <理由>
    action: postpone | candidate_revise
delivery:
  handoff_id: <p3h-...>
  decision: posted | postponed | deferred | invalidated
  delivery_mode: new_post | recovered_existing
  evidence: <candidate / staging / permalink>
```

## 起動時に確認する directive

- `D:\AI\Nao_u_BOT\GPT\memory\directive_shared_reads_overview_20260512.md`
- `D:\AI\Nao_u_BOT\GPT\memory\directive_shared_reads_candidate_gate_20260512.md`

両方とも `status: active`。ただし現在の投稿ルールはこのファイルの「現行投稿ルール」を優先する。過去の「他エージェントへ問いを振る」型の運用は採用しない。
