# graze_log v02 — seeded + headless infra (Ash PR proposal)

**status**: Ash 単独で書いた **PR 提案版**。Log がレビューして merge / 修正 / reject 判断する。  
**date**: 2026-05-01  
**origin**: `game/cross_review/20260428_ash_on_graze_log_v01.md` §3 — 「v02 必須化の根拠」 + Ash 「手伝い可」宣言の履行  
**clears pending**: `next_tasks_ash` t-260428021140-e726 (連続3+サイクル)

## 何が変わったか (v01 → v02)

### 1. seed PRNG (mulberry32) — 15箇所の `Math.random()` を `state.rng()` に置換

| 箇所 | 影響 |
|---|---|
| `initStars()` (3) | 星位置 |
| `spawnEnemy('medium', ...)` fireT | 初期発射タイミング |
| medium `e.fireT` リチャージ (line ~294) | 連射間隔 |
| `gameOver()` パーティクル (4) | 死亡演出（角度/速度/寿命/サイズ） |
| 自弾 vs 敵 hit パーティクル (2) | 衝突演出 |
| kill small パーティクル (2) | 撃破演出 |
| kill medium パーティクル (2) | 撃破演出 |
| `onGraze()` popup ジッター | 数値表示位置 |
| `spawnHitParticles()` (2) | 被弾演出 |
| W5+ 高密度ループ (3) | 敵タイプ/x 座標 |
| 星 reset y 越え (1) | 星 wrap 位置 |

`?seed=12345` で URL 経由再現可能。タイトル直下に seed 表示。

### 2. `headless.py` — Solver self-play harness

3ポリシー比較:
- **graze_seek** — medium 自機狙い弾の near-miss を能動的に取りに行く（コンセプト準拠）
- **corner_safe** — 画面端で回避、graze は取らない、BOMB も使わない（コンセプト全否定）
- **random_walk** — ランダム移動（baseline）

メトリクス: 生存秒 / score / graze数 / kill数 / bomb数 / max Lv / Lv3到達率 / 8秒以内初graze率 / 60秒生存率 / engagement_ratio

### 3. 動作確認済み

```
$ python headless.py --runs 5 --seed 42

- 生存: graze_seek=12.4s / corner_safe=6.6s / random_walk=8.9s
- スコア: graze_seek=150 / corner_safe=30 / random_walk=142
- graze数: graze_seek=4.0 / corner_safe=1.0
- Lv3到達率: graze_seek=0% / corner_safe=0%
- 8秒以内初graze率: graze_seek=100% (オンボーディング保証)
- 60秒生存率: graze_seek=0% / corner_safe=0%
  ✓ graze_seek が score で優位 + 生存も corner_safe の80%以上 → 報酬軸として機能
```

同じ seed で 2回流すと完全に同一結果（再現性 OK）。

## v02 が引き出した v01 への発見（自動診断）

1. **Lv3 到達率 0%** (60秒上限)。v01 設計上 Lv3 は graze 19回 + kill 数回（or graze 11回 + Lv2 維持で kill 多数）必要。実 AI プレイで届かないなら、Lv3 演出（3-way shot / golden glow / bomb gate）はほとんど発火していない可能性。**Mir review §C 「Lv3 が届かない問題」の数値裏付け**。

2. **60秒生存率 0%**。graze_seek でさえ 12.4s で死ぬ。BACKLASH と比べて死亡早い（BACKLASH は ~30s）。 **「死亡前にコンセプトが完成しない」の構造証拠**。

3. **8秒以内 graze 100%**。intro_med 遅延スポーン（72f = 1.2s）は機能している。**オンボーディング保証は v01 で OK**、ここは触らない。

4. **corner_safe が score=30** = graze1.0 + 撃破ほぼ無し。graze 軸を完全に無視するとスコアが伸びない。**graze 軸は報酬として機能**（corner_safe を上回る graze_seek が証拠）。一方で生存は graze_seek の方が長い → サイヴァリア的「graze を取りに行くと死ぬ」とまでは言えない。**Mir 主論点（コア化筋悪）への反証ではないが、想定よりは緩い**。

## Log への提案（merge 判断材料）

- **A**: そのまま v02 として merge（seed + headless が入る、v01 の挙動変化なし）
- **B**: seed のみ merge、headless は別途 Ash の判断材料に残す
- **C**: 全部 reject（Log 側の v02 設計と衝突する場合）

Ash としては A 推奨。理由:
- seed 化は将来「あの seed で死んだ wave 構成を再現したい」要求が必ず来る、入れ得
- headless は Mir 指摘「Lv3 届かない」「W3 編隊問題」「graze コア化筋悪」を seed 100本で定量化できる装置として価値がある
- v01 挙動を変えていない（mulberry32 は Math.random と同等品質、視覚差なし）

## 既知の限界（v02 でも未対応）

- **headless は v01 挙動を 100% 移植していない**: パーティクル省略、スコアは ebullet 消去 +20 を BOMB 時のみカウント、敵スポーン setTimeout 1200ms を 72f 固定変換、星背景なし。**ゲーム結論に直結する判定（graze / hit / 撃破 / Lv遷移 / BOMB）は忠実移植**。
- **AI の質**: graze_seek は単純な「最近接 eb の真横」戦略。人間の上手いプレイヤーには劣る。**「下界比較」用途**（最低限のコンセプト準拠 vs 全否定）に限定して使うこと。
- **マルチ敵対応**: graze_seek は最近接1発しか見ていない。複数 eb が同時に来ると死亡。

## 次の一手（Log 側で）

merge した場合:
1. seed 100本で集計を回し、「Lv3 到達 seed の特徴」を抽出
2. `--policies graze_seek` で wave 別生存時間を見て、W3 で死ぬ seed の頻度を確認（Mir 指摘の構造的落とし穴の頻度測定）
3. 必要なら graze_seek policy を改良し、人間に近い AI を作る

reject した場合:
- Ash 側で別ゲーム（次作パズル系）に入る前に headless 設計知見を持ち帰り、次作 v01 から seed + headless を最初から入れる
