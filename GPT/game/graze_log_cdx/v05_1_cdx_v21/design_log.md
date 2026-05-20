# graze_log v05.2_cdx_v21 design_log

## 入力

継続 directive 原文:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

今回読むべき焦点:

> v20 の ring-only DEF 判断が実プレイで読めるか確認する。読めない場合は、文字 popup 復活ではなく ring 色/life/太さ/透明度、または短い非命令 cue を検討する。BOMB / 敵構成 / 報酬量は、DEF cue の人間評価が済むまで混ぜて動かさない。

## 実装前判断

v20 は headless で clear、boss final cue、final BOMB、Active DEF 使用、HUD 文字 cue 不在を通している。今回は「読めない場合」の候補のうち、文字を戻さずに最も小さい変更で済む ring の life / 太さ / 透明度だけを触る。BOMB、敵構成、報酬量、DEF 閾値は動かさない。

参照した過去知見:

- `Playable / Headless 評価`: clear だけでなく cue の存在・不在を focused check で見る。
- `Balance / Rule Space`: 報酬や敵密度を同時に動かさず、変更原因を一つにする。
- `Repair / Iterative Improvement`: v20 で通った挙動を保ち、cue 視認性だけを小さく試す。

## 設計サイクル 1

良いところ / 悪いところ 30件:

1. v20 は HUD が軽い。2. v20 は文字命令を削れている。3. ring-only は局所判断として筋が良い。4. ring が読めないと DEF が死ぬ。5. 文字を戻すと v20 の評価が戻る。6. BOMB は最終手段として維持できている。7. Active DEF は headless で使われている。8. headless は人間の視認を保証しない。9. life 42 は少し短い可能性がある。10. 太さ 3 は弾幕密度で埋もれる可能性がある。11. 色は既に緑系で意味が分かれている。12. 外側 ring があると範囲が読める。13. 外側 ring が強すぎるとうるさい。14. popup 文字は判断を奪う。15. 音 cue は今回の headless で見づらい。16. 半径だけ広げると判定範囲誤認が出る。17. life だけ伸ばすと残像が多くなる。18. 太さだけ上げると一瞬の見逃しは残る。19. 二重 ring は範囲と注意を分けられる。20. 既存 ring 描画に w/a fallback を足せば影響を限定できる。21. 既存 bomb ring には触らない。22. 敵構成を変えると評価が混ざる。23. reward を変えると評価が混ざる。24. DEF threshold を変えると別問題になる。25. v21 は v20 から作るのが安全。26. README 更新が必要。27. devlog 更新が必要。28. headless path 更新が必要。29. continuous directive 更新が必要。30. staging 更新が必要。

改善案 30件:

1. prompt ring life を 42 から 52 にする。2. prompt ring r0 を半径-20 にする。3. prompt ring r1 を半径+18 にする。4. lineWidth を 4 にする。5. 外側 ring を追加する。6. 外側 ring life を 34 にする。7. 外側 ring 色を薄い白緑にする。8. ring 描画に `w` を足す。9. ring 描画に `a` を足す。10. fallback で既存 ring を守る。11. `DEF WINDOW` は戻さない。12. `WINDOW n` は戻さない。13. `DEF n` は戻さない。14. `SPACE [D]EF` は戻さない。15. BOMB 表示は維持する。16. `DEF READY` は維持する。17. `DEF xN +R` は結果表示として維持する。18. title を v21 にする。19. README を v21 にする。20. devlog を v21 にする。21. check を v21 にする。22. check で二重 ring を見る。23. check で文字 cue 不在を見る。24. check で clear を見る。25. check で final BOMB を見る。26. check で Active DEF 使用を見る。27. directive を active のまま更新する。28. staging に結果を書く。29. 自分のファイルだけ stage する。30. commit / push する。

筋の良い案:

- v20 の ring-only 方針を保ち、prompt ring を二重化して視認性だけを上げる。

新しく生じる懸念:

- 外側 ring が強すぎると、静かな cue ではなく警告演出に見えてしまう。

## 設計サイクル 2

良いところ / 悪いところ 30件:

1. 二重 ring は文字を増やさない。2. cue は自機中心に残る。3. 押し時の場所と入力が一致する。4. life 52 は見逃しを少し減らす。5. 外側 life 34 は残像過多を避ける。6. 太さ 4 は弾に埋もれにくい。7. 透明度を上げすぎると視界を奪う。8. 外側色を白緑にすると特別感が出る。9. 既存 graze ring と区別できる。10. `DEF READY` から prompt ring への段階が残る。11. HUD 右上はまだ軽い。12. BOMB と DEF の役割は混ぜない。13. simpleBot で active DEF 使用を維持できる。14. final BOMB cue は維持すべき。15. stage grammar は維持すべき。16. shield は維持すべき。17. v21 の差分は戻しやすい。18. check は v20 から流用しやすい。19. constants export を増やす必要がある。20. latestRing は外側 ring になる。21. inner ring も HTML regex で確認できる。22. `ringCount >= 2` で二重化を確認できる。23. popup text には命令を出さない。24. title regex で v21 を確認できる。25. devlog に戻し手順を書く。26. design_log に判断理由を書く。27. continuous directive の焦点を次へ進める。28. 完成判定はまだしない。29. 人間評価は次回も必要。30. 既存 dirty 差分は混ぜない。

改善案 30件:

1. `DEF_PROMPT_RING_LIFE` を定数化する。2. `DEF_PROMPT_OUTER_LIFE` を定数化する。3. inner ring に `w:3` を入れる。4. inner ring に `a:1.08` を入れる。5. outer ring に `w:1.5` を入れる。6. outer ring に `a:0.74` を入れる。7. draw の globalAlpha を `r.a||1` で掛ける。8. draw の lineWidth を `r.w||2` にする。9. player prompt lineWidth を 4 にする。10. 補助 ring を `ACTIVE_DEF_RADIUS+16` にする。11. `ACTIVE_DEF_RADIUS+24` を check する。12. `ACTIVE_DEF_RADIUS+18` を check する。13. `lineWidth=prompt?4:1.5` を check する。14. `DEF_PROMPT_RING_LIFE=52` を check する。15. `DEF_PROMPT_OUTER_LIFE=34` を check する。16. `ringCount >= 2` を check する。17. outer latestRing を check する。18. `DEF WINDOW` 不在を維持する。19. `SPACE [D]EF` 不在を維持する。20. `WINDOW ${windowN}` 不在を維持する。21. `DEF ${Math.min...}` 不在を維持する。22. clear を維持する。23. active DEF 使用を維持する。24. final BOMB 使用を維持する。25. stage script 検査を維持する。26. README を簡潔にする。27. devlog に検証結果欄を置く。28. staging に path / command / result を書く。29. directive last_result を v21 にする。30. push 後 status を確認する。

筋の良い案:

- inner ring を認知 cue、outer ring を範囲 cue として分ける。

新しく生じる懸念:

- ring が読みやすくなりすぎると、Active DEF がまた主役化して BOMB の重みを削る可能性がある。

## 設計サイクル 3

良いところ / 悪いところ 30件:

1. v21 は playable diff である。2. 変更原因が cue 視認性だけである。3. 文字 cue は戻していない。4. BOMB economy は固定である。5. stage は固定である。6. reward は固定である。7. DEF threshold は固定である。8. check は focused。9. 人間評価は未完。10. 完成扱いはしない。11. done のうち clear は満たす。12. done のうち final BOMB は満たす。13. done のうち Active DEF cue は機械的には満たす。14. 実プレイで読めるかは残る。15. v20 に戻せる。16. 外側 ring だけ削れる。17. life だけ戻せる。18. HUD 文字復活は最後にする。19. README は十分。20. devlog は十分。21. design_log は原文を残す。22. headless は v21 path。23. continuous directive は active。24. staging は必要。25. commit は必要。26. push は必要。27. 既存 v18 削除差分は無関係。28. memory 大量差分は無関係。29. lock file は無関係。30. 次回は実プレイ評価を優先する。

採用案:

- v20 の ring-only 方針を維持し、prompt ring を二重化して視認性を上げる。

採用しない案:

- `DEF WINDOW` popup 復活: 判断を文字で命令する方向へ戻るため不採用。
- `SPACE [D]EF` 復活: HUD 右上を読むゲームに戻るため不採用。
- BOMB / 敵構成 / reward 調整: 今回の評価軸から外れるため不採用。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v21_check.js
```

期待:

- clear-capable bot が clear する。
- boss final cue と final BOMB 使用を維持する。
- prompt ring が二重化され、outer life 34、inner life 52 になる。
- `WINDOW n` / `DEF n` / `SPACE [D]EF` / `DEF WINDOW` が復活していない。
- simpleBot が clear run 内で Active DEF を 1 回以上使う。
