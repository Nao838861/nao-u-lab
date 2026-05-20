# shot_log_cdx 差分の graze_log_cdx 反映分析

## 誤解の修正

前回は完成済みの `Claude/game/shot_log/v01` を直接変更してしまった。これは誤りだった。
ユーザーの意図は、shot_log の完成度そのものを書き換えることではなく、shot_log と現行 graze_log_cdx の差分を読み、graze_log_cdx 側の改善へ使うことだった。

そのため、変更済み shot_log は `GPT/game/shot_log_cdx/v01_from_bd6c65a` に保存し、正本の shot_log は元へ戻した。

## 教師データとして使う差分

shot_log_cdx で有効だった差分は、個別の敵種や撃ち返しではなく、次の配置文法だった。

1. 序盤の敵数を増やし、開始直後から「撃って倒す対象」が途切れないようにする。
2. 既存 wave の後に遅延列を置き、プレイヤーの攻撃が強くても一瞬で画面が空にならないようにする。
3. 左右または中央の expected lane を短い間隔で切り替え、プレイヤーに次の位置取りを要求する。
4. ボス直前とボス中に燃料編隊を追加し、BOMB / gauge / boss cue までの時間を空白にしない。

## graze_log_cdx v29 の問題

v29 は 1942 trace のラベルと座標系は入っていたが、イベント間隔が広く、1 wave あたりの敵数も少なかった。
プレイヤーのショットは連射で、かつ gauge 成長後は火力が上がるため、1942 の単発ショット前提の敵密度をそのまま置くと薄く感じる。

特に問題だったのは次の点。

- `red five` や `red ten` の後、撃破が速いと次イベントまで空白が残る。
- side curl は出現の引用としては成立しているが、撃破後の追撃対象がなく、流れが止まる。
- boss warning から boss cue までが、BOMB の役割を見せるには薄い。

## v30 の実装方針

既存の 1942 trace wave は残した。
その間へ `cdx_*` の fuel / restock / cover wave を挿入し、shot_log_cdx の密度差分だけを移植した。

追加 wave はすべてランダムではなく、固定タイムライン上に置いた。
目的は「この wave の後にプレイヤーはこの lane にいるはずなので、次にどこへ移動させるか」を明示すること。

- opening left / right fuel: 開幕 V 編隊後、左右に遅延列を置いて序盤から連続撃破させる。
- curl tail restock: 左右 curl の撃破後に、同じ側から少し内側へ入る追撃対象を置く。
- red ten center fuel: red ten 撃破後に中央を維持させ、bonus plane へ切り替える前の空白を埋める。
- bonus cover lane: 下から出る bonus plane を追う間、逆側に縦列を置いて視線を戻す。
- bomber fuel / fast V side fuel: 中盤以降の火力上昇に合わせて敵数を増やす。
- boss approach / boss sustain fuel: boss 前後で gauge と攻撃対象を切らさず、CORE LOCK cue まで流れを持続させる。

## 実装内容

- `index.html`
  - v30 表記へ更新。
  - `TRACE_SOURCE_NOTES` に shot_log_cdx density transfer を追加。
  - `TRACE_EVENTS` に `cdx_*` fuel wave を追加。
  - `spawnFuelColumns` / `spawnTailRestock` / `spawnLaneCover` / `spawnBossApproachFuel` を追加。
- `tools/headless_graze_log_cdx_v05_2_v30_check.js`
  - v30 path へ変更。
  - `densityFuelAdded` check を追加。

## 残る評価点

headless は密度・flag・clear を確認できるが、体感上の「気持ちよさ」はまだ人間のプレイ確認が必要。
v30 は、過去版のパラメータ微修正ではなく、v29 の sparse trace の間へ shot_log_cdx 型の燃料編隊を差し込む変更である。
