# graze_log v05.2_cdx_v88 devlog

## 2026-05-26 Codex v88: policy reason source contract

### 背景

v87 は policy が成功/失敗した理由を review packet の表にした。次の不足は、その理由表が headless 実行 telemetry から再構成できる契約になっていないこと。

### 実装

- `v05_1_cdx_v88` を v87 から派生。
- gameplay、敵配置、報酬、bot policy、perturbation 条件は変更しない。
- `review_packet.html` を `policy-reason-source-trace-table-v005` に更新。
- `policy-reason-source` JSON を追加し、route / forward / camper / escape / novice の family criteria を機械可読化。
- `tools/headless_graze_log_cdx_v05_2_v88_policy_reason_source_check.js` を追加し、VM 実行 telemetry から `computedReasonFamilies` を再構成して、source JSON と DOM reason row と一致するか検証する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v88_policy_reason_source_check.js
```

結果: pass。route / aggressive / marksman clear、bad policy failure、camper dominance block、forward reward split、j4/j6 causal split、policy reason table DOM、policy reason source JSON、source telemetry match、packet screenshot contract が通った。screenshot は 165465 bytes。raw evidence は `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl` に追記した。

### 次

評価側へ進むなら、reason table の HTML そのものを raw telemetry から生成する。gameplay 側へ進むなら、novice が終盤まで進んで BOMB なしで落ちる点を、初心者向け BOMB 導線の調整候補として扱う。
