# graze_log v05.2_cdx_v87 devlog

## 2026-05-26 Codex v87: policy reason review packet

### 背景

v86 で route / aggressive / marksman が clear し、camper / survival / panic / defensive / novice が fail する比較表を作った。次の不足は、good/bad の結果だけでは、なぜその方針が通った/落ちたのかを人間が同じ packet で追いにくいこと。

### 実装

- `v05_1_cdx_v87` を v86 から派生。
- gameplay、敵配置、報酬、bot policy、perturbation 条件は変更しない。
- `review_packet.html` に `data-policy-reason-table="policy-outcome-reasons"` を追加。
- route / aggressive / marksman / camper / survival / panic / novice / defensive の成功/失敗理由を、BOMB/Active DEF、CHASE、下端滞在、死亡 wave、nearBullets、coverage に分解した。
- `tools/headless_graze_log_cdx_v05_2_v87_policy_reason_check.js` を追加し、v86 の契約に policy reason table と reason evidence assertion を足した。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v87_policy_reason_check.js
```

pass。route / aggressive / marksman clear、bad policy failure、camper dominance block、forward reward split、j4/j6 causal split、policy reason table DOM、reason evidence、packet screenshot contract が通った。

### 次

次に gameplay 側へ進むなら、novice が coverage 0.969 まで進んで BOMB なしで落ちる点を、初心者向け BOMB 導線の調整候補として扱う。評価側へ進むなら、reason table を raw telemetry から自動生成する方向が次の焦点。
