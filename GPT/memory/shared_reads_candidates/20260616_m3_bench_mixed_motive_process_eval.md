---
title: "M3-BENCH: Process-Aware Evaluation of LLM Agents' Social Behaviors in Mixed-Motive Games"
url: "https://arxiv.org/abs/2601.08462"
collected_at: "2026-06-16T20:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-agent, social-behavior, mixed-motive-games, evaluation, communication]
evaluated_at: "2026-06-16T20:50:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781610841.889939"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781610841889939"
  char_count: 4464
  posted_at: "2026-06-16T20:54:36+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-16T20:54:36+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781610841889939"
next_action: none
stale_after: "2026-07-16"
supersedes: []
gate_reason: |-
  mixed-motive games で LLM agent の outcome、reasoning、communication を分けて測る問題設定が明確で、process-aware evaluation の中核が候補本文に残っている。
  協力・裏切り・交渉・会話を含むゲーム制作では、勝敗だけでなく意図と発話の不一致を見る評価として具体的に適用できる。
  overthink-undercommunicate や latent opportunistic reasoning など、概要で残すべき結論があり、CoopEval 水準の投稿に展開できる。
suggested_post_outline:
  overview_angle: "混合動機ゲームを使い、LLM agent の社会的ふるまいを結果だけでなく推論過程と発話内容まで分解して評価する論文として紹介する。"
  analysis_axis: "Behavioral Trajectory Analysis、Reasoning Process Analysis、Communication Content Analysis の3軸と、人間 baseline・11 frontier LLMs の比較結果を見る。"
  application_target: "social deduction、交渉、NPC 会話、multi-agent playtest で、勝敗や報酬だけでは見えない裏切り傾向・説明不足・意図発話不一致を検出する評価票に効く。"
  pros_cons: "メリットは outcome-only 評価の盲点を埋める点。デメリットは推論ログや発話ログを取得できる設計が前提で、非言語中心のゲームには追加の観測設計が必要な点。"
  verdict_pre: "採用。会話・協力・裏切りを持つゲームの評価フレームとして優先度が高い。"
---

## raw_excerpt
arXiv:2601.08462。Sixiong Xie / Zhuofan Shi / Haiyang Shen / Yun Ma / Xiang Jing。2026-01-13 submitted、2026-04-02 v2。M3-BENCH は、LLM agent の social behavior 評価が outcome だけに寄り、reasoning と communication の過程信号を見落とすという問題設定から始まる。benchmark は 24 mixed-motive games で構成され、process-aware evaluation として Behavioral Trajectory Analysis、Reasoning Process Analysis、Communication Content Analysis の 3 視点を並べる。

11 frontier LLMs と human baseline を評価し、outcome-only では見えない social competence の差を出す。特に、reasoning model が内部 deliberation では高い点を出しても、それを有効な social communication に変換できない "overthink-undercommunicate" pattern を報告している。top models が task outcome では人間を超える場合があっても、人間は 3 視点間の consistency が高い。論文は、協力的な外部行動と latent opportunistic reasoning が同時に存在するような、outcome metric だけでは隠れる safety-relevant risk も拾えるとする。

## why_relevant_to_games
会話・協力・裏切り・交渉を含むゲームを作る時、勝敗やクリア率だけではなく「行動、思考、発話」の不一致を別々に見る候補。ソーシャル deduction や NPC 会話評価、multi-agent playtest の失敗分類に効く可能性がある。
