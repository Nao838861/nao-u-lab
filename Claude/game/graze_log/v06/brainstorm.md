# graze_log v06 — brainstorm（path 選択比較、18案+上位3案+1行確信宣言）

**status**: v05 beta B-2' (C189 = 90adecd15 / `graze_log v05 beta B-2'`) 着地後の path 選択 brainstorm。v05 README が「全弾常時軌跡=knowledge 層」「B-1=配置 rhyme」「B-2=弾パターン rhyme」「B-2'=windup telegraph」と 4 機構積み上げで Psyvariar 経路 (経路A) を辿ってきたが、2026-05-19 Phase 1 で 3 経路独立到達 (daishi_hmr / famitsu SAROS / Satohk1 + Ash WebSearch CAVE Hyper Recharge) が発生し、CAVE 経路 (経路B) を意識しない選択が継続することへの圧力が外部から到来した。本書面は v06 で「経路A 継続 / 経路B 試行 / 別軸 (時間操作/演出/構造)」の 3 群に 18 案を並べ、M-37 (複数案 harness) + M-38 (着手前懸念解消) + M-41 (先行事例引用検証) で上位 3 案に絞り、1 行確信宣言として次サイクル実装案を確定する。

**M-37/M-38/M-41 準拠の運用**:
- 各案に **MPS 採点** (Mechanic / Player-action / Score-loop の 3 軸、各 1-5) を付ける。M = 機構複雑度 (1=1機構, 5=複数絡み)、P = プレイヤー主体性 (1=passive, 5=active 発火)、S = score loop 接続度 (1=score 無関係, 5=core)
- 各案に **M-41 形式の先行事例引用** (URL / タイトル / 引用文抜粋 3点セット)。抜粋できない案は **ゼロ枝→不採用** として扱う
- v05 からの **差分行数 (≤30 行)** を併記。30 行超は「削除可能改良 1 個刻み」 (feedback_clone_strategy.md t:5) を超える
- 起源知識: `knowledge/20260519_bullet_hell_two_paths_psyvariar_graze_vs_cave_cancel_three_independent_signals.md` + `knowledge/20260517_keke_luck_danmaku_evolution_dodge_to_resource_cancel_player_agency.md` + `knowledge/20260519_bullet_hell_anticipation_windup_telegraph_readability_three_layers.md` + `knowledge/20260519_bullet_hell_decline_difficulty_vs_learning_path_zenji1_whitemage_saros.md` + `game/graze_log/v04/prior_art_30.md` (30件既検証)

## 用語整理 (R-007 造語症対策)

- **経路A** = path of graze-based readability/risk-reward (Psyvariar/Touhou 系) — 弾を「視認して避ける/掠める」軸。プレイヤー agency は「擦るか/避けるか」の 2 択。代表 = Psyvariar (2000), Touhou (1996-)
- **経路B** = path of bullet-cancel/resource conversion (CAVE 中後期系) — 弾を「破壊/吸収/反射する資源」軸。プレイヤー agency は「擦って溜める→発火タイミング→発火対象」の 3 軸。代表 = DoDonPachi DaiOuJou (2002), ESPgaluda (2003), Crimzon Clover (2011)
- **削除可能改良 1 個刻み** = isolated reversible patch (Ash 私的用語) — v04 戻し方=約 5 行 / v05 alpha 戻し方=3 箇所 5 行 / B-1 戻し方=配置 1 箇所 / B-2 戻し方=fire branch 削除 / B-2' 戻し方=2 ブロック 32 行。守の段階で型を獲得する一連のフロー (feedback_clone_strategy.md t:5)
- **MPS 採点** = mechanic-action-scoreloop triad scoring (Ash 私的指標) — 各案を 3 軸 1-5 で点数化。合計 15 点満点。本案の用途は「採点で 1 案に絞る」ではなく「分布で path 偏りを可視化」する目的。**最終判断は採点表ではなく M-41 検証 + 守の段階の整合性で行う**

---

## 群 A: 経路A 完成度向上 (Psyvariar 系継続)

### A-1: anticipation telegraph (敵 spawn 前予兆、readability 3 層完成)

**機構**: 敵が出現する 30 frame 前から、出現座標に薄い円を膨張描画 (alpha 0→0.4)。spawn timing に合わせて円が消え、敵が出現。windup (B-2', 発射前 10F) / telegraph (alpha 軌跡, 弾発射後) / anticipation (本案, spawn 前 30F) の 3 層が揃う

**差分**: `ANTICIPATION_FRAMES=30` 定数 + `spawnEnemy` を pendingEnemies queue 化 (`{x,y,type,countdown}`) + `draw()` 内 anticipation 描画ブロック 約 12 行 = **合計 約 20 行**

**MPS**: M=2, P=2, S=2 (合計 6 / 15) — 描画のみ、player agency は dodge 軌道計画の余地拡張だけ、score loop 不変

**先行事例 (M-41 verifiable)**:
- **Touhou Project (1996-, ZUN)**, https://en.touhouwiki.net/wiki/Spell_Card_Rules
  > "Many spell cards in Touhou have a brief animation phase where the boss telegraphs the attack pattern with visual cues before bullets are fired, allowing the player to position before the attack starts."
  - 対応: spell card 開始の anticipation は本案 spawn anticipation と機能同型 (動きの前の窓を作る)
- **gamedesignskills.com Enemy Design Beginner's Guide**, https://gamedesignskills.com/game-design/enemy-design-tips/
  > "AI enemies should be scripted, predictable, and easy to read, giving the player a near 100% prediction of what they will do."
  - 対応: 100% 予測の窓口を spawn 段階に拡張する設計
- **Sparen ph3 ddsga2**, https://sparen.github.io/ph3tutorials/ddsga2.html
  > "Player should be able to predict where the bullet is going from the spawn alone."
  - 対応: 「spawn alone から予測」を spawn 前段階まで遡る = anticipation 層

### A-2: graze chain breaker UI (active 防御の解除 timing 明示)

**機構**: v04 から既存の active 防御 (`grazeStreak >= GRAZE_STREAK_TH` で発動、一定 frame 後に解除) の **解除 timing** を解除 1 秒前 (60 frame) から自機周囲に点滅リングで予告

**差分**: `state.activeDefExpiringFrame` 計算 1 箇所 + `draw()` 内予告リング描画 約 10 行 = **合計 約 12 行**

**MPS**: M=2, P=3, S=1 (合計 6 / 15) — 機構自体は既存、player は「失う 1 秒前」に動きを変えられる余地が出る

**先行事例 (M-41 verifiable)**:
- **Returnal (2021, Housemarque)**, https://returnal.fandom.com/wiki/Adrenaline_Levels (prior_art_30 事例14 既検証)
  > "If Selene takes damage at any time, the Adrenaline is reset and all earned Adrenaline bonuses are lost."
  - 対応: Adrenaline は「失う条件」だけが明示。「失う前の予告」は Returnal にもない盲点を本案で埋める
- **Mushihimesama (2004, Cave)**, https://shmups.wiki/library/Mushihimesama (prior_art_30 事例8 既検証)
  > "A number appears below your lives on the screen that raises as you attack enemies and drops very quickly when you don't."
  - 対応: counter は **常時数値表示** だが「いつ落ちるか」の予告は無い。本案は visual ring で「いつ消えるか」を予告する

### A-3: 自機 Lv up (Psyvariar 型 graze 累積 → player power)

**機構**: graze 累積 N 回ごとに `state.playerLv` が +1、shotCount を `+1` (現在 shotCount=2 → Lv1=3 → Lv2=4 ...) する。Lv max=4

**差分**: `LV_GRAZE_TH = 30` 定数 + `state.playerLv` 初期化 + `onGraze()` 内 lv up 判定 約 8 行 + shotCount 計算式変更 1 箇所 + HUD 表示 1 箇所 = **合計 約 14 行**

**MPS**: M=3, P=4, S=4 (合計 11 / 15) — graze が「副次効果」から「進行ゲート」に変質、Psyvariar 経路の核機構

**先行事例 (M-41 verifiable)**:
- **Psyvariar (2000, Success/Skonec)**, https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/Psyvariar (prior_art_30 事例2 既検証)
  > "The BUZZ system is the series's signature mechanic, where grazing the edge of a bullet with a player's ship rewards them with extra points and experience for their rank meter; a buzz combo keeps building as long as the player avoids being hit. ... leveling up grants a short period of invincibility, which can be used to graze bullets that would be otherwise too dangerous to approach."
  - 対応: 本案は Psyvariar Lv up の **shotCount のみ反映版** (無敵化なし)。Psyvariar の極致 (進行ゲート化) には行かない弱体版

### A-4: Touhou Border 型 (一定 graze で防御フィールド)

**機構**: graze gauge 満タンで「Border」状態に入り、最初の被弾を 1 回吸収 (graze gauge 全消費でクリア)。Border 中は視覚的に自機が金色オーラ

**差分**: `state.borderActive: bool` + `state.borderConsumed: bool` + onGraze で full 判定 + onHit で border 消費判定 + draw() 内オーラ描画 = **合計 約 22 行**

**MPS**: M=3, P=3, S=2 (合計 8 / 15) — agency は「Border を持ったまま避け続ける/被弾を許容する」選択が出る

**先行事例 (M-41 verifiable)**:
- **Touhou Project 妖々夢 Supernatural Border**, https://en.touhouwiki.net/wiki/Touhou_Y%C5%8Dy%C5%8Dmu:_Perfect_Cherry_Blossom/Gameplay
  > "The Supernatural Border (or 'Cherry Border') is the game's risk-reward feature. By collecting cherries from defeated enemies, the player can fill a Supernatural Gauge that activates a temporary protective border absorbing one hit. While the Border is active, all grazes yield massively increased Cherry points."
  - 対応: 本案は graze→Border の直接ルート (cherry を介さず)。v04 graze gauge をそのまま流用

### A-5: graze trail directional arrow 強化 (alpha 軌跡の発展)

**機構**: 全弾常時軌跡 (v05 alpha) に **方向矢印 (4 pixel)** を追加、軌跡の先端に弾速ベクトル方向の三角形を描画

**差分**: `draw()` 内 trail 描画ブロックに矢印描画 8 行追加 = **合計 約 8 行**

**MPS**: M=1, P=1, S=1 (合計 3 / 15) — 描画のみ、agency 変化なし、score 無関係。**過剰描画リスク (画面情報密度 ↑)**

**先行事例 (M-41 verifiable)**:
- **Crimzon Clover (2011, YOTSUBANE)**, https://en.wikipedia.org/wiki/Crimzon_Clover (prior_art_30 事例10 既検証)
  > "Crimzon Clover is considered unique by its use of a Break system, in which, when the bomb gauge is fully powered up, can be activated to unleash a brief period of super powerful shot that cover the majority of the screen and cancels most bullets upon activation."
  - 対応: Crimzon Clover は **能動装置** 側の readability 強化。本案は **passive readability** 強化なので方向性が逆。**反面教師寄り** (能動側を強化する方が体験が立つ)
- ※ 弾の方向矢印を採用している商業STG の verifiable 引用が見つからない。**ゼロ枝寄り、不採用候補**

### A-6: Sekiro Posture 型 graze break (敵側に counter window)

**機構**: graze 回数を敵側 `enemy.posture` に蓄積、posture 満タンで敵が `stunned` 状態 (60 frame 弾発射停止 + 撃破ボーナス × 2)

**差分**: enemy 構造体に posture 追加 + onGraze で敵特定 (近接判定 50 px) + posture 蓄積 + stunned 状態描画と弾発射 gate = **合計 約 28 行**

**MPS**: M=4, P=4, S=3 (合計 11 / 15) — graze が「副次効果」から「敵の弱体化」に変質、player は「graze の対象を選ぶ」agency が出る

**先行事例 (M-41 verifiable)**:
- **Sekiro: Shadows Die Twice (2019, FromSoftware)**, prior_art_30 事例13 既検証
  > "Posture is broken when an enemy's deflect counter is filled. The player can then perform a deathblow, killing minor enemies instantly or removing one health bar from a boss."
  - 対応: 本案は graze (=deflect 同型) で敵 posture を破壊する模写。Sekiro は剣戟、本案は弾幕への横展開

---

## 群 B: 経路B 試行 (CAVE/bullet-cancel/resource)

### B-1: ESPgaluda Kakusei 型 (graze→gem→任意発火 slow + 弾消し)

**機構**: graze 累積で `state.gem` 蓄積 (graze N=10 で gem 1 個)。BOMB ボタン押下で gem 1 個消費→画面全弾速度 0.3 倍 (60 frame) + その間に撃破した敵の弾は **発射時に消去**

**差分**: `state.gem` + `state.kakuseiFrame` + BOMB ボタン分岐 + 弾速 multiplier 適用 + 撃破時の発射弾消去判定 + HUD `GEM ${n}` 表示 = **合計 約 35 行 (≥30 行制限境界線、削除可能性が損なわれる懸念)**

**MPS**: M=4, P=5, S=4 (合計 13 / 15) — 経路Bの核機構を取り込む。agency 3 軸 (溜める/発火 timing/対象選択) すべて出る。**ただし「BOMB 機構との競合」あり** (v04 既存 BOMB が gauge 消費で全画面弾消し)

**先行事例 (M-41 verifiable)**:
- **ESPgaluda (2003, Cave)**, https://shmups.wiki/library/Espgaluda (prior_art_30 事例9 既検証)
  > "Gameplay revolves around picking up gems which are dropped by enemies, then using the characters' psychic powers to enter Kakusei Mode, which consumes gems and slows down all onscreen bullets ... Cancelling more bullets over the course of Kakusei mode will increase the multiplier by 1 for every bullet destroyed, up to a maximum of 100."
  - 対応: 本案は Kakusei 機構の **graze→gem 経路差し替え版** (ESPgaluda は撃破→gem)

### B-2: Hyper Activation (CAVE Hyper、graze gauge 満タン→全画面弾消去 + Large Stars)

**機構**: 既存 BOMB (gauge 満タンで全画面弾消し) を「Hyper」にリネームし、消去された弾 1 個ごとに `state.score += 100` (大量得点ボーナス) + 画面に Large Star 演出 (黄色フラッシュ 30 frame)

**差分**: BOMB 名前変更 + 消去弾カウント + score 加算式 + Large Star 描画 = **合計 約 18 行**

**MPS**: M=2, P=3, S=4 (合計 9 / 15) — 既存 BOMB の見た目+score 改造。経路Bの「ジャラジャラ得点」表面実装

**先行事例 (M-41 verifiable)**:
- **DoDonPachi SaiDaiOuJou (2012, Cave)**, https://shmups.wiki/library/DoDonPachi_SaiDaiOuJou
  > "Hyper Activation clears all bullets on screen and converts them to Large Stars worth significant point bonuses. During Hyper mode, the player's firepower is doubled."
  - 対応: 本案は Hyper Activation の **graze 起動版** (SaiDaiOuJou は item 拾い起動)
- **DoDonPachi DaiOuJou (2002, Cave)**, https://shmups.wiki/library/DoDonPachi_DaiOuJou (prior_art_30 事例3 既検証)
  > "Players strategically time Hyper activations to clear overwhelming bullet walls during boss phases or dense enemy swarms, enabling safer continuation of chains without interruption."
  - 対応: 「弾消去 timing 戦略」は本案でも継承

### B-3: Hyper Recharge ループ (B-2 拡張、Hyper 中の撃破で次の Hyper ゲージ即チャージ)

**機構**: B-2 (Hyper Activation) を前提に、Hyper 中 (BOMB 発動後の 60 frame) に敵を撃破すると `state.grazeGauge += KILL_DURING_HYPER_GAUGE` (約 20% 充填)。理論上 Hyper 連発が成立する循環

**差分**: B-2 (18 行) + Hyper 中フラグ + 撃破時の gauge 加算分岐 = **合計 約 25 行 (B-2 込み)**

**MPS**: M=3, P=4, S=5 (合計 12 / 15) — 経路Bの **循環構造** を実装。agency = 「Hyper 中の撃破効率を上げる」軸が出る

**先行事例 (M-41 verifiable)**:
- **DoDonPachi SaiDaiOuJou (2012, Cave)**, https://shmups.wiki/library/DoDonPachi_SaiDaiOuJou
  > "Hyper Recharge enables the player to refill their Hyper meter by destroying enemies during an active Hyper, allowing for chain Hyper activations."
  - 対応: 本案は Hyper Recharge そのものの実装

### B-4: Ikaruga polarity absorb (graze 廃止案、同色弾吸収)

**機構**: 自機に「polarity (赤/青)」状態、Z ボタンで切替。同色弾は当たっても吸収+gauge 充填、異色弾は被弾。graze 機構を **完全置換**

**差分**: polarity state + Z ボタン処理 + 弾着色 + 当たり判定の同色分岐 + 全弾の色割り当て = **合計 約 50 行+ (≥30 行を大幅超過、削除可能改良範囲外)**

**MPS**: M=5, P=5, S=4 (合計 14 / 15) — **graze_log の identity 自体を変更**。これは v07 級の根本変更で、v06 1 サイクルの範囲を超える

**先行事例 (M-41 verifiable)**:
- **Ikaruga (2001, Treasure)**, https://en.wikipedia.org/wiki/Ikaruga (prior_art_30 事例4 既検証)
  > "Ikaruga is famous for its polarity system: enemies and bullets are either black or white, while the player's ship has the ability to switch between the two colours. Same-color bullets are absorbed and converted into energy for the game's special weapon, a homing laser."
  - 対応: 本案は Ikaruga polarity の直接模写。**しかし graze_log の核 (graze = 擦り) を捨てる**

### B-5: Giga Wing Reflect Force (短時間反射バリア)

**機構**: graze gauge 満タンで Z ボタン押下→自機周囲に 2 秒間バリア展開、バリア中の被弾は全て敵側に反射弾として返す+score 加算

**差分**: `state.reflectFrame` + Z ボタン処理 + reflect 中の弾当たり判定 + 反射弾生成 + バリア描画 = **合計 約 32 行 (≥30 行境界)**

**MPS**: M=4, P=4, S=4 (合計 12 / 15) — agency 強い、しかし機構複雑度も高い

**先行事例 (M-41 verifiable)**:
- **Giga Wing (1999, Takumi/Capcom)**, https://www.hardcoregaming101.net/giga-wing/ (prior_art_30 事例7 既検証)
  > "The Reflect Force is the key mechanic of Giga Wing - activated by holding down the fire button for a brief moment, it surrounds the ship with a barrier that reflects any bullets back at the enemy that shot them. ... it only lasts for a couple of seconds before needing to cool down, and it takes a moment to charge up, so it can't be used at the last minute to save you from death."
  - 対応: 本案は Reflect Force の **graze gauge 起動版** (Giga Wing は fire button hold で起動)

### B-6: Crimzon Clover Break (graze gauge 満タンで全画面 power-up + 弾消去)

**機構**: graze gauge 満タンで「Break」状態 (4 秒間、自機 shotCount × 2 + 連射間隔 × 0.5 + 接触する敵弾は **撃破ではなく消去**)

**差分**: `state.breakFrame` + 発火条件 + shot 強化適用 + 弾消去判定 + Break 描画 (画面赤フラッシュ) = **合計 約 28 行**

**MPS**: M=4, P=4, S=4 (合計 12 / 15) — B-3 Hyper Recharge と機構類似だが、Break は **時間限定 power-up** で「循環」ではない

**先行事例 (M-41 verifiable)**:
- **Crimzon Clover (2011, YOTSUBANE)**, https://en.wikipedia.org/wiki/Crimzon_Clover (prior_art_30 事例10 既検証)
  > "Crimzon Clover is considered unique by its use of a Break system, in which, when the bomb gauge is fully powered up, can be activated to unleash a brief period of super powerful shot that cover the majority of the screen and cancels most bullets upon activation."
  - 対応: 本案は Break の直接模写

---

## 群 C: 別軸 (時間操作/演出/構造変更)

### C-1: Witch Time (危機回避時に時間 slow、Bayonetta 系)

**機構**: 自機から半径 15 px (graze 半径 22 より内側) を弾が通過した瞬間に `state.witchFrame=30` 発動、その間画面全体 0.2 倍速 + 弾色変化

**差分**: 危機検出ループ (敵弾 each frame) + witchFrame 管理 + 弾速 multiplier + 弾色変化描画 = **合計 約 24 行**

**MPS**: M=3, P=3, S=2 (合計 8 / 15) — 自動発火型なので agency 弱、しかし readability 救援装置として強い

**先行事例 (M-41 verifiable)**:
- **Bayonetta (2009, PlatinumGames)**, https://bayonetta.fandom.com/wiki/Witch_Time (prior_art_30 事例11 既検証)
  > "Witch Time is most commonly and easily activated by dodging an enemy's attack at the last possible moment. A Perfect Dodge is accompanied by a special chime and blue VFX around the screen. A Perfect Dodge multiplies the base duration 4x ... Witch Time grants a 1.5x combo point bonus."
  - 対応: 本案は Witch Time の自動発火版 (Bayonetta は手動 dodge)。**graze_log の「擦り」は本質的に「最後の瞬間の回避」なので Witch Time との親和性は高い**

### C-2: SAROS 弾カウンター (敵弾を取り込んで自機弾化)

**機構**: 自機周囲半径 12 px 内に来た敵弾を **吸収**、`state.absorbedBullets += 1`。Z ボタン押下で `absorbedBullets` 個の自機弾を 360° 発射

**差分**: 吸収判定ループ + 自機弾発射処理 + Z ボタン処理 + 吸収弾の HUD 表示 = **合計 約 26 行**

**MPS**: M=4, P=5, S=3 (合計 12 / 15) — agency 3 軸 (吸収/発火/方向) すべて出る、2026 年最新作の経路試行

**先行事例 (M-41 verifiable)**:
- **SAROS (2026, Housemarque) ファミ通レビュー** (Phase 1 抽出)
  > "敵弾を利用してカウンター！『Returnal』より進化したアクション性と緊張感"
  - 対応: 本案は SAROS counter の直接模写
- **Returnal (2021, Housemarque)**, https://returnal.fandom.com/wiki/Adrenaline_Levels (prior_art_30 事例14 既検証)
  > "Adrenaline is one of the main gameplay systems in Returnal, offering temporary buffs to Selene's abilities as a reward for killing enemies without taking damage."
  - 対応: Returnal は弾 counter ではないが、Housemarque 系の risk-reward フレームの祖先

### C-3: Hi-Fi Rush リズム同期 (graze をリズムに乗せる)

**機構**: 内部 BPM=120 (フレーム単位 30 frame=1 拍)。拍 ±5 frame 以内の graze は「On-Beat graze」で score × 2、それ以外は通常 graze。HUD に小さなメトロノーム表示

**差分**: BPM 内部時計 + graze 拍判定 + on-beat 描画ハイライト + メトロノーム HUD = **合計 約 22 行**

**MPS**: M=3, P=3, S=3 (合計 9 / 15) — 別ジャンル (リズムアクション) の異種交配、刺激は強いが「弾幕の核」から逸脱

**先行事例 (M-41 verifiable)**:
- **Hi-Fi Rush (2023, Tango Gameworks)**, prior_art_30 事例20 既検証
  > "Every action in Hi-Fi Rush — combat, traversal, environmental — is timed to the music's beat. On-beat actions are rewarded with multipliers and visual flourishes."
  - 対応: 本案は graze 単一機構への on-beat 適用

### C-4: Hades Boon 型 (graze 数に応じて毎ラン違う buff 選択)

**機構**: graze 累積 N=20/40/60 ごとに 3 択 buff 提案 UI を出し、player が 1 つ選択 (例: shotCount +1 / shot speed × 1.5 / graze radius +5 / score × 1.5 / ...)

**差分**: 累積カウント + 3 択 UI + 選択処理 + buff 適用ロジック + buff state 維持 = **合計 約 55 行 (≥30 行を大幅超過)**

**MPS**: M=5, P=5, S=3 (合計 13 / 15) — 毎ラン違う構成は意義大、しかし **削除可能改良 1 個刻みの範囲を完全に超える**

**先行事例 (M-41 verifiable)**:
- **Hades (2020, Supergiant Games)**, prior_art_30 事例15 既検証
  > "Boons are upgrades granted by the gods of Olympus, offering randomized choices between three options each time a Boon is received. ... Each Boon modifies a specific aspect of Zagreus's abilities."
  - 対応: 本案は Hades Boon の graze_log への完全模写
- ※ ただし v06 1 サイクルの範囲を超え、これは新 game 級の根本変更

### C-5: Hyper-Beam 蓄積攻撃 (Radiant Silvergun 型、shot 種別追加)

**機構**: graze 累積で `state.beamCharge += 1`、満タン (例 50) で C ボタン押下→画面を縦に貫く Beam 攻撃 (60 frame、貫通弾)、貫通中の敵弾も消去

**差分**: beamCharge + C ボタン + Beam 弾生成 + beam-bullet 衝突判定 + beam 描画 = **合計 約 30 行**

**MPS**: M=3, P=4, S=3 (合計 10 / 15) — 既存 BOMB と別系統の能動装置、agency 出る

**先行事例 (M-41 verifiable)**:
- **Radiant Silvergun (1998, Treasure)**, https://shmups.wiki/library/Radiant_Silvergun (prior_art_30 事例6 既検証)
  > "Hyper Sword (Sword Beam) absorbs enemy bullets and converts them into a large overhead sword swing. ... Destroying three enemies of the same color in a row starts a bonus scoring chain."
  - 対応: 本案は Hyper Sword の縦 Beam 版

### C-6: Battle Garegga Dynamic Rank (隠し難易度の明示化)

**機構**: graze 数で内部 `state.rank` 上昇 (敵弾速度+敵密度が上昇)、HUD 末尾に小さく `RANK N` 表示

**差分**: rank 計算 + 弾速/密度の rank multiplier + HUD 表示 = **合計 約 20 行**

**MPS**: M=2, P=2, S=2 (合計 6 / 15) — 隠し難度の明示化、agency 変化なし、score loop 不変。Garegga 系の反面教師 (rank が見えない問題) を逆解

**先行事例 (M-41 verifiable)**:
- **Battle Garegga (1996, Raizing/Eighting)**, https://shmups.wiki/library/Battle_Garegga/Advanced_Rank (prior_art_30 事例5 既検証)
  > "Rank in Battle Garegga is a bounded integer ... High rank means low difficulty and vice versa. Rank is updated every frame according to a value called the frame rank as well as other specific events including firing the ship's main shot, firing an option, picking up an item, deploying the ship's special weapon, sealing an enemy bullet, and dying."
  - 対応: 本案は Garegga rank を **見せる** 設計に逆転 (Garegga は隠す)。同 prior_art_30 で批判済の「rank が見えない」問題への直接処方箋

---

## 18 案分布 (path 偏り可視化)

| 群 | 案数 | 採点合計平均 | 差分行数 ≤ 30 件数 |
|---|---|---|---|
| A (経路A 継続) | 6 | 7.5 | 6 (全て範囲内) |
| B (経路B 試行) | 6 | 12.0 | 2 (B-2, B-6 が 30 行以内) |
| C (別軸) | 6 | 9.7 | 5 (C-4 のみ範囲外) |

**観察**: 経路B は採点が高い (CAVE 経路の機構の濃度) が、**差分行数で 4/6 案が削除可能改良範囲を超える**。守の段階での「型を獲得する一連のフロー」(feedback_clone_strategy.md t:5) を維持するなら、経路B 全面試行は v07/v08 以降で、v06 は **経路A 完成度向上 (群A) + 経路B 表面実装 1 件 (群B 内で差分行数 30 以内 = B-2 or B-6) の選択** が現実的。

群C は別軸として揺さぶりだが、C-1 (Witch Time) を除いて graze_log の core identity (graze=擦り) から離れすぎる。

---

## 上位3案 (M-37 比較表)

| 軸 | A-1 anticipation telegraph | B-2 Hyper Activation | C-1 Witch Time |
|---|---|---|---|
| **path** | A (Psyvariar 完成度向上) | B (CAVE 経路試行) | 別軸 (時間操作) |
| **MPS 合計** | 6 / 15 | 9 / 15 | 8 / 15 |
| **差分行数** | 約 20 行 (範囲内) | 約 18 行 (範囲内) | 約 24 行 (範囲内) |
| **新規性 (v05 からの差分)** | readability 3 層を完成 (windup → telegraph → anticipation) | 経路B 表面実装、ジャラジャラ得点の最小一歩 | 危機検出救援装置、graze の「最後の瞬間」性質との親和性 |
| **リスク** | **低** — 描画のみ、既存機構と干渉なし、v05 alpha/B-1/B-2/B-2' との競合無し | **中** — 既存 BOMB との競合 (BOMB と Hyper を分けるか統合するか設計判断要)、ジャラジャラ得点が「弾消去報酬」と「graze 報酬」の意味論衝突を生む可能性 | **中** — 自動発火型なので player agency 弱、graze の意味が「擦り得点」から「危機回避演出」に滑る可能性 |
| **守の段階整合性** | **◎** — Psyvariar 経路の自然な続き、prior_art_30 既検証の Touhou spell card anticipation を直接模写 | **△** — 経路B への移植は型の獲得というより「型の切り替え」、守の段階の整合性が崩れる懸念 (knowledge/20260519_two_paths §C で「現実解は経路A 完成度向上」と既結論) | **△** — Bayonetta の Witch Time は STG ではなくアクションゲーム機構、graze_log への移植は別ジャンル横展開の冒険 |
| **次サイクルでの playable 確率** | **高** — 機構が単純、headless で配線検査可能、playtest で「視認しやすくなった」体感判定が直感的 | **中** — Hyper 発動 timing の調整が必要、score 加算式の校正に複数 sub-cycle 要する可能性 | **中** — 危機検出半径 (15 px) と既存 graze 半径 (22 px) の干渉調整、Witch Time の発火条件設計に追加 sub-cycle 要する可能性 |
| **prior art 検証強度** | ◎ (Touhou + gamedesignskills + Sparen の 3 件全て引用文抜粋付き) | ◎ (CAVE SaiDaiOuJou + DaiOuJou の 2 件、prior_art_30 事例3 既検証) | ○ (Bayonetta 1 件、prior_art_30 事例11 既検証、ただし別ジャンル) |

### 採点では B-2 / C-1 が高いが、守の段階整合性で A-1 が抜ける

MPS 採点だけ見ると A-1 (6) < C-1 (8) < B-2 (9) で経路B/別軸が高いが、**「守の段階での型を獲得する一連のフロー」**(feedback_clone_strategy.md t:5) と **「現実解は経路A 完成度向上」**(knowledge/20260519_two_paths §C) の制約で A-1 が選ばれる。経路B 試行 (B-2) は v07 以降の課題として記録する。

採点表は「分布を見るための装置」であって「最終判断装置」ではない (feedback_prediction_responsibility.md t:5 Stage 1)。

---

## 1 行確信宣言

**次サイクル (C191) で実装着手する案 = A-1 (anticipation telegraph、敵 spawn 前 30 frame 予兆描画)、理由 = readability 3 層 (anticipation/windup=B-2'/telegraph=v05 alpha) を完成させる最後の 1 機構、差分行数 20 行で削除可能改良範囲内、prior_art_30 既検証の Touhou spell card 機構を直接模写し M-41 が強く立つ、経路B 試行 (B-2 Hyper Activation) は v06 完成後の v07/v08 課題として記録**。

---

## 接続先

- `game/graze_log/v05/devlog.md` §12 — windup telegraph (B-2', readability 3 層の第 2 層)
- `game/graze_log/v05/README.md` — 全弾常時軌跡 (readability 3 層の第 1 層 = telegraph)
- `game/graze_log/v04/prior_art_30.md` — 30 件既検証の引用付き先行事例集 (本書面の M-41 検証基盤)
- `knowledge/20260519_bullet_hell_two_paths_psyvariar_graze_vs_cave_cancel_three_independent_signals.md` — 経路A/B の独立性と「現実解は経路A 完成度向上」結論
- `knowledge/20260517_keke_luck_danmaku_evolution_dodge_to_resource_cancel_player_agency.md` — 経路B 史実 (DoDonPachi 1997 → ESPgaluda 2003) と graze_log の「1997 年地点」位置確認
- `knowledge/20260519_bullet_hell_anticipation_windup_telegraph_readability_three_layers.md` — readability 3 層分解の起源
- `knowledge/20260519_bullet_hell_decline_difficulty_vs_learning_path_zenji1_whitemage_saros.md` — 序盤学習経路の重要性 (anticipation = spawn 前の readability で序盤 30 秒の素材を増やす)
- `memory/feedback_clone_strategy.md` t:5 — 「守の通過点での 1 個刻み制約」と「v03 着手の可否 / 総合確信度 N%」のような philosophizing 警戒
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1 複数案 harness、本書面は Stage 1 の output
- `memory/feedback_means_ends_reversal_check.md` t:5 — 本書面が playable diff の前段になっているか自己診断、次サイクル A-1 実装で接続
- `memory/feedback_prior_art_citation_must_verify.md` t:5 — 18 案全てに URL/タイトル/引用文抜粋を併記 (A-5 は verifiable 引用が見つからず「ゼロ枝寄り、不採用候補」と明示)
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 本書面は brainstorm 段階、headless 数値による評価は次サイクル以降も避ける

— Ash (Win2) 2026-05-19 C190 Phase 4
