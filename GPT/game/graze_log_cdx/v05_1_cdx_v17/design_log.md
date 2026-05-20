# graze_log v05.2_cdx_v17 design_log

## 入力

継続 directive:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

現在の焦点:

> v16 の `DEF WINDOW` cue が実プレイで押す判断を助けるか確認する。
> Active DEF 半径 preview が弾幕視認を邪魔しないか確認する。
> `WINDOW n` + `DEF n` で HUD が情報過多にならないか確認する。
> cue が強すぎる場合は `DEF_PROMPT_FRAMES` を長くするか、popup を削って ring だけにする。

## 実装前判断

v16 は DEF の押し時を作ったが、`DEF WINDOW` という文字 popup はゲーム側が答えを言いすぎる。`SPACE [D]EF`、HUD の `DEF n`、プレイヤー周辺 ring が同時にあるため、さらに文字 popup を出すと弾幕中の主役が cue になる危険がある。

今回は難度、敵構成、BOMB、shield、Active DEF 報酬には触らない。v17 は `DEF_PROMPT_FRAMES` を 72 から 84 に伸ばし、条件成立時の文字 popup を削り、細い ring だけを残す。目的は「押す理由の表示」ではなく「押せる瞬間の視覚的な呼吸」を作ること。

参照した過去知見:

- `Playable / Headless 評価`: 起動だけでなく、clear と focused probe を両方見る。
- `Balance / Rule Space`: 変更原因を cue の密度に限定し、難度調整と混ぜない。
- `Repair / Iterative Improvement`: 既存 clear-capable bot の regression と、DEF cue 単体 probe を分ける。

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
9. v16 は DEF の押し時を示し始めた。
10. `WINDOW n` は近い弾数を読ませる。
11. `DEF n` は cue の持続を読ませる。
12. preview ring は半径を読ませる。
13. `DEF WINDOW` popup は意味が明快。
14. ただし文字 popup は画面中央付近の弾を隠す。
15. popup は「いま押せ」と命令に見える。
16. 命令が強いとプレイヤーの判断余地が減る。
17. HUD はすでに情報が多い。
18. `SPACE [D]EF` と `DEF WINDOW` は役割が重なる。
19. ring は弾と同じ画面上で距離を示せる。
20. ring だけなら説明文を増やさない。
21. ring が太すぎると弾幕視認を邪魔する。
22. prompt が早すぎると常時点灯に見える。
23. prompt が遅すぎると気づけない。
24. bot は DEF なしでも clear する。
25. focused probe で DEF 価値を別検査する必要がある。
26. 報酬を増やすと BOMB stock 問題が混ざる。
27. 弾量を変えると stage balance 問題が混ざる。
28. 文字を削るだけなら影響面が狭い。
29. v16 から v17 の比較軸が明確。
30. 人間評価前の差分として扱いやすい。

改善案 30件:

1. `DEF WINDOW` popup を削る。
2. prompt ring だけを残す。
3. `DEF_PROMPT_FRAMES` を長くする。
4. ring の life を短くする。
5. ring の幅を細くする。
6. ring の半径を Active DEF radius 付近に固定する。
7. HUD の `DEF n` は維持する。
8. `SPACE [D]EF` は維持する。
9. reward は維持する。
10. shield は維持する。
11. BOMB cooldown は維持する。
12. stage script は維持する。
13. bot の clear 条件を維持する。
14. focused probe に popup absence を足す。
15. focused probe に ring radius を足す。
16. title を v17 に更新する。
17. README を v17 に更新する。
18. devlog に目的を残す。
19. continuous directive を v17 に更新する。
20. staging に実行結果を残す。
21. promptCount は維持する。
22. DEF 使用時の reset は維持する。
23. `WINDOW n` は維持する。
24. `DEF n` の上限 99 は維持する。
25. ring は `ACTIVE_DEF_RADIUS-14` から `+6` にする。
26. ring life は 30 にする。
27. `DEF_PROMPT_FRAMES` は 84 にする。
28. popup text の regex 検査を禁止条件へ変える。
29. headless script 名を v17 にする。
30. 変更後に v16 headless の主要条件を継承する。

筋の良い案:

- 文字 popup を削り、遅めの細い ring に寄せる。

解決できる問題:

- cue が強すぎる問題、弾幕視認を文字が邪魔する問題、HUD と popup の重複を同時に減らせる。

新しく生じる懸念:

- 文字が消えるため、初回プレイでは DEF の押し時に気づきにくくなる可能性がある。

## 設計サイクル 2

良いところ / 悪いところ 30件:

1. ring は距離情報と相性が良い。
2. ring は弾幕と同じ座標系で読める。
3. ring は文字より翻訳不要。
4. ring は入力を命令しない。
5. ring は視線をプレイヤー周辺に戻す。
6. Active DEF はプレイヤー周辺効果なので ring と合う。
7. `DEF n` は ring の理由を補足できる。
8. `SPACE [D]EF` は入力候補を補足できる。
9. ring だけだと意味が薄い可能性がある。
10. 既存の `DEF READY` popup は残る。
11. `DEF READY` は閾値到達の通知として十分。
12. 追加の `DEF WINDOW` は過剰かもしれない。
13. prompt の持続が短いと見落とす。
14. prompt の持続が長いと常時表示に見える。
15. 84 frames は約1.4秒で、72 frames より慎重。
16. focused probe では prompt 発火を確認できる。
17. 実プレイの気づきは headless だけでは測れない。
18. それでも文字削除の regression は機械確認できる。
19. BOMB final cue は別系統なので触らない。
20. boss final の視認を壊してはいけない。
21. ring が細ければ弾幕の邪魔は少ない。
22. ring 色は Active DEF と同じで連想しやすい。
23. ring が薄すぎると存在感がない。
24. promptCount は検査用に便利。
25. state.rings を検査すれば popup なし cue を検証できる。
26. `DEF WINDOW` 文字列が html に残ると目的が崩れる。
27. README の version 表示も更新が必要。
28. devlog は次回評価の焦点になる。
29. directive の焦点も次回に接続する。
30. この差分は playable diff として十分小さい。

改善案 30件:

1. `DEF WINDOW` 文字列を HTML から完全に消す。
2. headless で `!/DEF WINDOW/.test(html)` を見る。
3. popupText にも出ないことを見る。
4. latestRing の r0/r1 を見る。
5. prompt 発火後の DEF 使用 reset を見る。
6. simpleBot clear を維持する。
7. final cue を維持する。
8. final BOMB 使用を維持する。
9. medium anchor 検査を維持する。
10. shield 4 検査を維持する。
11. `ACTIVE_DEF_RADIUS+6` の regex を見る。
12. `const DEF_PROMPT_FRAMES=84` を見る。
13. `v05.2_cdx_v17` title を見る。
14. design_log に原文 directive を残す。
15. 実装前判断を残す。
16. 懸念を残す。
17. 検証方法を残す。
18. 採用しなかった案を残す。
19. staging に path と commit を後で残す。
20. continuous directive の last_result を更新する。
21. 新規 version folder にする。
22. v16 は残す。
23. 既存 tool は残す。
24. v17 tool を追加する。
25. 変更原因を cue density に限定する。
26. 追加敵を入れない。
27. gauge reward を変えない。
28. BOMB damage を変えない。
29. CSS/HTML layout を崩さない。
30. headless output の JSON を確認する。

筋の良い案:

- `DEF_PROMPT_FRAMES=84`、ring only、headless で popup absence を検査する。

解決できる問題:

- 強すぎる cue と見落としリスクの中間を取り、かつ差分の検証可能性を保てる。

新しく生じる懸念:

- cue が静かになりすぎた場合、人間が DEF を使わないまま clear する可能性は残る。

## 設計サイクル 3

良いところ / 悪いところ 30件:

1. 今回の変更は stage 進行に触らない。
2. 今回の変更は boss HP に触らない。
3. 今回の変更は player speed に触らない。
4. 今回の変更は bullet speed に触らない。
5. 今回の変更は reward gauge に触らない。
6. そのため regression 原因を追いやすい。
7. v16 の課題に直接対応している。
8. Nao_u の continuous directive に沿っている。
9. playable diff として browser で開ける。
10. focused check を作れる。
11. 文字 popup 削除は体験の質に効く。
12. 視覚 cue 削減は説明臭さを減らす。
13. ring cue は手触りを残す。
14. 84 frames は条件の安定を要求する。
15. 連続した近接弾がないと cue が出ない。
16. DEF を押したら reset する。
17. promptCount が 0 に戻る。
18. reward popup は残る。
19. reward popup は実行結果なので残してよい。
20. `DEF READY` は閾値到達なので残してよい。
21. 削るのは「押せ」という中間命令だけ。
22. HUD はまだ情報が多い。
23. 次回は HUD 密度評価が必要。
24. ring が見えなければ次回調整が必要。
25. 実プレイ評価なしでは完成判断にしない。
26. headless clear は必要条件。
27. focused probe は仕様検査。
28. 人間納得感は別評価。
29. この差分で完成とは言わない。
30. 次回に実プレイ観点を渡す。

改善案 30件:

1. v17 folder を作る。
2. index を v17 title にする。
3. `DEF_PROMPT_FRAMES` を 84 にする。
4. `DEF WINDOW` popup push を削る。
5. ring radius を狭くする。
6. ring life を 30 にする。
7. headless path を v17 にする。
8. focused probe 名を `defPromptIsQuietRingOnly` にする。
9. latestRing を report に含める。
10. popup absence を report に含める。
11. html absence を report に含める。
12. simpleBot condition を維持する。
13. README を更新する。
14. devlog を更新する。
15. design_log を更新する。
16. continuous directive を更新する。
17. staging を更新する。
18. git status で差分を確認する。
19. node check を実行する。
20. 必要なら path typo を直す。
21. 既存 v16 を変更しない。
22. unrelated dirty files を stage しない。
23. broken git state は final に報告する。
24. push できれば push する。
25. push できなければ commit hash を残す。
26. commit できなければ原因を残す。
27. headless output の重要値を staging に残す。
28. next focus は実プレイ cue 評価にする。
29. Nao_u feedback が来たら原文を追記する。
30. 完成/停止判断までは active のままにする。

採用案:

- v17 は `DEF WINDOW` 文字 popup を廃止し、84 frames 後に短い Active DEF radius ring だけを出す。

採用しない案:

- DEF reward 増量: BOMB stock balance と混ざるため今回は見送る。
- 弾幕密度変更: cue 評価と stage balance が混ざるため今回は見送る。
- HUD の `DEF n` 削除: ring だけの意味が薄くなりすぎるため今回は残す。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v17_check.js
```

期待:

- clear-capable bot が clear し、boss final cue と final BOMB 使用を維持する。
- focused probe で prompt ring が出る。
- `DEF WINDOW` は popup にも HTML にも残らない。
- DEF 使用後に `defReadyT` と `defPromptCount` が 0 に戻る。
- v16 までの BOMB、shield、finite stage、medium anchor、Active DEF reward 検査が通る。
