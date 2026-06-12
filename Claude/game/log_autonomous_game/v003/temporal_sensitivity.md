# v003 verify.js — TEMPORAL_INCONSISTENCY_THRESHOLD_PX 感度分析 + 4 軸 6 ペア独立性検証

**起票**: 2026-06-09 C316 Phase 4 (Log)
**親**: [design_log.md §9](design_log.md) (C316 Phase 4 節)
**素材**: [temporal_sensitivity_sweep_raw.json](temporal_sensitivity_sweep_raw.json) (`node verify.js --temporal-sensitivity-sweep` の生 JSON)
**前提**: [verify.js](verify.js) C316 Phase 4 差分 (`TEMPORAL_INCONSISTENCY_THRESHOLD_PX` env/`--temporal-sensitivity-sweep` 外部化)
**起点**: [instinct_sensitivity.md](instinct_sensitivity.md) §7 未確認 / 残務「4 軸目 (temporal_inconsistency_count) を加えた 4 軸 6 ペア独立性 (C311 本来の temporal probe との同型 sweep)」

## 1. 設計 — なぜこれを測るか

C311 Phase 4 (本来) で導入した `temporal_inconsistency_count` は「弾発射時の player 位置 (= 予測末端 ghost target) と弾消滅時の実末端位置の Euclidean 距離が `TEMPORAL_INCONSISTENCY_THRESHOLD_PX` を超えた弾数」=「VLM 「時間的整合性予測失敗」軸の game レーン射影」を proxy 計測する。閾値 15px は player 直径 16px ＋ bullet 半径 4px 弱 (= 衝突窓近傍) の設計値だが、**1 値の単一観測のみでは閾値 robust 性は不明**。

本サイクル C316 で 4 PX (10 / 15 / 20 / 30) × 5 strategy = 20 セル sweep を実行し:
1. 装置 (probe) が PX に対し物理的に整合的に応答するか (PX 大 → 件数小 = 非増加期待)
2. 4 軸 (instinct_trigger / min_approach_p10 / cont_grazing_max / temporal_inconsistency) 6 ペア独立性を各 PX 条件下で検証 (= feedback richness の冗長性チェック、§8 の 3 軸 → 4 軸拡張)
3. PX 4 値全条件で survived_frames + 他 3 probe (instinct / min_approach_p10 / cont_grazing_max) bit 一致が維持されるか (= probe 副作用ゼロの数学的確証, H-002〜H-008 + C313 + 本軸の同型論証 9 度目)

## 2. 計測条件

| 項目 | 値 |
|---|---|
| seed | 20260527 (固定) |
| MAX_FRAMES | 5400 (90 秒) |
| PX 値 | 10 / 15 / 20 / 30 |
| baseline PX | 15 (デフォルト維持) |
| strategy 数 | 5 (good / camper / lane-holder / blind-sweeper / nospecial) |
| 計測軸 | temporal_inconsistency_count / instinct_trigger_count / min_approach_p10 / cont_grazing_max |
| 副作用確認軸 | survived_frames + instinct_trigger_count + min_approach_p10 + cont_grazing_max (4 PX 全て同値必要) |

実行: `cd game/log_autonomous_game/v003 && node verify.js --temporal-sensitivity-sweep`

## 3. temporal_inconsistency_count マトリクス (5 strategy × 4 PX)

各セルは `temporal_inconsistency_count` 値。最右列は PX 単調性判定 (10→15→20→30 で非増加 = ✓)。

| strategy | PX=10 | PX=15 | PX=20 | PX=30 | nonincreasing | strictly_decreasing |
|---|---:|---:|---:|---:|:-:|:-:|
| good (grazer mock) | 43 | 43 | 43 | 43 | ✓ | ✗ |
| camper | 1 | 0 | 0 | 0 | ✓ | ✗ |
| lane-holder | 1 | 0 | 0 | 0 | ✓ | ✗ |
| blind-sweeper | 0 | 0 | 0 | 0 | ✓ | ✗ |
| nospecial | 3 | 2 | 2 | 2 | ✓ | ✗ |

**物理整合性の解釈**:
- 全 5 strategy で nonincreasing (✓) = `temporal_inconsistency_count` は PX 閾値超え件数なので PX 大 → 件数小は数学的必然。**装置自体は物理的に正しく動いている**。
- **good (4 PX で 43 件 plateau)**: PX=10 の時点で全 inconsistency が **30px 超え** = grazer mock の全 ghost target ズレが大幅 (≥30px)。これは grazer mock が画面下部を回遊する性質上、弾発射時 (画面上部) から消滅時 (画面外 or 衝突) までの間に player が広範囲を移動する = 大幅な temporal inconsistency が必然。設計通り。
- **camper / lane-holder (PX=10 で 1 件、PX=15+ で 0 件)**: 早期死亡 (319F / 284F) で観測サンプル数が少なく、10〜15 間に 1 件の微小不整合が存在。PX=15 (baseline) は微小ズレを切り捨てる適切な閾値レンジ。
- **blind-sweeper (全 PX で 0 件)**: 弾発射時 → 消滅時で player ほぼ無移動 (ランダム dx/dy で実質的な位置変動が打ち消し合う構造) = temporal inconsistency が原理的に発生しにくい strategy。
- **nospecial (PX=10 で 3 件、PX=15+ で 2 件)**: 10〜15 間に 1 件、15〜∞ に 2 件の安定 plateau。最良 enemy 追尾 strategy の特性として中程度の temporal inconsistency が安定発生。

**結論 (装置物理整合性)**: 4 PX 全 20 セルで物理整合性 ✓。**有用 PX レンジは 10〜30 全域で識別力維持** (good が常時 plateau 化するが、悪手 3 種は 10〜15 で識別力 1 件差を出す)。**PX=15 設計値 = 微小ズレを切り捨てつつ悪手識別力を保持する適切な閾値**。PX=10 まで下げると微小ズレを 1 件 over-count する代わりに、悪手分離力が +1 件粒度上昇。

## 4. 4 軸 6 ペア独立性 — 各 PX 条件下、5 strategy 全体 (N=5)

PX=15 baseline 条件下、5 strategy × 4 軸 = 20 値マトリクス:

| strategy | instinct_trigger | min_approach_p10 | cont_grazing_max | temporal_inconsistency |
|---|---:|---:|---:|---:|
| good | 22 | 52.24 | 6 | 43 |
| camper | 1 | 58.07 | 5 | 0 |
| lane-holder | 2 | 55.33 | 2 | 0 |
| blind-sweeper | 3 | 38.84 | 3 | 0 |
| nospecial | 2 | 93.05 | 5 | 2 |

### 4.1 相関係数 (Pearson / Spearman) — PX=15 baseline

| 軸ペア | Pearson | Spearman |
|---|---:|---:|
| instinct × min_approach_p10 | -0.2275 | -0.7182 |
| instinct × cont_grazing_max | 0.5766 | 0.2895 |
| **instinct × temporal_inconsistency** | **0.9959** | 0.5735 |
| min_approach_p10 × cont_grazing_max | 0.3518 | 0.1539 |
| min_approach_p10 × temporal_inconsistency | -0.1600 | 0.1118 |
| cont_grazing_max × temporal_inconsistency | 0.6317 | 0.8030 |

### 4.2 PX 値変動下の相関係数 plateau

各 PX 条件で 6 ペア × 2 統計量 = 12 値、計 4 PX = 48 値の独立算出結果:

**Pearson** (PX=10 / 15 / 20 / 30):
- `instinct × min_approach_p10`: -0.2275 / -0.2275 / -0.2275 / -0.2275 (全 PX 不変)
- `instinct × cont_grazing_max`: 0.5766 / 0.5766 / 0.5766 / 0.5766 (全 PX 不変)
- `instinct × temporal_inconsistency`: **0.9937** / **0.9959** / **0.9959** / **0.9959** (PX=10 のみ -0.0022、強相関 plateau)
- `min_approach_p10 × cont_grazing_max`: 0.3518 / 0.3518 / 0.3518 / 0.3518 (全 PX 不変)
- `min_approach_p10 × temporal_inconsistency`: -0.1442 / -0.1600 / -0.1600 / -0.1600
- `cont_grazing_max × temporal_inconsistency`: 0.6378 / 0.6317 / 0.6317 / 0.6317

**Spearman** (PX=10 / 15 / 20 / 30):
- `instinct × temporal_inconsistency`: 0.2895 / 0.5735 / 0.5735 / 0.5735 (PX=10 で大きく低い、PX=15+ で plateau)
- `cont_grazing_max × temporal_inconsistency`: 0.7632 / 0.8030 / 0.8030 / 0.8030
- 他 4 ペアは temporal を含まないため §8 と同値 (PX 不変)

**PX 不変性の説明**: temporal を含まないペアは TEMPORAL_INCONSISTENCY_THRESHOLD_PX 変動の影響を一切受けない (probe 独立性の正しさ確証)。temporal を含むペアのみ PX=10 と PX=15+ で値が変動 (PX=10 のみ camper/lane-holder で 1 件多く検出される差が反映)。

### 4.3 独立性判定

判定基準 (staging §完遂の定義 5):
- **|r| ≥ 0.9 = 強相関 = 1 軸で代替可能 → 軸独立性なし**
- **|r| < 0.5 = 弱相関 → 真の独立**
- **0.5 ≤ |r| < 0.9 = 中相関 → 部分的独立**

PX=15 baseline での総合判定:

| 軸ペア | Pearson | Spearman | 総合 |
|---|---|---|---|
| instinct × min_approach_p10 | 弱 (-0.23) | 中 (-0.72) | 部分的独立 (§8 から継続) |
| instinct × cont_grazing_max | 中 (0.58) | 弱 (0.29) | 部分的独立 (§8 から継続) |
| **instinct × temporal_inconsistency** | **強 (0.9959)** | 中 (0.57) | **強相関 = 軸独立性なし (Pearson)** |
| min_approach_p10 × cont_grazing_max | 弱 (0.35) | 弱 (0.15) | 独立 (§8 から継続) |
| min_approach_p10 × temporal_inconsistency | 弱 (-0.16) | 弱 (0.11) | 独立 |
| cont_grazing_max × temporal_inconsistency | 中 (0.63) | 中 (0.80) | 部分的独立 |

**結論 (4 軸独立性)**:
1. **強相関 (|r| ≥ 0.9) は Pearson 6 ペア中 1 件発見**: `instinct × temporal_inconsistency` (Pearson 0.9959, PX=15)。**4 軸構造に 1 軸で代替可能な冗長性が存在する可能性**。
2. **同ペア Spearman は 0.5735 = 中相関**: 順位依存は強くない → Pearson 強相関の主因は **good (grazer mock) の `instinct=22, temporal=43` と他 4 strategy の `instinct≤3, temporal≤2` という二極構造** で線形回帰が strategy 分布に支配されている疑似相関の可能性大。
3. **完全独立 (Pearson + Spearman 両方で |r| < 0.5)** は 2 ペア:
   - `min_approach_p10 × cont_grazing_max` (§8 から継続)
   - `min_approach_p10 × temporal_inconsistency` (本サイクル新規発見)
   - **`min_approach_p10` 軸が他 3 軸と最も独立** = 「位置情報直接量」軸の独立性が物理的に確証
4. **feedback richness 設計の物理化判定**: 4 軸全体は redundant でなく partially independent だが、**`instinct_trigger_count` と `temporal_inconsistency_count` の Pearson 強相関は冗長性予兆** = フィードバック多重化価値は 3 軸 (`min_approach_p10` / `cont_grazing_max` / `temporal_inconsistency`) に集約可能性が示された。
5. **要観察**: `instinct × temporal` Pearson 0.9959 の安定性 = N=5 少サンプル & strategy 分布の偏りによる疑似相関判定 = multi-seed (N≥10) 拡張で再検証必須。

### 4.4 サンプルサイズ警告

§8 と同様、N=5 (5 strategy 単一観測値) は相関係数の 95%CI が広範囲。**結論の方向性は信頼できるが、絶対値は seed × multi-trial 拡張で再確認要** (= multiseed sweep が次サイクル候補)。

## 5. survived_frames + 他 probe bit 不変性 — probe 副作用ゼロ確証 9 度目

| strategy | PX=10 | PX=15 | PX=20 | PX=30 | invariant |
|---|---:|---:|---:|---:|:-:|
| good | 4162 | 4162 | 4162 | 4162 | ✓ |
| camper | 319 | 319 | 319 | 319 | ✓ |
| lane-holder | 284 | 284 | 284 | 284 | ✓ |
| blind-sweeper | 378 | 378 | 378 | 378 | ✓ |
| nospecial | 545 | 545 | 545 | 545 | ✓ |

**他 3 probe (instinct_trigger / min_approach_p10 / cont_grazing_max) も全 PX 不変** (出力 JSON `other_probes_invariance` 参照)。

**結果: 5 strategy × 4 PX = 20 セル全てで survived_frames + 他 3 probe が PX 不変**。

これは:
- `TEMPORAL_INCONSISTENCY_THRESHOLD_PX` の値変動は temporal probe の出力にのみ影響し、gameplay logic + 他 probe に影響しない
- 4 PX 全条件で `bullet._predictedEnd*` フラグ追加が collision / motion (x, y, vx, vy, r 参照) に副作用ゼロ
- H-002 (C297) / H-003 (C298) / H-004 (C298) / H-005 (C300) / H-006 (C302) / H-007 (C311) / C311 (本来 temporal probe) / C313 (INSTINCT_TRIGGER_PX sweep) に続く **同型論証 9 度目** が TEMPORAL PX 軸でも成立

**audit 再走 (PX=15 デフォルト条件)**:
- `node bullet_origin_audit.js` → `pass: true` (10/10 check)
- `node enemy_behavior_audit.js` → `8/8 PASS`
- `node verify.js` (通常モード) → exit 0, pass=true, survivors=[] 維持

数学的確証完了。

## 6. 結論

1. **装置物理整合性**: `TEMPORAL_INCONSISTENCY_THRESHOLD_PX` 感度は単調 (PX 大 → 件数小、5 strategy 全 nonincreasing)。**有用 PX レンジは 10〜30 全域で識別力維持**、PX=15 設計値 = 微小ズレ切り捨て + 悪手識別力保持の適切閾値
2. **4 軸独立性**: 強相関 1 ペア発見 (instinct × temporal Pearson 0.9959) = **`instinct_trigger_count` と `temporal_inconsistency_count` の冗長性予兆**。ただし Spearman 0.57 = 順位依存は強くない → N=5 strategy 二極分布による疑似相関の可能性大、multi-seed 拡張で再検証必須
3. **完全独立ペア 2 件**: `min_approach_p10 × cont_grazing_max` (§8 継続) + `min_approach_p10 × temporal_inconsistency` (新規) = **`min_approach_p10` 軸が他 3 軸と最も独立 = 「位置情報直接量」軸の独立性物理確証**
4. **probe 副作用ゼロ**: 5 strategy × 4 PX 全 20 セルで survived_frames + 他 3 probe bit 完全一致 (= H-002〜H-008 + C313 + 本軸の同型論証 9 度目)
5. **kaizen #140 family 統合への寄与**: 4 軸全軸の閾値 robust 性データ物理化、検証期限 2026-06-20 family 統合実機検証窓に判定材料追加

## 7. C318-PX-invariance — raw 再分析: PX 別 6 ペア相関の PX-不変性 (2026-06-10 追記)

**狙い**: §6 は PX=15 baseline 表のみ提示。raw `correlations_per_px` (line 615〜724) には PX=10/15/20/30 全 4 条件 × 6 ペア × 2 統計量 = 48 値が既算出済だが未抽出。本節で抽出し、§7 残務筆頭「`instinct × temporal` Pearson 0.9959 の安定性 / 疑似相関判定」に **新規 measurement ゼロで** 追加証拠を取得する。

**PX 別 6 ペア相関比較表** (raw 直読、N=5 strategies):

| ペア | PX=10 P / S | PX=15 P / S | PX=20 P / S | PX=30 P / S |
|---|---:|---:|---:|---:|
| instinct × min_approach_p10 | -0.228 / -0.718 | -0.228 / -0.718 | -0.228 / -0.718 | -0.228 / -0.718 |
| instinct × cont_grazing_max | 0.577 / 0.290 | 0.577 / 0.290 | 0.577 / 0.290 | 0.577 / 0.290 |
| **instinct × temporal_inconsistency** | **0.994 / 0.290** | **0.996 / 0.574** | **0.996 / 0.574** | **0.996 / 0.574** |
| min_approach_p10 × cont_grazing_max | 0.352 / 0.154 | 0.352 / 0.154 | 0.352 / 0.154 | 0.352 / 0.154 |
| min_approach_p10 × temporal_inconsistency | -0.144 / 0.359 | -0.160 / 0.112 | -0.160 / 0.112 | -0.160 / 0.112 |
| cont_grazing_max × temporal_inconsistency | 0.638 / 0.763 | 0.632 / 0.803 | 0.632 / 0.803 | 0.632 / 0.803 |

**観測 1 (Pearson PX-不変性)**: PX=15/20/30 で 12 値完全同一 = temporal_inconsistency_count が PX=15/20/30 で全 strategy 不変 (§5 装置物理整合性) の論理的帰結。**§5 確証の独立検算として機能**。

**観測 2 (PX=10 局所微差)**: PX=10 → 15 で nospecial 3→2 / camper 1→0 / lane-holder 1→0 の 3 件減 = PX=10〜15 帯域に存在した境界 inconsistency が PX=15 閾値で除外。この変化が temporal 軸 3 ペアに局所影響。**Pearson instinct × temporal は 0.994 → 0.996 で 0.002 差 = ほぼ不変** → **強相関の頑健性 PX 全帯域で確証**。

**観測 3 (Spearman の PX 感応)**: Spearman `instinct × temporal` は 0.290 (PX=10) → 0.574 (PX≥15) で **倍増**。一方同ペア Pearson は不変 (0.994 → 0.996)。**この乖離 = "線形依存は強・順位依存は中" 構造が PX に応じて変動**。
- PX=10: temporal 値 (43/1/1/0/3) で nospecial が camper/lane-holder より上 = good 支配が線形だけに残り順位で薄まる
- PX≥15: nospecial 値が 2 に減じ他 0 系統と順位近接 = good 支配が順位にも波及
- **§6 で予測した「good と他 4 strategy の二極構造による疑似相関」仮説の追加証拠**: Pearson は線形二極構造に支配されるが、Spearman は順位構造の微変動を拾うため PX 感応が出る → **multi-seed (N≥10) 拡張で good 以外の strategy 値分布の広がりを増やせば Pearson も低下する公算が高い**

**観測 4 (完全不変ペア 3 種)**: temporal を含まない 3 ペア (instinct × min_approach_p10, instinct × cont_grazing_max, min_approach_p10 × cont_grazing_max) は全 PX で値完全一致 = §8 表の 3 軸独立性結論が PX 全帯域で安定。

**意味 (kaizen #140 family 統合への寄与)**:
- §7 残務筆頭の強相関 0.9959 安定性議論に新規 measurement ゼロで Pearson PX 不変性 (0.994〜0.996) の物理証拠を追加
- multi-seed 拡張時の判定基準が「Pearson 0.9 を割れば疑似相関裏付け」に絞れる (PX 帯域変動による誤判定リスクなし)
- Spearman PX 感応 (0.290 → 0.574) は疑似相関仮説を**強める方向の補強** (PX 閾値が strategy 順位構造の感応性を持つ = 二極構造に寄った相関である裏付け)

## 8. 未確認 / 残務

- multi-seed (N≥10) での 4 軸 6 ペア相関値分布、特に `instinct × temporal` Pearson 0.9959 の安定性 / 疑似相関判定
- HeLa-Mem (arxiv 2604.16839) spreading activation 軸 prototype 追加後の 4 軸 → 5 軸拡張 (point process → graph process)
- 4 軸 vs 実機体感 Pearson 相関 = PEARSON_BLOCKER 3 本目候補 (実機判定 Nao_u/Mir/Ash 取得後)
- TEMPORAL PX 設計値 15 の根拠強化: player_r×2 + bullet_r 衝突窓近傍 = 体感「ghost target が外れた」最小単位の実機検証
- 4 軸構造から 3 軸構造への縮約検討 (`instinct_trigger_count` の代替軸再選定 or `temporal_inconsistency_count` への置換): 強相関 plateau 確証後

## 9. リンク

- [verify.js](verify.js) C316 Phase 4 差分 = `TEMPORAL_INCONSISTENCY_THRESHOLD_PX` env/CLI 外部化 + `--temporal-sensitivity-sweep` モード
- [temporal_sensitivity_sweep_raw.json](temporal_sensitivity_sweep_raw.json) = `node verify.js --temporal-sensitivity-sweep` 生 JSON 出力 (`correlations_per_px` line 615〜724 = §7 抽出元)
- [design_log.md](design_log.md) §9 = C316 Phase 4 着地節 / §10 = C318 Phase 4 raw 再分析節
- [instinct_sensitivity.md](instinct_sensitivity.md) = C313 §8 着地 (本ファイルはその 2 本目 = 4 軸 6 ペア拡張)
- [instinct_sensitivity_sweep_raw.json](instinct_sensitivity_sweep_raw.json) = C313 sweep 生 JSON (本サイクル sweep の同型先行ファイル)
- [hypotheses.md](hypotheses.md) H-007 = instinct_trigger 軸導入の起点
- [PEARSON_BLOCKER.md](PEARSON_BLOCKER.md) = 4 proxy 軸 Pearson 算出 closure (C288)、本ファイルは proxy 数 3→4 拡張 + TEMPORAL PX 軸追加で同型実験を新条件下再走
- [../../../projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) = 残課題 [x] 化対象
