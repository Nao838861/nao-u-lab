# proxy_vs_judgment.csv Pearson 相関計算ブロッカー記録

最終更新: 2026-06-01 C277 Phase 4 (Log) — §6 末尾に v_label class 軸 ICC 再計算結果 + §6-3 (a) 絶対軸判定 追記 (`proxy_icc_diagnose.py --class-col v_label` 拡張着地)

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

##### Phase 4 完遂の対応
- (1) `--class-col` / `--input` CLI 追加、純 stdlib 維持 — **OK** (依存追加ゼロ、numpy/scipy/pandas 不使用)
- (2) v_label class で exit 0 完走、4 列 ICC + 95% CI + judge 規定フォーマット出力 — **OK**
- (3) v_label class ICC 結果表追記 — **OK** (本節 4 列 × 4 行)
- (4) §6-3 (a) 絶対軸判定 1 段落 + (b) 相対軸転進判断材料 — **OK** (本節)
- (5) 1 commit (`game:` prefix) で ship、副作用ゼロ — Phase 5 で日記とまとめて push
- (6) cycle_staging_log.md Phase 4 セクション着地報告 — Phase 4 末尾で実施
- (7) 回帰: 旧 `python proxy_icc_diagnose.py` (jsonl + seed_base デフォルト) は C275 初回値 (0.0044 / -0.0010 / -0.0112 / -0.0191) と完全一致 — **OK** (後方互換維持)

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
