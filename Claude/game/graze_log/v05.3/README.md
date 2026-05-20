# graze_log v05.3 — 敵 type 別弾パターン差別化 (案 A: straight/spread/aimed)

**status**: v05.2 (`game/graze_log/v05.2/`) からの **medium 敵 type 3 分類** + 弾パターン分岐 + 視覚色分け。2026-05-20 C209 Phase 4 で ship。

## 変更の核

medium 敵 1 種類 → 3 種類:

| enemyType | 比率 | 外殻色 | 弾挙動 | 速度 | クールダウン |
|---|---|---|---|---|---|
| **straight** | 60% | オレンジ | **真下直線 1 発** + v05.1 evolve | 2.4×evolve | 70-110f |
| **spread** | 25% | マゼンタ | **3way (中央+±15度)** | 2.0 固定 | 100-150f |
| **aimed** | 15% | シアン | **自機方向追尾 1 発** | 2.8 固定 | 50-80f |

外殻色 → 弾パターン予告で **「敵を見る軸」** が立つ (Nao_u 5/13「軸が 1 本」批判への直処方)。

## なぜこの変更で「軸が増える」か

v05.2 までは全 medium が「自機狙い 1 発 evolve」一択 = player は **敵の位置だけ** 把握すれば良かった (どの敵から撃たれても自機方向に飛んでくる)。v05.3 で 3 type に分岐、外殻色で予告すれば player は **「敵の見た目を読む → 次にどの弾が来るか予想する」** プロセスを要求される。

| 評価軸 | v05.2 | v05.3 |
|---|---|---|
| 弾を見る軸 | ○ | ○ (継承) |
| 敵を見る軸 | ✗ | **○** |
| 軸の本数 | 1 | **2** |
| 観察マトリクス (構成, 応用) | ✗ | **○** (spread+aimed 同 wave 内複合) |
| 観察マトリクス (視覚, 覚える) | ✗ | **○** (3色で予告) |

## v05.2 → v05.3 の差分

- **新規定数**: `TYPE_RNG_STRAIGHT` / `TYPE_RNG_SPREAD` / `SPREAD_ANGLE` / `SPREAD_SPEED` / `AIMED_SPEED` 5 個
- **`spawnEnemy()`**: medium 生成時に `enemyType` を rng (60/25/15) で割り当て、初期 `fireT` も type 別
- **`update()` 内 medium 発射部**: enemyType 分岐で 3 種類の弾発射
- **`draw()` 内 enemy/ebullet**: type 別に外殻色/弾色を分岐 (graze 中/後は共通色維持)
- **`<title>` / `drawTitle()`**: バージョン文字列を v05.3 へ

### 触っていない既存機構 (v05.2 と完全同一)

- 弾速 ±10% evolve 機構 (適用範囲だけ straight 限定に絞った、計算式は同一)
- 全弾常時軌跡 (Mir 案、grazedT クランプ)
- 敵スポーン構成 (`spawnWave1..4` + wave>=5 rhyme 70%) — type 割り当ては spawnEnemy 内で完結
- 自機操作・graze/hit 半径・Psyvariar active def
- seed 再現性 / score/gauge 系
- BOMB Lv 維持 (v05.2 由来、`fireBomb()` 内 `state.gauge=G_LV3`)
- `onHit()` での Lv 降格

## 戻し方 (削除可能性の保証)

`devlog.md` §5 に手順記載 (6 ステップ)。`v05.2/index.html` が無傷で残っているので、フォルダ単位の差し替えでも rollback 可能。**型注釈 / 外部ファイル依存 / 永続化なし** で v05.3 単独削除可能。

## 判定方針

`feedback_headless_unfit_for_unfinished_eval.md` t:5 順守。headless 数値は判定根拠にしない。
ブラウザ実プレイで以下を確認 (Phase 4 ブラウザ判定枠):

1. 30 秒以内に 3 type の medium が全て出現する (rng 60/25/15 が正しく動いている)
2. 各 type の弾パターンが見分けがつく (色 + 弾挙動)
3. spread の 3way 弾が「左右どちらに逃げるか」判断を要求する
4. aimed が低頻度で出るので「自機狙い弾は予想すべきイベント」体感が出る

## 接続先

- `game/graze_log/v05.2/` — 本実装が差分を取る base
- `game/graze_log/v05.3/devlog.md` — 設計判断の詳細 (rng 比率、cooldown 設定、evolve 適用範囲の根拠)
- `log/cycle_staging_log.md` C209 (本サイクル) Phase 2 §D / Phase 3 / Phase 4 — 本実装の起源
- `projects/game_development.md` 2026-05-20 C209 セクション — v05.2 (BOMB fix) / v05.3 (敵 type 別) の名前空間整理
- Nao_u 2026-05-13 #game-rights「軸が 1 本」批判 / 2026-05-20 09:37 broadcast「今後に反映」 — 本実装の起源指摘
- Ash 2026-05-19 13:51 原典 β「敵別 schema 学習軸」 — 案 A の原典
- Mir 2026-05-20 10:04 観察マトリクス「graze は3軸全滅」 — 直処方対象観察
