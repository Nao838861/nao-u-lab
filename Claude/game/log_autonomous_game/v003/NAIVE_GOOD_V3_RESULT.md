# NAIVE_GOOD_V3_RESULT (C295 Phase 4 着地)

## 1. 概要
- **戦略**: `strategyNaiveGoodV3` = v2 bullet sidestep + **enemy 離反 2 段化** (緊急 < 80px / 0.6、中距離 80-180px / 0.2、安全時中央 0.5)
- **狙い**: v2 phase 0 早期 enemy 接触 3/10 を ≤ 1/10 に抑え、phase 1 到達を 6 → 8/10、phase 2 到達を 1 → 2+/10 に押し上げる
- **コマンド**: `node instinct_probe.js --strategy naive_good_v3 --seed-base 20260603 --trials 10 --out measurements_instinct_naive_good_v3.jsonl`

## 2. 完遂条件 7 項目 判定

| # | 条件 | 結果 | 達成 |
|---|------|------|------|
| 1 | `strategyNaiveGoodV3` 関数追加 + STRATEGIES map 登録、v1/v2 + runOne/phase-split sampling 無変更 | ✓ 既存 5 戦略のまま、v3 を `naive_good_v2` の直後に並列追加 | ✓ |
| 2 | `--strategy naive_good_v3 --seed-base 20260603 --trials 10` で JSONL 着地 | ✓ `measurements_instinct_naive_good_v3.jsonl` 10 行 | ✓ |
| 3 | phase 1 到達 (play_time_sec ≥ 20.0) ≥ 8/10 | 6/10 (seeds 03, 04, 05, 09, 11, 12) — v2 と同等、+2 seed 改善は **未達** | ✗ |
| 4 | phase 2 到達 (90s 生存 or ≥ 50s) ≥ 2/10 | 3/10 (seeds 04 @57.7s, 05 @79.0s, 12 @59.2s) — v2 1/10 から **+2 達成** | ✓ |
| 5 | enemy 接触死 ≤ 1/10 | 2/10 (seeds 04, 09) — v2 3/10 から **-1 だが target 未達** | ✗ |
| 6 | `NAIVE_GOOD_V3_RESULT.md` 起票 | ✓ 本ファイル | ✓ |
| 7 | `game:` prefix 1 commit で着地 | (Phase 5 で実施予定) | 持越 |

**着地ステータス: 4/7 条件達成、phase 1 + enemy 死 が未達**

## 3. 10 seed table

| seed | death  | time(s)| cast | density| phase0 cast/dens | phase1 cast/dens | phase2 cast/dens |
|------|--------|--------|------|--------|------------------|------------------|------------------|
| 20260603 | bullet | 47.12 | 16 | 0.3542 | 7/0.3333 | 9/0.3704 | 0/----   |
| 20260604 | enemy  | 57.70 | 19 | 0.2895 | 7/0.3333 | 10/0.2167 | 2/0.5000 |
| 20260605 | bullet | 79.03 | 27 | 0.3141 | 7/0.4762 | 10/0.1833 | 10/0.3333 |
| 20260606 | bullet |  7.98 |  3 | 0.4167 | 3/0.4167 | 0/----   | 0/----   |
| 20260607 | bullet | 17.82 |  6 | 0.3889 | 6/0.3889 | 0/----   | 0/----   |
| 20260608 | bullet | 18.23 |  6 | 0.5833 | 6/0.5833 | 0/----   | 0/----   |
| 20260609 | enemy  | 39.72 | 13 | 0.3974 | 7/0.3571 | 6/0.4444 | 0/----   |
| 20260610 | bullet | 17.82 |  6 | 0.4722 | 6/0.4722 | 0/----   | 0/----   |
| 20260611 | bullet | 27.77 |  9 | 0.3889 | 7/0.2857 | 2/0.7500 | 0/----   |
| 20260612 | bullet | 59.17 | 20 | 0.2917 | 7/0.3333 | 10/0.1833 | 3/0.5556 |

中央値: probe_density=0.3889、cast_count=11、play_time_sec=33.745、post_lock_input_count=26
phase 別中央値: p0 dens=0.3730 cast=7 / p1 dens=0.2935 cast=4 / **p2 dens=0.5000 cast=0** (v2 では p2 dens=0.3974 → 上振れ)

## 4. v2 比較 (seed 20260603+0..9)

| metric | v2 (C294 着地) | v3 (本サイクル) | Δ |
|--------|-----|-----|---|
| phase 1 到達 (≥20s) | 6/10 | 6/10 | ±0 |
| phase 2 到達 (≥50s) | 1/10 | 3/10 | **+2** |
| 90s 生存 | 1/10 | 0/10 | -1 |
| enemy 死 | 3/10 | 2/10 | **-1** |
| bullet 死 | 6/10 | 8/10 | +2 |
| median(play_time) | 28.05s | **33.75s** | +5.7s |
| median(probe_density) | 0.4121 | 0.3889 | -0.023 |
| phase 2 median(dens) | 0.3974 | 0.5000 | +0.103 |

**読み**: enemy 接触は 1 件減 + phase 2 到達 +2 達成。ただし bullet 死は 2 件増 (enemy 離反が bullet 回避経路を一部撹乱した代償)。total として 「もっと深く進むが浅い seed の bullet 死率が増えた」分布シフト。

## 5. 死因分布シフト

| 死因 | v2 | v3 | Δ |
|------|----|----|---|
| bullet | 60% | 80% | +20pt |
| enemy  | 30% | 20% | -10pt |
| 90s 生存 | 10% | 0% | -10pt |

**観測**: 死因が enemy → bullet にシフト (狙い通り)。ただし「最深到達 seed が完走できなくなった」副作用あり (90s 生存 1→0)。v3 の enemy 離反が phase 2 後半で player を端へ追い詰める paths が混ざる可能性 (seed 05 が 79.03s で bullet 死、v2 では同 seed が完走していた)。

## 6. 重み調整 3 試行記録 (staging 最大 2 回リトライ準拠)

| 試行 | 設定 | phase1 | phase2 | enemy | bullet | 判定 |
|------|------|--------|--------|-------|--------|------|
| 1 | enemy 0.5 一律 < 200 / sidestep 1.2 < 120 / ノイズ 0.2 | 4/10 | 0/10 | 3/10 | 7/10 | 棄却 (v2 より悪化) |
| 2 | enemy 緊急 0.6 < 80 / 中距離 0.2 80-180 / sidestep 1.2 < 120 / ノイズ 0.2 | **6/10** | **3/10** | **2/10** | 8/10 | **採用** |
| 3 | enemy 0.7 < 70 / 中距離 0.25 70-160 / sidestep 1.3 < 140 / ノイズ 0.15 | 4/10 | 0/10 | 1/10 | 9/10 | 棄却 (bullet 死過剰) |

**学び**: bullet sidestep の reach + 重み を上げる (試行 3) と全体の生存時間が下がる (sidestep 撹乱とハマリ路の悪化)。試行 2 の「enemy 緊急時のみ強く、中距離は v2 と同じ弱さ」が bullet sidestep を最小限しか撹乱せずに enemy 接触は減らせる balance。

## 7. 副次的観測 (次サイクル N=40+ 教師データ候補)

- **phase 2 dens の上振れ (0.3974 → 0.5000)**: phase 2 到達 3 seed のうち seed 04 / 12 で phase 2 dens 0.5+ を観測。v3 の enemy 離反が phase 2 後半で「敵が密集する状況で離反方向が頻繁に切り替わる」分布を作っている可能性。SHOOT_INTERVAL ramp (C293 宙吊り仮説) の検証窓を、phase 2 cast=3+ を確保した 2 seed (04 / 12) で局所的に展開できる候補。
- **phase 0 死亡 seed 4 件 (06/07/08/10) はすべて bullet 死 / play_time 8-18s**: 死亡時 cast=3-6 で短命、castLock 60 frame 中の不可避被弾が支配的。これは strategy ではなく structural 制約 = `naive_good_v4` で sidestep だけ強くしても解けない可能性。次サイクル候補 = (a) castLock 中の事前位置取り (cast 開始前に弾道予測経路を回避位置に移動)、(b) castLock 中の bullet predicted impact 回避 (一時的な軌道編集) のどちらか。
- **bullet 死 8/10 / enemy 死 2/10 の構造**: 「敵に近づき過ぎない」が成立しても「弾は別軸で来る」 = enemy 離反が bullet 進入路と独立に効くだけでは、bullet 死は減らせない。**bullet と enemy が独立した脅威系統である** という構造観測が今回の核。
- **完遂条件 7 項目中 4 達成 / 2 未達 / 1 持越**: phase 1 + enemy 死 未達は、(a) staging で固定した v2 baseline 自体が天井に近かった可能性、(b) v3 の enemy 離反 + bullet sidestep の合成設計に根本的な限界 (役割分担で各々 50% ずつ効くが、両方が同時に必要な瞬間が解けない) — 後者なら v4 では「2 軸を統合した predictive avoidance」が必要。

## 8. 次サイクル C296 候補

- **(1) v4 候補処方 = castLock 中事前位置取り**: cast 開始判定の直前に「これから 60 frame 弾が飛んでくる経路」を予測し、cast 開始位置をその経路から外す。bullet 死 8/10 の半分を救える可能性。
- **(2) v3 phase 2 SHOOT_INTERVAL ramp 検証**: phase 2 cast 確保 seed (04 / 12) で `--shoot-ramp` on/off 比較 → C293 ramp 仮説の検証窓が初めて開いた状態
- **(3) v3 で死因分布シフトを観測した教師データ蓄積**: 「enemy 離反項追加で enemy 死は減るが bullet 死が増える」は新規 N=40 教師データ候補 (sidestep と enemy 離反は独立軸で interaction あり)
