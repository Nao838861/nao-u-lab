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

### 前提 1: マルチシード化
- `agent_difficulty_proxy.js` に SEED 引数追加
- 各 run で異なる初期 RNG state を注入
- 同一ゲームバージョン × N シード (例 N=10) で proxy_clear_rate / damage_per_min / survival_time / input_density に分散を作る

### 前提 2: 複数バージョン判定セット投入
- v001 / v002 / v003 の 3 バージョンに対する Log 自己判定セットを CSV に格納
- 既に C264 で 3 バージョン × 30 試行比較は実施済、判定値転記が CSV 未反映
- q_* 列に v001/v002/v003 ラベル追加してから転記

### 前提 3: 連続フレーム取得 → 視覚体感 Q-D/Q-成功FB 実機判定
- C265 Phase 4 で段階1 (1 フレーム取得) 成功済、連続フレーム化が次段階
- ヘッドレス連続フレーム自己再認識ができれば Q-D (難易度) / Q-成功FB (成功フィードバック) の人手判定固定値を実機観測値に置換可能

### 前提 4: 分散の事前診断レイヤー (C275 Phase 3 追記、Mustahsan 2512.06710 ICC 由来)
- Pearson 計算の前段で「観測分散がそもそも存在するか」を ICC (intraclass correlation) で診断する。proxy_vs_judgment.csv は σ²=0 のため Pearson 数学的未定義だが、ICC=0.0 として観測分散ゼロを構造化記録できる
- 前提 1 (マルチシード化) でシードを増やした後に proxy_clear_rate などが何 σ² まで上がるか、ICC ≥ 0.3 (Mustahsan 経験則 GAIA 下限) を超えるかを `tools/proxy_icc_diagnose.py` (kaizen #137 候補) で測定。閾値未達なら Pearson 計算しても意味なし = 前提 1 のシード数を増やす方向に戻る
- Sharma 2512.24145 paired seed evaluation は前提 1 のシード設計の補強 (正相関 seed のペアリングで variance reduction)、AIVAT 1612.06915 は n=300 物理時間限界到達時の variance reduction 選択肢として保留メモ
- 関連: `memory/external_notes_log.md` 2026-05-31 (Log C275 Phase 2) 節 / `#shared-reads` ts=1780216954/1780216958/1780216961

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
