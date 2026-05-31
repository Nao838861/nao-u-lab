---
title: "AI Gamestore: Scalable, Open-Ended Evaluation of Machine General Intelligence with Human Games"
url: https://arxiv.org/abs/2602.17594
collected_at: 2026-05-26T19:52:28+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-evaluation, vlm, benchmark, human-games, agent-play]
evaluated_at: 2026-05-26T20:01:17+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-26T20:27:55+09:00"
last_decision: posted
stale_after: "2026-06-25"
supersedes: []
gate_reason: |-
  静的benchmark飽和への問題設定、human gamesをcontainerized variantsとして集める基盤、100ゲーム・7 frontier VLM・短時間episode評価、弱点分析まで抽出できる。
  自作ゲームの評価を「AIが短時間で学ぶ課題」として設計する視点に直結し、#shared-reads向けの概要密度も確保できる。
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779793589433579"
next_action: none
posted:
  ts: "1779793589.433579"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779793589433579"
  char_count: 3555
  posted_at: "2026-05-26T20:27:55+09:00"
suggested_post_outline:
  overview_angle: 人間向けゲームを、モデルのworld-model learning/memory/planningを測るopen-ended evaluation substrateとして使う提案
  analysis_axis: 既存benchmarkの飽和問題、LLM+human-in-the-loopでのgame sourcing/adaptation、100ゲームPoC、VLMが失敗した能力領域
  application_target: headless/VLM/bot評価で、単一スコアではなく短時間episode・経験量制約・人間平均比・失敗能力タグを残す評価設計
  pros_cons: 評価対象を広げられる一方、ゲーム合成品質・既存プラットフォーム依存・短時間play episodeの妥当性に注意が必要
  verdict_pre: 部分採用

---

## raw_excerpt
arXiv 2602.17594。Lance Ying ほかによる、人間向けゲームを使った open-ended な AI 評価基盤の提案。

要点メモ:
- 従来の AI benchmark は狭い能力を静的に測り、モデル側の最適化で飽和しやすい、という問題設定。
- 著者らは、AI を human-like general intelligence の観点で見るには、人間が人間のために設計した広範なゲームを、同じ経験量・時間・資源条件でどう遊び学ぶかを見るのが有望だとする。
- AI GameStore は、LLM と humans-in-the-loop を使い、既存の digital gaming platforms から standardized / containerized variants を sourcing and adapting して、新しい representative human games を合成する platform。
- proof of concept では Apple App Store と Steam の top charts を元に 100 ゲームを生成し、7 つの frontier VLM を短い play episode で評価した。
- best models でも多くのゲームで human average score の 10% 未満に留まり、world-model learning、memory、planning が必要なゲームで特に苦戦した、と報告している。

## why_relevant_to_games
自作ゲームの headless / VLM / bot 評価を、単一スコアではなく「世界モデル・記憶・計画を要求する短時間プレイ課題」として設計する観点に使える。
