---
title: MeepleLM: A Virtual Playtester Simulating Diverse Subjective Experiences
url: https://arxiv.org/html/2601.07251v2
collected_at: 2026-07-09T19:29:15+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, board-games, virtual-playtesting, player-persona, mda]
evaluated_at: 2026-07-09T19:32:52+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-07-09T19:32:52+09:00
last_decision: postponed
duplicate_reason: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260515_meeplelm_virtual_playtester.md; memory/shared_reads_candidates/20260620_meeplelm_virtual_playtester.md"
next_action: none
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  title canonical index で best_status: posted の terminal duplicate group に一致する。
  既投稿済みのため、本文評価を積み増さず postponed duplicate として閉じる。
---

## raw_excerpt
短い原文フレーズ: "creative co-designers" / "emergent user experience" / "Persona-Aligned Critiques"。

MeepleLM は、ボードゲームの rulebook からプレイヤー体験を推定し、複数の player archetype に沿った批評を返す virtual playtester を目指す研究。問題設定は、LLM がゲームをプレイする agent や共同設計者として使われる一方で、現行システムは emergent user experience に基づく建設的な批評が弱い、というもの。課題は、明示的なゲームエンジンなしでルールから潜在的な dynamics を推定することと、プレイヤー集団ごとの主観差をモデル化すること。

データとして 1,727 件の構造補正済み rulebook と 150K reviews を作り、品質スコアと facet-aware sampling で選別する。そこに MDA reasoning を足して、Mechanics から Dynamics、Aesthetics への因果ギャップを埋める。さらに player personas を蒸留し、persona-specific reasoning pattern を学習させて、プレイヤータイプ別の批評を出す。実験では商用モデルより community alignment と critique quality で高い評価を示し、user study で utility の preference rate も報告している。

## why_relevant_to_games
ゲーム案やルール文から「誰にどう刺さらないか」を早期に見る素材。Nao_u 作品の cross_review を、単一の良し悪しではなく persona 差分の批評へ広げる時の参照になる。
