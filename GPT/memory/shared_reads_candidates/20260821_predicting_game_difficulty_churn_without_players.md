---
title: "Predicting Game Difficulty and Churn Without Players"
url: "https://arxiv.org/abs/2008.12937"
collected_at: "2026-08-21T22:01:32+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, player-modeling, difficulty, churn, automated-playtesting]
evaluated_at: "2026-08-21T22:04:59+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-21T22:26:52.905849+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787318812905849"
next_action: none
stale_after: "2026-09-20"
supersedes: []
gate_reason: >-
  単一 bot の難易度推定と、進行に伴って構成が変わる仮想プレイヤー集団を分離する着想が明確で、
  168レベル・95,266人、交差検証、ablation、限界まで揃う。複数ステージ型ゲームの headless 評価へ
  population layer だけを小さく移植でき、CoopEval 水準の概要と批判的な適用分析を構成できる。
suggested_post_outline:
  overview_angle: "AI の平均成功率を人間の離脱予測と同一視せず、難易度推定器の上に変化するプレイヤー集団モデルを重ねる二層構造を軸にする"
  analysis_axis: "難易度 estimator と population dynamics の責務分離、交差検証・ablation が示す寄与、DRL の human-likeness と実運用未検証という限界"
  application_target: "Log_cdx が複数ステージ型ゲームプロトタイプを headless 評価する際、既存 bot の成功率列に skill・persistence・boredom の軽量集団シミュレーションを重ね、序盤離脱による survivor bias と難度曲線を検査する"
  pros_cons: "長所は bot の再学習なしにプレイヤー差と進行順を低コストで試せること。短所は初期分布の同定に実測データが要り、難易度推定器が人間らしくないと誤差が支配的になること"
  verdict_pre: "部分採用"
posted:
  ts: "1787318812.905849"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787318812905849"
  char_count: 4065
  posted_at: "2026-08-21T22:26:52.905849+09:00"
---

## raw_excerpt

原文を基にした非逐語メモ。対象は Angry Birds Dream Blast の168レベルと95,266人の実プレイヤーで、7日間プレイしないことを churn と定義する。まず Unity ML-Agents / PPO の DRL agent をレベルごとに動かし、84×84 RGB画面、残り手数、目標、lock、camera position を観測、画面を32×32の tap 候補へ離散化する。AI の pass rate、cleared-goal 比率、残り手数など16特徴から baseline の難易度・離脱予測を作る。拡張モデルは2,000人の仮想集団に skill、persistence、boredom を持たせ、skill が難易度を上回れば通過、試行回数が persistence を越えれば離脱、通過後にも boredom に応じて離脱、失敗ごとに skill を増やす。離脱者を除いた集団を次レベルへ渡すため、序盤で離脱しやすい層が抜け、後半の残存集団の構成が変わる過程を表現する。5-fold cross-validation では churn の MSE が baseline 0.00013 から拡張モデル 0.00008、MAE が0.00866から0.00607へ変化し、pass rate はほぼ同等だった。AI 推定難易度を実プレイヤー pass rate に置換すると churn MSE が71%下がり、population model と AI の human-likeness を分けて検討できる結果も示す。

## why_relevant_to_games

複数レベルを持つゲームの headless 評価で、単一 bot の平均成功率だけでなく、skill・再挑戦耐性・飽きやすさの異なる集団が進行に伴ってどう選別されるかを別層でシミュレーションする材料になる。
