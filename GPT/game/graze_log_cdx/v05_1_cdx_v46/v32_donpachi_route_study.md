# v32 DonPachi route study

## 認識の修正

v09 は、Ikaruga / Gradius / Touhou / DonPachi の参照元を「再現した」ものではない。
実際には、参照元の名前を付けた要素を混ぜただけで、元ゲームの出現タイミング、速度、隊列、弾の撃ち方、プレイヤーの位置誘導を再現できていなかった。
そのため、v09 を最新版へ戻す判断は誤りだった。

v30 も別の意味で失敗していた。
v30 は敵数とテンポを増やしたが、主な追加関数が直線的な `spawnFuelColumns` だったため、移動アルゴリズムの悪さは残った。

## v32 の方針

複数タイトルを混ぜない。
今回は DonPachi Stage 1 の文法だけに寄せる。

完全なフレーム単位コピーではなく、公開資料から確認できる構造を graze_log のシステムへ移植する。
参照した中核は次の3点。

- GPS chain は次の敵または物体を 0.5 秒 / 30 フレーム以内に壊すことで維持される。
- Stage 1 には危険で高価値な high turret midboss があり、早く倒す価値がある。
- Stage 1 boss は back turret / side turret / core の部位構造を持ち、back turret は wide 7-way、side turret は fast stream、core は部位破壊後に攻撃が変わる。

## 実装した文法

### 1. chain connector

小型 heli を 3-9 体の短い列として出す。
目的は、30 フレーム chain window を切らさずに、次の硬い敵へ移動する橋を作ること。

### 2. hard target first

tank / bunker / crane / stock carrier を chain の早い位置に置く。
DonPachi の「高価値敵を chain の前半に入れると得」という発想に合わせる。

### 3. bunker release

bunker は一定時間後に small tank を4体放出する。
単に硬い敵を置くのではなく、壊すタイミングで次の chain 対象が出る構造にした。

### 4. high turret midboss

中盤に `midboss` を出し、aimed + spread を撃つ。
ここは短い危険の山として置き、撃破後に左右 connector row で chain を復帰させる。

### 5. boss stock carrier

boss 前に stock carrier と connector を置き、BOMB gauge を作る。
これは「溜まり次第撃つ」ではなく、boss final cue のために温存する流れにする。

### 6. part boss

boss は core + bossPart 3個。

- back part: wide 7-way
- side parts: fast aimed streams
- core: 部位破壊後、HP が減ると `CORE OPEN - BOMB` cue

## headless 評価の変更

clear できるだけでは通さない。
v32 check は次を確認する。

- DonPachi 単一ソースであること
- route timeline に bunker / midboss / part boss が入っていること
- chain window が 30 frame であること
- hard target release が機能すること
- boss part が破壊され、final cue が出ること
- bot が BOMB を使って S clear すること
- maxChain が一定以上あること

これにより、v30 のような「敵数だけ増えた」変更を pass させない。

## 参照

- DonPachi/Enemy List - Shmups Wiki: https://shmups.wiki/library/DonPachi/Enemy_List
- DonPachi - Shmups Wiki: https://shmups.wiki/library/DonPachi
