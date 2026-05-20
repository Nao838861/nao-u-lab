# graze_log v05.2_cdx_v18 design_log

## 入力

継続 directive:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

現在の焦点:

> v17 の quiet DEF ring に実プレイで気づけるか確認する。
> ring only で押す判断が弱すぎる場合、文字 popup 復活ではなく ring 色/life/太さで調整する。
> `WINDOW n` + `DEF n` が HUD 上で情報過多にならないか確認する。
> simpleBot は DEF なし clear のままなので、人間評価では Active DEF を使いたくなる弾配置かも見る。

## 実装前判断

v17 は `DEF WINDOW` という命令文を削り、Active DEF cue を ring-only にした。これは「ゲーム側が答えを言いすぎる」問題を減らしたが、ring が短く細いままだと、弾幕中に見落とされる可能性がある。今回の目的は、文字を戻さずに cue を見える形へ寄せること。

今回は敵配置、報酬、BOMB、shield、DEF 発火条件には触らない。変更を ring の見え方に限定し、v17 で残した「押す理由は画面上の危険密度から読む」構造を壊さない。

参照した過去知見:

- `Playable / Headless 評価`: clear regression と focused cue probe を分ける。
- `Balance / Rule Space`: 難度変更と UI cue 変更を混ぜない。
- `Repair / Iterative Improvement`: 小さな仮説を 1 playable diff として検証可能に残す。

## 設計サイクル 1

良いところ / 悪いところ 30件:

1. finite stage がある。
2. midboss がある。
3. boss がある。
4. clear がある。
5. BOMB は常時5-way化しない。
6. shield 4 で緊張感が残る。
7. Active DEF は graze streak から発火する。
8. Active DEF は bullet clear と gauge reward を持つ。
9. v17 は文字 popup を削った。
10. v17 の ring は命令に見えにくい。
11. ring は同じ座標系で距離を示せる。
12. `DEF n` は ready 継続を読ませる。
13. `WINDOW n` は近接弾数を読ませる。
14. ただし HUD は情報量が多い。
15. ring が短いと弾幕中に見落とす。
16. ring が細いと背景に埋もれる。
17. ring が派手すぎると弾を隠す。
18. 文字 popup 復活は押し付けが強い。
19. 報酬増加は balance 問題を混ぜる。
20. 弾量変更は stage 問題を混ぜる。
21. v17 simpleBot は DEF なし clear する。
22. 人間評価では DEF の使用動機が別問題になる。
23. focused probe では cue 仕様を検査できる。
24. clear bot では regression を検査できる。
25. ring の色変更は影響範囲が狭い。
26. ring の life 変更も影響範囲が狭い。
27. ring の線幅変更は描画関数に小改修が必要。
28. ring 全体を太くすると他演出も変わる。
29. 個別 `w` なら prompt ring だけ変えられる。
30. v18 の比較軸は v17 より明確にできる。

改善案 30件:

1. DEF prompt ring の life を延ばす。
2. DEF prompt ring の色を明るくする。
3. DEF prompt ring の線幅を太くする。
4. DEF prompt ring の半径変化を広げる。
5. ring object に `w` を追加する。
6. ring object に `a` を追加する。
7. draw ring は fallback を持つ。
8. 他の ring は従来通りにする。
9. `DEF WINDOW` popup は戻さない。
10. `DEF_PROMPT_FRAMES=84` は維持する。
11. `DEF_PROMPT_WINDOW=2` は維持する。
12. Active DEF reward は維持する。
13. BOMB cooldown は維持する。
14. shield 4 は維持する。
15. stage script は維持する。
16. simpleBot 条件は維持する。
17. headless path を v18 にする。
18. focused probe 名を visible ring にする。
19. latestRing の色を検査する。
20. latestRing の life を検査する。
21. latestRing の線幅を検査する。
22. latestRing の alpha を検査する。
23. latestRing の半径を検査する。
24. popup absence を検査する。
25. html absence を検査する。
26. title を v18 にする。
27. README を v18 にする。
28. devlog を v18 にする。
29. directive を v18 に更新する。
30. staging に結果を残す。

筋の良い案:

- 文字は戻さず、prompt ring だけ `life / color / width / radius` を少し強める。

解決できる問題:

- 命令文を出さずに、弾幕中の見落としを減らせる。変更対象が UI cue に限定されるため、難度や報酬の評価を汚しにくい。

新しく生じる懸念:

- ring が太く明るくなることで、近接弾の読み取りを少し邪魔する可能性がある。

## 設計サイクル 2

良いところ / 悪いところ 30件:

1. `life: 46` は約0.77秒残る。
2. v17 の 30 frames より見落としにくい。
3. 46 frames は常時表示ではない。
4. `#b9ffe8` は DEF 系の緑を保つ。
5. 明度が高く背景から分離しやすい。
6. 線幅 3.2 は近接 cue として読める。
7. 全 ring を太くしないのは重要。
8. `a: 0.95` は fade を維持する。
9. 半径を少し広げると cue の運動が見える。
10. 大きすぎると BOMB ring と混ざる。
11. `ACTIVE_DEF_RADIUS+12` はまだ局所的。
12. prompt 成立後 preview を明るくするのは自然。
13. prompt 成立前 preview は従来に近い。
14. ready 後の線幅上げは押せる状態を示す。
15. 状態遷移は画面上で読める。
16. popup なし方針と矛盾しない。
17. HUD の情報量問題は未解決。
18. HUD を同時に触ると比較が濁る。
19. simpleBot の DEF 使用は増えない可能性が高い。
20. それは今回の成功条件ではない。
21. 人間が使いたくなるかは後で見る。
22. draw fallback で既存 ring を壊しにくい。
23. headless で `r.w||2` を確認できる。
24. headless で popup absence を維持できる。
25. title 更新で手動確認しやすい。
26. version folder で v17 を残せる。
27. v18 は playable diff として十分小さい。
28. 次回 HUD 圧縮へ接続できる。
29. 完成判断はまだ早い。
30. 継続 directive は active のままが妥当。

改善案 30件:

1. ring `life` を 46 にする。
2. ring `c` を `#b9ffe8` にする。
3. ring `w` を 3.2 にする。
4. ring `a` を 0.95 にする。
5. ring `r0` を `ACTIVE_DEF_RADIUS-20` にする。
6. ring `r1` を `ACTIVE_DEF_RADIUS+12` にする。
7. draw で `r.w||2` を使う。
8. draw で `r.a??1` を使う。
9. charged preview を明るくする。
10. charged preview を太くする。
11. charged preview の外周 alpha を少し上げる。
12. `DEF_PROMPT_FRAMES` は変えない。
13. `DEF_PROMPT_WINDOW` は変えない。
14. enemy bullet 色は変えない。
15. player hitbox は変えない。
16. reward popup は変えない。
17. `DEF READY` は変えない。
18. `DEF WINDOW` は追加しない。
19. headless の focused 条件を更新する。
20. simpleBot clear 条件を維持する。
21. final BOMB cue 条件を維持する。
22. activeDef reward 条件を維持する。
23. README に実行方法を書く。
24. devlog に次回焦点を書く。
25. design_log に判断を残す。
26. continuous directive を更新する。
27. staging を更新する。
28. git では自分の差分だけ stage する。
29. push できない場合は commit hash を残す。
30. 既存 dirty 差分は混ぜない。

筋の良い案:

- cue の状態を `prompt 成立前` と `prompt 成立後` で描き分け、成立後だけ明るく太くする。

解決できる問題:

- 「常時うるさい cue」ではなく「押せる状態が続いたら強くなる cue」になる。プレイヤーは危険密度と ring の両方から判断できる。

新しく生じる懸念:

- 成立後 preview が常時見えるため、長い危険状態では少し画面が騒がしくなる。

## 設計サイクル 3

良いところ / 悪いところ 30件:

1. v18 は v17 の思想を継ぐ。
2. 文字 popup は戻さない。
3. Active DEF の判断余地を残す。
4. ring の視認性だけを上げる。
5. stage 進行に触らない。
6. boss HP に触らない。
7. player speed に触らない。
8. bullet speed に触らない。
9. reward gauge に触らない。
10. regression 原因を追いやすい。
11. focused probe が明確。
12. simpleBot clear が必要条件になる。
13. final cue の検査を維持できる。
14. BOMB 使用検査を維持できる。
15. Active DEF reward 検査を維持できる。
16. HUD 問題は別焦点に残す。
17. 実プレイ気づきは headless だけでは測れない。
18. ただし仕様 drift は headless で止められる。
19. ring の `w/a` は今後の cue 調整にも使える。
20. ただし演出パラメータ増加は管理負担になる。
21. 今回は prompt ring だけ使うため許容範囲。
22. v18 は新規 folder なので比較できる。
23. README が短く実行しやすい。
24. devlog が次回に接続する。
25. directive 更新で継続作業が迷いにくい。
26. staging に結果を残せる。
27. commit 対象を限定できる。
28. branch behind は push リスクになる。
29. 既存 dirty 差分は混ぜてはいけない。
30. 完成ではなく改善 1 サイクルとして扱う。

改善案 30件:

1. v18 folder を作る。
2. index title を v18 にする。
3. prompt ring を明るくする。
4. prompt ring を太くする。
5. prompt ring を長くする。
6. prompt ring の半径変化を広げる。
7. ring draw に `w` を入れる。
8. ring draw に `a` を入れる。
9. ready preview の charged 表示を入れる。
10. popup 文字は追加しない。
11. headless tool を v18 にする。
12. path を v18 にする。
13. focused probe 名を更新する。
14. latestRing の属性を検査する。
15. `DEF WINDOW` 不在を維持する。
16. `r.w||2` を検査する。
17. clear bot を維持する。
18. final cue を維持する。
19. final BOMB を維持する。
20. activeDef reward を維持する。
21. finite stage を維持する。
22. README を書き換える。
23. devlog を書き換える。
24. design_log を書き換える。
25. continuous directive を更新する。
26. staging を追記する。
27. headless を実行する。
28. status を確認する。
29. 自分のファイルだけ stage する。
30. commit / push を試す。

採用案:

- `v05_1_cdx_v18` は DEF prompt ring を `life:46 / #b9ffe8 / w:3.2 / a:0.95 / ACTIVE_DEF_RADIUS-20..+12` に変更し、ready 後 preview も少し強める。

採用しない案:

- `DEF WINDOW` popup 復活: 押し付けが強く、v17 の改善を戻すため見送り。
- DEF reward 増加: cue 評価と balance 評価が混ざるため見送り。
- HUD 圧縮: 今回の ring 視認性評価と混ざるため次回焦点に残す。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v18_check.js
```

期待:

- clear-capable bot が clear し、boss final cue と final BOMB 使用を維持する。
- focused probe で visible ring-only cue が出る。
- `DEF WINDOW` は popup にも HTML にも残らない。
- DEF prompt ring の `life / color / width / alpha / radius` が v18 仕様になっている。
