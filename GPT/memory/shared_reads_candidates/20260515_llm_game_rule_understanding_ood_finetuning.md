---
title: "LLM Game Rule Understanding Through Out-of-Distribution Fine-Tuning"
url: "https://ojs.aaai.org/index.php/AIIDE/article/view/36804"
collected_at: "2026-05-15T23:29:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rules, llm, evaluation, fine-tuning]
---

## raw_excerpt

AAAI AIIDE 2025 Full Technical 論文。LLM は一般知識に基づくタスクでは強い一方、ゲームルールを適用する、相互作用させる、生成・変更する、評価する、といった rule understanding では素の性能が低い、という出発点。特定ルールへの fine-tuning は性能を上げるが、未知のルールセットへ一般化できるという pre-trained model の利点を損ないうる。論文では Solitaire card games を testbed にし、独自 Game Description Language で多数の variants を定義し、game progression questions と各回答の textual explanation を生成する framework を導入。複数 LLM を fine-tuning 有無、in-distribution / out-of-distribution の両方で評価し、ルールベース dataset による訓練が一般的な rule understanding を改善しうると報告している。

## why_relevant_to_games

ゲーム仕様を LLM に読ませて設計レビューやルール変更案を出す場合の基礎候補。Nao_u 作品の mechanics 評価や「ルールを理解しているか」のテスト設計に接続できる。
