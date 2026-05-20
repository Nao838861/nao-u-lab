# graze_log v05.2_cdx_v19 design_log

## 入力

継続 directive 原文:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

今回読むべき焦点:

> v17 の quiet DEF ring に実プレイで気づけるか確認する。ring only で押す判断が弱すぎる場合、文字 popup 復活ではなく ring 色/life/太さで調整する。`WINDOW n` + `DEF n` が HUD 上で情報過多にならないか確認する。

## 実装前判断

v17 は `DEF WINDOW` 文字 popup を削り、Active DEF の押し時を ring only にした。これは「ゲームが答えを文字で言いすぎる」問題を避ける点では良い。ただし v17 の headless check では clear-capable bot が clear しても Active DEF を使わず、cue が人間にも弱すぎる可能性が残った。

今回は BOMB、敵構成、boss HP、shield、DEF reward には触らない。変更原因を cue の読みやすさに限定する。採用するのは、`DEF_PROMPT_FRAMES` を 84 から 78 に短縮し、prompt ring を少し太く長くして、文字 popup を復活させずに「気づける quiet cue」へ寄せる案。

参照した過去知見:

- `Playable / Headless 評価`: clear だけでなく focused cue probe を見る。
- `Balance / Rule Space`: 報酬や敵密度を同時に動かさず、変更原因を一つにする。
- `Repair / Iterative Improvement`: v17 の良い方針を保ち、検証可能な小差分で改善する。

## 設計サイクル 1

良いところ / 悪いところ 30件:

1. v17 は `DEF WINDOW` 文字を消した。
2. 文字命令がないので弾幕の主役を奪いにくい。
3. ring は Active DEF の半径と同じ座標系で読める。
4. `DEF READY` は閾値到達通知として残っている。
5. HUD の `DEF n` は押し時の補助になる。
6. ただし v17 の ring life 30 は短い。
7. r0 48 / r1 68 は半径情報として狭い。
8. 84 frames は条件が安定しすぎるまで待つ。
9. bot は v17 で Active DEF を使わず clear した。
10. 人間も BOMB だけで進む可能性がある。
11. cue が弱いと Active DEF の存在が体験に残らない。
12. 文字 popup 復活は答えを出しすぎる。
13. reward 増量は BOMB balance と混ざる。
14. 弾幕密度変更は stage balance と混ざる。
15. ring の太さ変更は影響範囲が狭い。
16. ring の寿命変更は focused check で測れる。
17. prompt frame 変更も focused check で測れる。
18. title が v15 のまま残っている。
19. title 表記ずれは版比較を混乱させる。
20. boss final cue は維持できている。
21. final BOMB も維持できている。
22. finite stage は維持できている。
23. shield 4 は維持できている。
24. Active DEF reward は機能している。
25. `WINDOW n` は有用だが HUD はやや重い。
26. HUD 文字削除は別評価に分けた方がよい。
27. 今回は cue 視認性だけを動かすのが安全。
28. v18 は作業ツリー上で削除状態のため触らない。
29. v19 を v17 から作ると既存差分と衝突しにくい。
30. 完成判断にはまだ実プレイ評価が必要。

改善案 30件:

1. HTML title を v19 にする。
2. title screen を v19 にする。
3. `DEF_PROMPT_FRAMES` を 78 にする。
4. ring life を 42 にする。
5. ring r0 を `ACTIVE_DEF_RADIUS-18` にする。
6. ring r1 を `ACTIVE_DEF_RADIUS+10` にする。
7. prompt 中の lineWidth を 3 にする。
8. 補助 ring を `DEF_PROMPT_FRAMES/3` 以降に出す。
9. 補助 ring 半径を `ACTIVE_DEF_RADIUS+12` にする。
10. `DEF WINDOW` 文字は復活させない。
11. `DEF READY` は維持する。
12. `DEF xN +R` reward popup は維持する。
13. BOMB cooldown は維持する。
14. BOMB damage は維持する。
15. boss final cue は維持する。
16. shield は維持する。
17. enemy script は維持する。
18. focused check の path を v19 にする。
19. focused check の ring 期待値を更新する。
20. focused check に lineWidth 検査を足す。
21. focused check に title 表記検査を足す。
22. simpleBot の Active DEF 使用を検査する。
23. README を v19 にする。
24. devlog を v19 にする。
25. design_log に判断理由を残す。
26. continuous directive を v19 に更新する。
27. staging に結果を残す。
28. unrelated dirty files を stage しない。
29. git object 破損は報告する。
30. push できない場合は未 push hash を報告する。

筋の良い案:

- quiet ring のまま、78 frames / life 42 / 太めの cue へ寄せる。

解決できる問題:

- v17 の「静かすぎて使われない」リスクを、文字命令を戻さずに下げられる。

新しく生じる懸念:

- cue が少し強くなるため、ring が常時主張しているように見える可能性がある。

## 設計サイクル 2

良いところ / 悪いところ 30件:

1. 78 frames は 84 より早い。
2. 78 frames でも瞬間反応ではない。
3. prompt window は 2 のまま。
4. graze streak 閾値は 8 のまま。
5. ring life 42 は Active DEF frames と揃う。
6. life が長いと見落としにくい。
7. life が長すぎると常時 cue に見える。
8. 42 は一発の合図として読める範囲。
9. r0/r1 の幅を広げると視認性が上がる。
10. 幅を広げすぎると弾を隠す。
11. r0 44 / r1 72 は半径の前後を示す。
12. lineWidth 3 は文字より控えめ。
13. 補助 ring は早めに見える。
14. 補助 ring は薄いので命令感は弱い。
15. `DEF n` はまだ残る。
16. `WINDOW n` もまだ残る。
17. HUD 削除は今回の狙いから外れる。
18. simpleBot Active DEF 使用は必要条件にできる。
19. simpleBot が使うだけでは人間の納得は保証しない。
20. それでも v17 より cue が届く証拠になる。
21. `DEF WINDOW` 不在検査は維持する。
22. title 検査は版混乱の再発防止になる。
23. BOMB final の成功は維持すべき。
24. stage script の成功は維持すべき。
25. medium anchor 検査は維持すべき。
26. shield 検査は維持すべき。
27. reward 検査は維持すべき。
28. v19 は playable diff として十分小さい。
29. 次回は人間評価を受けるのがよい。
30. 完成判定はまだしない。

改善案 30件:

1. bot report に `activeDefCount` を読む。
2. `simpleBotUsesActiveDefCue` を追加する。
3. `grazeCount >= GRAZE_STREAK_TH` を条件にする。
4. `activeDefCount >= 1` を条件にする。
5. clear 条件も合わせる。
6. v19 title text を regex 検査する。
7. `ACTIVE_DEF_RADIUS+10` を regex 検査する。
8. `ACTIVE_DEF_RADIUS+12` を regex 検査する。
9. `lineWidth=prompt?3:1.5` を regex 検査する。
10. `DEF WINDOW` 不在を維持する。
11. ring life 42 を object 検査する。
12. ring r0/r1 を object 検査する。
13. promptCount reset を維持する。
14. Active DEF 使用後 reset を維持する。
15. BOMB 5-way 非常時化の検査を維持する。
16. BOMB recharge 非自動の検査を維持する。
17. final cue の文言検査を維持する。
18. boss kill clear 検査を維持する。
19. stage flag 検査を維持する。
20. wave intent 検査を維持する。
21. README に実行方法を残す。
22. devlog に検証結果欄を残す。
23. directive に last_result を残す。
24. staging に commit 予定と push 不可理由を残す。
25. v18 削除差分は触らない。
26. Claude 側差分は触らない。
27. untracked atoms は触らない。
28. Git object 破損のため sync/push 制約を明記する。
29. v19 folder だけを stage する。
30. tool v19 だけを stage する。

筋の良い案:

- ring cue の object 検査と simpleBot の Active DEF 使用検査を両方入れる。

解決できる問題:

- 「見た目だけ変えたが実際に DEF 使用へつながるか」が headless で少し見える。

新しく生じる懸念:

- bot の挙動が seed 依存なので、人間評価とは別に扱う必要がある。

## 設計サイクル 3

良いところ / 悪いところ 30件:

1. v19 は新規 version folder なので過去版を残す。
2. v17 との比較がしやすい。
3. v18 削除差分に干渉しない。
4. headless check が専用名になる。
5. README が単独で読める。
6. devlog が次回焦点を残す。
7. design_log が原文 directive を残す。
8. staging が phase 結果を残す。
9. Git は object 破損で同期できない。
10. object 破損は作業内容とは別問題。
11. commit できない可能性がある。
12. push できない可能性が高い。
13. それでも playable diff は残せる。
14. headless check はローカルで通せる。
15. ブラウザで index.html を開ける。
16. Active DEF cue は ring only を維持する。
17. 文字 popup 復活を避ける。
18. 報酬増量を避ける。
19. 難度変更を避ける。
20. HUD 削除を避ける。
21. 次回の実プレイ評価につなげる。
22. Nao_u の停止指示がない限り active 継続。
23. 完成とは言わない。
24. clear-capable は維持する。
25. final BOMB は維持する。
26. simpleBot の Active DEF 使用を得る。
27. v19 は「判断 cue の可読性改善」として意味がある。
28. 変更範囲は限定できている。
29. 残課題は人間評価に残る。
30. 次サイクルでは HUD 情報量か実プレイフィードバックを扱う。

改善案 30件:

1. v19 index を実装する。
2. v19 README を書く。
3. v19 devlog を書く。
4. v19 design_log を書く。
5. v19 headless check を作る。
6. headless check を実行する。
7. 結果を staging に追記する。
8. directive を更新する。
9. status で差分を見る。
10. 自分のファイルだけ stage する。
11. commit を試す。
12. push を試す。
13. 失敗時は理由を報告する。
14. 未 push hash があれば報告する。
15. commit できなければ hash なしで理由を報告する。
16. v18 削除を stage しない。
17. Claude 側差分を stage しない。
18. memory atoms を stage しない。
19. lock file を stage しない。
20. logs の既存差分を混ぜない。
21. object 破損を隠さない。
22. sync 不能を隠さない。
23. final では実行方法を伝える。
24. final では検証コマンドを伝える。
25. final では push 状態を伝える。
26. final では残課題を短く言う。
27. 次回は human cue 評価にする。
28. completed directive にはしない。
29. continuous directive は active のままにする。
30. Nao_u が止めるまで継続する。

採用案:

- `DEF_PROMPT_FRAMES=78`、life 42、少し太い ring、補助 ring の早期表示、`simpleBotUsesActiveDefCue` 検査。

採用しない案:

- `DEF WINDOW` popup 復活: 判断を文字で命令する方向へ戻るため不採用。
- DEF reward 増量: BOMB economy と混ざるため不採用。
- enemy/script 調整: cue 評価と難度評価が混ざるため不採用。
- HUD 文字削除: 今回は cue の視認性評価を先に固定するため不採用。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v19_check.js
```

期待:

- clear-capable bot が clear する。
- boss final cue と final BOMB 使用を維持する。
- focused probe で prompt ring が life 42 / r0 44 / r1 72 になる。
- `DEF WINDOW` は popup にも HTML にも残らない。
- simpleBot が clear run 内で Active DEF を 1 回以上使う。
