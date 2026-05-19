# graze_log v05.2_cdx_v05 - design_log

## 対象 directive

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

> boss の削り感、BOMB を使いたくなる局面、初見クリア可能性を調整する。

## 実装前判断

v04 は stage arc と敵役割を増やし、単調な出現パターンからは前進した。一方で headless self-play は boss まで到達して死亡し、BOMB を使わないまま終わっていた。これは「BOMB が温存するべき強い行動」として見えていないのではなく、boss に入る時点で stock が読みづらく、boss HP も self-play の火力に対して長すぎた。

今回の playable diff は新規ルールを増やさず、boss 戦だけを短く、読みやすくする。boss 開始時に BOMB stock を明示して 1 回使える状態にし、BOMB は弾消し + tempo brake + boss 削りとして意味を持たせる。ただし BOMB 連打や 5-way 付与へ戻さない。

## 設計サイクル 1: boss が長い問題

良いところ/悪いところ 30 件:
1. v04 は boss に到達できる。
2. v04 は boss で死亡するため最終試験としては機能している。
3. ただし clear 可能性が低く、初見の到達報酬が薄い。
4. boss HP 116 は現行火力に対して長い。
5. BOMB ダメージ 7 は boss HP に対して軽い。
6. boss phase があるが、phase を越える前に死にやすい。
7. boss 開始時の BOMB ready が保証されない。
8. 道中で gauge を失うと boss の練習ができない。
9. boss が長いと道中改善の成果が見えにくい。
10. boss を短くすると clear 体験が増える。
11. 短すぎる boss は最終試験感を失う。
12. BOMB 一発で即死すると判断が消える。
13. BOMB が無意味だと使う理由が消える。
14. BOMB が強すぎると通常ショットが飾りになる。
15. BOMB stock 表示は分かりやすい。
16. stock 付与は露骨だが、初版の学習補助として有効。
17. phase popup は何が変わったかを伝えられる。
18. popup が多いと画面がうるさい。
19. 弾速を落とすと読みやすい。
20. 弾速を落としすぎると graze の緊張が落ちる。
21. boss 横移動を狭めると撃ち込みやすい。
22. 横移動を狭めすぎると動きが単調になる。
23. final phase の密度は BOMB 誘導に向く。
24. final phase 前に死ぬなら誘導が届かない。
25. headless bot は人間の楽しさの代替ではない。
26. ただし finite clear の最低保証には使える。
27. BOMB cooldown は悪用防止に効いている。
28. BOMB 後に Lv3 へ戻す仕様は火力低下を避ける。
29. 残る懸念は人間が stock 付与を不自然に感じること。
30. まず clear 可能な boss にしてから演出を詰める。

改善案 30 件:
1. boss HP を 116 から下げる。
2. BOMB の boss ダメージを上げる。
3. boss 開始時に gauge を最大化する。
4. boss 開始時に BOMB stock ready の popup を出す。
5. boss phase 2 の radial 速度を少し下げる。
6. final phase の発射間隔を少し長くする。
7. boss 横移動幅を少し狭める。
8. BOMB cooldown は維持する。
9. BOMB 後の gauge は Lv3 に戻す。
10. 5-way 付与は復活させない。
11. headless に boss BOMB clear を追加する。
12. headless に BOMB ダメージ範囲を追加する。
13. BOMB 即死ではないことを検証する。
14. boss phase popup を追加する。
15. final phase popup を追加する。
16. clear 時刻を観察する。
17. boss HP を 44 にする。
18. BOMB damage を 12 にする。
19. BOMB なし clear は今回は必須にしない。
20. BOMB 連打不可を既存 cooldown で継続確認する。
21. boss 開始 stock は stage 報酬として扱う。
22. 道中 gauge 供給は今回は触らない。
23. 道中難度は v04 のまま残す。
24. boss の弾幕種類は v04 の型を維持する。
25. boss の見た目は大きく変えない。
26. title の版名を更新する。
27. README に実行方法と焦点を書く。
28. devlog に戻し手順を書く。
29. staging に検証値を残す。
30. 次回は人間プレイの boss 体感を見たい。

筋の良い案:

boss HP を 44、BOMB boss damage を 12 に下げ、boss 開始時に gauge を満タンにする。BOMB は即死ではなく約 27% 削りで、弾消しと brake を合わせて「使う意味」がある。解決できる問題は、boss の長さ、BOMB 未使用、clear 不能寄りの self-play。新しい懸念は stock 付与がややゲーム的すぎること。

## 設計サイクル 2: BOMB 誘導の見え方

良いところ/悪いところ 30 件:
1. BOMB stock ready は初見でも読める。
2. popup は一瞬なので操作説明に寄りすぎない。
3. HUD の SPACE [B]OMB と噛み合う。
4. BOMB を押すタイミングはプレイヤーに残る。
5. final まで温存する設計もあり得る。
6. 今回の self-play は boss 中盤で使う。
7. 中盤 BOMB でも clear できるのは良い。
8. final BOMB 専用にすると初見で死にやすい。
9. 弾消しの快感は画面上で見える。
10. brake 中の弾速低下は読める。
11. damage 数値は見えない。
12. HP bar の減りで damage は読める。
13. BOMB 後 Lv3 なので撃ち込み継続が見える。
14. cooldown 表示は連打不可を示す。
15. 道中で BOMB を使わせないために boss stock にした。
16. 道中 BOMB の判断は今回は薄い。
17. boss 前 stock は stage reward として成立する。
18. stock 付与の理由は演出上まだ弱い。
19. 低 HP 化で boss の緊張が落ちる可能性がある。
20. final phase まで一応到達する。
21. self-play clear 4211f は短めで良い。
22. clear が早すぎる可能性はある。
23. 初見クリア可能性は上がる。
24. スコア詰めの余地はまだ薄い。
25. Active DEF は boss でも補助的に使える。
26. BOMB と DEF の役割分担は残っている。
27. BOMB のゲージ消費が重いので判断が残る。
28. boss stock でゲージ経済が少し単純になる。
29. 次回は stock 付与を midboss 報酬へ移す案もある。
30. 今回は playable diff 優先。

改善案 30 件:
1. popup 文言を `BOMB STOCK READY` にする。
2. title に finite boss bomb window と書く。
3. boss phase popup を残す。
4. final phase popup を残す。
5. BOMB damage は 12 にする。
6. HP は 44 にする。
7. cooldown 720f は維持する。
8. brake 120f は維持する。
9. BOMB 後 Lv3 は維持する。
10. final phase の aimed 数を 5-way に抑える。
11. radial 速度は 1.92 に抑える。
12. phase 2 radial は 1.72 に抑える。
13. boss 横移動幅は 66 に抑える。
14. soft enrage は残すが遅めにする。
15. headless は boss bombed を見る。
16. headless は final 到達も見る。
17. headless は clear を必須にする。
18. headless は BOMB が即死でないことを見る。
19. headless は BOMB cooldown 既存項目を維持する。
20. headless は stage roles 既存項目を維持する。
21. README は v05 専用に更新する。
22. devlog は戻し手順を明記する。
23. design_log に原文 directive を残す。
24. 次回課題は human feel に寄せる。
25. 道中は今回触らない。
26. UI 色は既存に合わせる。
27. 新しい敵種は足さない。
28. 新しい入力は足さない。
29. ルール説明を増やしすぎない。
30. finite stage のまま終える。

筋の良い案:

BOMB 誘導は「新操作追加」ではなく boss 開始 stock と既存 HUD の組み合わせで行う。解決できる問題は、BOMB を使わない self-play と初見の不透明さ。懸念は boss stock がやや補助輪に見える点だが、継続改善中の v05 では許容する。

## 設計サイクル 3: 検証方法

良いところ/悪いところ 30 件:
1. headless は deterministic seed で再現できる。
2. API 抽出で内部状態を検査できる。
3. BOMB 仕様の退行を検出できる。
4. boss 到達を検出できる。
5. clear を検出できる。
6. self-play の移動は単純で過信できない。
7. それでも壁かどうかの検出には使える。
8. BOMB 使用回数を検出できる。
9. final phase 到達を検出できる。
10. BOMB damage の範囲を検出できる。
11. 人間の気持ちよさは検出できない。
12. 人間が stock 付与をどう感じるかは未検証。
13. clear が簡単すぎるかは未検証。
14. boss の削り感は数値だけでは不十分。
15. clear time は補助指標になる。
16. score は補助指標になる。
17. graze count は補助指標になる。
18. bomb count は今回の主指標。
19. activeDef count は副指標。
20. cooldown 悪用不可は重要。
21. BOMB 後 5-way なしは過去修正の保護。
22. finite script は引き続き保護する。
23. stage roles は引き続き保護する。
24. boss kill clear は引き続き保護する。
25. automated clear があると次の調整がしやすい。
26. automated clear だけで完成とはしない。
27. staging に検証値を残すと次回比較できる。
28. version directory を分けると戻しやすい。
29. v04 は残す。
30. v05 は次回の起点になる。

改善案 30 件:
1. `tools/headless_graze_log_cdx_v05_2_v05_check.js` を作る。
2. path を v05 に向ける。
3. `BOSS_HP` を expose する。
4. `BOSS_SOFT_ENRAGE_FRAME` を expose する。
5. self-play に boss stats を足す。
6. boss に入って BOMB を使ったか見る。
7. final phase に入ったか見る。
8. clear したか見る。
9. BOMB count >= 1 を見る。
10. BOMB damage が即死でない範囲か見る。
11. 既存 BOMB cooldown check を残す。
12. 既存 BOMB 5-way 廃止 check を残す。
13. Active DEF check を残す。
14. midboss check を残す。
15. boss spawn check を残す。
16. stage roles check を残す。
17. boss kill clear check を残す。
18. JSON report を出す。
19. pass/fail は process exit で出す。
20. devlog に実行コマンドを書く。
21. README に実行コマンドを書く。
22. staging に結果を書く。
23. 次回は screenshot/manual を追加候補にする。
24. 今回は headless focused に絞る。
25. Slack pending は直接なしと記録する。
26. continuous directive を対象と記録する。
27. commit に v05 だけ入れる。
28. push 後 status を確認する。
29. 未関係 memory 差分は混ぜない。
30. directive は active 継続のままにする。

筋の良い案:

v05 の focused check は「boss BOMB clear」を新しい合格条件にする。解決できる問題は、前版で残った BOMB 未使用と boss クリア不能寄りの不安。懸念は self-play が BOMB タイミングを人間の判断より単純化していること。

## 採用案

- v04 から `v05_1_cdx_v05/` を分岐。
- `BOSS_HP=44`、BOMB の boss damage は 12。
- boss spawn 時に `state.gauge=G_MAX` とし、`BOSS IN - BOMB STOCK READY` を出す。
- boss phase は aimed -> ring -> panic を維持しつつ、弾速と発射間隔を少し読みやすくした。
- focused headless check は boss 中に BOMB を使って clear することを検証する。

## 懸念

boss stock 付与は、完成版では midboss 撃破報酬や boss warning 敵の撃破報酬へ移した方が自然かもしれない。今回は「BOMB を使う局面がある playable boss」を先に固定した。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v05_check.js
```

期待:

- BOMB は 5-way を付与しない。
- BOMB cooldown と brake が入る。
- finite script は midboss / boss / clear に到達する。
- self-play は boss 中に BOMB を 1 回使い、clear する。
- BOMB damage は即死ではなく、boss を意味ある量だけ削る。
