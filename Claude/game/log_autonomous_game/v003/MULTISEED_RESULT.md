# proxy_vs_judgment_multiseed.csv マルチシード化結果

最終更新: 2026-05-30 C271 Phase 4 (Log)

## 何を達成したか

[PEARSON_BLOCKER.md] 前提 1 (proxy 側マルチシード化) を解除。
proxy 4 列の std > 0 を全列で達成、Pearson 計算の数学的前提のうち 1/3 を充足。

## 実装サマリ

| 項目 | 値 |
|---|---|
| 実行 commit | C271 Phase 4 (本サイクル) |
| 実行コマンド | `node build_proxy_csv.js --multiseed --noise-scale 1.5` |
| SEED_BASE セット | {1000000, 2000000, ..., 10000000} (10 SEED) |
| 1 SEED あたり trials | 30 |
| 総 trials | 300 |
| noise_scale | 1.5 (agent 側 default 0.25、build 側で override) |
| 出力 jsonl | `measurements_multiseed.jsonl` (300 行) |
| 出力 csv | `proxy_vs_judgment_multiseed.csv` (300 行 + header) |

## 分散獲得確認 (完遂定義 3)

```
proxy_clear_rate     : mean=0.0300  std=0.1706  min=0      max=1
proxy_damage_per_min : mean=2.5195  std=2.0309  min=0      max=8.5714
proxy_survival_time  : mean=36.99   std=21.13   min=7.00   max=90.00
proxy_input_density  : mean=20.26   std=0.9049  min=18.71  max=25.71
survival_rate (300)  : 0.0300 (9/300)
```

- 完遂定義 3 ルール: `std(proxy_clear_rate) > 0 OR std(proxy_damage_per_min) > 0 OR std(proxy_survival_time) > 0 OR std(proxy_input_density) > 0`
- 結果: 4 列すべてで std > 0 → **PASS** (variance_check_passed=true)

## SEED 毎の代表値

| seed_base | mean(survival_time) | median(survival_time) | survival_rate |
|---|---|---|---|
| 1000000  | 39.97 | 27.72 | 0.100 |
| 2000000  | 38.17 | 27.52 | 0.033 |
| 3000000  | 37.60 | 28.00 | 0.000 |
| 4000000  | 34.03 | 27.37 | 0.033 |
| 5000000  | 31.76 | 27.39 | 0.000 |
| 6000000  | 33.97 | 27.38 | 0.000 |
| 7000000  | 35.78 | 27.41 | 0.067 |
| 8000000  | 40.19 | 36.16 | 0.000 |
| 9000000  | 36.61 | 27.52 | 0.000 |
| 10000000 | 41.77 | 44.88 | 0.033 |

- median は seed_base 間で 27.37 〜 44.88 秒の範囲、mean は 31.76 〜 41.77 の範囲
- noise-scale 1.5 + base seed 大幅差で proxy 側に意味ある分散が獲得できることを実証

## noise_scale 選定理由 (1.5 を採用)

ドライランで noise-scale を変えた挙動:

| noise_scale | play_time_sec の分散 | clear_wave 分布 |
|---|---|---|
| 0.25 (元の値) | 全 trials で 8.68 固定 | 1 のみ |
| 0.5 | 8.68 固定 | 1 のみ |
| **1.5 (採用)** | **9.27 〜 90.00 で分散** | **1/2/3 分布** |

- 0.25 は agent の nearest-threat avoidance + center bias による「決定論的死亡パターン」を破れない (8.68 秒で wave1 の特定 bullet に必ず被弾)
- 1.5 まで上げて nearest-threat 寄与と同オーダーになり、agent 死亡時刻に意味ある揺れが生じる
- agent_difficulty_proxy.js 単独実行時の default は 0.25 を維持 (既存 measurements.jsonl との後方互換)
- build_proxy_csv.js --multiseed のときだけ 1.5 を default 適用

## Pearson 計算可能性判定

- **proxy 側**: 4 列とも分散獲得 → 数学的に分母 σ_x > 0 が成立
- **judgment 側 (q_a/q_intro/q_success_fb/q_d/q_c/q_e)**: 依然 6 列すべて固定値 → σ_y = 0
- **Pearson 相関係数**: 依然未定義 (σ_x · σ_y の分母 σ_y = 0)
- **残作業**: [PEARSON_BLOCKER.md] 前提 2 (複数判定セット投入 = C272 候補) / 前提 3 (連続フレーム視覚判定 = C273 候補) を分割実装

## 旧 proxy_vs_judgment.csv との関係

- 旧 `proxy_vs_judgment.csv` (30 行 同一値) は単一 SEED モード (`node build_proxy_csv.js` 引数なし) で再生成可能、後方互換あり
- 新 `proxy_vs_judgment_multiseed.csv` (300 行) は Pearson 計算用、判定セット拡張 (前提 2) を待つ素データ
- v001/v002 比較は C264 で実施済、今後ラベル列を q_* に追加して v ラベル × 判定セット の格子化へ進める

## 関連ファイル

- [PEARSON_BLOCKER.md](PEARSON_BLOCKER.md) — 前提 1/2/3 設計
- [agent_difficulty_proxy.js](agent_difficulty_proxy.js) — `--seed-base` / `--noise-scale` CLI 追加済
- [build_proxy_csv.js](build_proxy_csv.js) — `--multiseed` モード追加済
- [measurements_multiseed.jsonl](measurements_multiseed.jsonl) — 300 行素データ
- [proxy_vs_judgment_multiseed.csv](proxy_vs_judgment_multiseed.csv) — 300 行判定結合 CSV
- [../../../projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) — Active project (C271 Phase 4 ブロック追記対象)
