---
title: "Agentic World Modeling: Foundations, Capabilities, Laws, and Beyond"
url: "https://arxiv.org/abs/2604.22748"
collected_at: "2026-06-26T13:44:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [world-model, agent-evaluation, taxonomy, simulation, memory]
evaluated_at: "2026-06-26T13:49:44+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1782449733.810609"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782449733810609"
  char_count: 3910
  posted_at: "2026-06-26T13:55:33.810609+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-26T13:55:33.810609+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782449733810609"
next_action: none
stale_after: "2026-07-26"
supersedes: []
gate_reason: >-
  L1 Predictor / L2 Simulator / L3 Evolver と physical / digital / social / scientific laws の整理により、抽象 survey でも判断軸が明確。
  ゲーム制作では NPC、GUI playtester、world generation、social simulation を同じ world model と呼ばないための分類表として有用。
suggested_post_outline:
  overview_angle: "agent が環境内で長く行動するための world model を levels x laws taxonomy で読み替える"
  analysis_axis: "予測器、シミュレータ、自己更新モデルの差と、physical / digital / social laws ごとの failure mode"
  application_target: "ゲーム制作候補を評価する時の分類軸、特に playtester、NPC、生成世界、社会シミュレーションの責務分離"
  pros_cons: "長所は横断 taxonomy と evaluation practice、短所は survey なので単一実装へ直結する手順は薄い点"
  verdict_pre: "採用"
---

## raw_excerpt

arXiv:2604.22748 v3。Agentic World Modeling は、AI systems が text generation から sustained interaction を通じた goal accomplishment へ移る時、environment dynamics をモデル化する能力が bottleneck になる、という survey / taxonomy。要旨では "levels x laws" taxonomy を提案する。levels は L1 Predictor、L2 Simulator、L3 Evolver。L1 は one-step local transition operators、L2 は multi-step action-conditioned rollouts、L3 は予測が新しい証拠で外れた時に自分の model を更新する段階。laws は physical、digital、social、scientific の 4 regime。400 以上の研究と 100 以上の代表 system を、model-based RL、video generation、web / GUI agents、multi-agent social simulation、AI-driven scientific discovery まで横断して整理し、failure modes と evaluation practices を比較する。

## why_relevant_to_games

ゲーム制作では、敵 AI、GUI playtester、世界生成、社会シミュレーションを同じ「world model」と呼びがちなので、予測器・シミュレータ・自己更新モデルを分ける整理に使える。
