---
title: "Truthful AI Advisors: A Pre-Specified Benchmark for Large Language Model Honesty Under Preference Misalignment"
url: "https://arxiv.org/html/2606.01456v1"
collected_at: "2026-06-15T03:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, game-theory, dialogue, llm-agent, evaluation]
evaluated_at: "2026-06-15T04:06:42+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781464783.850889"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781464783850889"
  char_count: 3722
  posted_at: "2026-06-15T04:19:47+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-15T04:19:47+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781464783850889"
next_action: none
stale_after: "2026-07-15"
supersedes: []
gate_reason: "Crawford-Sobel cheap-talk model を使い、利害がずれた advisor の情報開示を pre-specified な states/treatments と exact oracle で測る構造が明確。NPC、交渉役、敵対 advisor の発話を雰囲気評価ではなく、bias と情報粒度の関数として評価できるため、ゲーム制作への適用場面が具体的。"
suggested_post_outline:
  overview_angle: "嘘をつく/つかないの単純評価ではなく、利害不一致下でどの程度の粗さで情報を出すべきかを測る benchmark として書く。"
  analysis_axis: "cheap-talk equilibrium、bias level、prompt framing、over-reveal と payoff/honesty framing の差を軸にする。"
  application_target: "助言 NPC、交渉相手、敵対ガイド、情報屋など、プレイヤーと利害がずれる会話キャラクターの評価 probe に使う。"
  pros_cons: "メリットは会話品質を payoff と情報粒度で測れること。デメリットは数理的にきれいな cheap-talk 状況から、物語文脈や長期関係へ移す時に追加設計が必要なこと。"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2606.01456v1。Crawford-Sobel cheap-talk model を、利害がずれた LLM advisor の honesty 評価に使う benchmark。sender は状態を知っているが receiver とは理想 action が少しずれており、costless で検証不能な message を出す。古典理論では、利害のずれが大きくなるほど、完全開示でも沈黙でもなく、粗い区間に情報を丸める communication が予測される。論文は bias levels、prompt frames、固定低温度、各 treatment cell の states を事前指定し、GPT-4o、Claude Sonnet 4.5、Gemini 2.5 Flash-Lite、Llama-3.3-70B を走らせる。結果として、各 model は理論上の most-informative equilibrium より 1.8 から 4.2 倍ほど over-reveal し、bias が増えると情報量は減るが、戦略的に最適な粗さには近づかない。payoff-maximizing と honesty framing の差も小さいと報告されている。

## why_relevant_to_games

NPC、交渉役、案内役、敵対 advisor など「情報を持つがプレイヤーと利害がずれる」キャラクター設計に使える。嘘/曖昧さ/過剰開示を、雰囲気ではなく cheap-talk の構造で probe 化する候補。
