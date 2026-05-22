# graze_log v05.2_cdx_v54 design_log

## 対象 directive 原文

`memory/slack_directives.jsonl`:

> Log_cdx 別の指示があるまでは、ゲーム制作そのものよりも、AIがゲームを作る際のヘッドレスのあり方がどうあるべきかの検討と実地検証を重ねる形で進めて。ヘッドレス測定に必要であればゲームを改変しても良いが、主眼は自動実行で何をどう振るのが良さそうかの検証の方。

> <https://nao-u-lab.slack.com/archives/C0ALWBRNJ66/p1779363482748269|https://nao-u-lab.slack.com/archives/C0ALWBRNJ66/p1779363482748269>  
> Log_cdx
> この件について吟味して、あなたのヘッドレス対応に活かせる形で反映して。

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 実装前判断

今回は game-start だが、Nao_u の最新指示は「ゲーム制作そのもの」より headless のあり方を主眼にしている。したがって v53 のゲーム内容を変えず、v54 を評価基準版として切り、複数 seed / 複数 policy / best-case と平均・最悪の差を出す focused evaluation を実装する。

使う過去知見:

- `Playable / Headless 評価`: 起動確認ではなく、プレイ結果・coverage・pressure・movement を観測する。
- `Balance / Rule Space`: 単一総合点で勝敗を決めず、複数軸に分ける。
- `Player Simulation / Persona`: 1 policy だけでなく、route/aggressive/defensive/panic の差を見る。
- `Feedback / Rights / Human Judgment`: headless は面白さの代替判定ではなく、人間評価へ渡す比較補助。

## 設計サイクル 1

良いところ / 悪いところ:

1. 良い: v53 は route clear と guide trace が安定している。
2. 良い: ゲームを変えなければ評価方法の差分だけを見られる。
3. 良い: 既存 telemetry は 30 frame cadence と sparse event を持つ。
4. 良い: policy split はすでに route/aggressive/defensive/panic がある。
5. 悪い: 単一 seed では bot 適性に寄りすぎる。
6. 悪い: route bot の clear だけでは良いゲームか分からない。
7. 悪い: 平均だけでは攻略後の best-case が見えない。
8. 悪い: best-case だけでは離脱しやすさが見えない。
9. 良い: seed matrix なら分散を見られる。
10. 良い: policy ごとの signature が人間評価前の論点になる。

改善案:

1. v54 はゲーム内容を変えない。
2. v54 check で通常 clear と ledger を確認する。
3. matrix check で seed 12345/22345/32345 を走らせる。
4. policy は route/aggressive/defensive/panic を使う。
5. 各 run で clear、score、time、coverage、pressure、movement、emergency を取る。
6. policy ごとに best score / mean score / worst score / clear rate を出す。
7. route は best-case clear と full coverage を要求する。
8. aggressive は kill/score が route より高いかを見る。
9. defensive/panic は pressure と movement の差を見る。
10. 判定文に「fun verdict ではない」と明記する。

筋の良い案:

`v54 gameplay unchanged + policy matrix check`。解決できる問題は、ゲーム改変と評価改変を分離し、headless が「何をどう振るべきか」を実データで見られること。新しい懸念は、3 seed ではまだ分散が小さく、policy 自体も人間らしさの完全な代理ではないこと。

## 設計サイクル 2

候補比較:

1. 1 seed: 速いが偶然に弱い。
2. 3 seed: 今回のサイクルで現実的。
3. 10 seed: 良いが重い。
4. route only: clear check には良いが評価設計には不足。
5. 4 policy: 既存資産を使えて差が見える。
6. 新 policy 追加: 今回は gameplay 側の変更が増える。
7. best-case: 攻略後の到達可能性を見る。
8. mean: 安定性を見る。
9. worst: 離脱しやすさの候補を見る。
10. JSONL 保存: 今回は check 出力で十分、次回候補。

筋の良い案:

既存 4 policy を 3 seed で回し、best/mean/worst/clearRate を出す。解決できる問題は、単一 headless の盲点を小さくし、policy 差分を定量化できること。懸念は、bot が同じ作者の設計なので三位一体の盲点は残ること。

## 設計サイクル 3

採用:

1. v53 を v54 にコピー。
2. v54 の表示と ledger source だけ更新。
3. 通常 smoke check を v54 化。
4. policy matrix check を新規作成。
5. matrix の assertions は clear、coverage、policy split、pressure、movement を見る。
6. 失敗時は「ゲームが悪い」ではなく「評価仮説が崩れた」と扱う。
7. design_log / devlog / README を更新する。
8. continuous directive と staging を更新する。
9. pending directive を handled にする。
10. commit / push する。

捨てたもの:

- v54 で敵配置を変える案。
- guide duration / fade を触る案。
- 新しい bot policy を同時に実装する案。
- 今回の段階で matrix 結果を恒久 JSONL に保存する案。

## 採用案

`v05_1_cdx_v54` はゲーム内容を v53 と同一に保ち、headless policy matrix の基準版にする。追加 script で multi-seed / multi-policy を走らせ、単一 clear 判定から、best-case・平均・最悪・policy 差分を見る評価へ進める。

## 懸念

- headless は面白さの直接判定ではない。
- policy はまだ 4 種で、人間プレイヤーの学習・迷い・飽きは再現できない。
- seed 3 本はサイクル内検証としては十分だが、評価標準にするには少ない。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v54_check.js
node tools\headless_graze_log_cdx_v05_2_v54_policy_matrix_check.js
```

## 検証結果

2026-05-22 実行。

- `node tools\headless_graze_log_cdx_v05_2_v54_check.js`: pass。route bot は `mode=clear`、`grade=S`、`routeEvents=29`、`readabilityGuides=2`、`GAME_VERSION=v05_1_cdx_v54`、v54 source note、ledger source を確認。
- `node tools\headless_graze_log_cdx_v05_2_v54_policy_matrix_check.js`: pass。5 seed × 4 policy を実行。route/aggressive は clearRate 1、defensive は routeCoverage 0.931 まで到達して game over、panic は routeCoverage 0.379 で早期 game over。panic は `meanUrgentPct=0.221` で route の `0.036` より高く、早期 churn signal として機能した。
- 実地知見: 現行 stage では seed を変えても結果がほぼ同一で、乱数分散より policy 差が主要な観測軸になっている。次は seed 本数を増やすより、policy の種類を増やす方が headless の質を上げる可能性が高い。

## 残課題

- matrix 結果を JSONL に保存し、過去版比較できるようにする。
- 「初心者らしい迷い」「狙い撃ち優先」「生存優先」など、panic 以外の人間寄り policy を作る。
- best-case は攻略後分布、worst/early death は離脱候補として扱い、fun verdict と混同しない。
