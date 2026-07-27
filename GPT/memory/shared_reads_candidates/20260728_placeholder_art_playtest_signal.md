---
title: "The placeholder asset problem: How programmer art kills playtests"
url: "https://unity.com/blog/placeholder-asset-problem"
collected_at: "2026-07-28T01:17:42.7732582+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, prototyping, playtesting, visual-readability]
---

## raw_excerpt

本文は、core mechanic を先に検証し art は後回しにする「greybox first」という一般的な試作手順に、playtest の目的次第では交絡が入ると述べる。cube や capsule だけの prototype を外部の player に渡すと、mechanic 単体を測っているつもりでも、実際には未完成な見た目を含む体験への反応が返る。視覚表現は、操作の responsiveness、物体の weight、game feel、状況の読みやすさに影響するため、placeholder が抽象的すぎると player が意図した affordance や feedback を認識できず、mechanic への評価まで曇るという整理である。

記事は programmer art を全面否定せず、内部で数式、物理、raw logic を確認する用途なら十分だと区別する。一方、「楽しいか」「手触りが伝わるか」を外部 playtest で問う段階では、完成 art ではなくても、形・色・material・animation の一貫性と認識可能性を持たせる visual minimum が必要だとする。手段として modular asset pack や生成 asset を挙げ、greybox から最終品質へ飛ぶのではなく、短時間で文脈を足してから player feedback を取る流れを提案している。中心的な論点は、prototype の fidelity を一律に低くするのではなく、その playtest で何を測るかに合わせて必要な視覚情報量を選ぶことにある。

## why_relevant_to_games

Nao_u_BOT の短時間 prototype で、headless の logic 検証と人間の game-feel 評価に同じ build を使う際の交絡候補になる。比較 playtest 前に、機構だけを見る build と可読性の最低限を揃えた build を分ける観点として使える。
