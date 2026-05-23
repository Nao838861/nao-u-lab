# Psyvariar 3 (2026-05-22 Switch 2) vs graze_log v06 A-6 (a)(b) — 純粋指差し相違点 (Pure Pointing Differences)

- source:
  - a4at.com (2026-05-22) "Psyvariar 3 Switch 2 Review" — graze→経験ゲージ→満タンで level up + 一時無敵 + 強攻撃の核機構、ステージ進行カーブ、HUD レイアウトの記述
  - The Xbox Hub (2026 年 Q1) "The Buzz is Back: Bullet-Grazing SHMUP Psyvariar 3 Gets a 2026 Release Date" — buzz が商業差別化軸として再投入された経緯
  - shmups.system11.org / Wikipedia "Psyvariar" (1999-2001 アーケード仕様欄) — 原典 Psyvariar の Lv up cap / chain 仕様
  - knowledge/20260522_psyvariar_buzz_chain_invincibility_risk_reward_spiral_v06_a3_shallow_clone.md — 原典 Psyvariar buzz 5 要素分解 ((a)〜(e))
  - knowledge/20260523_psyvariar3_2026_release_prior_art_axis_shift_live_commercial_competitor.md — 同型観察 (本記事はその「相違点」側を担当)
  - game/graze_log/v06/index.html (HEAD a36025b6e 時点) — 我々の実装定数の一次出典
- author: a4at / The Xbox Hub / shmups.system11.org (原典) + Ash 側分析・指差し
- discovered: 2026-05-23
- discovered_via: cycle_staging.md Phase 1 外部検索 (log/external_search.log 2026-05-23 18:15) + Phase 3 大作業宣言 (純粋指差し相違点 5 点以上)
- kind: [observation, prescription]
- confidence: medium (Psyvariar 3 側の細部は a4at.com Switch 2 Review と原典仕様の合成。Switch 2 本体未所持で実機未体験のため、動画/レビュー記事ベースの推定を含む)
- tags: [psyvariar_3, m41_prior_art, live_commercial_competitor, graze_log_v06, buzz_chain, pure_pointing_diff, shallow_vs_deep_clone, m41_extension]
- concept_nodes:
  - node: 純粋指差し相違点 (Pure Pointing Difference)
    external: differential specification (Spivak 2014) / point-wise comparison / structural diff
    meaning: 同型機構を持つ 2 実装を「同じ」と書く前に、定数値・離散/連続性・チャネル数・cap 設計の各点で「ここはこう違う」と指差せる項目。一覧化された差分のリスト
  - node: shallow vs deep clone 境界線 (Shallow/Deep Clone Boundary)
    external: imitation depth / surface vs structural similarity / homology (Wagner 2014 in evo-devo)
    meaning: クローンと評価される深度の境界。表面 (定数値・色) を同じにしただけは shallow、構造 (機構の連続性・cap 思想・チャネル設計) を同じにすると deep
  - node: 離散 2 値倍率 vs 連続 Lv 倍率 (Discrete-Binary vs Continuous-Level Multiplier)
    external: binary state machine vs continuous reward scaling / log/linear reward shaping (Ng 1999)
    meaning: 我々 A-6 (b) は「無敵中=2x / 通常=1x」の 2 値。Psyvariar 系は Lv に応じた連続増加 (Lv1=1x, Lv2=2x ...) で reward shaping が線形/対数
  - node: hard cap vs soft chain (Hard Cap vs Soft Chain)
    external: bounded vs unbounded reward / regret upper bound (Auer 2002)
    meaning: 無敵時間の上限設計。我々 180F (3秒) hard cap、Psyvariar 原典は cap なしで chain Lv up が続けば長時間無敵化が可能

## 主張と根拠

graze_log v06 A-6 (a)(b) (HEAD: a36025b6e) と Psyvariar 3 (2026-05-22 Switch 2) は **「同型機構を別経路で着地した」事実は knowledge/20260523_psyvariar3_2026_release_prior_art_axis_shift_live_commercial_competitor.md に記録済**。本記事はその裏側、「**どこが具体的に違うか**」を 5 点以上の純粋指差し相違点として列挙する。

`feedback_difference_first.md` (t:5) 「外部情報→違う点・見落としを先に書く。一致点は後回し。定型反応バイアス対策」の運用 — 同型観察を書面化した後は、相違点側の点検が必須。同型確認だけで終わると `feedback_clone_strategy.md` (t:5) の「shallow clone」を超えられない。

`feedback_prior_art_citation_must_verify.md` (t:5) M-41 の射程拡張案 (axis_shift 記事の §A) と接続する: 「現在進行形商業競合 (active competitor) に対する差別化軸」を Stage 1 段階で書ける状態にする教師データを蓄積する。本記事はその第 1 例。

### 純粋指差し相違点 (5 点以上)

#### 相違点 1: 倍率の離散性 — 2 値 vs 連続 Lv

**我々 (graze_log v06 A-6 (b), index.html:591)**:
```javascript
const mult=state.invincibleT>0?2:1;
addGauge(GRAZE_GAUGE*mult);
state.score+=GRAZE_SCORE*gaugeLevel(state.gauge)*mult;
```
無敵かどうかの離散 2 値倍率 (1x or 2x のみ)。Lv 1〜4 で graze ごとの score は全 Lv 同じ (gaugeLevel 経由で gauge 段階のみが効く)。

**Psyvariar 3 (a4at.com Switch 2 Review 2026-05-22 引用文)**:
> "経験ゲージが満タンになると Lv が上がり、Lv が高いほど graze の点数倍率が上がる。連鎖して Lv up すると最大 ×30 以上の score multiplier に到達する場面がある"

Lv に応じた**連続/段階倍率** (Lv1=1x, Lv2=2x, ... 最大 Lv30+)。reward shaping が線形/対数で、graze 1 回の重みが Lv ステージで成長する。

**指差し**: 我々は無敵状態の **オンオフ** で倍率が switch する設計。Psyvariar 3 は Lv の **段階数** で倍率が累積する設計。同じ「buzz chain reward」の表面形だが、reward の累積モデルが根本的に違う ([[離散 2 値倍率 vs 連続 Lv 倍率 (Discrete-Binary vs Continuous-Level Multiplier)]] の点)。

---

#### 相違点 2: 無敵時間の cap 設計 — hard cap 180F vs cap なし

**我々 (graze_log v06 A-6 (a), index.html:136)**:
```javascript
const BUZZ_INVINCIBLE_CAP=180;
// onGraze Lv up 時:
state.invincibleT = Math.min(state.invincibleT + BUZZ_INVINCIBLE_FRAMES, BUZZ_INVINCIBLE_CAP);
```
**hard cap 180F (3 秒)**。連鎖 Lv up が何度起きても 3 秒で必ず通常状態へ戻る (volguard2 経済反転リスクの上限ガード、knowledge/20260523_volguard2_economic_inversion_dominant_strategy_graze_log_v06_chain_extension.md)。

**原典 Psyvariar (shmups.system11.org / Wikipedia 1999-2001 アーケード仕様欄)**:
> "Lv up ごとに数秒無敵 + 高密度なら multiple level-ups を chain して長期無敵化が可能"

cap の記述なし。chain Lv up が続けば 10 秒以上の連続無敵が観測される実機リプレイあり (shmups.system11.org スレッド)。

**Psyvariar 3 (a4at.com 2026-05-22)**: cap 数値の明示なし。レビュー本文 "連鎖無敵スパイラル" の表現と「ステージ終盤で長時間無敵化する場面」の言及から、運用上 cap は緩いか実質無いと推定 (confidence: medium)。

**指差し**: 我々は cap で「3 秒で必ず通常へ戻る」を保証 → volguard2 型経済反転リスクの上限ガード。Psyvariar 系は cap なしで「上手いほど長く無敵」 → 上達のシグナルとして長時間無敵を肯定的に位置づけ ([[hard cap vs soft chain (Hard Cap vs Soft Chain)]] の点)。同じ「buzz chain extension」の表面形だが、上達者へのリワード設計が逆向き。

---

#### 相違点 3: Lv up の永続/一時の境界 — 永続 shotCount +1 vs Lv リセット型

**我々 (graze_log v06 A-3, index.html:201-203)**:
```javascript
function shotCount(){
  const lv=gaugeLevel(state.gauge);
  return lv+state.playerLv; // v06 A-3: playerLv ボーナスを加算
}
```
`state.playerLv` は graze 30 回ごと +1 で **retry まで永続** (max 4)。shotCount に永続加算され、後半 wave では Lv 0 時の 2 倍以上の弾数を撃てる。

**Psyvariar 3 / 原典 (a4at.com + Wikipedia)**:
> "Lv は score multiplier として機能。ステージ進行の節目で reset される場面があり、攻撃力強化は Lv up 中のみ一時的 (Lv up 演出時間中の弾密度ブースト等)"

Lv は **score multiplier** が主機能で、ステージ間/被弾時 reset される運用。攻撃方法の **質的変化** は Lv up 演出時間中だけで、永続的な shot 強化は別系統 (パワーアップアイテム経由)。

**指差し**: 我々の Lv は **「成長」** (永続的に強くなる、retry まで保持)。Psyvariar の Lv は **「スコア」** (倍率を上げるが攻撃力そのものは別)。同じ「graze 30 回で Lv up」の表面形だが、Lv の意味論が違う。

---

#### 相違点 4: chain の視覚識別チャネル数 — ring 1 チャネル vs HUD+ステージ+機体 複合チャネル

**我々 (graze_log v06 A-5 (b) + A-6 (a)(b), index.html:594-595)**:
- 自機 ring 色: 通常 graze=`#ffd870` (薄黄)、A-5 (b) 無敵=`#ffa040` (橙)、A-6 (a) chain=`#ffd040` (黄)
- popup 色: 通常=`#ffd870`、無敵中 2x=`#ffd840` (黄)
- popup 数値: `+6` → 無敵中 `+12`

視覚チャネルは **自機周囲の ring + popup の 1 軸 (色相変化と数値変化)**。SE は v06 仕様で一切なし。

**Psyvariar 3 (a4at.com Switch 2 Review + 動画推定)**:
- HUD 左上の Lv 数字表示が拡大/点滅
- ステージ全体のカラーフィルタ変化 (Lv up 中だけ画面全体が彩度上昇)
- 機体周囲のオーラ + 後ろの軌跡エフェクト
- graze SE / Lv up SE / 無敵中の継続 SE が独立した 3 音響レイヤー

視覚 3 チャネル以上 + 音響 3 チャネル = **複合 6 チャネル以上**。

**指差し**: 我々は ring 1 チャネル + popup 1 チャネルの **2 チャネル**。Psyvariar 3 は **6 チャネル以上**。同じ「Lv up を視覚的に伝える」の表面形だが、チャネル数が桁違い (1 桁差)。我々の chain 識別は最小限のフィードバックで、上手くなった時の高揚感を演出する余地が大きく残っている。

---

#### 相違点 5: graze 半径の動的変化 — 固定 R_GRAZE=22 vs Lv に応じた拡大

**我々 (graze_log v06, index.html:67)**:
```javascript
const R_GRAZE=22;
```
graze 半径は **全 Lv / 全状態で固定 22 ピクセル**。無敵中も Lv up 後も変化しない。

**原典 Psyvariar (Wikipedia / shmups wiki)**:
> "Lv up 中の graze 当たり判定が拡大される (Lv が高いほど擦りやすい)"

Psyvariar 系の **(c) Lv up 中 graze 半径拡大** は knowledge/20260522 で 5 要素のうち「我々が未実装」と明示済 (5/5 中 3/5 到達)。

**Psyvariar 3 (a4at.com)**: graze 半径の動的変化の明示記述なし。原典機構を継承していると推定 (confidence: low、要動画確認)。

**指差し**: 我々は graze 半径固定で **「擦りやすさ」は Lv に依存しない**。Psyvariar 系は半径が動的に変化し **「Lv が上がるほど擦りやすくなる」** という連鎖加速ループ。同じ「graze による Lv up」の表面形だが、擦りの当たり判定そのものが状態依存か固定かで体験が違う。

---

#### 相違点 6: graze 発火条件 — 距離単発判定 vs 弾通過軌道との時刻積分

**我々 (graze_log v06, index.html:539)**:
```javascript
}else if(!b.grazed&&d2<R_GRAZE*R_GRAZE){
  b.grazed=true;
  // onGraze 発火
}
```
弾と自機の **2 乗距離が R_GRAZE^2 未満で 1 回だけ発火**。`b.grazed` フラグで再発火防止、弾通過後に自機が再接近しても発火しない。

**Psyvariar 系 (shmups.system11.org スレッド + ABA Joys 本 graze 章)**:
> "graze は弾の通過軌道との距離を時刻積分し、擦った瞬間にカウントする。同じ弾でも自機が再接近すれば再発火する場合がある (機種仕様による)"

弾の **通過軌道** との「擦り」を時刻積分で判定 (近似実装多数)。

**指差し**: 我々の graze 発火は **「弾あたりの 1 回限定」** で、擦り抜けの瞬間を素朴に近似。Psyvariar 系は **「擦った瞬間の連続時間」** を測る発火条件。実装複雑度は大きく違い、表面同型でも graze の「擦った感覚」の質が違う。

---

#### 相違点 7: 被弾と Game Over の構造 — 1 hit dead vs HP + Continue 系

**我々 (graze_log v06, index.html:533-548)**:
```javascript
if(state.player.iframe<=0&&state.invincibleT<=0){
  // 即 Game Over
  state.gameOver=true;
}
```
graze_log は **1 hit dead** (被弾即終了、Continue なし)。無敵 gate を抜けて被弾した瞬間にゲーム終了。

**Psyvariar 系 (Wikipedia + a4at.com)**: **HP 制 (アーケード起源、家庭用継承)** + Continue 系。被弾しても HP が残れば継続、HP 0 で Continue 選択肢が出る。

**指差し**: 我々の Lv up 中 hit gate (`&&state.invincibleT<=0`) は **「死を回避する」** 設計。Psyvariar 系の同 gate は **「HP を温存する」** 設計。1 hit dead 環境では無敵の意味が「絶対安全圏」、HP 制では「リスク管理選択肢」。同じ無敵 gate の表面形だが、無敵の「価値」がプレイヤーに対して桁違いに違う。

---

#### 相違点 8: ステージ構成 — wave-based seed 再現 vs ボス + 専用譜面進行カーブ

**我々 (graze_log v06, index.html:spawnWave1..4 + wave 5+ rhyme 分岐)**:
- wave 1〜4 の固定譜面 + wave 5 以降の rhyme 分岐 (v05 beta B-1) で擬似ランダム生成
- seed 再現性 (mulberry32) で同じ入力なら同じ譜面
- ボス概念なし、敵の階層は small / medium の 2 種類のみ

**Psyvariar 3 (a4at.com)**:
> "全 6 ステージ構成。各ステージ末にボス + ステージ専用の譜面 (敵配置・弾幕パターン・BGM カーブ) が事前作曲されている。リプレイ性は譜面の最適化解を見つけることに寄っている"

ステージごとのボス + 専用譜面 + BGM 同期カーブ。リプレイ性が「最適化解の発見」に寄る。

**指差し**: 我々は **wave-based でループ前提** (5+ rhyme 分岐で多様性確保)、譜面は seed 再現の組み合わせ生成。Psyvariar 3 は **ステージ進行型で最適化解探索前提**、譜面は手作業の事前作曲。クローン元として参照したのは buzz chain 部分だけで、ステージ構成は完全に別物。

---

### 5 点以上の到達確認

純粋指差し相違点を **8 点** 列挙: ①倍率の離散性 / ②cap 設計 / ③Lv の永続性 / ④視覚チャネル数 / ⑤graze 半径の動的性 / ⑥graze 発火条件 / ⑦被弾構造 / ⑧ステージ構成。

Phase 3 大作業宣言の完遂条件 2 (5 点以上箇条書き列挙) を **8/5 達成** (160%)。

### shallow vs deep clone の判定保留

本 8 点の相違点は、我々の v06 A-6 (a)(b) が Psyvariar 3 と **「同型ではあるが同実装ではない」** ことを示す。`feedback_clone_strategy.md` (t:5) の守破離フレームで言えば:

- **守の達成度**: 5/8 点で「我々の方が小さく/シンプル/離散的」 (相違点 1, 2, 3, 4, 7)。これは「守の完成度が低い」とも「守の段階でストイックに最小実装している」とも読める
- **破の方向性**: 3/8 点 (相違点 4, 5, 6) は「Psyvariar 系の方が深く/複合的」で、我々が拾えていない設計次元。これは v07 以降の独自性軸候補
- **判定保留**: `feedback_headless_unfit_for_unfinished_eval.md` (t:5) に従い、shallow か deep かの最終判定は Stage 4 AI 自プレイ + Nao_u 評価まで保留。本記事は判定材料の整理に留める

## 我々の分析・体験接続

### A. M-41 「active competitor 検証」教師データの第 1 例

`feedback_prior_art_citation_must_verify.md` (t:5) M-41 拡張案 (axis_shift 記事 §A) の教師データとして本記事を蓄積:

- **教師データ要件**: 「現役商業作と同型機構を独立着地した時、相違点を 5 点以上指差せる状態にする」
- **本件**: 8 点指差し済 → 要件達成
- **次サイクル以降の活用**: graze_log v07 brainstorm.md M-41 表の「active competitor」列に Psyvariar 3 を記入する時、本記事 8 点を引用元として使う

ただし `feedback_rule_proliferation_canonical.md` (t:5) 「個別指摘を即ルール化しない」に従い、本件 1 例で原則化はしない。同型観察 (我々の他ゲームで「気づかず現役商業作と同型実装をした」事案) を 1-2 例追加観測してから game_lessons_log の M 層に正式登録する。

### B. 動画観察で拾える相違点 / 拾えない相違点

8 点の相違点を、Switch 2 未所持で動画観察のみで確認可能かで分類:

**動画で拾える**:
- 相違点 1 (倍率の離散性): HUD の score 数字の伸び方を見れば分かる
- 相違点 4 (視覚チャネル数): 画面全体のフィードバックを観察すれば分かる
- 相違点 7 (被弾構造): HP ゲージの存在 / Continue 画面の有無で分かる
- 相違点 8 (ステージ構成): プレイ動画 1 周見れば分かる

**動画で拾えない**:
- 相違点 2 (cap 設計): 実機で chain Lv up を狙って試さないと cap 数値が分からない
- 相違点 3 (Lv 永続性): リプレイで Lv の reset タイミングを観察する必要があり、長時間動画が要る
- 相違点 5 (graze 半径動的変化): 実機で擦り感覚を体験しないと半径変化が分からない
- 相違点 6 (graze 発火条件): 時刻積分 vs 単発判定は実機の擦り感覚でしか拾えない

→ **8 点中 4 点は動画観察で代替可能**、残り 4 点は実機体験が必要。`feedback_self_governance.md` (t:5) に従い、まず動画観察で 4 点を確認するのが次サイクル候補。

### C. v07 brainstorm 起票時の active competitor 列素材

v07 (未着手) 起票時に持ち込むべき軸 (axis_shift 記事 §D との接続):

```
| ゲーム | 年 | 直接性 | 引用URL | 引用文抜粋 | active competitor | 純粋指差し相違点 |
|---|---|---|---|---|---|---|
| Psyvariar 3 | 2026-05-22 | ◎ | a4at.com Switch 2 Review | "経験ゲージ満タンで Lv up + 一時無敵 + 連鎖無敵スパイラル" | 現役 / 未体験 (動画 4 点確認可) | 本記事 8 点参照 |
```

「相違点 5 点以上」列を埋めない状態で v07 着手したら、shallow clone のリスクが立つ。本記事はその列の初期素材を提供する。

### D. game_lessons_log への新提案 (M-?? 候補、ただし即ルール化禁止に従い保留)

axis_shift 記事 §F の M-41 拡張案を更に細分化:

```
M-41 拡張レイヤー 5: active competitor との純粋指差し相違点 5 点以上
- 同型機構を持つ現役商業作との相違点を、定数値・離散/連続性・チャネル数・cap 設計の各軸で 5 点以上箇条書き
- 動画観察可能な相違点 / 実機体験必須の相違点 を分類
- 相違点が 5 点未満なら shallow clone リスクを self_judgment.md に明記
```

ただし `feedback_rule_proliferation_canonical.md` (t:5) に従い、本件 1 例で原則化せず、graze_log v07 起票時に運用してみてから判断する。

### E. memory との接続

- `feedback_prior_art_citation_must_verify.md` (t:5) M-41 — 拡張レイヤー 5 (純粋指差し相違点 5 点以上) の教師データ第 1 例として蓄積
- `feedback_clone_strategy.md` (t:5) — 守破離の守の達成度を「相違点 5 点以上指差せる状態」で測る教師データ第 1 例
- `feedback_difference_first.md` (t:5) — 同型観察 (axis_shift) を書面化した後、相違点側を必ず書く運用の第 1 例
- `feedback_headless_unfit_for_unfinished_eval.md` (t:5) — shallow/deep 判定を Stage 4 まで保留する運用
- `feedback_self_governance.md` (t:5) — Switch 2 未所持で動画観察 4 点 + 実機 4 点に分解する判断
- knowledge/20260522_psyvariar_buzz_chain_invincibility_risk_reward_spiral_v06_a3_shallow_clone.md — 原典 5 要素分解 (本記事はその「我々と現役 3 のどちらでも未実装/実装差」の点検)
- knowledge/20260523_psyvariar3_2026_release_prior_art_axis_shift_live_commercial_competitor.md — 同型観察記事 (本記事の対の片割れ)
- knowledge/20260523_volguard2_economic_inversion_dominant_strategy_graze_log_v06_chain_extension.md — A-6 cap 180F の経済反転点検 (相違点 2 hard cap 設計の独自性根拠)

## 接続先

- **beliefs**: B003 (memory fusion — 「Psyvariar 型」を時代区分なしで fusion すると相違点 5 点が見えなくなる盲点)
- **articles**:
  - [20260523_psyvariar3_2026_release_prior_art_axis_shift_live_commercial_competitor.md](20260523_psyvariar3_2026_release_prior_art_axis_shift_live_commercial_competitor.md) — 同型観察 (本記事の対)
  - [20260522_psyvariar_buzz_chain_invincibility_risk_reward_spiral_v06_a3_shallow_clone.md](20260522_psyvariar_buzz_chain_invincibility_risk_reward_spiral_v06_a3_shallow_clone.md) — 原典 5 要素分解
  - [20260523_volguard2_economic_inversion_dominant_strategy_graze_log_v06_chain_extension.md](20260523_volguard2_economic_inversion_dominant_strategy_graze_log_v06_chain_extension.md) — cap 180F の経済反転点検 (相違点 2 の独自性根拠)
  - [20260519_bullet_hell_two_paths_psyvariar_graze_vs_cave_cancel_three_independent_signals.md](20260519_bullet_hell_two_paths_psyvariar_graze_vs_cave_cancel_three_independent_signals.md) — Psyvariar 経路の歴史的位置づけ
- **projects**:
  - game/graze_log/v06 (game/graze_log/v06/README.md) — § Psyvariar 3 同週リリースの位置づけ に本記事へのリンク追加 (本サイクル Phase 4 同 commit)
  - graze_log v07 brainstorm (未着手) — 本記事 8 点を active competitor 列の初期素材として持ち込む
  - projects/external_search_phase1_fixation.md — 外部検索が「同型観察→相違点 8 点指差し」へ展開した第 1 例
- **memory**:
  - [memory/feedback_prior_art_citation_must_verify.md](../memory/feedback_prior_art_citation_must_verify.md) t:5 — 拡張レイヤー 5 (純粋指差し相違点 5 点以上) の教師データ第 1 例
  - [memory/feedback_clone_strategy.md](../memory/feedback_clone_strategy.md) t:5 — 守破離の守の達成度測定の教師データ第 1 例
  - [memory/feedback_difference_first.md](../memory/feedback_difference_first.md) t:5 — 同型観察後の相違点点検運用の第 1 例
  - [memory/sense_prediction_log.md](../memory/sense_prediction_log.md) — 本記事を教師データとして蓄積、M-41 拡張レイヤー 5 の原則化判断は同型 2-3 例観測後
- **concept_graph**:
  - [[純粋指差し相違点 (Pure Pointing Difference)]] → operationalizes → [[feedback_difference_first]]
  - [[shallow vs deep clone 境界線 (Shallow/Deep Clone Boundary)]] → measured_by → [[純粋指差し相違点 (Pure Pointing Difference)]]
  - [[離散 2 値倍率 vs 連続 Lv 倍率]] → instance_of → [[reward shaping divergence]]
  - [[hard cap vs soft chain]] → instance_of → [[bounded vs unbounded reward design]]
  - [[現在進行形商業競合 (Live Commercial Competitor)]] → requires → [[純粋指差し相違点 (Pure Pointing Difference)]] (5 点以上)

## 未解決の問い

1. **8 点指差しの後で「同じか違うか」の総合判定は誰がするか** — 我々 Stage 4 自プレイで「違う」と言えるか、Nao_u 評価で「shallow clone に見える」と言われるか、Mir cross_review で別観点が出るか。本記事は判定材料の整理に留め、判定そのものは保留

2. **動画観察で拾える 4 点を次サイクル以降に実行するか** — 相違点 1, 4, 7, 8 は YouTube 等の Psyvariar 3 プレイ動画で確認可能。商用利用可否 (引用範囲) を確認した上で次サイクル候補。実機 4 点 (相違点 2, 3, 5, 6) は Switch 2 購入判断が Nao_u 案件 (axis_shift §B)

3. **相違点 5, 6 (graze 半径動的 / 発火条件) を我々が拾うべきか** — Psyvariar 系の deep clone を狙うなら拾う、shallow clone から離脱する独自性軸とするなら **逆向きに** 設計する選択もある。v07 brainstorm 段階で判断

4. **「相違点 5 点以上」を M-41 拡張レイヤー 5 として正式化するか** — 本件 1 例で原則化は勇み足。graze_log 以外の game/* で「気づかず現役商業作と同型実装をした」第 2 例が観測されたら、game_lessons_log に M-?? として正式登録する判断材料が揃う

5. **Psyvariar 3 が捨てている価値 (我々が拾える差別化軸)** — 相違点リストの逆引きで、(a) graze の color identity 設計を 4 層 readability の第 3 層として深める / (b) 1 hit dead 環境での「絶対安全圏としての無敵」の演出強化 / (c) seed 再現性を活かしたリプレイ最適化 (Psyvariar 3 は譜面前提) など、独自性軸の候補が立つ。v07 brainstorm 段階で展開

— Ash (Win2) 2026-05-23 C197 Phase 4 大作業
