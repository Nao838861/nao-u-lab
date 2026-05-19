# graze_log_cdx 既存STGステージ構成リサーチ 2026-05-20

## 目的

ユーザー指摘:

> 敵の出現パターンが単調。既存のゲームのザコ敵の編隊や中ボスを出すタイミング、それぞれの弾を撃つアルゴリズムやステージの展開など、想像ではなく実際のゲームのパターンを調べて再現する形で、散発的に敵が適当に出てくるのではなく、ステージの流れからボスまでの展開をちゃんと作りこんで欲しい。まずは既存ゲームのリサーチから。可能な限り既存ゲームの展開を再現してほしい

このメモは v09 以降の実装で、敵を「適当に散発 spawn」するのを止め、既存STGの観察可能な構成をステージ台本として移植するための材料である。

## 参照ソース

- Gradius Stage 1 / StrategyWiki  
  https://strategywiki.org/wiki/Gradius/Stage_1
- Gradius Enemies / StrategyWiki  
  https://strategywiki.org/wiki/Gradius/Enemies
- DonPachi Enemy List / Shmups Wiki  
  https://shmups.wiki/library/DonPachi/Enemy_List
- DonPachi / Shmups Wiki  
  https://shmups.wiki/library/DonPachi
- Ikaruga Stage 1 / StrategyWiki  
  https://strategywiki.org/wiki/Ikaruga/Stage_1
- Touhou Subterranean Animism Strategy / Touhou Wiki  
  https://en.touhouwiki.net/wiki/Subterranean_Animism/Strategy
- Experience Design Shmups Lecture / shmup-dev.com  
  https://shmup-dev.com/files/experience_design_shmups_lecture.pdf

## 観察 1: Ikaruga Chapter 1 は「短い群れ」を数列として置く

Ikaruga Stage 1 の StrategyWiki は、Chapter 1 を 5 parts とし、最初の Section 1 を「60 enemies / 6 groups」と説明している。最初の 4 group は右上・左上から交互に入り、続く 2 group は左右に並んだ 3x6 column として現れ、短時間だけ 6x6 square のような塊を作る。

実装へ移す要点:

- 開幕 20 秒は「右上、左上、右上、左上」の交互 group。
- その後、左右 2 列の column formation を同時に出し、画面中央で一瞬大きな矩形に見せてから左右へ流す。
- 早く倒した時だけ bonus group を出す。これは単なる reward ではなく、上達でステージ密度が変わる仕組み。
- v09 では色 polarity は使わず、代替として「white=直進 scout」「black=小角度 aimed scout」にする。

移植候補:

```text
00:00 opening fan: 右上5機
00:04 opening fan: 左上5機
00:08 opening fan: 右上5機
00:12 opening fan: 左上5機
00:18 dual column: 左3x6直進 + 右3x6直進、中央で矩形を作り左右へ流れる
00:25 speed bonus: ここまでの撃破率が高い時だけ、上隅から3機x2 group
```

## 観察 2: Gradius Stage 1 は「pre-stageで育成、地形/砲台、hatch、sub-boss、Big Core」の段階構成

Gradius Stage 1 は、まず space pre-stage で power-up を取らせ、その後 terrain が見えてから上下の地形敵、hatch、移動砲台、浮遊岩の laser cannon、火山 sub-boss、Big Core へ進む。

敵挙動として、Gradius Enemies には以下のような実装しやすい単位がある。

- Fans: 5-9機の trail group。高低差を変えて近づき、全滅で capsule。
- Garun: 2機 group、sine wave 軌道。
- Beans: 2 squadron が交差して figure-eight 風に見える。
- Hatches: 固定砲台が開閉し、開いた時に Rush を放出。
- Ducker/Jumper: 地形に沿って動き、後ろに回ると危険になる。
- Big Core: 上下移動、停止、4 beam、barrier を壊して core を露出。

graze_log は地形衝突ゲームではないので、地形そのものは入れず「上下レーンの hatch / turret zone」として再現する。

移植候補:

```text
00:30 gradius pre-stage: power/gauge を取らせる軽い fan
00:40 hatch lane: 上下固定 hatch 2基。開閉周期で小型 rush を放出
00:52 terrain substitute: bottom turret + top turret の交互 aimed shot
01:02 floating rock substitute: 中型 carrier に5小砲台。近い側2-3個を壊す選択
01:18 volcano sub-boss substitute: 左右2 source から遅い rock ring を断続発射
```

## 観察 3: DonPachi Stage 1 は「低脅威 popcorn + 地上物 + 高HP中型 + 中ボス + boss部位破壊」

DonPachi Enemy List の Stage 1 は、1 hit helicopter、power carrier、時々撃つ bush turret、2 parts tank、roof turret が開いた時だけ壊せる bunker、stage 1 midboss の high HP tank、boss の部位 turrets / core という構成になっている。

特に重要なのは、DonPachi の敵が「単体の強さ」より「chain を組むための配置」として意味を持つ点である。Shmups Wiki の DonPachi 概要では、GPS chain が 0.5 秒以内に次の敵/物体を壊す厳しい連鎖で、DonPachi は全ステージ一本鎖よりも複数の小 chain を重ねる方向だと説明されている。

実装へ移す要点:

- 低脅威 helicopter/scout を多めに置くが、散発ではなく chain 用に 3-5機単位で並べる。
- 地上物相当として「bunker」を置く。開いている時だけ本体が壊れ、壊すと小 tank が4機出る。
- 高HP midboss は「早く倒さないと spread が増える」役割にする。
- boss は core 直撃ではなく、部位 turret を壊すと攻撃が変わる構成にする。

移植候補:

```text
01:30 donpachi chain lane: 3機 scout -> tank pair -> 3機 scout
01:42 bunker: 開閉 turret。破壊で small tank 4機を左右へ展開
01:56 high HP tank midboss: 背面 turret が wide spread、中央砲が aimed line
02:20 star carrier group: item/gauge top-off と小 chain
boss: back turret = wide 7-way、side turret = fast stream、core = 部位破壊後に attack pattern 変更
```

## 観察 4: Touhou SA Stage 1 は「左右下からの初期波、S字弾、静止中ボス、ボス波」の流れ

Touhou Subterranean Animism Strategy の Marisa-B Stage 1 節は、最初の敵波が bottom left / bottom right から来ること、序盤の主脅威が S-shaped bullet streams を撃つ fairies であること、弾は直接狙いで撃たれた後は方向が変わらないこと、しばらくして Kisume が出て、その後 Yamame boss に移ることを述べている。

graze_log へ移す時は、東方の「弾幕名/キャラ」ではなく、ステージ文法だけを使う。

移植候補:

```text
00:55 touhou side-rise: 左下/右下から上がる小型 enemy
01:05 S-stream fairy: プレイヤー位置へ初期角を合わせ、発射後は曲がらないS字列
01:20 static midboss: あまり動かない中ボス。Fire/focus 相当で削りやすい
boss early: wave をくぐる非スペル相当
boss final: BOMB cue 後に密度増加
```

## 観察 5: 一般設計論として、wave / popcorn / tough enemy / mini-boss / boss / break が標準

shmup-dev の講義資料は、small enemies は wave で来る、1-2 hit の popcorn は少し硬い enemy と混ぜる、長い level には mid-level mini-boss が入り、level end は varying bullet patterns を持つ boss fight にする、と整理している。また、短い休憩は wave 間、とくに mini-boss 前と boss 前に置くのがよいとしている。

これは v09 の headless 検証軸に直結する。

必要な検証:

- wave 間に休憩があるか。
- popcorn-only の連続が長すぎないか。
- tough enemy / bunker / midboss / boss が段階的に出るか。
- boss 前に top-off / warning / break があるか。
- boss が単一 pattern ではなく、部位破壊またはHPで変化するか。

## v09 の再現方針

v09 は「Ikaruga Chapter 1 の整理された開幕」「Gradius Stage 1 の hatch/地形/火山/Big Core 段階」「DonPachi Stage 1 の chain/中ボス/boss部位」「Touhou SA Stage 1 のS字 aimed stream」を 1 本の短い縦STGステージに圧縮する。

### ステージ台本案

```text
00:00 Ikaruga opening A
  右上5機 -> 左上5機 -> 右上5機 -> 左上5機
  弾は少なめ。撃破テンポを覚えさせる。

00:18 Ikaruga dual column
  左右3x6 column。中央で矩形に見える。
  早期撃破で bonus 3機x2。

00:32 Gradius pre-stage / fan + garun
  trail fan と sine pair。
  全滅で gauge reward。

00:45 Gradius hatch lane
  上下 hatch が開閉し rush を放出。
  hatch を早く壊すと以後の敵数が減る。

01:02 Touhou S-stream
  左下/右下から浮上する fairy 相当。
  S-shaped stream は発射時だけ player aim、以後は固定。

01:18 Gradius volcano sub-boss
  左右2 source から rock/ring を断続発射。
  ここで短い休憩 + item/gauge。

01:34 DonPachi chain lane
  scout 3 -> tank pair -> bunker -> small tanks 4。
  chain を作れるが survival では無理に追わなくてよい。

01:58 DonPachi high HP tank midboss
  中央砲 aimed line、背面 turret wide spread。
  長引くほど spread interval が短くなる。

02:25 boss warning / top-off
  star carrier/scout group。BOMB stock を作る。
  直後に 1.0 秒の break。

02:40 Boss: Big Core x DonPachi parts
  Phase 1: 上下移動 + 4 beam lane。
  Phase 2: side turret fast stream。
  Phase 3: back turret wide 7-way。
  Phase 4: core exposed + BOMB cue + final dense pattern。
```

### 敵タイプ案

- `fanScout`: Gradius Fans。5-9機 trail。全滅 reward。
- `sinePair`: Gradius Garun。2機、sine wave。
- `dualColumn`: Ikaruga 3x6 column。左右同時。
- `hatch`: Gradius hatch。開閉、rush spawn。
- `rush`: hatch から出る直進 enemy。
- `sFairy`: Touhou S-stream。発射時だけ aimed。
- `bunker`: DonPachi bunker。開いている時だけ破壊可能、破壊で small tank 4。
- `chainTank`: DonPachi two-part tank。turret と body。
- `volcanoMid`: Gradius volcano substitute。左右 source から rock burst。
- `heavyTankMid`: DonPachi Stage 1 midboss substitute。
- `partBoss`: Big Core + DonPachi boss parts。

### 弾アルゴリズム案

- aimed single: `atan2(player - enemy)` で初期角を取る。以後 homing しない。
- S-stream: aimed angle に対して、連続弾の x/y に `sin(age * freq + phase) * amp` を足す。
- sine mover: enemy の x/y 移動を `base + sin(t * freq + phase) * amp` にする。
- wide 7-way: base aim または真下を中心に `[-36,-24,-12,0,12,24,36]deg`。
- 4 beam lane: boss 停止時に縦/斜めの低速 beam 4本。隙間を固定する。
- rock burst: volcano source から上方向扇形に遅い bullets。完全ランダムにしない。

### headless 評価案

v09 check は単なる clear ではなく、ステージ文法を検証する。

- `stageEventCount >= 18`
- `hasIkarugaOpening`
- `hasDualColumn`
- `hasHatchLane`
- `hasSStream`
- `hasVolcanoMidboss`
- `hasBunkerRelease`
- `hasHeavyTankMidboss`
- `hasBossParts`
- `hasBossBreakBeforeStart`
- `cleared === true`
- `bossReached === true`
- `bombCount >= 1`
- `maxEnemyCount` が暴走しない
- `longestNoEnemyGap` が break 以外で長すぎない
- `dangerPeaks` が midboss / boss に集中している

## 実装判断

次の playable diff は v08 を `v05_1_cdx_v09/` にコピーし、上記ステージ台本を `STAGE_EVENTS` と enemy update/fire 関数へ入れる。v08 の BOMB/clear/boss cue 検証は維持しつつ、v09 では「既存ゲーム由来の wave grammar が存在する」ことを headless で検証する。

単に敵数を増やすのではなく、各区間の出典と役割を devlog/design_log に残す。
