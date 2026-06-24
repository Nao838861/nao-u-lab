---
title: "CollabBench: Benchmarking and Unleashing Collaborative Ability of LLMs with Diverse Players via Proactive Engagement"
url: "https://arxiv.org/abs/2606.05793"
collected_at: "2026-06-22T02:59:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [cooperative-games, llm-agents, multi-agent, player-modeling, game-evaluation]
evaluated_at: "2026-06-22T03:02:40+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1782065325.308059"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782065325308059"
  char_count: 3619
  posted_at: "2026-06-22T03:08:53+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-22T03:08:53+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782065325308059"
next_action: none
stale_after: "2026-07-22"
supersedes: []
gate_reason: >-
  cooperative game environments で、相手の personality / behavior に適応する協調 agent を
  task efficiency と affective performance の両面で評価しており、ゲーム内 NPC / 協力 AI の
  失敗分類に直結する。概要に必要な問題設定、pipeline、training、評価結果が揃っている。
suggested_post_outline:
  overview_angle: "会話だけでなく、行動実行を伴う協力ゲーム環境で LLM agent の相手適応を測る benchmark として整理する。"
  analysis_axis: "Diverse Player Profile Simulation と Collaborative Agentic Training が、相手依存の協調失敗をどう評価・改善するか。"
  application_target: "Nao_u_BOT の協力 NPC / 共同作業 prototype で、役割分担、声かけ、相手依存の失敗を評価する軸。"
  pros_cons: "長所は affective adaptation を報酬に含める点。弱点は benchmark 依存で、実ゲームの楽しさや創発性までは直接測れない点。"
  verdict_pre: "部分採用。協力 NPC 評価軸として採用し、訓練手法は後段の probe 候補に留める。"
---

## raw_excerpt

arXiv:2606.05793。2026-06-04 submitted。CollabBench は、LLM agent の協調能力を会話だけでなく、grounded interaction と behavioral execution を伴う cooperative game environments で評価・訓練する benchmark として提示されている。検索結果の abstract では、既存の conversation-level collaboration study は実際の行動や環境への接地が弱く、現実的な human partner との協調を測りにくい、という問題設定になっている。

提案は二つの柱を持つ。一つは Diverse Player Profile Simulation pipeline で、異なる player behavior を持つ相手をモデル化すること。もう一つは Collaborative Agentic Training で、reasoning、communication、action を agentic rollouts として統合し、task efficiency と affective adaptation の hybrid reward で最適化すること。評価環境として CWAH-MultiPlayer と Cook-MultiPlayer を拡張し、diverse personalities のもとで測る。abstract では、trained models が base models より efficiency で 19.5%、affective performance で 24.4% 改善したとされる。

## why_relevant_to_games

協力ゲームで「タスクを早く終える」だけでなく、相手の性格・行動癖への適応を評価軸に入れる候補。Nao_u_BOT の協力 NPC / 共同作業 prototype で、役割分担、声かけ、相手依存の失敗を分けて見る材料になる。
