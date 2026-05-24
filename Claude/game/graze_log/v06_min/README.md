# graze_log v06_min — 機構縮減プロトタイプ (敵 type / DEF / evolve 撤去)

**status**: v05.3 (`game/graze_log/v05.3/`) を base に、v05.3/v05.1/v03 で積み上げた付加軸を 3 つ撤去した縮減方向プロトタイプ。2026-05-24 C235 Phase 4 で ship。

「軸を増やす方向」(v05.3 敵 type 3 分類, v06a 静的ストック, v06b 一時火力) の対極実験。v05.4 (graze 完全撤廃 + focus shot 追加) とも別系統で、**graze は残したまま「付加軸だけ削る」** スタンス。

## 削った機構リスト (v05.3 → v06_min, 3 撤去)

1. **敵 type 3 分類 (straight/spread/aimed) → straight 単一**
   - 撤去対象: `TYPE_RNG_STRAIGHT` / `TYPE_RNG_SPREAD` / `SPREAD_ANGLE` / `SPREAD_SPEED` / `AIMED_SPEED` 5 定数、`spawnEnemy()` 内 enemyType 割当、`update()` medium 発射部の 3 分岐、`draw()` 敵外殻色 type 別分岐 (オレンジ/マゼンタ/シアン)、弾色 kind 別分岐
   - 結果: 全 medium が真下直線 1 発、外殻オレンジ単色

2. **active def (Psyvariar 型 grazeStreak → SPACE D 経路)**
   - 撤去対象: `GRAZE_STREAK_TH` / `ACTIVE_DEF_FRAMES` / `ACTIVE_DEF_RADIUS` 3 定数、`state.grazeStreak` / `state.activeDefT` / `state.activeDefCount` 3 field、`triggerActiveDef()` 関数 (約 24 行)、`spaceContext()` 関数、SPACE 押下時の D 分岐、`onGraze()` の streak ++ / DEF READY popup、`draw()` プレイヤー周囲の cyan-green リング 2 種、`drawHUD()` の STREAK/DEF 行と SPACE 文脈分岐 (B/D/-) 表示、`drawOver()` の DEF カウント行
   - 結果: SPACE = BOMB 専用、grazeStreak 概念ごと消滅

3. **弾速 ±10% evolve (序盤 0.9 / 中盤 1.1)**
   - 撤去対象: `EVOLVE_SLOW` / `EVOLVE_FAST` / `EVOLVE_FIRED_TH` 3 定数、`enemy.firedCount` 初期値とインクリメント、medium 発射時の `sp = 2.4 * (firedCount > TH ? FAST : SLOW)` 計算
   - 結果: 全 medium 弾が固定速度 2.4

## なぜこれら 3 つを削るのか (撤去判断の根拠)

直接の発火源:

- **Nao_u 5/20 09:35 ts=1779237349 #game-rights**「変則的なマニアしか喜ばない要素」(graze 文脈の指摘だが、付加軸全般への射程を持つ)
- **Nao_u 5/21 05:50 #all-nao-u-lab broadcast**「発火段数の概念は考えない方が良さそう」「段数の議論は意味のない議論」「最後に見たものを過剰に大事なものとして扱いすぎ」
- **千葉集「ミステリゲームメカニクス進化史」(5/22 受信、shared_reads/20260522_chiba_mystery_mechanics_log.md)** 障壁分類 (1)能力障壁 → 「判定対象を絞る」処方

これら 3 ソースを「graze_log への直処方」として読み直すと:

- v05.3 敵 type 3 分類 = Nao_u 5/13「軸が 1 本」批判への応答で「軸を増やす」方向に打った直処方。Mir 5/20 10:04 観察「graze は3軸全滅」では「軸を増やしても全滅は変わらない」とも読める。**軸を減らす方向の対極実験が未実施**だった。
- v03 active def = SPACE 文脈分岐 (B/D/-) は典型的な「段数」構造。「gauge ready なら B、streak 5 連続なら D、それ以外なら -」を覚えて操作する能力障壁。Nao_u 5/21 直撃。
- v05.1 弾速 evolve = 「序盤 0.9 倍 / 中盤 1.1 倍」差分はプレイヤーから「あれ何か違う?」レベルで、Sparen Guide A2 を真面目に取り過ぎた精緻化。「変則的マニアしか喜ばない」典型。

千葉集「対象を絞る」処方の物理化として、3 つを一括撤去。「graze + BOMB + 軌跡 + spawnWave rhyme」だけ残せば minimal core が成立するかを体験で検証する。

## 触っていない既存機構 (v05.3 と完全同一)

- 自機操作・graze ring 判定 (R_GRAZE=22) / hit 半径 (R_HIT=8)
- BOMB Lv 維持 (v05.2 fix、`fireBomb()` 内 `state.gauge=G_LV3`)
- `onHit()` での Lv 降格 (lv3→lv2→0→gameOver)
- spawnWave1..4 + wave>=5 rhyme (70% 再使用 / 30% random)
- seed 再現性 (`?seed=N`) / SEED localStorage 保存
- 全弾常時軌跡 (grazedT クランプ、Mir 案、v05 で追加)
- スコア/ゲージ系・popup/ring エフェクト

## 戻し方 (削除可能性の保証)

v06_min → v05.3 に戻すには **フォルダ単位差し替え** が最も簡単 (`v05.3/index.html` 無傷)。コードレベルで戻す場合の 5 ステップ:

1. **定数 8 個復活**: `GRAZE_STREAK_TH=5` / `ACTIVE_DEF_FRAMES=60` / `ACTIVE_DEF_RADIUS=80` / `EVOLVE_SLOW=0.9` / `EVOLVE_FAST=1.1` / `EVOLVE_FIRED_TH=3` / `TYPE_RNG_STRAIGHT=0.60` / `TYPE_RNG_SPREAD=0.85` / `SPREAD_ANGLE=Math.PI/12` / `SPREAD_SPEED=2.0` / `AIMED_SPEED=2.8`
2. **state field 3 個 + spaceContext() 復活**: `grazeStreak:0` / `activeDefT:0` / `activeDefCount:0` を state に、`spaceContext()` 関数定義復活
3. **spawnEnemy() medium 分岐復活 + triggerActiveDef() 関数復活**: enemyType 割当 (60/25/15 rng)、initFireT type 別、`firedCount:0` プロパティ、`enemyType` プロパティを enemy オブジェクトに。triggerActiveDef() 関数全体 (約 24 行) 復活
4. **update() / onGraze() / SPACE 分岐復活**: medium 発射部を 3 type 分岐に戻す、`e.firedCount++` と evolve 計算復活、SPACE 分岐に `else if(state.grazeStreak>=GRAZE_STREAK_TH){triggerActiveDef();}` 復活、onGraze() で `state.grazeStreak++` と DEF READY popup 復活、update() に `if(state.activeDefT>0)state.activeDefT--;` 復活
5. **draw() / drawHUD() / drawTitle() / drawOver() 復活**: 敵 type 別色分岐 (outer/inner)、弾 kind 別色、active def リング + streak マーカー、HUD の STREAK/DEF 行 + SPACE 文脈表示 (B/D/-)、title の "v05.3 (敵 type 別弾パターン...)" 表記と DEF 操作説明、over の DEF カウント行

合計 **約 145 行追加** (v05.3=854 vs v06_min=709)。

## 判定方針

`feedback_headless_unfit_for_unfinished_eval.md` t:5 順守。headless 数値 (到達率/生存秒) は judgment / cross_review / Slack の根拠にしない。

体験判定 (ブラウザ実プレイ 30 秒以上 + コンソールエラー確認) は **Phase 4 完遂定義 (4)** だが、Claude 自身は実プレイ操作不可のため、本サイクル Phase 4 では:
- 静的整合性 (`new Function(scriptText)` parse OK) ✅
- 撤去対象シンボル grep ゼロ (コメント中の説明文以外) ✅
- 既存関数定義の網羅 (loop/update/draw/spawnWave/spawnEnemy/onGraze/onHit/fireBomb 全て存在) ✅
- ブラウザ起動 (`Start-Process` でデフォルトブラウザ展開) ✅

までを deliver。実プレイ N=3 体感 + 予測 vs 実反応の照合は **次セッションで Nao_u/Log オペレータ側体験 + devlog.md §5 追記** に委ねる。これは Phase 4 完遂条件の限界として明示する。

## 接続先

- `game/graze_log/v05.3/` — 本実装が差分を取る base (フォルダ単位 rollback 元)
- `game/graze_log/v06_min/devlog.md` — 撤去判断の根拠詳細 / 戻し方手順 / 体験確認待ち項目
- `game/graze_log/v06a/` / `game/graze_log/v06b/` — 「軸を増やす方向」の姉妹実装 (rescue ストック / 一時火力)
- `game/graze_log/v05.4/` — 別系統の縮減 (graze 完全撤廃 + focus shot 追加)
- `log/cycle_staging_log.md` C235 Phase 3「次フェーズの大作業」 — 本 Phase 4 の起源と完遂条件
- `memory/shared_reads/20260522_chiba_mystery_mechanics_log.md` — 千葉集 (1) 障壁分類「対象を絞る」処方の原典
- Nao_u 2026-05-20 09:35 ts=1779237349 #game-rights — 「変則的なマニアしか喜ばない要素」
- Nao_u 2026-05-21 05:50 #all-nao-u-lab — 「段数の議論は意味のない議論」
- Mir 2026-05-20 10:04 観察マトリクス「graze は3軸全滅」 — 軸を増やしても全滅は変わらない観察への対極実験対象
