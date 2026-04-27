# ash_onebutton — reverse系列

作者: Ash (Win2)
ジャンル: ワンボタン回避アクション (crisp-game-libジャンル)
言語: HTML + JS（1ファイル完結）

## 核メカニクス
プレイヤーは画面下を左右に往復する小円。ワンボタンで**移動方向を反転**する。上から落下する障害物を避けて生存時間を稼ぐ。

## バージョン一覧

| version | 日付 | 要約 | Nao_u評価 |
|---|---|---|---|
| [v01](v01/) | 2026-04-22 | 初版。反転メカのみ。落下レート `s.t/FPS` でスケール。50行JS | **筋の良い土台**。緩急のリズム◯、意外と難しい。「単軸の避けるで単調、何を足すかが重要」 |
| [v02](v02/) | 2026-04-26 | 紙一重ボーナス可視化。反転時に近接落下物があれば金リング+CLOSEスコア加算。新メカ0/可視化のみ。70行JS + headless.py (L-03解消) | (未提示) |
| [v03](v03/) | 2026-04-27 | mulberry32 seeded PRNG 導入。URL `?seed=N` で再現可能、HUD に seed# 表示。新メカ0/計測基盤のみ。約100行JS (S-02解消) | (未提示) |

## 遊び方

各バージョンの `index.html` をブラウザで直接開く。

- スペース / クリック / タップ: 方向反転
- R: やり直し

## 設計原則

- `game/VERSIONING.md` 準拠
- 前版を壊さない（v01は常に遊べる状態）
- プレイフィードバック原文は各版の `raw_log.md` に保存
- 設計意図は `devlog.md`

## 次版の方針（v04、未着手）

v03 で **seeded PRNG 導入**（候補リストの2番目）を実装済。URL `?seed=N` 共有・HUD seed# 表示・mulberry32 (headless.py と同一実装) で再現可能性を獲得。

v04 候補:
- human replay JSON 取得経路（avoid_log v02 と同型）— ブラウザでのプレイを headless.py で再生・分析できる。v03 の seed があるので入力タイムスタンプ列のみで完全再現
- headless との座標一致確認 — `headless.py --dump-coords` で JSON 出力 → JS 側と diff、実装等価性の機械検証
- 判定関数 (D) 閾値の CLOSE/秒密度ベース修正 — v02 headless で close_call_seeker 誤検出
- v01 への close-call ロジック後付け → v01 と v02/v03 の同条件比較

決定は v04 着手時の devlog.md に記す。**Nao_u が v02/v03 を遊んだフィードバック原文（raw_log.md）を確認してから着手**。

## クロスレビュー素材

- `game/cross_review/20260420_log_synthesis_mir_x_log.md` の4ゲート契約を本系列でも適用（v01 devlog に回答記載済み）
