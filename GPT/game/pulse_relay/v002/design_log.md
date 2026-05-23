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
- `node enemy_overlap_check.js`: OK。`pairOverlaps: 0`, `minGap: 2.29`。
- `node timeline_eval.js`: OK。balanced clear 70.23 秒、boring runs なし、visible-but-not-shootable runs なし。
- boss TTK: ideal normal 15.97 秒、pulse burst 11.77 秒。

調整で得た教訓:

- sideArc の overlap は、単純な間隔不足ではなく、退出する敵と反対側から入る敵が同じ画面端を使ったことが原因だった。直角 offset ではなく、出現 side のブロック化で解いた。
- bridge lance と diver の overlap は、bridge lance の退場 rail と diver の入場 rail が近すぎたことが原因だった。route の目的を保ったまま rail を変えた。
- timeline の boring は単発秒と連続 run を分けて読むべき。単発の息継ぎを消し切ることが目的ではなく、退屈な連続区間を防ぐことが目的。
