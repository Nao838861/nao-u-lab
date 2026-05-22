# graze_log v05.2_cdx_v51 design_log

## 対象 directive 原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

現在の焦点:

> 次は v50 を実ブラウザで見て、薄すぎないか、chevron がまだ説明記号として強すぎないかを確認する。Browser Use Node REPL が使えない場合は screenshot harness を先に整備する。

## 実装前判断

Browser Use の skill は読んだが、このセッションでは Node REPL 実行ツールが公開されていない。実ブラウザでの目視確認はできないため、v51 は playable diff と focused visual harness の組にする。v50 の alpha / lineWidth / path 数は維持し、chevron だけを削る。これは「敵が通る faint path」は残し、「矢印記号を追う UI」へ寄る要素だけを消す狭い変更である。

参照した過去知見:

- `memory/game_design_rules.md`: 説明や禁止ルールで支え始めたら深追い停止を検討し、見えているルールから入力結果を予測できる状態を優先する。
- `memory/game_memory_task_lens_index.md`: Playable / Headless 評価、Balance / Rule Space、Repair / Iterative Improvement。
- v50 design_log: guide は読めるが主役ではない表現へ下げる、実ブラウザ確認は未完了。

## 設計サイクル 1

良いところ / 悪いところ 30 件:

1. 良い: v50 は guide alpha と線幅を既に控えめにした。
2. 悪い: chevron は敵軌道ではなく方向記号に見える。
3. 良い: guide path は横移動 wave の予兆として機能する。
4. 悪い: chevron があると path より矢印が読まれる可能性がある。
5. 良い: v50 は route clear / grade S を維持している。
6. 悪い: headless は視線吸引を測れない。
7. 良い: chevron 削除は敵配置を変えない。
8. 悪い: direction cue が少し弱くなる。
9. 良い: 交差する 2 path があれば意図は残る。
10. 悪い: path が薄い場合は予兆全体が弱くなる。
11. 良い: event に style payload を残せる。
12. 悪い: v50 の event には chevron 有無がない。
13. 良い: v51 で `chevrons:false` を記録できる。
14. 悪い: 既存 compare は chevron を直接比較しない。
15. 良い: canvas command harness なら drawGuide の余分な stroke を検出できる。
16. 悪い: screenshot 画像そのものではない。
17. 良い: Browser Use 不在時の focused evaluation としては軽い。
18. 悪い: 実際の色味、残像、視認性はまだ人間確認が必要。
19. 良い: v51 は reversible な polish。
20. 悪い: 面白さを大きく増やす差分ではない。
21. 良い: 完成へ向けた説明記号の削減になる。
22. 悪い: 初見プレイヤーの読みやすさが落ちる可能性。
23. 良い: 敵色分けは残る。
24. 悪い: 敵色も説明過多なら次に削る必要がある。
25. 良い: guide count は 2 のまま維持できる。
26. 悪い: guide duration はまだ長いかもしれない。
27. 良い: route / aggressive / defensive / panic 比較は維持できる。
28. 悪い: panic は端逃げ policy で人間の焦りではない。
29. 良い: trace に変更理由を残せる。
30. 悪い: Nao_u の完成判断はまだ得ていない。

改善案 30 件:

1. v50 を v51 にコピーする。
2. version 表示を v51 に更新する。
3. source path を v51 に更新する。
4. source notes に chevron 削除を追記する。
5. `drawGuide()` の chevron stroke を削除する。
6. `state.guides` に `chevrons:false` を入れる。
7. guide event に `chevrons:false` を入れる。
8. alpha 0.10 は維持する。
9. lineWidth 2.2 は維持する。
10. post-midboss 2 path は維持する。
11. cross-lock 2 path は維持する。
12. 敵配置は変えない。
13. 弾 fireT は変えない。
14. route timeline は変えない。
15. bot policy は変えない。
16. score / reward は変えない。
17. v51 headless check を作る。
18. check で clear / grade S を見る。
19. check で `chevrons:false` を見る。
20. visual check で guide stroke 数を見る。
21. visual check で chevron-like stroke が 0 か見る。
22. style compare v011 を作る。
23. compare latest2 を再利用する。
24. README を v51 用に更新する。
25. devlog に Browser Use 不在を書き残す。
26. continuous directive を更新する。
27. staging に結果を書く。
28. 自分のファイルだけ stage する。
29. commit する。
30. push する。

筋の良い案:

chevron だけを削り、path guide と敵色は残す。解決できる問題は、補助が「矢印を追う UI」に見える点。新しく生じる懸念は、初見の direction cue が弱くなる点。

## 設計サイクル 2

良いところ / 悪いところ 30 件:

1. 良い: v51 は v50 の polish 延長として自然。
2. 悪い: screenshot 画像ではなく command harness なので見た目の保証は限定的。
3. 良い: draw command は chevron 有無を deterministic に検出できる。
4. 悪い: canvas の実レンダリング品質までは測れない。
5. 良い: guide stroke が path 本数だけなら説明記号は減る。
6. 悪い: 線だけでも UI lane に見える可能性は残る。
7. 良い: `chevrons:false` は ledger に残る。
8. 悪い: traceDigest には style detail が出ない。
9. 良い: focused check が ledger events を直接読む。
10. 悪い: compare latest2 は v50 -> v51 の digest 同値になりやすい。
11. 良い: digest 同値は gameplay を壊していない証拠になる。
12. 悪い: 変化が小さすぎると次の評価で差が見えにくい。
13. 良い: 中央線は v50 で削除済み。
14. 悪い: post-midboss の左右 2 path もまだ長い。
15. 良い: route bot は guide を見ずに clear する。
16. 悪い: bot は人間の読みやすさを測れない。
17. 良い: enemy color は wave のまとまりを支える。
18. 悪い: enemy color と guide が二重説明のままかもしれない。
19. 良い: chevron 削除は最小で戻しやすい。
20. 悪い: 戻す基準は人間目視が必要。
21. 良い: file:// でそのまま開ける。
22. 悪い: dev server を立てても本質は変わらない。
23. 良い: 既存 vm harness と相性が良い。
24. 悪い: DOM や CSS の視覚崩れは見ない。
25. 良い: game canvas は主要 UI が canvas 内なので command harness の価値がある。
26. 悪い: フォントやアンチエイリアスは評価しない。
27. 良い: routeEvents 29 を維持できる。
28. 悪い: 完成条件の Nao_u 判定は未達。
29. 良い: 次の実ブラウザ確認ポイントが明確になる。
30. 悪い: 継続 directive はまだ active のまま。

改善案 30 件:

1. `drawGuide` から chevron block だけ削る。
2. `g.chevrons` を false にする。
3. event payload も false にする。
4. check で payload を確認する。
5. visual check で guide alpha <= 0.10 を filter する。
6. visual check で guide color を filter する。
7. visual check で lineWidth 2.2 を filter する。
8. post-midboss frame を 3090 で見る。
9. cross-lock frame を 3890 で見る。
10. active guide kind を確認する。
11. path stroke count 2 を確認する。
12. chevron-like 3 command stroke 0 を確認する。
13. nonBlank draw ops を確認する。
14. route clear check を維持する。
15. style compare JSONL を v51 で追記する。
16. latest2 digest で gameplay 同値を確認する。
17. design_log に browser limitation を書く。
18. devlog に戻し方を書く。
19. README に visual check の意味を書く。
20. CONTINUOUS_DIRECTIVE の焦点を次へ送る。
21. staging に verification を書く。
22. `.tmp` は作らない。
23. 既存 dirty memory は触らない。
24. node script は dependency なしにする。
25. vm の canvas mock は draw API を広めに持つ。
26. v51 check は v50 check の条件を維持する。
27. source notes 条件に v51 を足す。
28. ledger source を v51 にする。
29. title screen を v51 にする。
30. push 後 status を見る。

筋の良い案:

Browser Use の代替は「画像を偽装する」ではなく、canvas command で今回の視覚差分の核を直接検査する。解決できる問題は chevron が本当に削除されたかの回帰検出。新しい懸念は、人間の見え方評価を先送りすること。

## 設計サイクル 3

良いところ / 悪いところ 30 件:

1. 良い: v51 は playable file を持つ。
2. 良い: v50 からの差分が明確。
3. 良い: route bot clear を維持できる見込み。
4. 良い: guide event は 2 件のまま。
5. 良い: chevron 削除が ledger に残る。
6. 良い: visual command check がある。
7. 良い: Browser Use 不在の理由を記録できる。
8. 良い: stage の手作り wave は壊さない。
9. 良い: 敵数と座標を変えない。
10. 良い: BOMB / Active DEF の評価軸を維持する。
11. 悪い: 実ブラウザ screenshot はまだない。
12. 悪い: guide が薄すぎるかは未判定。
13. 悪い: enemy color の強さは未判定。
14. 悪い: chevron 削除で初見性が下がる可能性。
15. 悪い: visual harness は fun を測らない。
16. 悪い: panic policy の限界は残る。
17. 悪い: digest 同値は人間評価の代用ではない。
18. 悪い: 完成判定にはユーザー判断が必要。
19. 良い: 次は実ブラウザ確認に絞れる。
20. 良い: もし薄すぎるなら alpha 0.12 へ戻す判断がしやすい。
21. 良い: もし読めるなら guide duration 短縮を試せる。
22. 良い: もしまだ説明的なら enemy color へ寄せられる。
23. 良い: git diff は scoped にできる。
24. 悪い: workspace には既存 dirty が多い。
25. 良い: explicit stage で混入を避けられる。
26. 良い: verification を design_log に追記する。
27. 良い: continuous directive の last_result を更新する。
28. 良い: staging に path と commit を残せる。
29. 悪い: push 失敗時は hash 報告が必要。
30. 良い: 今回の変更は完成 polishing として妥当。

改善案 30 件:

1. 採用案を v51 no-chevron guide に固定する。
2. v50 との差分を index に限定する。
3. README を新仕様にする。
4. design_log を新規にする。
5. devlog を新規にする。
6. v51 normal check を作る。
7. v51 visual check を作る。
8. v011 style compare を作る。
9. route clear を実行する。
10. visual check を実行する。
11. style compare を実行する。
12. latest2 compare を実行する。
13. 結果を design_log に追記する。
14. 結果を directive に追記する。
15. 結果を staging に追記する。
16. git status を確認する。
17. 自分の追加ファイルだけ stage する。
18. directive と staging の自分の更新だけ stage する。
19. JSONL 追記があれば必要分だけ stage する。
20. commit message を `game:` にする。
21. push する。
22. push 後 clean/ahead を確認する。
23. 残課題を実ブラウザ確認に絞る。
24. Nao_u 完成判断は pending にしない。
25. 次焦点を `alpha 0.10 の視認性` にする。
26. `chevron` 再導入は人間が読めない場合だけにする。
27. 追加 wave は今回はやらない。
28. score tuning は今回はやらない。
29. UI card 追加はやらない。
30. Claude 側フォルダは触らない。

筋の良い案:

v51 は、v49 で入れた読みやすさ補助を「線だけ」に削ぎ、v50 の quiet guide をさらにゲーム内表現へ寄せる。解決できる問題は説明記号感。新しい懸念は視認性低下で、次回の実ブラウザ確認で判断する。

## 採用案

`v05_1_cdx_v51` として、v50 の stage / enemy / bullet / route / bot policy を維持し、guide chevron だけを削除する。guide event には `chevrons:false` を残し、headless check と canvas command visual check で検証する。

## 懸念

- 実ブラウザ screenshot ではないため、視覚品質の最終判断は未完了。
- chevron を消すことで、初見時の横移動 direction cue が弱くなる可能性がある。
- enemy color がまだ説明記号として強い可能性は残る。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v51_check.js
node tools\headless_graze_log_cdx_v05_2_v51_visual_check.js
node tools\headless_game_style_compare_v011.js
node tools\compare_graze_log_style_latest2.js
```

期待条件:

- route は clear / grade S / BOMB 使用を維持する。
- `crossLockWave === 1` と `postMidCrossWave === 1` を維持する。
- `crossLockGuide === 1`、`postMidCrossGuide === 1`、`readabilityGuides === 2` が trace digest に入る。
- guide event は `alpha === 0.10`、`lineWidth === 2.2`、`paths === 2`、`chevrons === false`。
- visual check は guide stroke が各 wave 2 本、chevron-like stroke が 0 本であることを確認する。

## 検証結果

2026-05-22 実行。

- `node tools\headless_graze_log_cdx_v05_2_v51_check.js`: pass。
- route bot: `mode=clear`、`grade=S`、`routeEvents=29`、`killCount=162`、`maxChain=20`、`bombCount=1`。
- route trace: `crossLockWave=1`、`postMidCrossWave=1`、`crossLockGuide=1`、`postMidCrossGuide=1`、`readabilityGuides=2`、`bossCueSteer=1`。
- guide event: 2 件、`alpha=0.10`、`lineWidth=2.2`、crossLock paths 2、postMid paths 2、`chevrons=false`。
- `node tools\headless_graze_log_cdx_v05_2_v51_visual_check.js`: pass。post-mid frame 3090 と cross-lock frame 3890 で nonblank draw ops を確認し、各 guide の path stroke は 2 本、chevron-like stroke は 0 本。
- `node tools\headless_game_style_compare_v011.js`: pass。v51 record を `memory/raw/game_eval/graze_log_style_compare.jsonl` に追記。
- `node tools\compare_graze_log_style_latest2.js`: pass。v50 -> v51 で route / aggressive は clear 維持、defensive / panic は over 維持。route / aggressive / defensive / panic の routeEvents、kills、pressure、movementSwitches、guide trace digest は同値。これは chevron 削除が stage / enemy / bullet / route / bot movement を変えていないことの補助証拠。

## 残課題

実ブラウザまたは Browser Use で、alpha 0.10 / lineWidth 2.2 / chevron なしが薄すぎないかを確認する。薄すぎる場合は alpha 0.12 か短い fade timing へ戻す。
