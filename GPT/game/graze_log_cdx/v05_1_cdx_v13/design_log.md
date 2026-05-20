# graze_log v05.2_cdx_v13 design_log

## 入力

ユーザー指示:

> あらためて分析して実装して。実装が終わったら、D:\AI\Nao_u_BOT\Claude\game\shot_log\dialogue_archive に当時の作ったログがあるので読んであらためて分析して。その分析を基にさらに次のバージョンを別フォルダで作って。

## 設計サイクル

良いところ / 悪いところ 30 件:

1. v12 は shot_log の配置文法を入れ、単調さを減らした。
2. v12 は headless clear まで通った。
3. ただし v12 は archive 再読前なので、当時の対話由来の細部はまだ弱い。
4. shot_log は Nao_u の直接編集も強く効いていた。
5. auto-shoot 化で判断の中心が位置取りへ移った。
6. boss / path patterns はステージの節目を作った。
7. 中ボスとボスの存在感は後から明示的に増やされていた。
8. MAX 到達を見落とす問題は、エフェクトで解くべきと指示されていた。
9. BOMB 後の結果は粒子などで見せる必要がある。
10. 近距離の理不尽な死因は mercy で逃がす方向だった。
11. 敵爆発と弾の色相分離は視認性に重要。
12. 30秒で死ぬAIでは定性評価できない。
13. clear-capable AI が必要。
14. v13 では配置は増やしすぎず、節目の読みやすさを足すべき。
15. 打ち返し弾は graze_log へ移植しない。
16. 圧は敵配置と敵弾で作る。
17. シールド在庫は緊張を完全には消さない。
18. シールド在庫が多すぎると緊張が薄くなる。
19. ただし v12 の密度では事故吸収が必要。
20. MAX cue は説明文より画面状態で見せる。
21. boss final cue は v11 の直接命令弱化を維持する。
22. BOMB は 5-way 常時化させない。
23. BOMB 後 `G_LV3` 戻しは維持する。
24. warning wave による boss 前 stock 作成は維持する。
25. visible auto verify はユーザー確認に有効。
26. headless と visible bot は同じ思想で動く方がよい。
27. `auto_verify.html` はダブルクリック可能でよい。
28. README は v13 の正しい起動方法を書く。
29. dialogue archive 分析は別 md に残す。
30. 次版では人間プレイで shield 6 が過剰でないか見る。

改善案 30 件:

1. `v05_1_cdx_v12` を `v05_1_cdx_v13` にコピーする。
2. title を v13 に更新する。
3. `maxCueT` を state に追加する。
4. `addGauge` で MAX 到達遷移を検出する。
5. MAX 到達時に金色リングを出す。
6. MAX 到達時に `CORE CHARGED` popup を出す。
7. MAX 到達時に短いフラッシュを出す。
8. MAX 到達時に粒子を出す。
9. volcanoMid の半径を上げる。
10. heavyTankMid の半径を上げる。
11. boss の半径を上げる。
12. boss part の offset を広げる。
13. シールド在庫を 6 にする。
14. recovery fan を reward 付き関数へ分離する。
15. recovery fan に stageFlag を付ける。
16. `?bot=1` を読む。
17. visible bot の target 選択を headless と合わせる。
18. visible bot は title から自動開始する。
19. visible bot は final cue で BOMB を使う。
20. visible bot は DEF ready で ACTIVE DEF を使う。
21. `auto_verify.html` を追加する。
22. headless v13 path に更新する。
23. headless で `CORE CHARGED` を検査する。
24. headless で `SHIELD BREAK` を検査する。
25. README を v13 用に書き直す。
26. devlog を v13 用に書き直す。
27. archive analysis md を追加する。
28. v12 README も v12 用に直す。
29. `node tools\headless_graze_log_cdx_v05_2_v13_check.js` を通す。
30. commit / push する。

採用:

- v13 は v12 の配置を維持し、archive 由来の「見える節目」「リカバー」「クリアAI評価」を追加する。
