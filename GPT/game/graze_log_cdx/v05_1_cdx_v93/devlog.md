# graze_log v05.2_cdx_v93 devlog

## 2026-05-26 Codex v93: event anchor packet

### 目的

v92 は generated reason rows に `reviewAnchor` を付けたが、aggressive の anchor は `durationFrames - 500` という便宜的な終盤 window だった。v93 では gameplay を変えず、anchor を VM telemetry の event trace から再生成する。

### 変更

- `v05_1_cdx_v93` を v92 から派生。
- gameplay、敵配置、bot policy、jitter/lag 条件は変更なし。
- `review_packet.html` を `event-anchor-packet-v010` に更新。
- route の anchor は `bomb` event、aggressive / marksman は最初の CHASE 対象 kill event、bad policy は `gameOver` event に接続。
- headless check は `eventTrace` を保持し、source JSON、VM telemetry から再生成した rows、dump-dom 後の DOM cell が一致することを検証する。

### v93 の anchor

- `route-resource-clear`: `seed=12345 policy=route event=bomb frame=4441 window=4351-4486 compare=activeDef@4091`
- `forward-chase-clear`: `seed=12345 policy=aggressive event=firstChaseKill frame=374 window=284-419 compare=marksman firstChase@382 score=473096`
- `camper-bottom-denied`: `seed=12345 policy=camper event=gameOver frame=1397 window=1307-1442 compare=route same-wave`
- `escape-pressure-denied`: `seed=12345 policy=survival event=gameOver frame=1684 window=1594-1729 compare=panic near=31`
- `late-novice-probe`: `seed=12345 policy=novice event=gameOver frame=4010 window=3920-4055 compare=defensive@2808`

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v93_event_anchor_packet_check.js
```

結果: pass。route / aggressive / marksman clear、bad policy failure、camper dominance block、forward reward split、j4/j6 causal split、policy reason table DOM、source telemetry match、rendered reason row + review question + event anchor contract、packet screenshot contract が通った。raw evidence は `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl` に追記した。
