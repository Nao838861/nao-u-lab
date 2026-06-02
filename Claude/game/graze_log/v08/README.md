# graze_log v08 — 観点 6 (a) 画面下端 1px 高 時間 bar 1 機構追加

**status**: v07 (B-2 + 観点 3 統合版 commit f151eaf60) の self_judgment.md §C281 「v08 着手判断: 第一手 v08 (a) 時間 bar 採用×高で着手判断確定」結論を受けて着手。本 v08 は v07 self_judgment 末尾で確定済の Stage 4 自判定 (採用×高 + R-I 死守準拠 + clone_strategy 守の「削除可能改良 1 個刻み」要件充足) に物理的責任を載せる回収サイクル。

## v08 で増やしたもの (1 機構のみ)

**(a) 画面下端 1px 高 時間 bar** — `index.html` drawHUD() 末尾に約 10 行追加:
- データソース: `state.t` (累積 frame 数) + `PHASE_BOUNDARIES` (line 171: `[780,1560,2340,3120,3900,4680,5400]`)
- 描画位置: `y = H-1` (画面最下端 1px、gauge bar `y=H-14, gh=8` と 6px 隔離 — HUD 既存行 line 976 と衝突なし)
- 進捗: `W * min(state.t, 5400) / 5400` を `#6090c0` で塗り、背景 `#2a3548` の上に重ねる
- phase tick: 各 `PHASE_BOUNDARIES[i]` 位置の 1px を `#a0c0e0` で打つ (7 tick = 13/26/39/52/65/78/90秒)

## 設計意図 (v07 self_judgment.md §C281 Cell 5/6 根拠)

- v07 までは phase 切替が「spawn パターン変化 = 弾密度変化」の事後気付きでしか得られず、**先行通知が一切なかった** (Cell 5)
- 時間 bar により「あと 2 秒で休符」を読み取りに行ける = プレイヤー側の予測能力が解放される。これは amplification の本質定義 (内部状態の知覚化 → empowerment) に直結 (Cell 6)
- Nao_u v02 評価「かなり単調。早めに3段階までパワーアップして以降は普通のシューティング」(`log/nao_u_live.md` L170-183) への根本応答は観点 6 (時間予算 spawn テーブル) と組み合わせて立つが、その時間予算の **可視化** が本 v08 (a) の役割

## 戻し方 (v08 → v07 完全等価)

`index.html` drawHUD() 末尾 ~10 行を削除すれば v07 完全等価。v08/ ディレクトリを丸ごと削除しても v07 は無傷。

## 採用しなかった v08 候補 (v07 self_judgment.md §C281 確定)

- **(b) gauge 期待ライン**: 不採用 × 中 (情報密度過剰)
- **(c) chain counter ●●○ 形式**: 不採用 × 低 (player 周囲 ring 弧長表示として再設計要)
- **(d) 観点 3 弾側マーカー fadeout 5F**: **再検討 × 中** で v08 (a) ship 後の Stage 4 再評価で確信度確定要。本 v08 では着手しない (1 機構刻み守準拠)
- **(e) cap reached 大成功反応 (観点7)**: 不採用 × 低 (v08 (a) と直交、別 iteration へ)

---

# (以下 v07 README 継承部 — 経路B 全体方針)

## graze_log v07 — 経路B (CAVE bullet-cancel / B-2 Hyper Activation) + 観点 3/6/7/8 統合方針

**status**: v06 (6 機構統合版 commit 0d6c1bf9f) の self_judgment.md §「次 iteration 起点を 1 つ確定 → (γ) v07 経路B 移行 + 観点 3/6/7/8 同時実装」結論を受けて着手。Nao_u v06 評価 9 日間未受領を「Nao_u 返信待ち」と framing し続けるのは R-I 「判定の代行を依頼する framing が出てきたら退路設計の signal」に該当する。本 v07 は v06 self_judgment の Stage 4 自判定結論に物理的責任を載せる起点。

**経路A 縦深化の天井**: v06 で Psyvariar Buzz 5 要素 4/5 獲得 (A-3=(a) graze=gauge / A-5(b)=(b) Lv up invincibility / A-6(a)=(d) 連鎖 Lv up / A-6(b)=(c) Lv up 中 graze 価値継続)。残る (e) Roll hitbox shrink は graze_log に画面外機軸動作が無いため不適用 → **経路A 縦深化はここで天井**。v07 は次の独自要素 1 つを **経路B (CAVE bullet-cancel / Hyper Activation)** に進める段階。Nao_u v02 評価 (2026-05-04) 「面白くはないが、ぎりぎりゲームにはなっている。かなり単調。早めに3段階までパワーアップして以降は普通のシューティング」が示す **「3 段階 PU 後は普通のシューティング」を構造的に解く** ことが v07 の本丸。

## v07 で実装する 1 機構 + 同時物理化する 4 観点

| 項目 | 内容 | 出典 |
|---|---|---|
| **核機構 (B-2)** | Hyper Activation: graze gauge 満タン → 全画面弾消去 + 消去 1 弾ごと score+100 + Large Star 演出 30F | v06/brainstorm.md §B-2 |
| **観点 3** | 無敵中の高倍率対象 (2x graze) を **弾側マーカー化** | Log_cdx 観点 3 / v06 self_judgment §観点3 |
| **観点 6** | 7 区分時間予算 (0-4s/4-12s/12-25s/25-40s/40-58s/58-75s/75-90s) を spawn テーブルとして README に明文化 | Log bell_log / v06 self_judgment §観点6 |
| **観点 7** | 180F cap reached 時の大成功反応 (核体験の頂点を祝う特別演出) | Log_cdx 観点 7 / v06 self_judgment §観点7 |
| **観点 8** | bad policy headless (route/camper/panic/novice 4 方針) を graze_log 側に物理化 | Log graze_log_cdx v05_1_cdx_v77〜v81 / v06 self_judgment §観点8 |

## 核機構 (B-2 Hyper Activation) の機構仕様

### gauge / 発動キー / 弾消去半径 / 復帰時間

v06 の Psyvariar Buzz gauge (`state.gauge`) を **共用** する設計を採る。理由: gauge を二重化すると HUD 情報密度が破綻し Log_cdx 観点 5 「常時表示情報は少ない方が良い」に抵触する。

| 項目 | 値 | 設計根拠 |
|---|---|---|
| **発動条件** | `state.gauge >= GAUGE_MAX` (既存 BOMB gauge と共用) | gauge を二重化しない (HUD 情報密度維持) |
| **発動キー** | 既存 BOMB キー (X キー) のまま、機能のみ Hyper に拡張 | 中心入力を増やさない (Log_cdx 観点 4 「中心入力をタイトル/リトライで」と同思想) |
| **弾消去半径** | **全画面**（半径制限なし） | CAVE Hyper 系の原典仕様。`state.ebullets` を全消去し score 加算ループに転換 |
| **score 加算** | `消去弾数 × 100` を一括加算 (個別 popup ではなく合計 popup 1 個) | popup の物量で画面情報密度を破綻させない (v06 self_judgment §良いと確信できない条件 #1 の継承) |
| **Large Star 演出** | 黄色フラッシュ 30F (`state.hyperFlashT=30`) + 消去された弾 1 個に対し短命 star 粒子 (黄色 1F 残光) | DoDonPachi SaiDaiOuJou Large Star 仕様の最小写し |
| **復帰時間 (cooldown)** | gauge を 0 にして自然 recharge (graze で再蓄積) — 別 cooldown は設けない | gauge 二重化禁止と同じ理由。Hyper 連発耐性は recharge 速度で律する |
| **無敵延長との衝突回避** | Hyper 発動中 (`hyperFlashT > 0`) は invincibleT を **新規セットしない** (既存 invincibleT は通常通り tick) | A-6(a) 連鎖延長と Hyper の二重カバーで「無敵が無限化」する shallow design を防ぐ |

### v06 BOMB との差分

v06 までの BOMB は「画面 flash + invincibility 短時間」のみだった (B-2 仕様未実装)。v07 で:
1. 全画面弾消去 (`state.ebullets.length = 0`) を発動効果に追加
2. `removedCount * 100` を `state.score` に加算 + popup 1 個 (`text:'HYPER +' + (removedCount*100)`)
3. Large Star 演出 (`hyperFlashT=30`) を `draw()` に追加 — 黄色 alpha 0.4 → 0 の 30F フェード
4. 弾消去位置に短命 star 粒子 push (`state.stars.push(...)`、30F 寿命)

### prior art (M-41 verifiable)

- **DoDonPachi SaiDaiOuJou (2012, Cave)** — https://shmups.wiki/library/DoDonPachi_SaiDaiOuJou
  > "Hyper Activation clears all bullets on screen and converts them to Large Stars worth significant point bonuses. During Hyper mode, the player's firepower is doubled."
  - 本 v07 は **graze 起動版** (SaiDaiOuJou は item 拾い起動)、firepower doubling は不採用 (1 機構刻み制約)
- **DoDonPachi DaiOuJou (2002, Cave)** — https://shmups.wiki/library/DoDonPachi_DaiOuJou (v04/prior_art_30 事例3 既検証)
  > "Players strategically time Hyper activations to clear overwhelming bullet walls during boss phases or dense enemy swarms, enabling safer continuation of chains without interruption."
  - 「弾消去 timing 戦略」は本案でも継承
- **ESPgaluda (2003, Cave)** — https://shmups.wiki/library/ESPgaluda
  > "Kakusei mode slows time and converts canceled bullets into gems."
  - 本 v07 は時間スロー無し (Witch Time 系は C-1 別案、v07 では取らない)、gem 化は score 化に置換

## 観点 3: 「無敵中の高倍率対象」を弾側マーカー化

### Log_cdx 観点 3 引用 (`log/slack_archive/game-rights.jsonl` ts=1779658696-8705)

> 「効果対象がある場合、対象物側にも状態を出す。反射できる弾なら弾側に記号を出す。…プレイヤー側 HUD だけでは足りない。対象物側の状態が変わらないと、プレイヤーは『何に効くのか』を読めない」

### v06 の穴

A-6(b) で「無敵中の graze は 2x 倍率」を実装したが、倍率は自機側 popup (#ffd840) で示すのみ → HUD 視線往復型。Log の評価が「強い新規性」と置いた箇所に v06 は直接ヒットしていない。

### v07 での物理化方針

無敵中 (`state.invincibleT > 0`) は、画面上の **全ての ebullet** に小さなマーカー (例: 弾の周囲に半径 +2 の細い黄色リング、または弾本体に小さな金縁) を **draw() で動的に追加描画** する。マーカーは「この弾を擦ると 2x」を弾側で即時伝達する。

- マーカーは **invincibleT が 0 になった瞬間に消える** → 自機状態と弾側マーカーが完全同期する (Log_cdx 観点 3 「対象物側の状態が変わらないと『何に効くのか』を読めない」直接対応)
- 弾種 (aimed / fan3) による色変化は **付けない** — 弾種 wobble (A-4) と衝突しないため
- 半径 +2 は graze 半径と hit 半径に **干渉させない** — draw() のみ、当たり判定には影響させない (Log_cdx 観点 5 「文字より、状態変化、色、形、輪郭、ゲージ」の「輪郭」に該当)

### 削除可能性

`draw()` 内 ebullet 描画ループに `if(state.invincibleT > 0) { ... ring 描画 ... }` を ~5 行追加するのみ。戻し方: 5 行削除で v06 完全等価。

## 観点 6: 7 区分時間予算 spawn テーブル

### Log_cdx 観点 6 引用

> 「最初に安全な学習区間を作る…基本操作だけで理解できる敵…中心システムを使うと得をする場面…圧力を上げる…休符を入れる…終盤に山…終端を明確に」

### Nao_u v02 評価との結節 (`log/nao_u_live.md` L170-183)

> 「かなり単調。早めに3段階までパワーアップして以降は普通のシューティング」

v02 から v06 まで 5 世代経過しても **学習/圧力/休符/山 の curve が無い** ことが「単調」の構造的原因。v07 で 7 区分時間予算を **README に明文化 + spawn テーブル化** する。

### v07 spawn テーブル (90 秒構成)

| 区間 | 秒 | フェーズ | 主要敵 | 設計意図 |
|---|---|---|---|---|
| 1 | 0-4s | **学習** | small 単体・低速 | 基本操作 (移動/射撃) のみで対処可能、graze 機会ゼロ |
| 2 | 4-12s | **核体験導入** | small + 弾 aimed | 「擦ると gauge 上がる」を 1 回体験 |
| 3 | 12-25s | **圧力 1** | small + medium + 弾 fan3 | 弾密度上昇、Lv 1-2 到達 |
| 4 | 25-40s | **休符** | small のみ・間引き | 一息、Hyper 蓄積準備 |
| 5 | 40-58s | **圧力 2** | medium + 同時 spawn 2 体 | Hyper 1 回目発動推奨タイミング (gauge 満タン到達想定) |
| 6 | 58-75s | **山** | medium 連続 + 弾密度最大 | 連鎖 Lv up 4-5 chain 推奨、A-6(a) 180F cap 到達狙い |
| 7 | 75-90s | **終端** | medium 1 体 + 弾密度低下 | クリアまでの余韻、終端明示 |

### v07 での物理化方針

`spawnWave1..4` (v06) を `spawnPhase1..7` に再編。各 phase 関数内で「主要敵」「弾パターン」「間引き条件」を定数化。phase 切り替えは `state.t` を `[0, 240, 720, 1500, 2400, 3480, 4500, 5400]` の境界で判定 (60fps × 秒 = frame)。

- v07 では **spawn テーブル定義のみ commit**、phase 関数の中身は v06 spawnWave 系の延長で済む部分は移植
- bell_log への意図的同型 (Log bell_log の 7 区分構造) — 同じ世界モデルを別ゲームで採るのは feedback_clone_strategy.md t:5 「同じ型を別ゲームで縦深化」と整合

## 観点 7: 180F cap reached 時の大成功反応

### Log_cdx 観点 7 引用

> 「気持ちよさ = 6 種反応分離 (小成功/大成功/被弾/失敗/クリア/タイムアウト)」「それぞれに、見た瞬間に分かる反応を置く…粒子や破片が出る…小型と大型で反応の大きさが違う」

### v06 の穴

A-6(a) で 180F cap (3 秒連鎖無敵) を新設したのに **cap 到達時の祝福が無い** → 核体験 (chain 連鎖) の頂点が祝われていない。R-A 「一番楽しい瞬間を強化する」観点で取りこぼし。

### v07 での物理化方針

`onGraze()` Lv up ブロック内で `state.invincibleT` が `BUZZ_INVINCIBLE_CAP (=180)` に到達した瞬間 (= cap reached event) を検出し、以下を発火:

1. **画面 flash** — 金色 (#ffe040) alpha 0.5 → 0 を 20F フェード
2. **大型 ring 演出** — 自機中心に半径 12 → 60 を 30F で膨張する太い ring (黄金色)
3. **popup** — `'MAX CHAIN!'` を画面中央上部に 60F 表示
4. **音的演出は無し** (graze_log は無音ゲームのまま維持)

cap reached は 1 ゲーム中 0〜数回しか発生しないレアイベント → 大型演出を置いても画面情報密度を破壊しない (v06 self_judgment §良いと確信できない条件 #1 とのバランス)。

### 削除可能性

`onGraze()` Lv up ブロックに cap 検出分岐 ~8 行 + `draw()` に flash/ring/popup 描画 ~12 行 = 約 20 行。戻し方: 20 行削除で v06 等価。

## 観点 8: bad policy headless (route/camper/panic/novice 4 方針) を物理化

### Log_cdx 観点 8 引用

> 「悪い方針: ほぼ動かない / ランダムに動く / 中心システムを使わない / 中心システムを意味のないタイミングで連打する / 画面上の対象物マーカーや敵の意図を見ない…良い方針が安定し、悪い方針が不安定になる状態を目指す」

### Log graze_log_cdx 先行 (v05_1_cdx_v77〜v81)

Log は graze_log_cdx 側で 4 方針 headless を v05_1_cdx の v77-v81 で物理化済 (route/camper/panic/novice)。Ash 側 graze_log は **数値根拠としての headless は使わない** (`feedback_headless_unfit_for_unfinished_eval.md` t:5) が、**bad policy headless 構造判定 (核機構が dominant strategy creep していないか)** は数値根拠の話とは別軸。

### v07 での物理化方針

`game/graze_log/v07/headless.py` を新設。4 方針 AI agent を実装し、各方針で 100 試行を回す:

- **route**: 画面下半分を 8 字経路で動き続ける (Psyvariar 想定良方針)
- **camper**: 画面下端中央に張り付く (graze 機会捨て、被弾も少ない)
- **panic**: gauge 満タン到達と同時に BOMB → Hyper 発動 (Hyper を使いどころ無視で消費)
- **novice**: ランダム移動 + 弾を見ない (R-A の「良い方針が安定、悪い方針が不安定」検証用)

### 判定軸 (数値根拠としてではなく構造判定として)

- **route が最も生存秒/score 高** であれば、A-6(b) の Volguard 罠予防 (擦る方が得) は機構として効いている
- **camper が route と同等** であれば、「擦らない方が得」が再起している shallow design
- **panic が route を大きく下回る** であれば、Hyper の発動タイミング判断が core mechanic として効いている
- **novice が最低** であれば、視認 (anticipation/telegraph/windup/wobble) が核機構として効いている

数値の絶対値は判定根拠としない。**4 方針間の relative order が「想定通りか」** のみを構造判定の signal として使う。Nao_u プレイ評価/cross_review に出す材料には **しない** (`feedback_headless_unfit_for_unfinished_eval.md` t:5 厳守)。

### 削除可能性

`headless.py` は独立ファイルなのでファイル単位削除で完全戻し可能。

## 戻し方 (v07 → v06 完全戻し可能性の保証)

v07 → v06 への巻き戻しは:

1. `game/graze_log/v07/` ディレクトリを丸ごと削除 → v06 完全等価
2. v06 ファイル群は v07 で一切編集しない (本 README + index.html + headless.py + 関連ファイルは v07/ 内に閉じる)

これにより「経路B 失敗時に v06 (経路A 縦深化 6 機構) に戻る」経路を物理的に保証する。feedback_clone_strategy.md t:5 「型を獲得する一連のフロー、守は通過点」の戻り経路。

## 着手手順 (本 README 確定後の実装サイクル割り当て)

本 README は **v07 着手の起点を物理的に確定する** ことが目的。実装は次サイクル以降に 1 機構ずつ刻む:

- **次サイクル**: B-2 核機構 (Hyper Activation: gauge 共用判定 + 全画面弾消去 + Large Star 演出) を index.html に実装、commit `ash: graze_log v07 B-2 Hyper Activation 実装`
- **次々サイクル**: 観点 3 (弾側マーカー) を実装
- **3 サイクル後**: 観点 7 (180F cap reached 大成功反応) を実装
- **4 サイクル後**: 観点 6 (7 区分 spawn テーブル) を実装 — README で明文化済の spawn テーブルを spawnPhase1..7 関数として物理化
- **5 サイクル後**: 観点 8 (headless.py 4 方針) を実装

「1 機構刻み」の各サイクル末に v06 → v07 への戻し方を維持。

## 判定方針

**headless 数値 (到達率/生存秒/成功率) は judgment / cross_review / Slack の根拠にしない** (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。観点 8 の headless は **4 方針 relative order の構造判定** にのみ使う。Nao_u プレイ評価には絶対値を持ち込まない。

**self_judgment.md / predicted_play.md は v07 内で機構実装ごとに更新**。1 機構実装 commit と self_judgment 更新を **同サイクル内** で閉じる (v06 で「Nao_u 評価未受領のまま 5 世代積む」R-E レッドゾーンに再突入しないため)。

## 接続先

- `game/graze_log/v06/README.md` — 6 機構 (A-1+/A-3/A-4/A-5(b)/A-6(a)/A-6(b)) 完成版
- `game/graze_log/v06/self_judgment.md` — v07 経路B 着手意思決定根拠の元文書 (2026-05-26 C198+ commit 0d6c1bf9f)
- `game/graze_log/v06/brainstorm.md` §B-2 — Hyper Activation 機構案の原案 (MPS 9/15、差分 18 行範囲内)
- `game/graze_log/v04/prior_art_30.md` — 30 件既検証の引用付き先行事例集 (DaiOuJou 事例3 含む)
- `log/slack_archive/game-rights.jsonl` ts=1779658696-8705 — Log_cdx メタプロンプト 1-8 原文
- `log/slack_archive/game-rights.jsonl` ts=1779659902.176799 — Log R-A〜R-I マッピング原文
- `log/nao_u_live.md` L170-183 — Nao_u v02 評価 2026-05-04 05:08 原文 (体験判定の起点)
- `memory/game_lessons_log.md` R-A〜R-I — Ash/Log 共有抽象ルール
- `memory/feedback_clone_strategy.md` t:5 — 守の段階 1 機構刻み制約、戻し方保証
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1-4 予測責任の連続体、本 v07 は Stage 4 自判定結論に物理的責任を載せる
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 観点 8 headless は relative order 構造判定のみ
- `memory/feedback_means_ends_reversal_check.md` t:5 — playable diff 第一義原則、本 v07 README は次サイクル以降の playable 着手の起点
- `memory/feedback_prior_art_citation_must_verify.md` t:5 — M-41、B-2 の DoDonPachi SaiDaiOuJou / DaiOuJou / ESPgaluda 引用文付き

— Ash (Win2) 2026-05-26 C198+ Phase 4 大作業 (v07 経路B 着手起点 + 観点 3/6/7/8 統合方針確定)
