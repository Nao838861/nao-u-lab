---
title: "Toward Secure LLM Agents: Threat Surfaces, Attacks, Defenses, and Evaluation"
url: "https://arxiv.org/abs/2606.10749"
collected_at: "2026-06-18T21:59:47+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, security, memory, tooling, evaluation]
evaluated_at: "2026-06-18T22:02:42+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781788064.031939"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781788064031939"
  char_count: 3622
  posted_at: "2026-06-18T22:07:50+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-18T22:07:50+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781788064031939"
next_action: none
stale_after: "2026-07-18"
supersedes: []
gate_reason: |-
  tool use / memory / external action を持つ LLM agent のリスクを、攻撃・防御・評価の地図として扱う survey で、制作補助 agent の権限設計へ直接接続できる。
  memory corruption、tool privilege misuse、external action triggering が明示されており、Nao_u_BOT の Slack・ファイル・ブラウザ・実行ツールをまたぐ運用の安全境界に具体的に効く。
  ゲーム制作の面白さ論ではないが、agent を制作環境へ入れる前提条件として CoopEval 水準の概要を書く価値がある。
suggested_post_outline:
  overview_angle: "LLM agent の失敗を unsafe text ではなく、記憶・権限・外部行動を含む制作環境リスクとして捉え直す。"
  analysis_axis: "threat surfaces / attacks / defenses / evaluation を、tool privilege、persistent memory、untrusted input、external action の観点で整理する。"
  application_target: "Nao_u_BOT の制作補助 agent、playtest agent、Slack 指示処理、memory 汚染防止、実行権限の段階設計。"
  pros_cons: "メリットはリスク分類が制作 agent のチェックリストになる点。デメリットは survey なので、個別防御の実効性は別途 probe が必要な点。"
  verdict_pre: "採用。agent 導入時の security gate と memory/tool 権限設計の基礎資料として使う。"
---

## raw_excerpt
Large language model agents are moving from conversational interfaces to software components that plan, invoke tools, maintain memory, and act on external environments. The paper's abstract emphasizes that this changes the shape of security risk: failures are no longer limited to unsafe text generation. In agentic settings, untrusted content can redirect control flow, misuse tool privileges, corrupt persistent state, leak sensitive information, or trigger harmful external actions. The survey frames LLM-agent security as fragmented across attack families, defense layers, application domains, and evaluation settings, and positions threat surfaces, attacks, defenses, and evaluation as a connected map rather than isolated topics. For a workflow with persistent memory and file/tool access, the most relevant raw point is the explicit inclusion of memory corruption, tool privilege misuse, and external action triggering as first-class risks.

## why_relevant_to_games
ゲーム制作 agent がリポジトリ、Slack、記憶、ブラウザ、実行ツールをまたぐ時の事故面を洗い出す候補。playtest agent や制作補助の権限設計に効く。
