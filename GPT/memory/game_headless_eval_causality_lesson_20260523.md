---
name: game_headless_eval_causality_lesson_20260523
type: lesson
status: active
created: 2026-05-23
tags:
  - game-design
  - shmup
  - evaluation
  - headless
  - repair
---

# ヘッドレス評価の因果切り分け教訓

## いつ読むか

2D シューティングやアクションゲームで、敵の動き・弾・ボス・評価器を同時に触った後、ヘッドレス評価が落ちた時に読む。

特に次の状況では必読:

- route / good policy が落ちたので、直前に触った敵挙動を原因だと断定したくなった時。
- boss-rush / aggressive など別 policy は通るのに、route だけが落ちる時。
- 評価器を直すことが「指標ハック」か「評価器の欠陥修正」か判断が曖昧な時。
- 敵隊列の重なりを横オフセットやランダムなズレで解決したくなった時。

## 今回の失敗

Pulse Relay v001 の敵移動修正で、隊列が重なるという指摘に対して、最初に横オフセットを入れた。これは根本解決ではなかった。隊列が同じレールを走る時に必要なのは、見た目の横ズレではなく、同じ軌跡上で十分な時間差・縦間隔・進捗差を保つことだった。

その後、route policy がボスで落ちた時に「退場変更で燃料敵が足りなくなった」と早く断定した。実際には、最新ログでは route はボス HP を残り 11.8 まで削っており、boss-rush / aggressive はクリアしていた。死亡ログでは自機が左下端に張り付き、boss-final-lane / boss-final-aim に連続被弾していた。これは敵退場の問題ではなく、route policy がボス終盤の位置取りを正しく表現できていない可能性が高かった。

## 次回のルール

ヘッドレス評価が落ちたら、原因を一つに決める前に次を確認する。

1. 同じビルドで複数 policy を比較する。route だけ落ち、boss-rush や aggressive が通るなら、ゲーム側の不可能化ではなく route policy の弱さを疑う。
2. 死亡直前のログを取る。最低限、時刻、被弾回数、自機位置、ボス HP、敵数、弾数、最寄り弾 role、変換数、relay hit 数を出す。
3. 「燃料不足」「弾が多すぎる」「評価器が端に逃げる」などの仮説を、ログで分ける。言葉だけで決めない。
4. 評価器を直す時は、指標のために無敵化・過剰最適化しない。人間の標準プレイとして不自然な挙動だけを直す。
5. route がボスに入ったら、道中の巡回方針を続けるのではなく、ボス用の射線維持・弾回避・Pulse 機会回収の方針へ切り替える。道中 route とボス route は役割が違う。
6. bad policy はそのまま残す。route の修正で camper / lane-holder / blind-sweeper が相対的に強くなっていないか確認する。

## 敵移動のルール

隊列の重なりを避ける時:

- 横オフセットで隊列を崩さない。意味なくズレた隊列は気持ち悪く見える。
- 同じ隊列は同じレールを通し、生成時刻、targetY、経路進捗で分離する。
- side sweep は横方向の隊列なので、縦間隔を広げる。targetX を個体ごとに散らしてごまかさない。
- dive は突入、切り返し、離脱の意図を持たせる。退場時に全員が突然直線補間で意志を失ったように見えるなら失敗。
- 退場は「画面外へ消す処理」ではなく、その敵が何をした後にどこへ抜けるかを示す最後の動作として作る。

## 今回の対処例

Pulse Relay v001 では、route policy をボス出現後に boss-rush 方針へ切り替えた。これは route を強化して指標を通すためではなく、標準プレイがボス戦に入った後も道中巡回の優先順位を続けて左下端に張り付くのが不自然だったため。boss-rush は既に「ボスを狙いながら弾を読み、Pulse を使う」検証 policy として存在していたので、標準 route のボス部分に流用するのが妥当だった。

検証では `node verify.js`, `node timeline_eval.js`, `node wave_grammar_check.js`, `node shot_log_motion_compare.js` を実行し、route clearRate 1、boss-rush clearRate 1、camper / lane-holder / blind-sweeper は clearRate 0 のまま維持した。
