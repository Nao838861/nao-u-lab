---
title: "CRAFT: Grounded Multi-Agent Coordination Under Partial Information"
url: "https://arxiv.org/abs/2603.25268"
collected_at: "2026-06-14T05:59:17+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent, multi-agent, communication, partial-information, evaluation]
evaluated_at: "2026-06-14T06:03:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781384875.000239"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781384875000239"
  char_count: 3642
  posted_at: "2026-06-14T06:08:26+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-14T06:08:26+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781384875000239"
next_action: none
stale_after: "2026-07-14"
supersedes: []
gate_reason: "partial information 下の multi-agent coordination を、空間接地、belief modeling、pragmatic communication、collective task success のズレとして分解できる。協力ゲーム、情報非対称ゲーム、NPC パーティ、AI playtest の失敗ログ設計に具体的に接続でき、CoopEval 水準の概要を書く材料がある。"
suggested_post_outline:
  overview_angle: "全体を見られない agent 同士が 3D 構造物を作る benchmark として、発話品質と共同目的達成が一致しない問題を中心に書く。"
  analysis_axis: "partial observability、相手の知識状態推定、必要十分な指示、環境側 move validation とログ評価の分解。"
  application_target: "協力パズル、情報非対称 NPC、複数 AI playtester の会話ログを、成功/失敗だけでなく grounding・belief・pragmatics に分けて記録する評価軸。"
  pros_cons: "メリットは会話の流暢さではなく共同作業の進捗を測れる点。デメリットは 3D 構造物 benchmark からゲーム内タスクへ写す際にタスク設計が必要な点。"
  verdict_pre: "部分採用"
---

## raw_excerpt

短い原文メモ: "partial information" / "shared 3D structure" / "pragmatic communication errors"。

arXiv 2603.25268。CRAFT は、複数の LLM agent が不完全で相補的な視点だけを持ち、自然言語で調整しながら共有 3D 構造物を作る multi-agent benchmark。各 agent が全体を見られないため、単体の推論能力ではなく、自分の見えている情報をどう共有し、相手の知識状態をどう推定し、重複や不足のない指示へ変換できるかを測る。論文は失敗を spatial grounding、belief modeling、pragmatic communication などに分解し、frontier model と open-weight model の failure profile を比較する。

検索結果と arXiv HTML の要旨では、強い reasoning model が必ずしも協調に強いわけではなく、個々の発話品質が高くても collective task success に直結しないことが強調されている。導入部では、partial observability の下で何を、どれだけ、いつ言うかを決める pragmatic communication が欠けると、複数 agent の協調が壊れると整理している。Figure 1 の説明では、procedural structure generator が target 3D object と private 2D views を作り、Directors が部分視点から Builder へ指示し、環境が move validation とログ評価を行う構成になっている。

## why_relevant_to_games

協力ゲーム、情報非対称ゲーム、NPC パーティ、AI playtest の「会話はあるが共同目的が進まない」失敗を、空間接地・相手モデル・指示の十分性に分けて記録する候補になる。
