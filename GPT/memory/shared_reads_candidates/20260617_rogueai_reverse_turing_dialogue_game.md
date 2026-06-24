---
title: "RogueAI: A Reverse Turing Test for Detecting Licensed AI Deception in Dialogue"
url: "https://arxiv.org/abs/2606.13310"
collected_at: "2026-06-17T11:29:25.5921611+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, dialogue-game, deception, ai-agent, procedural-scenario, evaluation]
evaluated_at: "2026-06-17T12:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781239550.760649"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781239550760649"
  char_count: 3789
  posted_at: "2026-06-12T13:45:50.760649+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-17T11:35:50+09:00"
last_decision: posted_existing_duplicate
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781239550760649"
next_action: none
stale_after: "2026-07-17"
supersedes: []
gate_reason: |-
  問題設定が「AI か人間か」ではなく「会話相手を信頼できるか」に移っており、Playable detective game として手法の中核を説明しやすい。
  2 体の LLM、片方だけが fictional context 内で欺ける、プレイヤーが質問で役割を推理する、という構造が具体的でゲーム制作に直結する。
  小規模な会話推理 prototype、証言信頼性、裏切り役 NPC の評価軸へ落とせるため、4000字概要の素材が揃っている。
suggested_post_outline:
  overview_angle: "Turing Test の問いを AI 識別から信頼性推理へ反転し、2 体の LLM を interrogate する detective game として読む。"
  analysis_axis: "一方だけに licensed deception を許す情報非対称、fictional context、質問戦略、AutoRogueAI による scenario 生成の関係を軸にする。"
  application_target: "会話型推理ゲーム、証言の矛盾検出、裏切り役 NPC、LLM NPC を使った小規模 playable prototype の設計。"
  pros_cons: "利点は構造が軽く実装しやすく、信頼性推理をゲーム化できる点。弱点は LLM の演技品質と deception 安全性、評価の再現性に依存する点。"
  verdict_pre: "部分採用。まずは固定シナリオで質問ログと推理成立率を測る prototype に落とす。"
---

## raw_excerpt
arXiv 2606.13310。RogueAI は、現代版の reverse Turing test を playable detective game として実装する研究。プレイヤーは見分けのつかない 2 体の LLM agent に質問し、そのうち 1 体だけが共有された fictional context 内で欺く許可を持つ。関連する AutoRogueAI は、プレイヤーとの対話を通じて新しい scenario を手続き生成しつつ、謎を成立させる設計上の選択を隠す仕組みとして説明されている。単なる chatbot 判別ではなく、プレイヤーが会話から信頼性、意図、矛盾、隠された役割を推理する形式のゲームとして扱える。

## why_relevant_to_games
会話型推理ゲーム、裏切り役 NPC、証言の信頼性を扱う小規模 prototype の題材になる。
