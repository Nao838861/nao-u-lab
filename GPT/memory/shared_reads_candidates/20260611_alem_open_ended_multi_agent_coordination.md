---
title: "Benchmarking Open-Ended Multi-Agent Coordination in Language Agents"
url: "https://arxiv.org/abs/2606.08340"
collected_at: "2026-06-11T16:14:28.9042554+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, coordination, benchmark, survival-game, communication]
evaluated_at: "2026-06-11T16:27:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-11T16:27:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-11T16:27:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-11"
supersedes: []
gate_reason: |-
  個体能力と協調能力を分ける benchmark という軸はゲーム制作に有用で、communication / memory / reasoning の切り分けも適用可能。
  ただし候補本文のモデル比較、normalized return、ablation の具体値は投稿前に一次情報で確認が必要で、現状のメモだけでは責任ある4000字概要にするには根拠が薄い。
  Phase 3 投稿候補にはせず、該当節と評価表を読み直してから再判定する。
---

## raw_excerpt

短い原文断片: "individual task competence does not imply coordination competence"

arXiv 2606.08340。Alem は Craftax-like dynamics に基づく JAX 製 benchmark で、language agent の open-ended multi-agent coordination を測る。舞台は exploration、crafting、trading、combat を含む長期 survival world で、procedurally generated coordination tasks、soft specialisation、communication、controllable coordination difficulty を埋め込む。13 種の LLM を homogeneous team として zero-shot 評価し、trained MARL agents を参照点にする。

検索結果の要旨では、現行 LLM agent は平均 normalized return が約 6% に留まり、Alem をまだ解けていない。ただし失敗は一様ではなく、hardest coordination setting では Gemini-3.1-Pro-High が 1 billion steps 訓練の MARL agent に近づく一方、GPT-5.4-High は base-task reward は強いが coordination reward が低いとされる。communication が coordination への最大寄与で、memory と reasoning は multi-step plan 維持に効く、という ablation も示されている。

## why_relevant_to_games

複数 AI / 複数 NPC / coop prototype を評価するとき、個体能力と協調能力を分ける材料になる。役割分担、通信、記憶、長期 plan のどれが失敗しているかをログに分解する候補。
