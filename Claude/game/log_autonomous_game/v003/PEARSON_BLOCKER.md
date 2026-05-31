# proxy_vs_judgment.csv Pearson 相関計算ブロッカー記録

最終更新: 2026-05-31 C275 (Log) — 前提 4 = ICC 事前診断レイヤー追記

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

## 次サイクル以降の解除手順 (3 前提、各 1 commit 推奨)

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
