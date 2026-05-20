# graze_log v05.4 — graze 機構削除 + focus shot 軸導入 (graze 非依存 core 軸プロトタイプ)

**status**: v05.3 (`game/graze_log/v05.3/`) から **graze 機構を完全撤廃** + **focus shot mechanic 導入**。2026-05-20 C213 Phase 4 で ship。

## 変更の核

Nao_u 5/20 09:35 ts=1779237349「Graze は一旦無視した方が良い、コア要素として扱ってはいけない変則的なマニアしか喜ばない要素」発言への **物理的応答** (Slack 文言応答ではなくコード変更)。shared-reads 3 source (Boghog 101 / Pixelblog #31 / Anatomy of a Shmup) でも core 節に graze が登場しないことを独立確認済み。

| 撤廃したもの | 追加したもの |
|---|---|
| graze ring 判定 (R_GRAZE) | focus shot mechanic (SHIFT or Z hold) |
| graze count / streak / DEF | focus 状態 + focusFrames 累積 |
| active def (Psyvariar 型) | (なし — SPACE は BOMB 専用に簡略化) |
| ebullet.grazed / grazedT | 全弾常時軌跡 (無条件描画、readability 軸) |
| onGraze() / triggerActiveDef() / spaceContext() | — |

## focus shot mechanic (SHIFT or Z hold)

| 効果 | 値 |
|---|---|
| 自機速度倍率 | **0.5x** (FOCUS_SPEED_MULT) |
| 弾発射 x-spread 倍率 | **0.4x** (FOCUS_SPREAD_MULT) — 弾収束 = 狙撃感 |
| gauge 加算 | **+0.15/frame** (FOCUS_GAUGE_PER_FRAME) — 約 23 秒で max |
| 自機色 | 青系 LV 色 → **白** (#ffffff) |
| 視覚補助 | 自機周りに半径 R_HIT のパルス白リング (hit box 認知 + focus 視覚化) |

→ **「速い wide shot vs 遅い focus shot の選択肢が報酬ループを作る」** (Boghog 101) を core 軸として導入。graze の「擦りリスク」ではなく **「速度を犠牲にして狙う選択」** が報酬の原動力。

## graze 機構 0 行確認

grep `graze` (case-insensitive) で残るのは:
- コメント (撤廃理由・rollback 手順の記録)
- localStorage key `grazelog_recent_seeds` / `grazelog_hi` (データ継続性目的、機構ではない)
- directory/title 名 `graze_log v05.4` (シリーズ名)

**機構コード行は 0 行**。R_GRAZE / GRAZE_GAUGE / GRAZE_SCORE / GRAZE_STREAK_TH / state.graze* / onGraze() / triggerActiveDef() / spaceContext() / ebullet.grazed / grazedT 全て撤廃済。

## なぜこの変更が「graze 非依存で core 軸が立つ」のか

| core 軸 | source | v05.4 物理化 |
|---|---|---|
| **focus shot** | Boghog 101 | SHIFT or Z hold + 速度/spread/gauge 三効果 |
| **readability** | Pixelblog #31 / Boghog 101 | 全弾常時軌跡 (フラグ撤廃しても無条件描画) + 弾 kind 別色 + 敵 type 別色 |
| **popcorn enemies** | Anatomy | small (1hp) と medium (3hp) の差別化 (継承) |
| **subtle correction** | Anatomy | hit 時 lv 降格 (大ミスのみ罰、継承) |
| **自機 identity** | Pixelblog | focus 時 白 + パルスリング |

5 軸すべてが graze に依存していない。graze がなくても core が成立することを物理化で確認。

## v05.3 → v05.4 の差分まとめ

- **削除**: 7 定数 / 4 state field / 3 関数 / ebullet 2 プロパティ / graze ring 描画 / active def 描画 / GRAZE/STREAK/DEF HUD / SPACE [D]EF 文脈
- **追加**: 3 定数 (FOCUS_*) / 2 state field (focus / focusFrames) / focus 速度倍率 / focus spread 倍率 / focus gauge 加算 / 自機色変化 / focus パルスリング / SHIFT or Z 入力ハンドリング / HUD FOCUS 表示 / gameOver FOCUS 行
- **維持**: 弾速 ±10% evolve (straight 限定) / 全弾常時軌跡 (graze から切り離して readability 軸へ) / 敵 type 別弾パターン (v05.3 追加) / spawnWave1..4 + rhyme / seed 再現性 / BOMB Lv 維持 / onHit 降格

## 戻し方 (削除可能性の保証)

`devlog.md` §5 に rollback 手順記載 (10 ステップ)。`v05.3/index.html` が無傷で残っているので、フォルダ単位の差し替えでも完全 rollback 可能。**型注釈 / 外部ファイル依存 / 永続化なし** で v05.4 単独削除可能。

## 判定方針

`feedback_headless_unfit_for_unfinished_eval.md` 順守。headless 数値は判定根拠にしない。
ブラウザ実プレイで以下を確認:

1. SHIFT or Z hold で自機が遅くなり、白色 + 白リングが表示される
2. focus 中の弾発射が中央寄りに収束する (3way が狭くなる)
3. focus 中 gauge が自然に貯まる (kill しなくても LV 上がる経路がある)
4. SHIFT 離せば即元の青色 LV 色に戻り、通常速度・通常 spread に戻る
5. SPACE は BOMB ready 時のみ反応、DEF は撤廃済
6. graze 関連 UI (GRAZE/STREAK/DEF 文字) が一切表示されない

## 接続先

- `game/graze_log/v05.3/` — 本実装が差分を取る base
- `game/graze_log/v05.4/devlog.md` — 設計判断の詳細 (focus パラメータ根拠 / graze 撤廃の理由 / rollback 手順 / self_judgment)
- `log/cycle_staging_log.md` C213 (本サイクル) Phase 2-3 — graze 非依存 core 軸への方針転換 + Phase 4 大作業宣言
- `projects/game_development.md` 2026-05-20 C213 セクション — graze 非依存 core 軸への方針転換記録
- `memory/external_notes_log.md` 2026-05-20 (C213) — Boghog 101 再読 / Pixelblog #31 / Anatomy of a Shmup 3 source 統合済
- Nao_u 2026-05-20 09:35 ts=1779237349 #game-rights — 本実装の直接的起源
- Mir 2026-05-20 10:04 観察マトリクス「graze は3軸全滅」 — v05.3 段階で既に検出済の構造的問題
