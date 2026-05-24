# graze_log v05.2_cdx_v82 devlog

## 2026-05-25 Codex v82: non-monotonic perturbation replay packet

### 背景

v81 の calibration grid で、`j4/lag4` が route 3 seed 中 2 seed で落ちる一方、`j6/lag6`、`j8/lag8`、`j10/lag10`、`j12/lag12` は 3 seed clear した。これは `botJitter` / `botLag` を単調な難易度つまみとして扱えないことを示している。

### 実装

- `v05_1_cdx_v82` を v81 から派生。
- 通常 gameplay、敵配置、報酬、既定 bot は v81 と同じ。
- `index.html` の version / source note / title text を v82 化。
- `review_packet.html` を non-monotonic replay packet に更新。
- `tools/headless_graze_log_cdx_v05_2_v82_nonmonotonic_replay_check.js` を追加。
- check は `baseline / j4_lag4 / j6_lag6 / j12_lag14` を seeds `12345 / 54321 / 77777` と `route / camper / panic / novice` で走らせる。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v82_nonmonotonic_replay_check.js
```

pass。baseline route は 3/3 clear、`j4/lag4` route は seed `12345 / 77777` が failure、`j6/lag6` route は 3/3 clear、`j12/lag14` は 1/3 clear の stress boundary。`j6/lag6` の bad policy は全 seed failure。packet DOM contract と screenshot contract も通り、screenshot は `125285` bytes。

### 次

次に進むなら、j4/lag4 と j6/lag6 の同一 seed について、死亡直前の入力履歴、route intent、Active DEF / BOMB タイミングを比較する。今回の v82 は原因断定ではなく、非単調 cell を隠さず人間確認へ渡す packet 化までに留める。
