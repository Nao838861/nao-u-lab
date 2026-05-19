# graze_log v05.2_cdx_v07 - design_log

## 対象 directive

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

> boss の削り感、BOMB を使いたくなる局面、初見クリア可能性を調整する。

Slack pending の新規 game directive は今回なし。local continuous directive を対象にした。

## 実装前判断

v06 は boss 開始時の BOMB 直付けを削り、boss warning scout 撃破で stock を稼ぐ形にできた。ただし `BOMB +22` が boss 直前に集中しすぎており、初見 clear の保証としては強い一方で、stage 全体の読みとしてはまだ露骨だった。

今回は v06 を `v05_1_cdx_v07/` にコピーし、BOMB stock の由来を midboss と warning wave に分散する。使う過去知見は `gravity_courier_v001_success_case` の「見えるルールから入力結果を予測できる」、`Playable / Headless 評価` lens の「起動ではなく playable 条件を見る」、`Balance / Rule Space` lens の「報酬を局所値ではなく候補空間として比較する」である。

## 設計サイクル 1: boss 直前報酬集中の見直し

良いところ/悪いところ 30 件:
1. v06 は boss BOMB clear が安定している。
2. v06 は BOMB stock の直付けを消した。
3. warning scout 撃破と BOMB 獲得の因果は見える。
4. boss 前に `BOMB STOCK EARNED` が出る。
5. headless は direct stock 回帰を検出できる。
6. ただし `BOMB +22` が 8 回出ると補助感が強い。
7. boss 直前だけで stock が完成すると道中の意味が薄い。
8. warning wave を逃すと急に厳しくなる。
9. warning wave を倒せる bot には簡単すぎる。
10. midboss は stage の節目として報酬に向く。
11. midboss 撃破は画面上で分かりやすい。
12. midboss reward は boss 直前より記憶距離が長い。
13. 記憶距離が長すぎると因果が薄れる。
14. しかし midboss なら節目 popup で補える。
15. warning は top-off として残せる。
16. top-off なら報酬量を下げられる。
17. BOMB stock は stage を通した成果に見える。
18. boss HP や BOMB 火力に触らずに済む。
19. BOMB cooldown と brake も維持できる。
20. Active DEF 調整を再び広げずに済む。
21. midboss を倒せない時の救済は弱くなる。
22. ただし midboss は既存 self-play で倒せている。
23. midboss reward を大きくしすぎるとまた直付けに見える。
24. warning reward を小さくしすぎると boss BOMB が崩れる。
25. `+22` から `+14` への低下は差分として読みやすい。
26. midboss `+36` は一回の節目報酬として許容できる。
27. 合計は v06 と近く保てる。
28. 初見 clear 可能性を落としすぎない。
29. 検証は報酬分散そのものを見るべき。
30. 今回は報酬分布だけを変えるのが筋がよい。

改善案 30 件:
1. `MIDBOSS_REWARD_GAUGE` を追加する。
2. midboss spawn 時に rewardGauge を付ける。
3. midboss popup を `MIDBOSS - BOMB CORE` にする。
4. warning reward を 22 から 14 に下げる。
5. warning popup を `TOP OFF BOMB` にする。
6. title 文言を midboss + warning に変える。
7. boss HP は 44 のまま維持する。
8. BOMB damage は 12 のまま維持する。
9. BOMB cooldown は 720f のまま維持する。
10. BOMB brake は 120f のまま維持する。
11. Active DEF threshold は 8 のまま維持する。
12. stage script は変えない。
13. enemy fire pattern は変えない。
14. warning scout 数は 8 のまま維持する。
15. midboss 耐久は 42 のまま維持する。
16. headless path を v07 に向ける。
17. headless constants に midboss reward を追加する。
18. warning reward が 14 以下であることを見る。
19. midboss reward が warning reward より大きいことを見る。
20. boss start bombReady を維持する。
21. self-play clear を維持する。
22. boss BOMB 使用を維持する。
23. 5-way 非付与を維持する。
24. cooldown 悪用不可を維持する。
25. direct stock regex を維持する。
26. devlog に戻し手順を書く。
27. continuous directive の last_result を更新する。
28. staging に検証値を書く。
29. v06 は残して比較可能にする。
30. 未関係の自動サイクル差分を commit に混ぜない。

筋の良い案:

midboss を BOMB core、warning scout を top-off に分ける。解決できる問題は、boss 直前 `+22` 集中の露骨さ、道中節目の報酬不足、BOMB stock の由来が狭すぎること。新しい懸念は midboss 撃破失敗時に boss BOMB が不安定になることだが、v07 の focused check では boss start ready と self-play clear を維持して確認する。

## 設計サイクル 2: 報酬量の候補

良いところ/悪いところ 30 件:
1. v06 の warning 合計は追加 176 gauge。
2. それに通常 kill gauge も乗る。
3. v07 で warning を 14 にすると追加 112 gauge。
4. midboss 追加 36 で合計 148 gauge になる。
5. v06 より 28 gauge 下がる。
6. 下げ幅は大きすぎない。
7. 道中 graze と kill を含めれば MAX に届く余地がある。
8. midboss reward は一回だけなのでノイズが少ない。
9. warning popup の連打も弱くなる。
10. `BOMB +14` はまだ報酬として読める。
11. `BOMB +8` だと warning の意味が弱くなる。
12. `BOMB +18` だと v06 からの改善が薄い。
13. midboss `+24` は既存 midboss kill gauge と同じで変化が見えにくい。
14. midboss `+36` は追加報酬として読める。
15. midboss `+60` は直付けに近づく。
16. `36 + 8*14` は数式として追いやすい。
17. BOMB MAX 208 に対して、これだけでは満タンにならない。
18. つまり通常 play の kill/graze がまだ必要。
19. 通常 play が必要なのはよい。
20. 通常 play への依存が強すぎると初見 clear が崩れる。
21. headless が clear するなら最低限は保てる。
22. headless が人間体感を代替しない点は残る。
23. しかし今回の変更は報酬分布なので数値検証に向く。
24. boss start gauge の実測は重要。
25. simpleBot の bombCount も重要。
26. activeDefCount が残ることも生存設計の確認になる。
27. killCount が落ちすぎないことも見る。
28. BOMB cooldown 後の自動再満タンは引き続き避ける。
29. v07 では completion ではなく改善差分を狙う。
30. 次回は手動体感または screenshot 確認が残る。

改善案 30 件:
1. warning reward を 14 にする。
2. midboss reward を 36 にする。
3. `BOSS_WARNING_REWARD_GAUGE<=14` を検査する。
4. `MIDBOSS_REWARD_GAUGE>BOSS_WARNING_REWARD_GAUGE` を検査する。
5. boss start gauge を report に残す。
6. boss start ready を必須にする。
7. self-play clear を必須にする。
8. bombCount >= 1 を必須にする。
9. bossStats.bombedBoss を必須にする。
10. final phase entered を必須にする。
11. direct stock regex を必須にする。
12. BOSS_HP 範囲検査を維持する。
13. BOMB after gauge Lv3 検査を維持する。
14. BOMB cooldown 検査を維持する。
15. BOMB brake 検査を維持する。
16. no 5-way 検査を維持する。
17. Active DEF early 不可を維持する。
18. Active DEF threshold 可を維持する。
19. finite midboss 到達を維持する。
20. finite boss 到達を維持する。
21. boss kill clear を維持する。
22. source から constants を expose する。
23. README に実行コマンドを書く。
24. devlog に検証値を書く。
25. design_log に懸念を書く。
26. directive は active のまま更新する。
27. staging に version path を書く。
28. commit message は v07 の内容に絞る。
29. push 後に branch status を確認する。
30. 次回は報酬以外の boss 体感へ進む。

筋の良い案:

報酬量は `MIDBOSS +36 / WARNING +14` にする。解決できる問題は v06 の `+22` 集中と、道中行動の価値の薄さ。懸念は warning を下げたことで、midboss を十分倒せないプレイヤーには BOMB が遠くなること。今回は boss start ready と self-play clear が残るかを合格条件にする。

## 設計サイクル 3: 検証の置き方

良いところ/悪いところ 30 件:
1. source regex は direct stock 回帰に強い。
2. constants expose は報酬量を検査しやすい。
3. headless は finite stage の破綻を見つけやすい。
4. headless は人間の納得感を直接測れない。
5. 今回は報酬分布なので headless の役割が明確。
6. boss start ready は初見 clear 可能性の最低条件になる。
7. simpleBot clear は playable の最低条件になる。
8. boss BOMB 使用は BOMB の役割確認になる。
9. cooldown 検査は連発不可の退行を防ぐ。
10. brake 検査は BOMB の独自性を守る。
11. no 5-way 検査は過去の過剰強化を防ぐ。
12. Active DEF 検査は BOMB との役割差を守る。
13. finite midboss/boss は script 破綻を防ぐ。
14. reward 分散検査は v07 固有の価値を守る。
15. warning reward 上限検査は `+22` 回帰を防ぐ。
16. midboss > warning は節目報酬の意図を守る。
17. boss HP は触らないので火力調整の混入を避ける。
18. BOMB damage は触らないので比較しやすい。
19. bot の warning 狙いは v06 から維持する。
20. bot を強くしすぎない方が比較しやすい。
21. report の JSON は staging に引用しやすい。
22. full browser screenshot は今回は必須でない。
23. 手動プレイ確認は次回候補として残る。
24. v07 は v06 と比較できる path にする。
25. devlog は戻し単位を明記する。
26. README はプレイヤー向けに短くする。
27. design_log は判断根拠を厚く残す。
28. continuous directive は最後に更新する。
29. staging は Phase Game Start セクションへ追記する。
30. commit/push は今回触ったファイルだけで行う。

改善案 30 件:
1. `tools/headless_graze_log_cdx_v05_2_v07_check.js` を作る。
2. HTML path を v07 に変える。
3. constants に `MIDBOSS_REWARD_GAUGE` を追加する。
4. warning reward 上限を検査する。
5. midboss reward 優位を検査する。
6. boss start ready を検査する。
7. direct stock regex を維持する。
8. self-play clear を検査する。
9. boss BOMB 使用を検査する。
10. final phase entered を検査する。
11. BOMB cooldown を検査する。
12. BOMB brake を検査する。
13. BOMB no 5-way を検査する。
14. BOMB no auto recharge を検査する。
15. Active DEF early 不可を検査する。
16. Active DEF ready 可を検査する。
17. midboss 到達を検査する。
18. boss 到達を検査する。
19. boss kill clear を検査する。
20. report constants を残す。
21. report simpleBot を残す。
22. report boss start gauge を残す。
23. fail は exit 1 にする。
24. pass 結果を devlog に残す。
25. README に focused check を残す。
26. directive last_result に v07 を残す。
27. staging に command/result を残す。
28. git status で対象差分を確認する。
29. commit 後 push する。
30. push 後 clean/ahead を確認する。

筋の良い案:

検証は「報酬を分散しても BOMB boss clear が残る」ことを直接見る。解決できる問題は v06 の `+22` 集中への回帰と、検証が単なる起動確認に落ちること。懸念は headless が手動体感を置き換えないことだが、今回の scoped diff では十分な focused check になる。

## 採用案

- v06 を `v05_1_cdx_v07/` にコピーして差分を作る。
- `MIDBOSS_REWARD_GAUGE=36` を追加し、midboss 撃破で `BOMB +36` を得る。
- `BOSS_WARNING_REWARD_GAUGE` を 22 から 14 に下げる。
- boss warning は `TOP OFF BOMB`、midboss は `BOMB CORE` と表示する。
- headless check は v07 に向け、報酬分散、boss start ready、boss BOMB clear、BOMB 悪用不可を検証する。

## 懸念

midboss 撃破が苦手なプレイヤーには v06 より BOMB stock が遠くなる可能性がある。次回は手動または browser screenshot つきの観察で、midboss reward が「節目として読める」か、warning wave が top-off として十分かを見る。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v07_check.js
```

期待:

- warning reward は `+14` まで下がっている。
- midboss reward は warning reward より大きい。
- boss start で BOMB ready になる。
- self-play は boss 中に BOMB を使い、clear する。
- BOMB は 5-way を付与せず、cooldown / brake を維持する。
