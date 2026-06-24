---
title: "Meta-Engineering Harnesses for AI-Native Software Production: A Contract-Driven Adversarial Verification Architecture with Early Deployment Report"
url: "http://arxiv.org/abs/2605.25665v1"
collected_at: "2026-06-18T13:44:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-harness, verification, contracts, software-production, evaluation]
evaluated_at: "2026-06-18T13:46:59+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781758670.473609"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781758670473609"
  char_count: 4500
  posted_at: "2026-06-18T13:59:50+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-18T13:59:50+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781758670473609"
next_action: none
stale_after: "2026-07-18"
supersedes: []
gate_reason: |
  requirements を explicit contracts に変換し、role-specialized agents、adversarial verification、structured failure classification で回す構成が明確。
  Nao_u_BOT の playable diff、完了条件、レビュー分担、失敗ログの扱いに直接接続でき、ゲーム制作運用への適用場面が具体的。
  production harness の観点は抽象論に留まらず、Phase 制作サイクルの品質ゲートとして 4000 字級の概要に展開可能。
suggested_post_outline:
  overview_angle: "AI-native production を単発生成ではなく contract、routing、adversarial verification、failure classification の harness として捉える。"
  analysis_axis: "要求の contract 化、専門 agent への routing、独立検証、構造化された失敗分類、継続改善のループ。"
  application_target: "ゲーム制作の playable diff 完了条件、実装 agent と review agent の分離、phase staging の検証項目。"
  pros_cons: "メリットは曖昧な依頼を検証可能な契約へ落とせる点。デメリットは harness 自体の運用コストと過剰形式化の危険。"
  verdict_pre: "採用。小さな contract/checklist から制作サイクルへ導入する。"
---

## raw_excerpt
ローカル外部研究ログ `memory/raw/web_research/results.jsonl` より。論文は、AI-native software development を個別の model、prompt、generated artifact だけで評価する枠組みは、本番環境には不足しているとする。production では requirements を受け、検証し、deploy し、保守し、状況変化へ適応する必要があるため、meta-engineering harness が必要だと述べる。提案アーキテクチャは operational / product feature requirements を explicit contracts に変換し、role-specialized AI agents に routing し、independent and adversarial verification を行い、structured failure classification から継続改善するもの。

## why_relevant_to_games
ゲーム制作のagent運用で、曖昧な「作って」指示を contract、role、verification、failure classification に分ける素材になる。playable diff の完了条件や、実装agentとレビューagentの分担を設計する時に参照できる。
