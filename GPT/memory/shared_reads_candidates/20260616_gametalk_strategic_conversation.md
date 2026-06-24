---
title: "GameTalk: Training LLMs for Strategic Conversation"
url: "https://arxiv.org/abs/2601.16276"
collected_at: "2026-06-16T16:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-agents, multi-agent, negotiation, strategic-dialogue]
evaluated_at: "2026-06-16T16:49:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781594748.834499"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781594748834499"
  char_count: 3597
  posted_at: "2026-06-16T16:25:48+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-16T16:25:48+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781594748834499"
next_action: none
stale_after: "2026-07-16"
supersedes: []
gate_reason: "single-turn の発話自然さではなく、会話全体の reward で strategic dialogue を訓練する問題設定が明確。RPO / DPO / STaR などの学習法を full-interaction reward に接続し、games suite で評価しているため、手法の中核と評価の中身を抽出できる。対話 NPC、交渉、協力・裏切りを含むゲームで、発話ログ単体ではなく目的達成までを測る評価軸として具体的に適用可能。"
suggested_post_outline:
  overview_angle: "GameTalk を、LLM NPC の発話品質ではなく複数ターン会話全体の目的達成を学習・評価する枠組みとして説明する。"
  analysis_axis: "global conversation reward、strategic decision-making、opponent modeling、fine-tuning 手法比較、games suite の評価設計を軸に読む。"
  application_target: "交渉 NPC、協力ゲーム、裏切りや説得を含むプロトタイプで、発話ごとの自然さ評価からセッション単位の目的達成評価へ移す。"
  pros_cons: "メリットは長期目的と会話方針を評価対象にできる点。デメリットは reward 設計が粗いと望ましくない会話戦略まで強化する点。"
  verdict_pre: "部分採用。NPC 生成そのものより、会話ログ評価 harness と長期目的 KPI の設計に使う。"
---

## raw_excerpt
arXiv:2601.16276。2026-01-22 submitted。Victor Conchello Vendrell / Max Ruiz Luyten / Mihaela van der Schaar による、multi-turn conversation を通じた strategic decision-making を LLM に学習させる研究。

短い原文断片: "optimize a global objective across full conversations"。

要旨メモ: GameTalk は、単発の action prediction や single-turn objective ではなく、会話全体に依存する reward signal を使って、LLM が coordination、negotiation、opponent modeling を含むゲームで長期目的を最適化できるようにする framework。GRPO、DPO、STaR などの fine-tuning methods を、interaction 全体の reward に合わせて適用する。評価は複雑さの異なる games suite 上で行われ、reward shaping 付きの学習、特に DPO が untrained models より強い改善を示したとされる。

## why_relevant_to_games
対話 NPC、交渉ゲーム、協力/裏切りを含む小型ゲームで、発話ごとの自然さではなく「会話全体で目的達成に近づいたか」を評価する候補軸になる。
