# graze_log v05.2_cdx_v92 devlog

## 2026-05-26 Codex v92: review anchor packet

### 目的

v91 は generated reason rows に review question を付けた。v92 では同じ行に `reviewAnchor` を追加し、headless evidence と人間確認の問いを、実際に見る seed / policy / frame window へ接続する。

### 変更

- `v05_1_cdx_v92` を v91 から派生。
- gameplay、敵配置、bot policy、jitter/lag 条件は変更なし。
- `review_packet.html` を `review-anchor-packet-v009` に更新。
- `generated-reason-rows-source` の各行に `reviewAnchor` を追加。
- ブラウザ描画 table に `review-question` cell と `review-anchor` cell を分離して追加。
- `tools/headless_graze_log_cdx_v05_2_v92_review_anchor_packet_check.js` を追加し、source JSON、VM telemetry から再生成した rows、dump-dom 後の DOM cell が一致することを検証する。

### v92 の anchor

- `route-resource-clear`: `seed=12345 policy=route frame=4441 window=4351-4486 compare=activeDef@4091`
- `forward-chase-clear`: `seed=12345 policy=aggressive frame=3864 window=3774-3909 compare=marksman score=473096`
- `camper-bottom-denied`: `seed=12345 policy=camper frame=1397 window=1307-1442 compare=route same-wave`
- `escape-pressure-denied`: `seed=12345 policy=survival frame=1684 window=1594-1729 compare=panic near=31`
- `late-novice-probe`: `seed=12345 policy=novice frame=4010 window=3920-4055 compare=defensive@2808`

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v92_review_anchor_packet_check.js
```

結果: pass。route / aggressive / marksman clear、bad policy failure、camper dominance block、forward reward split、j4/j6 causal split、policy reason table DOM、source telemetry match、rendered reason row + review question + review anchor contract、packet screenshot contract が通った。スクリーンショットは `.tmp/graze_log_cdx_v92_review_anchor/v92_review_anchor_packet.png` に生成され、raw evidence は `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl` に追記した。
