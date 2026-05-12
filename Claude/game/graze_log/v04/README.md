# graze_log v04 — α'' graze→弾軌道予測線 (知覚補助)

**status**: v03 からの**削除可能改良 1個刻み**。Nao_u 2026-05-12 18:10 #game-rights「君たちが一番良いと判断した形で進めて。動くものを見てみたい」を受けた Ash 判断による着手。

## 採択した1案 — α''

「擦った弾は、進行方向に薄い予測線を一定時間残す」

graze の意味を **score 稼ぎ → 視界の獲得 (mollifier 知覚補助)** に降格する。プレイヤーは「擦って得点する」ためではなく「次の弾の軌跡を見る」ために擦る。

Eschatos (2011, Qute) が現代 STG で取った姿勢——graze を意図的に薄くし、プレイヤーに「graze 何ポイント?」と疑問を持たせるレベルの体験設計——をコアの 1 機構で導入する。

## なぜ α'' か (α / β / γ 中の判断)

5/11 brainstorm.md / Log brainstorm_log.md / Log prior_art_30.md (32本完走) で α/β/γ の3案を出していた。

| 案 | 内容 | 守破離 | この判断で選ばなかった理由 |
|---|---|---|---|
| α | 弾幕回避コア + graze passive bonus | 大型 refactor (敵弾パターン総入れ替え) | 1個刻みを超える。守を踏み外す危険 |
| β | Spell Card 風 + score multiplier | 中規模 | Mir 補足④ △ (狙う動機残る、符号反転弱い) |
| γ | 地形 + 弾幕 二重制圧 | 大型 (新規地形要素) | 型の連続性を破る |
| **α''** | graze→弾軌道予測線のみ | **追加3定数+5行レベル** | **1機構の純粋追加、戻すのが容易、Mir 符号反転を直接強化** |

Log M-43 が prior_art_30.md で出した最良案セット「α + α'' + ο + Eschatos 参照」のうち、**最小で意味のある単体** = α''。α と ο は v05 以降の判断材料に残す。

## v03 → v04 の差分 (1機構のみ)

### 追加した1機能

各敵弾に `grazedT` を持たせる。`onGraze()` 発火時に `grazedT = GRAZE_TRAIL_FRAMES (=90)` を設定。`grazedT > 0` の間、弾の進行方向に長さ `GRAZE_TRAIL_LEN (=70)` の薄い軌跡線 (`rgba(255,216,112, 0.22*fade)`) を描画。`fade` は残時間比で線形減衰。

### 触っていない既存機構 (v03 と完全同一)

- 自機操作・移動速度・shotCount/shotCooldownF
- graze 半径・hit 半径
- BOMB の挙動・gauge 蓄積方法・閾値
- Psyvariar grazeStreak → active 防御 (v03 機構)
- 敵スポーン構成・敵弾速度・onHit 段階ダメージ
- 星空背景・particle・ring・popup
- seed 再現性

graze の score reward / gauge reward は**意図的に据え置く**。最小1機構の原則。仮に「graze score = 0」も同時に入れると、混合効果になり「予測線が効いたのか / score 抜きが効いたのか」を Nao_u プレイ後に切り分けられなくなる。

## 戻し方 (削除可能性の保証)

v04 → v03 に戻すには以下を消す:

1. 定数 2 個: `GRAZE_TRAIL_FRAMES` / `GRAZE_TRAIL_LEN`
2. ebullet 生成時の `grazedT:0` プロパティ
3. `update()` 内 `if(b.grazedT>0)b.grazedT--;` 1 行
4. `onGraze` 呼び出し直前の `b.grazedT=GRAZE_TRAIL_FRAMES;` 1 行
5. `draw()` ebullet ループ内 `if(b.grazedT>0){...}` ブロック (8 行)
6. タイトル文字列 `graze_log v04 (α'' ...)` の文言

合計 約 15 行。残りは v03 と同一バイト列。

## 判定方針

**headless 数値 (到達率/生存秒/成功率) は judgment / cross_review / Slack の根拠にしない**

根拠: feedback_headless_unfit_for_unfinished_eval.md t:5 (Nao_u 2026-05-09 05:01 #game-rights 三度目「やめて」)。完成済み Log ゲームでの校正実績が出るまでは headless は未校正装置として扱う。

Nao_u プレイ前の予測は v04 では新規作成しない (v03 predicted_play.md が α'' に相当する分の予測項目を含まないため、新規予測を起こすか v03 を流用するかは v05 着手時に決める)。**今サイクルの目的=動くものを出すこと**を優先する。

## 接続先

- game/graze_log/v03/index.html — 本実装の 1 機構を消した状態 = v03
- game/graze_log/v04/brainstorm.md — Ash brainstorm 本体 (α/β/γ 3案)
- game/graze_log/v04/brainstorm_log.md — Log M-38/M-43 完走
- game/graze_log/v04/prior_art_30.md — 32 事例 (Eschatos 強参照)
- memory/feedback_clone_strategy.md t:5 — 守の通過点での 1個刻み制約
- memory/feedback_headless_unfit_for_unfinished_eval.md t:5 — 判定根拠から headless を外す
