# Pearson 計算前提 解消 進捗 (v003)

最終更新: 2026-05-31 C272 Phase 4 (Log)

## 前提 3 つと進捗

| 前提 | 内容 | 状態 | 着地 commit / cycle | 物理化ファイル |
|---|---|---|---|---|
| 1/3 | proxy 側 σ_x > 0 (proxy 4 列のうち最低 1 列で std > 0) | ✅ 充足 | C271 Phase 4 (2026-05-30) | [MULTISEED_RESULT.md](MULTISEED_RESULT.md) / [proxy_vs_judgment_multiseed.csv](proxy_vs_judgment_multiseed.csv) |
| 2/3 | judgment 側 σ_y > 0 (judgment 6 列のうち少なくとも 2 列で std > 0) | ✅ 充足 | **C272 Phase 4 (2026-05-31, 本サイクル)** | 本ファイル / [proxy_vs_judgment_labeled.csv](proxy_vs_judgment_labeled.csv) |
| 3/3 | 連続フレーム視覚判定値の取得 (n>3 化、実機・連続観測由来の独立 judgment 軸) | ⏳ 未着手 | C273 以降の Phase 4 候補 | [capture_frames.js](capture_frames.js) (段階 2 着地済) / [self_judgment.md](self_judgment.md) Q-D 節 |

前提 1/3 + 2/3 充足で **σ_x > 0 ∧ σ_y > 0** が同時成立。Pearson 相関係数 r = Cov(x,y) / (σ_x · σ_y) の分母ゼロ問題は解消、ただし前提 3/3 (実機由来の独立 fun_score) 未到達のため r の値はまだ意味解釈に堪えない (今は「計算できる」段階)。

## 本サイクル C272 Phase 4 着地物

### 実装サマリ

| 項目 | 値 |
|---|---|
| 実行 commit | C272 Phase 4 (本サイクル、`game:` prefix) |
| 実行コマンド | `node build_proxy_csv.js --labeled` |
| SEED_BASE セット | {1000000, 2000000, ..., 10000000} (10 SEED) |
| 1 SEED あたり trials | 30 |
| version | {v001, v002, v003} (3 version) |
| 総 row 数 | 10 × 30 × 3 = **900 行** |
| noise_scale | 1.5 (multiseed と同条件) |
| 出力 jsonl | [measurements_labeled.jsonl](measurements_labeled.jsonl) (900 行) |
| 出力 csv | [proxy_vs_judgment_labeled.csv](proxy_vs_judgment_labeled.csv) (900 行 + header) |
| 新 CLI フラグ | `--labeled` |
| 既存 `--multiseed` モード | 後方互換維持 (CSV/JSONL 別名出力で非破壊) |

### 判定値出典 (完遂定義 5、`feedback_headless_unfit_for_unfinished_eval.md` T:5 順守)

| version | q_a | q_intro | q_success_fb | q_d | q_c | q_e | 合計 | 出典 / 暫定値表記 |
|---|---|---|---|---|---|---|---|---|
| v001 | 5 | 4 | 3 | 3.5 | (軸未設定) | 5 | **20.5/25** | [v001/self_judgment.md §7b 新合計 20.5/25](../v001/self_judgment.md) — 起点採点、Q-C 軸はまだ無い |
| v002 | 5 | 4.5 | 3 | 4.5 | 4.5 | 5 | **26.5/30** | [v002/self_judgment.md §1 新合計 26.5/30](../v002/self_judgment.md) — Q-C 軸新設後の確定値 |
| v003 | 5 | 4.5 | 3 | 4.5 | 4.5 | 5 | **26.5/30 (暫定継続)** | [projects/log_autonomous_game.md §fun_score §2](../../../projects/log_autonomous_game.md) — v002 値暫定継続、実機判定到達まで未確定 |

**暫定値表記の意味**:
- v001 は §7b 起点 (20.5/25)。後段 §7d で Q-D 3.5→4.0 暫定昇格 (mental simulation 追加) があるが、本 Pearson 計算は projects 側 headline (= §7b 値) を採用 = 「fun_score 代理として安定して引用できる値」を優先
- v003 は v002 値継続。`feedback_headless_unfit_for_unfinished_eval.md` T:5 (headless 全 PASS だけでは『ちゃんと遊べている』判定不能) 順守、実機判定 (Nao_u / Mir / Ash) 到達まで上書き不可
- v001 の q_c は **null = CSV 空セル** で出力 (Q-C 軸が v001 時点で未設定だったため、0 等の sentinel ではなく欠損値として扱う)

### 分散獲得確認 (完遂定義 2)

```
proxy 4 列 (300 trial × 3 version = 900 行から std 計算):
  proxy_clear_rate      std=0.170587   finite_count=900
  proxy_damage_per_min  std=2.030909   finite_count=900
  proxy_survival_time   std=21.129381  finite_count=900
  proxy_input_density   std=0.904913   finite_count=900

judgment 6 列 (900 行から std 計算、q_c のみ v001 欠損で finite=600):
  q_a            std=0           finite_count=900
  q_intro        std=0.235702    finite_count=900
  q_success_fb   std=0           finite_count=900
  q_d            std=0.471405    finite_count=900
  q_c            std=0           finite_count=600  (v002/v003 同値、v001 欠損)
  q_e            std=0           finite_count=900

judgment_std_gt_zero_count = 2   (q_intro, q_d)
variance_check_passed = true     (rule: judgment 列 std > 0 が 2 列以上)
```

- 完遂定義 2 ルール: 「judgment 6 列のうち **少なくとも 2 列で std > 0**」 → 結果 **2 列で std > 0 (q_intro, q_d)** → **PASS**
- q_a / q_success_fb / q_e は v001/v002/v003 で全て同値 (5/3/5) のため std = 0 が当然。これは「3 軸で改修効果が観察されなかった」事実認定であり、本 Pearson 前提 2/3 解消の本質は「q_intro と q_d で v001→v002 改修の差分が judgment 側にも実数値として乗った」点
- q_c は v001 で欠損 → v002/v003 で同値 4.5 のため σ_y = 0 (n=600 で std 計算しても 0)

### Pearson 計算可能性判定

| | 状態 | 備考 |
|---|---|---|
| proxy 側 σ_x > 0 | ✅ 4 列とも | C271 Phase 4 着地 |
| judgment 側 σ_y > 0 | ✅ 2 列 (q_intro, q_d) | **本 C272 Phase 4 着地** |
| n ≥ 4 (Pearson 自由度 ≥ 2) | △ n=3 version (v001/v002/v003) で実質 n=2 (重複 v002/v003 同値) | 前提 3/3 で実機由来 fun_score 追加が必須 |
| **Pearson r 値が意味解釈可能** | ❌ まだ | n 不足 + judgment 側が「Log 暫定値」由来で fun_score 代理性が未検証 |

**結論**: 本サイクルで Pearson 計算の **数学的前提** (σ_x > 0 ∧ σ_y > 0) は揃った。次に詰めるべきは「Pearson 値の **解釈可能性**」= 前提 3/3 (連続フレーム視覚判定 or 実機判定) で独立 judgment 軸を増やす経路。

## 既知の限界と次サイクル候補

### 既知の限界
1. **n 不足**: version = 3、しかも v002 と v003 の judgment が同値 → 実質独立点 n=2。前提 3/3 で連続フレーム視覚判定値 (例えば各 frame から推定した「危機接触頻度」「弾密度」「予測軌道存在率」など) を judgment 列に追加できれば n が version 軸から trial 軸へ拡張可能
2. **q_a / q_success_fb / q_e 軸の差分ゼロ**: 改修が無かった軸を 6 軸並べることで σ_y は希薄化。「改修差分が出る軸だけで Pearson」のサブ計算が必要になる場面が来る
3. **proxy 側の盲点維持**: C271 で観察された「素朴良手 agent が wave 1 内死亡で phase 2 計測ゼロ」問題は変わらず。proxy_vs_judgment_labeled.csv の survival_rate (300/900 × 3 version で約 3%) は agent 弱さの反映、game 難易度の純粋な反映ではない (C263 §1 / C264 §1 と同根)

### 次サイクル候補 (C273 以降)
1. **前提 3/3 着手**: [capture_frames.js](capture_frames.js) の 60 frame サンプル (C268 着地) から、frame 毎に「弾密度 (画面内弾数)」「自機-最近接弾距離」「予測軌道線本数 (v001 のみ存在)」を視覚判定 → 連続観測由来 judgment 軸を 1〜2 本追加
2. **fun_score 代理問題への直撃**: 実機判定 (Nao_u / Mir / Ash の Pulse Relay) 取得 → [projects/log_autonomous_game.md §C251 残課題 経路 R1〜R5](../../../projects/log_autonomous_game.md) のうち R1 (Nao_u 評価依頼) 着手
3. **「改修差分が出る軸だけで Pearson」サブ計算**: q_intro と q_d の 2 軸だけで Pearson 計算を試す。proxy 4 軸 × judgment 2 軸 = 8 ペアの r を出して、proxy 何が fun_score と相関するかの仮説候補を絞る

## 関連ファイル

- [PEARSON_BLOCKER.md](PEARSON_BLOCKER.md) — 前提 1/2/3 設計 (C270 起票、本ファイル前段)
- [MULTISEED_RESULT.md](MULTISEED_RESULT.md) — 前提 1/3 解消の着地報告 (C271 Phase 4)
- [build_proxy_csv.js](build_proxy_csv.js) — `--labeled` モード追加済 (C272 Phase 4)
- [proxy_vs_judgment_labeled.csv](proxy_vs_judgment_labeled.csv) — 900 行素データ (本サイクル新規)
- [measurements_labeled.jsonl](measurements_labeled.jsonl) — 900 行 jsonl (本サイクル新規)
- [v001/self_judgment.md](../v001/self_judgment.md) §7b — v001 起点 20.5/25 出典
- [v002/self_judgment.md](../v002/self_judgment.md) §1 — v002 26.5/30 出典
- [self_judgment.md](self_judgment.md) (v003) — Q-D 連続フレーム視覚判定 4.0 暫定 (C268)、本 Pearson は headline 4.5 採用、出典差は本ファイル「判定値出典」節で明示
- [projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) §fun_score §2 — v003 暫定継続値 26.5/30 出典
