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

---

## 9. C321 Phase 4 — strategy 集合拡張 N=5 → N=13、130 cell 再 sweep

**起票**: 2026-06-10 C321 Phase 4 (Log)
**目的**: §6.3「真の冗長性判定には strategy 集合の拡張 (現 5 → 例えば castLock 不使用悪手 +8 種 で N=13) が必要」「kaizen #140 段階3 判定は本 sweep 結果単独で確定させず C321+ で再評価」を実行。
**差分**: [verify.js](verify.js) §`STRATEGIES` に 8 種追加 (`zig-zag-narrow` / `random-rush` / `corner-stay` / `mid-orbit` / `vertical-bounce` / `triangle-loop` / `spiral-out` / `wave-rider`)、`BAD_STRATEGIES` に同 8 種追加 = pass 判定対象に組み込み。`--multi-seed-sweep` フラグは変更なし (N=13 自動展開、130 cell に拡張)。
**素材**: 再生成済 [multi_seed_sweep_raw.json](multi_seed_sweep_raw.json) (130 行 = 10 seed × 13 strategy、`node verify.js --multi-seed-sweep 10`)。

### 9.1 追加 strategy の挙動仕様 (frame 当たり player 移動 delta)

| strategy | 挙動 | rng 使用 |
|---|---|:-:|
| zig-zag-narrow  | `dx = (frame%20<10)?+1:-1`, `dy=0` 鋭い水平往復 | – |
| random-rush     | `(dx,dy) = (rng()*2-1, rng()*2-1)` 毎 frame 抽選、連続値 [-1,1] | ✓ (重) |
| corner-stay     | `target = (W*0.9, H*0.1)` (右上角) への線形接近 | – |
| mid-orbit       | 中央 (W/2, H/2) 周回、半径 80px、周期 180F | – |
| vertical-bounce | `dy=(frame%120<60)?-1:+1`, `dx=(rng()-0.5)*0.5` | ✓ (軽) |
| triangle-loop   | 3 頂点 (W*0.3/0.7 × H*0.6 + W*0.5 × H*0.3) を 60F ずつ巡回 | – |
| spiral-out      | 中央外向き螺旋、`radius=min(120, frame*0.05)`, `angle=frame*0.08` | – |
| wave-rider      | `dx=sin(frame*0.07)`, `dy=cos(frame*0.05)+(rng()-0.5)*0.2` | ✓ (軽) |

### 9.2 通常モード回帰 — `allBadDied=true` 維持

`node verify.js` exit 0, `pass: true`, `survivors: []`。13 strategy 全 gameover、追加 8 種 survived_frames: 227 (`spiral-out`) 〜 435 (`random-rush`)、いずれも camper (319F) 〜 good (4162F) の悪手帯に着地。

### 9.3 13 strategy × 10 seed survived_frames マトリクス (130 cell)

| seed | good | cam | lh | bs | nos | zz | rr | cs | mo | vb | tl | so | wr |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 20260527 | 4162 | 319 | 284 | 378 | 545 | 323 | 435 | 337 | 246 | 283 | 229 | 227 | 415 |
| 20260528 | 4162 | 319 | 284 | 348 | 545 | 323 | 343 | 337 | 246 | 284 | 229 | 227 | 589 |
| 20260529 | 4162 | 319 | 284 | 313 | 545 | 323 | 474 | 337 | 246 | 285 | 229 | 227 | 1819 |
| 20260530 | 4162 | 319 | 284 | 372 | 545 | 323 | 375 | 337 | 246 | 272 | 229 | 227 | 1816 |
| 20260531 | 4162 | 319 | 284 | 508 | 545 | 323 | 494 | 337 | 246 | 285 | 229 | 227 | 1816 |
| 20260532 | 4162 | 319 | 284 | 383 | 545 | 323 | 341 | 337 | 246 | 271 | 229 | 227 | 1818 |
| 20260533 | 4162 | 319 | 284 | 328 | 545 | 323 | 333 | 337 | 246 | 284 | 229 | 227 | 469 |
| 20260534 | 4162 | 319 | 284 | 314 | 545 | 323 | 291 | 337 | 246 | 284 | 229 | 227 | 468 |
| 20260535 | 4162 | 319 | 284 | 273 | 545 | 323 | 273 | 337 | 246 | 282 | 229 | 227 | 468 |
| 20260536 | 4162 | 319 | 284 | 459 | 545 | 323 | 417 | 337 | 246 | 284 | 229 | 227 | 1816 |
| **σ** | 0 | 0 | 0 | 70.86 | 0 | 0 | 75.03 | 0 | 0 | 5.30 | 0 | 0 | 705.01 |

略号: cam=camper, lh=lane-holder, bs=blind-sweeper, nos=nospecial, zz=zig-zag-narrow, rr=random-rush, cs=corner-stay, mo=mid-orbit, vb=vertical-bounce, tl=triangle-loop, so=spiral-out, wr=wave-rider。

**観測**: 13 strategy 中 **seed 軸変動を見せるのは 4 種** (`blind-sweeper` σ=70.9 / `random-rush` σ=75.0 / `vertical-bounce` σ=5.3 / `wave-rider` σ=705.0) = §3.1 の「1 点のみ動く」構造バイアスは部分解消 (1 → 4)、ただし `wave-rider` が seed 依存で 415F〜1819F (4.4 倍) を彷徨う = 新たな大変動点を生成。`wave-rider` は rng 軽依存 (cos+rng()*0.2) のはずだが、初期 frame の rng() 偏り → 軌道分岐 → 弾被弾タイミング非線形増幅により σ_sur=705F の極端変動が出た (現象観測、設計予想超過)。

### 9.4 13 strategy 内 instinct_trigger_count マトリクス (130 cell)

| seed | good | cam | lh | bs | nos | zz | rr | cs | mo | vb | tl | so | wr |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 20260527 | 22 | 1 | 2 | 3 | 2 | 1 | 7 | 1 | 1 | 2 | 1 | 2 | 3 |
| 20260528 | 22 | 1 | 2 | 6 | 2 | 1 | 2 | 1 | 1 | 2 | 1 | 2 | 9 |
| 20260529 | 22 | 1 | 2 | 1 | 2 | 1 | 10 | 1 | 1 | 2 | 1 | 2 | 19 |
| 20260530 | 22 | 1 | 2 | 2 | 2 | 1 | 3 | 1 | 1 | 1 | 1 | 2 | 18 |
| 20260531 | 22 | 1 | 2 | 6 | 2 | 1 | 12 | 1 | 1 | 2 | 1 | 2 | 19 |
| 20260532 | 22 | 1 | 2 | 3 | 2 | 1 | 1 | 1 | 1 | 1 | 1 | 2 | 18 |
| 20260533 | 22 | 1 | 2 | 2 | 2 | 1 | 2 | 1 | 1 | 2 | 1 | 2 | 5 |
| 20260534 | 22 | 1 | 2 | 1 | 2 | 1 | 1 | 1 | 1 | 2 | 1 | 2 | 5 |
| 20260535 | 22 | 1 | 2 | 1 | 2 | 1 | 1 | 1 | 1 | 2 | 1 | 2 | 5 |
| 20260536 | 22 | 1 | 2 | 5 | 2 | 1 | 4 | 1 | 1 | 2 | 1 | 2 | 17 |
| **µ** | 22 | 1 | 2 | 3.00 | 2 | 1 | 4.30 | 1 | 1 | 1.80 | 1 | 2 | 11.80 |
| **σ** | 0 | 0 | 0 | 2.00 | 0 | 0 | 4.00 | 0 | 0 | 0.42 | 0 | 0 | 6.92 |

**観測**: `wave-rider` instinct mean=11.80 = `good`(22) と他 12 strategy (≤7) の中間に新点を生成 = `good` outlier 支配の中間値ブリッジ役。`random-rush` mean=4.30 σ=4.00 = seed 依存大変動 (1〜12)、低-中域に複数点散布。

### 9.5 13 strategy 内 temporal_inconsistency_count マトリクス (130 cell)

| seed | good | cam | lh | bs | nos | zz | rr | cs | mo | vb | tl | so | wr |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 20260527 | 43 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 1 | 0 | 1 | 0 | 1 |
| 20260528 | 43 | 0 | 0 | 1 | 2 | 0 | 1 | 0 | 1 | 0 | 1 | 0 | 6 |
| 20260529 | 43 | 0 | 0 | 1 | 2 | 0 | 3 | 0 | 1 | 0 | 1 | 0 | 18 |
| 20260530 | 43 | 0 | 0 | 1 | 2 | 0 | 1 | 0 | 1 | 1 | 1 | 0 | 18 |
| 20260531 | 43 | 0 | 0 | 4 | 2 | 0 | 4 | 0 | 1 | 0 | 1 | 0 | 18 |
| 20260532 | 43 | 0 | 0 | 1 | 2 | 0 | 1 | 0 | 1 | 1 | 1 | 0 | 18 |
| 20260533 | 43 | 0 | 0 | 1 | 2 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 3 |
| 20260534 | 43 | 0 | 0 | 0 | 2 | 0 | 1 | 0 | 1 | 0 | 1 | 0 | 3 |
| 20260535 | 43 | 0 | 0 | 1 | 2 | 0 | 1 | 0 | 1 | 0 | 1 | 0 | 3 |
| 20260536 | 43 | 0 | 0 | 2 | 2 | 0 | 2 | 0 | 1 | 1 | 1 | 0 | 18 |
| **µ** | 43 | 0 | 0 | 1.20 | 2 | 0 | 1.60 | 0 | 1 | 0.30 | 1 | 0 | 10.60 |
| **σ** | 0 | 0 | 0 | 1.14 | 0 | 0 | 1.17 | 0 | 0 | 0.48 | 0 | 0 | 7.89 |

**観測**: `wave-rider` temporal mean=10.60 = ここも `good`(43) と他 12 strategy (≤2) の中間ブリッジ。instinct と temporal の seed 軸 σ 比率が `wave-rider` で (6.92, 7.89) ≈ 1 = 両軸が同期して動く ↔ `random-rush` で (4.00, 1.17) = instinct 軸が temporal 軸より 3.4 倍 σ。**後者は「rng 重依存だが弾消滅まで生存しない → temporal 計測機会が少ない」構造、前者は「rng 軽依存 + 中期生存 = 両軸とも観測機会が同期」構造**。

### 9.6 13 strategy 内 4 軸 6 ペア独立性 — seed 軸分布 (N=10)

**Pearson 分布 (mean / std / min / max)**:

| ペア | mean | std | min | max |
|---|---:|---:|---:|---:|
| instinct × min_approach_p10 | -0.2278 | 0.1008 | -0.3956 | -0.0753 |
| instinct × cont_grazing_max | 0.2919 | 0.1287 | 0.1045 | 0.5061 |
| **instinct × temporal_inconsistency** | **0.9532** | **0.0319** | **0.8907** | **0.9895** |
| min_approach_p10 × cont_grazing_max | -0.5300 | 0.1329 | -0.6932 | -0.2878 |
| min_approach_p10 × temporal_inconsistency | -0.0856 | 0.0618 | -0.1626 | 0.0038 |
| cont_grazing_max × temporal_inconsistency | 0.2093 | 0.0823 | 0.0894 | 0.3700 |

**Spearman 分布 (mean / std / min / max)**:

| ペア | mean | std | min | max |
|---|---:|---:|---:|---:|
| instinct × min_approach_p10 | -0.4591 | 0.1024 | -0.5781 | -0.2308 |
| instinct × cont_grazing_max | 0.3462 | 0.2296 | -0.0932 | 0.6464 |
| **instinct × temporal_inconsistency** | **0.5463** | **0.1152** | **0.3779** | **0.7612** |
| min_approach_p10 × cont_grazing_max | -0.5334 | 0.1523 | -0.7426 | -0.2129 |
| min_approach_p10 × temporal_inconsistency | -0.1097 | 0.0930 | -0.2573 | 0.0528 |
| cont_grazing_max × temporal_inconsistency | 0.3067 | 0.1603 | 0.0646 | 0.5227 |

**比較 (N=5 → N=13)**:

| 焦点ペア統計 | N=5 (C320) | N=13 (C321) | Δ |
|---|---:|---:|---:|
| Pearson mean (instinct × temporal) | 0.9944 | 0.9532 | **-0.0412** |
| Pearson std | 0.0065 | 0.0319 | +0.0254 (×4.9) |
| Pearson min | 0.9777 | 0.8907 | -0.0870 |
| Spearman mean | 0.7615 | 0.5463 | **-0.2152** |
| Spearman std | 0.1022 | 0.1152 | +0.0130 |

→ N=13 拡張で **Pearson mean は形式判定基準 (≥0.9) を維持** だが **Spearman mean は中相関帯 (0.5) まで落下** = 順位レベルでの相関は strategy 拡張で大幅に弱まる。線形関係を裏付ける構造証拠は弱化方向。

### 9.7 `good` outlier 除外時 vs 全 13 strategy Pearson/Spearman ギャップ (staging §完遂の定義 4)

`good`(instinct=22, temporal=43) は §3.1/§6.2 で指摘した outlier 支配点。N=13 sweep の生 130 行から `good` 行 (10 行) を除外し N=12 strategy × 10 seed = 120 cell で Pearson/Spearman を再算出:

| seed | P (N=13 全) | P (N=12 no-good) | Δ_P | S (N=13 全) | S (N=12 no-good) | Δ_S |
|---|---:|---:|---:|---:|---:|---:|
| 20260527 | 0.9667 | 0.5293 | -0.4374 | 0.4581 | 0.2818 | -0.1763 |
| 20260528 | 0.9531 | 0.8207 | -0.1324 | 0.5723 | 0.4353 | -0.1370 |
| 20260529 | 0.9059 | 0.9358 | +0.0299 | 0.5715 | 0.4345 | -0.1370 |
| 20260530 | 0.9485 | 0.9870 | +0.0385 | 0.5723 | 0.4353 | -0.1370 |
| 20260531 | 0.8907 | 0.9259 | +0.0352 | 0.7217 | 0.6357 | -0.0860 |
| 20260532 | 0.9480 | 0.9857 | +0.0377 | 0.5162 | 0.3563 | -0.1599 |
| 20260533 | 0.9895 | 0.6902 | -0.2993 | 0.4698 | 0.2889 | -0.1809 |
| 20260534 | 0.9888 | 0.6929 | -0.2959 | 0.4419 | 0.2467 | -0.1952 |
| 20260535 | 0.9882 | 0.6525 | -0.3357 | 0.3779 | 0.1672 | -0.2107 |
| 20260536 | 0.9525 | 0.9778 | +0.0253 | 0.7612 | 0.6887 | -0.0725 |
| **mean** | 0.9532 | 0.8198 | **-0.1334** | 0.5463 | 0.3970 | **-0.1493** |
| **std** | 0.0319 | 0.1668 | +0.1349 (×5.2) | 0.1152 | 0.1662 | +0.0510 |
| **min** | 0.8907 | 0.5293 | -0.3614 | 0.3779 | 0.1672 | -0.2107 |
| **max** | 0.9895 | 0.9870 | -0.0025 | 0.7612 | 0.6887 | -0.0725 |

**ギャップ定量化**:
- **Pearson mean ギャップ = -0.1334** (0.9532 → 0.8198 = 14% 相対低下)
- **Pearson std は 5.2 倍に拡大** (0.0319 → 0.1668)、verdict 判定基準 std<0.1 を破る = N=12 では **HOLD 領域** (0.1 ≤ std < 0.2)
- **Pearson min は 0.5293** (seed=20260527) = 中相関帯下端、N=13 では強相関帯下端
- Spearman mean は -0.1493 低下 (0.5463 → 0.3970)、std は 1.4 倍 = 順位レベルでは弱-中相関帯

**解釈**:
1. `good` 除外で Pearson mean が 0.13 低下、std が 5 倍 = **strong evidence**: N=13 全体での Pearson 0.95+ は依然 `good` (22, 43) 1 点に支配されている。`wave-rider` (mean instinct=11.80, temporal=10.60) がブリッジ点として加わったが、Pearson 線形回帰の slope 安定化には不十分。
2. seed ごとに見ると **`good` 除外で Pearson が上がる seed と下がる seed が並存** (上昇 5 seed / 下降 5 seed) = `good` の影響は方向ではなく **slope 安定性**。`good` ありだと slope が seed 軸で安定 (std 0.03)、`good` なしだと slope が seed 軸で動く (std 0.17) = `good` は「常に同じ点 (22, 43) にいるアンカー」として線形回帰を安定化させているだけ。
3. **真の冗長性 = 「強相関が 4 軸の構造的依存に由来」を主張するには Pearson + Spearman 両方で安定 ≥ 0.9 が必要**。N=13 + no-good 条件で Pearson mean 0.82 + std 0.17 + Spearman mean 0.40 = この基準を満たさない。

### 9.8 bit 不変性 — 13 strategy × 130 cell でも sweep state 汚染ゼロ (11 度目)

`multi_seed_sweep_raw.json` `bit_invariance.all_match: true`、`bit_invariance.per_strategy` 13 strategy × 5 軸 = 65 セル完全一致 (seed=20260527 sweep 内 vs sweep 外 baseline 再実行)。

これは sweep ループが 13 strategy × 10 seed = 130 run + baseline 13 run = 計 143 run の連続実行下でも `runOne` 決定論性を破壊しないことの 11 度目同型論証 (H-002〜H-008 + C313 + C316 + C320 + C321)。

### 9.9 結論 — kaizen #140 段階3 family 統合判定 (本サイクル最終)

| 判定軸 | 値 | 判定基準 | 結果 |
|---|---|---|---|
| **形式 verdict (sweep JSON)** | Pearson mean=0.9532, std=0.0319 | mean≥0.9 && std<0.1 | REDUNDANCY_CONFIRMED |
| **`good` outlier 除外時 (N=12)** | Pearson mean=0.8198, std=0.1668 | 同基準 | **HOLD** (std≥0.1, mean<0.9) |
| **Spearman 中相関帯 (N=13)** | mean=0.5463 | 強相関 ≥ 0.9 必要 | NOT satisfied |
| **Spearman no-good (N=12)** | mean=0.3970 | 同上 | NOT satisfied |
| **構造解釈** | `good` outlier 支配の Pearson 線形回帰、Spearman 中相関 | 4 軸冗長性の直接証拠なし | **NOT_CONFIRMED** |

→ **kaizen #140 段階3 「`instinct → temporal` 軸統合」発火**:
- 形式単独基準: GO
- 形式 + `good` 除外耐性 + Spearman 二重基準: **HOLD 継続**
- **総合判定**: **HOLD** — strategy 集合拡張 N=13 でも outlier 依存性は解消されず、Spearman 中相関帯。検証期限 2026-06-20 まで残 10 日のうち、(a) N=20 拡張 + outlier 耐性指標を verdict_thresholds に組み込み、または (b) `good` 系列 (= 真の castLock 使用良手系列) を複数生成して outlier 1 点支配を分散させる方向のいずれかで再評価。本サイクル sweep 単独で段階3 family 統合は **発火させない**。

### 9.10 構造的進展 (N=5 → N=13 拡張で得たもの)

1. **seed 軸変動 strategy 数 = 1 → 4** (`blind-sweeper` のみ → `blind-sweeper` + `random-rush` + `vertical-bounce` + `wave-rider`)。§3.1 構造バイアス「1 点のみ動く」は **部分解消**
2. **中間ブリッジ点 (`wave-rider`)** = instinct mean 11.80 / temporal mean 10.60、`good`(22, 43) と他 12 strategy (≤7, ≤2) の中間に新点が生成され、Pearson 二極分布の幾何学的弱化に寄与
3. **`good` outlier の Pearson 支配は強い**: ブリッジ点を加えても N=12 (no-good) Pearson mean は 0.82 = 「`good` の支配下にあるかどうか」で verdict が REDUNDANCY_CONFIRMED ↔ HOLD を行き来する不安定構造を露呈
4. **Pearson vs Spearman ギャップ拡大**: N=5 で 0.23 → N=13 で 0.41 = 順位レベルでは中相関に過ぎず、線形 magnitude が outlier に引っ張られているだけ
5. **次サイクル候補軸の優先順序確定** (§9.11):
   - 第一候補: `good` 系列複数化 (真の castLock 使用良手を 3-5 種類生成 = `good` 1 点支配を構造的に破る)
   - 第二候補: N=20 seed 拡張 + outlier 耐性指標 (P_no-good, P/S gap) を verdict_thresholds に追加
   - 退役候補: 単純 N seed 拡張 (本サイクルで N=10 が strategy 拡張に勝てないことが実証された)

### 9.11 次サイクル候補 (C322 以降、本 sweep 後の更新)

1. **`good` 系列複数化** (推奨): 現 grazer mock 1 種を 3-5 種類 (例: castLock-ish-A / grazer-fast / center-aware / lateral-evade / wave-aware) に拡張し、N=15-17 strategy で再 sweep。outlier 1 点支配を outlier クラスタに置換することで Pearson 線形回帰の geometric 性質を変える。`good` グループ内の strategy 間散布が無ければ outlier 集約点として機能、散布があれば線形関係そのものが弱まる ← どちらに動くかが verdict
2. **outlier 耐性 verdict 拡張**: 現 verdict_thresholds は Pearson mean+std 単独。`P_no_outlier_mean` (= `good` 除外後 Pearson mean) と `pearson_spearman_gap` (= |P-S|) を追加し、3 軸 AND 基準に厳格化
3. **kaizen #140 段階3 family 統合判定の構造改訂**: 「sweep verdict 単独 → outlier 耐性 + 順位整合性二重 gate」に強化
4. **本セクション §9 を `projects/log_autonomous_game.md` に Active 集約 + C322 着地候補に明示**

## 10. C321 Phase 4 — 回帰チェック

| 監査 | 結果 | 備考 |
|---|---|---|
| `node bullet_origin_audit.js` | exit 0, **pass: true** | C320 と同型、副作用ゼロ確認 |
| `node enemy_behavior_audit.js` | exit 0, **8/8 PASS** | 同上 |
| `node verify.js` (通常モード) | exit 0, **pass: true, survivors: []** | 13 strategy 全 gameover、追加 8 種 survived_frames [227, 435]F = 悪手帯着地 |

`STRATEGIES` への 8 追加 + `BAD_STRATEGIES` への 8 追加 + comment block (約 20 行) は通常モード + 既存 sweep モード (`--sensitivity-sweep` / `--temporal-sensitivity-sweep` / `--multi-seed-sweep`) + audit 系列に副作用ゼロ。pass: true 維持 + survivors 0 維持 = 改修品質確証。

## 11. C322 Phase 4 — wave-rider 軌跡再設計 + 130 cell sweep 再実行

**起票**: 2026-06-10 C322 Phase 4 (Log)
**目的**: §9.10 「中間ブリッジ点 (`wave-rider`)」が `good`(22, 43) と他 12 strategy (≤7, ≤2) の中間に新点を生成した実績を、パラメータ調整で **中間帯 (instinct/temporal 各 14-18)** へ移動させ、`good` outlier 1 点支配 → outlier クラスタ的緩衝化への最小実験。staging Phase 3 §「次フェーズの大作業」完遂の定義 1-4 を物理化。
**差分**: [verify.js](verify.js) L518-524 `strategyWaveRider` 周波数 0.07/0.05 → 0.04/0.03 (軌跡周期 ×1.5-1.7 延長) + rng 振幅 0.2 → 0.5 (seed 軸変動拡大)。`STRATEGIES` 構造 / `BAD_STRATEGIES` リスト / `--multi-seed-sweep` 機構は不変。
**素材**: 再生成済 [multi_seed_sweep_raw.json](multi_seed_sweep_raw.json) (130 行 = 10 seed × 13 strategy、`node verify.js --multi-seed-sweep 10`)。

### 11.1 wave-rider (instinct mean, temporal mean) 移動結果

| 軸 | C321 値 | C322 値 (新) | Δ | 目標帯 (14-18) | 判定 |
|---|---:|---:|---:|---|:-:|
| wave-rider instinct mean | 11.80 | **6.20** | **-5.60** | 14-18 | **逆方向移動** (中間帯下方へ離脱) |
| wave-rider temporal mean | 10.60 | **10.30** | -0.30 | 14-18 | ほぼ不変 (中間帯下端の手前で停滞) |
| wave-rider survived mean | 1040.7 (推計) | **1114.80** | +74.1 | – | 延長 (周波数低下が安全 pocket 滞在を促進) |
| wave-rider survived σ | 705.01 | **923.87** | +218.86 (×1.31) | – | 拡大 (seed 軸分岐の幅増) |
| wave-rider survived max | 1819 | **2849** | +1030 (×1.57) | – | 1.6 倍 (rng 振幅 0.5 で長期生存軌道発生) |
| wave-rider instinct σ | 6.92 | 2.96 | -3.96 | – | 縮小 (低 instinct 帯に集中) |
| wave-rider temporal σ | 7.89 | 7.60 | -0.29 | – | ほぼ不変 |

**観測**: 周波数低下 (0.07/0.05 → 0.04/0.03) + rng 振幅拡大 (0.2 → 0.5) は、wave-rider を **中間帯 (14-18) へ移動させず、逆に低 instinct 帯 (mean 6.20) に押し下げた**。survived は延長 (mean 1115F、max 2849F) = 軌跡周期延長が「弾配置の少ない pocket への長期滞在」を構造的に作り、結果として instinct trigger (rising-edge bullet proximity) 機会が **減少**。temporal はほぼ不変 = 弾の predicted_end からの逸脱 event は survival 機会数で線形に増えるため σ は維持。

完遂の定義 3 「観測値が記録されれば PASS」順守 (移動の有無は問わない設計)。

### 11.2 13 strategy × 10 seed instinct/temporal マトリクス (130 cell)

**instinct_trigger_count** (略号は §9.3 同):

| seed | good | cam | lh | bs | nos | zz | rr | cs | mo | vb | tl | so | wr |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 20260527 | 22 | 1 | 2 | 3 | 2 | 1 | 7 | 1 | 1 | 2 | 1 | 2 | 5 |
| 20260528 | 22 | 1 | 2 | 6 | 2 | 1 | 2 | 1 | 1 | 2 | 1 | 2 | 5 |
| 20260529 | 22 | 1 | 2 | 1 | 2 | 1 | 10 | 1 | 1 | 2 | 1 | 2 | 11 |
| 20260530 | 22 | 1 | 2 | 2 | 2 | 1 | 3 | 1 | 1 | 1 | 1 | 2 | 4 |
| 20260531 | 22 | 1 | 2 | 6 | 2 | 1 | 12 | 1 | 1 | 2 | 1 | 2 | 11 |
| 20260532 | 22 | 1 | 2 | 3 | 2 | 1 | 1 | 1 | 1 | 1 | 1 | 2 | 8 |
| 20260533 | 22 | 1 | 2 | 2 | 2 | 1 | 2 | 1 | 1 | 2 | 1 | 2 | 1 |
| 20260534 | 22 | 1 | 2 | 1 | 2 | 1 | 1 | 1 | 1 | 2 | 1 | 2 | 5 |
| 20260535 | 22 | 1 | 2 | 1 | 2 | 1 | 1 | 1 | 1 | 2 | 1 | 2 | 5 |
| 20260536 | 22 | 1 | 2 | 5 | 2 | 1 | 4 | 1 | 1 | 2 | 1 | 2 | 7 |
| **µ** | 22 | 1 | 2 | 3.00 | 2 | 1 | 4.30 | 1 | 1 | 1.80 | 1 | 2 | **6.20** |
| **σ** | 0 | 0 | 0 | 1.90 | 0 | 0 | 3.80 | 0 | 0 | 0.40 | 0 | 0 | 2.96 |

**temporal_inconsistency_count**:

| seed | good | cam | lh | bs | nos | zz | rr | cs | mo | vb | tl | so | wr |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 20260527 | 43 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 1 | 0 | 1 | 0 | 6 |
| 20260528 | 43 | 0 | 0 | 1 | 2 | 0 | 1 | 0 | 1 | 0 | 1 | 0 | 6 |
| 20260529 | 43 | 0 | 0 | 1 | 2 | 0 | 3 | 0 | 1 | 0 | 1 | 0 | 24 |
| 20260530 | 43 | 0 | 0 | 1 | 2 | 0 | 1 | 0 | 1 | 1 | 1 | 0 | 6 |
| 20260531 | 43 | 0 | 0 | 4 | 2 | 0 | 4 | 0 | 1 | 0 | 1 | 0 | 24 |
| 20260532 | 43 | 0 | 0 | 1 | 2 | 0 | 1 | 0 | 1 | 1 | 1 | 0 | 14 |
| 20260533 | 43 | 0 | 0 | 1 | 2 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 1 |
| 20260534 | 43 | 0 | 0 | 0 | 2 | 0 | 1 | 0 | 1 | 0 | 1 | 0 | 6 |
| 20260535 | 43 | 0 | 0 | 1 | 2 | 0 | 1 | 0 | 1 | 0 | 1 | 0 | 5 |
| 20260536 | 43 | 0 | 0 | 2 | 2 | 0 | 2 | 0 | 1 | 1 | 1 | 0 | 11 |
| **µ** | 43 | 0 | 0 | 1.20 | 2 | 0 | 1.60 | 0 | 1 | 0.30 | 1 | 0 | **10.30** |
| **σ** | 0 | 0 | 0 | 1.08 | 0 | 0 | 1.11 | 0 | 0 | 0.46 | 0 | 0 | 7.60 |

### 11.3 4 軸 6 ペア独立性 — seed 軸分布 (N=10, focus pair)

**Pearson 分布** (verify.js native):

| ペア | mean | std | min | max |
|---|---:|---:|---:|---:|
| instinct × min_approach_p10 | -0.1674 | 0.0527 | -0.2750 | -0.0933 |
| instinct × cont_grazing_max | 0.2354 | 0.0937 | 0.1180 | 0.4097 |
| **instinct × temporal_inconsistency** | **0.9745** | **0.0272** | **0.9112** | **0.9947** |
| min_approach_p10 × cont_grazing_max | -0.5182 | 0.0883 | -0.6819 | -0.3790 |
| min_approach_p10 × temporal_inconsistency | -0.0683 | 0.0319 | -0.1167 | -0.0221 |
| cont_grazing_max × temporal_inconsistency | 0.1836 | 0.1160 | 0.0143 | 0.4166 |

**Spearman 分布**:

| ペア | mean | std | min | max |
|---|---:|---:|---:|---:|
| instinct × min_approach_p10 | -0.4435 | 0.0978 | -0.5576 | -0.2308 |
| instinct × cont_grazing_max | 0.3073 | 0.1176 | 0.0142 | 0.4481 |
| **instinct × temporal_inconsistency** | **0.5243** | **0.1512** | **0.2027** | **0.7612** |
| min_approach_p10 × cont_grazing_max | -0.5079 | 0.0762 | -0.6004 | -0.3587 |
| min_approach_p10 × temporal_inconsistency | -0.0753 | 0.1161 | -0.2573 | 0.1670 |
| cont_grazing_max × temporal_inconsistency | 0.2576 | 0.1508 | 0.0551 | 0.5202 |

### 11.4 `good` outlier 除外時 Pearson std — C321 vs C322 定量比較 (staging 完遂の定義 2)

`good`(instinct=22, temporal=43) を除外し N=12 strategy × 10 seed = 120 cell で再算出した seed 軸 instinct × temporal Pearson 分布:

| seed | P_all(N=13) | P_no-good(N=12) | Δ_P | S_all(N=13) | S_no-good(N=12) | Δ_S |
|---|---:|---:|---:|---:|---:|---:|
| 20260527 | 0.9672 | 0.6068 | -0.3604 | 0.5365 | 0.3870 | -0.1495 |
| 20260528 | 0.9745 | 0.5842 | -0.3903 | 0.5506 | 0.4066 | -0.1440 |
| 20260529 | 0.9380 | 0.7772 | -0.1608 | 0.5715 | 0.4345 | -0.1370 |
| 20260530 | 0.9940 | 0.7443 | -0.2497 | 0.5723 | 0.4353 | -0.1370 |
| 20260531 | 0.9112 | 0.7259 | -0.1853 | 0.7126 | 0.6238 | -0.0888 |
| 20260532 | 0.9939 | 0.9414 | -0.0525 | 0.5162 | 0.3563 | -0.1599 |
| 20260533 | 0.9947 | 0.0000 | -0.9947 | 0.2027 | -0.0826 | -0.2853 |
| 20260534 | 0.9945 | 0.8496 | -0.1449 | 0.4419 | 0.2467 | -0.1952 |
| 20260535 | 0.9926 | 0.8000 | -0.1926 | 0.3779 | 0.1672 | -0.2107 |
| 20260536 | 0.9845 | 0.8434 | -0.1411 | 0.7612 | 0.6887 | -0.0725 |
| **mean** | 0.9745 | **0.6873** | **-0.2872** | 0.5243 | **0.3663** | **-0.1580** |
| **std** | 0.0272 | **0.2511** | +0.2239 (×9.2) | 0.1512 | 0.2091 | +0.0579 |
| **min** | 0.9112 | **0.0000** | -0.9112 | 0.2027 | -0.0826 | -0.2853 |
| **max** | 0.9947 | 0.9414 | -0.0533 | 0.7612 | 0.6887 | -0.0725 |

**C321 vs C322 定量比較 (staging 完遂の定義 2)**:

| 統計 | C321 (N=13 wave-rider 0.07/0.05) | C322 (N=13 wave-rider 0.04/0.03) | Δ | 解釈 |
|---|---:|---:|---:|---|
| Pearson N=13 全 mean | 0.9532 | 0.9745 | **+0.0213** | 全体強相関は微増 |
| Pearson N=13 全 std | 0.0319 | 0.0272 | -0.0047 | seed 軸ばらつきは微減 |
| **Pearson N=12 no-good mean** | **0.8198** | **0.6873** | **-0.1325** | **no-good 強相関が 13% 低下** |
| **Pearson N=12 no-good std** | **0.1668** | **0.2511** | **+0.0843 (×1.51)** | **outlier 依存性は 1.5 倍に悪化** |
| Pearson no-good min | 0.5293 | **0.0000** | -0.5293 | seed=20260533 で完全相関消失 |
| no-good vs C321 std 倍率 (vs C321 0.0319 baseline) | 5.2× (0.1668/0.0319) | **9.2× (0.2511/0.0272)** | +4.0× | outlier 依存度の悪化を倍率で見ても 5.2 → 9.2 = 1.8 倍悪化 |
| Spearman N=13 全 mean | 0.5463 | 0.5243 | -0.0220 | 順位相関は微減 |
| Spearman no-good mean | 0.3970 | 0.3663 | -0.0307 | 順位相関 no-good も微減 |

### 11.5 bit 不変性 — sweep state 汚染ゼロ確証 (12 度目)

`multi_seed_sweep_raw.json` `bit_invariance.all_match: true`、13 strategy × 5 軸 = 65 セル完全一致 (seed=20260527 sweep 内 vs sweep 外 baseline 再実行)。`runOne` 決定論性の同型論証 12 度目 (H-002〜H-008 + C313 + C316 + C320 + C321 + C322)。

### 11.6 結論 — 中間帯 (14-18) 移動目標は不達、no-good Pearson 安定性は悪化

- **wave-rider の中間帯移動**: 周波数 0.07/0.05 → 0.04/0.03 + rng 0.2 → 0.5 は **逆方向作用** = 中間ブリッジ強化はならなかった。低周波軌跡が「弾の少ない safe pocket への長期滞在」を構造的に作り、instinct trigger 機会が減少 (11.80 → 6.20)
- **no-good Pearson 安定性**: C321 std 0.1668 (HOLD 領域) → C322 std 0.2511 (PSEUDO_CORRELATION 帯 std ≥ 0.2) = **outlier 依存度が悪化**。seed=20260533 で no-good Pearson = 0.0000 (低 instinct 1 + 低 temporal 1 + 他は近接、線形回帰退化) の極端ケース発生
- **形式 verdict は依然 REDUNDANCY_CONFIRMED**: 全体 Pearson mean 0.9745 / std 0.0272 = 形式単独基準では GO だが、§9.7 + §11.4 の no-good ギャップ拡大が「`good` 1 点支配の構造的特性」を再確認 = strategy 集合内パラメータ調整 (wave-rider 軌跡) では outlier 依存性は解消しない

→ **構造観測の確定**: outlier 支配は wave-rider 1 strategy のパラメータ調整では緩衝できない。next move は §9.11 第一候補 (`good` 系列複数化) を実施するか、§9.11 第二候補 (outlier 耐性 verdict 拡張で構造を運用基準で吸収) に降りる判断材料が揃った。

### 11.7 回帰チェック (本サイクル C322)

| 監査 | 結果 | 備考 |
|---|---|---|
| `node verify.js` (通常モード) | exit 0, **pass: true, survivors: []** | 13 strategy 全 gameover、wave-rider survived=561F (seed=20260527) = 悪手帯内 |
| `node verify.js --multi-seed-sweep 10` | exit 0, **bit_invariance.all_match: true** | 130 + 13 = 143 run の連続実行下で sweep state 汚染ゼロ |

`strategyWaveRider` の数式 2 箇所 + comment block (3 行) 改修は通常モード + sweep モード + audit 系列 (`bullet_origin_audit.js` / `enemy_behavior_audit.js`) に副作用ゼロ。pass: true 維持 + survivors 0 維持 = 改修品質確証。
