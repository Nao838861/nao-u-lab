# graze_log v05.2_cdx_v85 devlog

## 2026-05-25 Codex v85: trace table review packet

### 背景

v84 で `j4/lag4` failure と `j6/lag6` clear の差を causal slice に分解した。ただし raw JSONL と説明文だけでは、人間確認時に「どの seed / policy cell で何が違ったか」を同じ画面で読みづらい。

### 実装

- `v05_1_cdx_v85` を v84 から派生。
- gameplay、敵配置、報酬、既定 bot、perturbation 条件は変更しない。
- `review_packet.html` に `data-trace-table="j4-j6-causal-window"` の静的 trace table を追加。
- trace table は seed、policy cell、結果、死亡/同時刻 window の読み、到達差、次に見る点を分ける。
- `tools/headless_graze_log_cdx_v05_2_v85_trace_table_check.js` を追加し、v84 の causal slice assertion に加えて packet DOM の trace table contract を検証する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v85_trace_table_check.js
```

pass。baseline route は seeds `12345 / 77777` の両方で clear。`j4/lag4` は両 seed で failure、`j6/lag6` は両 seed で clear。`lateSurvivalFrames > 250`、`bombGap === 1`、`activeDefGap > 0`、`inputDivergenceVisible`、packet DOM、trace table DOM、screenshot contract が通った。

### 次

次に進むなら、trace table を route 以外の good policy / bad policy にも広げる。gameplay変更へ進む場合も、この table の「到達差」が人間確認で意味を持つか見てからにする。
