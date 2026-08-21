---
title: "Predicting Game Difficulty and Churn Without Players"
url: "https://arxiv.org/abs/2008.12937"
collected_at: "2026-08-21T22:01:32+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, player-modeling, difficulty, churn, automated-playtesting]
---

## raw_excerpt

原文を基にした非逐語メモ。対象は Angry Birds Dream Blast の168レベルと95,266人の実プレイヤーで、7日間プレイしないことを churn と定義する。まず Unity ML-Agents / PPO の DRL agent をレベルごとに動かし、84×84 RGB画面、残り手数、目標、lock、camera position を観測、画面を32×32の tap 候補へ離散化する。AI の pass rate、cleared-goal 比率、残り手数など16特徴から baseline の難易度・離脱予測を作る。拡張モデルは2,000人の仮想集団に skill、persistence、boredom を持たせ、skill が難易度を上回れば通過、試行回数が persistence を越えれば離脱、通過後にも boredom に応じて離脱、失敗ごとに skill を増やす。離脱者を除いた集団を次レベルへ渡すため、序盤で離脱しやすい層が抜け、後半の残存集団の構成が変わる過程を表現する。5-fold cross-validation では churn の MSE が baseline 0.00013 から拡張モデル 0.00008、MAE が0.00866から0.00607へ変化し、pass rate はほぼ同等だった。AI 推定難易度を実プレイヤー pass rate に置換すると churn MSE が71%下がり、population model と AI の human-likeness を分けて検討できる結果も示す。

## why_relevant_to_games

複数レベルを持つゲームの headless 評価で、単一 bot の平均成功率だけでなく、skill・再挑戦耐性・飽きやすさの異なる集団が進行に伴ってどう選別されるかを別層でシミュレーションする材料になる。
