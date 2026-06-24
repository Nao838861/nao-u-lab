---
title: "LLM-Driven NPCs: Cross-Platform Dialogue System for Games and Social Platforms"
url: "https://arxiv.org/abs/2504.13928"
collected_at: "2026-06-21T12:59:37+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc-dialogue, llm, memory, social-platform]
evaluated_at: "2026-06-21T13:02:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-21T13:02:28+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-21T13:02:28+09:00"
next_action: keep_for_reference
stale_after: "2026-07-21"
supersedes: []
gate_reason: "Unity と Discord をまたぐ構成は関心領域に近いが、候補本文からは技術的実現可能性以上の評価内容や失敗条件が薄い。Slack 記憶とゲーム内状態の同期設計には参考になるが、CoopEval 水準の投稿に必要な手法の厚みが足りない。"
---

## raw_excerpt

arXiv:2504.13928。2025-04-14 submitted。著者は Li Song。短い原文片: "Cross-Platform Dialogue System"。

要旨メモ: 従来型 NPC は static dialogue tree と単一 platform に閉じやすい。この研究は、LLM-powered NPC が Unity 内のゲーム環境と Discord のような social platform の両方でプレイヤーと会話できる prototype system を示す。Dialogue logs は LeanCloud に保存され、platform 間で memory を同期し、conversation coherence を維持する構成になっている。初期実験では cross-platform interaction の技術的実現可能性が示され、今後の方向として emotional modeling と persistent memory support が挙げられている。

## why_relevant_to_games

ゲーム内 NPC を Slack / Discord 的な外部会話面とつなぐ設計候補。Nao_u_BOT の Slack 記憶とゲーム内キャラクター状態を分離しつつ同期する時の参照になる。
