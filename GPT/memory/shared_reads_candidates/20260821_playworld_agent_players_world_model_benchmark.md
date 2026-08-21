---
title: "PlayWorld: Benchmarking World Models with Agent Players over Long-Horizon Objectives"
url: https://arxiv.org/abs/2608.13552
collected_at: "2026-08-21T15:46:32+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, agent-playtesting, world-models, evaluation, long-horizon]
---

## raw_excerpt

PlayWorld は、操作入力から将来フレームを生成する interactive video world model を、固定された入力列ではなく「長期目標を達成できるか」で比較する benchmark。world model ごとに同じ目的へ至る適切な操作列が変わるため、あらかじめ決めた action sequence では公平な横断比較にならないという問題を置く。171 の scenario にそれぞれ objective を与え、multi-modal Agent Player が生成された最新 frame、目標、直近の action history を観察しながら閉ループで次の操作を選ぶ。共通 action vocabulary は W/A/S/D、矢印、WAIT で、最大 40 step。評価軸は geometry consistency、interaction fidelity、out-of-sight evolution、insight evolution の 4 軸に、video quality と controllability の基礎指標を加える。9 種の world model を比較した結果、現行モデルは長期 interaction で空間的一貫性と、見えない間も状態が持続・変化する性質を保つのが難しいと報告する。公開 harness は player と judge を分離し、agent player が rollout を作り、別の task-conditioned VQA rubric verifier が動画を採点する構成になっている。

## why_relevant_to_games

固定リプレイではなく同じ「目的」を与え、各環境に適応する agent の行動列で比較する考え方は、生成ゲームや複数版プロトタイプの headless / GUI playtest を横断評価する場面に使える。長期状態の保持を独立軸にする点も、短い成功率だけでは見えないゲーム破綻の収集に効く。
