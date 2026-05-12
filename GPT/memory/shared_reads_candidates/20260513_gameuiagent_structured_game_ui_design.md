---
title: "GameUIAgent: An LLM-Powered Framework for Automated Game UI Design with Structured Intermediate Representation"
url: https://arxiv.org/abs/2603.14724
collected_at: 2026-05-13T00:02:14+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ui, ai-agent, structured-representation, figma, visual-evaluation]
---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。GameUIAgent は、ゲーム UI デザインを自然言語から editable Figma designs に変換する agentic framework。中間表現として Design Spec JSON を置き、LLM generation、deterministic post-processing、VLM-guided Reflection Controller を含む 6 段階の neuro-symbolic pipeline を構成する。

評価は 110 test cases、3 LLM、3 UI templates で行われ、game-domain failure taxonomy として rarity-dependent degradation と visual emptiness を挙げている。さらに、品質改善が headroom によって制約される Quality Ceiling Effect と、partial rendering enhancements が VLM 評価を逆に悪化させる Rendering-Evaluation Fidelity Principle を報告する。ゲーム UI の rarity tier やテンプレートに対して、単なる画像生成ではなく、編集可能な構造と評価ループを持たせる研究として読める。

短い原文句: "Design Spec JSON" / "rarity-dependent degradation" / "visual emptiness"

## why_relevant_to_games
ゲームの UI/報酬表示/カード/アイテム枠などを AI で作る場合、見た目だけでなく構造化 spec と失敗分類を持つべきという材料になる。小規模プロトタイプの UI 評価にも使えそう。
