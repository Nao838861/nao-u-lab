---
title: "The Double-Edged Sword of Open-Ended Interaction: How LLM-Driven NPCs Affect Players' Cognitive Load and Gaming Experience"
url: https://arxiv.org/abs/2604.10107
collected_at: 2026-05-25T11:41:36+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm-npc, player-experience, cognitive-load, usability]
evaluated_at: 2026-05-25T11:45:31+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-25T11:53:05+09:00"
last_decision: postpone
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778826411891459"
stale_after: "2026-06-24"
supersedes: []
phase3_skip:
  reason: "duplicate_url_already_posted"
  evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778826411891459"
  skipped_at: "2026-05-25T11:53:05+09:00"
next_action: revise_or_research
gate_reason: |-
  LLM-NPC の自由会話を、認知負荷・使いやすさ・信頼・自律感に分けて測った N=130 の比較実験で、手法と結論の重要要素を抽出できる。
  「自由度を上げれば体験が良くなる」という短絡を避け、NPC 導入場面ごとの負荷設計と評価項目へ直接適用できる。
suggested_post_outline:
  overview_angle: LLM-NPC の価値を「会話の自由度」ではなく、認知負荷・不確実性・信頼のトレードオフとして整理する。
  analysis_axis: expressive effort / response uncertainty が cognitive load を媒介し、autonomy は増えるが usability/trust が落ちるという分解。
  application_target: 生成 NPC を入れる場面の選別、会話 UI の制約設計、playtest 指標を「楽しいか」だけでなく負荷・信頼に分ける運用。
  pros_cons: 自由会話の利点を残せる一方、場面別設計なしではプレイヤーに作業を押し付けるリスクが高い。
  verdict_pre: 部分採用。LLM-NPC を入れるなら、open-ended module ほど補助線と期待値制御を厚くする評価軸として採用する。

---

## raw_excerpt
arXiv 2026-04-11 投稿。LLM 駆動 NPC と従来の事前スクリプト NPC を、自作ゲームプロトタイプ "Campus Culture Week" の複数モジュールで比較したランダム化実験。対象は N=130。短い原文抜粋: "LLM-NPCs significantly increased players' cognitive load"。要点メモとして、LLM-NPC はプレイヤーの認知負荷を有意に増やし、その増加は expressive effort や response uncertainty に媒介された。一方、総合的なゲーム体験の改善は統計的に有意ではなく、 perceived autonomy にはプラス、system usability と trust にはマイナスの影響が出た。さらに、content creation や relationship building のような open-ended module ほど認知負荷の増加が強く、効果は scenario-sensitive / user-sensitive design の必要性としてまとめられている。

## why_relevant_to_games
LLM-NPC を「自由会話でリッチにする」だけでは体験改善にならず、場面ごとの負荷・信頼・使いやすさを分けて設計/評価する材料になる。
