# graze_log v05.2_cdx_v84 devlog

## 2026-05-25 Codex v84: causal slice comparator

### 背景

v83 で `j4/lag4` failure と `j6/lag6` clear の同 seed 差を `botTrace` として保存した。次の課題は、trace をそのまま置くだけではなく、どの行動到達差として読めるのかを分けることだった。

### 実装

- `v05_1_cdx_v84` を v83 から派生。
- gameplay、敵配置、報酬、既定 bot は変更しない。
- `index.html` の version / history / title 表記を v84 causal slice 用に更新。
- `review_packet.html` を `bot-perturbation-causal-slice-v001` に更新。
- `tools/headless_graze_log_cdx_v05_2_v84_causal_slice_check.js` を追加。
- check は baseline / `j4_lag4` / `j6_lag6` を seeds `12345 / 77777` で実行し、`target divergence`、`late survival`、`Active DEF reach`、`BOMB reach` を `causalSlices` として保存する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v84_causal_slice_check.js
```

pass。baseline route は両 seed で clear。`j4/lag4` は両 seed で failure、`j6/lag6` は両 seed で clear。`lateSurvivalFrames > 250`、`bombGap === 1`、`activeDefGap > 0`、`inputDivergenceVisible`、packet DOM、screenshot contract が通った。

### 次

次に進むなら、v84 の causal slice を route 以外の good policy / bad policy にも適用する。あるいは人間確認用 packet に trace表を載せ、BOMB到達差と Active DEF 到達差が実プレイ上の意味を持つか確認する。
