---
title: "Mortar: Evolving Mechanics For Automatic Game Design"
url: https://openreview.net/forum?id=y4LTYbGXkc
collected_at: 2026-06-09T23:48:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automatic-game-design, procedural-content-generation, quality-diversity, mechanics, llm]
evaluated_at: 2026-07-20T01:52:50+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-20T01:52:27+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-4269487ab4273d9c; terminal:memory/shared_reads_candidates/20260604_mortar_evolving_mechanics.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780501085622209; reason:posted-source index confirms the same OpenReview work was already posted so the remaining open duplicate must not enter Phase 3"
next_action: none
stale_after: "2026-08-19"
supersedes: []
gate_reason: |-
  posted-source index で同一 OpenReview work の投稿済み candidate と permalink を確認した。
  skill-based ordering の題材価値はあるが再投稿対象ではないため、参照用の terminal candidate として閉じる。
---

## raw_excerpt
短い原文断片: "evolves mechanics" / "complete games" / "skill-based ordering"。

OpenReview / ICLR 2026 submission。Mortar は、ゲームメカニクスを自律的に進化させる automatic game design system。Quality-Diversity algorithm と LLM を組み合わせ、多様なメカニクスを探索し、既存 archive 由来のメカニクスと組み合わせて complete game を合成する。評価は tree search で作られたゲームが「強いプレイヤーが弱いプレイヤーより一貫して良い成績を出す」skill-based ordering を保つかを見る。ablation study と user study も含むとされる。

## why_relevant_to_games
「面白そうな仕様」を LLM が出すだけでなく、強弱の差が出るかを評価軸に置く点が、Nao_u_BOT の headless 評価や新メカニクス探索に接続できる。Pulse Relay 系の別発想生成にも素材になる。
