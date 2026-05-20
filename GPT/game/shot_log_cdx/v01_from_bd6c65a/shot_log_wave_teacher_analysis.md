# shot_log v01 wave teacher analysis

## 入力

Nao_u 指示:

> いまよりもshot_logの方がよいのは明白なので、いまとshot_logの差分はよりよくする方向の改善と明確に言える。その差分を利用して、shot_logをさらに良くできないか考えてみてほしい。
> ブレストして分析して実装して。

## 何を教師データにするか

graze_log v28 の失敗は、shot_log の良さを逆方向から説明している。

- 敵が少ないと、撃つ快感が途切れる。
- wave が単発だと、撃破後に空白が残る。
- 横から来る敵が射線に乗らないと、気持ちよさではなく撃ちにくさになる。
- boss が孤立すると、ゲームのリズムが止まる。
- 既存ゲームの名前より、実際に気持ちよく成立した wave の密度と重なりが重要。

shot_log v01 の教師データは `buildWaves()` そのもの。特に、Nao_u が直接指示した「敵数を最低3倍」「さらに2-3倍」「緩急」「狙う時間を作る」が反映された 13 wave 構成を正例として使う。

## ブレスト cycle 1: 現状の良いところ / 悪いところ 30

1. shot_log は総敵数が多い。
2. W4 以降は複数編隊が重なっている。
3. small が破壊燃料として機能している。
4. medium は撃破時の圧力を増やす。
5. large は存在感がある。
6. boss 中にも雑魚が出る。
7. ボムがハイリスクハイリターンとして残っている。
8. 打ち返し弾が撃破位置に意味を持たせている。
9. W1 は6体だけで、今の完成度から見ると薄い。
10. W5 divers は撃破が速いと後続が薄くなる可能性がある。
11. boss 中の後半は、撃ち切った後の燃料がやや細い。
12. JS と headless の wave 定義が一部ずれていた。
13. headless が教師データとして使いにくくなる。
14. W7 の large debut が JS にあるのに headless 側で抜けていた。
15. W11 の large も headless 側で抜けていた。
16. pBoss の滞在時間も JS と headless で違っていた。
17. これでは評価が「実装の現実」ではなくなる。
18. graze_log の負例から見ると、空白時間は明示的に管理した方がよい。
19. ただし敵を無制限に増やすと視認性が落ちる。
20. late boss fuel は追加できるが、wave 間隔を伸ばしすぎるとテンポが落ちる。
21. 既存の良い wave を壊す変更は避ける。
22. 横 sweep を増やすより、射線に乗る column を足す方が安全。
23. 序盤は増やしてよい。
24. boss 中は増やしてよい。
25. climax はすでに濃いので触らない。
26. score / BOMB / revenge の根幹は触らない。
27. SE / 演出も触らない。
28. 変更は wave grammar だけに限定する。
29. headless と JS を同期する。
30. 実装後に wave metrics を確認する。

## ブレスト cycle 2: 改善案 30

1. W1 を center 6 から center + left + right の18体にする。
2. W1 を30体にする。
3. W1b を削る。
4. W5 divers に side fuel column を足す。
5. W5 の dive 数を24にする。
6. W6 に large を足す。
7. W7 の large を早める。
8. boss 中に late small columns を足す。
9. boss 中に late medium sweep を足す。
10. boss 中に large をさらに1体足す。
11. W12/W13 は触らない。
12. W2/W3 の side sweep を速くする。
13. W2/W3 の side sweep を遅くする。
14. pSideEntry を変える。
15. pLineDown の滞在時間を長くする。
16. pTopDown を遅くする。
17. pBoss の滞在時間を headless と JS で同期する。
18. headless W7 に large を戻す。
19. headless W11 に large を戻す。
20. wave_grammar_check の warnings を追加観測する。
21. 空白時間を直接計測する script を作る。
22. まず metrics だけ見る。
23. devlog に原因を書く。
24. README は触らない。
25. self_judgment は今回触らない。
26. BOMB policy は触らない。
27. defensive 0% 問題は別課題にする。
28. score balance は触らない。
29. v02 ではなく v01 仕上げとして扱う。
30. commit/push する。

## ブレスト cycle 3: 採用

採用:

- W1 を18体にする。最初の数秒から撃つ対象が途切れない。
- W5 に左右 column fuel を16体追加する。divers の後の空白を避ける。
- boss 中の後半に small column と medium sweep を追加する。ただし wave 間隔は500Fのまま維持し、テンポを伸ばさない。
- headless の `build_waves()` を JS と同期する。W7 large、W11 large、pBoss duration を合わせる。

却下:

- W12/W13 の climax 増量。すでに十分濃く、視認性リスクが高い。
- pSideEntry の軌跡変更。既存 shot_log の気持ちよさを壊すリスクがある。
- BOMB / revenge / score の変更。今回は wave grammar のみに絞る。

## 実装結果

- W1: 6体 → 18体。
- W5: 16体 → 32体。
- W11 boss wave: late fuel を small 16体 + medium 6体追加。
- total enemies: 473 → 526。
- center policy average: 66.9s → 98.5s。
- center policy BOMB average: 2.3 → 3.7。
- center policy item average: 80.3 → 127.7。
- JS と headless の wave 定義を同期。

## 残り

headless の defensive policy はまだ 3way 体感が低く、これは wave 密度とは別に「下端回避だけでも快感ループに入る報酬経路」の課題として残る。今回の変更は、良い正例である shot_log の密度と重なりをさらに補強する局所改善に留めた。
