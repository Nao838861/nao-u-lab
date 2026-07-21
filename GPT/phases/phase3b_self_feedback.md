---
phase: 3b
name: Shared-reads 自己フィードバック
focus: 過去 shared-reads から 1 件だけ選び、Codex 自身の次回行動に小さく反映する
estimated_time: 15-25 min
inputs: [memory/atoms.jsonl, memory/MEMORY.md, log/cycle_staging_log_cdx.md, memory/shared_reads_self_feedback_state.json, memory/shared_reads_probe_lifecycle.jsonl]
outputs: [staging Phase 3b セクション, 必要なら小さな directive/probe/state 更新, adopt 時の probe lifecycle lease 1件]
---

# Phase 3b: Shared-reads 自己フィードバック

過去に #shared-reads へ投稿した高品質な知見を、Codex 自身の作業品質へ少しずつ還元する。

## このフェーズで集中すること

**1 サイクル 1 件だけ。知見を増やすのではなく、次回行動を少し良くする。**

Claude 側で起きがちな「重要そうな話を全部ルール化して自壊する」方向を避ける。恒久ルール追加は最終手段であり、通常は短い probe、評価観点、撤退条件、state の更新に留める。

## 入力の選び方

1. `memory/atoms.jsonl` または `memory/MEMORY.md` から、`source: slack_api/shared-reads` で `score >= 10` の atom を見る。
2. `memory/shared_reads_self_feedback_state.json` の `reviewed_source_ts` にないものを優先する。
3. 優先順位は以下:
   - Nao_u が明示的に「重要」「適切」「自分に反映してほしい」と評価したもの
   - `memory`, `harness`, `evaluation`, `agent`, `operation`, `game-design` の複数タグを持つもの
   - 最近の失敗や改善課題に直接つながるもの
4. 1 件だけ選ぶ。複数を同時に混ぜない。

## 判断指標

選んだ知見を、次の 6 指標で採点する。3 点満点。

```yaml
scores:
  relevance: 0-3        # 今の Codex 定時サイクルやゲーム制作に直結するか
  actionability: 0-3    # 次回行動に変換できるか
  evidence: 0-3         # shared-reads本文・原典・運用失敗の根拠があるか
  non_redundancy: 0-3   # 既存ルールと重複しないか
  risk_control: 0-3     # ルール肥大化・過剰抑制・矛盾のリスクが低いか
  reversibility: 0-3    # 試して駄目なら戻せるか
```

採用条件:

- `relevance >= 2`
- `actionability >= 2`
- `risk_control >= 2`
- `reversibility >= 2`
- 合計 `14` 以上

これを満たさない場合は、**反映しない**。読んだことだけ state に記録してよい。

## 反映先の優先順位

強い順に見えるが、実際には下ほど慎重に扱う。

1. **一時 probe**: 次サイクルで確認する 1-3 問のチェック。最優先。
2. **評価表**: game prototype、memory改善、Slack投稿など特定作業で見る指標。
3. **state 更新**: reviewed/source_ts、採用理由、見送り理由。
4. **小さな directive**: 既存の導線から読める短い `.md`。必要な場合のみ。
5. **AGENTS.md / phase prompt 変更**: 繰り返し失敗を防ぐ恒久ルールだけ。原則として 1 サイクル 1 件まで。

## 反映してはいけないもの

- 「良い話だった」だけで恒久ルールを増やす
- 既存ルールの言い換えを追加する
- 相反する知見を統合せずに並べる
- 禁止事項ばかり増やす
- `AGENTS.md` を第二の知識ベースにする
- 1 件の論文から全作業へ効く普遍ルールを作る

## probe lease / receipt contract (2026-07-21 Phase 4c)

`adopt_probe` または `adopt_metric` とする時は、採用を `active_probes` への保存だけで完了扱いにしない。次をすべて指定できる1件だけを operational active として lease する。

- `probe_id`: `memory/shared_reads_self_feedback_state.json` の `active_probes` に存在する ID
- `consumer_phase`: 実際に判断へ使う後続 phase
- `trigger_artifact`: before / after を比較できる具体的な成果物
- `expected_delta`: probe が変えるはずの判断を1行で記述
- `lease_due`: ISO-8601 の期限

```powershell
python tools\shared_reads_probe_lifecycle.py enqueue --probe-id "<probe_id>" --consumer-phase "<Phase 4a など>" --trigger-artifact "<path#section>" --expected-delta "<期待する判断差>" --lease-due "<ISO-8601>"
```

1 cycle に enqueue するのは1件だけ。同じ probe の pending lease があれば追加しない。consumer、artifact、判断差、期限のいずれかを指定できない知見は `adopt_probe` / `adopt_metric` にせず、`defer` または `reject` の state-only review に留める。probe 本文の正本は `active_probes`、運用状態の正本は `memory/shared_reads_probe_lifecycle.jsonl` とする。ledger にない legacy probe は dormant であり、operational active ではない。

## staging Phase 3b に記録

```yaml
self_feedback:
  selected:
    id: <atom id>
    source_ts: <ts>
    title: <title>
    reason: <なぜ今読むか>
  scores:
    relevance: <0-3>
    actionability: <0-3>
    evidence: <0-3>
    non_redundancy: <0-3>
    risk_control: <0-3>
    reversibility: <0-3>
    total: <sum>
  decision: adopt_probe | adopt_metric | adopt_directive | defer | reject
  change:
    summary: <何を変えたか。変えない場合は none>
    files: [<path>, ...]
  lease:  # adopt_probe / adopt_metric の時だけ必須。その他は null
    probe_id: <active_probes に存在する ID>
    consumer_phase: <後続 phase>
    trigger_artifact: <path#section>
    expected_delta: <期待する判断差>
    lease_due: <ISO-8601>
    enqueue_result: enqueued
  anti_bloat_check:
    adds_permanent_rule: true | false
    replaces_or_simplifies_existing: true | false
    conflict_checked: true | false
```

## 出力チェック

- 選んだ shared-reads atom は 1 件だけ
- 採点と採否理由が staging にある
- 恒久ルールを増やす場合、既存ルールとの重複・矛盾を明示確認している
- state に reviewed/source_ts が残っている
- adopt_probe / adopt_metric の場合は、具体的な lease 1件が ledger にあり、指定不能なら state-only review になっている
