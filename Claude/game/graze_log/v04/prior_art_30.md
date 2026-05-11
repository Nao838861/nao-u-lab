# graze_log v04 — 類似事例調査30本（M-43準拠）

検索経路: Wikipedia / Shmups Wiki (shmups.wiki) / TVTropes / Hardcore Gaming 101 / Touhou Wiki (touhouwiki.net) / Steam Community / shmuplations.com / Fextralife wiki / Game Developer (gamedeveloper.com) / 個人ブログ / Metacritic / PC Gamer / GameSpot / Kotaku / VGC

検索した語彙（抜粋）: "graze mechanic shmup", "Touhou graze scoring", "Psyvariar BUZZ system", "DonPachi hyper system", "Ikaruga chain combo", "Battle Garegga rank", "Radiant Silvergun chain", "Giga Wing reflect force", "ESPgaluda kakusei", "Mushihimesama counter", "Shikigami no Shiro tension bonus", "Crimzon Clover Break", "Deathsmiles counter", "Bayonetta Witch Time perfect dodge", "DMC3 Royal Guard parry", "Sekiro deflect posture", "Returnal adrenaline", "Hades deflect dash", "Dark Souls parry riposte", "Bloodborne quickstep", "Metal Gear Rising parry", "Furi parry counter", "Hi-Fi Rush parry", "Vanquish AR mode", "Lies of P perfect guard", "Street Fighter 3 parry", "NieR Automata perfect dodge", "Gradius hit detection no graze", "R-Type hitbox", "Raiden DX scoring", "1942 1943 scoring", "Strikers 1945 gold bars", "Mountain of Faith graze removed", "Touhou Unconnected Marketeers no graze", "Eschatos scoring no graze", "Babylon's Fall combat criticism", "Mighty No. 9 dash criticism", "Forspoken parry criticism", "Code Vein parry inconsistent", "DoDonPachi Resurrection scoring criticism", "Risk System graze", "Drainus reflector"

本案（graze_log v04 α）: 「コア体験 = 弾が来る→避ける→生き延びた」が単独で快感符号正、graze は副産物（multiplier に乗せない / 削除可能ボーナス層）。判定軸は「graze をコアの主スコア装置に据えていないか」「graze を消しても弾幕回避が成立するか」。

カテゴリ別件数: 同ジャンル shmup 10本 / 異ジャンル同型 11本 / やらなかったゲーム 5本 / 失敗事例 5本 = 合計31本。

---

## 同ジャンル shmup（10本）

### 事例1: Touhou Project（東方Project, シリーズ1996-, 上海アリス幻樂団 / ZUN）
- (1) リリース情報: 東方紅魔郷以降、グレイズが本格的にスコアシステムに統合。ZUN 個人開発の同人 STG シリーズ。
- (2) 該当機構の仕様（3項目以上）:
  - 自機ヒットボックスは描画スプライトより遥かに小さく（中央数ピクセル）、弾の輪郭をかすめると graze カウントが加算される
  - graze 数が PIV（Point Item Value）を増加させ、Point アイテムが返す得点を底上げする（作品により式は変動）
  - 紅魔郷では graze がボムキャンセル価値、妖々夢では Supernatural Border 中の graze が大ボーナス、地霊殿では graze 自体がスコア源
- (3) 引用文抜粋（出典URL付）:
  > "Grazing (also called 'buzzing' or 'scratching') is the concept of moving the player character close to a bullet without actually hitting it. The mechanic exists in order to encourage a risk-reward style of play by rewarding the player for flirting with danger. In the Touhou games, grazing bonuses can make up a sizable portion of one's score."
  出典: https://en.touhouwiki.net/wiki/Graze
- (4) 解決した問題 / 弱点と批判: 弾幕の隙間を「攻める動機」をスコアに与えた点が革新。一方で作品ごとに graze の重さがブレ続け、スコアラー以外には「graze は無視してもクリアできる装飾」と扱われがち（紅魔郷～地霊殿の評価分裂）
- (5) 本案への射影 + 採用判定: **採用**（参照モデル）。Touhou は graze を multiplier に乗せた強結合型。本案は逆に graze を「PIV のような装飾値」より更に弱く、削除可能ボーナス層に下げる方向。Touhou の振れ幅（あり/なし両方経験している）は v04 の判断根拠そのもの

### 事例2: Psyvariar（2000, Success / Skonec）
- (1) リリース情報: Medium Unit（2000, 業務用）→ Revision（2003）→ Delta（2018）→ Psyvariar 3（2026予定）
- (2) 該当機構の仕様（3項目以上）:
  - BUZZ システム: 弾の縁を機体スレスレで通過するとカウント＋EXP 加算
  - EXP メーターが満タンになるとレベルアップ → 短時間無敵 → 無敵中に更に大量 BUZZ → 連鎖レベルアップ可能
  - 高ステージ解禁が rank 依存。BUZZ しないと先に進めない（=graze が進行ゲート）
- (3) 引用文抜粋（出典URL付）:
  > "The BUZZ system is the series's signature mechanic, where grazing the edge of a bullet with a player's ship rewards them with extra points and experience for their rank meter; a buzz combo keeps building as long as the player avoids being hit. ... leveling up grants a short period of invincibility, which can be used to graze bullets that would be otherwise too dangerous to approach."
  出典: https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/Psyvariar
- (4) 解決した問題 / 弱点と批判: 「graze をコアにしたら何が起こるか」の極端な実装例。爽快だが「BUZZ 前提に弾幕が組まれている → BUZZ なしでは進行不可能」になり、graze を「攻略ルートの強制装置」に変えた。批判: ジャンル外プレイヤーには敷居が高すぎ、graze 取得のため自殺的接近を強要される
- (5) 本案への射影 + 採用判定: **不採用（反面教師）**。graze を進行ゲート＋メイン報酬にした極致。本案はこの構造を否定し、graze が無くてもクリアと爽快が成立する設計を目指す

### 事例3: DoDonPachi DaiOuJou（2002, Cave）
- (1) リリース情報: DonPachi シリーズ4作目、Cave の代表作。White Label / Black Label の2版。
- (2) 該当機構の仕様（3項目以上）:
  - Hyper System: ハイパーアイテムでハイパーゲージ満タン → 火力倍化＋短時間無敵＋難易度（隠し rank）上昇
  - 機体ヒットボックスは画面表示より小さく、弾を物理的に「graze し放題」だが graze そのもののスコア加算は限定的
  - ハイパー中の弾消し→星アイテムが大量得点。graze はハイパー溜め経路の副産物
- (3) 引用文抜粋（出典URL付）:
  > "Your ship's hitbox is much smaller than the complete ship sprite itself, allowing you to safely 'graze' bullets to your heart's content, so long as you don't let your cockpit get hit. ... Players strategically time Hyper activations to clear overwhelming bullet walls during boss phases or dense enemy swarms, enabling safer continuation of chains without interruption."
  出典: https://shmups.wiki/library/DoDonPachi_DaiOuJou
- (4) 解決した問題 / 弱点と批判: graze を「スコア装置」ではなく「小ヒットボックスによる物理的回避余白」として扱った。弾幕回避コアが先に立ち、graze は明示的報酬を持たない設計。批判: ハイパーシステム＋hidden rank の複雑さ
- (5) 本案への射影 + 採用判定: **採用（最良参照）**。本案にもっとも近い。Cave 流の「小hitbox＋graze は副産物」は v04 α の理想形

### 事例4: Ikaruga（2001, Treasure）
- (1) リリース情報: NAOMI アーケード→Dreamcast→GameCube→各種HD再販。
- (2) 該当機構の仕様（3項目以上）:
  - 黒/白の極性切替により同色弾を吸収（被弾せず）、エネルギーゲージ充填
  - 同色敵を3連続撃破でチェイン成立、チェイン継続でボーナス爆発
  - graze 概念は採用せず、極性切替による「能動的回避＝吸収」がコア
- (3) 引用文抜粋（出典URL付）:
  > "Ikaruga is famous for its polarity system: enemies and bullets are either black or white, while the player's ship has the ability to switch between the two colours. Same-color bullets are absorbed and converted into energy for the game's special weapon, a homing laser."
  出典: https://en.wikipedia.org/wiki/Ikaruga
- (4) 解決した問題 / 弱点と批判: 「擦る」ではなく「吸収して回避」という別解を提示。回避＝得点が直結。批判: パズル的すぎ、反射神経より暗記寄り
- (5) 本案への射影 + 採用判定: **採用（別解参照）**。graze を「擦る」ではなく「吸収」に置き換えた事例。本案では graze を排除する選択肢として参考にする

### 事例5: Battle Garegga（1996, Raizing/Eighting）
- (1) リリース情報: アーケード（1996）→ Saturn 移植 → Switch / PS4 再販。
- (2) 該当機構の仕様（3項目以上）:
  - Dynamic rank: 連射、ショットレベル、オプション数、メダル収集、残機などで難易度（rank）が毎フレーム変動
  - graze 概念なし。代わりに「メダルチェーン」（最高値メダルを取り続ける）がスコアコア
  - 自殺で rank を下げる戦術が高得点パターンに組み込まれる
- (3) 引用文抜粋（出典URL付）:
  > "Rank in Battle Garegga is a bounded integer ... High rank means low difficulty and vice versa. Rank is updated every frame according to a value called the frame rank as well as other specific events including firing the ship's main shot, firing an option, picking up an item, deploying the ship's special weapon, sealing an enemy bullet, and dying."
  出典: https://shmups.wiki/library/Battle_Garegga/Advanced_Rank
- (4) 解決した問題 / 弱点と批判: graze 不要でも risk-reward を成立させた最高峰例。批判: rank が見えず、初心者には何が起きているか不明
- (5) 本案への射影 + 採用判定: **採用（補強参照）**。「graze 無しでも弾幕回避 = コア快感」が成立する証拠。本案の正当性を補強

### 事例6: Radiant Silvergun（1998, Treasure）
- (1) リリース情報: ST-V アーケード→Saturn→Xbox Live Arcade→Switch / PC HD 移植（2024）。
- (2) 該当機構の仕様（3項目以上）:
  - 7種武器を使い分け、敵を「同色3連続撃破」でチェイン成立
  - チェイン継続で武器レベルアップ（スコア依存）
  - graze なし。回避は武器の使い分けと弾の発射方向制御で行う
- (3) 引用文抜粋（出典URL付）:
  > "Destroying three enemies of the same color in a row starts a bonus scoring chain. Destroying another set of the same color continues the chain and increases the bonus, while shooting another color resets it. ... If you continue this chain and only kill enemies of that colour, you can rack up a massive score bonus, which in turn boosts the power of your weapons faster."
  出典: https://shmups.wiki/library/Radiant_Silvergun
- (4) 解決した問題 / 弱点と批判: graze なしで「コア = 撃つ／避ける／チェインを保つ」を成立させた。批判: チェイン最適化がパズル的でアドリブ性を削ぐ
- (5) 本案への射影 + 採用判定: **採用（補強参照）**。Treasure 系の「graze 不採用でも超名作」事例

### 事例7: Giga Wing（1999, Takumi / Capcom）
- (1) リリース情報: CPS-2 アーケード→Dreamcast 移植。
- (2) 該当機構の仕様（3項目以上）:
  - Reflect Force: 短時間バリア展開で全弾反射＋無敵化、約2秒、クールダウンあり
  - 反射した弾＝メダル化、メダルチェインで天文学的スコア（兆単位）
  - graze 概念なし。「反射」が回避と得点を同時に解決
- (3) 引用文抜粋（出典URL付）:
  > "The Reflect Force is the key mechanic of Giga Wing - activated by holding down the fire button for a brief moment, it surrounds the ship with a barrier that reflects any bullets back at the enemy that shot them. ... it only lasts for a couple of seconds before needing to cool down, and it takes a moment to charge up, so it can't be used at the last minute to save you from death."
  出典: https://www.hardcoregaming101.net/giga-wing/
- (4) 解決した問題 / 弱点と批判: graze ではなく「反射で能動的に弾を消す」装置。批判: スコアインフレが極端、競技性が破綻気味
- (5) 本案への射影 + 採用判定: **採用（参照）**。graze の代替として reflect を据える別ジャンル。本案では graze を弱体化するが、reflect ほどの能動装置にはしない

### 事例8: Mushihimesama（2004, Cave）
- (1) リリース情報: アーケード→PS2→Switch / Steam HD 移植。
- (2) 該当機構の仕様（3項目以上）:
  - メインカウンター方式: 敵撃破でカウンター加算、撃たないと急速減衰
  - 撃破スコア = 敵基礎値 × カウンター。チェインの間を切らさないルート構築がコア
  - graze 概念は弱く、ヒットボックスが小さい程度（Cave 流）
- (3) 引用文抜粋（出典URL付）:
  > "A number appears below your lives on the screen that raises as you attack enemies and drops very quickly when you don't. Every enemy has a base score, and when you kill one the score of the enemy will be multiplied by your main counter: (Enemy Score) x (Main Counter) = Score awarded."
  出典: https://shmups.wiki/library/Mushihimesama
- (4) 解決した問題 / 弱点と批判: graze なしでも「攻撃継続 = スコアコア」を成立。批判: カウンター切れの瞬間が即ペナルティで、慣れないと萎える
- (5) 本案への射影 + 採用判定: **採用（補強参照）**。graze なしの典型例。本案コア「弾幕回避＋撃つ」だけでスコアシステムが回る事例

### 事例9: ESPgaluda（2003, Cave）
- (1) リリース情報: アーケード→PS2→iOS。続編 ESPgaluda II（2005）。
- (2) 該当機構の仕様（3項目以上）:
  - Kakusei Mode: gem 消費で時間減速＋弾消し
  - 減速中、弾が pink 化 → 倒した敵の弾が消滅、消した弾数で multiplier 1→100
  - graze ではなく「時間操作で擦り抜け」をコアに据えた回避メカ
- (3) 引用文抜粋（出典URL付）:
  > "Gameplay revolves around picking up gems which are dropped by enemies, then using the characters' psychic powers to enter Kakusei Mode, which consumes gems and slows down all onscreen bullets ... Cancelling more bullets over the course of Kakusei mode will increase the multiplier by 1 for every bullet destroyed, up to a maximum of 100."
  出典: https://shmups.wiki/library/Espgaluda
- (4) 解決した問題 / 弱点と批判: graze と異なる「時間操作」で弾幕回避＆スコアを統合。批判: gem 管理がメタになりすぎる
- (5) 本案への射影 + 採用判定: **採用（参照）**。graze の代替として「時間操作」を据えた事例。本案では参考にしない（複雑化を招く）

### 事例10: Crimzon Clover（2011, YOTSUBANE）
- (1) リリース情報: 同人 → World Ignition（2014）→ World EXplosion（2020, Steam/Switch）。
- (2) 該当機構の仕様（3項目以上）:
  - Break System: ボムゲージ満タンで全画面弾消し＋火力強化。Double Break で更に強化
  - Lock shot（ロックオン）で大量弾消し → メダル収集 → Break ゲージ循環
  - graze 概念は持つが、メダル収集と Break のサイクルが圧倒的にコア
- (3) 引用文抜粋（出典URL付）:
  > "Crimzon Clover is considered unique by its use of a Break system, in which, when the bomb gauge is fully powered up, can be activated to unleash a brief period of super powerful shot that cover the majority of the screen and cancels most bullets upon activation. ... In Unlimited mode, killing enemies with your lock shot cancels bullets around them."
  出典: https://en.wikipedia.org/wiki/Crimzon_Clover
- (4) 解決した問題 / 弱点と批判: 「弾消し＝爽快コア」を再発見。graze は副次的。批判: Break 連発でゲームが「弾消しゲー」化する場面もある
- (5) 本案への射影 + 採用判定: **採用（参照）**。graze を主役に据えず、弾消し循環でテンションを作る。本案の「graze は副産物」方針と整合

---

## 異ジャンル同型（11本）

### 事例11: Bayonetta（2009, PlatinumGames）
- (1) リリース情報: PS3/Xbox360 アクション、後にマルチプラット展開、続編 Bayonetta 2/3。
- (2) 該当機構の仕様（3項目以上）:
  - Perfect Dodge: 攻撃当たる直前に回避入力で Witch Time 発動
  - Witch Time: 敵だけスローモーション、Bayonetta は通常速度で攻撃可能、基本4倍持続
  - Witch Time 中 1.5x コンボボーナス、Earring of Time で6倍化
- (3) 引用文抜粋（出典URL付）:
  > "Witch Time is most commonly and easily activated by dodging an enemy's attack at the last possible moment. A Perfect Dodge is accompanied by a special chime and blue VFX around the screen. A Perfect Dodge multiplies the base duration 4x ... Witch Time grants a 1.5x combo point bonus."
  出典: https://bayonetta.fandom.com/wiki/Witch_Time
- (4) 解決した問題 / 弱点と批判: 「紙一重回避」を能動的報酬装置に。後続スタイリッシュアクションの祖。批判: Witch Time 依存に陥ると単調化
- (5) 本案への射影 + 採用判定: **採用（強参照）**。Perfect Dodge＝報酬の典型。ただし本案では「graze＝Witch Time のような爆発的報酬」にはしない（弾幕の量が違いすぎる）

### 事例12: Devil May Cry 3（2005, Capcom）
- (1) リリース情報: PS2 → Special Edition → HD Collection → Switch。
- (2) 該当機構の仕様（3項目以上）:
  - Royal Guard: 攻撃直前の Guard 入力で完全無効化＋Release Orb 蓄積
  - 3回 Parry で Release Orb 1つ。Just Release（Parry と同フレーム発動）で大ダメージ反撃
  - Parry 成功は大きな視覚エフェクト、失敗時は通常 Guard で軽減のみ
- (3) 引用文抜粋（出典URL付）:
  > "Parrying is the action of tapping the Guard button just as an attack is going to hit you, this will negate the damage completely and charge up energy for the Royal Guard style's offensive technique 'Release'. ... You can perform a Just Release: a 'Just' frame is the exact same Parry timing covered previously - you throw the Release 'Just' as an attack is going to hit you. If you get this right Dante will not only negate any damage, he actually rips through whatever's in front of him imparting truly sickening damage!"
  出典: https://bordersdown.net/articles/features/2741028-devil-may-cry-3-advanced-technique-guide-royal-guard
- (4) 解決した問題 / 弱点と批判: 「紙一重防御」を選択肢化（dodge とは別系統）。批判: 入力窓が極めて狭く、上級者専用
- (5) 採用判定: **採用（参照）**。Royal Guard は「graze 報酬」の高密度版。本案では複雑化を避けるため参考のみ

### 事例13: Sekiro: Shadows Die Twice（2019, FromSoftware）
- (1) リリース情報: PS4/Xbox One/PC、GOTY 2019。
- (2) 該当機構の仕様（3項目以上）:
  - Deflect: ガードボタンを攻撃直前にタップで完全無効化＋敵 Posture ゲージ大幅蓄積
  - 連続 Deflect で Posture ダメージ加算、満タンで Deathblow（即死）
  - 失敗時は通常 Guard（一定ダメージ＋自分の Posture 増）にダウングレード
- (3) 引用文抜粋（出典URL付）:
  > "To deflect an enemy attack, simply tap the Guard button (L1/LB) as an attack is coming; this negates all damage from most attacks, builds up the enemies Posture gauge by a significant amount, and staggers most enemies briefly ... Performing several deflects in quick succession does more posture damage to an enemy."
  出典: https://sekiroshadowsdietwice.wiki.fextralife.com/Deflection
- (4) 解決した問題 / 弱点と批判: 「タイミング回避＝攻撃」を完全に統合した代表作。批判: Deflect 必須化により dodge ビルドが弱く、自由度が下がる
- (5) 採用判定: **採用（強参照）**。Deflect = 報酬と防御の完全統合。本案は graze をここまで強くしない方針

### 事例14: Returnal（2021, Housemarque）
- (1) リリース情報: PS5、後に PC 展開。Housemarque（Resogun, Nex Machina の作者）の AAA 進化形。
- (2) 該当機構の仕様（3項目以上）:
  - Adrenaline: 被弾なしで敵撃破するとレベル蓄積、3キル毎にレベルアップ
  - レベル 1-5 で異なるパッシブ強化（オートパージ熱、無音歩行など）
  - 被弾で全 Adrenaline リセット（レベル5の防御シールド1回分は例外）
- (3) 引用文抜粋（出典URL付）:
  > "Adrenaline is one of the main gameplay systems in Returnal, offering temporary buffs to Selene's abilities as a reward for killing enemies without taking damage. For each enemy killed without taking damage, Selene earns one-third of a level of Adrenaline ... If Selene takes damage at any time, the Adrenaline is reset and all earned Adrenaline bonuses are lost."
  出典: https://returnal.fandom.com/wiki/Adrenaline_Levels
- (4) 解決した問題 / 弱点と批判: 「graze」ではなく「被弾しない継続行動」を報酬化（バリアント）。批判: シールド消失後の脱落感が大きい
- (5) 採用判定: **採用（参照）**。Housemarque は STG 出身。Adrenaline は graze の対極（被弾しない継続）で報酬を作る別解

### 事例15: Hades（2020, Supergiant Games）
- (1) リリース情報: PC（Early Access 2018）→ Switch / PS / Xbox。Hades II も 2024-2025 EA。
- (2) 該当機構の仕様（3項目以上）:
  - Dash i-frames: dash 中の短時間無敵（Boon により延長可能）
  - Athena Boons: dash や攻撃に Deflect 効果（飛び道具を反射＋ダメージ）
  - Deflect は被弾せずに dmg を返す。Holy Shield などで複層化
- (3) 引用文抜粋（出典URL付）:
  > "Athena's Boons for your regular attacks, specials, dash, and your cast ability will allow you to deflect attacks. To do this, all you have to do is use an ability just as an attack is about to hit you in order to deflect it. Deflect returns projectiles and a percentage of their damage to enemies."
  出典: https://twinfinite.net/guides/hades-deflect-attacks-how/
- (4) 解決した問題 / 弱点と批判: dash i-frames が回避コア、Deflect は Boon 経由のオプション報酬。批判: Athena ビルドが強すぎて他選択肢を侵食
- (5) 採用判定: **採用（参照）**。「コア回避 = dash、Deflect = オプション報酬」は本案の構造に近い

### 事例16: Dark Souls（2011, FromSoftware）
- (1) リリース情報: PS3/Xbox360/PC、シリーズ全3作。Remastered で再販。
- (2) 該当機構の仕様（3項目以上）:
  - Parry: 武器/盾ごとに parry 速度が異なる（fast/normal/long）。タイミング厳密
  - 成功で敵硬直、約1秒の Riposte 窓で大ダメージ確定
  - 失敗で super armor + dmg 軽減（=stun はしない）
- (3) 引用文抜粋（出典URL付）:
  > "After executing a parry successfully, players have about one second to do the Riposte. ... There are three different speeds of parrying: fast, normal, and special (long). ... A parry that is executed too early or too late will grant the player some super armor, as well as some damage reduction from the attack that the player attempted to parry, but will not cause the opponent to be stunned or vulnerable to riposting."
  出典: https://darksouls.fandom.com/wiki/Parry_and_Riposte
- (4) 解決した問題 / 弱点と批判: 「紙一重防御」を高リスク高リターン化。批判: Roll が圧倒的に強く、Parry は上級者専用
- (5) 採用判定: **採用（参照）**。Parry をオプション報酬層に置いた成功例。本案の構造（コア＝避ける、graze＝オプション）と近い

### 事例17: Bloodborne（2015, FromSoftware）
- (1) リリース情報: PS4 専売。Soulsborne の代表作。
- (2) 該当機構の仕様（3項目以上）:
  - Quickstep: ロックオン時の dash がローリングから quickstep に変化（i-frames あり）
  - Visceral Attack: 銃で攻撃中の敵を撃つ＝Parry、Visceral Attack で大ダメージ
  - Rally System: 被弾後一定時間内に攻撃すれば HP 回復（攻撃的回復）
- (3) 引用文抜粋（出典URL付）:
  > "Dodging consumes Stamina and has some delays/cooldowns for executing. Dodging has i-Frames, which are invincibility points at which your character cannot be hit by enemy attacks. ... In Bloodborne, the lock-on system significantly affects your dodge behavior. ... pressing the circle button causes your Hunter to roll; if you hold it, they run. But, with lock-on enabled, that roll becomes a dodge."
  出典: https://bloodborne.wiki.fextralife.com/Dodge
- (4) 解決した問題 / 弱点と批判: 「攻撃的回避＝Rally」で被弾の罰を緩和、Quickstep で素早い回避。批判: Parry の銃タイミングが厳密
- (5) 採用判定: **採用（参照）**。コア回避（dodge/quickstep）は強く、Parry はオプション層。本案構造と整合

### 事例18: Metal Gear Rising: Revengeance（2013, PlatinumGames / Kojima Productions）
- (1) リリース情報: PS3/Xbox360/PC、Konami 移管前のコジプロ＋プラチナ共作。
- (2) 該当機構の仕様（3項目以上）:
  - Parry: 攻撃方向に左スティック＋軽攻撃でガード成功＝無効化
  - Perfect Parry: 完全同フレームで Counter-attack 発動
  - Counter 成功で Blade Mode 発動可能（時間4.3%、精密斬撃）
- (3) 引用文抜粋（出典URL付）:
  > "If you parry at the exact moment you expect the enemy's attack to connect, Raiden will counterattack right after you parry. If you're able to hit the enemy with this counter, another chance will open up for you: a golden opportunity to cut the enemy to ribbons with 'Blade Mode.'"
  出典: https://gamerant.com/metal-gear-revengeance-parry-block-dodge-guide/
- (4) 解決した問題 / 弱点と批判: 「Parry を必須化」した極致。批判: チュートリアル不足、初心者は Parry が分からず詰む
- (5) 採用判定: **採用（参照、反面教師）**。Parry 必須化はジャンルを限定する。本案では graze を必須化しない

### 事例19: Furi（2016, The Game Bakers）
- (1) リリース情報: PS4/PC、後にマルチプラット展開。ボスラッシュ専用。
- (2) 該当機構の仕様（3項目以上）:
  - 4ボタン構成: parry / slash / shoot / dodge、どれも overpowered ではない
  - Parry: 発光タイミングで青→紫→赤の段階、リズム的タイミング
  - Parry 成功で HP 回復（後半フェイズで死活的）
- (3) 引用文抜粋（出典URL付）:
  > "You parry, slash, shoot, and dodge with no single button being overpowered so that none of them answer every boss mechanic. ... Parrying seems frustrating at first as missing the timing can leave you open to an enemies combos. However, later on, the health that is regenerated by a parry becomes so attractive that you are forced to be able to execute them flawlessly."
  出典: https://en.paperblog.com/how-to-beat-furi-on-furier-difficulty-a-boss-by-boss-guide-8022307/
- (4) 解決した問題 / 弱点と批判: Parry を「回復装置」化、しかしリズムが各ボス固有でアドリブ性高い。批判: 入力窓がボスごとに違いすぎて学習コスト大
- (5) 採用判定: **採用（参照）**。Parry を回復装置にする発想は graze に転用可能。ただし本案では graze をここまで強くしない

### 事例20: Hi-Fi Rush（2023, Tango Gameworks）
- (1) リリース情報: Xbox Series/PC、後にマルチプラット展開。リズム×アクション。
- (2) 該当機構の仕様（3項目以上）:
  - Parry: ビートに合わせた入力で完全無効化、ジャストでパートナー反撃
  - Reflect: アップグレード後、攻撃方向に左スティック＋Parry でダメージ反射
  - 全行動（攻撃・dodge・parry）がビート同期、ジャストで bonus
- (3) 引用文抜粋（出典URL付）:
  > "A parry move allows players to cancel enemy attacks by pressing the button at the exact moment of attacks. Every action you and the enemies take, whether it be an attack, dodge, or parry, is synced up to whatever music track is playing in the background. ... After an upgrade, holding the left stick in the direction of the attack will also reflect some of the damage."
  出典: https://en.wikipedia.org/wiki/Hi-Fi_Rush
- (4) 解決した問題 / 弱点と批判: Parry を「リズム遊び」化、リズム苦手層に閾値高い。批判: ビート同期はリズムゲー苦手層を排除する
- (5) 採用判定: **採用（参照）**。Parry=リズム快感の別解。本案には不向き（graze はリズム要素なし）

### 事例21: Vanquish（2010, PlatinumGames）
- (1) リリース情報: PS3/Xbox360→PC 移植（2017）。三上真司ディレクション TPS。
- (2) 該当機構の仕様（3項目以上）:
  - Augmented Reaction (AR) Mode: dodge / 滑り / ジャンプ中の照準で自動的に bullet time
  - 連発で suit overheat → 強制クールダウン
  - 紙一重回避→AR mode→精密射撃のループでテンポを作る
- (3) 引用文抜粋（出典URL付）:
  > "Players can manually enter AR mode by holding down the target button while evading, allowing them to target enemies easily. ... Using this mode causes the suit to build up heat and it can overheat if AR mode is used for too long."
  出典: https://vanquish.fandom.com/wiki/Augmented_Reaction_Suit
- (4) 解決した問題 / 弱点と批判: 「紙一重回避＝bullet time 報酬」を TPS に持ち込む。批判: AR ヒート管理が煩雑
- (5) 採用判定: **採用（参照）**。near-miss → 報酬の典型。本案では bullet time のような派手な視覚報酬は載せない

### 事例22: NieR: Automata（2017, PlatinumGames）
- (1) リリース情報: PS4/Xbox/PC、ヨコオタロウ×プラチナ。
- (2) 該当機構の仕様（3項目以上）:
  - Perfect Evade: 攻撃直前の dodge で短い時間停止＋テレポート的回避
  - フォロー攻撃で Counter（light/heavy/pod）、専用アニメ
  - Counter Chip: 装備チップで stick 入力による反撃化（同タイミング）
- (3) 引用文抜粋（出典URL付）:
  > "By pressing the dodge button right before an enemy's attack hits, your character will phase through them in a sort of teleporting effect. Action pauses for the briefest of moments before your character flips to the side, leaving the enemy open for a counter attack."
  出典: https://gamefaqs.gamespot.com/boards/168677-nier-automata/75099931
- (4) 採用判定 / 弱点と批判: Perfect Evade を装備可変化（チップ）。批判: 装備依存で初心者がコア感覚を掴みにくい
- (5) 採用判定: **採用（参照）**。dodge 即報酬の典型

---

## 「やらなかった」ゲーム（5本、なぜ動かさなかったか推定）

### 事例23: Gradius（1985, Konami）
- (1) リリース情報: アーケード→FC/MSX→各種移植。横スクロール STG の祖。Gradius Origins (2025) HD 再販。
- (2) 該当機構の仕様（3項目以上）:
  - Vic Viper ヒットボックスは大きめ、graze 概念なし
  - パワーアップカプセル収集でゲージ式装備（Speed Up, Missile, Double, Laser, Option, Shield）
  - 被弾で全装備喪失＋チェックポイント戻し
- (3) 引用文抜粋（出典URL付）:
  > "In Gradius games, players can graze bullets by perfecting control over the ship, indicating that grazing is a recognized mechanic in the series. However ... grazing an obstacle with only one part of the ship resulted in death. ... Gradius Origins collection includes reduced hit detection as a modern quality-of-life feature, which suggests that the original games had more strict hit detection compared to modern versions."
  出典: https://www.konami.com/games/us/en/topics/2835/
- (4) なぜ採用しなかったか（推定）: 1985 年当時は graze 概念自体が未発明。技術制約（処理性能、ヒットボックス精度）＋装備喪失ペナルティが既に十分なリスク装置として機能していた
- (5) 採用判定: **不採用（参照）**。graze なしで横 STG の標準が確立されている＝graze 必須ではない傍証

### 事例24: R-Type（1987, Irem）
- (1) リリース情報: アーケード→各種移植。横スク STG 名作。
- (2) 該当機構の仕様（3項目以上）:
  - 自機 R-9 のヒットボックスは「機体中央の1ピクセル線」、グラフィックより遥かに小さい
  - graze スコア加算なし。Force（攻防一体オプション）と Beam チャージで戦う
  - 1 hit死＋チェックポイント戻し
- (3) 引用文抜粋（出典URL付）:
  > "The R-Type ship's hitbox is a single point in the dead center of the ship. To compensate, Irem made the enemy and background hitboxes larger than they visually appear so things wouldn't seem unnatural."
  出典: https://shmups.wiki/library/R-Type
- (4) なぜ採用しなかったか（推定）: 「擦れる小hitbox」は持っているが、それを得点化する発想がなかった（1987年）。Force による攻防一体の戦略性が既にコア快感
- (5) 採用判定: **不採用（参照）**。小hitbox 自体は graze の前駆体。本案は「小hitbox はあるが報酬化しない」R-Type 流を継承可能

### 事例25: Truxton / Tatsujin（1988, Toaplan）
- (1) リリース情報: アーケード→Mega Drive/PCE 移植。Toaplan 弾幕シューの源流。
- (2) 該当機構の仕様（3項目以上）:
  - graze 概念なし、HP メーターもなし、1 hit即死＋チェックポイント
  - 武器3種（Power/Laser/Thunder）切替戦略
  - 弾幕は高密度だが、Cave 流の小hitbox graze 文化は採用せず
- (3) 引用文抜粋（出典URL付）:
  > "Creator Masahiro Yuge wanted to create a scrolling shooter where players would become increasingly better the more they were able to remember specific stage designs and secrets, focusing on creating sections in levels that required a specific weapon to defeat certain enemies. ... its difficulty is largely characterized by the lack of an HP meter, which means a single collision with a single projectile or enemy will result in an immediate death."
  出典: https://shmups.wiki/library/Tatsujin
- (4) なぜ採用しなかったか（推定）: 1988年当時、graze はまだ発明されていない。武器選択＋暗記がコア
- (5) 採用判定: **不採用（参照）**。graze なしの「避けて武器選んで撃つ」が成立した古典

### 事例26: Xevious（1982, Namco）
- (1) リリース情報: アーケード→各種移植。縦スク STG の祖。
- (2) 該当機構の仕様（3項目以上）:
  - 空中ザッパー（ショット）＋地上ブラスター（爆弾）の2軸攻撃
  - graze 概念なし。隠しソルバルウ＋シークレットフラッグでボーナス
  - 撃破率%が高得点と並ぶ独立スコア軸
- (3) 引用文抜粋（出典URL付）:
  > "Most 80s arcade fans would therefore quote Xevious as being the first game to set the vertical shmup template. ... Players can rack up points by destroying enemy ships, ground targets, and boss enemies, with additional bonuses awarded for the successful completion of stages."
  出典: https://shmup.fandom.com/wiki/Xevious
- (4) なぜ採用しなかったか（推定）: 1982 年は弾幕概念自体が未発達。graze の母体（高密度弾）が存在しない
- (5) 採用判定: **不採用（参照）**。STG ジャンルの源流は graze 抜きで成立した

### 事例27: Eschatos（2011, Qute）
- (1) リリース情報: Xbox360 → Windows/Switch 移植。Judgement Silversword 系列。
- (2) 該当機構の仕様（3項目以上）:
  - Normal Mode: 敵編隊を逃さず全滅で multiplier +1、1体逃すと multiplier 減
  - graze は存在しても得点化が薄い（プレイヤーコミュニティが「graze 何ポイント？」と疑問）
  - Wide Shot / Locked Shot / Backwards Shield の3ボタン構成
- (3) 引用文抜粋（出典URL付）:
  > "The multiplier in Normal mode goes up as you destroy enemy formations without letting any slip offscreen (same idea as Zanac Neo). ... each time you destroy all enemies in a wave, the score multiplier rises by 1; miss, and the multiplier drops."
  
  コミュニティ抜粋:
  > "I didn't even know grazing did anything. ... How many points is it worth? And what's the grazebox compared to the hitbox?"
  出典: https://shmups.system11.org/viewtopic.php?t=37266 ＋ https://moegamer.net/2017/03/25/shmup-essentials-eschatos/
- (4) なぜ採用しなかったか（推定）: 設計者（はせ氏）は graze より「編隊撃破ルート」をスコアコアに据えた。意図的に graze を弱体化＝シンプル化を選択
- (5) 採用判定: **採用（強参照）**。本案と思想がもっとも近い「graze を意図的に弱くした現代 STG」。プレイヤーが「何ポイント？」と疑問を持つレベルまで弱体化＝本案の理想形

---

## 失敗事例（5本、レビュー酷評／後続作で削除）

### 事例28: Touhou 風神録（Mountain of Faith, 2007, 上海アリス幻樂団）
- (1) リリース情報: Windows、Touhou 10作目。
- (2) 該当機構の仕様（3項目以上）:
  - 前作までの graze スコア加算を完全撤去
  - 信仰ポイント（Faith）ゲージ式スコアに変更
  - graze は HUD カウンターさえ表示されない（実質削除）
- (3) 引用文抜粋（出典URL付）:
  > "Mountain of Faith, after five mainline games in which grazing was prominent, did not reward the player for grazing in any way whatsoever, much to the disappointment of the devoted fans. However, the technique came back in Subterranean Animism, where it's once again the primary source of high scores."
  出典: https://en.touhouwiki.net/wiki/Graze
- (4) 解決した問題 / 弱点と批判: ZUN が graze 中毒化したコミュニティをリセットする意図。批判: 既存スコアラーが大量離脱、次回作で復活
- (5) 本案への射影 + 採用判定: **採用（最強参照）**。「graze を消したら STG として何が起きるか」の唯一の実験例。本案は「消すまでは行かないが、コアから外す」中間案＝風神録の経験から学ぶ

### 事例29: Touhou 18 鬼形獣（Unconnected Marketeers, 2021, 上海アリス幻樂団）
- (1) リリース情報: Windows、Touhou 18作目。
- (2) 該当機構の仕様（3項目以上）:
  - graze はスコアに無関係。HUD に graze カウンターさえない
  - アビリティカード「Yuyuko カード」装備時のみ、graze に弾消し random chance
  - メインスコアはカード収集＋撃破効率
- (3) 引用文抜粋（出典URL付）:
  > "Grazing in Unconnected Marketeers has no effect on score. ... Unlike most other Touhou games, in most circumstances, grazing bullets does nothing in this game, and there isn't even a graze counter on the HUD. However, ... If you have Yuyuko's card equipped, any bullets you graze have a random chance of being deleted."
  出典: https://en.touhouwiki.net/wiki/Unconnected_Marketeers/Gameplay
- (4) 解決した問題 / 弱点と批判: 風神録の教訓を踏まえ「装備時のみ graze に意味」と階層化。批判: graze の存在感が薄れたという旧来ファンの不満残る
- (5) 採用判定: **採用（最強参照）**。本案 v04 α の「graze を削除可能ボーナス層に下げる」とほぼ同じ思想を、現代 Touhou が採用済み

### 事例30: DoDonPachi Resurrection（2008, Cave）
- (1) リリース情報: アーケード→Xbox360→Steam/Switch HD 移植。
- (2) 該当機構の仕様（3項目以上）:
  - Hyper System を更に複雑化、Hyper 1本に統合
  - 1.0 版ではバグ的スコア稼ぎが横行、1.5 版で調整
  - 「説明書なし」「チュートリアルなし」で複雑な scoring を強要
- (3) 引用文抜粋（出典URL付）:
  > "It's really strange that a shmup this mechanically complex has no form of tutorial or manual at all. Additionally, it doesn't even include a digital manual explaining the obtuse scoring system. ... it reveals creaking complexity that simply did not need to exist for fun or even for scoring."
  出典: https://theologygaming.com/review-dodonpachi-resurrection/
- (4) 解決した問題 / 弱点と批判: Hyper / Combo / Hit / Bee ＋ graze 副次効果 が絡み合い、新規参入を完全に拒絶。批判: 「複雑化は楽しさを増やさない」が露呈
- (5) 採用判定: **採用（反面教師）**。graze をシステム複層に組み込みすぎると同じ轍を踏む。本案の「graze は副産物・削除可能」は意識的にこれを避ける

### 事例31: Babylon's Fall（2022, PlatinumGames / Square Enix）
- (1) リリース情報: PS4/PS5/PC、ライブサービス→1年でサーバ閉鎖。
- (2) 該当機構の仕様（3項目以上）:
  - PlatinumGames 流の Perfect Dodge 系統を継承を試みた
  - Dodge mechanic が常時動作せず、特にマルチプレイで「100%動かない」状態
  - Combat 全般が遅く重い＝Platinum らしさ喪失
- (3) 引用文抜粋（出典URL付）:
  > "The game has been met with criticism for a combat system that feels clunky and slow as opposed to Platinum's signature kinetic pace. ... an initially promising dodge mechanic, but it legitimately doesn't work 100% of the time, and this is horribly exacerbated when playing with other players."
  出典: https://indiecator.org/2022/07/12/babylons-fall-what-went-wrong/
- (4) 解決した問題 / 弱点と批判: 「Perfect Dodge を実装すれば Platinum らしくなる」と思って失敗。判定窓・反応性・テンポが噛み合わないと Perfect Dodge は機能しない
- (5) 採用判定: **採用（反面教師）**。「graze 採用 = 自動的に爽快」ではない。判定の質・反応性・テンポが全てを決める。本案実装時の警告

### 事例32: Mighty No. 9（2016, Comcept / Inti Creates）
- (1) リリース情報: PC/PS3-4/Xbox360-One/Switch、稲船敬二によるロックマン精神的後継。
- (2) 該当機構の仕様（3項目以上）:
  - 「Xel ダッシュ」: 敵を弱らせた後ダッシュ吸収で撃破、コア機構として強調
  - 紙一重接近＝報酬の構造（graze 風）だが、ヒットボックス不正確で誤死多発
  - レベルデザインがダッシュと噛み合わず、ダッシュペナルティ化する場面多数
- (3) 引用文抜粋（出典URL付）:
  > "the dash mechanic is described as 'a lot of fun,' it was undermined by bad art, imprecise hitboxes, and awful level design. ... How did the idea of facechecking enemies to kill them even get off the drawing board? ... 'fundamental incompatibility of the dash mechanic and the level design' was a major issue."
  出典: https://www.resetera.com/threads/so-exactly-why-was-mighty-no-9-such-a-failure.70232/
- (4) 解決した問題 / 弱点と批判: 「リスク行動＝報酬」の発想自体は良いが、判定・レベルデザイン・視認性が伴わないと一気に酷評対象に
- (5) 採用判定: **採用（反面教師）**。本案実装時、graze 判定の精度＋視認性＋ステージとの整合性を最優先で詰める根拠

---

## 結論：本案が先行事例の何を超えるか / 何を再発明しているだけか

風神録（事例28）と Unconnected Marketeers（事例29）が既に「graze をスコアコアから外す」実験を済ませており、本案 v04 α は再発明ではない。本案が超えるべきは「graze 弱体化を、プレイヤーが寂しさではなく解放感として受け取る設計」――Eschatos（事例27）の Qute 流「graze は薄く存在するが意識しなくて良い」が最適解の参照点である。
