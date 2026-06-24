---
title: "ARES: A Platform for Adaptive Role-Based Evaluation of Social Engineering Risks in Human--AI Games"
url: "https://arxiv.org/abs/2606.17793"
collected_at: "2026-06-21T08:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [human-ai-games, social-engineering, evaluation, multimodal, llm-agents]
evaluated_at: "2026-06-21T09:02:37+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1782000627.414479"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782000627414479"
  char_count: 3957
  posted_at: "2026-06-21T09:11:11+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-21T09:11:11+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782000627414479"
next_action: none
stale_after: "2026-07-21"
supersedes: []
gate_reason: |-
  controlled social games で human-human / human-AI / AI-AI を同じ枠に置き、interaction tree と multimodal trace を同期する評価設計が具体的。
  交渉・信頼・欺瞞を含むゲームで「面白いが危なくない AI 相手」を測る方法として、Nao_u_BOT の制作サイクルへ直接落とし込める。
suggested_post_outline:
  overview_angle: "ARES を、LLM 相手役の社会的リスクをゲーム形式で観測する評価基盤として紹介する。"
  analysis_axis: "role-conditioned agents、participant profiling、interaction trees、multimodal telemetry が評価の再現性をどう作るか。"
  application_target: "会話型・交渉型ゲームの AI 相手役評価、プレイログ設計、主観評価と行動ログの同期。"
  pros_cons: "長所は評価単位が具体的で trace が厚いこと。弱点は pilot 規模が小さく、計測コストが高いこと。"
  verdict_pre: "部分採用。まずは軽量な interaction tree と主観評価の同期だけを自作プロトタイプへ移す。"
---

## raw_excerpt

arXiv 検索結果から取得。2026-06-16 投稿、ICCST 2026 accepted。ARES は、LLM-mediated social decision-making を controlled social games で監査するための platform と pilot dataset。human-human、human-AI、AI-AI の設定を扱い、configurable game templates、role-conditioned LLM agents、psychology-informed participant profiling、structured interaction trees、行動・生体データの同期取得と特徴抽出を組み合わせる。

pilot dataset は 15 participants が role-conditioned GPT-5.4 agent と、adapted Prisoner's Dilemma と Ultimatum Game の 2 連結ゲームで相互作用したもの。raw / processed multimodal data は 340 GB、streams は interaction logs、video、screen recordings、gaze logs、smartwatch signals、game/questionnaire metadata。interaction path、written justification、psychological profile、subjective feedback、counterpart identity の知覚、game outcome、facial / gaze / behavioral features を含む。

## why_relevant_to_games

human-AI social game を、会話ログだけでなく行動経路・視線・生体・主観評価まで含めて評価する候補。欺瞞、交渉、協力、信頼を持つゲームで、AI 相手の「面白い/危ない」をどの trace で見るかの材料になる。
