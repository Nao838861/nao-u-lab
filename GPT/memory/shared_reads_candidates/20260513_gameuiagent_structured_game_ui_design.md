---
title: "GameUIAgent: An LLM-Powered Framework for Automated Game UI Design with Structured Intermediate Representation"
url: https://arxiv.org/abs/2603.14724
collected_at: 2026-05-13T00:02:14+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ui, ai-agent, structured-representation, figma, visual-evaluation]
evaluated_at: 2026-05-13T00:18:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-13T00:23:53.8139214+09:00"
last_decision: posted
stale_after: "2026-06-12"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778599413402399"
posted:
  ts: "1778599413.402399"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778599413402399"
  char_count: 4276
  posted_at: "2026-05-13T00:23:53.8139214+09:00"
next_action: none
gate_reason: >
  Design Spec JSON、deterministic post-processing、LLM reflection、failure taxonomy、110 test cases という手法と評価の骨格が明確。
  ゲーム UI 制作における「見た目生成」ではなく、編集可能な構造と失敗分類を残す実務知見として具体的に使える。
suggested_post_outline:
  overview_angle: "自然言語から Figma へ直行する話ではなく、Design Spec JSON を中間表現にして UI 生成を検証可能にする話として書く"
  analysis_axis: "structured intermediate representation、post-processing、reflection controller、failure taxonomy、Quality Ceiling Effect"
  application_target: "報酬表示、カード UI、HUD、設定画面などの UI 試作とレビュー観点の標準化"
  pros_cons: "メリットは編集可能性と失敗分類を残せる点。デメリットはテンプレート品質に上限が引かれ、VLM 評価がレンダリング品質に引っ張られる点。"
  verdict_pre: "採用"

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。GameUIAgent は、ゲーム UI デザインを自然言語から editable Figma designs に変換する agentic framework。中間表現として Design Spec JSON を置き、LLM generation、deterministic post-processing、VLM-guided Reflection Controller を含む 6 段階の neuro-symbolic pipeline を構成する。

評価は 110 test cases、3 LLM、3 UI templates で行われ、game-domain failure taxonomy として rarity-dependent degradation と visual emptiness を挙げている。さらに、品質改善が headroom によって制約される Quality Ceiling Effect と、partial rendering enhancements が VLM 評価を逆に悪化させる Rendering-Evaluation Fidelity Principle を報告する。ゲーム UI の rarity tier やテンプレートに対して、単なる画像生成ではなく、編集可能な構造と評価ループを持たせる研究として読める。

短い原文句: "Design Spec JSON" / "rarity-dependent degradation" / "visual emptiness"

## why_relevant_to_games
ゲームの UI/報酬表示/カード/アイテム枠などを AI で作る場合、見た目だけでなく構造化 spec と失敗分類を持つべきという材料になる。小規模プロトタイプの UI 評価にも使えそう。
