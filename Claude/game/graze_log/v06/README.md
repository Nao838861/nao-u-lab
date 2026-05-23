# graze_log v06 — A-1 anticipation telegraph + A-4 wobble + A-5 buzz invincibility

**status**: v05 beta B-2' (C189 = `90adecd15 ash: graze_log v05 beta B-2'`) からの **削除可能改良 1 個刻み**。C190 brainstorm 18 案中、群A (経路A 完成度向上) の最小案 A-1 を採択し実装。

## 採択した 1 機構

「敵が出現する 30 frame 前から、出現座標の x 軸位置に薄い円を画面上端で膨張描画する」

v05 beta では弾発射前 10 frame の windup telegraph (B-2') と全弾常時軌跡 (v05 alpha, telegraph 層) が揃っていた。v06 A-1 はその一段手前、**敵がまだ画面に出ていない段階での予兆**を追加。さらに C192 で A-4 を上乗せし、**弾本体の wobble animation を identity チャンネルとして追加**。これで readability の 4 層が完成する:

| 層 | 名称 | 範囲 | 出典 (v06 commit) |
|---|---|---|---|
| 1 | **anticipation** | spawn 前 30F | v06 A-1 |
| 2 | **telegraph** | 弾発射後の全弾軌跡 | v05 alpha (`34814472e`) |
| 3 | **windup** | 弾発射前 10F | v05 beta B-2' (`90adecd15`) |
| 4 | **wobble** | 弾本体の type 別 sin 振動 (aimed 緩 / fan3 速) | 本案 (v06 A-4) |

4 層が揃うことで、プレイヤーは「敵が来る → 弾が来る → 弾が動く」の 3 ステップ予測に加え、**弾の type を視認 1 フレームで弁別**できる (shape/color と並ぶ 3 つ目の identity チャンネル)。shmups.wiki Boghog bullet hell 101 / sparen.github.io ddsga2 で「shape elongation + trails + wobble/ripple animation = CAVE 級 readability 業界標準解」と明示される構造。M-37 brainstorm の MPS 採点では本案は 6/15 と低いが、**readability の最後の 1 層**を補完する構造的位置で採択された。

## なぜ A-1 か (採点ではなく構造で選んだ理由)

v06/brainstorm.md §「採点では B-2 / C-1 が高いが、守の段階整合性で A-1 が抜ける」で示した通り、MPS 採点だけ見れば B-2 (Hyper Activation, 9点) や C-1 (Witch Time, 8点) が上位だが、以下の制約で A-1 が選ばれた:

1. **守の段階整合性** (feedback_clone_strategy.md t:5) — Psyvariar 経路 (経路A) の完成度向上を継続中。経路B (CAVE/bullet-cancel) への横移動は「型の獲得」ではなく「型の切り替え」になる。
2. **core が 'fun' と確定していない状況** — v05 beta B-1/B-2/B-2' まで shipped、Nao_u 評価未受領。Phase 1 外部検索 (gamedeveloper / gamedesignskills / Codecks) の業界標準ヒューリスティック「core mechanic deepen first, slowly add one piece at a time」「large gameplay changes avoided unless absolutely necessary」が A 経路継続を支持。
3. **prior_art_30 既検証の Touhou spell card anticipation** — Touhou の spell card 開始 telegraph は spawn 前 readability の直接先行事例。M-41 検証 (URL + 引用文抜粋) 強く立つ。
4. **削除可能改良 1 個刻み範囲** — 差分行数 34 (内 functional ~25, comment ~9)。30 行境界線上だが、機構の独立性は高く v06 → v05 beta への戻しは 6 箇所の削除で完了。

経路B 試行 (B-2 Hyper Activation) は v07 以降の課題として brainstorm.md に記録済。

## v05 beta → v06 の差分 (6 箇所)

### 変更した 6 箇所 (functional)

1. **`ANTICIPATION_FRAMES=30` 定数追加** (`index.html:111`) — anticipation 窓の frame 数
2. **`state.pendingEnemies:[]` 追加** (`index.html:120`) — anticipation queue
3. **`spawnEnemy()` 改修 + `emitEnemy()` 新設** (`index.html:203-213`) — 直接 push を queue 経由に
4. **`startGame()` reset 追加** (`index.html:223`) — retry 時の queue クリア
5. **`update()` 内 spawn gate + pendingEnemies tick** (`index.html:409, 414-417`) — gate に `pendingEnemies.length===0` 追加、tick で countdown→emit
6. **`draw()` 内 anticipation 描画ブロック** (`index.html:599-609`) — pending 各要素に膨張円描画
7. (補助) タイトル文字列 (`index.html:5, 811`) — v05→v06 表記

### 触っていない既存機構 (v05 beta と完全同一)

- 自機操作・graze 半径・hit 半径
- BOMB 挙動・gauge 蓄積/閾値
- Psyvariar grazeStreak → active 防御
- `spawnWave1..4` / wave 5+ rhyme 分岐 (B-1)
- 弾パターン `aimed` / `fan3` 分岐 (B-2)
- 弾発射 windup telegraph (B-2')
- 全弾常時軌跡 (v05 alpha)
- 敵移動速度・onHit 段階ダメージ
- seed 再現性 (mulberry32)
- `onGraze()` 内の score/gauge/active 防御

## 戻し方 (削除可能性の保証)

v06 → v05 beta B-2' に戻すには:

1. `const ANTICIPATION_FRAMES=30;` と前後コメントを削除 (1 箇所、4 行)
2. `pendingEnemies:[]` を `state` から削除 (1 行)
3. `spawnEnemy()` 内を `if(type==='small'){...}else{...}` に戻す (v05 形)、`emitEnemy()` 関数を削除 (合計 ~10 行)
4. `startGame()` の `state.pendingEnemies.length=0;` を削除 (1 行)
5. `update()` 内 spawn gate `&&state.pendingEnemies.length===0` を削除 + pending tick ブロック削除 (4 行)
6. `draw()` 内 anticipation 描画ブロックを削除 (~11 行)
7. タイトル/コメントを v05 beta 表記に戻す (2 箇所)

合計 **6 箇所、約 30 行**。残りは v05 beta と同一バイト列。

## 設計の細部 (実装メモ)

### spawn gate と pendingEnemies の協調

v05 では `state.spawnT<=0 && state.enemies.length<3` で次 wave 発火。v06 では `&& state.pendingEnemies.length===0` を追加。理由: 現 wave がまだ pending な状態 (anticipation 中) で次 wave を spawn すると、anticipation 円が画面に多数出て画面情報密度が破綻する。pending が捌けるまで次 wave を待たせる。副作用として wave 間の間隔が ANTICIPATION_FRAMES (30F = 0.5s) 延びる — 1 wave あたり ~2.5s なので体感影響は小さい。

### anticipation 描画位置

敵の spawn 座標は `y=-12` (small) / `y=-16` (medium) で画面外。よって anticipation 円を spawn 座標に描いても見えない。代わりに **画面上端付近の固定 y** (`y=14` small / `y=18` medium) に出現 x の円を描く。これにより「ここから敵が降ってくる」が視覚的に明示される。

### alpha curve

`alpha = 0.4 * (1 - countdown/ANTICIPATION_FRAMES)` で 0 → 0.4 に escalation。countdown が 30 (出現 30F 前) で alpha=0、countdown=0 (出現直前) で alpha=0.4。これによりプレイヤーは「ぼんやり何かある」→「はっきり輪郭」→「敵出現」を 0.5s で読める。

### 円半径の膨張

`r = baseR * (0.4 + 0.8 * t)` で `t = 1 - countdown/30`。t=0 で r=baseR*0.4 (例: small=9*0.4=3.6)、t=1 で r=baseR*1.2 (例: small=9*1.2=10.8)。実 enemy の半径 (small=9, medium=13) よりわずかに大きい状態で出現が完了するので、視覚的な連続性がある。

## 判定方針

**headless 数値 (到達率/生存秒/成功率) は judgment / cross_review / Slack の根拠にしない**

根拠: `feedback_headless_unfit_for_unfinished_eval.md` t:5 (Nao_u 2026-05-09 三度目「やめて」)。本 v06 でも同様。anticipation 描画の効果は AI 自プレイ (Stage 4) と Nao_u 評価で判定する。

**self_judgment.md / predicted_play.md / cross_review 書面は v06 では作らない**

Phase 4 の目的は **playable diff 1 機構** を出すこと。Stage 3 (実装後の予測) / Stage 4 (AI 自プレイで「良い」と確信) は次サイクル以降。

## A-5 (b): Psyvariar buzz chain invincibility 第一手 (C193 追加)

### 何を 1 個足したか

**Lv up 発火点で自機 60F (1 秒) 無敵化 + 視覚 glow ring (橙色 #ffa040 pulse) 描画**。`state.invincibleT` 状態を新設、`onGraze()` 内 `playerLv++` と同時に `invincibleT = BUZZ_INVINCIBLE_FRAMES` をセットし、`update()` で tick、hit 判定 2 箇所 (ebullet 接触 / 敵本体接触) に `&& state.invincibleT <= 0` gate を追加、`draw()` で残時間に応じた橙色 ring を自機周囲に描く。

### なぜ A-5 (b) か

`knowledge/20260522_psyvariar_buzz_chain_invincibility_risk_reward_spiral_v06_a3_shallow_clone.md` が明示する Psyvariar Buzz の 5 要素 ((a) graze=gauge / (b) Lv up invincibility / (c) Lv up 中 graze 継続 / (d) 連鎖 Lv up / (e) Roll hitbox shrink) のうち、A-3 は (a) のみ採用していた。「Psyvariar Lv up を取り入れた」と書面化したまま (b) を欠いた状態で v06 を閉じると、後で「Psyvariar 型は効かなかった」という誤判定リスク (knowledge §A) が立つ。A-5 (b) は **5/5 中 2/5 への到達** であり、Psyvariar 経路 (経路A) の縦深化の最小一歩。

### 何を取らなかったか (削除可能改良 1 個刻み制約)

- **(c) Lv up 中 graze 継続**: 60F 無敵中に弾接触で gauge が貯まり続ける機構は未実装。本サイクルでは「無敵中の graze は通常通り発火するが、Lv up cooldown は LV_GRAZE_TH ベースで一度に複数 Lv up しないため、自然に (d) 連鎖が抑制される」という副作用に依存する形。
- **(d) 連鎖 Lv up**: 仕組み上、無敵中の graze 30 回累積で次の Lv up は発火し得るが、現実的には 1 秒で 30 graze は届かないため、(d) は事実上 dormant。
- **(e) Roll hitbox shrink**: graze_log に画面外機軸動作が無いため不適用。

### 戻し方 (A-5 → A-3 削除可能性の保証)

`index.html` に 7 箇所:
1. `BUZZ_INVINCIBLE_FRAMES=60` 定数 + 前後コメントブロック削除 (~8 行)
2. `state.invincibleT:0,` 削除 (1 行 + コメント)
3. `startGame()` の `state.invincibleT=0;` 削除 (1 行 + コメント)
4. `update()` の `if(state.invincibleT>0)state.invincibleT--;` 削除 (1 行 + コメント)
5. hit gate 2 箇所の `&&state.invincibleT<=0` を削除 (2 行 + コメント)
6. `onGraze()` Lv up ブロック内の `state.invincibleT=BUZZ_INVINCIBLE_FRAMES;` + `state.rings.push(...)` 削除 (2 行 + コメント)
7. `draw()` 内 buzz glow ring ブロック削除 (~7 行)

合計約 27 行。A-3 と bit 完全等価に戻る。

### 判定方針 (v06 全体方針継承)

- **headless 数値は judgment / cross_review / Slack の根拠にしない** (`feedback_headless_unfit_for_unfinished_eval.md` t:5)
- 連鎖無敵の「気持ちよさ」は AI 自プレイ (Stage 4) と Nao_u 評価で判定する
- self_judgment.md / predicted_play.md は次サイクル以降 (本 Phase 4 は playable diff 1 機構を出すことが目的)

### 4 層 readability への波及

A-5 は readability 4 層 (anticipation / telegraph / windup / wobble) を変更しない。**Lv up 中の橙色 glow ring が「視覚的に弾を無視できる」を即時伝達する追加の readability チャネル**として副次効果を持つが、これは A-4 wobble の identity チャンネルとは独立した「自機状態」のチャンネルなので 4 層分類に追加せず別軸として扱う。

## A-6 (a): buzz chain extension (C194 追加)

### 何を 1 個足したか

**無敵中の Lv up で無敵時間を「上書き」せず「加算延長」する** (`onGraze()` の Lv up ブロック)。`BUZZ_INVINCIBLE_CAP=180` (3 秒) 定数を新設、無敵切れていれば従来通り 60F セット (橙色 #ffa040 ring)、無敵中なら `Math.min(invincibleT+60, 180)` で加算 + 黄色寄りの ring (#ffd040, 半径 +6) を追加 push (連鎖視認用)。

### なぜ A-6 (a) か

外部検索 (2026-05-23 10:30 実行) で **Psyvariar 3 正統続編が 2025-09 発表 → 2026-05-21 (今週) 日本リリース** という偶然の同期点が見つかった。原典 Psyvariar の核設計は「Lv up ごとに数秒完全無敵 + 弾密度が高ければ multiple level-ups を chain して長期無敵化が可能」(shmups.system11.org / Wikipedia "Psyvariar" 1999-2001 アーケード仕様欄)。A-5 (b) では Lv up で 60F を**上書き**するだけだったため、無敵中の次 Lv up が来ても 60F のまま縮退していた。これは原典 chain の核機構を欠いた "shallow clone" で、`knowledge/20260522_psyvariar_buzz_chain_invincibility_risk_reward_spiral_v06_a3_shallow_clone.md` が警告した「shallow vs deep clone」の shallow 側に留まっていた。A-6 (a) は 5 要素 (a)(b)(c)(d)(e) のうち、A-3 で (a)、A-5 で (b) を獲得した次の **(d) 連鎖 Lv up** を取りに行く 1 個刻みの一歩 (= 5/5 中 3/5 への到達)。

### 何を取らなかったか (削除可能改良 1 個刻み制約)

- **(c) Lv up 中 graze 継続**: 60F 無敵中も弾接触で gauge が貯まり続けるが、現実的に 1 秒で 30 graze は届かないため、A-6 (a) 加算延長によって 30 graze に到達できる可能性は上がる。ただし機構自体は未変更 (graze 半径も無敵中の onGraze 判定も A-5 と同一)。
- **(e) Roll hitbox shrink**: graze_log に画面外機軸動作が無いため不適用。

### 戻し方 (A-6 → A-5 削除可能性の保証)

`index.html` に 2 箇所:
1. `BUZZ_INVINCIBLE_CAP=180` 定数 + 前後コメントブロック削除 (~9 行)
2. `onGraze()` Lv up ブロック内の `if(state.invincibleT>0){...}else{...}` 加算分岐を `state.invincibleT=BUZZ_INVINCIBLE_FRAMES; state.rings.push(...)` の上書き形 (A-5 (b)) に戻す (約 8 行 → 2 行に縮約)

合計約 15 行。A-5 (b) と bit 完全等価に戻る。

### 判定方針 (v06 全体方針継承)

- **headless 数値は judgment / cross_review / Slack の根拠にしない** (`feedback_headless_unfit_for_unfinished_eval.md` t:5)
- 連鎖延長の「気持ちよさ」 (チェイン中の体感が原典 Psyvariar に近づくか) は AI 自プレイ (Stage 4) と Nao_u 評価で判定する
- self_judgment.md / predicted_play.md は次サイクル以降 (本 Phase 4 は playable diff 1 機構を出すことが目的)

### 4 層 readability への波及

A-6 (a) は readability 4 層 (anticipation / telegraph / windup / wobble) を変更しない。glow ring の chain 識別色 (黄色 #ffd040) は A-5 (b) の橙色 #ffa040 と区別される「自機状態の chain 段階」を表す追加チャネルだが、A-5 (b) と同じく 4 層分類とは別軸 (自機状態軸) に属するため、4 層には追加しない。

### Psyvariar 3 同週リリースの位置づけ

2026-05-21 (今週) に Psyvariar 正統続編 (3) が 20 年以上ぶりに日本リリースされたという外部世界の同期点は、本 A-6 (a) 採択の**契機ではあるが根拠ではない**。根拠は原典 Psyvariar の chain 設計の存在 (上記出典) と、A-3/A-5 (b) の縦深化の自然な次手という構造側にある。同週リリースは「外を見て同期した」事実そのものに価値があり、次サイクル以降 Psyvariar 3 のプレイレビュー/インタビュー情報が出てきたら知識として取り込む候補。

## A-6 (b): buzz chain reward (C195 追加)

### 何を 1 個足したか

**無敵中の graze は gauge / score を 2x で加算する + popup 色を chain 寄りの #ffd840 (黄色) に変更**。`onGraze()` 冒頭で `const mult=state.invincibleT>0?2:1;` を取り、`addGauge(GRAZE_GAUGE*mult)` と `state.score+=GRAZE_SCORE*gaugeLevel(state.gauge)*mult` で適用。`+6` 表示も `+(GRAZE_GAUGE*mult)` で `+12` に変わり、popup 色も `mult>1?'#ffd840':'#ffd870'` で識別。通常 graze (無敵切れ後) は完全に従来通り、機構の対称性は保たれる。

### なぜ A-6 (b) か

外部検索 (Phase 1 §6) で偶然出てきた **ヴォルガード II の "弾撃たない方が得" 罠** が、現 v06 A-5 (b) + A-6 (a) の構造に同型の罠を作り出していることが Phase 3 で判明した — 無敵中はプレイヤーが「擦らずに凌げる」ため擦る動機が消失し、次 Lv up の発火源 (graze 蓄積) が止まり、結果として A-6 (a) の連鎖延長機構 (上限 180F=3 秒) が物理的に届かなくなる。これは "shallow clone" を超えた "structural dominant strategy creep" で、報酬累積で核行動が逆方向に最適化されるという dominant strategy creep の Volguard 型の罠。A-6 (b) は「無敵中こそ擦る方が得」という入力側の勾配を作って核行動 (擦り) を継続発火させる、最も小さな勾配反転。Psyvariar 原典 5 要素のうち (c) Lv up 中 graze 継続 を一段深めた変種で、5/5 中 4/5 への到達。

### 何を取らなかったか (削除可能改良 1 個刻み制約)

- **本格 (c) Lv up 中 graze 継続 (graze 半径拡大版)**: 無敵中だけ graze 半径を `R_GRAZE+8` 程度に拡げて擦り易くする案もあるが、半径定数は draw() と当たり判定の両方に効くため副作用が大きい。本案は係数 (倍率) だけで「擦る価値」を 2 倍にすることで、副作用を局所化。
- **(e) Roll hitbox shrink**: graze_log に画面外機軸動作が無いため不適用 (A-5/A-6 (a) と同じ理由)。
- **無敵延長 trigger 連動の動的倍率**: 倍率を `1 + (invincibleT/BUZZ_INVINCIBLE_CAP)` で chain 進度に応じて滑らかに上げる案。複雑度が増し守の段階に合わないため、まずは離散 2x で動作確認。

### 戻し方 (A-6 (b) → A-6 (a) 削除可能性の保証)

`index.html` の `onGraze()` 内 1 箇所:

1. `const mult=state.invincibleT>0?2:1;` 行 + 前後コメントブロック (4 行) を削除
2. `addGauge(GRAZE_GAUGE*mult)` → `addGauge(GRAZE_GAUGE)` に戻す
3. `state.score+=GRAZE_SCORE*gaugeLevel(state.gauge)*mult` → 末尾の `*mult` を削除
4. `text:'+'+(GRAZE_GAUGE*mult)` → `text:'+'+GRAZE_GAUGE`
5. `c:mult>1?'#ffd840':'#ffd870'` → `c:'#ffd870'`

合計約 9 行 (内コメント 4 行)。A-6 (a) と bit 完全等価に戻る。

### 判定方針 (v06 全体方針継承)

- **headless 数値は judgment / cross_review / Slack の根拠にしない** (`feedback_headless_unfit_for_unfinished_eval.md` t:5)
- 「無敵中も擦る価値」の体感は AI 自プレイ (Stage 4) と Nao_u 評価で判定する
- self_judgment.md / predicted_play.md は次サイクル以降 (本 Phase 4 は playable diff 1 機構を出すことが目的)

### Volguard 罠予防の構造的根拠

外部検索で確認された Volguard II の核欠陥は「弾発射で energy 消耗 → upgrade すると消耗増 → 最適解=弾を撃たずに体当たり」という、報酬経路 (敵撃破による energy 回復) の発火源 (弾発射) を逆方向に最適化させる構造。strategywiki / mobygames の評価で「続編が前作より劣る」とされる主因として挙げられている。本 v06 の構造を写すと: 報酬経路 (Lv up による無敵延長) の発火源 (graze 蓄積) は無敵中に消える → 「擦らない方が得」が成立 → 連鎖の上限 180F に届かない。A-6 (b) はこの構造の入力側 (graze) に直接 2x 勾配を載せることで、無敵中の擦り行動を「コスト」から「報酬」に転換する。Psyvariar 原典が長期 chain を成立させていた理由が、無敵中も graze が gauge 蓄積を継続できる設計だった (Buzz 5 要素 (c)) という出典と整合する。

### 4 層 readability への波及

A-6 (b) は readability 4 層 (anticipation / telegraph / windup / wobble) を変更しない。popup 色変化 (#ffd840) は「無敵中の graze は普通の graze と価値が違う」を即時伝達する自機状態軸のチャネルだが、A-5/A-6 (a) glow ring と同じく 4 層分類とは別軸 (自機状態軸) に属するため、4 層には追加しない。

## 接続先

- `game/graze_log/v05/` — v06 の 6 箇所を v05 beta 形に戻した状態
- `game/graze_log/v05/README.md` — 全弾常時軌跡 (readability 3 層の第 1 層 = telegraph)
- `game/graze_log/v05/devlog.md` §12 — windup telegraph (readability 3 層の第 2 層 = windup)
- `game/graze_log/v06/brainstorm.md` — 18 案比較表 + A-1 採択の 1 行確信宣言
- `game/graze_log/v04/prior_art_30.md` — 30 件既検証の引用付き先行事例集
- `knowledge/20260519_bullet_hell_anticipation_windup_telegraph_readability_three_layers.md` — readability 3 層分解の起源
- `knowledge/20260519_bullet_hell_two_paths_psyvariar_graze_vs_cave_cancel_three_independent_signals.md` — 経路A/B の独立性
- `memory/feedback_clone_strategy.md` t:5 — 守の通過点での 1 個刻み制約
- `memory/feedback_means_ends_reversal_check.md` t:5 — playable diff 第一義原則
- `memory/feedback_prior_art_citation_must_verify.md` t:5 — M-41 引用検証
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 判定根拠から headless を外す
- `knowledge/20260522_psyvariar_buzz_chain_invincibility_risk_reward_spiral_v06_a3_shallow_clone.md` — A-5 (b) の元となった「Psyvariar Buzz 5 要素 / shallow vs deep clone」分析

— Ash (Win2) 2026-05-19 C191 Phase 4 / C192 Phase 4 A-4 wobble 追加 / C193 Phase 4 A-5 (b) buzz invincibility 追加 (2026-05-23) / C194 Phase 4 A-6 (a) buzz chain extension 追加 (2026-05-23) / C195 Phase 4 A-6 (b) buzz chain reward 追加 (2026-05-23)
