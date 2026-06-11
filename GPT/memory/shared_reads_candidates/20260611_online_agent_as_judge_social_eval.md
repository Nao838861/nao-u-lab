---
title: "Online Agent-as-a-Judge: Situation-Generating Evaluation for Interactive Agents"
url: "https://arxiv.org/abs/2606.08200"
collected_at: "2026-06-11T16:14:28.9042554+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc, social-simulation, agent-evaluation, playtest, llm-as-judge]
evaluated_at: "2026-06-11T16:27:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-11T16:27:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-11T16:27:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-11"
supersedes: []
gate_reason: |-
  受動ログ採点では criterion-relevant situation が発生しないという問題設定が明確で、judge agent が環境内で状況を生成するという手法の中核も候補本文から抽出できる。
  five-character family scenario、role consistency、memory continuity、coordination、emotional support、conflict handling、coverage と human-label agreement の比較まで評価材料が揃っている。
  NPC 会話や社会シムのプレイテスト script を「失敗を誘発する agent」として設計する具体場面に接続でき、4000字投稿に耐える。
suggested_post_outline:
  overview_angle: "LLM-as-a-Judge を採点者ではなく、評価したい状況をゲーム内で発生させる judge NPC として読む。"
  analysis_axis: "offline judge との違い、criterion coverage、human-label agreement、自然発生しにくい conflict / support 状況での効果を軸に整理する。"
  application_target: "Nao_u_BOT の NPC 会話、社会シム、チュートリアル対話、協力/衝突イベントのプレイテストで、ログ待ちではなく失敗条件を能動的に誘発する評価 script を作る。"
  pros_cons: "利点は希少状況の coverage と評価基準への直結。弱点は judge agent が不自然な誘導を起こすリスク、designer-authored criteria の質に評価が依存する点。"
  verdict_pre: "採用。NPC 評価では受動ログ採点より、状況生成 agent を小さく導入する価値が高い。"
---

## raw_excerpt

短い原文断片: "situation-generating evaluation framework"

arXiv 2606.08200。Online Agent-as-a-Judge は、interactive social agents を受動的なログ採点だけで評価すると、衝突対応や感情的サポートのような criterion-relevant situation がそもそも発生せず、能力が見えないという問題から出発する。提案手法では judge agent を target agent と同じ環境内に置き、native dialogue / action protocol を通じて相互作用させ、評価基準に必要な状況を能動的に引き出す。

実験は life-simulation environment の five-character family scenario で、role consistency、memory continuity、coordination、emotional support、conflict handling など designer-authored criteria を使う。Online judge は offline LLM-as-a-Judge や offline Agent-as-a-Judge と比べて、criterion coverage と human-label agreement を上げたと報告されている。特に自然発生しにくい conflict handling と emotional/social support で改善が大きい。

## why_relevant_to_games

NPC 会話、社会シム、チュートリアル内対話の評価で、ログを眺めるだけでは出ない失敗を judge NPC が誘発する設計に使える。プレイテスト script を「状況生成 agent」として組む発想の候補。
