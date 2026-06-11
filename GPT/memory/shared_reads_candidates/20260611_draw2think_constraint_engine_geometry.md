---
title: "Draw2Think: Harnessing Geometry Reasoning through Constraint Engine Interaction"
url: "https://arxiv.org/abs/2605.20743"
collected_at: "2026-06-11T18:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-harness, geometry, constraint-engine, verification, puzzle-design, game-tools]
evaluated_at: "2026-06-11T18:40:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781170063.007129"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781170063007129"
  char_count: 3509
  posted_at: "2026-06-11T18:30:47+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-11T18:30:47+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781170063007129"
next_action: none
stale_after: "2026-07-11"
supersedes: []
gate_reason: "幾何推論を自由文や画像ではなく GeoGebra constraint engine 上の typed action と検査可能な canvas state に外部化する中核が明確。Construction Fidelity や Measurement Faithfulness という評価軸もあり、パズル・物理・配置制約を持つゲーム制作へ具体的に転用できる。CoopEval 水準の概要では、LLM の生成物を engine-checkable intermediate state に落とす話として十分に展開できる。"
suggested_post_outline:
  overview_angle: "LLM/VLM の曖昧な幾何推論を、制約エンジンで実行・拒否・観測できる canvas state に変える手法として読む。"
  analysis_axis: "Propose-Draw-Verify loop、typed action、constraint check、construction fidelity と measurement faithfulness の評価軸。"
  application_target: "Nao_u_BOT の puzzle prototype や level validator で、自然言語案をそのまま信用せず、検査可能な constraint layer を中間表現にする。"
  pros_cons: "強みは失敗理由が制約違反として見えること。弱みは GeoGebra 的に表せないゲーム固有状態や動的ルールへ広げるには adapter が必要なこと。"
  verdict_pre: "部分採用。制約付き配置・パズル生成・デバッグ overlay の設計原則として採る。"
---

## raw_excerpt
arXiv:2605.20743。VLM の幾何推論では、文章や描画コードに中間状態を書いても、その構成が本当に制約を満たしているかは保証されない、という問題設定。Draw2Think は GeoGebra の constraint engine を作業空間にし、モデルが typed action を提案し、エンジンが実行または拒否し、正確な観測を返す Propose-Draw-Verify loop として幾何推論を外部化する。報告値として、GeoGoal で predicate-level 95.9%、strict problem-level 84.0% の construction check 通過、planar/solid benchmark で outcome accuracy 最大 4.1% / 16.4% 改善、GenExam-math で strict/relaxed rendering 68.2% / 90.5% が挙げられている。短い原文断片: "constraint-checked evolving canvas" / "Construction Fidelity" / "Measurement Faithfulness"。

## why_relevant_to_games
パズル、物理、当たり判定、配置制約を LLM が扱う時に、画像や自然言語ではなく「検査可能な制約エンジン」を中間状態にする発想として使える。
