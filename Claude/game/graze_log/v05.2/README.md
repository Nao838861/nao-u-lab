# graze_log v05.2 — BOMB Lv 維持修正 (gauge G_LV2 → G_LV3)

**status**: v05.1 (`game/graze_log/v05.1/`) からの **1行修正** + コメント。Nao_u 2026-05-18 05:29 ts=1779001401「BOMB Lv2 パワーダウン」指摘の最小処方として ship。

## 修正の核

`fireBomb()` 内 1行のみ:

```diff
- state.gauge=G_LV2;   // = 35 → Lv2 最下限まで降格 (BOMB が罰)
+ state.gauge=G_LV3;   // = 99 → Lv3 維持 (BOMB が獲得火力の維持技)
```

## なぜこの修正で「BOMB パワーダウン」体感が消えるか

| シナリオ | v05.1 (旧) | v05.2 (新) |
|---|---|---|
| Lv3 到達 → BOMB | gauge=35 (Lv2 へ降格) | gauge=99 (Lv3 維持) |
| Lv2 で BOMB | gauge=35 (現状維持) | gauge=99 (Lv3 へ昇格) |
| BOMB の意味 | 「使うと弱くなる」逆インセンティブ | 「火力を維持して敵を整理する技」 |

`onHit()` (被弾時 Lv3→Lv2 降格) は **触らない** — 被弾の罰として gauge を落とすのは設計意図、BOMB 発射の Lv 降格とは別軸。

## v05.1 → v05.2 の差分 (1 + コメント + タイトル文字列 = 3 箇所)

1. **fireBomb() 内** (L257 相当): `state.gauge=G_LV2;` → `state.gauge=G_LV3;`
2. **コメント追加** (L255-256 相当): 修正理由を 2 行で明記
3. **タイトル文字列** (`<title>` + drawTitle): 「v05.1 — 弾速 ±10% evolve」 → 「v05.2 — BOMB Lv 維持修正」

### 触っていない既存機構 (v05.1 と完全同一)

- 弾速 ±10% evolve (v05.1 由来)
- 全弾常時軌跡 (Mir 案、grazedT クランプ)
- 敵スポーン構成 (`spawnWave1..4` + wave>=5 rhyme 70%)
- 自機操作・graze/hit 半径・Psyvariar active def
- seed 再現性 / score/gauge 系
- `onHit()` での Lv 降格 (被弾の罰、設計意図維持)

## 戻し方 (削除可能性の保証)

`fireBomb()` の `state.gauge=G_LV3;` を `state.gauge=G_LV2;` に戻すと v05.1 と機能等価。
合計 **1 行**。タイトル文字列は表示のみで挙動非影響。

## 判定方針

`feedback_headless_unfit_for_unfinished_eval.md` t:5 順守。headless 数値は判定根拠にしない。
ブラウザ実プレイで「BOMB を撃つ → Lv3 維持 → 体感」が確認できるかを採用判定の根拠とする (Phase 4 ブラウザ判定枠)。

## 接続先

- `game/graze_log/v05.1/` — 本実装が差分を取る base
- `game/graze_log/v05.2/devlog.md` — 設計判断の詳細 (なぜ G_MAX でなく G_LV3 か等)
- `log/cycle_staging_log.md` C209 (本サイクル) Phase 2 §D / Phase 3 — 本実装の起源
- Nao_u 2026-05-18 05:29 ts=1779001401 (#game-rights) — 修正対象指摘
