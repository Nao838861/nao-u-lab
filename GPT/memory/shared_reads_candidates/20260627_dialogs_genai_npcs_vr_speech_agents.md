---
title: "Dialogs with GenAI NPCs: Exploring Player Interactions with Speech Agents in a VR Game"
url: "https://www.tandfonline.com/doi/full/10.1080/10447318.2026.2620647"
collected_at: "2026-06-27T05:59:57+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc, dialogue, vr, player-experience, genai]
evaluated_at: "2026-06-27T06:02:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1782508078.762339"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782508078762339"
  char_count: 3708
  posted_at: "2026-06-27T06:08:10+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-27T06:08:10+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782508078762339"
next_action: none
stale_after: "2026-07-27"
supersedes: []
gate_reason: >-
  speech-based VR game に GenAI NPC を入れたときの価値と破綻点が、自然会話の自由度・believability・unnatural flow・inconsistent responses・uninformative dialogue として分離されている。
  Office Whispers という具体ゲーム、4 体の NPC、VR adventure-puzzle という文脈があり、会話機能を gameplay rhythm / task support / scene coherence の評価軸へ落とせるため、~4000 字の概要に必要な骨格がある。
suggested_post_outline:
  overview_angle: "GenAI NPC は自由会話で没入感を上げる一方、テンポ・一貫性・情報価値を壊すと VR パズルの進行そのものを阻害する、という設計上の二面性を中心に書く。"
  analysis_axis: "NPC の believability だけでなく、会話フロー、誤答・不整合、無情報応答がプレイヤー体験と gameplay にどう効いたかを整理する。"
  application_target: "Nao_u_BOT の会話 NPC / 探索ゲームでは、自由入力を許す範囲、タスク支援の責任、シーン状態との整合チェック、会話テンポの上限を評価項目に入れる。"
  pros_cons: "メリットは会話の自然さと没入感の評価軸が得られること。デメリットは candidate 内では全文の詳細数値や実験手順が薄く、Phase 3 で原文確認しながら過剰一般化を避ける必要があること。"
  verdict_pre: "部分採用。GenAI NPC の採用可否ではなく、NPC 会話を gameplay support system として評価する観点を採る。"
---

## raw_excerpt
International Journal of Human-Computer Interaction 掲載の 2026 年論文。GenAI-based NPC を speech-based VR game に入れたとき、プレイヤーがどのように受け取り、どこで没入が崩れるかを探索している。対象ゲームは "Office Whispers" で、VR adventure-puzzle game の中に diverse human characteristics を持つ 4 体の GenAI NPC を置く。検索結果と研究機関ページの abstract では、プレイヤーは自然に話せる自由度と、NPC が believable に応答した時の没入感を評価した一方、unnatural conversational flow、incorrect or inconsistent responses、uninformative dialogue が immersion and gameplay を阻害したとされる。論文は GenAI NPC を「会話が自由になる」だけでなく、play rhythm、task support、scene coherence を保つ interaction system として扱う必要があることを示す素材になる。

## why_relevant_to_games
LLM NPC の評価を「会話の面白さ」だけでなく、VR/探索/パズルの進行を壊さない応答品質、会話テンポ、タスク支援の観点で見るための候補。
