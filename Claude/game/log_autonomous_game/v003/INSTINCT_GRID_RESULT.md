# INSTINCT_GRID_RESULT — 戦略軸 probe_density ICC(2,1) 初検証

**起票**: 2026-06-02 C284 Phase 4 (Log)
**前段**: [PEARSON_BLOCKER.md](PEARSON_BLOCKER.md) §6-3 (a) 絶対軸 gate FAIL (proxy_icc_diagnose.py が seed_base 軸で 4 列とも ICC≈0)
**処方**: 軸を変えて再計測 — seed_base 軸 → 戦略軸 (instinct_probe.js + 3 bot 戦略)
**実装**: instinct_probe.js (`--strategy` flag 追加) / instinct_grid_icc.py (新規, 純 stdlib)
**入力**: measurements_instinct_grid.jsonl (3 strategies × 10 seeds = 30 trials)
**ICC 公式**: one-way random, ICC = (MS_b - MS_w) / (MS_b + (k-1) MS_w), 閾値 ≥ 0.3 (Mustahsan)

## 1. 計測結果

### 1.1 戦略別 probe_density 分布

| 戦略 | mean | variance | n | seed 範囲 | 死因傾向 |
|---|---:|---:|---:|---|---|
| **camper** | 0.0000 | 0.000000 | 10 | 20260601-10 | 全 trial 5.32s で bullet 死 |
| **naive_good** | 0.2889 | 0.012207 | 10 | 20260601-10 | 全 trial 8.68s で bullet 死 |
| **blind-sweeper** | 0.7500 | 0.004630 | 10 | 20260601-10 | 5.28-7.35s で bullet 死 |

### 1.2 ICC 結果

```
[ICC] column=probe_density classes=3 trials=10 icc=0.9621 ci_low=0.9621 ci_high=0.9621 judge=PASS
```

- **ICC = 0.9621** (N=3 のため Fisher Z 近似 CI は計算式上 point estimate に縮退 → CI 表示は icc 値そのもの。N>3 で初めて区間が出る)
- **判定 = PASS** (≥0.3)

## 2. 解釈

### 2.1 PASS の意味

戦略軸で probe_density が極めて強く分離 (camper=0 / naive_good=0.289 / blind-sweeper=0.750)。
**本能側計測経路 (post-lock 6 frame の dirToken 列の隣接変化数)** が戦略軸で機能している = 「測れている」第 1 関門通過。

これは proxy_icc_diagnose.py が seed_base 軸で 4 列とも ICC≈0 / FAIL を返したのと対照的。
**軸を変えれば測れる** = PEARSON_BLOCKER §6-3 (a) ICC FAIL 確定の出口は「proxy 設計が悪い」ではなく「class 軸の選び方が悪い」可能性を支持する第 1 サンプル。

### 2.2 戦略間の構造的解釈

- **camper = 0**: 不動 → dirToken は常に (0,0)=4 で変化ゼロ → probe_density = 0
  (期待通り。castLock 自体は trail 蓄積で発火するが post-lock 窓内の方向変化なし)
- **blind-sweeper = 0.750**: 毎 frame 一様乱数 ±1 → 9 token から再抽選で 5 frame transitions のうち ≈ 8/9 ≈ 0.89 確率で変化、castCount=2 で post_lock_frame_total=12 → 期待値 0.83 程度に近い実測 0.75
- **naive_good = 0.289**: 最近接脅威からの離反方向が滑らかに変化 → 6 frame 窓内では 1-2 回の方向変化が典型

3 戦略は probe_density 軸上で物理的にほぼ等間隔に並んでおり、計測解像度が戦略差を捉えている。

### 2.3 C282 Phase 4 物理的再定義との接続

C282 で本 probe を「action-feedback link 切断の代理指標」(Wayline Juice Problem + ACM CHI 2024) として再定義した。本サイクル PASS = 「link 状態と probe_density の関係を語れる土台ができた」段階。

- **camper** は link が **そもそも存在しない** (入力ゼロ) ケース → probe_density=0 は当然
- **blind-sweeper** は link が **未確立 / 切断状態** (入力と画面状態の相関なし) → 高 probe_density
- **naive_good** は link が **機能している** (入力が画面状態に基づいて選ばれる) → 中間 probe_density

= 「link 強度の逆相関指標」候補としての解釈は与えうる。ただし本サイクルは戦略軸の **存在確認** のみで、link 強度との単調関係 (= 因果) は別検証 (C285 以降)。

## 3. What this PASSES / does NOT prove

### PASS:
- probe_density が **戦略軸で分離する** = 計測解像度の存在
- **軸を変えて再計測** という処方が PEARSON_BLOCKER §6-3 (a) ICC FAIL 確定に対する有効な反撃手段であること
- camper の予測 0 が実測 0 = 設計通りの極限挙動

### does NOT prove:
- probe_density と **人間体感の Pearson 相関** (本サイクルは axis 検証段階で judgment 列なし)
- probe_density と **link 強度の単調関係** (camper/naive_good/blind-sweeper の 3 点並びは「link 強度の順序」と一致するが、4 点目以降の追加検証必要)
- N=3 classes は **CI が point estimate に縮退** = 区間推定上限の幅は別途 N≥4 で取得
- 全 trial が gameover で **survived ケースの probe_density** 未観測 (本能側 probe が死亡前提に偏っていないかは別検証)
- **PROBE_WINDOW_FRAMES=6 の妥当性** (窓幅を変えると分離は維持されるか)

## 4. 次手候補 (C285 以降)

1. **N≥4 化**: 戦略を 1 つ追加 (例: `lane-holder` を verify.js から移植) → Fisher Z CI が区間として出る
2. **窓幅変動 sensitivity**: PROBE_WINDOW_FRAMES = 3 / 6 / 12 で ICC 安定性を比較
3. **判定値接続**: Nao_u/Mir/Ash に 3 戦略のリプレイを見せて「どれが link 切断状態か」体感判定 → probe_density vs 体感の Spearman 開始可能化
4. **proxy 4 列の戦略軸計測**: agent_difficulty_proxy.js を 3 戦略で再走し、proxy 4 列も戦略軸 ICC を取得 → seed_base FAIL の処方が「seed_base 軸不適切」なのか「proxy 設計不良」なのかを切り分け

## 5. 副作用と制約

- `game.js` 改変ゼロ (`git diff game/log_autonomous_game/v003/game.js` 空)
- 純 stdlib (Node 標準 + Python 標準のみ)
- 新規ファイル: `measurements_instinct_grid.jsonl`, `measurements_instinct_{naive_good,camper,blind_sweeper}.jsonl`, `instinct_grid_icc.py`, 本ファイル
- `instinct_probe.js` 変更点: `--strategy` フラグ追加 / `STRATEGIES` 辞書 / `applyMove` 抽出 / 出力に `strategy` 列追加 (旧コマンドの default 動作 = `--strategy naive_good` は前と完全同型)
