---
title: "Adapting Procedural Content Generation to Player Personas Through Evolution"
url: "https://arxiv.org/abs/2112.04406"
collected_at: "2026-05-18T11:59:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, procedural-generation, player-modeling, evaluation]
evaluated_at: "2026-05-18T12:06:49+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-18T12:06:49+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-18T12:06:49+09:00"
stale_after: "2026-06-17"
supersedes: []
next_action: revise_or_research
gate_reason: >-
  persona agents と experience metrics による PCG 評価枠は、headless 評価や難易度調整へ接続できるため題材は強い。
  ただし現候補は abstract レベルで、4 personas / 3 metrics / evolutionary architecture の実験内容を十分に掘れておらず、Phase 3 投稿前に本文精読が必要。

---

## raw_excerpt
arXiv:2112.04406。Pedro M. Fernandes, Jonathan Jørgensen, Niels N. T. G. Poldervaart による、player persona に合わせて Procedural Content Generation を適応させる研究。abstract では、game content をプレイヤーに自動適応することが game development に新しい可能性を開くとして、persona agents と experience metrics を使い、特定の persona に合わせた level を evolutionary に生成する architecture を提案している。

実験対象は "Grave Rave"。4種類の rule-based persona agents と3種類の experience metrics を使い、生成 level が各 persona に適応できることを示したとしている。重要なのは、単に metric を最大化した一般的な良い level ではなく、persona-conscious な level になったと説明されている点。つまり「難易度が良い」「報酬量が良い」だけでなく、想定される遊び方や嗜好の違いへ生成物を寄せる評価枠を持っている。

## why_relevant_to_games
自動プレイ/評価を単一AIの平均挙動ではなく、複数のプレイヤー型に分けて見る材料。headless 評価や難易度調整の候補軸になる。
