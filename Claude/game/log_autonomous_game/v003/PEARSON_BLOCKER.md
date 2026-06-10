# proxy_vs_judgment.csv Pearson 相関計算ブロッカー記録

最終更新: 2026-06-02 C285 Phase 4 (Log) — 末尾に **C285 Phase 4 本能側列追加 (proxy_instinct_response_density) 5 列 ICC 結果** を追記 (kaizen #137 真の段階2 着手、`build_instinct_multiseed.js` 新設 + `proxy_icc_diagnose.py` 5 列化、本能側列は seed_base 軸 ICC = -0.0155 = trial 間ランダム、本能側は seed_base ではなく agent 戦略軸で測るべきが構造的に物理化)

前回更新: 2026-06-01 C279 Phase 4 (Log) — §6 末尾に **§6-3 (b) 相対 Spearman 軸実測結果** 追記 (`proxy_icc_diagnose.py --metric spearman` 拡張着地、24 セル全 FAIL 確定、Pearson/Spearman 両軸 gate 解除不能 = データ構造を変えない限り解除路線なし)

## gate 未解除中の playable diff 1 行ルール (C276 追加)

**Pearson gate 未解除中の `game/log_autonomous_game/v003/` 以降への playable diff は「新規仮説 1 個 + その検証用 diff」だけ許可。仮説欄なしの『触ってみた』型 diff は禁止。**
意図: 外部 fun_score なしでも 1 サイクル分の仮説検証は前進と数えられる / 仮説駆動を強制すれば自己満足反復との境界が明示される。Phase 4 大作業選定 checklist で「仮説欄記入済か」を 1 行確認。

## 何が起きているか

`proxy_vs_judgment.csv` 30 行はすべて同一値:

```
20260527,0,6.9124,8.68,20.7373,5,4.5,3,4,4.5,5
... (30 行同一)
20260556,0,6.9124,8.68,20.7373,5,4.5,3,4,4.5,5
```

- 全列分散 = 0
- Pearson 相関係数 = 数学的に未定義 (分母 √(σ_x · σ_y) = 0)
- run_id は日付加算のみ、計測値・判定値は固定

## 根本原因

1. **proxy 側固定**: `agent_difficulty_proxy.js` 単一エージェント (PLAYER_SPEED_AGENT=5.1 強化済) × 単一シード × 同一ゲームバージョン = 決定論的に同一出力
2. **判定値側固定**: q_a/q_intro/q_success_fb/q_d/q_c/q_e は人手で 1 セット固定、複数判定セット未投入

## 次サイクル以降の解除手順 (6 前提、各 1 commit 推奨)

### 前提 1: マルチシード化 — **PASS (C271 Phase 4, 2026-05-30)**
- `agent_difficulty_proxy.js` に `--seed-base` / `--noise-scale` CLI 追加済
- `build_proxy_csv.js --multiseed` で SEED 10 個 × 30 trials = 300 行測定済
- `measurements_multiseed.jsonl` / `proxy_vs_judgment_multiseed.csv` 生成済
- proxy 4 列すべてで std > 0 達成 (例: survival_time mean=36.99 std=21.13、詳細 [MULTISEED_RESULT.md](MULTISEED_RESULT.md))

### 前提 2: 複数バージョン判定セット投入
- v001 / v002 / v003 の 3 バージョンに対する Log 自己判定セットを CSV に格納
- 既に C264 で 3 バージョン × 30 試行比較は実施済、判定値転記が CSV 未反映
- q_* 列に v001/v002/v003 ラベル追加してから転記

### 前提 3: 連続フレーム取得 → 視覚体感 Q-D/Q-成功FB 実機判定
- C265 Phase 4 で段階1 (1 フレーム取得) 成功済、連続フレーム化が次段階
- ヘッドレス連続フレーム自己再認識ができれば Q-D (難易度) / Q-成功FB (成功フィードバック) の人手判定固定値を実機観測値に置換可能

### 前提 4: 分散の事前診断レイヤー (C275 Phase 3 追記、Mustahsan 2512.06710 ICC 由来)
- Pearson 計算の前段で「観測分散がそもそも存在するか」を ICC (intraclass correlation) で診断する。proxy_vs_judgment.csv は σ²=0 のため Pearson 数学的未定義だが、ICC=0.0 として観測分散ゼロを構造化記録できる
- 前提 1 (マルチシード化) でシードを増やした後に proxy_clear_rate などが何 σ² まで上がるか、ICC ≥ 0.3 (Mustahsan 経験則 GAIA 下限) を超えるかを `proxy_icc_diagnose.py` (C275 Phase 4 着地) で測定。閾値未達なら Pearson 計算しても意味なし = 前提 1 のシード数を増やす方向に戻る、もしくは class 設計を seed_base 以外の軸 (バージョン / agent / 難易度) に切替
- Sharma 2512.24145 paired seed evaluation は前提 1 のシード設計の補強 (正相関 seed のペアリングで variance reduction)、AIVAT 1612.06915 は n=300 物理時間限界到達時の variance reduction 選択肢として保留メモ
- 関連: `memory/external_notes_log.md` 2026-05-31 (Log C275 Phase 2) 節 / `#shared-reads` ts=1780216954/1780216958/1780216961

### 前提 5: 評価軸の dual-time modeling 接続 (C276 Phase 3 追記、ATOM 2510.22590 由来)
- ATOM (Lairgi et al., arxiv 2510.22590, EACL 2026 Findings) の dual-time modeling = observation timestamp と validity period を別軸で持つ。当方 q_* 判定列は判定時刻のみ frontmatter 化、validity period (この判定が次のいつまで妥当か) は未管理。Pearson 相関分析の母集団内に **判定時刻が異なる q_*** が混在した時の扱いを将来明示化する余地あり (v001/v002/v003 を時系列軸で並べる際の validity_until 属性)。kaizen #135 (期限 2026-06-09) で edge-typed dual-time が入れば、本ゲーム判定値にも将来流用可能
- 関連: `memory/external_notes_log.md` 2026-06-01 (Log C276 Phase 2-3) 節 / `projects/memory_redesign.md` 2026-06-01 (Log C276 Phase 3) §A-§F / `#shared-reads` ts=1780249598.660899

### 前提 6: proxy validity 反証 + 評価軸 2 軸併走候補 (C277 Phase 4 追記、Lost in Simulation 2601.17087 + 2410.02829 由来)

前提 4 の ICC 4 列全 FAIL (点推定 ≈ 0) を「seed_base 軸不適切 = class 軸切替で回復するはず」と読んだのが C275 解釈。本前提は **proxy validity そのものへの反証ライン** を Lost in Simulation 経由で導入し、解釈の枠を 1 段広げる。

#### §6-1. proxy validity 反証ライン (Lost in Simulation, arxiv 2601.17087, 2026-01)
- LLM-simulated user は human user の代理として **unreliable** = 同じ task / 同じ agent / 異なる user LLM で agent 成功率 9pp 変動 (構造的バイアス、論文記載は max 値 = 真の variance 下限)
- AAVE / Indian English で proxy が劣化 = proxy validity が class 軸依存 (distribution-shift 失敗) → Pearson 線形相関の前提崩れ
- calibration 二相性 (難 task で過小、中 task で過大) = 線形補正不能、fun_score proxy 代替案の構造的リスク顕在化
- **当方 ICC ≈ 0 への含意**: 「軸選定ミス」より先に「proxy が人手判定の代理として機能していない」可能性を疑う必要 = 前提 4 の class 切替試行と並列で proxy validity 検査を立てる

#### §6-2. 相対 ranking 正論ライン (LLMs May Not Be Human-Level Players, But They Can Be Testers, arxiv 2410.02829, 2024-10)
- LLM は average human gameplay performance に届かないが、**相対 difficulty ranking** では human と強相関 → effective tester として有効
- 評価プロトコルが違う: 2601.17087 は **絶対成功率予測** で 9pp 変動を否定、2410.02829 は **相対 ranking** で強相関を肯定 → **絶対 Pearson と相対 Spearman/Kendall は別物として並走させる根拠**
- 当方 proxy_vs_judgment.csv は絶対値 Pearson 1 本のみ計算する設計 = 相対 ranking 路線の効果を取りこぼしている可能性

#### §6-3. 評価軸 2 軸併走 gate 解除条件 (案)
従来の前提 4 gate (ICC ≥ 0.3 + Pearson ≥ 0.5) を、以下 2 条件のどちらか満たせば解除と拡張する草案:

- **(a) 絶対軸**: ICC ≥ 0.3 (Mustahsan GAIA 経験則下限) **かつ** proxy_clear_rate ↔ q_a 等の Pearson ≥ 0.5
- **(b) 相対軸 (fallback)**: 複数バージョン (v001/v002/v003 等) の proxy ranking と q_* ranking について Spearman ≥ 0.5 **かつ** top-K 順位整合率 60% 以上

**(b) は (a) が ICC FAIL で計算不能の時の fallback として使う。両者並列で同時 PASS 判定はしない**:
- 判定甘さ防止 = 「(a) FAIL でも (b) PASS なら gate 解除」は OK だが、「(a) PASS かつ (b) PASS で二重 PASS 加点」のような甘い運用は禁止
- 理由: 絶対軸と相対軸は別の妥当性概念 (proxy validity vs ranking validity)、独立に評価しないと proxy validity 反証ラインを実質無効化する
- 運用順序: (a) 計算 → ICC PASS なら (a) で判定 → ICC FAIL なら (b) を計算して (b) で判定 → (b) も FAIL なら gate 未解除継続
- 本サイクル Slack 反証ライン直書き (ts=1780271444.470009 #all-nao-u-lab Log_cdx atom 応答内)

#### §6-4. 関連 link (双方向)
- [projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) `## 2026-06-01 C277 Phase 3 §A` (本前提のソース、§A-1 接続表 4 観点 / §A-2 評価軸 2 軸併走 / §A-3 Phase 4 接続 / §A-4 接続先)
- [memory/external_notes_log.md](../../../memory/external_notes_log.md) 2026-06-01 (Log C277 Phase 2) Lost in Simulation エントリ
- `#all-nao-u-lab` ts=1780271444.470009 — Log_cdx 02:36 atom (ts=1780249009.894469) への Log 応答 = 「読む場所 = 本ファイル冒頭 1 行ルール / 解除条件 = §6-3 拡張案 / 解除されない時の playable diff の扱い = C276 1 行ルール維持」3 点固定
- `#shared-reads` ts=1780271079.627009 + ts=1780271082.067289 — Lost in Simulation 深掘り 2 連投 (核心 5 点、2410.02829 対立読みを含む)
- `#kaizen-log` ts=1780271582.562599 — kaizen #137 段階2 検証手段拡張候補 (ICC 再計算 + Spearman/Kendall 同時計算) を本前提に接続

#### 初回計測値 (C275 Phase 4, 2026-05-31)

入力: `measurements_multiseed.jsonl` (10 seed_base × 30 trial = 300 行、noise_scale=1.5)
公式: ICC(2,1) one-way random、k=30, N=10。95% CI は Fisher Z 近似 (N=10 → SE=1/√7≈0.378)。
実行: `python proxy_icc_diagnose.py` (純 stdlib、scipy/numpy 不使用、副作用ゼロ)

| column | ICC | 95% CI | judge (≥0.3) |
|---|---:|---|:-:|
| proxy_clear_rate | 0.0044 | [-0.6270, 0.6323] | FAIL |
| proxy_damage_per_min | -0.0010 | [-0.6303, 0.6290] | FAIL |
| proxy_survival_time | -0.0112 | [-0.6364, 0.6228] | FAIL |
| proxy_input_density | -0.0191 | [-0.6410, 0.6180] | FAIL |

##### 解釈
- 4 列すべて ICC ≈ 0 (CI が ±0.63 まで広く確定的判定不能だが点推定は 0 近傍)
- 「seed_base 間の系統的差異がほぼゼロ」= seed_base を class とした場合、proxy 計測は class 内 trial-by-trial variance が支配。seed_base 選択が結果の系統差を生まない構造
- これは Pearson 計算の母集団設計に対し 2 通りの含意:
  - (i) **seed_base を独立 class 扱いしない**: 300 行を独立 observations として扱い、seed_base 軸では集約せず素のまま Pearson に投入する経路は妥当
  - (ii) **class 軸を切り替える**: バージョン (v001/v002/v003) や agent (素朴良手 / 別 agent) 等を class にし直すと ICC が変わる。次サイクル候補は `proxy_vs_judgment_labeled.csv` 上で v_label を class にした ICC 再計算
- Mustahsan 経験則閾値 (≥0.3) は GAIA / FRAMES 等の agent 評価データセットに対する下限値で、本ゲーム評価への直接適用は経験則の流用にすぎない。本サイクルは「閾値未達 = Pearson 計算を止める」より「seed_base 軸での集約は不要、class 設計を見直す材料」として記録優先

##### Phase 3 §6 完遂の定義 vs 実測の対応
- (1) `proxy_icc_diagnose.py` exit 0 完走 — **OK**
- (2) ICC(2,1) + 95% CI + 閾値判定 4 行 — **OK**
- (3) 出力フォーマット `[ICC] column=X icc=Y ci_low=Z ci_high=W judge=PASS|FAIL` — **OK**
- (4) 副作用ゼロ (jsonl/csv 配下に変更なし) — **OK** (`git status` で M なし、新規ファイルのみ追加)
- (5) 純 stdlib のみ (numpy も不使用) — **OK** (依存追加ゼロ)
- (6) 本表追記 — **OK** (本節)
- (7) game/ 配下 commit prefix `game:` で 1 commit ship — Phase 5 で日記とまとめて push 予定 (本サイクル Phase 4 では commit しない、Phase 4 指示書順守)

#### C277 Phase 4 v_label class 軸 ICC 再計算結果 (2026-06-01)

入力: `proxy_vs_judgment_labeled.csv` (10 seed_base × 3 v_label × 30 trial = 900 行)
公式: ICC(2,1) one-way random、v_label class で N=3, k=300。N≤3 のため Fisher Z CI は退化 (point=lo=hi)。seed_base class on CSV は N=10, k=90 (CSV は v_label 3 倍化のため jsonl 版 k=30 と異なる)。
実行: `python proxy_icc_diagnose.py --class-col v_label --input proxy_vs_judgment_labeled.csv` (`--class-col` / `--input` CLI 新規追加、純 stdlib 維持、副作用ゼロ)

##### v_label class (N=3, k=300)

| column | ICC | 95% CI | judge (≥0.3) |
|---|---:|---|:-:|
| proxy_clear_rate | -0.0033 | [-0.0033, -0.0033] | FAIL |
| proxy_damage_per_min | -0.0033 | [-0.0033, -0.0033] | FAIL |
| proxy_survival_time | -0.0033 | [-0.0033, -0.0033] | FAIL |
| proxy_input_density | -0.0033 | [-0.0033, -0.0033] | FAIL |

##### seed_base class on CSV (N=10, k=90) — 比較参照用

| column | ICC | 95% CI | judge (≥0.3) |
|---|---:|---|:-:|
| proxy_clear_rate | 0.0268 | [-0.6132, 0.6455] | FAIL |
| proxy_damage_per_min | 0.0214 | [-0.6165, 0.6424] | FAIL |
| proxy_survival_time | 0.0115 | [-0.6227, 0.6365] | FAIL |
| proxy_input_density | 0.0038 | [-0.6273, 0.6319] | FAIL |

##### §6-3 (a) 絶対軸 gate に対する判定

v_label class 軸での ICC ≈ -0.0033 は理論ノイズ床 -1/(k-1) = -1/299 にちょうど貼り付き = **v_label が proxy 値を一切区別していない**ことの数学的反映。原因は `build_proxy_csv.js` が同一 (seed_base, run_id) に対し v001/v002/v003 で同一 proxy 値を出力している (proxy 計算式に v_label が入っていない) ためで、between-class variance が構造的にゼロ。これは C275 解釈 (ii)「class 軸を v_label に切替えると ICC が変わる」仮説への **直接反証** = §6-3 (a) 絶対軸 gate は v_label class でも復活せず。

seed_base class on CSV (N=10, k=90) も全列 FAIL (点推定 0.004-0.027、CI が ±0.63 に拡散) = 集計軸を v_label / seed_base いずれに振っても ICC ≥ 0.3 達成路線は閉じている。Mustahsan 経験則 GAIA 下限は当方 proxy 4 列に対し 2 通りの class 軸で充足せず。

**判定**: §6-3 (a) 絶対軸 gate は本サイクル時点で **計算不能 (= ICC FAIL 確定)**。次サイクル以降は §6-3 (b) 相対軸路線 (Spearman ≥ 0.5 + top-K 順位整合率 60%) への転進判断材料が揃った。proxy validity 反証ライン §6-1 (Lost in Simulation) と本実測 ICC 反証結果が一致 → 路線変更が合理的。なお v_label が proxy に効いていない構造を変えるには `agent_difficulty_proxy.js` 自体に v_label 依存パラメータ (例: cast cooldown / dash duration の version 別チューニング) を入れる必要があり、これは前提 1 (マルチシード化) と並ぶ別系統の前提として将来の検討対象。

#### C279 Phase 4 §6-3 (b) 相対 Spearman 軸 実測結果 (2026-06-01)

C278 Phase 5 で §6-3 (a) 絶対軸 gate を seed_base/v_label 両 class 軸で確定 FAIL にした後、本サイクル C279 で **(b) 相対軸 gate を実測可能化**。`proxy_icc_diagnose.py` に `--metric spearman` を新規追加 (純 stdlib 維持、tie 平均ランク + Pearson on ranks、bootstrap percentile 95% CI N=1000)、`proxy_vs_judgment_labeled.csv` 900 行に対し行単位 Spearman ρ を計算。

入力: `proxy_vs_judgment_labeled.csv` (10 seed_base × 3 v_label × 30 trial = 900 行)
公式: Spearman ρ = Pearson(rank(x), rank(y))、tie 平均ランク
CI: bootstrap percentile 95% (N=1000, seed=42、(proxy, judgment) ペアを with-replacement リサンプリング)
閾値: ρ ≥ 0.5 (§6-3 (b) 相対軸 gate)
実行: `python proxy_icc_diagnose.py --metric spearman --input proxy_vs_judgment_labeled.csv --class-col v_label --vs-col {q_a,q_intro,q_success_fb,q_d,q_c,q_e}`

##### 4 proxy 列 × 6 judgment 列 = 24 セル集計

| judgment 列 | judgment 値分布 | proxy_clear_rate | proxy_damage_per_min | proxy_survival_time | proxy_input_density |
|---|---|---|---|---|---|
| q_a | 5 のみ (900/900) | ρ=0.0000 CI [0.000, 0.000] FAIL | ρ=0.0000 FAIL | ρ=0.0000 FAIL | ρ=0.0000 FAIL |
| q_intro | 4 (300) / 4.5 (600) | ρ=0.0000 CI [-0.071, 0.063] FAIL | ρ=0.0000 CI [-0.063, 0.067] FAIL | ρ=0.0000 CI [-0.064, 0.065] FAIL | ρ=0.0000 CI [-0.066, 0.070] FAIL |
| q_success_fb | 3 のみ (900/900) | ρ=0.0000 FAIL | ρ=0.0000 FAIL | ρ=0.0000 FAIL | ρ=0.0000 FAIL |
| q_d | 3.5 (300) / 4.5 (600) | ρ=0.0000 CI [-0.071, 0.063] FAIL | ρ=0.0000 CI [-0.063, 0.067] FAIL | ρ=0.0000 CI [-0.064, 0.065] FAIL | ρ=0.0000 CI [-0.066, 0.070] FAIL |
| q_c | "" (300) / 4.5 (600) | ρ=0.0000 FAIL | ρ=0.0000 FAIL | ρ=0.0000 FAIL | ρ=0.0000 FAIL |
| q_e | 5 のみ (900/900) | ρ=0.0000 FAIL | ρ=0.0000 FAIL | ρ=0.0000 FAIL | ρ=0.0000 FAIL |

##### §6-3 (b) 判定: 24 セル全 FAIL

24 セル中 24 セルで ρ = 0.0000、bootstrap CI 最大幅は ±0.07 (q_intro / q_d、判定値が v_label 軸で 2 水準動く 12 セルのみ)、残 12 セル (q_a/q_success_fb/q_e の分散ゼロ + q_c の v001 空セル skip 後 600 行全 4.5) は CI 退化。**閾値 ρ ≥ 0.5 を 1 セルも越えず、相対 Spearman 軸 (b) も本データ構造に対して PASS 不能**。

##### Pearson/Spearman 両軸 gate 計算可能性 × 判定 まとめ

| 軸 | 計算可能性 | 本サイクルまでの判定 |
|---|---|---|
| (a) 絶対 Pearson + ICC ≥ 0.3 前提 | ICC FAIL (C275 seed_base / C278 v_label 両確定) ⇒ Pearson 計算不能 | gate 解除不能 |
| (b) 相対 Spearman ≥ 0.5 + top-K 60% | 計算可能 (本 C279 Phase 4 実装) | 24 セル全 FAIL、gate 解除不能 |

##### 構造的理由

`build_proxy_csv.js` が同一 (seed_base, run_id) で v001/v002/v003 に同一 proxy 値を出力 (proxy 計算式に v_label が入らない) + judgment 列も per-run 分化なし (per-version の 1 セット固定) = **proxy の変動軸 (seed_base × run_id) と judgment の変動軸 (v_label のみ) が直交**、相関の期待値が構造的に 0。

##### Spearman 路線確定 = 残された解除路線

両軸 gate 解除不能を確定した上で、**現データ構造の改修なしには gate 解除路線は存在しない**ことが明示された。次サイクル以降の選択肢は 3 通り (詳細は `SPEARMAN_RESULT.md` の「構造的理由」節):

1. **proxy 側に v_label 依存パラメータ導入** (C277 PEARSON_BLOCKER 末尾既出): `agent_difficulty_proxy.js` cast cooldown / dash duration を version 別チューニング、(seed_base, run_id, v_label) ごとに proxy 再生成。実装コストは前提 1 (マルチシード化) と同等
2. **judgment 側を per-run 分化**: 30 trial × 3 version 単位で個別判定値を入れる。Log self_judgment フローの大幅拡張、Mir/Ash 巻き込み必要
3. **per-version 集計値での Spearman** (N=3 縮約): ρ の有意域が極端に狭く bootstrap N=1000 でも CI が within-class 変動を伝播しづらい、統計的説得力は低い

C277 PEARSON_BLOCKER 末尾の「proxy validity 反証ライン §6-1 (Lost in Simulation) と本実測 ICC 反証結果が一致 → 路線変更が合理的」結論を Spearman 軸も継承 = **proxy validity そのものへの反証ラインが Pearson/Spearman 両軸で一致**。fun_score proxy 代替案の構造的リスクが両 metric で顕在化。

##### retention 軸との統計装置共有 (C279 Phase 2 §1 角度 A 接続)

本 Spearman 実装の `spearman_rho` / `bootstrap_spearman_ci` は純 stdlib 関数 = `memory/sense_prediction_log.md` の予測 vs 実測ペアに対し**他ツールから import 使用**で流用可能。memory_redesign.md retention 軸の「observed_retention = 読み出し頻度 × 引用方向の自己回帰」推定でも、予測ランクと実測ランクの Spearman 評価器を新規実装ゼロで構築できる。**Spearman 路線確定 = ゲーム評価系統と記憶階層評価系統の統計装置一本化**。

##### Phase 4 完遂の対応

- (1) `--metric spearman` CLI 追加、純 stdlib 維持 — **OK** (numpy/scipy/pandas 不使用、`random` / `math` のみ追加)
- (2) tie 平均ランク + Pearson on ranks + bootstrap percentile 95% CI (N=1000, seed=42) 実装 — **OK**
- (3) 4 proxy 列 × `--vs-col` 6 種 = 24 セル exit 0 完走、規定フォーマット出力 — **OK** (詳細 `SPEARMAN_RESULT.md`)
- (4) §Spearman 路線確定 節追記 (本節) — **OK**
- (5) ICC mode 後方互換維持 — **OK** (C275 値 0.0044/-0.0010/-0.0112/-0.0191 + C277 v_label 値 -0.0033 全て完全一致確認)
- (6) `SPEARMAN_RESULT.md` 新設で 24 セル全件保存 + 構造的理由 + retention 軸接続記録 — **OK**
- (7) `game:` prefix commit で着地、push は git push 障害 (C279 Phase 2 §5 corrupt loose object 7 件) 解消後に次サイクル C280 で実行可 — Phase 4 末尾

##### Phase 4 完遂の対応
- (1) `--class-col` / `--input` CLI 追加、純 stdlib 維持 — **OK** (依存追加ゼロ、numpy/scipy/pandas 不使用)
- (2) v_label class で exit 0 完走、4 列 ICC + 95% CI + judge 規定フォーマット出力 — **OK**
- (3) v_label class ICC 結果表追記 — **OK** (本節 4 列 × 4 行)
- (4) §6-3 (a) 絶対軸判定 1 段落 + (b) 相対軸転進判断材料 — **OK** (本節)
- (5) 1 commit (`game:` prefix) で ship、副作用ゼロ — Phase 5 で日記とまとめて push
- (6) cycle_staging_log.md Phase 4 セクション着地報告 — Phase 4 末尾で実施
- (7) 回帰: 旧 `python proxy_icc_diagnose.py` (jsonl + seed_base デフォルト) は C275 初回値 (0.0044 / -0.0010 / -0.0112 / -0.0191) と完全一致 — **OK** (後方互換維持)

#### C285 Phase 4 本能側列追加 (proxy_instinct_response_density) 5 列 ICC 結果 (2026-06-02)

kaizen #137 真の段階2 着手 (C285 Phase 2-3 で「proxy 4 列が全部逆算側 (結果指標) = 本能側を一つも測れていない」と再診断、本 Phase 4 で本能側列追加実装)。

##### 着地物
- `build_instinct_multiseed.js` 新設: `instinct_probe.js` を 10 seed_base × 30 trial で driver 経由実行、`measurements_instinct_multiseed.jsonl` = 300 行 (各行 `probe_density` 列含) を生成
- `proxy_icc_diagnose.py` 5 列化: `PROXY_COLUMN_INSTINCT = "proxy_instinct_response_density"` 定数追加、`derive_proxy_columns` で probe_density キーがあれば本能側 5 列目として取り込み、`run_icc` は first row sample で 4 列 / 5 列を動的判定 (後方互換維持)

##### 5 列 ICC 結果 (instinct_probe.js naive_good 戦略、N=10 seed_base × k=30 trial)

実行: `python proxy_icc_diagnose.py --input measurements_instinct_multiseed.jsonl --class-col seed_base`

| column | ICC | 95% CI | judge (≥0.3) |
|---|---:|---|:-:|
| proxy_clear_rate | 0.0000 | [0.0000, 0.0000] | FAIL (構造的非計算 = 全 trial gameover、分散ゼロ) |
| proxy_damage_per_min | 0.9977 | [0.9898, 0.9995] | PASS |
| proxy_survival_time | 0.9527 | [0.8073, 0.9890] | PASS |
| proxy_input_density | 0.3075 | [-0.3995, 0.7851] | PASS (閾値ぎりぎり、CI 広い) |
| **proxy_instinct_response_density** | **-0.0155** | **[-0.6389, 0.6202]** | **FAIL** |

##### 観測解釈

- **逆算側 4 列のうち damage_per_min / survival_time は seed_base 軸で ICC ≈ 1.0**: 同 seed_base 内 30 trial は同様の死亡パターン = instinct_probe.js の naive_good 戦略下では seed_base が死因 (敵 wave 配置 + 弾発射タイミング) を強く支配。C275/C277 で agent_difficulty_proxy.js 由来データ (noise_scale=1.5) では ICC ≈ 0 だったのと対比的、agent 戦略 (noise の有無) が ICC の支配要因
- **clear_rate は分散ゼロ = ICC 構造的に未定義**: naive_good 戦略では 90 秒以内に必ず死亡、survived = 0 固定。FAIL 表記だが意味は「閾値未達」ではなく「分散ゼロ非計算」
- **input_density は ICC 0.31 = 閾値ぎりぎり、CI 広い**: 点推定は PASS、CI 下限 -0.40 = 確信なし
- **本能側列 proxy_instinct_response_density は seed_base 軸 ICC = -0.0155 = trial 間でランダムに振れ、seed_base では分離しない**

##### 構造的発見 (kaizen #137 真の段階2 PASS の意義)

- 「逆算側列は seed_base 軸で ICC PASS、本能側列は seed_base 軸で ICC FAIL」 = **本能側と逆算側は異なる分散構造を持つ**ことを 1 つの実測データで初めて分離観測
- これは Mir (#all-nao-u-lab 「本能 vs 逆算」atom) のフレームを、proxy 評価系統に物理的に持ち込んだ初の量化エビデンス
- 本能側応答密度を測るには、seed_base 軸ではなく **agent 戦略軸** (naive_good / camper / blind-sweeper) で class を組む必要があることが示唆 → instinct_grid_icc.py が既に持っている戦略軸 ICC との接続が次段階

##### 次段階の選択肢 (段階3 family 統合候補)

1. **戦略軸 ICC 評価レイヤー化**: `instinct_grid_icc.py` (既存) と `proxy_icc_diagnose.py` を統合し、seed_base 軸 + 戦略軸の 2 軸 ICC 比較を 1 コマンドで出す
2. **playable diff 評価 layer 化**: log_autonomous_game v004 以降のヘッドレス評価で「逆算側分散 (seed_base 軸) + 本能側分散 (戦略軸)」両方を 1 回で測る品質 gate 化
3. **multi_phase_cycle_log.py Pre-check 化**: kaizen #131-#134 hook family と同型で、agent 評価 quality gate として段階3 統合

##### kaizen #137 段階2 PASS 判定

(a) 5 列 ICC 計算可能化 (4 列 → 5 列、後方互換維持) ✅
(b) 本能側列の独立性確認 (seed_base 軸で分離しない = 戦略軸での測定が必要、を構造的に物理化) ✅
(c) フレーム導入効果の量化装置として動作 (Mir/Log_cdx 02:51 要請「本能立ち上がり後の効き目 1 例」に対する数値エビデンス) ✅
(d) 副作用なし (新規ファイル追加のみ、既存 measurements_multiseed.jsonl 等への変更なし) ✅

#### C285 Phase 4 完遂の対応
- (1) `build_instinct_multiseed.js` 新設で 300 行 jsonl 生成 (各行 probe_density 含) — **OK**
- (2) `proxy_icc_diagnose.py` 5 列化 (PROXY_COLUMN_INSTINCT 定数追加 + derive_proxy_columns 拡張 + run_icc 動的判定) — **OK**
- (3) 5 列 ICC dry-run exit 0、5 行規定フォーマット出力 — **OK**
- (4) 本表追記 (本節) — **OK**
- (5) kaizen_tracker.md #137 検証結果に C285 Phase 4 段階2 PASS 記録 — **OK**
- (6) commit prefix `game:`、push は Phase 5 で日記とまとめて実行 — Phase 4 末尾
- (7) 後方互換性: 旧 `python proxy_icc_diagnose.py` (jsonl + seed_base デフォルト、probe_density 列なし) は 4 列出力のまま動作 — **OK** (PROXY_COLUMN_INSTINCT は sample row に存在時のみ追加)

#### C320 Phase 3 — proxy 軸変更判定の N=3 条件明文化 (2026-06-10)

C315 Phase 3 で起票留保した残課題「N=3 条件明文化 (Log_cdx atom 5 由来、graze_log v13 fan3 density→fun_score proxy validity の Pearson/Spearman 部分通過 fail pattern 一般化)」を本サイクル §6-3 関連節として明文化する。

**判定条件 (草案 → 暫定採用)**:
- **発火**: 同一 class 軸 (seed_base / v_label / 戦略軸) で proxy 列追加が ICC ≥ 0.3 を **3 サイクル連続で外した** 場合、その軸での集約は構造的に不適切と確定し、別軸 (戦略軸 / 本能側列 / per-version 別 proxy 計算) への切替を発火させる
- **N=1-2**: 教師データとして `memory/sense_prediction_log.md` に蓄積、原則化禁止 (`feedback_rule_proliferation_canonical.md` 順守)
- **N=3**: 即原則化、proxy 軸切替実装を Phase 4 大作業として確定発火
- **「同型」の定義**: 「同一 class 軸 + 同一 proxy 列カテゴリ (逆算側 / 本能側) + ICC < 0.3 (CI 上限含む) 」の 3 条件すべて同時成立。CI 上限だけ閾値超えで点推定 0.3 未達は **同型半票** (0.5 件) として計上

**本ライン以降の適用**:
- C275 (seed_base × 逆算 4 列, 全 FAIL) = N=1 教師データ蓄積済
- C277 (v_label × 逆算 4 列, 全 FAIL) = N=2 教師データ蓄積済
- C285 (seed_base × 本能側 1 列 = proxy_instinct_response_density, FAIL) = **別カテゴリ (本能側)** のため N=1 (逆算側 N とは独立カウント)
- 逆算側 N=2 / 本能側 N=1。**逆算側はあと 1 サイクル同型観測で N=3 = proxy 軸切替実装の Phase 4 大作業発火**

**proxy 軸切替先の優先順位** (発火時の選択肢、C279 §Spearman 路線確定 節を継承):
1. agent_difficulty_proxy.js に v_label 依存パラメータ導入 (cast cooldown / dash duration の version 別チューニング)
2. judgment 側を per-run 分化 (Mir/Ash 巻き込み必要、コスト高)
3. per-version 集計値での Spearman (N=3 縮約、統計説得力低)
4. **戦略軸 ICC 評価 (kaizen #137 段階3 候補) を 1 軸目に昇格** (本能側列の class 軸として既に物理化済、新規実装ゼロで切替可能)

**memory_redesign 接続**: 本 N=3 条件は `feedback_rule_proliferation_canonical.md` 「N=3 即原則化、N=1-2 は教師データ蓄積」を proxy 評価軸へ射影した形 = 同一原則を game/* 評価レイヤーで物理化。retention 軸での Spearman 共有 (C279 §retention 軸との統計装置共有 節) と同様、game レーンと memory レーンの判定原則一本化の 2 例目。

## なぜ本サイクル C270 で着手しなかったか

- C265 で段階1 (1 フレーム) に 1 サイクル消費した実績、連続フレーム + 視覚判定で最低 2 サイクル必要
- 本サイクル単独で Pearson 計算まで到達するには時間予算超過
- 途中物 (素データだけ揃えて Pearson は出さない) は CLAUDE.md「絶対にやる #1 = ゲームを動かして出す — 積み上げはその副産物」の playable diff にならず最悪パターン
- 代わりに本ファイル documented note を残し、次サイクル C271 以降での着手前提を固定化 ([feedback_means_ends_reversal_check.md] §How to apply「揃えるための 1 手」適用)

## 関連ファイル
- `proxy_vs_judgment.csv` — 分散ゼロ素データ
- `agent_difficulty_proxy.js` — proxy 計測スクリプト (マルチシード化対象)
- `verify.js` — proxy CSV 生成パイプ
- `completion_report.md` — C251 着地報告 (proxy 4 指標 Pearson 相関第 1 回計算が宿題)
- `self_judgment.md` — Q-* 判定基準
- `../projects/log_autonomous_game.md` — Active project 本体

## C321 Phase 4 strategy 拡張結果 — verdict + kaizen #140 段階3 family 統合判定位置決め

**起票**: 2026-06-10 C321 Phase 4 (Log)
**親**: [multi_seed_correlation.md §9](multi_seed_correlation.md) (C321 Phase 4 節 N=5 → N=13 拡張結果)
**目的**: C320 Phase 4 §6.6「kaizen #140 段階3 判定は本 sweep 結果単独で確定させず C321+ で再評価」を実行、検証期限 2026-06-20 の判定位置を 1 段書面化。

### verdict (4 段判定)

| 軸 | 値 | 判定 |
|---|---|---|
| 形式 verdict (sweep JSON Pearson mean+std) | 0.9532 / 0.0319 | REDUNDANCY_CONFIRMED |
| `good` outlier 除外時 Pearson (N=12) | mean=0.8198, std=0.1668 | **HOLD** (std≥0.1) |
| Spearman 全体 (N=13) | mean=0.5463 | 中相関帯、強相関基準 ≥0.9 不充足 |
| Spearman no-good (N=12) | mean=0.3970 | 弱-中相関帯 |

**総合**: 形式単独 GO だが、outlier 耐性 + Spearman 二重基準で **HOLD** に着地。N=13 拡張で seed 軸変動 strategy 数は 1 → 4 (`blind-sweeper` + `random-rush` + `vertical-bounce` + `wave-rider`)、`wave-rider` (instinct 11.80, temporal 10.60) が `good` と他 12 strategy の中間ブリッジ点として加わったが、Pearson 線形回帰の slope 安定化は依然 `good`(22, 43) 1 点支配。

### kaizen #140 段階3 family 統合 — 本サイクル発火しない

- 形式単独基準では発火条件成立 (Pearson mean ≥ 0.9 && std < 0.1)
- しかし [multi_seed_correlation.md §9.7 ギャップ定量化](multi_seed_correlation.md): `good` 除外時 Pearson mean 14% 低下 + std 5.2 倍拡大 = 強相関は outlier 依存
- → **kaizen #140 段階3 「`instinct → temporal` 軸統合」発火は本サイクル保留継続**。検証期限 2026-06-20 まで残 10 日

### C322 以降の判定材料拡充候補

1. **第一候補: `good` 系列複数化** (推奨) — 現 grazer mock 1 種を 3-5 種類 (例: castLock-ish-A / grazer-fast / center-aware / lateral-evade / wave-aware) に拡張し N=15-17 strategy で再 sweep。`good` outlier 1 点支配 → outlier クラスタへの構造置換で Pearson 線形回帰の geometric 性質を変える
2. **第二候補: outlier 耐性 verdict 拡張** — 現 `verdict_thresholds` (Pearson mean+std 単独) に `P_no_outlier_mean` と `pearson_spearman_gap` を追加し 3 軸 AND 基準化
3. **退役候補: 単純 N seed 拡張** — 本サイクル N=10 が strategy 拡張に勝てないことが実証された (`wave-rider` の σ_sur=705F が示す通り、seed 軸変動 1 strategy が大きく動いても 13 strategy 内 Pearson 安定性は破れない)

### gate 未解除中の playable diff 1 行ルール (C276 追加) — 本サイクル順守確認

本 C321 Phase 4 改修は **仮説駆動**: `verify.js` への 8 strategy 追加 + `STRATEGIES`/`BAD_STRATEGIES` 拡張 = 「`good` outlier 支配下の Pearson 線形回帰が strategy 集合拡張で耐性化するか」の単一仮説検証用 diff。仮説欄に該当する明示 (`multi_seed_correlation.md §9.7` ギャップ定量化) が記録、Phase 4 着地節 (`projects/log_autonomous_game.md` C321 Phase 4 = 次サイクル更新) に判定材料蓄積。本ルール (C276) 順守済。
