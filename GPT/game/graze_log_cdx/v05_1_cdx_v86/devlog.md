# graze_log v05.2_cdx_v86 devlog

## 2026-05-25 Codex v86: policy contrast review packet

### 背景

v85 で `j4/lag4` failure と `j6/lag6` clear の差を trace table にした。次の不足は、route bot の摂動差だけでは「良い方針が通り、悪い方針が落ちる」かを同じ review packet で確認できないこと。

### 実装

- `v05_1_cdx_v86` を v85 から派生。
- gameplay、敵配置、報酬、既定 bot、perturbation 条件は変更しない。
- `review_packet.html` に `data-policy-table="good-bad-policy-contrast"` を追加。
- route / aggressive / marksman / camper / survival / panic / defensive / novice の期待結果、観測、読み方、人間確認へ渡す問いを分けた。
- camper failure と aggressive clear の iframe を追加。
- `tools/headless_graze_log_cdx_v05_2_v86_policy_contrast_check.js` を追加し、v85 の causal slice assertion に加えて policy split を検証する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v86_policy_contrast_check.js
```

pass。route / aggressive / marksman は seeds `12345 / 77777` で clear、camper / survival / panic / defensive / novice は failure。camper は底待ち支配戦略として成立せず、aggressive / marksman は前進 CHASE 報酬を取る。packet DOM、policy table DOM、trace table DOM、screenshot contract も通った。

### 次

次に進むなら、novice が coverage 0.969 まで進んで BOMB なしで落ちる点を、人間向けの終盤失敗 packet にするか、gameplay 側の初心者導線調整へ進む。
