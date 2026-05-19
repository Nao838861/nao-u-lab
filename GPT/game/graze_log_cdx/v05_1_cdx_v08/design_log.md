# graze_log v05.2_cdx_v08 - design_log

## 対象 directive

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

> boss の削り感、BOMB を使いたくなる局面、初見クリア可能性を調整する。

Slack pending の新規 game directive は今回なし。local continuous directive を対象にした。

## 実装前判断

v07 は BOMB stock の由来を midboss と warning scout に分散し、boss 開始時に BOMB ready を維持できた。次に残る問題は、final phase に入った瞬間が「BOMB を使いたくなる局面」としてどれだけ読めるかである。

今回は v07 を `v05_1_cdx_v08/` にコピーし、boss final phase へ入った時に短い charge を置いてから `BOMB NOW` cue を出す。数値経済や BOMB damage は触らず、押し時の視認性だけを改善する。使う過去知見は `memory/game_design_rules.md` の「見えるルールから入力結果を予測できること」、`gravity_courier_v001_success_case` の「単純なルールを見える形に限定する」、`Playable / Headless 評価` lens の「起動確認ではなく playable 条件を見る」である。

## 設計サイクル 1: final phase の読みやすさ

良いところ/悪いところ 30 件:

1. v07 は boss BOMB clear が通る。
2. v07 は boss 開始時の gauge 直付けを使っていない。
3. midboss reward は stage の節目として読める。
4. warning reward は top-off として読める。
5. BOMB cooldown と brake は悪用不可を維持している。
6. final phase の popup は `BOMB WINDOW` と出る。
7. ただし popup だけでは押すタイミングが瞬間的で弱い。
8. final phase の弾幕はすぐ通常 pattern に入る。
9. 初見では「今押すべき」より「危なくなったら押す」に見える。
10. BOMB は final phase 用に作った資源なので、局面側もそれを受けるべき。
11. charge は見える予告として機能する。
12. charge が長すぎると停止時間に見える。
13. charge が短すぎると popup と変わらない。
14. 84F は約 1.4 秒で読める。
15. cue 後に一度だけまとまった弾を出すと押し時になる。
16. cue 弾を強くしすぎると BOMB 必須になる。
17. BOMB 必須は初見 clear 可能性を削る。
18. 低速 ring + aimed 1 発なら、避ける余地もある。
19. BOMB ready なら押したくなる。
20. BOMB がない場合でも即死誘導にはしない。
21. boss HP を触らずに済む。
22. BOMB damage を触らずに済む。
23. warning economy の検証を壊しにくい。
24. final phase の cue は headless で検査しやすい。
25. 人間体感はまだ別途必要。
26. 今回は browser/manual ではなく playable diff を優先する。
27. cue 表示はタイトル説明にも反映する。
28. `FINAL_BOMB_CUE_FRAMES` を定数化すると検証しやすい。
29. v07 を残すため比較可能。
30. 今回の変更は視認性に限定するのが筋がよい。

改善案 30 件:

1. `FINAL_BOMB_CUE_FRAMES=84` を追加する。
2. boss に `finalChargeT` を持たせる。
3. boss に `finalCueFired` を持たせる。
4. final phase 移行時に `FINAL PHASE - CHARGE` を出す。
5. final phase 移行時に charge ring を出す。
6. final phase 移行時に boss の次射撃を 84F 後へ送る。
7. cue 未発火なら `BOMB NOW` を出す。
8. cue 未発火なら低速 ring を一度だけ出す。
9. cue 未発火なら aimed 1 発を添える。
10. cue 後は既存 panic pattern に戻す。
11. BOSS_HP は 44 のまま維持する。
12. BOMB damage は 12 のまま維持する。
13. BOMB brake は 120F のまま維持する。
14. BOMB cooldown は 720F のまま維持する。
15. MIDBOSS reward は 36 のまま維持する。
16. WARNING reward は 14 のまま維持する。
17. boss start ready 検査を維持する。
18. final cue 検査を追加する。
19. simpleBot は cue 後に BOMB を使うようにする。
20. simpleBot clear を維持する。
21. source regex で `BOMB NOW` を検査する。
22. source regex で `FINAL PHASE - CHARGE` を検査する。
23. `FINAL_BOMB_CUE_FRAMES` の範囲を検査する。
24. README に新しい狙いを書く。
25. devlog に戻し手順を書く。
26. directive の last_result を更新する。
27. staging に path と検証を書く。
28. v08 check を別ファイルにする。
29. 既存自動サイクル差分は stage しない。
30. commit は v08 関連だけにする。

筋の良い案:

final phase を `CHARGE -> BOMB NOW -> panic pattern` に分ける。解決できる問題は、BOMB stock を作った後の「押す局面」が popup だけに依存していたこと、final phase 移行が読みにくかったこと。新しい懸念は、BOMB cue が強制に見えることだが、cue 弾は低速で避けられる形にして、BOMB がなくても即失敗にしない。

## 設計サイクル 2: cue の強さ

良いところ/悪いところ 30 件:

1. 低速 ring は見た目に cue として強い。
2. aimed 1 発はプレイヤーに反応方向を作る。
3. ring 18 発は画面上で存在感がある。
4. 18 発は過密すぎない。
5. speed 1.45 は BOMB なしでも読める。
6. final phase の通常 ring 12 発 speed 1.92 より遅い。
7. cue が通常 pattern より遅いことで警告に見える。
8. 遅すぎると危険が薄い。
9. 速すぎると BOMB 必須になる。
10. BOMB brake と相性がよい。
11. BOMB を押すと cue 弾を消して押し返せる。
12. BOMB を押さない場合は避けて続行できる。
13. 1.4 秒 charge は認識時間として妥当。
14. 2 秒以上だと tempo が緩む。
15. 1 秒未満だと初見で読みにくい。
16. charge ring は boss 周辺に置くべき。
17. player 周辺に置くと事故防止 ring と混同する。
18. popup は boss 下に置くべき。
19. HUD 変更は今回不要。
20. final phase だけを触るなら道中 balance は壊れにくい。
21. headless は cue flag を見られる。
22. simpleBot の BOMB 条件を cue 後に変えると意図を検査できる。
23. cue 後 BOMB で clear できれば playable。
24. cue 前 BOMB を許すと検証が甘くなる。
25. nearBullets BOMB は残して emergency を保つ。
26. boss final cue が出る前に危険なら BOMB してもよい。
27. ただし simpleBot の主経路は cue 後にする。
28. BOMB count は 1 以上を維持する。
29. boss final entered を維持する。
30. v08 は完成判定でなく読みやすさの改善である。

改善案 30 件:

1. cue ring は `radialBurst(e,18,1.45,...)` にする。
2. cue aimed は `aimedBullet(e,2.2)` にする。
3. cue 後 `fireT=104` で通常 panic へ戻す。
4. final charge 中は boss draw に ring を重ねる。
5. final charge は `finalChargeT` の decrement で描画する。
6. charge ring alpha は進行に応じて上げる。
7. title を `readable bomb window` にする。
8. title 説明を cue ありに変える。
9. source check に `finalBombCueIsTelegraphed` を追加する。
10. simpleBot stats に `chargeSeen` を追加する。
11. simpleBot stats に `finalCueFired` を追加する。
12. simpleBot stats に `bombedFinal` を必須化する。
13. BOMB ready がない時も cue で即死しないよう damage は増やさない。
14. BOMB reward は触らない。
15. Active DEF は触らない。
16. stage script は触らない。
17. enemy spawn は触らない。
18. final phase の初回だけ変える。
19. `finalCueFired` で一回限りにする。
20. charge 中の fireT を上書きする。
21. phase 変更時だけ charge を起動する。
22. drawEnemy boss だけに ring を追加する。
23. global visual palette は変えない。
24. README に focused check command を残す。
25. devlog に検証結果を書ける欄を作る。
26. design_log に手動体感の残課題を書く。
27. continuous directive は active のままにする。
28. staging には commit hash を後で追記する。
29. push 失敗時は hash を報告する。
30. v08 path を直接開けるようにする。

筋の良い案:

cue の強さは「押したくなるが、押さないと即失敗ではない」に置く。解決できる問題は BOMB が単なる保険に見えること。新しい懸念は cue が演出に留まりすぎることだが、headless では cue 後 BOMB の clear を必須にして、少なくとも機械的には局面と BOMB が接続されていることを見る。

## 設計サイクル 3: 検証

良いところ/悪いところ 30 件:

1. v07 check は報酬分散を検査できる。
2. v08 では報酬分散検査を維持する。
3. final cue は source と state の両方で見られる。
4. source regex だけでは playable を保証しない。
5. simpleBot の stats で charge/cue/BOMB を見る。
6. cue 後 BOMB で clear できるなら局面接続は最低限ある。
7. BOMB damage meaningful 検査は維持する。
8. cooldown 検査は維持する。
9. brake 検査は維持する。
10. no 5-way 検査は維持する。
11. Active DEF 検査は維持する。
12. finite midboss 到達は維持する。
13. finite boss 到達は維持する。
14. boss kill clear は維持する。
15. final cue frames 範囲は過剰演出防止になる。
16. 60F 未満は短すぎる。
17. 120F 超は長すぎる。
18. 84F は範囲内。
19. BOSS_HP を変えないため比較しやすい。
20. self-play の clear time は多少変わる。
21. clear time の完全一致は見ない。
22. bombCount は 1 以上で見る。
23. bossStats.bombedFinal を見る。
24. bossStats.finalCueFired を見る。
25. bossStats.chargeSeen を見る。
26. headless が人間納得を完全には測らない。
27. それでも今回の diff は focused check に向く。
28. 次回は browser/manual 観察が妥当。
29. staging には残課題も書く。
30. 今回は playable diff と focused evaluation を残す。

改善案 30 件:

1. `tools/headless_graze_log_cdx_v05_2_v08_check.js` を作る。
2. html path を v08 にする。
3. constants に `FINAL_BOMB_CUE_FRAMES` を追加する。
4. `finalBombCueIsTelegraphed` を追加する。
5. simpleBot BOMB 条件を cue 後優先にする。
6. `chargeSeen` を stats に残す。
7. `finalCueFired` を stats に残す。
8. `bombedFinal` を必須にする。
9. self-play clear を必須にする。
10. boss BOMB clear を必須にする。
11. reward distribution 検査を維持する。
12. direct stock regex を維持する。
13. BOMB cooldown 検査を維持する。
14. BOMB brake 検査を維持する。
15. BOMB no auto recharge 検査を維持する。
16. Active DEF threshold 検査を維持する。
17. finite stage 検査を維持する。
18. JSON report を残す。
19. devlog に pass result を書く。
20. README に実行方法を書く。
21. directive last_result を v08 にする。
22. staging に verification を追記する。
23. git status で対象差分だけ確認する。
24. v08 関連のみ stage する。
25. commit する。
26. push する。
27. push 後 status を見る。
28. push できない時は原因と hash を残す。
29. 次回候補を devlog に残す。
30. 手動体感は別サイクルに回す。

筋の良い案:

検証は「final phase の charge/cue を見てから BOMB を使い、そのまま clear できる」ことを直接見る。解決できる問題は cue が単なる表示だけで playable flow に接続されないこと。新しい懸念は simpleBot の条件が人間体感より強いことだが、今回の focused check としては意図に沿う。

## 採用案

- v07 を `v05_1_cdx_v08/` にコピーして差分を作る。
- `FINAL_BOMB_CUE_FRAMES=84` を追加する。
- boss final phase 移行時に `FINAL PHASE - CHARGE` と charge ring を出す。
- charge 後の初回 panic shot だけ `BOMB NOW` popup + 低速 ring + aimed 1 発にする。
- BOSS_HP、BOMB damage、BOMB stock economy、Active DEF は変更しない。
- headless check は v08 に向け、final cue と cue 後 BOMB clear を検証する。

## 懸念

`BOMB NOW` は分かりやすい反面、BOMB 必須の指示に見える可能性がある。今回は cue 弾を低速にして回避余地を残したが、人間が「押したい」と感じるか「押せと言われた」と感じるかは browser/manual 観察が必要。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v08_check.js
```

期待:

- final phase で charge が発生する。
- charge 後に `BOMB NOW` cue が一度だけ発生する。
- simpleBot は final cue 後に BOMB を使い、clear する。
- v07 の reward distribution と BOMB 悪用不可は維持される。
