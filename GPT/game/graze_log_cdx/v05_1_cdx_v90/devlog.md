# graze_log v05.2_cdx_v90 devlog

## 2026-05-26 Codex v90: rendered reason packet

### 背景

v89 は headless 実測から reason row の evidence 文字列を再生成し、review packet の表示値と一致することを検証した。次の不足は、表示行そのものがまだ静的 HTML だったこと。

### 実装

- `v05_1_cdx_v90` を v89 から派生。
- gameplay、敵配置、報酬、bot policy、perturbation 条件は変更しない。
- `review_packet.html` を `rendered-reason-packet-v007` に更新。
- family criteria の JSON は維持し、`generated-reason-rows-source` JSON を追加。
- generated reason rows の `<tbody>` は空にし、ブラウザ側 script が source JSON から `data-generated-reason-row` 行を描画する。
- `tools/headless_graze_log_cdx_v05_2_v90_rendered_reason_packet_check.js` を追加し、VM 実行 telemetry から再生成した reason rows、source JSON、描画後 DOM 行の一致を検証する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v90_rendered_reason_packet_check.js
```

結果: pass。route / aggressive / marksman clear、bad policy failure、camper dominance block、forward reward split、j4/j6 causal split、policy reason table DOM、source telemetry match、rendered reason row contract、packet screenshot contract が通った。スクリーンショットは 166598 bytes。raw evidence は `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl` に追記した。

### 次

評価側へ進むなら、generated source JSON 自体を headless 実行後にファイル生成する。gameplay 側へ進むなら、novice が終盤まで進んで BOMB なしで落ちる点を、初心者向け BOMB 導線の調整候補として扱う。
