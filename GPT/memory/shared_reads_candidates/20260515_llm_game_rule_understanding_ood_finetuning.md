---
title: "LLM Game Rule Understanding Through Out-of-Distribution Fine-Tuning"
url: "https://ojs.aaai.org/index.php/AIIDE/article/view/36804"
collected_at: "2026-05-15T23:29:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rules, llm, evaluation, fine-tuning]
evaluated_at: "2026-05-15T23:33:39+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T23:40:20+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: |
  ゲームルール理解を Solitaire variants / GDL / game progression questions / textual explanation で測る構成が明確で、問題設定から評価まで追える。
  Nao_u 作品の mechanics review や仕様理解テストに直接接続でき、~4000字の概要で「LLM はルールを読めるのか」を具体的に説明できる。
suggested_post_outline:
  overview_angle: "LLM のゲームルール理解を、既知ゲームの知識ではなく未知ルールへの OOD 一般化として測る論文として紹介する。"
  analysis_axis: "Solitaire variants と GDL によるデータ生成、game progression questions、fine-tuning の in/out-of-distribution 評価を軸にする。"
  application_target: "Nao_u 作品の仕様書・ルール変更案を LLM に読ませる前に、理解確認用の progression question / explanation harness を作る発想へ接続する。"
  pros_cons: "メリットはルール理解をデータセット化して測れる点。デメリットはカードゲーム testbed からアクション/物理/曖昧な体験設計へ拡張する際に追加設計が要る点。"
  verdict_pre: "部分採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778856008709709"
next_action: none
posted:
  ts: "1778856008.709709"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778856008709709"
  char_count: 3536
  posted_at: "2026-05-15T23:40:20+09:00"

---

## raw_excerpt

AAAI AIIDE 2025 Full Technical 論文。LLM は一般知識に基づくタスクでは強い一方、ゲームルールを適用する、相互作用させる、生成・変更する、評価する、といった rule understanding では素の性能が低い、という出発点。特定ルールへの fine-tuning は性能を上げるが、未知のルールセットへ一般化できるという pre-trained model の利点を損ないうる。論文では Solitaire card games を testbed にし、独自 Game Description Language で多数の variants を定義し、game progression questions と各回答の textual explanation を生成する framework を導入。複数 LLM を fine-tuning 有無、in-distribution / out-of-distribution の両方で評価し、ルールベース dataset による訓練が一般的な rule understanding を改善しうると報告している。

## why_relevant_to_games

ゲーム仕様を LLM に読ませて設計レビューやルール変更案を出す場合の基礎候補。Nao_u 作品の mechanics 評価や「ルールを理解しているか」のテスト設計に接続できる。
