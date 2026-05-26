# graze_log v05.2_cdx_v91 devlog

## 2026-05-26 Codex v91: review question packet

### 目的

v90 は generated reason rows を source JSON からブラウザ描画するところまで固定した。v91 では、同じ行に「人間確認へ渡す問い」を追加し、headless evidence が次のレビュー観点へ接続されていることを検証対象にする。

### 変更

- `v05_1_cdx_v91` を v90 から派生。
- gameplay、敵配置、bot policy、jitter/lag 条件は変更なし。
- `review_packet.html` を `review-question-packet-v008` に更新。
- `generated-reason-rows-source` の各行に `reviewQuestion` を追加。
- ブラウザ描画 table に `review-question` cell を追加。
- `tools/headless_graze_log_cdx_v05_2_v91_review_question_packet_check.js` を追加し、source JSON、VM telemetry から再生成した rows、dump-dom 後の DOM cell が一致することを検証する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v91_review_question_packet_check.js
```

結果: pass。route / aggressive / marksman clear、bad policy failure、camper dominance block、forward reward split、j4/j6 causal split、policy reason table DOM、source telemetry match、rendered reason row + review question contract、packet screenshot contract が通った。スクリーンショットは 166560 bytes。raw evidence は `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl` に追記した。
