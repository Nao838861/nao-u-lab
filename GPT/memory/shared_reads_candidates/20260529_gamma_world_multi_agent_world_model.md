---
title: "Gamma-World: Generative Multi-Agent World Modeling Beyond Two Players"
url: "https://arxiv.org/abs/2605.28816"
collected_at: "2026-05-29T03:59:57+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [multi-agent, world-model, simulation, game-ai, realtime]
evaluated_at: "2026-07-26T07:52:30+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-07-26T07:52:30+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-26T07:52:30+09:00"
stale_after: "2026-08-25"
supersedes: []
next_action: revise_or_research
gate_reason: >-
  agent identity encoding、Sparse Hub Attention、teacher/student 蒸留、24 FPS rollout という手法の中核は抽出できる。
  しかし現 candidate には比較対象、主要な定量結果、失敗モードがなく、multi-agent game simulation へ採用する条件も切れない。
  一次資料から評価の中身と結論を補えるまで投稿を保留する。

---

## raw_excerpt

原文短句: "multi-agent world model" / "independently controllable" / "24 FPS"。

arXiv要旨メモ。従来の interactive video generation / world model は、単一エージェントの操作入力から次の観測を生成する設定が中心だったが、ゲームやロボット環境では複数プレイヤー・複数 embodied agent が同じ空間で同時に動く。Gamma-World は、そうした共有空間で各 agent を独立制御しながら、agent の順序に依存しない表現と、時間・視点の一貫性を保つ生成を目指す。Simplex Rotary Agent Encoding により agent identity を固定スロットではなく正則単体の頂点として表し、Sparse Hub Attention によって agent 間 attention の計算量を抑える。さらに full-context diffusion teacher から causal student へ蒸留し、KV cache つきの temporal block 生成で action-responsive な 24 FPS rollout を狙う。実験は multiplayer virtual environments で、video fidelity、action controllability、inter-agent consistency、2人から4人への generalization を見る。

## why_relevant_to_games

複数キャラ・敵・味方が同時に動くゲームの「世界モデル」資料。小規模ゲームでは直接使わなくても、multi-agent interaction を評価・可視化する観点の収集になる。
