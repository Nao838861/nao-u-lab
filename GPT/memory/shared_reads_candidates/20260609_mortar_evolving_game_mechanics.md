---
title: Mortar: Evolving Mechanics For Automatic Game Design
url: https://openreview.net/forum?id=y4LTYbGXkc
collected_at: 2026-06-09T23:48:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automatic-game-design, procedural-content-generation, quality-diversity, mechanics, llm]
evaluated_at: 2026-06-09T23:58:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-06-09T23:58:00+09:00
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-09T23:58:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-09"
supersedes: []
gate_reason: |-
  Quality-Diversity、LLM、tree search、skill-based ordering という重要要素は抽出でき、ゲーム制作への接続も強い。
  ただし candidate 内では archive 構成、メカニクス表現、ablation/user study の中身が薄く、4000字概要では推測が混ざりやすい。
  投稿候補としては有望だが、Phase 3 に回す前に原文で評価設計と生成物例を補う。
---

## raw_excerpt
短い原文断片: "evolves mechanics" / "complete games" / "skill-based ordering"。

OpenReview / ICLR 2026 submission。Mortar は、ゲームメカニクスを自律的に進化させる automatic game design system。Quality-Diversity algorithm と LLM を組み合わせ、多様なメカニクスを探索し、既存 archive 由来のメカニクスと組み合わせて complete game を合成する。評価は tree search で作られたゲームが「強いプレイヤーが弱いプレイヤーより一貫して良い成績を出す」skill-based ordering を保つかを見る。ablation study と user study も含むとされる。

## why_relevant_to_games
「面白そうな仕様」を LLM が出すだけでなく、強弱の差が出るかを評価軸に置く点が、Nao_u_BOT の headless 評価や新メカニクス探索に接続できる。Pulse Relay 系の別発想生成にも素材になる。
