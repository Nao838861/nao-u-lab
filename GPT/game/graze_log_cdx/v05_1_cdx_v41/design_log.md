# graze_log v05.2_cdx_v41 design_log

## 対象 directive

`memory/slack_directives.jsonl` の pending game directive `log-cdx-1779337186-a414e7c064` を対象にした。`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の active 指示も同じ作業対象に含めた。

Slack 原文:

> Log_cdx、あなたにはヘッドレスプレイでゲームを正しく評価する方法を見つけて欲しい。
> 今与える新しい課題として、shot _logと、あなたが改変したものをヘッドレスで遊ばせて、どちらが良いゲームかを評価できるか試してみて欲しい。
> 元のshot_log v01をGPT側にコピーして、あなたが改変したバージョンと合わせてヘッドレスプレイで比較して、どこがどう変わったか、その変化は良いものなのか悪いものなのか、さらによくするにはどうすればいいか、などを評価する方法を確立してほしい。
> そのためには、ヘッドレスに求められるものは何か？
> プレイスタイルは複数必要なのか、プレイ中の緩急を見るためにどんな指標が使えるか、評価のためにどんな情報をどんな頻度で記録してあとから参照すべきかなど、これまでの記憶を生かして良い方法を見つけて欲しい

continuous directive:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 実装前判断

今回の playable diff は、敵配置やスコアをまた増やすことではなく、v40 のプレイを壊さずに「評価に必要な観測点」をゲーム本体へ入れることにした。理由は、Nao_u の問いが「新しい強化」ではなく「headless に何を求めるか、どう比較するか」だから。

使う過去知見:

- `Playable / Headless 評価`: 起動/clear だけでなく playthrough の中身を見る。
- `Balance / Rule Space`: 良し悪しを単一スコアで断定せず、style vector と比較条件で読む。
- `Feedback / Rights / Human Judgment`: headless は人間評価の代替ではなく、人間が問題にした差分を検証可能にする補助。
- shot_log v01 headless の学び: center/aggressive/defensive/sweeper の policy split は、核ループがどの行動を報酬するかを見るのに有効。

## 設計サイクル 1

良いところ / 悪いところ 30件:

1. 良い: v40 は clear 可能。
2. 良い: v40 は route commit flag を持つ。
3. 良い: v40 は BOMB 使用を検査できる。
4. 良い: v40 は route event timeline を持つ。
5. 良い: shot_log には複数 policy headless がある。
6. 良い: shot_log は power economy を見られる。
7. 悪い: v40 の headless は clear 成功へ寄りすぎている。
8. 悪い: v40 はプレイ中の緩急を集計していない。
9. 悪い: v40 は movement style を記録していない。
10. 悪い: v40 は target uptime を見ていない。
11. 悪い: v40 は pressure を定量化していない。
12. 悪い: shot_log と graze_log は指標名が違う。
13. 悪い: score はゲームごとにスケールが違う。
14. 悪い: clear だけでは面白さを誤判定する。
15. 悪い: BOMB 回数だけでは緊急性が分からない。
16. 良い: 30 frame cadence は chain window と一致する。
17. 良い: sparse event log は後から trace を読める。
18. 良い: route coverage は v40 の構造に合う。
19. 良い: target uptime は shot_log の撃つ核にも使える。
20. 良い: urgent frame 率は緩急を見る入口になる。
21. 悪い: 人間の「気持ちいい」は直接測れない。
22. 悪い: bot が一種類だと style 比較が弱い。
23. 悪い: 低頻度 sample では一瞬の事故を落とす可能性。
24. 良い: sparse event と併用すれば事故点を拾える。
25. 良い: eventCount はログ欠損検出になる。
26. 良い: sampleCount は cadence 検証になる。
27. 悪い: telemetry を UI へ出しすぎると邪魔。
28. 良い: headless API にだけ summary を出せばよい。
29. 良い: v40 のゲーム性を変えずに追加できる。
30. 良い: 次版以降の比較基盤になる。

改善案 30件:

1. v40 を v41 にコピーする。
2. title を v41 にする。
3. `state.evalTelemetry` を追加する。
4. sample cadence を 30 frame にする。
5. player x/y を記録する。
6. gauge を記録する。
7. chain / maxChain を記録する。
8. enemy count を記録する。
9. enemy bullet count を記録する。
10. phaseIntent を記録する。
11. targetVisible を記録する。
12. nearest bullet distance から pressure を出す。
13. urgent frame を pressure から数える。
14. danger spike を pressure bucket 上昇で数える。
15. horizontal switch を数える。
16. vertical switch を数える。
17. route intent switch を数える。
18. route event を sparse log に残す。
19. kill event を sparse log に残す。
20. bomb event を sparse log に残す。
21. activeDef event を sparse log に残す。
22. shieldHit event を sparse log に残す。
23. clear/gameOver event を sparse log に残す。
24. `summarizeEvalTelemetry()` を作る。
25. v41 focused check を作る。
26. shot_log parser を作る。
27. style compare script を作る。
28. README/devlog を更新する。
29. continuous directive を更新する。
30. staging と slack directive を閉じる。

筋の良い案:

- **headless-style-v001**: 30 frame sample + sparse event + style vector を最小標準にする。

解決できる問題:

- clear-only 判定から抜けられる。
- shot_log と graze_log を同じ比較表に載せられる。
- 「どこが変わったか」を後から event / sample で追える。

新しく生じる懸念:

- bot style が少ないゲームでは、比較が「その bot にとって」へ偏る。
- score の絶対値を比較すると誤る。

## 設計サイクル 2

候補比較 30件:

1. score 絶対値比較案: ゲーム差が大きすぎる。
2. clear 可否案: 粗すぎる。
3. survival time 案: 必要だが単独では不足。
4. kill count 案: 敵密度に依存する。
5. max chain 案: chain ゲームには有効。
6. target uptime 案: STG の核に近い。
7. urgentPct 案: 緩急を拾える。
8. maxThreat 案: ピーク圧力を拾える。
9. dangerSpikes 案: 緊張の山を拾える。
10. movement switches 案: 操作の忙しさを拾える。
11. route coverage 案: 手作り stage の到達を拾える。
12. event log 案: 根拠を後追いできる。
13. 1 frame 全記録案: 重い。
14. 60 frame sample 案: 粗い。
15. 30 frame sample 案: chain window と合う。
16. 10 frame sample 案: 今回は過剰。
17. 複数 bot 必須案: 理想だが v41 の最小 diff には重い。
18. まず一 bot + telemetry 案: 今回に合う。
19. UI overlay 案: 人間プレイを邪魔する。
20. summary API 案: headless で使いやすい。
21. JSONL 保存案: 次回に有効。
22. 今回は console JSON 案: 最小で検証可能。
23. shot_log policy split は維持する。
24. graze_log policy split は次回課題にする。
25. 評価語は「better」より「signature」に寄せる。
26. 良し悪しは人間 feedback と照合する。
27. 変化検出は telemetry が担当する。
28. 面白さ断定はしない。
29. v41 で採用する。
30. compare script で方法名を固定する。

改善案 30件:

1. methodVersion を `headless-style-v001` にする。
2. fixedInputs を report に出す。
3. requiredSignals を report に出す。
4. shotSignature を出す。
5. grazeSignature を出す。
6. interpretation を短く出す。
7. pass/fail は方法の成立だけにする。
8. score 絶対比較は pass 条件にしない。
9. shot_log は center > defensive を見る。
10. shot_log は aggressive score > defensive を見る。
11. shot_log は sweeper fail を見る。
12. shot_log は bomb policy split を見る。
13. graze_log は clear を見る。
14. graze_log は route coverage を見る。
15. graze_log は pressure trace を見る。
16. graze_log は intent switch を見る。
17. graze_log は sparse events を見る。
18. v41 check には telemetry 条件を足す。
19. existing v40 条件は維持する。
20. source note に v41 を足す。
21. README に実行コマンドを書く。
22. devlog に数値を書く。
23. design_log に残課題を書く。
24. continuous directive last_result を更新する。
25. slack directive を handled にする。
26. staging に path と検証を書く。
27. unrelated dirty files は stage しない。
28. commit する。
29. push する。
30. push 後 status を確認する。

## 設計サイクル 3

実装採用 30件:

1. v41 は v40 のコピーから始める。
2. ルールと敵配置は触らない。
3. telemetry だけを追加する。
4. sample は 30 frame。
5. event は sparse。
6. pressure は nearest enemy bullet distance。
7. target uptime は enemies が自機より上にいる frame。
8. urgentPct は pressure >= 0.58。
9. dangerSpike は pressure bucket 上昇。
10. movement switch は入力方向の反転。
11. routeIntentSwitch は phaseIntent 変化。
12. summarize API を headless へ公開する。
13. v41 check で existing flags を確認する。
14. v41 check で sampleCount を確認する。
15. v41 check で eventCount を確認する。
16. v41 check で route coverage を確認する。
17. v41 check で style vector を確認する。
18. compare script で shot_log を実行する。
19. compare script で shot summary を parse する。
20. compare script で v41 HTML を VM 実行する。
21. compare script で method report を出す。
22. pass 条件は比較方法の成立に限定する。
23. README を書く。
24. devlog を書く。
25. design_log を書く。
26. continuous directive を更新する。
27. slack directive を close する。
28. staging に記録する。
29. commit/push する。
30. 残課題を明記する。

捨てたもの:

- 「どちらが良いゲームか」を単一スコアで断定する案。
- v41 で敵配置や BOMB を再調整する案。
- UI overlay を増やす案。
- 1 frame ごとの全量ログを保存する案。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v41_check.js
node tools\headless_game_style_compare_v001.js
```

## 検証結果

2026-05-21 実行。

- v41 check: `mode=clear`、`grade=S`、`killCount=140`、`maxChain=18`、`bombCount=1`。`evalTelemetryCadence`、`evalTelemetryCoverage`、`evalTelemetryStyleVector` は true。
- v41 telemetry: `sampleCount=144`、`eventCount=171`、`routeCoveragePct=1`、`targetUptime=0.669`、`urgentPct=0.036`、`maxThreat=0.949`、`dangerSpikes=21`、`horizontalSwitches=233`。
- style compare: shot_log は center が defensive より長く、aggressive は defensive より score が高く、sweeper は 5.9s で崩壊し、BOMB 使用が policy ごとに分離した。graze_log は coverage / pressure / movement / event trace が取れた。

## この方法で分かること

- どの policy が生き残るか、どの policy が核ループへ届くか。
- プレイ中に敵を見ている時間がどのくらいあるか。
- 緊急状態があるか、ピーク圧力だけでなく山の回数があるか。
- route / wave が最後まで到達しているか。
- BOMB / Active DEF / 被弾が、どの phase で起きたか。

## この方法でまだ分からないこと

- 人間がその変化を良いと感じるか。
- 操作が納得できるか。
- 画面表現が意図通り読まれるか。
- graze_log の別 play style で同じ結論になるか。

## 次の作業

graze_log 側にも center / aggressive / defensive / route-follow / panic-bomb など複数 bot style を追加し、shot_log と同じ「policy split」で比較する。今回の v41 はその前提として、まず記録形式を揃えた。
