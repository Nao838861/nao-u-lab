# graze_log v05.2_cdx_v03 - devlog

## 0. フィードバック原文

> 敵が同じパターンで出続けるだけで緩急もリズムもゲームデザイン的な展開もクリアもボスもなく、無限にだらだら続くだけなのを解決してほしい。ボムは懸念通り「overdrive 5-way が強すぎて、溜まり次第撃つだけになるかもしれない」になってるし、終わったころには溜まってるので5wayがずっと続く状況。正常に機能するヘッドレスを作って、自己評価しながら改善して。このゲームが完成するか、私が止めろというまでは定時サイクルで繰り返し改善を続けて。

## 1. 実装前判断

v02 の問題は数値ではなく構造。`spawnWave()` が wave 5 以降に過去 wave/random を無限再利用するため、プレイヤーがどこへ向かっているかが存在しない。BOMB も `4s 5-way / 10s cooldown` では、終了後に gauge が残って次の BOMB へつながり、通常 3-way の価値を壊していた。

したがって v03 では「有限ステージ」「ボス」「クリア」「BOMB 5-way 撤去」を同時に入れる。これは大きめの構造修正だが、フィードバックの中核がそこなので小手先の cooldown 延長では足りない。

## 2. 採用案

### Stage run

- `STAGE_EVENTS` を追加し、時刻ごとの敵配置を固定化。
- 進行は opening three / left right aimed / sweep / breather single / cross escort / rush / heavy pair / final lane / boss。
- `phaseLabel` と進行率を HUD に表示し、今どの区間にいるか見えるようにした。

### Boss / clear

- `boss` type を追加。
- boss は HP に応じて aimed 5-way、radial、終盤混合へ変化する。
- boss 撃破後、短い猶予後に `STAGE CLEAR` へ遷移する。

### Bomb brake

- BOMB の 5-way overdrive を撤去。
- BOMB 後は gauge を `G_LV3` に戻すだけで MAX には残さない。
- 効果は全弾消し、敵 HP 削り、2 秒の bullet brake、12 秒 cooldown。
- これで BOMB は「ずっと火力を上げるボタン」ではなく「危険区間を切るテンポ制御」になる。

## 3. 改変箇所

- `index.html` を v03 として全面整理。
- `tools/headless_graze_log_cdx_v05_2_v03_check.js` を追加。
- headless は以下を検証する。
  - BOMB 後 gauge は `G_LV3` で MAX ではない。
  - BOMB は cooldown と brake を開始する。
  - BOMB は 5-way を付与しない。
  - cooldown 終了だけでは BOMB ready に戻らない。
  - Active DEF は 7 streak では出ず、8 streak で出る。
  - finite script が boss に到達する。
  - boss 撃破で clear へ遷移する。

## 4. 戻し手順

`v05_1_cdx_v03/` を破棄すれば `v05_1_cdx_v02/`, `v05_1_cdx_v01/`, `v05_1_base/` は無改変で残る。

ファイル内で戻す場合は以下。

1. `STAGE_EVENTS`, `processStageScript()`, `spawnBoss()`, boss type 処理、clear 遷移を削除。
2. `spawnWave()` と `spawnT` ベースの無限湧きを v02 から戻す。
3. `BOMB_BRAKE_FRAMES` と brake 処理を削除。
4. `BOMB_OVERDRIVE_FRAMES`, `overdriveT`, `shotCount()` の 5-way 分岐を v02 から戻す。

## 5. Mental Sim

序盤は 3 体 small で基本射撃と graze を確認する。次に左右 medium の aimed shot で横移動を要求する。sweep と rush は「横並びをどう崩すか」の区間、breather は少し密度を落として gauge と位置を整える区間。escort と heavy pair で elite が混ざり、最後に boss でこれまでの aimed / radial をまとめて出す。

BOMB は MAX になったら即撃ちしても 5-way にはならない。押す価値は画面の弾を消して boss/elite の HP を削り、2 秒だけテンポを落として立て直すことにある。撃った後は LV3 通常射撃へ戻るので、次の BOMB には再度 graze/kill が必要になる。

## 6. 自己判定

v03 は v02 より明確に前進。少なくとも「無限に同じ敵が出る」「クリアがない」「ボスがない」「BOMB が実質常時 5-way」は解消した。

まだ完成ではない。現状の boss は機械的には成立しているが、手触りとして「ボスを削っている感触」「道中から boss への盛り上がり」「初見での勝率」は未確認。次サイクルでは headless の契約検査だけでなく、短い self-play 観察ログを取り、死亡箇所・BOMB 使用タイミング・boss HP 推移を見て stage tuning を続ける。

## 7. 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v03_check.js
```

結果: pass。
