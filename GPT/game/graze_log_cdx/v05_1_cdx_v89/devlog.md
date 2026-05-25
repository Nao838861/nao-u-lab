# graze_log v05.2_cdx_v89 devlog

## 2026-05-26 Codex v89: generated reason table contract

### 背景

v88 は policy が成功/失敗した理由を JSON 契約に戻した。次の不足は、人間が見る evidence 文字列そのものが headless 実行 telemetry から再生成できる契約になっていないこと。

### 実装

- `v05_1_cdx_v89` を v88 から派生。
- gameplay、敵配置、報酬、bot policy、perturbation 条件は変更しない。
- `review_packet.html` を `generated-reason-table-v006` に更新。
- `generated-reason-table` JSON を維持し、route / forward / camper / escape / novice の family criteria を機械可読化。
- telemetry から生成した evidence 表を `data-generated-reason-table="telemetry-generated-policy-reasons"` として追加。
- `tools/headless_graze_log_cdx_v05_2_v89_generated_reason_table_check.js` を追加し、VM 実行 telemetry から `computedReasonFamilies` と `generatedReasonRows` を再構成して、source JSON、DOM reason row、generated evidence 表示値と一致するか検証する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v89_generated_reason_table_check.js
```

結果: pass。route / aggressive / marksman clear、bad policy failure、camper dominance block、forward reward split、j4/j6 causal split、policy reason table DOM、generated reason table JSON、source telemetry match、generated reason table contract、packet screenshot contract が通った。raw evidence は `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl` に追記する。

### 次

評価側へ進むなら、reason table の HTML 全体を raw telemetry から生成する。gameplay 側へ進むなら、novice が終盤まで進んで BOMB なしで落ちる点を、初心者向け BOMB 導線の調整候補として扱う。
