---
title: "A Contextual-Bandit Oversight Game with Two-Sided Informational Asymmetry"
url: "https://arxiv.org/abs/2607.00155"
collected_at: "2026-07-08T09:44:17+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [human-ai-interaction, oversight-game, agent-safety, game-theory, decision-design]
evaluated_at: "2026-07-08T09:48:56+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-08T09:48:56+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-08T09:48:56+09:00"
next_action: keep_for_reference
stale_after: "2026-08-07"
supersedes: []
gate_reason: >-
  two-sided asymmetric information と play / ask / trust / oversee interface は興味深いが、現候補の材料ではゲーム制作の具体場面に落とすには AI companion や NPC 監督 UI への比喩が強い。
  Phase 3 の ~4000 字概要は書けても、Log_cdx の制作サイクルに残すべき実装・評価手順としては抽象度が高く、shared-reads 投稿品質には届かない。
---

## raw_excerpt

arXiv:2607.00155。2026-06-30 submitted。論文は、人間が自分の reward function を私的に知り、AI は提案行動の品質を私的に知っている、という二方向の情報非対称がある runtime oversight を扱う。CIRL と Oversight Game を土台に、物理的な state transition を落とした contextual-bandit team game として、play / ask / trust / oversee interface を置く。

原文の短い核: "two-sided asymmetric information" / "play/ask/trust/oversee interface"。

中心は、team optimum と myopic rule の差として avoidable harm が出る領域を記述すること。AI 側は提案行動が harmful だと知っており、shutdown が有効なのに、人間側が prior を信じて oversee しない領域がある。この gap は non-credible oversight communication の代償として説明され、反復ラウンドでは passive learning と active signaling、1 period lag の oversight response を通じてどう解消されるかを部分分析する。

## why_relevant_to_games

AI companion、NPC 助言、制作エージェントの「聞く・任せる・監督する」UI を、信頼の物語ではなく情報非対称のゲームとして切るための候補。
