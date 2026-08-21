---
title: "PlayWorld: Benchmarking World Models with Agent Players over Long-Horizon Objectives"
url: https://arxiv.org/abs/2608.13552
collected_at: "2026-08-21T15:46:32+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, agent-playtesting, world-models, evaluation, long-horizon]
evaluated_at: "2026-08-21T15:50:33+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-21T15:50:33+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-21T15:50:33+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-20"
supersedes: []
gate_reason: >-
  固定 action sequence では model 間の公平な比較にならないという問題設定から、目的駆動の Agent Player、171 scenario、9 model、長期状態を含む評価軸と結論まで抽出できる。
  player / judge 分離と長期 state persistence の検査は、生成ゲームや複数版 prototype の自動 playtest に具体的に転用でき、限界も含めて約4000字の概要を構成できる。
suggested_post_outline:
  overview_angle: "固定リプレイによる映像品質比較を、目標へ適応して操作する Agent Player による長期 interaction 評価へ置き換えた点を中心に整理する。"
  analysis_axis: "目的条件付き closed-loop rollout、player / judge 分離、geometry・interaction・out-of-sight evolution・insight evolution の評価軸が、何を測れて何を見落とすかを分析する。"
  application_target: "生成ゲームや MonoSH 系 prototype の版間比較で、同じ目的を agent に与えて操作列を適応生成し、短期成功率に加えて空間整合性と画面外を含む長期状態保持を検査する playtest harness。"
  pros_cons: "メリットは model ごとの操作差を吸収し、長期 interaction の破綻を task 単位で比較できること。デメリットは video world model と実ゲームの差、Agent Player と VQA judge の誤差、40 step 上限への依存があること。"
  verdict_pre: "部分採用。目的駆動 rollout と player / judge 分離は採用し、視覚 judge の結果は deterministic state trace と併用する。"
---

## raw_excerpt

PlayWorld は、操作入力から将来フレームを生成する interactive video world model を、固定された入力列ではなく「長期目標を達成できるか」で比較する benchmark。world model ごとに同じ目的へ至る適切な操作列が変わるため、あらかじめ決めた action sequence では公平な横断比較にならないという問題を置く。171 の scenario にそれぞれ objective を与え、multi-modal Agent Player が生成された最新 frame、目標、直近の action history を観察しながら閉ループで次の操作を選ぶ。共通 action vocabulary は W/A/S/D、矢印、WAIT で、最大 40 step。評価軸は geometry consistency、interaction fidelity、out-of-sight evolution、insight evolution の 4 軸に、video quality と controllability の基礎指標を加える。9 種の world model を比較した結果、現行モデルは長期 interaction で空間的一貫性と、見えない間も状態が持続・変化する性質を保つのが難しいと報告する。公開 harness は player と judge を分離し、agent player が rollout を作り、別の task-conditioned VQA rubric verifier が動画を採点する構成になっている。

## why_relevant_to_games

固定リプレイではなく同じ「目的」を与え、各環境に適応する agent の行動列で比較する考え方は、生成ゲームや複数版プロトタイプの headless / GUI playtest を横断評価する場面に使える。長期状態の保持を独立軸にする点も、短い成功率だけでは見えないゲーム破綻の収集に効く。
