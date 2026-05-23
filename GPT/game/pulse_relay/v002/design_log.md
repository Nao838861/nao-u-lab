# design log

## 2026-05-23

ユーザー指示:

> では、v002をいったん消して、v001と無関係に、v001を参照せずにゼロからv001レベルのものを作ってみて。

実行:

- 既存 v002 を削除し、空ディレクトリから再作成した。
- v001 のソース、敵配置、数値、ルートは参照していない。
- `memory/game_design_rules.md` と `memory/game_self_misjudgment_prevention_20260523.md` を読み、設計前ゲートとして `design_trace.md`、`wave_intent_table.md`、`eval_timeline.md`、`visual_review.md`、`self_judgment.md`、`known_failures.md` を作った。
- 実装前に 3 回の設計サイクルを `design_trace.md` に残し、初期 draft を `delete-and-redesign pass` で破棄した。

実装:

- 新規タイトルは `Pulse Relay v002: Vector Wake`。
- 通常ショットで小隊を撃ち切り、graze/kill で溜めた pulse で敵弾を消して反撃 shard を撃つ。
- 敵 route は `entry / show / exit` を持つ。退場方向は役割と結びつけた。
- boss は 48 秒に出現し、3 phase で攻撃が変化する。

検証:

- `node verify.js`: OK。
- `node enemy_overlap_check.js`: OK。初期完成時は `pairOverlaps: 0`, `minGap: 2.29`。
- `node timeline_eval.js`: OK。初期完成時は balanced clear 70.23 秒、boring runs なし、visible-but-not-shootable runs なし。
- boss TTK: ideal normal 15.97 秒、pulse burst 11.77 秒。

調整で得た教訓:

- sideArc の overlap は、単純な間隔不足ではなく、退出する敵と反対側から入る敵が同じ画面端を使ったことが原因だった。直角 offset ではなく、出現 side のブロック化で解いた。
- bridge lance と diver の overlap は、bridge lance の退場 rail と diver の入場 rail が近すぎたことが原因だった。route の目的を保ったまま rail を変えた。
- timeline の boring は単発秒と連続 run を分けて読むべき。単発の息継ぎを消し切ることが目的ではなく、退屈な連続区間を防ぐことが目的。

## enemy/wave redesign pass

ユーザー指摘:

> 敵の出現パターンや軌跡、出現から退場までの緩急や、登場順、敵同士のシナジーなど、実装されたもののレベルが低い。

原因分析:

- 敵ルートを「重ならないこと」の関数として扱いすぎ、何のために入場し、どこで撃たせ、なぜ掃けるかの意図が弱くなっていた。
- wave の順序が敵種紹介の列になっていて、プレイヤー状態を「中央で撃つ」「横へ振られる」「pulse で切り返す」「boss 前に照準を戻す」と遷移させる設計になり切っていなかった。
- headless 指標は boredom/overlap/clear 可否を拾ったが、全敵が同じリズムに見える問題や、軌跡の攻撃的な緩急不足を直接検出していなかった。

対処:

- scout / sideLance / sideArc / diverCut / carrierWake の `entry / show / exit` 時間を短縮し、入場を鋭く、show を撃つための短い窓、exit を役割に沿った掃け方へ再調整した。
- `buildWaves()` を敵種紹介ではなく、プレイヤー状態の流れで組み直した。opening scouts、左右の orange lance、magenta cut、carrier setup cross、green carrier + answer arc、pre-boss cut、boss warning という順にした。
- overlap は直角 offset ではなく、出現間隔、同一軌跡上の位相、左右ブロックの時間分離で解いた。意図のない不格好なズレは避けた。
- carrier 前後は scout/cut/sideArc を支援として配置し、carrier 単体の HP 的な硬さではなく、横圧と pulse 判断で山を作るようにした。

再検証:

- `node verify.js`: OK。balanced clear 68.82 秒、aggressive clear 66.22 秒、conservative clear 69.88 秒、pulse-heavy clear 68.95 秒。
- `node enemy_overlap_check.js`: OK。`pairOverlaps: 0`, `minGap: 0.08`。かなり密だが、重なりは出していない。
- `node timeline_eval.js`: OK。boring runs なし、visible-but-not-shootable runs なし、heavy pressure なし。

残る疑い:

- `minGap: 0.08` は意図的に密度を残した結果だが、見た目上は窮屈に見える可能性がある。
- 実ブラウザの長時間プレイや動画ベースの motion review はまだ不足している。headless で通ったことを完成の同義にしない。
