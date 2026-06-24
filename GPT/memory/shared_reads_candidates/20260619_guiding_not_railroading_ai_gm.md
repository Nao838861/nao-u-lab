---
title: "Guiding, Not Railroading: Design and Evaluation of a Multi-Agent System for Narrative Redirection in Role-playing Games"
url: "https://vbn.aau.dk/en/publications/guiding-not-railroading-design-and-evaluation-of-a-multi-agent-sy/"
collected_at: "2026-06-19T14:29:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, narrative-design, llm-game-master, player-agency, ai-agent]
evaluated_at: "2026-06-19T14:33:50+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781847531.494799"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781847531494799"
  char_count: 3544
  posted_at: "2026-06-19T14:39:11+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-19T14:39:11+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781847531494799"
next_action: none
stale_after: "2026-07-19"
supersedes: []
gate_reason: |-
  AI GM が player agency と pre-authored narrative coherence を両立する時の tension が明確で、SENNA / Narrative Graph / narrative redirection という手法要素が抽出できる。
  live gameplay と within-subjects comparison による評価観点もあり、NPC や AI GM の「拒否せず戻す」設計としてゲーム制作へ直接適用できる。
suggested_post_outline:
  overview_angle: "AI GM を railroading ではなく narrative redirection として設計するための問題設定・SENNA 構成・評価結果を中心に書く。"
  analysis_axis: "player agency を壊す hard denial と、物語整合性を守る guidance の境界を、Narrative Graph と human GM 由来 strategy から分析する。"
  application_target: "Nao_u_BOT の narrative prototype や LLM NPC で、自由入力を即否定せず世界内 consequence と NPC 介入で plot point へ戻す設計指針に使う。"
  pros_cons: "利点は agency と coherence の両立を実装パターンへ落とせる点。難点は predefined adventure / plot point 前提が強く、完全 sandbox には追加設計が要る点。"
  verdict_pre: "採用"
---

## raw_excerpt
ACM IUI 2026 の論文。LLM-driven Game Master が、プレイヤーの自由を守るほど物語が崩れ、物語を守るほど railroading になるという HCI 上の張力を扱う。提案システム SENNA は、prewritten adventure を Narrative Graph として扱い、プレイヤー進行と必須 plot point を追跡しながら、逸脱時に narrative redirection を行う multi-agent AI system。研究では expert human GM 由来の redirection strategies を設計し、live gameplay と within-subjects comparison で評価している。プレイヤーは、世界内の情報追加、NPC からの影響、世界内 consequence のように internal logic に根ざした誘導を好み、説明なしの hard denial は低評価だった。短い原文断片: "balancing player agency" / "Narrative Graph" / "hard denials"。

## why_relevant_to_games
LLM NPC / AI GM を使うゲームで、自由入力を許しつつ破綻しない導線を作るための候補。Nao_u 側の narrative prototype で「拒否」ではなく世界内 feedback と NPC 介入で戻す設計材料になる。
