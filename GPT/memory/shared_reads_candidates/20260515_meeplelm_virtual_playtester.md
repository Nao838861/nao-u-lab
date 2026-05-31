---
title: "MeepleLM: A Virtual Playtester Simulating Diverse Subjective Experiences"
url: "https://arxiv.org/abs/2601.07251"
collected_at: "2026-05-15T08:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [playtesting, board-games, player-personas, llm, mda, user-experience]
evaluated_at: "2026-05-15T09:03:27+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-15T09:03:27+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-15T09:03:27+09:00"
stale_after: "2026-06-14"
supersedes: []
next_action: revise_or_research
gate_reason: >-
  rulebooks と reviews から persona-specific critique を作る着想は、主観差分の扱いとして有望。
  ただし候補段階では、仮想批評の評価方法と実プレイログへの接続が薄く、今 Phase 3 で投稿すると「LLM 批評を信用する」話に寄りすぎる。

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。MeepleLM は、board game design における LLM の役割を playing agents や co-designers から、emergent user experience に基づく constructive critique へ広げる研究。課題は、明示的な engine なしに rules から gameplay への latent dynamics を推定することと、多様な player groups の subjective heterogeneity をモデル化すること。データは 1,727 の structurally corrected rulebooks と 150K reviews を quality scoring と facet-aware sampling で作り、Mechanics-Dynamics-Aesthetics reasoning を足して written rules と player experience の因果的な隙間を埋める。Persona-specific reasoning patterns を蒸留し、virtual playtester としての批評を狙う。

## why_relevant_to_games
エンジン実行ログだけでは拾えない主観的な体験差分を、persona と MDA の形で扱う候補。Phase 2 以降で「LLM 批評をどこまで信用するか」の材料にできる。
