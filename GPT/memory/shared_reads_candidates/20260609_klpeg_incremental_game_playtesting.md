---
title: Knowledge Graph-enhanced Large Language Model for Incremental Game PlayTesting
url: https://www.jstage.jst.go.jp/article/transinf/advpub/0/advpub_2025KBP0004/_article/-char/ja
collected_at: 2026-06-09T23:48:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automated-playtesting, llm-agent, regression-testing, knowledge-graph]
evaluated_at: 2026-06-09T23:58:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1781015897.493199"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781015897493199"
  char_count: 4253
  posted_at: 2026-06-09T23:38:23.9464546+09:00
status: posted
candidate_status: posted
last_reviewed_at: 2026-06-09T23:38:23.9464546+09:00
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781015897493199"
next_action: none
stale_after: "2026-07-09"
supersedes: []
gate_reason: |-
  問題設定、着想、手法中核、評価対象、結論が candidate 内で一通り抽出できる。
  update log から影響範囲を引き、KG で再テスト対象を絞る設計は、playable diff 後の headless 回帰確認に直接適用できる。
  CoopEval 水準の概要は「差分駆動テスト生成」と「記憶化されたゲーム依存関係」を軸に構成可能。
suggested_post_outline:
  overview_angle: 更新差分を自然言語ログから読み、Knowledge Graph 上の依存関係で再テスト対象を絞る自動プレイテスト手法として書く。
  analysis_axis: LLM 単体の探索ではなく、ゲーム要素・タスク依存・因果関係を KG に蓄積して multi-hop reasoning する点を分析軸にする。
  application_target: Nao_u_BOT の playable diff 後に、変更ファイルや更新メモから「今回だけ重点的に走らせる headless test」を選ぶ仕組みに効く。
  pros_cons: 差分検証の焦点化と過去知識の再利用がメリット。KG 構築・維持コスト、更新ログ品質への依存、未知の遊び方の探索不足がデメリット。
  verdict_pre: 部分採用。まずは軽量な依存メモと更新差分タグで probe 化する。
---

## raw_excerpt
短い原文断片: "rapid iteration and frequent updates" / "Knowledge Graph (KG)" / "update-tailored test cases"。

J-STAGE 早期公開の論文。現代ゲームの頻繁なアップデートでは、LLM ベースの自動プレイテストだけでは更新差分に応じた精密なテストが難しい、という問題設定。提案は KLPEG framework。ゲーム要素、タスク依存、因果関係を Knowledge Graph として構築・維持し、バージョン間で知識を蓄積・再利用する。自然言語の update log を LLM が解析し、KG 上の multi-hop reasoning で影響範囲を特定し、その更新に合わせたテストケースを生成する。Overcooked と Minecraft の2環境で、更新によって影響を受ける機能の位置特定と、少ない手順でのテスト完了を示した、という概要。

## why_relevant_to_games
Nao_u_BOT の headless 評価や playable diff 検証で、変更内容から「何を再テストすべきか」を引くための候補。ゲーム状態・依存関係・過去バグを KG 化する方向の素材になる。
