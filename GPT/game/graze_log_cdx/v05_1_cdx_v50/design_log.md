# graze_log v05.2_cdx_v50 design_log

## 対象 directive 原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

現在の焦点:

> 次は v49 をブラウザで見て、guide が敵本体より目立ちすぎないか、中央線が説明過多でないかを確認する。必要なら alpha / 色 / 中央線を調整する。

## 実装前判断

一番楽しい瞬間は、手作り wave の横圧を見て、中央が絞られる前に左右どちらへ逃げるかを判断する瞬間。v49 の lane guide は R-C「見えないものは存在しない」に合うが、中央線は敵の未来軌道ではなく UI 記号に近く、R-A の核体験を guide 追跡へずらす危険がある。今回は敵配置や弾を増やさず、v49 guide を「読めるが主役ではない」表現へ下げる。

参照した過去知見:

- `memory/game_design_rules.md`: 見えない補正や説明されない状態遷移を避け、根源仕様を検証する。
- `memory/game_memory_task_lens_index.md`: Playable / Headless 評価、Balance / Rule Space。
- Claude `game_lessons_log.md` R-A / R-C / R-F: 核体験を守る、画面で読めるものだけをルールにする、指標が誰の行動で取られるかを書く。

## 設計サイクル 1

良いところ / 悪いところ 30 件:

1. 良い: v49 guide は横移動 wave の存在を早く伝える。
2. 悪い: alpha 0.16 / 3px は敵より補助線が目立つ可能性。
3. 良い: guide は敵より背面に描かれている。
4. 悪い: post-midboss の中央線は敵の軌道ではなく説明記号に見える。
5. 良い: 敵配置は既に headless clear 済み。
6. 悪い: 補助線を強めると回避ではなく線追跡になる。
7. 良い: v49 は guide event を trace に残す。
8. 悪い: trace は人間の視線吸引を測らない。
9. 良い: alpha / lineWidth は可逆に調整できる。
10. 悪い: 色を変えすぎると弾や敵の意味と混線する。
11. 良い: cross-lock は 2 本の交差 path だけで意図が読める。
12. 悪い: post-midboss の 3 本目は意味が過剰。
13. 良い: 敵色分けは wave のまとまりを保つ。
14. 悪い: 専用敵色と guide の両方が強いと二重説明になる。
15. 良い: v50 は stage 構造を変えずに出せる。
16. 悪い: 実ブラウザスクリーンショットは今回安定取得できない。
17. 良い: Chrome は起動でき、該当 frame まで進むことは確認した。
18. 悪い: CDP screenshot JSON の分割受信処理が未整備。
19. 良い: headless で guide style payload は検証できる。
20. 悪い: alpha 0.10 が薄すぎる可能性。
21. 良い: 2.2px は視認性と控えめさの中間。
22. 悪い: canvas の線幅は環境で見え方が違う。
23. 良い: path 数を event に記録すれば中央線削除を検証できる。
24. 悪い: event count だけでは style 変更を検出できない。
25. 良い: `addWaveGuide()` の記録拡張は局所的。
26. 悪い: headless mock が style payload を直接見ないと意味が薄い。
27. 良い: v50 check に alpha / lineWidth / paths を入れられる。
28. 悪い: `compare_latest2` は style payload を比較しない。
29. 良い: v010 style compare は v50 ledger を保存できる。
30. 悪い: 完成判定はまだ Nao_u の実プレイ確認が必要。

改善案 30 件:

1. v49 を v50 にコピーする。
2. `GAME_VERSION` を v50 にする。
3. title / h1 / title screen を v50 にする。
4. ledger source を v50 にする。
5. source notes に quiet guide を追記する。
6. `GUIDE_ALPHA` を定数化する。
7. alpha を 0.16 から 0.10 に下げる。
8. `GUIDE_LINE_WIDTH` を定数化する。
9. lineWidth を 3 から 2.2 に下げる。
10. guide event に alpha を記録する。
11. guide event に lineWidth を記録する。
12. guide event に path 数を維持する。
13. post-midboss の中央線を削る。
14. cross-lock の 2 path は残す。
15. post-midboss の左右 2 path は残す。
16. 敵色は v49 のまま残す。
17. 敵数は変えない。
18. 弾 fireT は変えない。
19. route timeline は変えない。
20. bot policy は変えない。
21. score / reward は変えない。
22. v50 headless check を作る。
23. check で route clear / grade S を見る。
24. check で guide trace 2 件を見る。
25. check で alpha / lineWidth を見る。
26. check で post-midboss paths が 2 であることを見る。
27. v010 style compare を作る。
28. README を v50 用に更新する。
29. devlog に browser fallback の限界を書く。
30. continuous directive と staging を更新する。

筋の良い案:

「guide の存在」ではなく「guide の控えめさ」を検証対象にする。解決できる問題は、v49 が人間に読めるかを目指した結果、補助線が主役化しそうな点。新しい懸念は、alpha を下げすぎて予兆が消える点。

## 設計サイクル 2

良いところ / 悪いところ 30 件:

1. 良い: 中央線削除は説明過多だけを取り除く。
2. 悪い: 中央 squeeze の危険中心が読みにくくなる可能性。
3. 良い: 左右 2 path があれば「交差」は残る。
4. 悪い: path が薄くなると背景グリッドに埋もれる可能性。
5. 良い: 敵色分けが残るので wave のまとまりは残る。
6. 悪い: 色分けも補助説明であるため強すぎれば同じ問題。
7. 良い: v50 は R-E の対症療法ではなく表現重心の修正。
8. 悪い: 実ブラウザ評価なしで最終判断できない。
9. 良い: headless は regression を防ぐ。
10. 悪い: headless は guide の視覚優先度を測らない。
11. 良い: alpha / lineWidth / paths は deterministic に検証できる。
12. 悪い: 数値を検証しても「良い見え方」は保証しない。
13. 良い: stage の fun-affecting variables を変えない。
14. 悪い: fun の伸びは小さい。
15. 良い: 完成に向けた polish として妥当。
16. 悪い: wave を増やさないため驚きは増えない。
17. 良い: guide が敵より背面にある状態を維持する。
18. 悪い: 背面でも明るい線は視線を吸う。
19. 良い: chevron は小さいまま残る。
20. 悪い: chevron も方向記号として説明感がある。
21. 良い: 今回 chevron は変えず差分を狭める。
22. 悪い: 問題が chevron 側なら次版が必要。
23. 良い: `recordEvalEvent` に style payload を足すのは将来比較に使える。
24. 悪い: `traceDigest` には style payload が出ない。
25. 良い: ledger events には残る。
26. 悪い: compare latest2 は digest のみ。
27. 良い: focused check は ledger events を直接見る。
28. 悪い: style compare v010 は JSONL 追記で既存 dirty と混ざるため stage 注意。
29. 良い: commit 対象を明示すれば混入を避けられる。
30. 悪い: Chrome screenshot の未完了は残課題として報告が必要。

改善案 30 件:

1. alpha を 0.12 にする案。
2. alpha を 0.10 にする案。
3. alpha を 0.08 にする案。
4. lineWidth を 2 にする案。
5. lineWidth を 2.2 にする案。
6. lineWidth を 2.5 にする案。
7. 中央線だけ削る案。
8. chevron も削る案。
9. guide duration を短くする案。
10. guide fade-in を長くする案。
11. guide fade-out を短くする案。
12. guide を敵が出る前だけにする案。
13. guide 色をさらに背景寄りにする案。
14. guide を点線にする案。
15. guide を敵色と同系の暗色にする案。
16. 敵色だけにして guide を消す案。
17. path 数を event に入れる案。
18. alpha / width を event に入れる案。
19. traceDigest に guide style を入れる案。
20. ledger events だけに入れる案。
21. screenshot harness を次回整備する案。
22. v49 のまま残し目視だけ行う案。
23. v50 playable diff として先に薄くする案。
24. post-midboss だけ変える案。
25. cross-lock も同じ style に揃える案。
26. enemy color を戻す案。
27. enemy color は残す案。
28. route bot は seed 12345 のままにする案。
29. panic は限界付き比較のまま残す案。
30. README に headless 限界を書く案。

筋の良い案:

alpha 0.10 / lineWidth 2.2 / 中央線削除を採用する。解決できる問題は、guide が敵の動きを読む補助ではなく lane UI として読まれる点。新しい懸念は薄さ不足または過剰で、これは次の実ブラウザ評価で調整する。

## 設計サイクル 3

良いところ / 悪いところ 30 件:

1. 良い: v50 は playable diff として小さい。
2. 良い: 直近 directive の焦点に直接答える。
3. 良い: guide の主役化を抑える。
4. 良い: 敵配置の完成度を壊さない。
5. 良い: route clear を維持できる見込み。
6. 良い: guide trace 2 件を維持する。
7. 良い: path 数 2/2 を証拠に残せる。
8. 良い: alpha / width を ledger に残せる。
9. 良い: v49 との比較が読みやすい。
10. 良い: README が実行方法を示す。
11. 悪い: 人間評価はまだできていない。
12. 悪い: CDP screenshot 取得が失敗した。
13. 悪い: 実ブラウザでの色味は未確認。
14. 悪い: guide が薄すぎるかもしれない。
15. 悪い: chevron の説明感は残る。
16. 悪い: enemy color もまだ強いかもしれない。
17. 悪い: style compare は fun verdict ではない。
18. 悪い: v50 は新しい wave を増やさない。
19. 良い: 新 wave 追加より完成 polishing に近い。
20. 良い: continuous directive の焦点を消化できる。
21. 良い: stage / bot / ledger の安定性を維持する。
22. 良い: `compare_latest2` で v49 -> v50 の result 変化を見られる。
23. 悪い: digest では guide style delta が見えない。
24. 良い: v50 check が style payload を補う。
25. 良い: commit は game diff と verification を一体にできる。
26. 悪い: 既存ログ・記憶の dirty state が大量にある。
27. 良い: 自分のファイルだけ stage できる。
28. 良い: push まで行える。
29. 悪い: 完成条件には Nao_u 判断が必要。
30. 良い: 次サイクルの入口が明確になる。

改善案 30 件:

1. 採用案を v50 quiet guide に固定する。
2. post-midboss centerline を削除する。
3. guide alpha を 0.10 にする。
4. guide lineWidth を 2.2 にする。
5. constants として読みやすくする。
6. guide event に style を出す。
7. check で style payload を見る。
8. check で source note v50 を見る。
9. check で route clear を見る。
10. check で grade S を見る。
11. check で bomb use を見る。
12. check で crossLockGuide を見る。
13. check で postMidCrossGuide を見る。
14. check で readabilityGuides 2 を見る。
15. style compare v010 を実行する。
16. latest2 compare を実行する。
17. devlog に CDP fallback の失敗を書く。
18. design_log に headless 限界を書く。
19. continuous directive を更新する。
20. staging に path / verification を書く。
21. JSONL 追記は自分の作業として stage する。
22. 既存サイクルログ差分は混ぜない。
23. Chrome 一時プロセスは止める。
24. `.tmp` screenshot 失敗生成物は commit しない。
25. `git status` で確認する。
26. 明示 stage する。
27. `game:` commit にする。
28. push する。
29. push 後 status を見る。
30. 残課題は実ブラウザ確認に限定する。

筋の良い案:

v50 は「読みやすさ追加」から「読みやすさの過剰を抑える」段階に進む。解決できる問題は、v49 の中央線と強めの線幅が説明 UI に寄る点。新しく生じる懸念は、補助が薄くなって横圧を読む助けが弱くなる点。

## 採用案

`v05_1_cdx_v50` として、v49 の enemy / route / bullet / bot policy を維持し、guide 表現だけを調整する。`GUIDE_ALPHA=0.10`、`GUIDE_LINE_WIDTH=2.2`、post-midboss guide は左右 2 path のみ。guide event に style payload を残し、headless check で検証する。

## 懸念

- 実ブラウザ screenshot が未完了なので、見た目の最終判断はまだできない。
- guide が薄すぎる場合、v47/v48 の横移動 wave がまた読みにくくなる。
- chevron がまだ説明記号として強い場合、次版で chevron を削るか短時間化する必要がある。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v50_check.js
node tools\headless_game_style_compare_v010.js
node tools\compare_graze_log_style_latest2.js
```

期待条件:

- route は clear / grade S / BOMB 使用を維持する。
- `crossLockWave === 1` と `postMidCrossWave === 1` を維持する。
- `crossLockGuide === 1`、`postMidCrossGuide === 1`、`readabilityGuides === 2` が trace digest に入る。
- guide event は `alpha === 0.10`、`lineWidth === 2.2`、crossLock paths 2、postMid paths 2。
- style compare v010 が v50 record を `memory/raw/game_eval/graze_log_style_compare.jsonl` に追記する。

## 検証結果

2026-05-22 実行。

- `node tools\headless_graze_log_cdx_v05_2_v50_check.js`: pass。
- route bot: `mode=clear`、`grade=S`、`routeEvents=29`、`killCount=162`、`maxChain=20`、`bombCount=1`。
- route trace: `crossLockWave=1`、`postMidCrossWave=1`、`crossLockGuide=1`、`postMidCrossGuide=1`、`readabilityGuides=2`、`bossCueSteer=1`、`movementSwitches=333`。
- quiet guide style: guide event は 2 件、`alpha=0.10`、`lineWidth=2.2`、crossLock paths 2、postMid paths 2。
- `node tools\headless_game_style_compare_v010.js`: pass。v50 record を `memory/raw/game_eval/graze_log_style_compare.jsonl` に追記。
- `node tools\compare_graze_log_style_latest2.js`: pass。v49 -> v50 で route / aggressive / defensive / panic の digest は同値。route / aggressive は clear 維持、defensive / panic は result over 維持。これは guide style だけを変え、stage / enemy / bullet / route / bot movement を変えていないことの補助証拠。

## 残課題

Browser Use の Node REPL 操作ツールが出ておらず、Chrome CDP screenshot 取得も分割 JSON 受信で止まったため、実ブラウザの見た目は未確認。次サイクルでは screenshot harness を安定化するか、手動ブラウザ確認で alpha 0.10 / lineWidth 2.2 が薄すぎないかを見る。
