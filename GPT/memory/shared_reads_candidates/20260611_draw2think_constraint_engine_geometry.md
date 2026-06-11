---
title: "Draw2Think: Harnessing Geometry Reasoning through Constraint Engine Interaction"
url: "https://arxiv.org/abs/2605.20743"
collected_at: "2026-06-11T18:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-harness, geometry, constraint-engine, verification, puzzle-design, game-tools]
---

## raw_excerpt
arXiv:2605.20743。VLM の幾何推論では、文章や描画コードに中間状態を書いても、その構成が本当に制約を満たしているかは保証されない、という問題設定。Draw2Think は GeoGebra の constraint engine を作業空間にし、モデルが typed action を提案し、エンジンが実行または拒否し、正確な観測を返す Propose-Draw-Verify loop として幾何推論を外部化する。報告値として、GeoGoal で predicate-level 95.9%、strict problem-level 84.0% の construction check 通過、planar/solid benchmark で outcome accuracy 最大 4.1% / 16.4% 改善、GenExam-math で strict/relaxed rendering 68.2% / 90.5% が挙げられている。短い原文断片: "constraint-checked evolving canvas" / "Construction Fidelity" / "Measurement Faithfulness"。

## why_relevant_to_games
パズル、物理、当たり判定、配置制約を LLM が扱う時に、画像や自然言語ではなく「検査可能な制約エンジン」を中間状態にする発想として使える。
