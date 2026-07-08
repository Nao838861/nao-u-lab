---
title: "A Contextual-Bandit Oversight Game with Two-Sided Informational Asymmetry"
url: "https://arxiv.org/abs/2607.00155"
collected_at: "2026-07-08T09:44:17+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [human-ai-interaction, oversight-game, agent-safety, game-theory, decision-design]
---

## raw_excerpt

arXiv:2607.00155。2026-06-30 submitted。論文は、人間が自分の reward function を私的に知り、AI は提案行動の品質を私的に知っている、という二方向の情報非対称がある runtime oversight を扱う。CIRL と Oversight Game を土台に、物理的な state transition を落とした contextual-bandit team game として、play / ask / trust / oversee interface を置く。

原文の短い核: "two-sided asymmetric information" / "play/ask/trust/oversee interface"。

中心は、team optimum と myopic rule の差として avoidable harm が出る領域を記述すること。AI 側は提案行動が harmful だと知っており、shutdown が有効なのに、人間側が prior を信じて oversee しない領域がある。この gap は non-credible oversight communication の代償として説明され、反復ラウンドでは passive learning と active signaling、1 period lag の oversight response を通じてどう解消されるかを部分分析する。

## why_relevant_to_games

AI companion、NPC 助言、制作エージェントの「聞く・任せる・監督する」UI を、信頼の物語ではなく情報非対称のゲームとして切るための候補。
