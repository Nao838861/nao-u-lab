# graze_log v05.2_cdx_v23 devlog

## 目的

Nao_u の指摘は「何かを変えたと言っているが体感が変わっていない」「敵の出現パターンも動きも変」「直線やサインカーブばかりで面白みに欠ける」。v22 は敵配置を触らず、評価ルールだけを足したため、この指摘に対して外していた。

指定された shot_log 長時間ログでは、初期の問題として「ランダムに単調な動きの敵が出てるだけ」が挙げられ、対策として 1942/1943 の縦 STG 編隊文法を模倣する方針が出ている。今回はその文脈に戻し、敵出現と敵運動の見た目・圧・狙う時間を変える。

## 実装

- v22 をコピーして `v05_1_cdx_v23` を作成。
- `STAGE_EVENTS` を 1942 型の 20 wave に差し替え。
- 新敵種を追加:
  - `redWing`: 大量に出る赤ザコ。撃破快感とゲージ供給。
  - `hookWing`: 横から侵入して弧を描く赤ザコ。
  - `wheelWing`: 円弧旋回してから崩れる赤ザコ。
  - `orangeAce`: 少数の強敵。停止気味に狙い弾を撃ってから離脱。
- 新しい編隊パターンを追加:
  - `veeHold`: V 字編隊で降下し、一定後に左右へ剥がれる。
  - `sideHook`: 画面横から弧を描いて中央へ入り、折り返して離脱。
  - `wheelBreak`: 円弧旋回後に各機が外へ崩れる。
  - `peelColumn`: 縦列が途中で左右へ剥がれる。
  - `orangeBrake`: 橙強敵が降下、滞留、射撃、離脱する。
- 中ボス前後に `midboss + red stream` / `midboss orange pressure` を追加。
- BOSS、BOMB、Active DEF、route contract は v22 から維持。

## 検証

実行:

```powershell
node tools\headless_graze_log_cdx_v05_2_v23_check.js
```

結果:

- clear-capable bot が clear。
- midboss 到達、boss 到達、boss 撃破 clear を確認。
- final boss cue と final BOMB 使用を確認。
- Active DEF 使用を確認。
- route contract の成功 / 失敗 probe を確認。
- stage script が 1942 型ラベルと新 stageFlags を通ることを確認。

## 残リスク

headless は破綻検出であり、面白さの保証ではない。今回の狙いは「体感差がない」を潰すために、敵数・侵入方向・編隊運動・強敵混入を明確に変えること。次は人間プレイで、敵が多すぎる、橙が硬すぎる、中盤が忙しすぎる、などの体感を見て調整する。
