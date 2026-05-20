# graze_log v05.2_cdx_v20 design_log

## 入力

継続 directive 原文:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

今回読むべき焦点:

> v19 の readable quiet DEF cue に実プレイで気づけるか確認する。`WINDOW n` + `DEF n` が HUD 上で情報過多なら、次回は HUD 文字を削る前に ring だけで判断できるかを評価する。

## 実装前判断

v19 の headless check は、clear、boss final cue、final BOMB、Active DEF 使用を通した。したがって今回は BOMB、敵構成、報酬量、DEF ring の太さや寿命を動かさない。変更原因を「HUD 文字 cue の削除」だけに絞り、ring only で押し時が成立するかを評価できる版にする。

参照した過去知見:

- `Playable / Headless 評価`: clear だけでなく cue の存在・不在を focused check で見る。
- `Balance / Rule Space`: 報酬や敵密度を同時に動かさず、変更原因を一つにする。
- `Repair / Iterative Improvement`: v19 で通った挙動を保ち、壊したい仮説だけを小さく試す。

## 設計サイクル 1

良いところ / 悪いところ 30件:

1. v19 の ring は文字 popup なしで見える。2. Active DEF 使用は headless で確認済み。3. `DEF READY` は閾値到達だけを知らせる。4. HUD の `WINDOW n` は押し時を数値で言いすぎる。5. HUD の `DEF n` は時間カウントで答えに近い。6. 右上 `SPACE [D]EF` は操作可能を直接言う。7. 文字が多いと弾幕より HUD を読む。8. ring は自機中心なので行動と場所が一致する。9. ring only は人間に気づかれない危険がある。10. しかし v19 の太さと life は残せる。11. BOMB 表示まで削ると別問題になる。12. `DEF READY` まで削ると存在認知が落ちる。13. 敵構成を変えると評価が混ざる。14. reward を変えると economy が混ざる。15. DEF threshold を変えると v19 比較が崩れる。16. title 表記更新は必要。17. README 更新は必要。18. devlog 更新は必要。19. headless path 更新は必要。20. 文字 cue 不在検査が必要。21. ring 維持検査が必要。22. simpleBot Active DEF 使用検査は維持する。23. final BOMB 検査は維持する。24. stage grammar 検査は維持する。25. shield 検査は維持する。26. conflict marker は directive 判定を壊す。27. v20 は v19 から作るのが安全。28. v18 削除差分には触らない。29. 完成判定はまだしない。30. 次回は人間評価を優先する。

改善案 30件:

1. `WINDOW n` を消す。2. `DEF n` を消す。3. `SPACE [D]EF` を消す。4. `DEF READY` は残す。5. ring 設定は維持する。6. prompt ring life 42 を維持する。7. `DEF_PROMPT_FRAMES=78` を維持する。8. 補助 ring を維持する。9. BOMB HUD は維持する。10. cooldown 表示は維持する。11. stage script は維持する。12. boss final cue は維持する。13. title を v20 にする。14. README を v20 にする。15. devlog を v20 にする。16. check を v20 path にする。17. check に `WINDOW` 不在検査を足す。18. check に `DEF ${...}` 不在検査を足す。19. check に `SPACE [D]EF` 不在検査を足す。20. check に ring-only title 検査を足す。21. clear-capable を維持する。22. Active DEF 使用を維持する。23. final BOMB 使用を維持する。24. directive conflict を解消する。25. directive last_result を v20 にする。26. staging に結果を書く。27. 自分のファイルだけ stage する。28. push 前に status を確認する。29. push 失敗時は hash を報告する。30. v20 を playable diff として残す。

筋の良い案:

- v19 の ring cue を維持し、HUD 文字 cue だけを削る。

解決できる問題:

- Active DEF が「HUD の数値を見て押す」操作になる問題を減らし、弾幕上の cue と自機位置で判断させられる。

新しく生じる懸念:

- 人間が ring に気づかず、Active DEF を使わないまま BOMB だけで進む可能性がある。

## 設計サイクル 2

良いところ / 悪いところ 30件:

1. HUD 2 行目が短くなる。2. 視線が画面中央へ戻る。3. ring の意味が相対的に強くなる。4. `DEF READY` は入口 cue として残る。5. `SPACE [D]EF` を消すと操作可能状態は弱くなる。6. 操作説明文には DEF(D) が残る。7. BOMB 可能表示は残る。8. BOMB は最終手段として読ませたい。9. DEF は局所判断として読ませたい。10. 右上に DEF を出すと BOMB と同列に見える。11. ring only は局所判断らしい。12. 数値 window はデバッグ臭い。13. v20 は polished に少し近い。14. ただし `STREAK` はまだ数値。15. `STREAK` は準備までの長期状態として許容。16. `DEF n` は短期タイミングなので削る。17. `WINDOW n` は近傍弾数なので削る。18. popup の `DEF x4 +8` は結果なので残す。19. reward popup は学習に必要。20. `DEF WINDOW` popup は命令なので戻さない。21. headless は人間の気づきを保証しない。22. それでも regression は拾える。23. v19 と v20 の比較軸は明確。24. next focus を書ける。25. commit 単位も明確。26. conflict 解消を混ぜるが必要最小限。27. existing dirty files は別作業。28. v20 folder は新規追加。29. v19 は残す。30. 作業停止条件には達していない。

改善案 30件:

1. HUD に `WINDOW` 文字列がないことを検査する。2. HUD に `DEF ${Math.min...}` がないことを検査する。3. `SPACE [D]EF` がないことを検査する。4. `DEF WINDOW` がないことを検査する。5. `DEF READY` は検査対象にしない。6. `DEF xN +R` は維持する。7. title regex を v20 にする。8. path を v20 にする。9. simpleBot をそのまま使う。10. seed をそのまま使う。11. boss final cue をそのまま見る。12. BOMB non-auto recharge を見る。13. Active DEF threshold を見る。14. prompt ring r0/r1/life を見る。15. stage flags を見る。16. wave intents を見る。17. medium anchor を見る。18. shield 4 を見る。19. boss HP を見る。20. final BOMB damage を見る。21. README に戻し手順は devlog 参照とする。22. devlog に戻し手順を書く。23. design_log に原文を残す。24. staging に command を残す。25. directive を active のままにする。26. last_result を v20 にする。27. merge marker を消す。28. status を確認する。29. commit/push を試す。30. 残課題は人間評価に置く。

筋の良い案:

- `STREAK` は残し、短期判断だけを ring に寄せる。

解決できる問題:

- 完全に無情報にせず、準備状態と押し時を分離できる。

新しく生じる懸念:

- `STREAK` が残るため、まだ HUD を読む癖は残る。

## 設計サイクル 3

良いところ / 悪いところ 30件:

1. v20 は小差分である。2. playable である。3. v19 に戻しやすい。4. 検証が focused。5. 文字 cue 削除の是非が見える。6. ring 表示は維持。7. BOMB 表示は維持。8. `DEF READY` は維持。9. reward 学習も維持。10. HUD は軽くなる。11. 人間評価が必要。12. bot 評価は補助。13. conflict marker 解消は運用上必要。14. Slack pending はない。15. continuous directive は active。16. done ではない。17. v18 削除差分は無関係。18. memory 大量差分は無関係。19. Claude 側差分は無関係。20. staging は必要。21. commit は必要。22. push は必要。23. 既存 dirty に巻き込まれない stage が必要。24. headless 出力を確認する。25. final では path を伝える。26. final では検証を伝える。27. final では push 状態を伝える。28. 次回は実プレイ評価。29. 読めないなら ring 調整。30. 文字命令復活は最後にする。

改善案 30件:

1. v20 index を実装する。2. v20 README を書く。3. v20 devlog を書く。4. v20 design_log を書く。5. v20 check を作る。6. check を実行する。7. directive を更新する。8. staging を更新する。9. status を見る。10. 自分のファイルだけ stage する。11. commit する。12. push する。13. push 後 status を見る。14. 失敗時に hash を出す。15. `v05_1_cdx_v18` 削除を stage しない。16. unrelated logs を stage しない。17. unrelated memory を stage しない。18. lock を stage しない。19. `CONTINUOUS_DIRECTIVE.md` は conflict 解消分だけ stage する。20. check script は v20 だけ stage する。21. game folder は v20 だけ stage する。22. `design_log` は日本語で残す。23. 3 cycle を残す。24. 戻し手順を残す。25. 検証方法を残す。26. 採用しない案を書く。27. 懸念を書く。28. 次回焦点を書く。29. 完成扱いしない。30. active 継続にする。

採用案:

- `WINDOW n` / `DEF n` / `SPACE [D]EF` を削除し、v19 の ring cue を維持する。

採用しない案:

- `DEF WINDOW` popup 復活: 判断を文字で命令する方向へ戻るため不採用。
- DEF ring のさらなる強化: v19 の ring 評価前に動かすと原因が混ざるため不採用。
- BOMB / 敵構成 / reward 調整: 今回の評価軸から外れるため不採用。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v20_check.js
```

期待:

- clear-capable bot が clear する。
- boss final cue と final BOMB 使用を維持する。
- focused probe で prompt ring が life 42 / r0 44 / r1 72 になる。
- `WINDOW n` / `DEF n` / `SPACE [D]EF` が HTML から消えている。
- `DEF WINDOW` は popup にも HTML にも残らない。
- simpleBot が clear run 内で Active DEF を 1 回以上使う。
