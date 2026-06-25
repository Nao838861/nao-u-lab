---
title: "SODE: Analyzing Social Dynamics in LLM Agents"
url: "https://arxiv.org/abs/2605.23949"
collected_at: "2026-06-25T19:44:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multiagent, social-dynamics, llm-agent, evaluation]
evaluated_at: "2026-06-25T19:48:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1782384827.546149"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782384827546149"
  char_count: 3698
  posted_at: "2026-06-25T19:53:38+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-25T19:53:38+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782384827546149"
next_action: none
stale_after: "2026-07-25"
supersedes: []
gate_reason: >-
  reciprocity、reputation、group dynamics の 3 軸と、instruction-tuned /
  reasoning model の崩れ方という結果があり、協力ゲームや AI 仲間 NPC の
  評価へ具体的に転用できる。概要・分析・適用の各項目を十分な密度で書ける。
suggested_post_outline:
  overview_angle: "LLM agent の社会性を平均スコアではなく、直接互恵・間接互恵・集団力学の崩れ方として評価する枠として紹介する。"
  analysis_axis: "短期最適化、passive compliance、long-horizon framing が協力維持に与える差を見る。"
  application_target: "協力ゲーム、AI パーティメンバー、評判や恩義を扱う NPC 関係システムの評価観点。"
  pros_cons: "メリットは協力崩壊の原因を分類できること。デメリットはゲーム固有の報酬設計に合わせた scenario 化が必要なこと。"
  verdict_pre: "採用寄りの部分採用。AI 仲間 NPC の評価で、長期協力と評判反応を別ログに分ける。"
---

## raw_excerpt

arXiv 2605.23949。Inseo Jung / Yoonseok Oh / Kyungryul Back / Jinkyu Kim / Jungbeom Lee。2026-05-06 submitted。原文の短い核: "Social Dynamics Evaluation" / "Direct Reciprocity" / "Indirect Reciprocity" / "Group Dynamics"。

SODE は、LLM agent を社会的相互作用の outcome score だけで測ると、同じ点数に異なる戦略が隠れるという問題から出発する。評価軸を、相手の行動に応じて戦略を変える Direct Reciprocity、評判に反応する Indirect Reciprocity、協力が長期的に保たれるかを見る Group Dynamics の 3 次元に分ける。実験では、instruction-tuned model が passive compliance で搾取されやすいこと、reasoning model が short-horizon optimization を優先して long-term cooperation を不安定にすること、long-horizon framing が reciprocal capability を引き出しうることが報告されている。

## why_relevant_to_games

協力ゲームや AI 仲間 NPC の評価で、平均スコアではなく「搾取されやすさ」「評判への反応」「長期協力の崩れ」を見る観点として使える。
