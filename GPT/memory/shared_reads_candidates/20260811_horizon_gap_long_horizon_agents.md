---
title: "The Horizon Gap: Planning, Memory, Execution, Training, and Evaluation for Long-Horizon LLM Agents"
url: "https://arxiv.org/abs/2608.06663"
collected_at: "2026-08-11T13:45:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agents, long-horizon, game-development, evaluation, memory, execution]
---

## raw_excerpt

要旨・本文冒頭の抽出（意訳）: 最前線の言語モデルは単発の推論問題を解けても、数時間に及ぶ agent task では、以前の決定を失念する、未完了の仕事を完了と宣言する、当初の目標から静かに逸脱するといった失敗を起こす。著者らは、単一ステップの能力と長期タスクを確実に完遂する能力の距離を「horizon gap」と呼び、2024〜2026年の arXiv 論文1,547件を調査した。整理上、long-horizon は必要な逐次手数という task の性質、long-context は一回の推論で参照できる token 量という model の性質、long-term memory は step や session をまたいで情報を保持する system の性質であり、互いに独立とする。文献は planning、memory、execution、training、evaluation、foundations/safety の6領域と、horizon を context 内・単一 task 内の context 外・task/session 横断のどこで運ぶかという軸で分類される。全領域に共通して、タスクが長くなるほど最終結果だけの pass/fail や単一 reward は情報量を失い、process reward、credit assignment、trajectory-level diagnostics など、途中段階の密な信号が必要になるとまとめている。未解決点として、能力が model と harness のどちらに由来するか、学習用と評価用の process signal が同じ偏りを共有しないか、長期信頼性を一般的に予測できるかを挙げる。

## why_relevant_to_games

複数時間・複数 session にまたがるゲーム実装や自動 playtest で、最終 build の成否だけでなく、仕様保持・途中検証・回復・完了判定を trajectory 単位で記録する設計を考える材料になる。
