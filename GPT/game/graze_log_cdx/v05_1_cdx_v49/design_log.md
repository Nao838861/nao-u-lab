# graze_log v05.2_cdx_v49 design_log

## 対象 directive

Slack pending の game directive は今回なし。`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。

Nao_u 指示原文:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

直近 directive の焦点:

> 次は v47/v48 の 2 つの横移動 wave が人間に読めるかをブラウザで見るか、視認性優先で敵色・軌道・出現間隔を調整する。

## 実装前判断

今回は新しい敵配置を増やさず、v47/v48 の手作り横移動 wave を読めるようにする。v48 時点で `crossLockWave` と `postMidCrossWave` は trace に入ったが、headless は「人間が見て理解できるか」を判定しない。v49 では、敵本体の出現前から薄い軌道 guide を出し、該当 wave の敵色を通常敵と分ける。これは R-C「見えないものは存在しない」と R-F「指標は人間条件と一致しない可能性」を優先した判断。

使った過去知見:

- `Playable / Headless 評価`: clear 維持と guide trace を focused check で見る。
- `Balance / Rule Space`: 今回は敵数・弾数・難度を増やさず、既存 wave の読めなさだけを切る。
- `Repair / Iterative Improvement`: v48 派生にして、v48 -> v49 の差分を guide 追加に限定する。
- `Feedback / Rights / Human Judgment`: 人間評価の代替として headless を使わない。guide は「確認しやすくする」ための一手。

## 設計サイクル 1

良いところ / 悪いところ 30 件:

1. 良い: v48 は route clear / grade S を維持している。
2. 良い: v48 は 2 本の手作り横移動 wave を持つ。
3. 良い: `crossLockWave` と `postMidCrossWave` は trace に残る。
4. 良い: route / aggressive / defensive / panic の policy split がある。
5. 良い: v48 から小さく派生できる。
6. 良い: wave の敵数を増やさなくても改善余地がある。
7. 良い: 敵色の変更は人間視認性に直結する。
8. 良い: 軌道 guide は wave の意図を事前に見せられる。
9. 良い: guide を trace に入れれば存在確認できる。
10. 良い: 既存 bot の clear 成立を検証しやすい。
11. 悪い: guide が UI 記号として目立ちすぎる危険がある。
12. 悪い: 線を見て避けるゲームになり、敵本体の読みが薄れる危険がある。
13. 悪い: headless は guide の視認性を測れない。
14. 悪い: 色分けが派手すぎると画面が騒がしくなる。
15. 悪い: post-midboss は既に敵が多く、guide が重なる可能性がある。
16. 悪い: cross-lock は boss 前なので cue と混ざる可能性がある。
17. 良い: guide は削除しやすい。
18. 良い: duration を wave duration と合わせられる。
19. 良い: 透明度を低くすれば説明過多を避けられる。
20. 良い: 敵色は該当 group だけに限定できる。
21. 悪い: draw だけの変更だと trace に残らない。
22. 悪い: trace だけだと画面表示の証拠にならない。
23. 良い: `state.guides` を作れば draw と trace を接続できる。
24. 良い: source notes に v49 の意図を書ける。
25. 良い: README で実行方法を保てる。
26. 悪い: design_log が視認性判断を断定しすぎると危険。
27. 良い: 検証条件を「guide trace + clear 維持」に限定できる。
28. 悪い: ブラウザ目視は今回も完全自動化しにくい。
29. 良い: 次サイクルで実ブラウザ確認へ進める。
30. 悪い: まだ完成判定ではない。

改善案 30 件:

1. v48 を v49 にコピーする。
2. `GAME_VERSION` を v49 にする。
3. title / h1 / title screen を v49 にする。
4. ledger source を v49 にする。
5. source notes に readable cross wave を追加する。
6. `state.guides` を追加する。
7. `addWaveGuide()` を作る。
8. `drawGuide()` を作る。
9. guide を enemies より先に描く。
10. guide 透明度を低くする。
11. guide は duration 終了で消す。
12. cross-lock に黄色 guide を出す。
13. post-midboss に水色 guide を出す。
14. post-midboss は中央軸も薄く出す。
15. cross-lock stock の色を通常 stock と変える。
16. cross-lock heli を通常 heli と変える。
17. post-midboss tank を通常 tank と変える。
18. post-midboss heli を通常 heli と変える。
19. guide event は `crossLockGuide` / `postMidCrossGuide` に分ける。
20. trace digest に guide count を追加する。
21. headless v49 check を作る。
22. check で guide trace 2 件を見る。
23. check で route clear / grade S を維持する。
24. style compare v009 を作る。
25. latest2 compare に guide delta を出す。
26. README を v49 用に更新する。
27. devlog に戻し方を書く。
28. design_log に headless の限界を書く。
29. continuous directive を更新する。
30. staging に検証結果を残す。

筋の良い案:

敵配置を増やさず、hand-authored wave の視認性だけを可逆に足す。解決できる問題は、v47/v48 の横移動判断が headless trace 上の事実に留まり、人間に読めるか不明だった点。新しい懸念は、guide が敵の動きを読む補助ではなく、UI 記号そのものを追うゲームに寄る点。

## 設計サイクル 2

良いところ / 悪いところ 30 件:

1. 良い: 透明 guide は敵の未来軌道を先に見せる。
2. 良い: 軌道が見えれば突然の横圧に見えにくい。
3. 良い: 色分けは該当 wave のまとまりを示せる。
4. 良い: group 名で描画を分けられる。
5. 良い: 敵性能を変えない。
6. 良い: bot policy への影響は小さい。
7. 良い: guide event は evaluation ledger に自然に載る。
8. 良い: v48 との比較がわかりやすい。
9. 良い: `readabilityGuides` は 2 で固定できる。
10. 良い: route event count は増えない。
11. 悪い: event count は guide 分だけ増える。
12. 悪い: event count threshold が既存 check に影響する可能性。
13. 悪い: drawGuide が canvas mock にない API を使うと headless が壊れる。
14. 悪い: setLineDash は mock 追加が必要なので避けるべき。
15. 悪い: 文字 label は説明過多になる。
16. 悪い: guide が弾と同系色だと混線する。
17. 良い: 黄色と水色は弾の赤橙と分離しやすい。
18. 良い: cross-lock と post-midboss を色で区別できる。
19. 良い: guide は低 alpha なら背景レイヤになる。
20. 良い: route bot の movement 指標を壊さないはず。
21. 悪い: 人間の注意が guide に吸われる可能性は残る。
22. 悪い: 実際の回避可能性は guide だけでは増えない。
23. 良い: 今回の目的は回避可能性ではなく読みやすさ。
24. 良い: 次に読みにくければ出現間隔を調整できる。
25. 良い: v49 は evaluation と playable diff の両方を満たせる。
26. 悪い: ブラウザ確認なしでは最終判断できない。
27. 良い: headless は「壊していない」ことを確認できる。
28. 良い: `tools/compare_graze_log_style_latest2.js` に delta を残せる。
29. 悪い: JSONL 追記は既存 dirty state と混ざるので stage 注意。
30. 良い: commit は自分が触ったファイルだけに絞れる。

改善案 30 件:

1. guide は `ctx.globalAlpha=0.16` 程度にする。
2. fade-in 24f を入れる。
3. fade-out 42f を入れる。
4. 太さは 3px にする。
5. guide は敵より背面に描く。
6. chevron を小さく置く。
7. テキスト label は出さない。
8. guide path は実敵 trace の主要点に合わせる。
9. cross-lock は carrier path 2 本にする。
10. post-midboss は tank path 2 本にする。
11. post-midboss は中央 squeeze 軸を 1 本足す。
12. guide event は spawn 時だけ記録する。
13. `readabilityGuides` は digest で合算する。
14. v49 check は digest を見る。
15. v49 check は eventTypes も見る。
16. style compare は ledgerIsStable に guide を含める。
17. latest2 compare は missing field 0 扱いのままにする。
18. README の検証コマンドを v49 にする。
19. devlog に「敵数は変えていない」と書く。
20. design_log に「人間評価ではない」と書く。
21. continuous directive に last_result を更新する。
22. staging に path / verification / residual risk を残す。
23. route bot は seed 12345 のままにする。
24. aggressive / defensive / panic も style compare で通す。
25. `exportEvalLedger().source` を忘れず更新する。
26. title screen の v48 を残さない。
27. source notes の v48 は履歴として残す。
28. source notes に v49 を追記する。
29. canvas mock に存在する API だけを使う。
30. `strokeRect` は既存 mock にあるので使ってよい。

筋の良い案:

guide は「未来軌道の薄い影」としてのみ扱い、文字説明や強い警告表示にしない。解決できる問題は R-C の「見えないものは存在しない」。新しい懸念は、視認性改善がゲーム内の自然な敵挙動ではなく開発者の補助線に見える点。

## 設計サイクル 3

良いところ / 悪いところ 30 件:

1. 良い: v49 は root 仕様を変えない。
2. 良い: 横移動 wave の読みだけを改善する。
3. 良い: 「新 wave 追加」より完成方向に近い。
4. 良い: trace digest が guide の存在を保証する。
5. 良い: route clear を維持できれば regression は小さい。
6. 良い: eventTypes で guide 2 件を確認できる。
7. 良い: guide は future path なので失敗の納得に寄与する。
8. 良い: 敵色分けは wave のまとまりを作る。
9. 良い: player の操作核は変えない。
10. 良い: BOMB / Active DEF に触れない。
11. 悪い: guide はまだ体感評価が必要。
12. 悪い: guide の alpha は仮値。
13. 悪い: post-midboss 中央線が余計かもしれない。
14. 悪い: cross-lock の pink heli が派手すぎるかもしれない。
15. 悪い: tank 水色が味方の弾と近い可能性。
16. 悪い: 色だけでは移動方向までは読めない可能性。
17. 良い: chevron で方向を少し示せる。
18. 良い: guide duration が wave と同期する。
19. 良い: 次版で出現間隔調整に移れる。
20. 良い: compare latest2 で v48 -> v49 の主差分が出る。
21. 悪い: guide event 追加で riskEconomyScore などは変わらない。
22. 良い: それでよい。今回は fun verdict ではない。
23. 良い: browser で開けば playable。
24. 良い: headless check が focused。
25. 良い: design_log に原文指示を残した。
26. 良い: devlog に戻し方を残せる。
27. 悪い: 完成条件にはまだ Nao_u 判断が必要。
28. 良い: continuous directive は active のままにする。
29. 良い: Slack pending はないので close 処理不要。
30. 良い: commit は game diff と tool diff を一体の playable unit にできる。

改善案 30 件:

1. 採用案を v49 guide に固定する。
2. 敵数は変更しない。
3. 弾 fireT も変更しない。
4. score / reward も変更しない。
5. `state.guides` を reset 対象にする。
6. guide update/filter を `update()` に入れる。
7. draw order は background -> guide -> enemies にする。
8. guide は visible だが薄くする。
9. guide は trace line API と同じ点列を使う。
10. `crossLockGuide` event を spawnCrossLock に入れる。
11. `postMidCrossGuide` event を spawnPostMid に入れる。
12. digest に `crossLockGuide` を入れる。
13. digest に `postMidCrossGuide` を入れる。
14. digest に `readabilityGuides` を入れる。
15. v49 headless check は guide digest を必須にする。
16. v009 compare は ledger stable に guide を入れる。
17. latest2 compare に readability delta を表示する。
18. README を v49 化する。
19. devlog を v49 化する。
20. design_log を v49 化する。
21. continuous directive の last_result を更新する。
22. staging の Game Start に追記する。
23. headless v49 check を実行する。
24. style compare v009 を実行する。
25. latest2 compare を実行する。
26. git status で自分の差分だけ確認する。
27. stage 対象を明示する。
28. commit message は `game:` prefix にする。
29. push する。
30. push 後 status を確認する。

筋の良い案:

v49 は「敵配置の追加」ではなく「既に作った wave を人間が読める playable 表現にする」版として出す。解決できる問題は、作り込みが trace にだけ現れて画面上の意味に変換されていない点。新しい懸念は、guide による説明過多であり、これは次の実ブラウザ確認で薄さ・必要性を判定する。

## 採用案

`v05_1_cdx_v49` として、`crossLockGuide` / `postMidCrossGuide` を追加する。guide は wave duration 中だけ表示し、敵より背面に薄く描く。該当 wave の敵色も通常敵と分ける。敵数、弾、score、route timeline は変えない。

## 懸念

- guide が目立ちすぎると、敵の動きではなく補助線を追うゲームになる。
- headless は guide の存在を trace できるだけで、人間の読みやすさを直接測れない。
- 次サイクルではブラウザで v49 を見て、guide の透明度・色・中央線の有無を判断する。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v49_check.js
node tools\headless_game_style_compare_v009.js
node tools\compare_graze_log_style_latest2.js
```

期待条件:

- route は clear / grade S / BOMB 使用を維持する。
- `crossLockWave === 1` と `postMidCrossWave === 1` を維持する。
- `crossLockGuide === 1`、`postMidCrossGuide === 1`、`readabilityGuides === 2` が trace digest に入る。
- style compare v009 が v49 record を `memory/raw/game_eval/graze_log_style_compare.jsonl` に追記する。

## 検証結果

2026-05-22 実行。

- `node tools\headless_graze_log_cdx_v05_2_v49_check.js`: pass。
- route bot: `mode=clear`、`grade=S`、`routeEvents=29`、`killCount=162`、`maxChain=20`、`bombCount=1`。
- route trace: `crossLockWave=1`、`postMidCrossWave=1`、`crossLockGuide=1`、`postMidCrossGuide=1`、`readabilityGuides=2`、`bossCueSteer=1`、`movementSwitches=333`。
- `node tools\headless_game_style_compare_v009.js`: pass。v49 record を `memory/raw/game_eval/graze_log_style_compare.jsonl` に追記。
- `node tools\compare_graze_log_style_latest2.js`: pass。v48 -> v49 で route/aggressive/defensive は `crossLockGuide` 0 -> 1、`postMidCrossGuide` 0 -> 1、`readabilityGuides` 0 -> 2。route / aggressive は clear 維持、defensive / panic は結果維持。route の kills / pressure / movementSwitches は v48 と同値。
