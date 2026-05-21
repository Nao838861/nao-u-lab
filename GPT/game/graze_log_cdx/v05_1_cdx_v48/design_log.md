# graze_log v05.2_cdx_v48 design_log

## 対象 directive

Slack pending の game directive は今回なし。`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。

Nao_u 指示原文:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

直近 directive の焦点:

> 次は cross-lock wave が人間に横移動判断として読めるかを見るか、同じ密度の手作り wave を midboss 前後へ広げる。

## 実装前判断

今回は v47 の boss 前 wave を直接いじらず、midboss 後に同じ設計語彙の wave を 1 本足す。理由は、v47 の readable 判定を headless だけで断定しないため。まず stage 内に 2 つ目の手作り横移動 wave を置き、route event / trace / policy split に出る形を作る。人間確認では v47 の boss 前 wave と v48 の post-midboss wave を見比べられる。

使った過去知見:

- `Playable / Headless 評価`: clear だけでなく、追加 wave の存在を trace digest と route label に残す。
- `Balance / Rule Space`: pressure / movementSwitches / kills は比較補助であり、面白さの判定ではない。
- `Repair / Iterative Improvement`: v47 から小さい派生にして、latest2 compare で v47 -> v48 の差分を追えるようにする。
- `Feedback / Rights / Human Judgment`: headless は人間評価の代替ではない。今回は「post-midboss に手作り判断が追加されたか」までに限定する。

## 設計サイクル 1

良いところ / 悪いところ 30 件:

1. 良い: v47 は clear / grade S を維持している。
2. 良い: v47 は `crossLockWave` を trace に持つ。
3. 良い: v47 は複数 bot policy を持つ。
4. 良い: v47 は latest2 compare の対象にできる。
5. 良い: midboss 後 2920-3290f は wave を追加しやすい。
6. 良い: 既存 enemy type だけで実装できる。
7. 良い: tank 2 体は hard target として読みやすい。
8. 良い: delayed heli は横移動の lock として使いやすい。
9. 良い: shield wall 前に判断を置ける。
10. 良い: route label に wave 名を残せる。
11. 悪い: tank fire によって過密になる可能性。
12. 悪い: midboss 後は既に left/right chain があり、追加で読みにくくなる可能性。
13. 悪い: headless route bot が強すぎると人間難度を読み違える。
14. 悪い: `postMidCrossWave` は spawn の事実で、面白さの証明ではない。
15. 悪い: event count threshold が変わる。
16. 悪い: score / kill count が上がると易化にも見える。
17. 良い: policy split で route/aggressive/defensive/panic の差を見られる。
18. 良い: cross-lock と post-mid cross を別 trace にできる。
19. 良い: v47 を壊さず v48 として派生できる。
20. 良い: source path を v48 にできる。
21. 良い: README/devlog/design_log を v48 用に残せる。
22. 悪い: ブラウザ視認性は今回も未確認。
23. 悪い: movementSwitches は局所 wave の差を薄める。
24. 良い: route event 追加は coverage に確実に出る。
25. 良い: latest2 compare で missing field を 0 扱いにできる。
26. 悪い: JSONL 追記は既存 dirty state と混ざりやすい。
27. 良い: stage 対象を今回ファイルだけに絞れる。
28. 悪い: v31 が存在せず version series が既に飛んでいる。
29. 良い: v48 は自然な次番号。
30. 悪い: 完成判断にはまだ人間評価が必要。

改善案 30 件:

1. v47 を v48 へコピーする。
2. `GAME_VERSION` を v48 にする。
3. title / h1 を v48 にする。
4. ledger source を v48 にする。
5. `ROUTE_SOURCE_NOTES` に v48 の意図を書く。
6. `traceDigest.postMidCrossWave` を追加する。
7. t=3040 に route event を足す。
8. label は `DP post-midboss cross squeeze` にする。
9. intent は `POST_MID_CROSS_SQUEEZE` にする。
10. lane は 0.50 にする。
11. crossing tank は左右 2 体にする。
12. tank duration は 300 frame にする。
13. tank は fireT 70 / 82 で撃たせる。
14. heli は 10 体にする。
15. heli delay は 12f 開始 / 9f 間隔にする。
16. heli duration は 250 frame にする。
17. group は `post_mid_cross_<t>` にする。
18. `dpPostMidCrossSqueeze` flag を立てる。
19. `postMidCrossWave` event を記録する。
20. event extra に tanks / helis / duration / window を入れる。
21. v48 headless check を作る。
22. check で route label を確認する。
23. check で `postMidCrossWave === 1` を確認する。
24. style compare v008 を作る。
25. v008 record は version v48 とする。
26. latest2 compare に `postMidCrossWave` delta を足す。
27. README を v48 用に書き換える。
28. devlog に戻し方を書く。
29. continuous directive を更新する。
30. staging に verification を残す。

筋の良い案:

midboss 後の left/right recovery の間に、左右から crossing tank が入り、その隙間を delayed heli が斜めに抜ける `post-midboss cross squeeze` を入れる。解決できる問題は、midboss 後が単なる回収列に寄りすぎていた点。新しい懸念は、tank fire によって人間には過密で読みにくくなる点。

## 採用案

`t=3040` に `DP post-midboss cross squeeze` を追加する。敵数は tank 2 体、heli 10 体。tank は左右から交差し、heli は 12f 開始 / 9f 間隔で反対側へ抜ける。duration は tank 300f、heli 250f。実装後は `traceDigest.postMidCrossWave === 1`、route label 到達、route clear を focused check で見る。

## 懸念

- headless が clear できても、人間が wave を読めるとは限らない。
- `postMidCrossWave` は spawn 事実の trace で、wave の面白さを直接測らない。
- tank 2 体が撃つため、v47 より局所圧が高くなりすぎる可能性がある。
- 次サイクルではブラウザ確認か、v47/v48 の wave 視認性調整に進む。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v48_check.js
node tools\headless_game_style_compare_v008.js
node tools\compare_graze_log_style_latest2.js
```

期待条件:

- route は clear / grade S / BOMB 使用を維持する。
- route label に `DP post-midboss cross squeeze` が含まれる。
- `exportEvalLedger()` の trace digest に `bossCue: 1` / `bossCueVolley: 1` / `bossCueSteer: 1` / `crossLockWave: 1` / `postMidCrossWave: 1` が入る。
- style compare v008 が v48 record を JSONL に追記する。
- latest2 compare が v47 -> v48 の delta を出し、`postMidCrossWave` が最新側で 1 になっている。

## 検証結果

2026-05-22 実行。

- `node tools\headless_graze_log_cdx_v05_2_v48_check.js`: pass。
- route bot: `mode=clear`、`grade=S`、`routeEvents=29`、`killCount=162`、`maxChain=20`、`bombCount=1`。
- route trace: `bossCue=1`、`bossCueVolley=1`、`bossCueSteer=1`、`crossLockWave=1`、`postMidCrossWave=1`、`movementSwitches=333`。
- `node tools\headless_game_style_compare_v008.js`: pass。v48 record を `memory/raw/game_eval/graze_log_style_compare.jsonl` に追記。
- `node tools\compare_graze_log_style_latest2.js`: pass。v47 -> v48 で route/aggressive/defensive は `postMidCrossWave` が 0 -> 1。route は clear 維持、routeEvents +1、kills +13、movementSwitches +22。aggressive は clear 維持、kills +12、movementSwitches +25。defensive は over のままだが routeEvents +1、kills +22、movementSwitches +53、`postMidCrossWave` 0 -> 1。

## 次の作業

v47 の boss 前 cross-lock wave と v48 の post-midboss cross-squeeze wave をブラウザで見比べ、人間に横移動判断として読めるか確認する。読みにくい場合は敵の色・軌道・出現間隔を調整し、headless 指標より視認性を優先する。
