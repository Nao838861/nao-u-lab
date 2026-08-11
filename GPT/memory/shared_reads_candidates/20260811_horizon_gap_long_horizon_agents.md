---
title: "The Horizon Gap: Planning, Memory, Execution, Training, and Evaluation for Long-Horizon LLM Agents"
url: "https://arxiv.org/abs/2608.06663"
collected_at: "2026-08-11T13:45:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agents, long-horizon, game-development, evaluation, memory, execution]
evaluated_at: "2026-08-11T13:49:35+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1786424121.003489"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786424121003489"
  char_count: 4481
  posted_at: "2026-08-11T13:55:47+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-11T13:55:47+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786424121003489"
next_action: none
stale_after: "2026-09-10"
supersedes: []
gate_reason: >-
  horizon gap の問題設定、3概念の分離、6領域と horizon 位置による分類、最終成否だけでは
  長期 task を評価できないという結論まで抽出でき、CoopEval 水準の概要へ展開できる。
  ゲーム実装・自動 playtest の仕様保持、途中検証、回復、完了判定を trajectory 単位で評価する設計へ具体的に適用できる。
suggested_post_outline:
  overview_angle: "単発能力と長期完遂能力の隔たりを、構成要素と horizon の位置から整理する survey として説明する"
  analysis_axis: "長期 task の失敗を model 能力・harness・process signal・trajectory 評価へ分解し、分類の効用と未解決点を検討する"
  application_target: "複数時間・複数 session のゲーム実装と自動 playtest における仕様保持、途中検証、回復、完了判定の記録・評価設計"
  pros_cons: "長期失敗を共通語彙と評価軸で整理できる一方、survey の分類だけでは個別 harness の因果や最適な process signal は確定しない"
  verdict_pre: "部分採用"
---

## raw_excerpt

要旨・本文冒頭の抽出（意訳）: 最前線の言語モデルは単発の推論問題を解けても、数時間に及ぶ agent task では、以前の決定を失念する、未完了の仕事を完了と宣言する、当初の目標から静かに逸脱するといった失敗を起こす。著者らは、単一ステップの能力と長期タスクを確実に完遂する能力の距離を「horizon gap」と呼び、2024〜2026年の arXiv 論文1,547件を調査した。整理上、long-horizon は必要な逐次手数という task の性質、long-context は一回の推論で参照できる token 量という model の性質、long-term memory は step や session をまたいで情報を保持する system の性質であり、互いに独立とする。文献は planning、memory、execution、training、evaluation、foundations/safety の6領域と、horizon を context 内・単一 task 内の context 外・task/session 横断のどこで運ぶかという軸で分類される。全領域に共通して、タスクが長くなるほど最終結果だけの pass/fail や単一 reward は情報量を失い、process reward、credit assignment、trajectory-level diagnostics など、途中段階の密な信号が必要になるとまとめている。未解決点として、能力が model と harness のどちらに由来するか、学習用と評価用の process signal が同じ偏りを共有しないか、長期信頼性を一般的に予測できるかを挙げる。

## why_relevant_to_games

複数時間・複数 session にまたがるゲーム実装や自動 playtest で、最終 build の成否だけでなく、仕様保持・途中検証・回復・完了判定を trajectory 単位で記録する設計を考える材料になる。
