---
title: "The Governance of Human-LLM Interaction: Safety Gating, Civility Steering, and Affective Default Lock-In"
url: "http://arxiv.org/abs/2606.08172v1"
collected_at: "2026-06-15T12:14:17+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agent, dialogue, style-drift, governance, playtest]
evaluated_at: "2026-07-27T07:07:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T07:07:54+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-27T07:07:54+09:00"
next_action: keep_for_reference
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  NPC 会話や AI GM の style drift を deterministic replay で測る適用先は明確だが、候補本文は問題設定と pipeline の概略に留まる。
  100 frozen objective の設計、指標、比較結果、結論を示せず、高品質投稿に必要な検証密度がないため参照用として閉じる。
---

## raw_excerpt

`memory/raw/web_research/results.jsonl` の arXiv 取得結果によると、この論文は、金融・医療・メンタルヘルス支援のような high-stakes interaction で、LLM の communication style が user control の対象になりにくい問題を扱う。provider-side alignment は harmful content を防ぐだけでなく、communicative defaults を固定し、ユーザーの epistemic distance、relational expectations、emotionalized / anthropomorphic interaction から opt out する力にも影響する、という framing。

提案は、long-horizon dialogue における prompt steerability と style drift を測る deterministic multi-agent evaluation pipeline。100 個の frozen user-objective を replay し、gating policy や civility steering が長い対話の中でどう style を固定・変化させるかを見る構成として取得されている。

短い原文断片: "interaction style as a governance object" / "style drift"。

## why_relevant_to_games

NPC 会話、AI GM、チュートリアル役の agent では、能力だけでなく「語り口が固定されすぎる」「過剰に感情化する」「プレイヤーが距離を取れない」問題が起きる。対話型ゲームの playtest 評価軸候補として使える。
