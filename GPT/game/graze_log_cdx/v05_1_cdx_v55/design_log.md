# graze_log v05.2_cdx_v55 design_log

## 対象 directive 原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

直近の `memory/slack_directives.jsonl` 由来の方針:

> 別の指示があるまでは、ゲーム制作そのものよりも、AIがゲームを作る際のヘッドレスのあり方がどうあるべきかの検討と実地検証を重ねる形で進めて。ヘッドレス測定に必要であればゲームを改変しても良いが、主眼は自動実行で何をどう振るのが良さそうかの検証の方。

## 実装前判断

v54 で multi-seed / multi-policy matrix の baseline は作れたが、残課題として「初心者らしい迷い」「狙い撃ち優先」「生存優先」の policy が未実装だった。今回は stage / enemy / bullet / guide を変えず、headless の入力分布だけを増やす。ゲームを面白くしたかどうかではなく、headless が比較時に何を見落としにくくなるかを検証する。

使う過去知見:

- `Playable / Headless 評価`: 起動確認ではなく、coverage / pressure / movement / sparse event を見る。
- `Player Simulation / Persona`: 1 bot ではなく、異なる失敗様式を持つ policy を並べる。
- `Balance / Rule Space`: clear / score だけに潰さず、best / mean / worst / emergency / movement を分ける。
- `Feedback / Rights / Human Judgment`: headless は fun verdict ではなく、人間評価前の比較補助として扱う。

## 設計サイクル 1

良いところ / 悪いところ:

1. 良い: v54 は gameplay unchanged で評価基準として扱いやすい。
2. 良い: route / aggressive / defensive / panic で大きい policy 差は出ている。
3. 悪い: panic は端逃げであり、人間の焦りや迷いそのものではない。
4. 悪い: defensive は survival と target neglect が混ざっている。
5. 悪い: aggressive は kill 優先だが、狙い撃ち固定の signature はまだ薄い。
6. 良い: `summarizeEvalTelemetry()` は追加 policy でも同じ軸で比較できる。
7. 良い: matrix script は JSONL 保存を足せば過去版比較に使える。
8. 悪い: seed 差がほぼ出ないため、seed を増やしても新情報が少ない。
9. 良い: policy 追加なら stage を壊すリスクが小さい。
10. 良い: novice の失敗は churn / readability の候補として使える。

改善案:

1. `novice`: route 追従を弱くし、周期的に左右へ迷わせる。
2. `marksman`: target aim を強くし、敵撃破と chain を優先する。
3. `survival`: 回避半径を広げ、下寄りで安全を優先する。
4. `panic` は既存の早期 churn signal として残す。
5. v55 の source note に gameplay unchanged を明記する。
6. policy matrix を 7 policy に広げる。
7. matrix 出力を `memory/raw/headless_eval/graze_log_cdx_policy_matrix.jsonl` に追記する。
8. 通常 smoke では route clear と ledger version を確認する。
9. matrix assertion は「各 policy の良し悪し」ではなく「差分が観測できるか」を見る。
10. design/dev/README/continuous/staging を更新する。

筋の良い案:

`v55 gameplay unchanged + human-like policy split + JSONL matrix log`。解決できる問題は、headless が単一攻略 bot の得意不得意だけで判断する危険を減らし、失敗様式ごとに比較できること。新しい懸念は、policy 名が人間行動を完全再現しているわけではなく、あくまで測定用の代理入力であること。

## 設計サイクル 2

候補比較:

1. stage 改変: 今回の主眼から外れる。
2. seed 増加: 現状は seed 差が薄く、計算量に対して情報量が少ない。
3. policy 追加: v54 の観測結果に直接応える。
4. JSONL 保存: 今後の版比較の土台になる。
5. screenshot 目視: Browser Use がない実行環境では今回の必須条件にしない。
6. novice を即 game over させる: churn は見えるが比較範囲が狭すぎる。
7. novice を boss 前まで到達させる: どこで崩れるか見やすい。
8. marksman を clear させる: best-case / score ceiling として使える。
9. survival を clear させる: clear はできるが pressure / movement が高い signature を見る。
10. panic は v54 の早期 churn baseline として維持する。

筋の良い案:

3 policy を追加し、既存 4 policy と同一 matrix に流す。解決できる問題は、clear 可能性、score ceiling、早期離脱、boss 前後での崩れ、movement pressure の違いを同じ出力で比較できること。懸念は、seed 差がまだほぼ出ないため、randomness 由来の頑健性評価にはまだ弱いこと。

## 設計サイクル 3

採用:

1. v54 を v55 にコピー。
2. `GAME_VERSION` と表示文言を v55 に更新。
3. `BOT_STYLES` に `novice` / `marksman` / `survival` を追加。
4. `updateBot()` に迷い、狙い撃ち、生存優先の差を実装。
5. stage / wave / bullet / guide alpha は変更しない。
6. `headless_graze_log_cdx_v05_2_v55_check.js` を作る。
7. `headless_graze_log_cdx_v05_2_v55_policy_matrix_check.js` を作る。
8. matrix script は JSONL に summary を保存する。
9. docs と継続 directive を更新する。
10. commit / push する。

捨てたもの:

- 新 wave 追加。
- guide 見た目の再調整。
- seed 本数だけを増やす案。
- headless の結果で「面白い / 面白くない」を直接判定する案。

## 採用案

`v05_1_cdx_v55` はゲーム内容を v54 と同一に保ち、headless policy matrix を 4 policy から 7 policy に拡張する。新 policy は `novice`、`marksman`、`survival`。matrix は `memory/raw/headless_eval/graze_log_cdx_policy_matrix.jsonl` に追記し、今後の版比較に使える最小ログを残す。

## 懸念

- policy は人間プレイヤーの完全な再現ではない。
- `novice` は「初心者」というより「迷いを含む低精度入力」の proxy。
- seed 差は今回もほぼ出ていない。stage 側の乱数影響は評価軸としてまだ弱い。
- smoke check は `iframe` を長くして構造確認するため、matrix の通常耐久結果とは条件が違う。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v55_check.js
node tools\headless_graze_log_cdx_v05_2_v55_policy_matrix_check.js
```

## 検証結果

2026-05-22 実行。

- `node tools\headless_graze_log_cdx_v05_2_v55_check.js`: pass。route bot は `mode=clear`、`grade=S`、`routeCoveragePct=1`、`readabilityGuides=2`、`GAME_VERSION=v05_1_cdx_v55` を確認。追加 policy も `botStyleSplit` に出た。
- `node tools\headless_graze_log_cdx_v05_2_v55_policy_matrix_check.js`: pass。5 seed × 7 policy を実行し、JSONL へ追記した。
- matrix の主な結果: route / aggressive / marksman / survival は clear。defensive は routeCoverage 0.931 で game over。panic は routeCoverage 0.379 で早期 game over。novice は routeCoverage 0.897 で game over。
- score ceiling は marksman が高く、meanScore 173130 / meanKills 188。survival は clear するが meanUrgentPct 0.127 / meanMovementSwitches 503 と pressure と移動負荷が高い。novice は clear しないが post-mid guide までは到達し、boss 前後の崩れ候補として使える。

## 残課題

- JSONL に保存した matrix を次版と比較する helper を作る。
- policy 名と観測 signature の対応を整理し、過度な擬人化を避ける。
- seed 差が出るような小さな perturbation を別枠で検討する。ただし stage 本体の品質を壊さない。
