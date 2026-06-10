# v003 verify.js — multi-seed (N=10) 4 軸 6 ペア相関 sweep

**起票**: 2026-06-10 C320 Phase 4 (Log)
**親**: [design_log.md §9](design_log.md) (C316 Phase 4 節) / [PEARSON_BLOCKER.md C285節](PEARSON_BLOCKER.md)
**素材**: [multi_seed_sweep_raw.json](multi_seed_sweep_raw.json) (`node verify.js --multi-seed-sweep 10` の生 JSON)
**前提**: [verify.js](verify.js) C320 Phase 4 差分 (`--multi-seed-sweep N` フラグ追加)
**起点**: [temporal_sensitivity.md](temporal_sensitivity.md) §4.3 結論 5「`instinct × temporal` Pearson 0.9959 の安定性 = N=5 少サンプル & strategy 分布の偏りによる疑似相関判定 = multi-seed (N≥10) 拡張で再検証必須」 + §7 「次サイクル課題」C316 残課題 (a)。C317-C320 で 4 サイクル遅延、本サイクル消化。

## 1. 設計 — なぜこれを測るか

[temporal_sensitivity.md §4.3](temporal_sensitivity.md) で 4 軸 6 ペアのうち 1 ペア (`instinct × temporal_inconsistency`) が Pearson 0.9959 = 強相関閾値 |r|≥0.9 を超過。**kaizen #140 段階3 family 統合の判定軸**: 強相関が真の冗長性 (4 軸 → 3 軸縮約発火候補) なのか、**5 strategy 二極分布 (`good` の `instinct=22, temporal=43` 一点が他 4 strategy `instinct≤3, temporal≤2` を線形回帰で支配) による疑似相関**なのかを N=5 単一観測では区別不能。

本サイクル C320 で N=10 seed × 5 strategy = 50 セル sweep を実行し:
1. 各 seed で 5 strategy 全体 N=5 の 6 ペア Pearson/Spearman を独立算出 = 計 60 相関値
2. seed 軸 (N=10) で 6 ペア各々の分布 (mean / std / min / max) を算出
3. 焦点ペア `instinct × temporal_inconsistency` Pearson 分布の `std` を判定基準にする:
   - `mean ≥ 0.9 && std < 0.1` → **REDUNDANCY_CONFIRMED** (4 軸 → 3 軸縮約発火候補)
   - `std ≥ 0.2` → **PSEUDO_CORRELATION** (strategy 二極分布、N=5 単一は信頼区間外)
   - `0.1 ≤ std < 0.2` → **HOLD** (N=20 拡張候補)
4. seed=20260527 の sweep 内行 vs sweep 外 baseline 再実行が bit 完全一致 = multi-seed ループが state を汚染しない数学的確証 (H-002〜H-008 + C313 + C316 同型論証 10 度目)

## 2. 計測条件

| 項目 | 値 |
|---|---|
| N (seed 数) | 10 |
| seed 系列 | [20260527, 20260528, ..., 20260536] 連続 10 値固定 |
| baseline seed | 20260527 (bit invariance 比較基準) |
| MAX_FRAMES | 5400 (90 秒) |
| INSTINCT_TRIGGER_PX | 50 (既定固定、env override 本モード無効化) |
| TEMPORAL_INCONSISTENCY_THRESHOLD_PX | 15 (既定固定) |
| strategy 数 | 5 (good / camper / lane-holder / blind-sweeper / nospecial) |
| 計測軸 | instinct_trigger_count / min_approach_p10 / cont_grazing_max / temporal_inconsistency_count |
| 合計 run 数 | 10 seed × 5 strategy + baseline 再実行 5 = 55 run |

実行: `cd game/log_autonomous_game/v003 && node verify.js --multi-seed-sweep 10`

## 3. 4 軸マトリクス (10 seed × 5 strategy)

### 3.1 survived_frames マトリクス

| seed | good | camper | lane-holder | blind-sweeper | nospecial |
|---|---:|---:|---:|---:|---:|
| 20260527 | 4162 | 319 | 284 | 378 | 545 |
| 20260528 | 4162 | 319 | 284 | 348 | 545 |
| 20260529 | 4162 | 319 | 284 | 313 | 545 |
| 20260530 | 4162 | 319 | 284 | 372 | 545 |
| 20260531 | 4162 | 319 | 284 | 508 | 545 |
| 20260532 | 4162 | 319 | 284 | 383 | 545 |
| 20260533 | 4162 | 319 | 284 | 328 | 545 |
| 20260534 | 4162 | 319 | 284 | 314 | 545 |
| 20260535 | 4162 | 319 | 284 | 273 | 545 |
| 20260536 | 4162 | 319 | 284 | 459 | 545 |
| **σ (seed 軸)** | **0** | **0** | **0** | **65.7** | **0** |

**重要観測**: **5 strategy 中 4 strategy (`good` / `camper` / `lane-holder` / `nospecial`) の survived_frames + 4 計測軸全てが seed 不変** = これら 4 strategy は決定論的 (mulberry32(seed) 由来の rng を strategy 内で参照しない)。**`blind-sweeper` のみが rng を strategy 内で参照** (`hypotheses.md` の castLock 不使用悪手仕様: ランダム dx/dy 移動) するため seed 依存変動を見せる。

→ **本 sweep の seed 軸変動は実質的に `blind-sweeper` の 1 点のみが seed ごとに動く構造**。Pearson std の小ささは「4/5 点が定数 + 1 点が動く」線形回帰の数学的帰結であり、4 軸独立性の真の評価ではなく **「`blind-sweeper` の seed 依存運動が `good` outlier 支配下の線形関係を破る能力があるか」のテスト**になっている。この構造的バイアスは §6 結論で重く取り扱う。

### 3.2 instinct_trigger_count マトリクス

| seed | good | camper | lane-holder | blind-sweeper | nospecial |
|---|---:|---:|---:|---:|---:|
| 20260527 | 22 | 1 | 2 | 3 | 2 |
| 20260528 | 22 | 1 | 2 | 6 | 2 |
| 20260529 | 22 | 1 | 2 | 1 | 2 |
| 20260530 | 22 | 1 | 2 | 2 | 2 |
| 20260531 | 22 | 1 | 2 | 6 | 2 |
| 20260532 | 22 | 1 | 2 | 3 | 2 |
| 20260533 | 22 | 1 | 2 | 2 | 2 |
| 20260534 | 22 | 1 | 2 | 1 | 2 |
| 20260535 | 22 | 1 | 2 | 1 | 2 |
| 20260536 | 22 | 1 | 2 | 5 | 2 |
| **σ (seed 軸)** | **0** | **0** | **0** | **1.99** | **0** |

`blind-sweeper` のみ seed 依存変動 (1〜6 件、σ=1.99)。他 4 strategy は seed 不変。

### 3.3 temporal_inconsistency_count マトリクス

| seed | good | camper | lane-holder | blind-sweeper | nospecial |
|---|---:|---:|---:|---:|---:|
| 20260527 | 43 | 0 | 0 | 0 | 2 |
| 20260528 | 43 | 0 | 0 | 1 | 2 |
| 20260529 | 43 | 0 | 0 | 1 | 2 |
| 20260530 | 43 | 0 | 0 | 1 | 2 |
| 20260531 | 43 | 0 | 0 | 4 | 2 |
| 20260532 | 43 | 0 | 0 | 1 | 2 |
| 20260533 | 43 | 0 | 0 | 1 | 2 |
| 20260534 | 43 | 0 | 0 | 0 | 2 |
| 20260535 | 43 | 0 | 0 | 1 | 2 |
| 20260536 | 43 | 0 | 0 | 2 | 2 |
| **σ (seed 軸)** | **0** | **0** | **0** | **1.10** | **0** |

`blind-sweeper` のみ変動 (0〜4 件、σ=1.10)。他 4 strategy は seed 不変。

### 3.4 min_approach_p10 / cont_grazing_max

`min_approach_p10` (連続値、距離 px) と `cont_grazing_max` (整数、連続 graze frame 数) も同様: `good`/`camper`/`lane-holder`/`nospecial` が seed 不変、`blind-sweeper` のみ変動。生値は `multi_seed_sweep_raw.json` `breakdown_per_seed.seed_*.blind-sweeper` 参照。

## 4. 4 軸 6 ペア独立性 — seed 軸分布 (N=10)

### 4.1 各 seed の `instinct × temporal_inconsistency` Pearson / Spearman

| seed | Pearson | Spearman |
|---|---:|---:|
| 20260527 | 0.9959 | 0.5735 |
| 20260528 | 0.9777 | 0.7632 |
| 20260529 | 0.9983 | 0.6489 |
| 20260530 | 0.9990 | 0.8030 |
| 20260531 | 0.9896 | 0.9211 |
| 20260532 | 0.9974 | 0.7632 |
| 20260533 | 0.9990 | 0.8030 |
| 20260534 | 0.9989 | 0.8250 |
| 20260535 | 0.9983 | 0.6489 |
| 20260536 | 0.9901 | 0.8652 |
| **mean** | **0.9944** | **0.7615** |
| **std** | **0.0065** | **0.1022** |
| **min** | **0.9777** | **0.5735** |
| **max** | **0.9990** | **0.9211** |

### 4.2 6 ペア全分布 (seed 軸 N=10)

**Pearson 分布 (mean / std / min / max)**:

| ペア | mean | std | min | max |
|---|---:|---:|---:|---:|
| instinct × min_approach_p10 | -0.2421 | 0.0862 | -0.3773 | -0.1169 |
| instinct × cont_grazing_max | 0.3602 | 0.1953 | 0.0852 | 0.5907 |
| **instinct × temporal_inconsistency** | **0.9944** | **0.0065** | **0.9777** | **0.9990** |
| min_approach_p10 × cont_grazing_max | 0.0036 | 0.3441 | -0.6378 | 0.3911 |
| min_approach_p10 × temporal_inconsistency | -0.1836 | 0.0982 | -0.3635 | -0.0577 |
| cont_grazing_max × temporal_inconsistency | 0.3880 | 0.2194 | 0.0493 | 0.6317 |

**Spearman 分布 (mean / std / min / max)**:

| ペア | mean | std | min | max |
|---|---:|---:|---:|---:|
| instinct × min_approach_p10 | -0.5487 | 0.2295 | -0.7182 | 0.0527 |
| instinct × cont_grazing_max | 0.2542 | 0.3030 | -0.1622 | 0.6579 |
| **instinct × temporal_inconsistency** | **0.7615** | **0.1022** | **0.5735** | **0.9211** |
| min_approach_p10 × cont_grazing_max | -0.1404 | 0.3610 | -0.6669 | 0.1539 |
| min_approach_p10 × temporal_inconsistency | -0.1428 | 0.1938 | -0.5643 | 0.1118 |
| cont_grazing_max × temporal_inconsistency | 0.6170 | 0.1615 | 0.2294 | 0.8030 |

### 4.3 判定 — staging §完遂の定義 5

焦点ペア `instinct × temporal_inconsistency` Pearson 分布 (mean=0.9944, std=0.0065):

| 基準 | 値 | 判定 |
|---|---|:-:|
| mean ≥ 0.9 | 0.9944 ✓ | satisfied |
| std < 0.1 | 0.0065 ✓ | satisfied |

→ **`verdict: REDUNDANCY_CONFIRMED — 4軸 → 3軸縮約発火候補 (kaizen #140 段階3 family統合 GO)`**

**ただし §3.1 で観測した構造的バイアスを §6 結論で重く扱う**: 5 strategy 中 4 strategy が seed 不変 = 「N=10 seed 軸分布」は実質的に「`blind-sweeper` 1 点のみが動く下での line fit 安定性測定」になっており、N=5 strategy 内の点群分布バイアス (`good` outlier 支配) は seed 拡張で解消されない。**Pearson の `std < 0.1` は「`blind-sweeper` の動きが `good` outlier 主導の線形関係を破らない」だけを示し、4 軸が真に冗長な軸であることの直接証拠ではない**。Spearman mean 0.7615 (中相関) の方が strategy 二極分布の影響を受けにくく、**順位レベルで見ると `instinct` と `temporal` は中相関 = 部分独立**。

## 5. bit 不変性 — sweep ループ state 汚染ゼロ確証 10 度目

seed=20260527 行 (sweep ループ内) と sweep 外 baseline 再実行 (`runOne(name, STRATEGIES[name], 20260527)`) の bit 完全一致比較:

| strategy | survived_frames | instinct | temporal | min_approach_p10 | cont_grazing_max |
|---|:-:|:-:|:-:|:-:|:-:|
| good | ✓ (4162=4162) | ✓ (22=22) | ✓ (43=43) | ✓ (52.24=52.24) | ✓ (6=6) |
| camper | ✓ (319=319) | ✓ (1=1) | ✓ (0=0) | ✓ (58.07=58.07) | ✓ (5=5) |
| lane-holder | ✓ (284=284) | ✓ (2=2) | ✓ (0=0) | ✓ (55.33=55.33) | ✓ (2=2) |
| blind-sweeper | ✓ (378=378) | ✓ (3=3) | ✓ (0=0) | ✓ (38.84=38.84) | ✓ (3=3) |
| nospecial | ✓ (545=545) | ✓ (2=2) | ✓ (2=2) | ✓ (93.05=93.05) | ✓ (5=5) |

**全 5 strategy × 5 軸 = 25 セル完全一致** (`bit_invariance.all_match: true`, sweep exit code = 0)。

これは:
- multi-seed ループ (50 run + 5 baseline run) が `runOne` の決定論性を破壊しない
- mulberry32(seed) 局所 rng は state 隔離 (関数内 local) のため seed 系列順序の影響を受けない
- INSTINCT_TRIGGER_PX = 50 / TEMPORAL_INCONSISTENCY_THRESHOLD_PX = 15 固定が sweep 前後で一貫
- H-002 (C297) / H-003 (C298) / H-004 (C298) / H-005 (C300) / H-006 (C302) / H-007 (C311) / C311 (本来 temporal) / C313 (INSTINCT sweep) / C316 (TEMPORAL sweep) に続く **同型論証 10 度目**

**audit 再走 (PX 既定条件)**: §7 で記載。

## 6. 結論

1. **焦点ペア `instinct × temporal_inconsistency` Pearson 分布**: mean=0.9944, std=0.0065, [0.9777, 0.9990] = 極めて狭い分布。verdict 判定基準 (mean≥0.9 && std<0.1) は **形式的に REDUNDANCY_CONFIRMED**

2. **ただし構造的バイアス**: 5 strategy 中 4 strategy が seed 不変 (rng 不参照の決定論的 strategy) = seed 軸変動は実質 `blind-sweeper` 1 点のみ。**Pearson std の小ささは「N=10 seed 拡張で点群が散る」ことの証明ではなく、「4 定数点 + 1 動点」構造下での回帰安定性のみを示す**

3. **N=5 strategy 二極分布バイアスは seed 拡張で解消されない**: `good` (`instinct=22, temporal=43`) と他 4 strategy (`instinct≤6, temporal≤4`) の二極構造が Pearson 線形回帰を支配する性質は、N=10 seed 拡張 (実質 `blind-sweeper` 1 軸変動) では破れない。**真の冗長性判定には strategy 集合の拡張 (現 5 → 例えば castLock 不使用悪手 +8 種 で N=13) が必要**

4. **Spearman mean 0.7615 (std=0.1022) = 中相関** = 順位レベルでは `instinct` と `temporal` は部分独立。**Pearson 0.9944 と Spearman 0.7615 のギャップ自体が「線形関係は数値 magnitude が `good` outlier に支配される一方、順位は seed 依存で動く」構造証拠**。**真の冗長性は両統計量で同時 |r|≥0.9 が必要**だが、Spearman は満たさない

5. **完全独立 (Pearson + Spearman 両方で |r| < 0.5 in mean & |max| < 0.5)** = 2 ペア:
   - `min_approach_p10 × cont_grazing_max` (Pearson mean 0.0036, std 0.34, [-0.64, 0.39]; Spearman mean -0.14)
   - `min_approach_p10 × temporal_inconsistency` (Pearson mean -0.18; Spearman mean -0.14)
   - **`min_approach_p10` 軸が他 3 軸と最も独立** = C316 §4.3 結論 3 と一致、本 sweep で確証強化

6. **kaizen #140 段階3 family 統合判定材料**:
   - 形式的 verdict (sweep exit JSON) = **REDUNDANCY_CONFIRMED**
   - 構造的解釈 (本 §3.1 + §6.2-4) = **strategy 集合バイアスにより冗長性は確証されず**
   - **総合判定**: kaizen #140 段階3 「`instinct → temporal` 軸統合」発火 **保留**。strategy 集合拡張 (castLock 不使用悪手 +N 種、N≥8 推奨) で真の N≥13 strategy 内分布が `good` outlier 依存を脱した時点で再判定。検証期限 2026-06-20 残 10 日のうちに strategy 拡張は実装コスト 1〜2 サイクル想定、**段階3 判定は本 sweep 結果単独で確定させず C321+ で再評価**

7. **probe 副作用ゼロ**: 5 strategy × seed=20260527 の sweep 内 vs sweep 外 baseline で 25 セル bit 完全一致 = multi-seed ループは state 汚染ゼロ (H-002〜H-008 + C313 + C316 同型論証 10 度目)

## 7. 回帰チェック (PX 既定条件) — 本サイクル C320 Phase 4 実測

| 監査 | 結果 | 備考 |
|---|---|---|
| `node bullet_origin_audit.js` | exit 0, **pass: true** | 10/10 checks (static_gate_guard / bullet_dir_fixed / offscreen_zero / d_shots_within_gate / c_shots_zero / max_enemy_step ≤ player_speed 等) |
| `node enemy_behavior_audit.js` | exit 0, **8/8 PASS** | enemy_a / enemy_d / enemy_c / wave_count / spawn_timing 等 |
| `node verify.js` (通常モード) | exit 0, **pass: true, survivors: []** | breakdown: good 4162 / camper 319 / lane-holder 284 / blind-sweeper 378 / nospecial 545 = sweep seed=20260527 行と bit 完全一致 (§5 bit invariance 再確認) |

**回帰チェック結論**: verify.js 末尾に追加した `--multi-seed-sweep` フラグ分岐 (約 180 行) は通常モード + 既存 sweep モード (`--sensitivity-sweep` / `--temporal-sensitivity-sweep`) + audit 系列に副作用ゼロ。pass: true 維持 + survivors 0 維持 + breakdown bit 一致 = 改修品質確証。

## 8. 次サイクル候補

1. **strategy 集合拡張**: 現 5 strategy → castLock 不使用悪手 +8 種 (例: zig-zag-narrow / random-rush / corner-stay / mid-orbit / vertical-bounce / triangle-loop / spiral-out / wave-rider) で N=13 strategy sweep。N=10 seed と組み合わせて 130 cell サンプル → 真の冗長性判定。実装コスト: 1〜2 サイクル (`STRATEGIES` 拡張 + game.js 影響ゼロ確認)

2. **`good` outlier 除外条件下の相関再算出**: 既存 raw JSON から `good` 行を除外した 4 strategy × 10 seed の Pearson/Spearman を post-hoc 算出 (実装ゼロ、生 JSON 再分析のみ)。これで `good` outlier 支配を取り除いた相関値を推定可能

3. **kaizen #140 段階3 family 統合判定の延期**: 段階3 検証期限 2026-06-20 の判定基準を「sweep verdict + strategy 拡張結果」に拡張。本 sweep 単独で判定確定させない

4. **次サイクル C321 着地候補**: §6.6 を `projects/log_autonomous_game.md` に明示、kaizen #140 段階3 を「strategy 拡張後再判定」状態に格上げ
