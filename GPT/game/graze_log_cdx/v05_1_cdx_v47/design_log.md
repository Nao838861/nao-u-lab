# graze_log v05.2_cdx_v47 design_log

## 対象 directive

Slack pending の game directive は今回なし。`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。

Nao_u 指示原文:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

直近 directive の焦点:

> 次は cue steer が人間に読める表示になっているかを見るか、boss cue 周辺の深追いを止めて道中敵配置の本質変更へ戻る。

## 実装前判断

今回は boss cue 周辺を止め、道中敵配置へ戻す。v46 は `bossCueSteer` を trace に入れたが、bot が state の GAP を読んで動く限り、人間の読みやすさの証拠ではない。1 サイクルの playable diff としては、boss 前に横移動の判断が見える手作り wave を追加し、具体 wave / 敵数 / 座標 / duration / trace を残す方が本質改善に近い。

使った過去知見:

- `Playable / Headless 評価`: clear だけでなく、route event と sparse trace に「何を追加したか」を残す。
- `Balance / Rule Space`: pressure / movementSwitches は良し悪しの断定ではなく、wave 変更の比較補助として扱う。
- `Repair / Iterative Improvement`: v46 から小さい派生にし、latest2 compare で差分を追えるようにする。
- `Feedback / Rights / Human Judgment`: headless は人間評価の代替ではない。今回は「道中に手作り判断が追加されたか」までに限定する。

## 設計サイクル 1

良いところ / 悪いところ 30 件:

1. 良い: v46 は clear / grade S を維持している。
2. 良い: v46 は policy split を持つ。
3. 良い: v46 は ledger export を持つ。
4. 良い: v46 は boss cue steering trace を持つ。
5. 良い: latest2 compare が既にある。
6. 良い: boss 前はまだ route event を追加しやすい。
7. 良い: stock carrier は既存報酬文法に合う。
8. 良い: heli braid は既存描画と衝突しにくい。
9. 良い: t=3820 は boss approach 前に空きがある。
10. 良い: hand-authored wave はランダム出現より評価しやすい。
11. 悪い: boss cue 周辺の視認性は未確認のまま残る。
12. 悪い: wave を増やすと boss 前が過密になる可能性。
13. 悪い: route bot が強すぎると人間難度を読み違える。
14. 悪い: stock carrier の報酬が gauge を過剰補給する可能性。
15. 悪い: heli 8 体は chain を伸ばしすぎる可能性。
16. 悪い: 既存 route count が増え、check 条件がずれる。
17. 良い: route count は `ROUTE_EVENTS.length` 基準なので対応しやすい。
18. 良い: `crossLockWave` event を別に残せる。
19. 良い: v46 を壊さず v47 として派生できる。
20. 良い: boss cue の深追い停止理由を記録できる。
21. 悪い: movementSwitches は stage 全体集計で局所差が薄い。
22. 悪い: urgentPct が上がっても面白さの証明ではない。
23. 良い: route label に wave 名を残せば後から確認できる。
24. 良い: event extra に敵数と duration を残せる。
25. 悪い: visual cue は増えないため見た目の読みやすさは限定的。
26. 良い: 既存 stock / heli だけなら新 UI なしで playable。
27. 悪い: boss start 4140 に干渉すると regression する。
28. 良い: wave duration 330 frame なら boss 直前で終わる。
29. 良い: JSONL record で v46->v47 比較できる。
30. 悪い: この 1 wave だけで完成とは言えない。

改善案 30 件:

1. v47 を v46 からコピーする。
2. `GAME_VERSION` を v47 にする。
3. title / h1 を v47 にする。
4. ledger source を v47 にする。
5. `ROUTE_SOURCE_NOTES` に v47 の意図を書く。
6. t=3820 に route event を足す。
7. label は `DP cross-lock carrier braid` にする。
8. intent は `CROSS_LOCK_BEFORE_BOSS` にする。
9. lane は 0.50 にする。
10. 2 体の stock carrier を左右から交差させる。
11. stock carrier duration は 330 frame にする。
12. 8 体の heli を左右交互に出す。
13. heli は 18 frame から 11 frame 刻みで遅延する。
14. heli の中継 x を左右交差にする。
15. `dpCrossLockCarriers` flag を立てる。
16. `crossLockWave` event を記録する。
17. event extra に carriers / helis / duration / window を入れる。
18. traceDigest に `crossLockWave` を追加する。
19. v47 headless check を作る。
20. check で route label を確認する。
21. check で `crossLockWave === 1` を確認する。
22. style compare v007 を作る。
23. v007 record は version v47 とする。
24. latest2 compare に crossLockWave delta を足す。
25. README を v47 用に書き換える。
26. devlog に戻し方を書く。
27. design_log に敵数 / 座標 / duration を明記する。
28. continuous directive を更新する。
29. staging に verification を残す。
30. commit / push する。

筋の良い案:

boss 前に「左右から stock carrier が交差し、その間を heli が遅延してロックする」wave を入れる。解決できる問題は、boss 前が stock 補給から boss approach へ滑るだけで、横移動判断の密度が弱かった点。新しい懸念は、headless が clear できても人間にとって読める wave かは未検証な点。

## 設計サイクル 2

良いところ / 悪いところ 30 件:

1. 良い: 2 stock + 8 heli は敵数が明確。
2. 良い: 座標を固定できる。
3. 良い: duration を固定できる。
4. 良い: 既存 enemy type だけで実装できる。
5. 良い: crossing path は見た目に変化がある。
6. 良い: delayed heli は chain 接続になる。
7. 良い: stock は BOMB stock 前の文法とつながる。
8. 悪い: stock が撃たないので圧が弱い可能性。
9. 悪い: heli が撃たないので弾幕密度は増えない。
10. 良い: boss 前に弾密度を増やしすぎない。
11. 悪い: 横移動だけで縦判断が薄い。
12. 良い: このゲームは横 route 判断が主題なので許容。
13. 悪い: wave label が増えて route UI が長くなる。
14. 良い: HUD は stable dimensions で問題になりにくい。
15. 悪い: route bot の lane 0.50 が中央寄りすぎる可能性。
16. 良い: target priority が stock / heli を追うため lane だけに依存しない。
17. 悪い: aggressive policy が楽に潰す可能性。
18. 良い: policy split でその差を見られる。
19. 悪い: panic policy は端逃げなので wave 評価に弱い。
20. 良い: panic の限界は directive に既に明記済み。
21. 悪い: `crossLockWave` event は spawn の事実で、撃破の質ではない。
22. 良い: 今回の目的は「手作り wave が入った証拠」なので十分。
23. 悪い: movementSwitches が増えない場合もある。
24. 良い: traceDigest delta は event presence を別に持つ。
25. 良い: boss cue fields は維持される。
26. 悪い: latest2 compare は JSONL の既存状態に依存する。
27. 良い: style compare v007 で v47 record を追記する。
28. 悪い: JSONL は実行時刻で増えるため stage 対象に注意が必要。
29. 良い: commit は今回 touched files だけに絞る。
30. 悪い: 既存の大量 dirty 差分は残る。

改善案 30 件:

1. stock 左 start x は `W*.22`。
2. stock 右 start x は `W*.78`。
3. 左 stock は `0.22 -> 0.38 -> 0.64 -> 0.76`。
4. 右 stock は `0.78 -> 0.62 -> 0.36 -> 0.24`。
5. stock y は `-28 -> 92 -> 210 -> H+42`。
6. heli は左右交互に出す。
7. heli start は `-20` または `W+20`。
8. heli y は `58 + i*10`。
9. heli mid y は `142 + i*12`。
10. heli exit は反対側の `0.82` / `0.18`。
11. heli delay は `18 + i*11`。
12. heli duration は 270 frame。
13. group は `cross_lock_<t>`。
14. stock fireT は 9999 にする。
15. heli fireT も 9999 にする。
16. 弾圧ではなくルート圧にする。
17. route event は 3820f。
18. boss approach 3920f は維持する。
19. boss start 4140f は維持する。
20. check は bossProbe labels に cross-lock を要求する。
21. check は ledger digest に crossLockWave を要求する。
22. style compare は ledger stable 条件に crossLockWave を足す。
23. latest2 compare は missing を 0 扱いにする。
24. methodVersion は `headless-style-v007`。
25. interpretation に boss cue でなく道中 wave と書く。
26. README には実行方法だけ残す。
27. design_log は長くても日本語で残す。
28. devlog は戻し方を明記する。
29. staging は path / verification / residual risk を記録する。
30. continuous directive は next focus を人間視認性か midboss wave にする。

## 設計サイクル 3

良いところ / 悪いところ 30 件:

1. 良い: v47 は boss cue 深追い停止として明確。
2. 良い: route event が増えるので coverage に出る。
3. 良い: crossLockWave event が digest に出る。
4. 良い: wave 敵数が明確。
5. 良い: wave window が明確。
6. 良い: 座標が固定で再現可能。
7. 良い: existing check をほぼ再利用できる。
8. 良い: v46 の評価基盤を壊さない。
9. 悪い: wave の快感はまだ headless だけでは判断できない。
10. 悪い: 表示の読みやすさは未確認。
11. 悪い: stock が報酬過多なら BOMB economy に影響する。
12. 良い: style compare で emergencyUses を見られる。
13. 悪い: boss 前に敵が残ると boss と干渉する。
14. 良い: duration と timing を短くして回避する。
15. 悪い: final boss が近く、事故原因の切り分けが難しい。
16. 良い: `crossLockWave` と route label が切り分け入口になる。
17. 悪い: chain が伸びすぎると grade が易化する。
18. 良い: clear / grade S は regression ではなく既存水準。
19. 悪い: panic policy の結果は wave 評価には薄い。
20. 良い: route / aggressive / defensive の差で見る。
21. 良い: v47 の作業単位は playable diff として小さい。
22. 悪い: 1 wave なので完成度の総合改善は限定的。
23. 良い: 次の wave 改善へ繋ぎやすい。
24. 悪い: latest2 compare の pass は差分存在に寄る。
25. 良い: headless check は playable regression も見る。
26. 良い: design_log に限界を残せる。
27. 悪い: user feedback がない限り「良い」は保留。
28. 良い: 人間確認前の候補として出せる。
29. 良い: commit 単位が明確。
30. 悪い: 既存 dirty worktree に混ぜない注意が必要。

改善案 30 件:

1. v47 index を patch する。
2. v47 README を書き直す。
3. v47 devlog を書き直す。
4. v47 design_log を書き直す。
5. v47 check を patch する。
6. v007 compare を patch する。
7. latest2 compare を patch する。
8. check を実行する。
9. v007 compare を実行する。
10. latest2 compare を実行する。
11. 必要なら threshold を実測に合わせる。
12. route clear を維持する。
13. bossCueSteer を維持する。
14. crossLockWave を必須にする。
15. route label を必須にする。
16. event count threshold は既存以上にする。
17. JSONL 追記 record を確認する。
18. continuous directive を更新する。
19. staging を更新する。
20. git status で自分の差分を確認する。
21. 自動サイクル由来の差分は stage しない。
22. 新規 v47 directory を stage する。
23. v47 tools を stage する。
24. latest2 compare を stage する。
25. continuous directive を stage する。
26. staging を stage する。
27. JSONL record は今回の検証証拠として stage する。
28. commit する。
29. push する。
30. push 後 status を確認する。

採用案:

`t=3820` に `DP cross-lock carrier braid` を追加する。敵数は stock carrier 2 体、heli 8 体。stock carrier は左右から交差し、heli は 18f 開始 / 11f 間隔で遅延しながら反対側へ抜ける。duration は stock 330f、heli 270f。実装後は `traceDigest.crossLockWave === 1`、route label 到達、route clear を focused check で見る。

## 懸念

- headless が clear できても、人間が wave を読めるとは限らない。
- `crossLockWave` は spawn 事実の trace で、wave の面白さを直接測らない。
- boss 前の BOMB economy が易化していないかは、style compare の emergencyUses / score / chain で継続確認する。
- 次サイクルではブラウザ確認か、midboss 前後の wave 追加に進む。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v47_check.js
node tools\headless_game_style_compare_v007.js
node tools\compare_graze_log_style_latest2.js
```

期待条件:

- route は clear / grade S / BOMB 使用を維持する。
- route label に `DP cross-lock carrier braid` が含まれる。
- `exportEvalLedger()` の trace digest に `bossCue: 1` / `bossCueVolley: 1` / `bossCueSteer: 1` / `crossLockWave: 1` が入る。
- style compare v007 が v47 record を JSONL に追記する。
- latest2 compare が v46 -> v47 の delta を出し、`crossLockWave` が最新側で 1 になっている。

## 検証結果

2026-05-22 実行。

- `node tools\headless_graze_log_cdx_v05_2_v47_check.js`: pass。
- route bot: `mode=clear`、`grade=S`、`routeEvents=28`、`killCount=149`、`maxChain=18`、`bombCount=1`。
- route trace: `bossCue=1`、`bossCueVolley=1`、`bossCueSteer=1`、`crossLockWave=1`、`movementSwitches=311`。
- `node tools\headless_game_style_compare_v007.js`: pass。v47 record を `memory/raw/game_eval/graze_log_style_compare.jsonl` に追記。
- `node tools\compare_graze_log_style_latest2.js`: pass。v46 -> v47 で route/aggressive/defensive は `crossLockWave` が 0 -> 1。route は clear 維持、routeEvents +1、kills +10、movementSwitches +2。aggressive は clear 維持、kills +10、movementSwitches +18。defensive は over のままだが routeEvents +1、kills +2、`crossLockWave` 0 -> 1。

## 次の作業

cross-lock wave が人間に横移動判断として読めるかを確認する。読めるなら midboss 前後にも同じ密度の手作り wave を入れる。読みにくいなら、敵の色・軌道・出現間隔を調整し、headless ではなくブラウザ上の視認性を優先して直す。
