# Spearman ρ 実測結果 (C279 Phase 4, 2026-06-01)

## 概要

`proxy_icc_diagnose.py --metric spearman` (C279 Phase 4 拡張) で
`proxy_vs_judgment_labeled.csv` (10 seed_base × 3 v_label × 30 trial = 900 行) に対し
行単位 Spearman ρ + bootstrap percentile 95% CI (N=1000) を計算。

PEARSON_BLOCKER.md §6-3 (b) 相対軸 gate の閾値 ρ ≥ 0.5 を判定基準とする。

## 計算条件

- 入力: `proxy_vs_judgment_labeled.csv`
- class-col: `v_label` (3 クラス、N=3)
- vs-col: 6 judgment 列 (q_a / q_intro / q_success_fb / q_d / q_c / q_e) を網羅
- bootstrap-n: 1000
- seed: 42 (再現性確保)
- 純 stdlib (random / math のみ、numpy/scipy 不使用)

## judgment 列の構造観察

| 列 | 値分布 | v_label との対応 |
|---|---|---|
| q_a | 5 のみ (900/900) | 全行同値、分散ゼロ |
| q_intro | 4 (300) / 4.5 (600) | v001=4、v002/v003=4.5 |
| q_success_fb | 3 のみ (900/900) | 全行同値、分散ゼロ |
| q_d | 3.5 (300) / 4.5 (600) | v001=3.5、v002/v003=4.5 |
| q_c | "" (300) / 4.5 (600) | v001=空、v002/v003=4.5 (300 行 skip) |
| q_e | 5 のみ (900/900) | 全行同値、分散ゼロ |

判定値は **v_label 軸のみで変動 (v001 vs v002+v003 の 2 水準)**、proxy 4 列は
seed_base × run_id 軸で変動。両者の変動軸が直交しているため Spearman ρ の
期待値は構造的に 0。

## 実測値 (4 proxy 列 × 6 judgment 列 = 24 セル)

### vs=q_a (全 5 固定、分散ゼロ)

| column | ρ | 95% CI | judge (≥0.5) |
|---|---:|---|:-:|
| proxy_clear_rate | 0.0000 | [0.0000, 0.0000] | FAIL |
| proxy_damage_per_min | 0.0000 | [0.0000, 0.0000] | FAIL |
| proxy_survival_time | 0.0000 | [0.0000, 0.0000] | FAIL |
| proxy_input_density | 0.0000 | [0.0000, 0.0000] | FAIL |

### vs=q_intro (4 / 4.5 の 2 水準、v_label 軸変動)

| column | ρ | 95% CI | judge (≥0.5) |
|---|---:|---|:-:|
| proxy_clear_rate | 0.0000 | [-0.0708, 0.0629] | FAIL |
| proxy_damage_per_min | 0.0000 | [-0.0633, 0.0665] | FAIL |
| proxy_survival_time | 0.0000 | [-0.0642, 0.0649] | FAIL |
| proxy_input_density | 0.0000 | [-0.0657, 0.0697] | FAIL |

### vs=q_success_fb (全 3 固定、分散ゼロ)

| column | ρ | 95% CI | judge (≥0.5) |
|---|---:|---|:-:|
| proxy_clear_rate | 0.0000 | [0.0000, 0.0000] | FAIL |
| proxy_damage_per_min | 0.0000 | [0.0000, 0.0000] | FAIL |
| proxy_survival_time | 0.0000 | [0.0000, 0.0000] | FAIL |
| proxy_input_density | 0.0000 | [0.0000, 0.0000] | FAIL |

### vs=q_d (3.5 / 4.5 の 2 水準、v_label 軸変動)

| column | ρ | 95% CI | judge (≥0.5) |
|---|---:|---|:-:|
| proxy_clear_rate | 0.0000 | [-0.0708, 0.0629] | FAIL |
| proxy_damage_per_min | 0.0000 | [-0.0633, 0.0665] | FAIL |
| proxy_survival_time | 0.0000 | [-0.0642, 0.0649] | FAIL |
| proxy_input_density | 0.0000 | [-0.0657, 0.0697] | FAIL |

### vs=q_c (300 行 skip、残 600 行は全 4.5)

| column | ρ | 95% CI | judge (≥0.5) |
|---|---:|---|:-:|
| proxy_clear_rate | 0.0000 | [0.0000, 0.0000] | FAIL |
| proxy_damage_per_min | 0.0000 | [0.0000, 0.0000] | FAIL |
| proxy_survival_time | 0.0000 | [0.0000, 0.0000] | FAIL |
| proxy_input_density | 0.0000 | [0.0000, 0.0000] | FAIL |

### vs=q_e (全 5 固定、分散ゼロ)

| column | ρ | 95% CI | judge (≥0.5) |
|---|---:|---|:-:|
| proxy_clear_rate | 0.0000 | [0.0000, 0.0000] | FAIL |
| proxy_damage_per_min | 0.0000 | [0.0000, 0.0000] | FAIL |
| proxy_survival_time | 0.0000 | [0.0000, 0.0000] | FAIL |
| proxy_input_density | 0.0000 | [0.0000, 0.0000] | FAIL |

## 解釈

### §6-3 (b) 相対軸 gate 判定: 全 24 セル FAIL

24 セル中 24 セルで ρ = 0.0000、bootstrap CI も最大 ±0.07 の狭幅で
0 を貫通 = 統計的にも ρ ≠ 0 を主張できない。閾値 ρ ≥ 0.5 を 1 セルも越えず、
**相対 Spearman 軸 (b) は本データ構造に対して計算可能だが PASS 不能**。

### Pearson 軸 (a) との比較

| 軸 | 計算可能性 | 判定 |
|---|---|---|
| (a) 絶対 Pearson | ICC FAIL ⇒ 計算不能 | 計算可能化のために class 軸切替試行も seed_base/v_label 両で FAIL (C278 Phase 5 確定) |
| (b) 相対 Spearman | 計算可能 | 24 セル全 FAIL (本 C279 Phase 4 確定) |

両軸とも gate 解除不能 = **`proxy_vs_judgment_labeled.csv` の現データ構造では
proxy と judgment の関連性を統計的に主張できない**。

### 構造的理由

判定値 6 列は v_label 軸のみで動き、proxy 4 列は seed_base × run_id 軸で動く。
v002 と v003 の judgment は全列同値 (Mir 5/31 self-judgment 設計時に意図的同値か、
判定セット未分化の副作用かは別軸検討)、v001 vs v002+v003 の 2 水準でも
proxy 側との対応関係が seed/run 内で固定されていない。

これは原理的に解消可能で、以下のいずれかを実装すれば §6-3 (b) は再評価対象に戻る:

1. **proxy 側に v_label 依存パラメータを入れる** (C277 PEARSON_BLOCKER 末尾で言及済):
   `agent_difficulty_proxy.js` に cast cooldown / dash duration の version 別チューニングを
   組込み、(seed_base, run_id, v_label) ごとに proxy を再生成
2. **judgment 側を per-run に分化させる** (本サイクル時点で未実装):
   現状 judgment は per-version の 1 セット固定。30 trial × 3 version の trial 単位で
   個別判定値を入れれば、proxy ↔ q の per-row 共変動が観測対象に入る
3. **proxy / judgment の比較粒度を per-version 集計値に変える** (本サイクル時点で N=3 制約):
   v001/v002/v003 の per-version mean を 3 点としてランク比較。ただし N=3 では Spearman の
   有意域が極端に狭く、bootstrap も within-class 変動を伝播させづらい

### retention 軸との統計装置共有 (C279 Phase 2 §1 角度 A 接続)

本 Spearman 実装 (純 stdlib rank + bootstrap percentile CI) は、memory_redesign.md
retention 軸の「observed_retention = 読み出し頻度 × 引用方向の自己回帰」推定で
予測ランクと実測ランクを比較する装置として転用可能。

具体的には sense_prediction_log.md の予測 vs 実測ペアに対し、本 `proxy_icc_diagnose.py`
の `spearman_rho` / `bootstrap_spearman_ci` 関数を**他ツールから import 使用**
することで、新規実装ゼロで retention 観測値推定の機械化に流用できる。
Spearman 路線確定 = ゲーム評価系統と記憶階層評価系統の統計装置一本化。

## Phase 4 完遂対応

- (1) `--metric spearman` オプション追加 — **OK** (純 stdlib 維持、numpy/scipy 不使用)
- (2) 入力 `proxy_vs_judgment_labeled.csv` (900 行、`v_label` 既に揃ってる) — **OK**
- (3) 4 列 × Spearman ρ + bootstrap 95% CI + 閾値判定 stdout 出力 exit 0 — **OK** (上記表 24 セル全 FAIL)
- (4) PEARSON_BLOCKER.md §Spearman 路線確定 節追記 — Phase 4 次ステップ
- (5) log_autonomous_game.md L140 前に C279 セクション挿入 — Phase 4 次ステップ
- (6) ローカル commit prefix `game:` で着地 (push は障害解消後) — Phase 4 末尾
- (7) ICC mode 後方互換維持 — **OK** (C275 値 0.0044/-0.0010/-0.0112/-0.0191 + C277 値 -0.0033 全て完全一致)

## 関連

- `proxy_icc_diagnose.py` (C279 拡張本体)
- `PEARSON_BLOCKER.md` §6-3 (b) 相対軸 gate (本実装が計算可能化した節)
- `../../../projects/log_autonomous_game.md` C279 セクション (2026-06-01 追記)
- `../../../projects/memory_redesign.md` 2026-06-01 (Log C279 Phase 2) 節 (retention 軸 Log 独自 3 角度、本実装と統計装置共有)
- `#all-nao-u-lab` ts=1780292826 (Log C279 Phase 2 §1 retention 軸 Log 独自 3 角度投稿)
- `#shared-reads` ts=1780292834 (Log C279 Phase 2 §2 RLM 詳細分析、retrieval 戦略軸独立到達)
